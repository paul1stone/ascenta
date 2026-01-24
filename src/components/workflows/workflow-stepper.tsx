"use client";

import { cn } from "@/lib/utils";
import {
  ClipboardList,
  ShieldCheck,
  FileText,
  Download,
  CheckCircle2,
} from "lucide-react";
import type { WorkflowStatus } from "@/lib/workflows/types";

interface WorkflowStepperProps {
  currentStep: WorkflowStatus;
  onStepClick?: (step: WorkflowStatus) => void;
}

interface Step {
  id: WorkflowStatus;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: "intake",
    label: "Intake",
    icon: <ClipboardList className="size-5" />,
  },
  {
    id: "review",
    label: "Review",
    icon: <ShieldCheck className="size-5" />,
  },
  {
    id: "generating",
    label: "Generate",
    icon: <FileText className="size-5" />,
  },
  {
    id: "export",
    label: "Export",
    icon: <Download className="size-5" />,
  },
  {
    id: "completed",
    label: "Complete",
    icon: <CheckCircle2 className="size-5" />,
  },
];

const stepOrder: Record<WorkflowStatus, number> = {
  intake: 0,
  review: 1,
  generating: 2,
  export: 3,
  completed: 4,
  cancelled: -1,
};

export function WorkflowStepper({
  currentStep,
  onStepClick,
}: WorkflowStepperProps) {
  const currentStepIndex = stepOrder[currentStep];

  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const stepIndex = stepOrder[step.id];
            const isCompleted = stepIndex < currentStepIndex;
            const isCurrent = stepIndex === currentStepIndex;
            const isClickable = onStepClick && stepIndex <= currentStepIndex;

            return (
              <li
                key={step.id}
                className={cn(
                  "relative flex-1",
                  index !== steps.length - 1 && "pr-4 sm:pr-8"
                )}
              >
                {/* Connector line */}
                {index !== steps.length - 1 && (
                  <div
                    className="absolute left-0 top-4 h-0.5 w-full -translate-y-1/2"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-full transition-colors",
                        isCompleted ? "bg-summit" : "bg-border"
                      )}
                    />
                  </div>
                )}

                {/* Step */}
                <div
                  className={cn(
                    "relative flex flex-col items-center",
                    isClickable && "cursor-pointer"
                  )}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                >
                  {/* Circle */}
                  <span
                    className={cn(
                      "relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-all",
                      isCompleted &&
                        "border-summit bg-summit text-white",
                      isCurrent &&
                        "border-summit bg-white text-summit ring-4 ring-summit/20",
                      !isCompleted &&
                        !isCurrent &&
                        "border-border bg-white text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      step.icon
                    )}
                  </span>

                  {/* Label */}
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium transition-colors",
                      isCurrent && "text-summit",
                      isCompleted && "text-deep-blue",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/**
 * Compact horizontal stepper for mobile
 */
export function WorkflowStepperCompact({
  currentStep,
}: {
  currentStep: WorkflowStatus;
}) {
  const currentStepIndex = stepOrder[currentStep];
  const currentStepData = steps.find((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-summit text-white">
          {currentStepData?.icon}
        </span>
        <div>
          <p className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
          <p className="font-medium text-deep-blue">
            {currentStepData?.label}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-1">
        <div className="h-2 rounded-full bg-border">
          <div
            className="h-full rounded-full bg-summit transition-all"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
