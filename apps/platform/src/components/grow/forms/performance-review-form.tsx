"use client";

import { useState, useCallback } from "react";
import { Button } from "@ascenta/ui/button";
import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import {
  REVIEW_STEP_LABELS,
} from "@ascenta/db/performance-review-constants";
import { cn } from "@ascenta/ui";
import { Target, FileText, CheckCircle, Lightbulb, ChevronRight, Download } from "lucide-react";

interface GoalRecommendation {
  title: string;
  description: string;
  category: string;
  alignment: string;
  rationale: string;
}

interface AlignedGoal {
  goalId: string;
  title: string;
  category: string;
  status: string;
  alignment: string;
  successMetric: string;
}

interface PerformanceReviewFormProps {
  initialValues: Record<string, unknown>;
  onFieldChange: (field: string, value: unknown) => void;
  onCancel: () => void;
  reviewId: string;
  employeeId: string;
  employeeName: string;
}

const STEP_ICONS = {
  contributions: FileText,
  draft: Lightbulb,
  finalize: CheckCircle,
  goals: Target,
};

const STEPS = ["contributions", "draft", "finalize", "goals"] as const;

export function PerformanceReviewForm({
  initialValues,
  onFieldChange,
  onCancel,
  reviewId,
  employeeName,
}: PerformanceReviewFormProps) {
  const currentStep = (initialValues.currentStep as string) || "contributions";

  // Contributions fields
  const [strategicPriorities, setStrategicPriorities] = useState(
    (initialValues.strategicPriorities as string) || "",
  );
  const [outcomesAchieved, setOutcomesAchieved] = useState(
    (initialValues.outcomesAchieved as string) || "",
  );
  const [behaviors, setBehaviors] = useState(
    (initialValues.behaviors as string) || "",
  );
  const [additionalContext, setAdditionalContext] = useState(
    (initialValues.additionalContext as string) || "",
  );

  // Draft fields (editable in finalize step)
  const [finalSummary] = useState(
    (initialValues.finalSummary as string) || (initialValues.draftSummary as string) || "",
  );
  const [finalStrengths] = useState(
    (initialValues.finalStrengthsAndImpact as string) || (initialValues.draftStrengthsAndImpact as string) || "",
  );
  const [finalGrowth] = useState(
    (initialValues.finalAreasForGrowth as string) || (initialValues.draftAreasForGrowth as string) || "",
  );
  const [finalAlignment] = useState(
    (initialValues.finalStrategicAlignment as string) || (initialValues.draftStrategicAlignment as string) || "",
  );
  const [finalAssessment] = useState(
    (initialValues.finalOverallAssessment as string) || (initialValues.draftOverallAssessment as string) || "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const alignedGoals = (initialValues.alignedGoals as AlignedGoal[]) || [];
  const goalRecommendations = (initialValues.goalRecommendations as GoalRecommendation[]) || [];
  const periodLabel = (initialValues.reviewPeriodLabel as string) || "";

  const handleContributionChange = useCallback(
    (field: string, value: string, setter: (v: string) => void) => {
      setter(value);
      onFieldChange(field, value);
    },
    [onFieldChange],
  );

  const handleSaveContributions = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributions: {
            strategicPriorities,
            outcomesAchieved,
            behaviors,
            additionalContext,
          },
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/grow/reviews/${reviewId}/pdf`, "_blank");
  };

  const currentStepIndex = STEPS.indexOf(currentStep as typeof STEPS[number]);

  return (
    <div className="flex h-full flex-col">
      {/* Step Progress Bar */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          {STEPS.map((step, i) => {
            const Icon = STEP_ICONS[step];
            const isActive = step === currentStep;
            const isComplete = i < currentStepIndex;
            return (
              <div key={step} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="mx-1 h-3 w-3 text-muted-foreground/40" />
                )}
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1",
                    isActive && "bg-primary/10 text-primary font-medium",
                    isComplete && "text-primary/60",
                    !isActive && !isComplete && "text-muted-foreground/50",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{REVIEW_STEP_LABELS[step]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Context Sidebar (visible in contributions/draft steps) */}
        {(currentStep === "contributions" || currentStep === "draft") &&
          alignedGoals.length > 0 && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {employeeName}&apos;s {periodLabel} Goals
              </h4>
              <div className="space-y-1.5">
                {alignedGoals.map((goal, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div
                      className={cn(
                        "mt-1 h-2 w-2 rounded-full shrink-0",
                        goal.status === "completed" && "bg-blue-500",
                        goal.status === "on_track" && "bg-green-500",
                        goal.status === "needs_attention" && "bg-yellow-500",
                        goal.status === "off_track" && "bg-red-500",
                      )}
                    />
                    <div>
                      <span className="font-medium">{goal.title}</span>
                      <span className="ml-1 text-muted-foreground">
                        ({goal.category.replace(/_/g, " ")})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Step: Contributions */}
        {currentStep === "contributions" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="strategicPriorities" className="text-sm font-medium">
                Strategic Priorities Supported
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Which company priorities or pillars did this employee support?
              </p>
              <Textarea
                id="strategicPriorities"
                value={strategicPriorities}
                onChange={(e) =>
                  handleContributionChange("strategicPriorities", e.target.value, setStrategicPriorities)
                }
                rows={4}
                placeholder="Pre-filled from goal alignment data..."
              />
            </div>

            <div>
              <Label htmlFor="outcomesAchieved" className="text-sm font-medium">
                Outcomes Achieved
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                What measurable outcomes were delivered?
              </p>
              <Textarea
                id="outcomesAchieved"
                value={outcomesAchieved}
                onChange={(e) =>
                  handleContributionChange("outcomesAchieved", e.target.value, setOutcomesAchieved)
                }
                rows={4}
                placeholder="Pre-filled from completed goals..."
              />
            </div>

            <div>
              <Label htmlFor="behaviors" className="text-sm font-medium">
                Behaviors & Collaboration
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Observations on accountability, collaboration, initiative, and other behaviors.
              </p>
              <Textarea
                id="behaviors"
                value={behaviors}
                onChange={(e) =>
                  handleContributionChange("behaviors", e.target.value, setBehaviors)
                }
                rows={4}
                placeholder="Describe observed behaviors..."
              />
            </div>

            <div>
              <Label htmlFor="additionalContext" className="text-sm font-medium">
                Additional Context
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Anything else you want to include in the review.
              </p>
              <Textarea
                id="additionalContext"
                value={additionalContext}
                onChange={(e) =>
                  handleContributionChange("additionalContext", e.target.value, setAdditionalContext)
                }
                rows={3}
                placeholder="Optional additional context..."
              />
            </div>
          </div>
        )}

        {/* Step: Draft Preview */}
        {currentStep === "draft" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI-generated draft based on {employeeName}&apos;s data and your contributions.
              Ask Compass to adjust any section, or proceed to edit and finalize.
            </p>
            {[
              { label: "Summary", value: initialValues.draftSummary as string },
              { label: "Strengths & Impact", value: initialValues.draftStrengthsAndImpact as string },
              { label: "Areas for Growth", value: initialValues.draftAreasForGrowth as string },
              { label: "Strategic Alignment", value: initialValues.draftStrategicAlignment as string },
              { label: "Overall Assessment", value: initialValues.draftOverallAssessment as string },
            ].map((section) => (
              <div key={section.label} className="rounded-lg border p-3">
                <h4 className="mb-1 text-sm font-semibold">{section.label}</h4>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {section.value || "Not yet generated."}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Step: Finalize */}
        {currentStep === "finalize" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review finalized. You can download the review as a PDF.
            </p>
            {[
              { label: "Summary", value: finalSummary },
              { label: "Strengths & Impact", value: finalStrengths },
              { label: "Areas for Growth", value: finalGrowth },
              { label: "Strategic Alignment", value: finalAlignment },
              { label: "Overall Assessment", value: finalAssessment },
            ].map((section) => (
              <div key={section.label} className="rounded-lg border p-3">
                <h4 className="mb-1 text-sm font-semibold">{section.label}</h4>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {section.value || "Not yet generated."}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Step: Goal Recommendations */}
        {currentStep === "goals" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Recommended next-period goals based on the review and current strategy.
            </p>
            {goalRecommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">{rec.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {rec.category.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">{rec.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Close
          </Button>

          <div className="flex gap-2">
            {currentStep === "contributions" && (
              <Button
                size="sm"
                onClick={handleSaveContributions}
                disabled={isSubmitting || !behaviors.trim()}
              >
                {isSubmitting ? "Saving..." : "Save & Generate Draft"}
              </Button>
            )}

            {(currentStep === "finalize" || currentStep === "goals") && (
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
