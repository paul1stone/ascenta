"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { useChat, type WorkflowType } from "@/lib/chat/chat-context";
import { GoalCreationForm } from "@/components/grow/forms/goal-creation-form";
import { CheckInForm } from "@/components/grow/forms/check-in-form";
import { PerformanceNoteForm } from "@/components/grow/forms/performance-note-form";

// ---------------------------------------------------------------------------
// Title mapping
// ---------------------------------------------------------------------------

const WORKFLOW_TITLES: Record<WorkflowType, string> = {
  "create-goal": "Create Goal",
  "run-check-in": "Run Check-in",
  "add-performance-note": "Performance Note",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WorkingDocumentProps {
  pageKey: string;
}

export function WorkingDocument({ pageKey }: WorkingDocumentProps) {
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

  return (
    <div className="flex h-full flex-col border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
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
      </div>
    </div>
  );
}
