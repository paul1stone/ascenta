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
  logAuditEvent,
} from "@/lib/workflows";
import type { IntakeFieldDefinition, WorkflowInputs } from "@/lib/workflows/types";

import {
  FIELD_PROMPT_PREFIX,
  FIELD_PROMPT_SUFFIX,
} from "./workflow-constants";

import {
  getWorkflowStateSummary,
} from "./workflow-tools";

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

function parseTimePeriod(
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
    "Start creating a new performance goal for an employee. Call this after using getEmployeeInfo to find the employee. This begins the goal-setting workflow and collects fields one at a time.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    managerName: z.string().optional(),
  }),
  execute: async ({ employeeName, employeeId, department, jobTitle, managerName }) => {
    registerAllWorkflows();
    const initialInputs: WorkflowInputs = {
      employeeName,
      employeeId,
      department: department ?? "",
      jobTitle: jobTitle ?? "",
      managerName: managerName ?? "",
    };

    const run = await startWorkflowRun("create-goal", "system", initialInputs);
    const workflow = await getWorkflowBySlug("create-goal");
    const summary = await getWorkflowStateSummary(run.id);
    const next = getNextMissingField(workflow, run.inputs, employeeName);

    if (next) {
      const payload = { ...next.payload, runId: run.id };
      return {
        success: true,
        runId: run.id,
        message: `Started goal creation for ${employeeName}. Need to collect: ${next.field.label}`,
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
      message: `Started goal creation for ${employeeName}. All required fields collected from employee profile.`,
      fieldPrompt: null,
      fieldPromptBlock: null,
      collectedSoFar: summary?.collectedSoFar ?? {},
      stillNeeded: summary?.stillNeededLabels ?? [],
      nextRequired: null,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 2: Start Check-In
// ---------------------------------------------------------------------------

export const startCheckInTool = tool({
  description:
    "Start a structured check-in for an employee. This fetches the employee's active goals and begins the check-in workflow. Call this after using getEmployeeInfo to find the employee.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
  }),
  execute: async ({ employeeName, employeeId }) => {
    registerAllWorkflows();
    await connectDB();

    // Look up employee to get ObjectId for goal query
    const employee = await getEmployeeByEmployeeId(employeeId);

    // Fetch active goals for this employee to populate linkedGoals options
    let goalOptions: { value: string; label: string }[] = [];
    if (employee) {
      const activeGoals = await Goal.find({
        owner: employee.id,
        status: { $in: ["on_track", "needs_attention"] },
      }).lean();

      goalOptions = activeGoals.map((g) => ({
        value: String(g._id),
        label: (g as Record<string, unknown>).title as string,
      }));
    }

    const initialInputs: WorkflowInputs = {
      employeeName,
      employeeId,
    };

    const run = await startWorkflowRun("run-check-in", "system", initialInputs);
    const workflow = await getWorkflowBySlug("run-check-in");
    const summary = await getWorkflowStateSummary(run.id);
    const next = getNextMissingField(workflow, run.inputs, employeeName);

    if (next) {
      const payload = { ...next.payload, runId: run.id };

      // If the next field is linkedGoals, inject dynamic goal options
      if (payload.fieldKey === "linkedGoals" && goalOptions.length > 0) {
        payload.options = goalOptions;
      }

      return {
        success: true,
        runId: run.id,
        message: `Started check-in for ${employeeName}.${goalOptions.length > 0 ? ` Found ${goalOptions.length} active goal(s).` : " No active goals found."} Need to collect: ${next.field.label}`,
        fieldPrompt: payload,
        fieldPromptBlock: `${FIELD_PROMPT_PREFIX}${JSON.stringify(payload)}${FIELD_PROMPT_SUFFIX}`,
        collectedSoFar: summary?.collectedSoFar ?? {},
        stillNeeded: summary?.stillNeededLabels ?? [],
        nextRequired: next.field.fieldKey,
        activeGoals: goalOptions,
      };
    }

    return {
      success: true,
      runId: run.id,
      message: `Started check-in for ${employeeName}. All required fields collected.`,
      fieldPrompt: null,
      fieldPromptBlock: null,
      collectedSoFar: summary?.collectedSoFar ?? {},
      stillNeeded: summary?.stillNeededLabels ?? [],
      nextRequired: null,
      activeGoals: goalOptions,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 3: Start Performance Note
// ---------------------------------------------------------------------------

export const startPerformanceNoteTool = tool({
  description:
    "Start adding a performance note (observation, feedback, coaching moment, recognition, or concern) for an employee. Call this after using getEmployeeInfo to find the employee.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
  }),
  execute: async ({ employeeName, employeeId }) => {
    registerAllWorkflows();
    const initialInputs: WorkflowInputs = {
      employeeName,
      employeeId,
    };

    const run = await startWorkflowRun("add-performance-note", "system", initialInputs);
    const workflow = await getWorkflowBySlug("add-performance-note");
    const summary = await getWorkflowStateSummary(run.id);
    const next = getNextMissingField(workflow, run.inputs, employeeName);

    if (next) {
      const payload = { ...next.payload, runId: run.id };
      return {
        success: true,
        runId: run.id,
        message: `Started performance note for ${employeeName}. Need to collect: ${next.field.label}`,
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
      message: `Started performance note for ${employeeName}. All required fields collected.`,
      fieldPrompt: null,
      fieldPromptBlock: null,
      collectedSoFar: summary?.collectedSoFar ?? {},
      stillNeeded: summary?.stillNeededLabels ?? [],
      nextRequired: null,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 4: Complete Grow Workflow (save the record)
// ---------------------------------------------------------------------------

export const completeGrowWorkflowTool = tool({
  description:
    "Complete a Grow workflow (goal creation, check-in, or performance note) and save the record. Call this when all required fields have been collected (readyToGenerate is true).",
  inputSchema: z.object({
    runId: z.string().describe("The workflow run ID"),
  }),
  execute: async ({ runId }) => {
    registerAllWorkflows();
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
