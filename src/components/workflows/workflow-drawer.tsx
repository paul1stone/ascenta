"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  TrendingUp,
  Search,
  Calendar,
  Shield,
  FileText,
  Clock,
  Users,
  Target,
  AlertCircle,
  FileOutput,
  Play,
  ChevronRight,
} from "lucide-react";
import type {
  WorkflowDetail,
  WorkflowCategory,
  RiskLevel,
  GuardrailSeverity,
} from "@/lib/workflows/types";

interface WorkflowDrawerProps {
  workflow: WorkflowDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartWorkflow: () => void;
}

// Icon mapping for workflows
const categoryIcons: Record<WorkflowCategory, React.ReactNode> = {
  corrective: <AlertTriangle className="size-5" />,
  performance: <TrendingUp className="size-5" />,
  investigation: <Search className="size-5" />,
  scheduling: <Calendar className="size-5" />,
  compliance: <Shield className="size-5" />,
  communication: <FileText className="size-5" />,
};

const riskColors: Record<RiskLevel, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const severityColors: Record<GuardrailSeverity, string> = {
  hard_stop: "text-red-600",
  warning: "text-yellow-600",
  escalation: "text-orange-600",
};

const severityLabels: Record<GuardrailSeverity, string> = {
  hard_stop: "Blocks Workflow",
  warning: "Requires Rationale",
  escalation: "Requires Review",
};

const audienceLabels: Record<string, string> = {
  manager: "Managers",
  hr: "HR Team",
  hr_only: "HR Only",
};

export function WorkflowDrawer({
  workflow,
  open,
  onOpenChange,
  onStartWorkflow,
}: WorkflowDrawerProps) {
  if (!workflow) return null;

  // Group intake fields by group name
  const groupedFields: Record<string, typeof workflow.intakeFields> = {};
  for (const field of workflow.intakeFields) {
    const group = field.groupName || "General";
    if (!groupedFields[group]) {
      groupedFields[group] = [];
    }
    groupedFields[group].push(field);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl" showCloseButton={true}>
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-summit/10 p-2 text-summit">
              {categoryIcons[workflow.category]}
            </div>
            <div>
              <SheetTitle className="font-display text-deep-blue">
                {workflow.name}
              </SheetTitle>
              <SheetDescription className="line-clamp-2">
                {workflow.description}
              </SheetDescription>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Badge variant="secondary" className={riskColors[workflow.riskLevel]}>
              {workflow.riskLevel} risk
            </Badge>
            <Badge variant="outline">
              <Users className="mr-1 size-3" />
              {audienceLabels[workflow.audience]}
            </Badge>
            {workflow.estimatedMinutes && (
              <Badge variant="outline">
                <Clock className="mr-1 size-3" />
                ~{workflow.estimatedMinutes} min
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-6 pr-4">
            {/* Section 1: What Ascenta Guides */}
            <DrawerSection
              icon={<Target className="size-4" />}
              title="What Ascenta Guides"
            >
              <p className="text-sm text-muted-foreground">
                Ascenta will guide you through creating a{" "}
                {workflow.artifactTemplates[0]?.type || "document"} with proper
                structure, compliance checks, and standardized language.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3 text-summit" />
                  Structured intake to capture all required information
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3 text-summit" />
                  Automatic guardrails for compliance
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3 text-summit" />
                  AI-assisted drafting with controlled language
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3 text-summit" />
                  Complete audit trail for defensibility
                </li>
              </ul>
            </DrawerSection>

            {/* Section 2: Inputs Ascenta Asks For */}
            <DrawerSection
              icon={<FileText className="size-4" />}
              title="Inputs Ascenta Asks For"
            >
              <div className="space-y-3">
                {Object.entries(groupedFields).map(([group, fields]) => (
                  <div key={group}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {group}
                    </p>
                    <ul className="mt-1 space-y-1">
                      {fields.map((field) => (
                        <li
                          key={field.fieldKey}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className={
                              field.required
                                ? "text-deep-blue"
                                : "text-muted-foreground"
                            }
                          >
                            {field.label}
                          </span>
                          {field.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </DrawerSection>

            {/* Section 3: Risk Triggers & Escalation */}
            <DrawerSection
              icon={<AlertCircle className="size-4" />}
              title="Risk Triggers & Escalation"
            >
              {workflow.guardrails.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No specific risk triggers for this workflow.
                </p>
              ) : (
                <ul className="space-y-2">
                  {workflow.guardrails.map((guardrail) => (
                    <li
                      key={guardrail.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span
                        className={`mt-0.5 ${severityColors[guardrail.severity]}`}
                      >
                        •
                      </span>
                      <div>
                        <span className="font-medium text-deep-blue">
                          {guardrail.name}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({severityLabels[guardrail.severity]})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </DrawerSection>

            {/* Section 4: Artifacts Generated */}
            <DrawerSection
              icon={<FileOutput className="size-4" />}
              title="Artifacts Generated"
            >
              <ul className="space-y-2">
                {workflow.artifactTemplates.map((template) => (
                  <li
                    key={template.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-deep-blue">{template.name}</span>
                    <div className="flex gap-1">
                      {template.exportFormats?.map((format) => (
                        <Badge key={format} variant="secondary" className="text-xs">
                          {format.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </DrawerSection>

            {/* Section 5: Time to Complete */}
            <DrawerSection
              icon={<Clock className="size-4" />}
              title="Time to Complete"
            >
              <p className="text-sm text-muted-foreground">
                {workflow.estimatedMinutes
                  ? `Approximately ${workflow.estimatedMinutes} minutes to complete, depending on complexity and available information.`
                  : "Time varies based on the complexity of your specific case."}
              </p>
            </DrawerSection>

            {/* Section 6: Who It's For */}
            <DrawerSection
              icon={<Users className="size-4" />}
              title="Who It's For"
            >
              <p className="text-sm text-muted-foreground">
                {workflow.audience === "hr_only" && (
                  <>
                    This workflow is restricted to <strong>HR personnel only</strong>.
                    Managers do not have access to this workflow or its outputs.
                  </>
                )}
                {workflow.audience === "hr" && (
                  <>
                    This workflow is available to <strong>HR team members</strong>{" "}
                    and can be used to support managers with HR documentation.
                  </>
                )}
                {workflow.audience === "manager" && (
                  <>
                    This workflow is available to <strong>managers and HR</strong>.
                    Managers can initiate this workflow for their direct reports.
                  </>
                )}
              </p>
            </DrawerSection>
          </div>
        </ScrollArea>

        {/* Section 7: Run Workflow */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
          <Button
            onClick={onStartWorkflow}
            className="w-full bg-summit hover:bg-summit-hover"
            size="lg"
          >
            <Play className="mr-2 size-4" />
            Run Workflow
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-summit">{icon}</span>
        <h3 className="font-display font-semibold text-deep-blue">{title}</h3>
      </div>
      {children}
    </div>
  );
}
