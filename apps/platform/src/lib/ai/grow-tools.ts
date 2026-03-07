/**
 * Grow Performance System AI tools
 * Enables goal creation, check-ins, and performance notes via chat conversation
 */

import { z } from "zod";
import { tool } from "ai";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import {
  startWorkflowRun,
  getWorkflowRun,
  getWorkflowBySlug,
  registerAllWorkflows,
  syncAllWorkflowsToDatabase,
  logAuditEvent,
} from "@/lib/workflows";
import type { IntakeFieldDefinition, WorkflowInputs } from "@/lib/workflows/types";

import {
  FIELD_PROMPT_PREFIX,
  FIELD_PROMPT_SUFFIX,
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
} from "./workflow-constants";

import {
  getWorkflowStateSummary,
} from "./workflow-tools";

// ---------------------------------------------------------------------------
// Ensure workflow definitions exist in DB (register + sync once)
// ---------------------------------------------------------------------------

let _workflowsSynced = false;
async function ensureWorkflowsSynced() {
  registerAllWorkflows();
  if (!_workflowsSynced) {
    await syncAllWorkflowsToDatabase();
    _workflowsSynced = true;
  }
}

// ---------------------------------------------------------------------------
// Helpers (mirrors the pattern from workflow-tools.ts)
// ---------------------------------------------------------------------------

function fieldToPromptPayload(
  field: IntakeFieldDefinition,
  runId: string,
  employeeName?: string,
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
  employeeName?: string,
): {
  field: IntakeFieldDefinition;
  payload: ReturnType<typeof fieldToPromptPayload>;
} | null {
  if (!workflow) return null;
  for (const field of workflow.intakeFields) {
    if (!field.required) continue;
    const value = inputs[field.fieldKey];
    if (value === undefined || value === null || value === "") {
      return {
        field,
        payload: fieldToPromptPayload(field, "", employeeName),
      };
    }
    if (Array.isArray(value) && value.length === 0) continue;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Time-period parser for Goal creation
// ---------------------------------------------------------------------------

export function parseTimePeriod(
  timePeriodValue: string,
  customStart?: string,
  customEnd?: string,
): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();

  switch (timePeriodValue) {
    case "Q1":
      return { start: new Date(year, 0, 1), end: new Date(year, 2, 31) };
    case "Q2":
      return { start: new Date(year, 3, 1), end: new Date(year, 5, 30) };
    case "Q3":
      return { start: new Date(year, 6, 1), end: new Date(year, 8, 30) };
    case "Q4":
      return { start: new Date(year, 9, 1), end: new Date(year, 11, 31) };
    case "H1":
      return { start: new Date(year, 0, 1), end: new Date(year, 5, 30) };
    case "H2":
      return { start: new Date(year, 6, 1), end: new Date(year, 11, 31) };
    case "annual":
      return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
    case "custom":
      return {
        start: customStart ? new Date(customStart) : now,
        end: customEnd ? new Date(customEnd) : new Date(year, 11, 31),
      };
    default:
      return { start: now, end: new Date(year, 11, 31) };
  }
}

// ---------------------------------------------------------------------------
// Tool 1: Start Goal Creation
// ---------------------------------------------------------------------------

export const startGoalCreationTool = tool({
  description:
    "Open the goal creation working document for an employee. Call this after using getEmployeeInfo and after asking any clarifying questions. Pass ALL values you can infer from the conversation as pre-filled fields.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    managerName: z.string().optional(),
    // Pre-fill values extracted from conversation
    title: z.string().optional().describe("Goal title if mentioned by user"),
    description: z.string().optional().describe("Goal description if provided"),
    categoryGroup: z.string().optional().describe("performance, leadership, or development"),
    category: z.string().optional().describe("Specific category if inferable"),
    measurementType: z.string().optional().describe("How progress will be measured"),
    successMetric: z.string().optional().describe("Success metric if mentioned"),
    timePeriod: z.string().optional().describe("Q1-Q4, H1, H2, annual, or custom"),
    checkInCadence: z.string().optional().describe("monthly, quarterly, milestone, or manager_scheduled"),
    alignment: z.string().optional().describe("mission, value, or priority"),
  }),
  execute: async (params) => {
    await ensureWorkflowsSynced();
    const initialInputs: WorkflowInputs = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
      department: params.department ?? "",
      jobTitle: params.jobTitle ?? "",
      managerName: params.managerName ?? "",
    };

    const run = await startWorkflowRun("create-goal", "system", initialInputs);

    // Build pre-filled values from AI-extracted params
    const prefilled: Record<string, unknown> = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
    };
    for (const key of [
      "title", "description", "categoryGroup", "category",
      "measurementType", "successMetric", "timePeriod",
      "checkInCadence", "alignment",
    ] as const) {
      if (params[key]) prefilled[key] = params[key];
    }

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "create-goal" as const,
      runId: run.id,
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      prefilled,
    };

    return {
      success: true,
      runId: run.id,
      message: `I've opened the goal creation form for ${params.employeeName} with the details pre-filled. You can review and edit the form, or ask me to make changes.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 2: Start Check-In
// ---------------------------------------------------------------------------

export const startCheckInTool = tool({
  description:
    "Open the check-in working document for an employee. This fetches active goals and opens a pre-filled form. Call after getEmployeeInfo and any clarifying questions.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    // Pre-fill values extracted from conversation
    managerProgressObserved: z.string().optional().describe("Manager's progress observations if provided"),
    managerCoachingNeeded: z.string().optional().describe("Coaching needs if mentioned"),
    managerRecognition: z.string().optional().describe("Recognition if mentioned"),
    employeeProgress: z.string().optional().describe("Employee progress if provided"),
    employeeObstacles: z.string().optional().describe("Obstacles if mentioned"),
    employeeSupportNeeded: z.string().optional().describe("Support needs if mentioned"),
  }),
  execute: async (params) => {
    await ensureWorkflowsSynced();
    await connectDB();

    // Look up employee to get ObjectId for goal query
    const employee = await getEmployeeByEmployeeId(params.employeeId);

    // Fetch active goals for this employee
    let availableGoals: { id: string; title: string }[] = [];
    if (employee) {
      const activeGoals = await Goal.find({
        owner: employee.id,
        status: { $in: ["on_track", "needs_attention"] },
      }).lean();

      availableGoals = activeGoals.map((g) => ({
        id: String(g._id),
        title: (g as Record<string, unknown>).title as string,
      }));
    }

    const initialInputs: WorkflowInputs = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
    };

    const run = await startWorkflowRun("run-check-in", "system", initialInputs);

    const prefilled: Record<string, unknown> = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
    };
    for (const key of [
      "managerProgressObserved", "managerCoachingNeeded", "managerRecognition",
      "employeeProgress", "employeeObstacles", "employeeSupportNeeded",
    ] as const) {
      if (params[key]) prefilled[key] = params[key];
    }

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "run-check-in" as const,
      runId: run.id,
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      prefilled,
      availableGoals,
    };

    return {
      success: true,
      runId: run.id,
      message: `I've opened the check-in form for ${params.employeeName}${availableGoals.length > 0 ? ` with ${availableGoals.length} active goal(s) available` : ""}. You can review and edit the form, or ask me to make changes.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 3: Start Performance Note
// ---------------------------------------------------------------------------

export const startPerformanceNoteTool = tool({
  description:
    "Open the performance note working document for an employee. Call after getEmployeeInfo and any clarifying questions. Pass all values you can infer.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    // Pre-fill values extracted from conversation
    noteType: z.string().optional().describe("observation, feedback, coaching, recognition, or concern"),
    observation: z.string().optional().describe("The observation text if provided"),
    expectation: z.string().optional().describe("Expected behavior if mentioned"),
    followUp: z.string().optional().describe("none, check_in, goal, or escalate"),
  }),
  execute: async (params) => {
    await ensureWorkflowsSynced();
    const initialInputs: WorkflowInputs = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
    };

    const run = await startWorkflowRun("add-performance-note", "system", initialInputs);

    const prefilled: Record<string, unknown> = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
    };
    for (const key of ["noteType", "observation", "expectation", "followUp"] as const) {
      if (params[key]) prefilled[key] = params[key];
    }

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "add-performance-note" as const,
      runId: run.id,
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      prefilled,
    };

    return {
      success: true,
      runId: run.id,
      message: `I've opened the performance note form for ${params.employeeName}. You can review and edit the form, or ask me to make changes.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 4: Update Working Document Fields (chat → form sync)
// ---------------------------------------------------------------------------

export const updateWorkingDocumentTool = tool({
  description:
    "Update fields in the open working document form. Use when the user asks to change a value via chat (e.g. 'change the time period to Q3').",
  inputSchema: z.object({
    runId: z.string().describe("The workflow run ID"),
    updates: z.record(z.string(), z.unknown()).describe("Object with fieldKey: newValue pairs to update"),
  }),
  execute: async ({ runId, updates }) => {
    const payload = { action: "update_working_document" as const, runId, updates };
    return {
      success: true,
      message: "I've updated the form with your changes.",
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(payload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 5: Complete Grow Workflow (save the record)
// ---------------------------------------------------------------------------

export const completeGrowWorkflowTool = tool({
  description:
    "Complete a Grow workflow (goal creation, check-in, or performance note) and save the record. Call this when all required fields have been collected (readyToGenerate is true).",
  inputSchema: z.object({
    runId: z.string().describe("The workflow run ID"),
  }),
  execute: async ({ runId }) => {
    await ensureWorkflowsSynced();
    await connectDB();

    const run = await getWorkflowRun(runId);
    if (!run) {
      return { success: false, error: "Workflow run not found" };
    }

    const inputs = run.inputs;
    const employeeId = inputs.employeeId as string | undefined;

    // Look up the employee to get their ObjectId
    const employee = employeeId ? await getEmployeeByEmployeeId(employeeId) : null;
    if (!employee) {
      return { success: false, error: "Employee not found. Cannot save record." };
    }

    const slug = run.workflowSlug;

    try {
      let recordId: string;
      let recordType: string;

      if (slug === "create-goal") {
        const timePeriod = parseTimePeriod(
          inputs.timePeriod as string,
          inputs.customStartDate as string | undefined,
          inputs.customEndDate as string | undefined,
        );

        const goal = await Goal.create({
          title: inputs.title as string,
          description: inputs.description as string,
          category: inputs.category as string,
          measurementType: inputs.measurementType as string,
          successMetric: inputs.successMetric as string,
          timePeriod,
          checkInCadence: inputs.checkInCadence as string,
          alignment: inputs.alignment as string,
          status: "on_track",
          owner: employee.id,
          manager: employee.id, // default to same; can be updated later
          workflowRunId: runId,
        });
        const goalObj = goal.toJSON() as Record<string, unknown>;
        recordId = goalObj.id as string;
        recordType = "goal";
      } else if (slug === "run-check-in") {
        // Parse linked goals (array of ObjectId strings)
        const linkedGoals = inputs.linkedGoals as string[] | string | undefined;
        const goalIds = Array.isArray(linkedGoals)
          ? linkedGoals
          : linkedGoals
            ? [linkedGoals]
            : [];

        const checkIn = await CheckIn.create({
          goals: goalIds,
          employee: employee.id,
          manager: employee.id, // default to same; can be updated later
          dueDate: new Date(),
          completedAt: new Date(),
          managerProgressObserved: (inputs.managerProgressObserved as string) ?? null,
          managerCoachingNeeded: (inputs.managerCoachingNeeded as string) ?? null,
          managerRecognition: (inputs.managerRecognition as string) ?? null,
          employeeProgress: (inputs.employeeProgress as string) ?? null,
          employeeObstacles: (inputs.employeeObstacles as string) ?? null,
          employeeSupportNeeded: (inputs.employeeSupportNeeded as string) ?? null,
          status: "completed",
          workflowRunId: runId,
        });
        const checkInObj = checkIn.toJSON() as Record<string, unknown>;
        recordId = checkInObj.id as string;
        recordType = "check-in";
      } else if (slug === "add-performance-note") {
        const note = await PerformanceNote.create({
          employee: employee.id,
          author: employee.id, // default to same; can be updated later
          type: inputs.noteType as string,
          observation: inputs.observation as string,
          expectation: (inputs.expectation as string) ?? null,
          workflowRunId: runId,
        });
        const noteObj = note.toJSON() as Record<string, unknown>;
        recordId = noteObj.id as string;
        recordType = "performance-note";
      } else {
        return { success: false, error: `Unknown Grow workflow slug: ${slug}` };
      }

      // Log audit event
      await logAuditEvent({
        workflowRunId: runId,
        actorId: "system",
        actorType: "system",
        action: "approved",
        description: `Completed ${recordType} workflow. Record ID: ${recordId}`,
        workflowVersion: run.workflowVersion,
        metadata: { recordId, recordType },
      });

      // Update workflow run status to completed
      await WorkflowRun.findByIdAndUpdate(runId, {
        $set: {
          status: "completed",
          currentStep: "completed",
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        message: `${recordType.charAt(0).toUpperCase() + recordType.slice(1)} saved successfully for ${inputs.employeeName as string}.`,
        recordId,
        recordType,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to complete grow workflow (${slug}):`, message);
      return { success: false, error: `Failed to save record: ${message}` };
    }
  },
});
