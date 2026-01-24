"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  WorkflowStepper,
  IntakeForm,
  GuardrailBanner,
  GuardrailSuccessBanner,
  ReviewScreen,
  AskAscenta,
} from "@/components/workflows";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type {
  WorkflowDetail,
  WorkflowRunState,
  WorkflowInputs,
  GuardrailEvaluationResult,
  GuidedActionDefinition,
  GeneratedArtifact,
} from "@/lib/workflows/types";

export default function WorkflowExecutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow run state
  const [runId, setRunId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<WorkflowInputs>({});
  const [currentStep, setCurrentStep] = useState<WorkflowRunState["status"]>("intake");
  const [guardrailResults, setGuardrailResults] = useState<GuardrailEvaluationResult | null>(null);
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [artifact, setArtifact] = useState<GeneratedArtifact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | undefined>();
  const [completedActionIds, setCompletedActionIds] = useState<string[]>([]);

  // Load workflow definition
  useEffect(() => {
    async function loadWorkflow() {
      try {
        const res = await fetch(`/api/workflows/${resolvedParams.slug}`);
        if (!res.ok) {
          throw new Error("Workflow not found");
        }
        const data = await res.json();
        setWorkflow(data.workflow);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadWorkflow();
  }, [resolvedParams.slug]);

  // Start workflow run when workflow is loaded
  useEffect(() => {
    async function startRun() {
      if (!workflow || runId) return;

      try {
        const res = await fetch(`/api/workflows/${workflow.slug}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "anonymous" }),
        });
        const data = await res.json();
        if (data.run) {
          setRunId(data.run.id);
        }
      } catch (err) {
        console.error("Failed to start workflow run:", err);
      }
    }

    startRun();
  }, [workflow, runId]);

  // Handle intake form submission
  const handleIntakeSubmit = async (formInputs: WorkflowInputs) => {
    if (!runId) return;

    setIsSubmitting(true);
    setInputs(formInputs);

    try {
      const res = await fetch(`/api/workflows/runs/${runId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "anonymous",
          inputs: formInputs,
          rationales,
        }),
      });

      const data = await res.json();
      setGuardrailResults(data.guardrailResults);

      if (data.canProceed) {
        // Generate artifact
        setCurrentStep("generating");
        
        const genRes = await fetch(`/api/workflows/runs/${runId}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "anonymous" }),
        });

        const genData = await genRes.json();
        if (genData.artifact) {
          setArtifact(genData.artifact);
          setCurrentStep("review");
        }
      }
    } catch (err) {
      console.error("Failed to submit intake:", err);
      setError("Failed to process workflow. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle rationale changes
  const handleRationaleChange = (guardrailId: string, rationale: string) => {
    setRationales((prev) => ({
      ...prev,
      [guardrailId]: rationale,
    }));
  };

  // Handle guided action selection
  const handleActionSelect = async (action: GuidedActionDefinition) => {
    setExecutingActionId(action.id);

    // Simulate action execution (in real app, would call API)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCompletedActionIds((prev) => [...prev, action.id]);
    setExecutingActionId(undefined);
  };

  // Handle export
  const handleExport = async (
    format: "pdf" | "docx",
    confirmations: {
      accuracyReviewed: boolean;
      noPHI: boolean;
      policyReferencesCorrect: boolean;
    }
  ) => {
    if (!runId) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/workflows/runs/${runId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "anonymous",
          format,
          confirmations,
        }),
      });

      const data = await res.json();

      if (data.exportUrl) {
        setCurrentStep("completed");
        // In real app, would trigger download
        alert(`Document exported successfully! URL: ${data.exportUrl}`);
      }
    } catch (err) {
      console.error("Failed to export:", err);
      setError("Failed to export document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-glacier">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-summit" />
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-glacier">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">{error || "Workflow not found"}</p>
            <Link href="/workflows">
              <Button variant="outline">
                <ArrowLeft className="mr-2 size-4" />
                Back to Workflows
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-glacier">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workflows">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-display text-lg font-semibold text-deep-blue">
                  {workflow.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {workflow.description}
                </p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-4">
            <WorkflowStepper currentStep={currentStep} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Intake Step */}
        {currentStep === "intake" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="py-6">
                  {guardrailResults && !guardrailResults.allPassed && (
                    <div className="mb-6">
                      <GuardrailBanner
                        results={guardrailResults}
                        rationales={rationales}
                        onRationaleChange={handleRationaleChange}
                      />
                    </div>
                  )}

                  <IntakeForm
                    fields={workflow.intakeFields}
                    initialValues={inputs}
                    onSubmit={handleIntakeSubmit}
                    isSubmitting={isSubmitting}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Ask Ascenta */}
            <div className="lg:col-span-1">
              <AskAscenta
                actions={workflow.guidedActions}
                inputs={inputs}
                onActionSelect={handleActionSelect}
                executingActionId={executingActionId}
                completedActionIds={completedActionIds}
              />
            </div>
          </div>
        )}

        {/* Generating Step */}
        {currentStep === "generating" && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-12 animate-spin text-summit mb-4" />
            <h2 className="font-display text-xl font-semibold text-deep-blue">
              Generating Document
            </h2>
            <p className="text-muted-foreground mt-2">
              Ascenta is preparing your document...
            </p>
          </div>
        )}

        {/* Review Step */}
        {currentStep === "review" && artifact && (
          <ReviewScreen
            inputs={inputs}
            intakeFields={workflow.intakeFields}
            artifact={artifact}
            template={workflow.artifactTemplates[0]}
            onExport={handleExport}
            isExporting={isSubmitting}
          />
        )}

        {/* Completed Step */}
        {currentStep === "completed" && (
          <div className="flex flex-col items-center justify-center py-20">
            <CheckCircle2 className="size-16 text-green-600 mb-4" />
            <h2 className="font-display text-2xl font-semibold text-deep-blue">
              Workflow Complete
            </h2>
            <p className="text-muted-foreground mt-2 text-center max-w-md">
              Your document has been generated and exported. A complete audit trail
              has been recorded for this workflow.
            </p>
            <div className="flex gap-4 mt-8">
              <Link href="/workflows">
                <Button variant="outline">
                  Back to Workflows
                </Button>
              </Link>
              <Button
                className="bg-summit hover:bg-summit-hover"
                onClick={() => {
                  setRunId(null);
                  setInputs({});
                  setCurrentStep("intake");
                  setGuardrailResults(null);
                  setRationales({});
                  setArtifact(null);
                }}
              >
                Start New Run
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
