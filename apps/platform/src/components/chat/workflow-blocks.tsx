"use client";

import {
  FIELD_PROMPT_PREFIX,
  FIELD_PROMPT_SUFFIX,
  FOLLOW_UP_PREFIX,
  FOLLOW_UP_SUFFIX,
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
} from "@/lib/ai/workflow-constants";

export interface FieldPromptData {
  fieldKey: string;
  runId: string;
  question: string;
  fieldType: string;
  options: { value: string; label: string }[];
  allowOther: boolean;
  placeholder?: string;
}

export interface FollowUpData {
  runId: string;
  employeeName: string;
  documentContent: string;
}

export interface WorkingDocData {
  action: "open_working_document" | "update_working_document";
  workflowType?: "create-goal" | "run-check-in" | "add-performance-note";
  runId: string;
  employeeId?: string;
  employeeName?: string;
  prefilled?: Record<string, unknown>;
  updates?: Record<string, unknown>;
  availableGoals?: { id: string; title: string }[];
}

export interface ParsedContent {
  text: string;
  fieldPrompt: FieldPromptData | null;
  followUp: FollowUpData | null;
  workingDoc: WorkingDocData | null;
}

export function parseWorkflowBlocks(content: string): ParsedContent {
  let text = content;
  let fieldPrompt: FieldPromptData | null = null;
  let followUp: FollowUpData | null = null;
  let workingDoc: WorkingDocData | null = null;

  const fieldMatch = content.match(
    new RegExp(
      `${escapeRegex(FIELD_PROMPT_PREFIX)}([\\s\\S]*?)${escapeRegex(FIELD_PROMPT_SUFFIX)}`
    )
  );
  if (fieldMatch) {
    try {
      fieldPrompt = JSON.parse(fieldMatch[1].trim()) as FieldPromptData;
      text = text.replace(fieldMatch[0], "").trim();
    } catch {
      // Invalid JSON, leave in text
    }
  }

  const followUpMatch = content.match(
    new RegExp(
      `${escapeRegex(FOLLOW_UP_PREFIX)}([\\s\\S]*?)${escapeRegex(FOLLOW_UP_SUFFIX)}`
    )
  );
  if (followUpMatch) {
    try {
      followUp = JSON.parse(followUpMatch[1].trim()) as FollowUpData;
      text = text.replace(followUpMatch[0], "").trim();
    } catch {
      // Invalid JSON, leave in text
    }
  }

  const workingDocMatch = content.match(
    new RegExp(
      `${escapeRegex(WORKING_DOC_PREFIX)}([\\s\\S]*?)${escapeRegex(WORKING_DOC_SUFFIX)}`
    )
  );
  if (workingDocMatch) {
    try {
      workingDoc = JSON.parse(workingDocMatch[1].trim()) as WorkingDocData;
      text = text.replace(workingDocMatch[0], "").trim();
    } catch {
      // Invalid JSON, leave in text
    }
  }

  return { text, fieldPrompt, followUp, workingDoc };
}

/** Get the workflow runId from message content (field prompt or follow-up block) so the client can send it as activeWorkflowRunId */
export function extractLastWorkflowRunId(content: string): string | null {
  const { fieldPrompt, followUp, workingDoc } = parseWorkflowBlocks(content);
  return fieldPrompt?.runId ?? followUp?.runId ?? workingDoc?.runId ?? null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
