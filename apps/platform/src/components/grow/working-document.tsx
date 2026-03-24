"use client";

import { useCallback } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { useChat, type WorkflowType } from "@/lib/chat/chat-context";
import { GoalCreationForm } from "@/components/grow/forms/goal-creation-form";
import { CheckInForm } from "@/components/grow/forms/check-in-form";
import { PerformanceNoteForm } from "@/components/grow/forms/performance-note-form";
import { MVVForm } from "@/components/plan/mvv-form";

// ---------------------------------------------------------------------------
// Title mapping
// ---------------------------------------------------------------------------

const WORKFLOW_TITLES: Record<WorkflowType, string> = {
  "create-goal": "Create Goal",
  "run-check-in": "Run Check-in",
  "add-performance-note": "Performance Note",
  "build-mvv": "Mission, Vision & Values",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WorkingDocumentProps {
  pageKey: string;
  accentColor?: string;
}

export function WorkingDocument({ pageKey, accentColor }: WorkingDocumentProps) {
  const {
    workingDocument,
    updateWorkingDocumentField,
    closeWorkingDocument,
    submitWorkingDocument,
  } = useChat();

  const handleSubmit = useCallback(async () => {
    await submitWorkingDocument(pageKey);
  }, [submitWorkingDocument, pageKey]);

  if (!workingDocument.isOpen || !workingDocument.workflowType) {
    return null;
  }

  const title = WORKFLOW_TITLES[workingDocument.workflowType];
  const color = accentColor ?? "#ff6b35";

  return (
    <div className="flex h-full flex-col">
      {/* Outer glow wrapper */}
      <div
        className="flex h-full flex-col rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm overflow-hidden"
        style={{
          borderColor: `color-mix(in srgb, ${color} 30%, var(--border))`,
          boxShadow: `0 8px 32px -4px color-mix(in srgb, ${color} 12%, transparent), 0 0 0 1px color-mix(in srgb, ${color} 8%, transparent)`,
        }}
      >
        {/* Header with accent gradient */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${color} 8%, white), color-mix(in srgb, ${color} 3%, white))`,
            borderBottom: `1px solid color-mix(in srgb, ${color} 15%, var(--border))`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex size-6 items-center justify-center rounded-md"
              style={{ background: `color-mix(in srgb, ${color} 15%, white)` }}
            >
              <Sparkles className="size-3.5" style={{ color }} />
            </div>
            <h2 className="text-sm font-semibold text-deep-blue">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-deep-blue"
            onClick={closeWorkingDocument}
            aria-label="Close working document"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {workingDocument.workflowType === "create-goal" && (
            <GoalCreationForm
              initialValues={workingDocument.fields}
              onFieldChange={updateWorkingDocumentField}
              onSubmit={handleSubmit}
              onCancel={closeWorkingDocument}
            />
          )}

          {workingDocument.workflowType === "run-check-in" && (
            <CheckInForm
              initialValues={workingDocument.fields}
              availableGoals={workingDocument.availableGoals ?? []}
              onFieldChange={updateWorkingDocumentField}
              onSubmit={handleSubmit}
              onCancel={closeWorkingDocument}
            />
          )}

          {workingDocument.workflowType === "add-performance-note" && (
            <PerformanceNoteForm
              initialValues={workingDocument.fields}
              onFieldChange={updateWorkingDocumentField}
              onSubmit={handleSubmit}
              onCancel={closeWorkingDocument}
            />
          )}

          {workingDocument.workflowType === "build-mvv" && (
            <MVVForm
              initialValues={workingDocument.fields}
              onFieldChange={updateWorkingDocumentField}
              onSubmit={handleSubmit}
              onCancel={closeWorkingDocument}
            />
          )}
        </div>
      </div>
    </div>
  );
}
