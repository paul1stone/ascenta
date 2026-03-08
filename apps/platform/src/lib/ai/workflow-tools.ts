// TODO: Migrate corrective action workflows (written-warning, PIP, investigation-summary)
// to the working document pattern. See docs/plans/2026-03-07-working-document-pattern-design.md
// The working document for corrective actions would show the document template being built.
// Follow-up actions (email/script) could become tabs or sections in the working document.

/**
 * Conversational workflow tools for chat
 * Enables building corrective actions via chat with button-based field collection
 */

import { z } from "zod";
import { tool } from "ai";
import { searchEmployees } from "@ascenta/db/employees";
import {
  startWorkflowRun,
  updateWorkflowRun,
  generateWorkflowArtifact,
  getWorkflowRun,
  getWorkflowBySlug,
  registerAllWorkflows,
} from "@/lib/workflows";
import { upsertTrackedDocumentForRun } from "@ascenta/db/tracked-documents";
import { streamText } from "ai";
import { getModel } from "@/lib/ai/providers";
import { AI_CONFIG } from "@/lib/ai/config";
import type { IntakeFieldDefinition, WorkflowInputs } from "@/lib/workflows/types";

import {
  FIELD_PROMPT_PREFIX,
  FIELD_PROMPT_SUFFIX,
  FOLLOW_UP_PREFIX,
  FOLLOW_UP_SUFFIX,
} from "./workflow-constants";

// Re-export constants so existing server-side imports keep working
export {
  FIELD_PROMPT_PREFIX,
  FIELD_PROMPT_SUFFIX,
  FOLLOW_UP_PREFIX,
  FOLLOW_UP_SUFFIX,
};

function fieldToPromptPayload(
  field: IntakeFieldDefinition,
  runId: string,
  employeeName?: string
): {
  fieldKey: string;
  runId: string;
  question: string;
  fieldType: string;
  options: { value: string; label: string }[];
  allowOther: boolean;
  placeholder?: string;
} {
  const question = employeeName
    ? field.label.replace(/\{\{employee\}\}/g, employeeName)
    : field.label;
  const options =
    field.options?.map((o) => ({ value: o.value, label: o.label })) ?? [];
  const allowOther =
    (field.type === "dropdown" || field.type === "checkbox_group") &&
    options.length > 0;
  return {
    fieldKey: field.fieldKey,
    runId,
    question,
    fieldType: field.type,
    options,
    allowOther,
    placeholder: field.placeholder,
  };
}

function getNextMissingField(
  workflow: Awaited<ReturnType<typeof getWorkflowBySlug>>,
  inputs: WorkflowInputs,
  employeeName?: string
): { field: IntakeFieldDefinition; payload: ReturnType<typeof fieldToPromptPayload> } | null {
  if (!workflow) return null;
  for (const field of workflow.intakeFields) {
    if (!field.required) continue;
    const value = inputs[field.fieldKey];
    if (value === undefined || value === null || value === "") {
      return {
        field,
        payload: fieldToPromptPayload(
          field,
          "", // runId filled by caller
          employeeName
        ),
      };
    }
    if (Array.isArray(value) && value.length === 0) continue;
  }
  return null;
}

/** Build a summary of what's collected vs still needed for the current run (for AI context / memory) */
export async function getWorkflowStateSummary(runId: string): Promise<{
  collectedSoFar: Record<string, unknown>;
  stillNeeded: string[];
  stillNeededLabels: string[];
  nextQuestion: string | null;
  formattedForPrompt: string;
} | null> {
  const run = await getWorkflowRun(runId);
  if (!run) return null;
  const workflow = await getWorkflowBySlug(run.workflowSlug);
  if (!workflow) return null;
  const employeeName = run.inputs.employeeName as string | undefined;
  const collectedSoFar: Record<string, unknown> = {};
  const stillNeeded: string[] = [];
  const stillNeededLabels: string[] = [];
  for (const field of workflow.intakeFields) {
    const value = run.inputs[field.fieldKey];
    const hasValue = value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
    if (hasValue) {
      collectedSoFar[field.fieldKey] = value;
    } else if (field.required) {
      stillNeeded.push(field.fieldKey);
      stillNeededLabels.push(field.label.replace(/\{\{employee\}\}/g, employeeName ?? "employee"));
    }
  }
  const next = getNextMissingField(workflow, run.inputs, employeeName);
  const nextQuestion = next ? next.field.label.replace(/\{\{employee\}\}/g, employeeName ?? "employee") : null;
  const formattedForPrompt = [
    "[WORKFLOW STATE]",
    `Run: ${runId}. Corrective action for: ${employeeName ?? "—"}.`,
    "Already collected:",
    ...Object.entries(collectedSoFar).map(([k, v]) => `  - ${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`),
    "Still needed:",
    ...(stillNeededLabels.length ? stillNeededLabels.map((l) => `  - ${l}`) : ["  (none – ready to generate)"]),
    "[/WORKFLOW STATE]",
  ].join("\n");
  return {
    collectedSoFar,
    stillNeeded,
    stillNeededLabels,
    nextQuestion,
    formattedForPrompt,
  };
}

/**
 * Start a corrective action workflow for an employee
 */
export const startCorrectiveActionTool = tool({
  description:
    "Start building a corrective action / written warning for an employee. Call this when the user asks to create a corrective action, written warning, or disciplinary document for someone. First use getEmployeeInfo to find the employee, then call this with their info.",
  inputSchema: z.object({
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    employeeName: z.string().describe("Full name of the employee"),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    managerName: z.string().optional(),
  }),
  execute: async ({
    employeeId,
    employeeName,
    department,
    jobTitle,
    managerName,
  }) => {
    registerAllWorkflows();
    const initialInputs: WorkflowInputs = {
      employeeName,
      employeeId: employeeId,
      department: department ?? "",
      jobTitle: jobTitle ?? "",
      managerName: managerName ?? "",
    };
    const run = await startWorkflowRun(
      "written-warning",
      "anonymous",
      initialInputs
    );
    const workflow = await getWorkflowBySlug("written-warning");
    const summary = await getWorkflowStateSummary(run.id);
    const next = getNextMissingField(
      workflow,
      run.inputs,
      employeeName
    );
    if (next) {
      const payload = {
        ...next.payload,
        runId: run.id,
      };
      return {
        success: true,
        runId: run.id,
        message: `Started corrective action for ${employeeName}. Need to collect: ${next.field.label}`,
        fieldPrompt: payload,
        fieldPromptBlock: `${FIELD_PROMPT_PREFIX}${JSON.stringify(payload)}${FIELD_PROMPT_SUFFIX}`,
        collectedSoFar: summary?.collectedSoFar ?? {},
        stillNeeded: summary?.stillNeededLabels ?? [],
        nextRequired: next.field.fieldKey,
      };
    }
    return {
      success: true,
      runId: run.id,
      message: `Started corrective action for ${employeeName}. All required fields collected from employee profile.`,
      fieldPrompt: null,
      collectedSoFar: summary?.collectedSoFar ?? {},
      stillNeeded: summary?.stillNeededLabels ?? [],
      nextRequired: null,
    };
  },
});

/**
 * Update a workflow field and get the next missing field
 */
export const updateWorkflowFieldTool = tool({
  description:
    "Update a workflow field with the user's selection. Call this when the user provides an answer to a field prompt (e.g. selected warning level, incident description, etc.).",
  inputSchema: z.object({
    runId: z.string().describe("The workflow run ID"),
    fieldKey: z.string().describe("The field key being updated"),
    value: z.union([z.string(), z.array(z.string()), z.number(), z.boolean()]).describe("The value from the user"),
  }),
  execute: async ({ runId, fieldKey, value }) => {
    registerAllWorkflows();
    const run = await getWorkflowRun(runId);
    if (!run) {
      return { success: false, error: "Workflow run not found" };
    }
    const workflow = await getWorkflowBySlug(run.workflowSlug);
    if (!workflow) {
      return { success: false, error: "Workflow not found" };
    }
    const { runState } = await updateWorkflowRun(runId, "anonymous", {
      inputs: { [fieldKey]: value },
    });
    const employeeName = runState.inputs.employeeName as string | undefined;
    const summary = await getWorkflowStateSummary(runId);
    const next = getNextMissingField(
      workflow,
      runState.inputs,
      employeeName
    );
    if (next) {
      const payload = {
        ...next.payload,
        runId,
      };
      return {
        success: true,
        runId,
        message: `Updated ${fieldKey}. Next: ${next.field.label}`,
        fieldPrompt: payload,
        fieldPromptBlock: `${FIELD_PROMPT_PREFIX}${JSON.stringify(payload)}${FIELD_PROMPT_SUFFIX}`,
        collectedSoFar: summary?.collectedSoFar ?? {},
        stillNeeded: summary?.stillNeededLabels ?? [],
        nextRequired: next.field.fieldKey,
      };
    }
    return {
      success: true,
      runId,
      message: "All required fields collected. Ready to generate document.",
      fieldPrompt: null,
      readyToGenerate: true,
      collectedSoFar: summary?.collectedSoFar ?? {},
      stillNeeded: [],
      nextRequired: null,
    };
  },
});

/**
 * Generate the corrective action document
 */
export const generateCorrectiveActionDocumentTool = tool({
  description:
    "Generate the final corrective action / written warning document. Call this when all required fields have been collected and the user is ready to generate.",
  inputSchema: z.object({
    runId: z.string().describe("The workflow run ID"),
  }),
  execute: async ({ runId }) => {
    registerAllWorkflows();
    const run = await getWorkflowRun(runId);
    if (!run) {
      return { success: false, error: "Workflow run not found" };
    }
    const artifact = await generateWorkflowArtifact(runId, "anonymous");
    const employeeName = run.inputs.employeeName as string;
    const employeeId = run.inputs.employeeId as string | undefined;
    await upsertTrackedDocumentForRun({
      workflowRunId: runId,
      title: `Corrective action – ${employeeName}`,
      employeeName,
      employeeId,
      documentType: "corrective_action",
    });
    const followUpPayload = {
      runId,
      employeeName,
      documentContent: artifact.renderedContent,
    };
    return {
      success: true,
      runId,
      documentMarkdown: artifact.renderedContent,
      employeeName,
      followUpBlock: `${FOLLOW_UP_PREFIX}${JSON.stringify(followUpPayload)}${FOLLOW_UP_SUFFIX}`,
    };
  },
});

/**
 * Generate follow-up: email or in-person script
 */
export const generateWorkflowFollowUpTool = tool({
  description:
    "Generate a follow-up deliverable: an email to send the employee, or an in-person script for delivering the news (with legal considerations). Call when user clicks 'Format me an email' or 'In person script'.",
  inputSchema: z.object({
    runId: z.string().describe("The workflow run ID"),
    type: z.enum(["email", "script"]).describe("Email or in-person script"),
    documentContent: z.string().optional().describe("Document content - fetches from run if omitted"),
    employeeName: z.string().describe("Employee name"),
  }),
  execute: async ({ runId, type, documentContent: providedContent, employeeName }) => {
    let documentContent = providedContent;
    if (!documentContent) {
      const run = await getWorkflowRun(runId);
      documentContent = run?.generatedArtifact?.renderedContent ?? "";
    }
    const employee = await searchEmployees(employeeName).then((r) => r[0]);
    const profileSummary = employee
      ? `Department: ${employee.department}, Title: ${employee.jobTitle}. Notes: ${employee.notes.map((n) => `${n.noteType}: ${n.title}`).join("; ")}`
      : "";

    const prompt =
      type === "email"
        ? `Write a professional email to ${employeeName} to deliver the following corrective action / written warning. 
Keep it brief, professional, and direct. Include: 1) Purpose of the meeting/email, 2) Request to meet to discuss, 3) Attachment reference.
Do NOT include the full document text in the email - just reference that a formal document is attached.

Document summary: ${documentContent.slice(0, 800)}...

${profileSummary ? `Employee context: ${profileSummary}` : ""}`
        : `Write an in-person script for a manager to deliver this corrective action to ${employeeName}.
Include: 1) Opening - set the tone, 2) What to say - key points to cover, 3) What to AVOID saying (legal traps, emotional language), 4) How to handle questions, 5) Next steps.
Focus on staying factual, avoiding legal liability, and maintaining professionalism.

Document: ${documentContent.slice(0, 800)}...

${profileSummary ? `Employee context: ${profileSummary}` : ""}`;

    const result = await streamText({
      model: getModel(AI_CONFIG.defaultModels.anthropic),
      prompt,
    });
    let output = "";
    for await (const chunk of result.textStream) {
      output += chunk;
    }
    return {
      success: true,
      type,
      content: output.trim(),
    };
  },
});
