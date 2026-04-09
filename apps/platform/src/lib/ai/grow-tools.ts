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
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
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
// Tool 1a: Start Goal Workflow (conversational — does NOT open form yet)
// ---------------------------------------------------------------------------

export const startGoalWorkflowTool = tool({
  description: `Start a goal creation workflow for an employee. This fetches company strategy context and begins a multi-step conversation. Do NOT open a working document yet.

After calling this tool, guide the employee through these steps ONE AT A TIME:

**Step 1 — Strategic pillar context:**
Present the company's mission, vision, and values (from foundation data) plus any company-wide strategy goals. Ask: "Which strategic pillar or company goal does this goal support? You can skip this if your goal is independent." Accept a reference or "skip."

**Step 2 — Department and team focus:**
Present the employee's department strategy goals (if any). Ask which one this goal aligns to (or none). Then ask goal type as a numbered list:
1. Performance Goal (delivering results in current role)
2. Development Goal (building capability for the future)

**Step 3 — Goal recommendation:**
Based on all context (selected pillar, department goal, goal type, employee role/department), generate 4-6 goal recommendations as a numbered list. Include a final option: "Or describe your own goal." User picks a number or writes custom. Draft an objective statement (one sentence, outcome-focused, min 15 words).

**Step 4 — Key results and support:**
Based on the objective, suggest 2-4 key results. Each key result needs: what will be measured, the measurable target, and a deadline. Ask user to pick or customize. Discuss time period. Ask what support the manager can provide (resources, access, time, coaching). Then call openGoalDocument with all fields.

RULES:
- Ask ONE question at a time. Wait for the response before moving on.
- If the user gives rich answers, skip ahead where appropriate.
- After drafting the goal in step 3, confirm with the user before proceeding.
- When ready, call openGoalDocument with all collected values to open the form.`,
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    managerName: z.string().optional(),
  }),
  execute: async (params) => {
    await connectDB();

    let foundation = { mission: "", vision: "", values: "" };
    try {
      const doc = await CompanyFoundation.findOne().lean();
      if (doc) {
        const f = doc as Record<string, unknown>;
        foundation = {
          mission: (f.mission as string) || "",
          vision: (f.vision as string) || "",
          values: (f.values as string) || "",
        };
      }
    } catch {
      // silent
    }

    let companyGoals: { id: string; title: string; horizon: string }[] = [];
    let departmentGoals: { id: string; title: string; horizon: string }[] = [];
    try {
      const allGoals = await StrategyGoal.find({
        status: { $nin: ["archived", "completed"] },
      }).lean();

      for (const g of allGoals) {
        const goal = g as Record<string, unknown>;
        const entry = {
          id: String(goal._id),
          title: goal.title as string,
          horizon: goal.horizon as string,
        };
        if (goal.scope === "company") {
          companyGoals.push(entry);
        } else if (
          goal.scope === "department" &&
          goal.department === params.department
        ) {
          departmentGoals.push(entry);
        }
      }
    } catch {
      // silent
    }

    const hasFoundation = foundation.mission || foundation.vision || foundation.values;
    const hasCompanyGoals = companyGoals.length > 0;

    let message = `Strategy context loaded for ${params.employeeName} (${params.department ?? "unknown dept"}).`;
    if (!hasFoundation && !hasCompanyGoals) {
      message += " No company foundation or strategy goals found — skip to step 2.";
    }

    return {
      success: true,
      foundation,
      companyGoals,
      departmentGoals,
      employeeName: params.employeeName,
      employeeId: params.employeeId,
      department: params.department ?? "",
      jobTitle: params.jobTitle ?? "",
      message,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 1b: Open Goal Document (end of conversation — opens working document)
// ---------------------------------------------------------------------------

export const openGoalDocumentTool = tool({
  description:
    "Open the goal creation working document with all fields pre-filled. Call this at the END of the goal conversation (after steps 1-4), not at the beginning. The user will review the form and submit.",
  inputSchema: z.object({
    employeeName: z.string(),
    employeeId: z.string(),
    objectiveStatement: z.string().describe("Outcome-focused objective, min 15 words"),
    goalType: z.string().describe("'performance' or 'development'"),
    keyResults: z.array(z.object({
      description: z.string().describe("What will be measured"),
      metric: z.string().describe("The measurable target"),
      deadline: z.string().describe("ISO date string for deadline"),
    })).min(2).max(4).describe("2-4 SMART key results"),
    strategyGoalId: z.string().optional().describe("ObjectId of linked strategy pillar"),
    strategyGoalTitle: z.string().optional().describe("Display title of linked strategy pillar"),
    teamGoalId: z.string().optional().describe("ObjectId of linked team goal"),
    supportAgreement: z.string().optional().describe("Manager's committed resources and support"),
    timePeriod: z.string().describe("Q1, Q2, Q3, Q4, H1, H2, annual, or custom"),
    checkInCadence: z.string().describe("every_check_in, monthly, or quarterly"),
    notes: z.string().optional(),
  }),
  execute: async (params) => {
    await ensureWorkflowsSynced();
    const initialInputs: WorkflowInputs = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
    };

    const run = await startWorkflowRun("create-goal", "system", initialInputs);

    const prefilled: Record<string, unknown> = {};
    for (const key of [
      "employeeName", "employeeId", "objectiveStatement", "goalType",
      "keyResults", "strategyGoalId", "strategyGoalTitle", "teamGoalId",
      "supportAgreement", "timePeriod", "checkInCadence", "notes",
    ] as const) {
      if (params[key] !== undefined) prefilled[key] = params[key];
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
      message: `I've opened the goal form for ${params.employeeName} with everything pre-filled. Review and submit when ready.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 2: Start Check-In
// ---------------------------------------------------------------------------

export const startCheckInTool = tool({
  description:
    "Open the check-in working document for an employee. Call after getEmployeeInfo and any clarifying questions. You MUST provide a value for EVERY field you can infer from context. The user should only need to review the form, not fill it out.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    // ALL fields below should be filled — infer from context when not explicit
    managerProgressObserved: z.string().describe("Manager's observations on the employee's progress — synthesize from conversation context"),
    managerCoachingNeeded: z.string().describe("What coaching or support the manager sees as needed — infer from discussed challenges or goals"),
    managerRecognition: z.string().optional().describe("Any recognition or praise for the employee — include if positive context exists, omit if none"),
    employeeProgress: z.string().describe("Employee's self-reported progress — summarize what the employee/manager shared about accomplishments"),
    employeeObstacles: z.string().describe("Obstacles the employee is facing — infer from conversation or write 'None identified' if truly unclear"),
    employeeSupportNeeded: z.string().optional().describe("What support the employee needs — include if mentioned, omit if not discussed"),
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
    "Open the performance note working document for an employee. Call after getEmployeeInfo and any clarifying questions. You MUST provide a value for EVERY field — infer from context when not explicitly stated. The user should only need to review the form, not fill it out.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    // ALL fields below should be filled — infer from context when not explicit
    noteType: z.string().describe("observation (saw something), feedback (giving input), coaching (guiding improvement), recognition (positive), or concern (issue) — infer from the tone and content of what the user described"),
    observation: z.string().describe("What was observed — expand the user's description into a clear, professional observation statement"),
    expectation: z.string().optional().describe("Expected behavior going forward — infer a reasonable expectation if the note type is feedback, coaching, or concern; omit for recognition/observation"),
    followUp: z.string().describe("none (no action needed), check_in (schedule follow-up), goal (create a related goal), or escalate (needs higher review) — default to 'none' for recognition, 'check_in' for coaching/concern"),
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
    "Update fields in the open working document form. Use when the user asks to change a value via chat (e.g. 'change the time period to Q3'). For goal forms, valid field names include: objectiveStatement, goalType, keyResults, supportAgreement, timePeriod, checkInCadence, strategyGoalId, strategyGoalTitle, teamGoalId, notes.",
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
// Tool 6: Start Performance Review
// ---------------------------------------------------------------------------

export const startPerformanceReviewTool = tool({
  description:
    "Start a performance review for an employee. Pulls their goals, check-ins, performance notes, and company foundation data for the review period. Opens a working document with the contributions form.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee being reviewed"),
    employeeId: z.string().describe("Employee ID (e.g., EMP1001)"),
    reviewPeriod: z
      .enum(["Q1", "Q2", "Q3", "Q4", "H1", "H2", "annual", "custom"])
      .describe("The review period"),
    customStartDate: z.string().optional().describe("Custom start date (ISO string) if reviewPeriod is 'custom'"),
    customEndDate: z.string().optional().describe("Custom end date (ISO string) if reviewPeriod is 'custom'"),
  }),
  execute: async (params) => {
    await connectDB();

    const employee = await getEmployeeByEmployeeId(params.employeeId);
    if (!employee) {
      return { success: false, error: `Employee ${params.employeeName} (${params.employeeId}) not found.` };
    }

    const timePeriod = parseTimePeriod(params.reviewPeriod, params.customStartDate, params.customEndDate);

    // Check for existing review — resume if found
    const existing = await PerformanceReview.findOne({
      employee: employee.id,
      "reviewPeriod.label": params.reviewPeriod,
      status: { $nin: ["not_started"] },
    });
    if (existing) {
      const review = existing;
      const workingDocPayload = {
        action: "open_working_document" as const,
        workflowType: "performance-review" as const,
        runId: String(review._id),
        employeeId: params.employeeId,
        employeeName: params.employeeName,
        prefilled: {
          reviewId: String(review._id),
          currentStep: review.currentStep,
          reviewPeriodLabel: review.reviewPeriod.label,
          alignedGoals: review.alignedGoals,
          checkInSummaries: review.checkInSummaries,
          performanceNotes: review.performanceNotes,
          foundation: review.foundation,
          strategyGoals: review.strategyGoals,
          strategicPriorities: review.contributions?.strategicPriorities || "",
          outcomesAchieved: review.contributions?.outcomesAchieved || "",
          behaviors: review.contributions?.behaviors || "",
          additionalContext: review.contributions?.additionalContext || "",
          draftSummary: review.draft?.summary || "",
          draftStrengthsAndImpact: review.draft?.strengthsAndImpact || "",
          draftAreasForGrowth: review.draft?.areasForGrowth || "",
          draftStrategicAlignment: review.draft?.strategicAlignment || "",
          draftOverallAssessment: review.draft?.overallAssessment || "",
          finalSummary: review.finalDocument?.summary || "",
          finalStrengthsAndImpact: review.finalDocument?.strengthsAndImpact || "",
          finalAreasForGrowth: review.finalDocument?.areasForGrowth || "",
          finalStrategicAlignment: review.finalDocument?.strategicAlignment || "",
          finalOverallAssessment: review.finalDocument?.overallAssessment || "",
          goalRecommendations: review.goalRecommendations || [],
        },
      };

      return {
        success: true,
        resumed: true,
        reviewId: String(review._id),
        message: `Resuming performance review for ${params.employeeName} (${params.reviewPeriod}). Currently on step: ${review.currentStep}.`,
        workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
      };
    }

    // Pull goals for the period
    const goals = await Goal.find({
      owner: employee.id,
      "timePeriod.start": { $lte: timePeriod.end },
      "timePeriod.end": { $gte: timePeriod.start },
    }).lean();

    const alignedGoals = goals.map((g) => ({
      goalId: g._id,
      title: g.title,
      category: g.category,
      status: g.status,
      alignment: g.alignment || "mission",
      successMetric: g.successMetric,
    }));

    // Pull check-ins linked to these goals
    const goalIds = goals.map((g) => g._id);
    const checkIns = await CheckIn.find({
      goals: { $in: goalIds },
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .lean();

    const checkInSummaries = checkIns.map((c) => ({
      checkInId: c._id,
      completedAt: c.completedAt,
      managerNotes: [c.managerProgressObserved, c.managerCoachingNeeded, c.managerRecognition]
        .filter(Boolean)
        .join(" | "),
      employeeNotes: [c.employeeProgress, c.employeeObstacles, c.employeeSupportNeeded]
        .filter(Boolean)
        .join(" | "),
    }));

    // Pull performance notes for the period
    const notes = await PerformanceNote.find({
      employee: employee.id,
      createdAt: { $gte: timePeriod.start, $lte: timePeriod.end },
    })
      .sort({ createdAt: -1 })
      .lean();

    const performanceNotesSummary = notes.map((n) => ({
      noteId: n._id,
      type: n.type,
      observation: n.observation,
      createdAt: n.createdAt,
    }));

    // Pull foundation data
    const foundationDoc = await CompanyFoundation.findOne({ status: "published" }).lean() as Record<string, unknown> | null;
    const foundationData = {
      mission: (foundationDoc?.mission as string) || "",
      values: (foundationDoc?.values as string) || "",
    };

    // Pull strategy goals linked to employee's goals
    const strategyGoalIds = goals
      .map((g) => g.strategyGoalId)
      .filter(Boolean);
    const strategyGoals = strategyGoalIds.length > 0
      ? await StrategyGoal.find({ _id: { $in: strategyGoalIds } }).lean()
      : [];
    const strategyGoalsSummary = strategyGoals.map((sg) => ({
      strategyGoalId: sg._id,
      title: sg.title,
      horizon: sg.horizon,
    }));

    // Pre-fill contributions from goal data
    const outcomesList = goals
      .filter((g) => g.status === "completed")
      .map((g) => `• ${g.title}: ${g.successMetric}`)
      .join("\n");

    const prioritiesList = strategyGoals.length > 0
      ? strategyGoals.map((sg) => `• ${sg.title}`).join("\n")
      : goals
          .map((g) => g.category)
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((c) => `• ${c.replace(/_/g, " ")}`)
          .join("\n");

    // Create the review record
    const review = await PerformanceReview.create({
      employee: employee.id,
      manager: employee.id, // Same as employee for now (no auth)
      reviewPeriod: {
        start: timePeriod.start,
        end: timePeriod.end,
        label: params.reviewPeriod,
      },
      status: "in_progress",
      currentStep: "contributions",
      alignedGoals,
      checkInSummaries,
      performanceNotes: performanceNotesSummary,
      foundation: foundationData,
      strategyGoals: strategyGoalsSummary,
      contributions: {
        strategicPriorities: prioritiesList,
        outcomesAchieved: outcomesList,
        behaviors: "",
        additionalContext: "",
      },
    });

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "performance-review" as const,
      runId: String(review._id),
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      prefilled: {
        reviewId: String(review._id),
        currentStep: "contributions",
        reviewPeriodLabel: params.reviewPeriod,
        alignedGoals,
        checkInSummaries,
        performanceNotes: performanceNotesSummary,
        foundation: foundationData,
        strategyGoals: strategyGoalsSummary,
        strategicPriorities: prioritiesList,
        outcomesAchieved: outcomesList,
        behaviors: "",
        additionalContext: "",
      },
    };

    return {
      success: true,
      reviewId: String(review._id),
      message: `Performance review started for ${params.employeeName} (${params.reviewPeriod}). Pulled ${goals.length} goals, ${checkIns.length} check-ins, and ${notes.length} performance notes. ${strategyGoals.length > 0 ? `Employee's goals align to ${strategyGoals.length} strategy goal(s).` : ""} ${foundationDoc ? "Company foundation data loaded." : "No published foundation data found — review will proceed without pillar framing."} I've pre-filled strategic priorities and outcomes from the data. Please review and add your observations on behaviors and any additional context.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 7: Generate Review Draft
// ---------------------------------------------------------------------------

export const generateReviewDraftTool = tool({
  description:
    "Generate an AI-drafted performance review from the employee's data and manager contributions. Call this after the manager has completed the contributions step.",
  inputSchema: z.object({
    reviewId: z.string().describe("The performance review ID"),
  }),
  execute: async (params) => {
    await connectDB();

    const review = await PerformanceReview.findById(params.reviewId);
    if (!review) {
      return { success: false, error: "Review not found." };
    }

    // Build context for AI generation
    const goalsContext = (review.alignedGoals || [])
      .map((g: { title: string; status: string; category: string; successMetric: string; alignment: string }) =>
        `- ${g.title} (${g.status}): ${g.successMetric} [${g.category}, aligns to ${g.alignment}]`,
      )
      .join("\n");

    const checkInsContext = (review.checkInSummaries || [])
      .map((c: { managerNotes: string; employeeNotes: string }) =>
        `- Manager: ${c.managerNotes || "N/A"} | Employee: ${c.employeeNotes || "N/A"}`,
      )
      .join("\n");

    const notesContext = (review.performanceNotes || [])
      .map((n: { type: string; observation: string }) => `- [${n.type}] ${n.observation}`)
      .join("\n");

    const foundationContext = review.foundation?.mission
      ? `Company Mission: ${review.foundation.mission}\nCompany Values: ${review.foundation.values}`
      : "";

    const strategyContext = review.strategyGoals?.length
      ? `Strategy Goals: ${review.strategyGoals.map((sg: { title: string }) => sg.title).join(", ")}`
      : "";

    const contributions = review.contributions;

    const prompt = `You are writing a performance review for an employee. Use the data below to generate each section. Frame language around the company's strategic pillars and values where available.

## Employee Data
Goals:
${goalsContext || "No goals recorded."}

Check-in Highlights:
${checkInsContext || "No check-ins recorded."}

Performance Notes:
${notesContext || "No performance notes recorded."}

${foundationContext}
${strategyContext}

## Manager's Contributions
Strategic Priorities Supported: ${contributions?.strategicPriorities || "Not provided"}
Outcomes Achieved: ${contributions?.outcomesAchieved || "Not provided"}
Behaviors: ${contributions?.behaviors || "Not provided"}
Additional Context: ${contributions?.additionalContext || "Not provided"}

## Instructions
Generate exactly five sections. Each section should be 2-4 paragraphs. Use specific details from the data — do not generalize. If company values/mission are available, explicitly tie the employee's contributions to them.

Sections:
1. SUMMARY — Brief overview of the employee's performance in this period
2. STRENGTHS_AND_IMPACT — What went well, tied to strategic pillars and values
3. AREAS_FOR_GROWTH — Development opportunities with specific, actionable suggestions
4. STRATEGIC_ALIGNMENT — How the employee's work connected to company direction
5. OVERALL_ASSESSMENT — Closing assessment

Format your response as JSON:
{"summary":"...","strengthsAndImpact":"...","areasForGrowth":"...","strategicAlignment":"...","overallAssessment":"..."}`;

    try {
      const { streamText: aiStreamText } = await import("ai");
      const { getModel } = await import("@/lib/ai/providers");
      const { AI_CONFIG } = await import("@/lib/ai/config");

      const result = await aiStreamText({
        model: getModel(AI_CONFIG.defaultModels.anthropic),
        prompt,
      });

      let content = "";
      for await (const chunk of result.textStream) {
        content += chunk;
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { success: false, error: "Failed to parse AI-generated draft." };
      }

      const draft = JSON.parse(jsonMatch[0]);

      // Save to review
      await PerformanceReview.findByIdAndUpdate(params.reviewId, {
        $set: {
          "draft.summary": draft.summary || "",
          "draft.strengthsAndImpact": draft.strengthsAndImpact || "",
          "draft.areasForGrowth": draft.areasForGrowth || "",
          "draft.strategicAlignment": draft.strategicAlignment || "",
          "draft.overallAssessment": draft.overallAssessment || "",
          status: "draft_complete",
          currentStep: "draft",
        },
      });

      const workingDocPayload = {
        action: "update_working_document" as const,
        updates: {
          currentStep: "draft",
          draftSummary: draft.summary || "",
          draftStrengthsAndImpact: draft.strengthsAndImpact || "",
          draftAreasForGrowth: draft.areasForGrowth || "",
          draftStrategicAlignment: draft.strategicAlignment || "",
          draftOverallAssessment: draft.overallAssessment || "",
        },
      };

      return {
        success: true,
        message:
          "Draft review generated. The review covers strengths and impact, areas for growth, strategic alignment, and an overall assessment. Please review the draft — you can ask me to adjust any section, or proceed to finalize.",
        workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
      };
    } catch (error) {
      console.error("Error generating review draft:", error);
      return { success: false, error: "Failed to generate review draft." };
    }
  },
});

// ---------------------------------------------------------------------------
// Tool 8: Finalize Review
// ---------------------------------------------------------------------------

export const finalizeReviewTool = tool({
  description:
    "Finalize a performance review. Copies the draft (with any manager edits) to the final document and records manager signoff.",
  inputSchema: z.object({
    reviewId: z.string().describe("The performance review ID"),
    managerName: z.string().describe("Name of the manager finalizing the review"),
    summary: z.string().optional().describe("Edited summary (if changed from draft)"),
    strengthsAndImpact: z.string().optional().describe("Edited strengths (if changed from draft)"),
    areasForGrowth: z.string().optional().describe("Edited areas for growth (if changed from draft)"),
    strategicAlignment: z.string().optional().describe("Edited strategic alignment (if changed from draft)"),
    overallAssessment: z.string().optional().describe("Edited overall assessment (if changed from draft)"),
  }),
  execute: async (params) => {
    await connectDB();

    const review = await PerformanceReview.findById(params.reviewId);
    if (!review) {
      return { success: false, error: "Review not found." };
    }

    if (!review.draft?.summary) {
      return { success: false, error: "No draft exists yet. Generate a draft first." };
    }

    const finalDoc = {
      summary: params.summary || review.draft.summary,
      strengthsAndImpact: params.strengthsAndImpact || review.draft.strengthsAndImpact,
      areasForGrowth: params.areasForGrowth || review.draft.areasForGrowth,
      strategicAlignment: params.strategicAlignment || review.draft.strategicAlignment,
      overallAssessment: params.overallAssessment || review.draft.overallAssessment,
      managerSignoff: {
        at: new Date(),
        name: params.managerName,
      },
    };

    await PerformanceReview.findByIdAndUpdate(params.reviewId, {
      $set: {
        finalDocument: finalDoc,
        status: "finalized",
        currentStep: "finalize",
      },
    });

    const workingDocPayload = {
      action: "update_working_document" as const,
      updates: {
        currentStep: "finalize",
        finalSummary: finalDoc.summary,
        finalStrengthsAndImpact: finalDoc.strengthsAndImpact,
        finalAreasForGrowth: finalDoc.areasForGrowth,
        finalStrategicAlignment: finalDoc.strategicAlignment,
        finalOverallAssessment: finalDoc.overallAssessment,
      },
    };

    return {
      success: true,
      message:
        "Review finalized. You can download it as a PDF from the Reviews tab. Would you like me to suggest next-period goals based on this review?",
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 9: Recommend Next Goals
// ---------------------------------------------------------------------------

export const recommendNextGoalsTool = tool({
  description:
    "Generate next-period goal recommendations based on a finalized performance review and current company strategy. Call this after finalizing the review.",
  inputSchema: z.object({
    reviewId: z.string().describe("The performance review ID"),
  }),
  execute: async (params) => {
    await connectDB();

    const review = await PerformanceReview.findById(params.reviewId);
    if (!review) {
      return { success: false, error: "Review not found." };
    }

    if (review.status !== "finalized") {
      return { success: false, error: "Review must be finalized before generating goal recommendations." };
    }

    const foundation = (await CompanyFoundation.findOne({ status: "published" }).lean()) as Record<
      string,
      unknown
    > | null;
    const currentStrategyGoals = await StrategyGoal.find({
      status: { $in: ["draft", "on_track", "needs_attention"] },
    }).lean();

    const finalDoc = review.finalDocument;
    const prompt = `Based on this performance review, recommend 2-4 goals for the next period. Each goal should address gaps identified in the review or align with evolving company strategy.

## Review Summary
${finalDoc?.summary || "N/A"}

## Areas for Growth
${finalDoc?.areasForGrowth || "N/A"}

## Strategic Alignment
${finalDoc?.strategicAlignment || "N/A"}

## Company Foundation
Mission: ${(foundation?.mission as string) || "N/A"}
Values: ${(foundation?.values as string) || "N/A"}

## Current Strategy Goals
${currentStrategyGoals.map((sg) => `- ${sg.title} (${sg.horizon}): ${sg.description}`).join("\n") || "None defined"}

## Previous Goals
${(review.alignedGoals || []).map((g: { title: string; status: string }) => `- ${g.title} (${g.status})`).join("\n") || "None"}

## Instructions
Generate 2-4 goal recommendations. Each goal should:
- Have a clear, specific title
- Include a brief description (1-2 sentences)
- Map to a goal category (one of: productivity, quality, accuracy, efficiency, operational_excellence, customer_impact, communication, collaboration, conflict_resolution, decision_making, initiative, skill_development, certification, training_completion, leadership_growth, career_advancement)
- Specify an alignment type (mission, value, or priority)
- Include a rationale explaining why this goal matters now (1-2 sentences referencing the review or strategy)

Format as JSON array:
[{"title":"...","description":"...","category":"...","alignment":"...","rationale":"..."}]`;

    try {
      const { streamText: aiStreamText } = await import("ai");
      const { getModel } = await import("@/lib/ai/providers");
      const { AI_CONFIG } = await import("@/lib/ai/config");

      const result = await aiStreamText({
        model: getModel(AI_CONFIG.defaultModels.anthropic),
        prompt,
      });

      let content = "";
      for await (const chunk of result.textStream) {
        content += chunk;
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { success: false, error: "Failed to parse goal recommendations." };
      }

      const recommendations = JSON.parse(jsonMatch[0]);

      await PerformanceReview.findByIdAndUpdate(params.reviewId, {
        $set: {
          goalRecommendations: recommendations,
          currentStep: "goals",
        },
      });

      const workingDocPayload = {
        action: "update_working_document" as const,
        updates: {
          currentStep: "goals",
          goalRecommendations: recommendations,
        },
      };

      return {
        success: true,
        message: `Here are ${recommendations.length} goal recommendations for the next period based on the review and current strategy. You can create any of these goals now, or save them for later.`,
        workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
      };
    } catch (error) {
      console.error("Error generating goal recommendations:", error);
      return { success: false, error: "Failed to generate goal recommendations." };
    }
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
