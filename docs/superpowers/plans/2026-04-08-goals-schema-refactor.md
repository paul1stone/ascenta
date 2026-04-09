# Goals Schema & Creation Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the goals system from a flat 5-category model with single success metric to a structured key-results model with dual confirmation, strategy pillar linkage, and recalibration history.

**Architecture:** Evolutionary refactor of the existing Goal model in place. Clean break — all existing goal data is test/seed data. Schema changes propagate through constants, validation, API routes, AI tools, forms, and UI components in dependency order.

**Tech Stack:** Mongoose ODM, Zod validation, Next.js App Router API routes, React Hook Form, shadcn/ui components, Vercel AI SDK tools

**Spec:** `docs/superpowers/specs/2026-04-08-goals-schema-refactor-design.md`

---

### Task 1: Update Goal Constants

**Files:**
- Modify: `packages/db/src/goal-constants.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
/**
 * Goal Constants
 * Shared between client and server — no mongoose dependency.
 */

export const GOAL_TYPES = ["performance", "development"] as const;

export const GOAL_TYPE_LABELS: Record<(typeof GOAL_TYPES)[number], string> = {
  performance: "Performance Goal",
  development: "Development Goal",
};

export const GOAL_STATUSES = [
  "draft",
  "pending_confirmation",
  "active",
  "needs_attention",
  "blocked",
  "completed",
] as const;

export const GOAL_STATUS_LABELS: Record<
  (typeof GOAL_STATUSES)[number],
  string
> = {
  draft: "Draft",
  pending_confirmation: "Pending Confirmation",
  active: "Active",
  needs_attention: "Needs Attention",
  blocked: "Blocked",
  completed: "Completed",
};

export const KEY_RESULT_STATUSES = [
  "not_started",
  "in_progress",
  "achieved",
  "missed",
] as const;

export const KEY_RESULT_STATUS_LABELS: Record<
  (typeof KEY_RESULT_STATUSES)[number],
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  achieved: "Achieved",
  missed: "Missed",
};

export const CHECKIN_CADENCES = [
  "every_check_in",
  "monthly",
  "quarterly",
] as const;

export const CHECKIN_CADENCE_LABELS: Record<
  (typeof CHECKIN_CADENCES)[number],
  string
> = {
  every_check_in: "Every Check-in",
  monthly: "Monthly",
  quarterly: "Quarterly",
};
```

- [ ] **Step 2: Verify no TypeScript errors in the file**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Errors in downstream files that still import old exports (GOAL_CATEGORIES, MEASUREMENT_TYPES, etc.) — that's expected, we'll fix those in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/goal-constants.ts
git commit -m "refactor: replace goal constants with new types, statuses, and key result enums"
```

---

### Task 2: Rewrite Goal Schema

**Files:**
- Modify: `packages/db/src/goal-schema.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
/**
 * Goal Schema (Mongoose)
 * Supports structured key results, dual confirmation, and recalibration history.
 */

import mongoose, { Schema, Types } from "mongoose";
import {
  GOAL_TYPES,
  GOAL_STATUSES,
  KEY_RESULT_STATUSES,
  CHECKIN_CADENCES,
} from "./goal-constants";

// Re-export constants for consumers that import from goal-schema
export {
  GOAL_TYPES,
  GOAL_STATUSES,
  KEY_RESULT_STATUSES,
  CHECKIN_CADENCES,
} from "./goal-constants";

// ============================================================================
// SHARED
// ============================================================================

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

// ============================================================================
// SUB-SCHEMAS
// ============================================================================

const keyResultSchema = new Schema(
  {
    description: { type: String, required: true },
    metric: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: KEY_RESULT_STATUSES,
      default: "not_started",
    },
  },
  { _id: true },
);

const confirmationSchema = new Schema(
  {
    confirmed: { type: Boolean, default: false },
    at: { type: Date, default: null },
  },
  { _id: false },
);

const recalibrationSchema = new Schema(
  {
    recalibratedAt: { type: Date, required: true },
    reason: { type: String, required: true },
    previousSnapshot: { type: Schema.Types.Mixed, required: true },
    revisedFields: { type: Schema.Types.Mixed, required: true },
    revisedSupportAgreement: { type: String, default: null },
  },
  { _id: true },
);

// ============================================================================
// GOAL SCHEMA
// ============================================================================

const goalSchema = new Schema(
  {
    objectiveStatement: { type: String, required: true },
    goalType: {
      type: String,
      required: true,
      enum: GOAL_TYPES,
    },
    keyResults: {
      type: [keyResultSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length >= 2 && v.length <= 4,
        message: "Goals must have between 2 and 4 key results.",
      },
    },
    strategyGoalId: {
      type: Schema.Types.ObjectId,
      ref: "StrategyGoal",
      default: null,
      index: true,
    },
    teamGoalId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    supportAgreement: { type: String, default: "" },
    checkInCadence: {
      type: String,
      required: true,
      enum: CHECKIN_CADENCES,
      default: "every_check_in",
    },
    timePeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: GOAL_STATUSES,
      default: "draft",
      index: true,
    },
    employeeConfirmed: {
      type: confirmationSchema,
      default: () => ({ confirmed: false, at: null }),
    },
    managerConfirmed: {
      type: confirmationSchema,
      default: () => ({ confirmed: false, at: null }),
    },
    recalibrations: {
      type: [recalibrationSchema],
      default: [],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    locked: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

// Compound indexes
goalSchema.index({ owner: 1, status: 1 });
goalSchema.index({ manager: 1, status: 1 });
goalSchema.index({ "timePeriod.end": 1 });

export const Goal =
  mongoose.models.Goal || mongoose.model("Goal", goalSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type KeyResult = {
  id: string;
  description: string;
  metric: string;
  deadline: Date;
  status: (typeof KEY_RESULT_STATUSES)[number];
};

export type Confirmation = {
  confirmed: boolean;
  at: Date | null;
};

export type Recalibration = {
  id: string;
  recalibratedAt: Date;
  reason: string;
  previousSnapshot: Record<string, unknown>;
  revisedFields: Record<string, unknown>;
  revisedSupportAgreement: string | null;
};

export type Goal_Type = {
  id: string;
  objectiveStatement: string;
  goalType: (typeof GOAL_TYPES)[number];
  keyResults: KeyResult[];
  strategyGoalId: string | Types.ObjectId | null;
  teamGoalId: string | Types.ObjectId | null;
  supportAgreement: string;
  checkInCadence: (typeof CHECKIN_CADENCES)[number];
  timePeriod: { start: Date; end: Date };
  status: (typeof GOAL_STATUSES)[number];
  employeeConfirmed: Confirmation;
  managerConfirmed: Confirmation;
  recalibrations: Recalibration[];
  owner: string | Types.ObjectId;
  manager: string | Types.ObjectId;
  locked: boolean;
  notes: string;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

- [ ] **Step 2: Verify the schema file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "goal-schema" | head -5`
Expected: No errors from goal-schema.ts itself. Downstream consumers will error until fixed.

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/goal-schema.ts
git commit -m "refactor: rewrite goal schema with key results, dual confirmation, and recalibration"
```

---

### Task 3: Update Zod Validation Schema

**Files:**
- Modify: `apps/platform/src/lib/validations/goal.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
import { z } from "zod";
import {
  GOAL_TYPES,
  CHECKIN_CADENCES,
} from "@ascenta/db/goal-constants";

const TIME_PERIODS = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "H1",
  "H2",
  "annual",
  "custom",
] as const;

// Soft warning: common activity verbs that suggest task-like (not outcome-like) wording
const ACTIVITY_VERBS = ["try", "help", "support", "participate", "assist", "attend", "contribute"];

export function getObjectiveWarning(text: string): string | null {
  const words = text.trim().split(/\s+/);
  if (words.length < 15) return null; // Only warn if enough words to evaluate
  const firstWord = words[0]?.toLowerCase();
  if (ACTIVITY_VERBS.includes(firstWord ?? "")) {
    const hasPurpose = /so that|in order to/i.test(text);
    if (!hasPurpose) {
      return "This reads like a task. Try framing it as an outcome with a \"so that\" connection.";
    }
  }
  return null;
}

const keyResultSchema = z.object({
  description: z.string().min(1, "Description is required"),
  metric: z.string().min(1, "Measurable target is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

export const goalFormSchema = z
  .object({
    employeeName: z.string().min(1, "Employee name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    objectiveStatement: z
      .string()
      .min(1, "Objective statement is required")
      .refine(
        (val) => val.trim().split(/\s+/).length >= 15,
        { message: "Objective statement must be at least 15 words" },
      ),
    goalType: z.enum(GOAL_TYPES, { message: "Goal type is required" }),
    keyResults: z
      .array(keyResultSchema)
      .min(2, "At least 2 key results are required")
      .max(4, "No more than 4 key results allowed"),
    strategyGoalId: z.string().optional(),
    strategyGoalTitle: z.string().optional(),
    teamGoalId: z.string().optional(),
    supportAgreement: z.string().optional(),
    timePeriod: z.enum(TIME_PERIODS, { message: "Time period is required" }),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
    checkInCadence: z.enum(CHECKIN_CADENCES, {
      message: "Check-in cadence is required",
    }),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.timePeriod === "custom") {
        return !!data.customStartDate && !!data.customEndDate;
      }
      return true;
    },
    {
      message:
        "Custom start date and end date are required when time period is custom",
      path: ["customStartDate"],
    },
  );

export type GoalFormValues = z.infer<typeof goalFormSchema>;
```

- [ ] **Step 2: Verify the validation file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "validations/goal" | head -5`
Expected: No errors from this file.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/validations/goal.ts
git commit -m "refactor: update goal Zod schema with key results, objective statement, and goal types"
```

---

### Task 4: Update Goal API Routes

**Files:**
- Modify: `apps/platform/src/app/api/grow/goals/route.ts`

- [ ] **Step 1: Rewrite the API route file**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { logAuditEvent } from "@/lib/workflows";
import { parseTimePeriod } from "@/lib/ai/grow-tools";
import { goalFormSchema } from "@/lib/validations/goal";

// ============================================================================
// GET — Fetch goals for an employee
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId query parameter is required" },
        { status: 400 },
      );
    }

    const goals = await Goal.find({ owner: employeeId })
      .sort({ createdAt: -1 })
      .lean();

    // Look up the most recent check-in date for each goal
    const goalIds = goals.map((g) => g._id);
    const latestCheckIns = await CheckIn.aggregate([
      { $match: { goalIds: { $in: goalIds } } },
      { $unwind: "$goalIds" },
      { $match: { goalIds: { $in: goalIds } } },
      { $group: { _id: "$goalIds", lastCheckInDate: { $max: "$createdAt" } } },
    ]);
    const checkInMap = new Map(
      latestCheckIns.map((c: { _id: unknown; lastCheckInDate: Date }) => [
        String(c._id),
        c.lastCheckInDate,
      ]),
    );

    const transformed = goals.map((g: Record<string, unknown>) => ({
      ...g,
      id: String(g._id),
      lastCheckInDate: checkInMap.get(String(g._id)) ?? null,
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, goals: transformed });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow goals GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch goals" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST — Create a new goal
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { runId, createdByRole, ...formData } = body;
    const effectiveRunId = runId || crypto.randomUUID();

    const parsed = goalFormSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Support both MongoDB ObjectId and EMP-style employee IDs
    let employee = await getEmployeeByEmployeeId(data.employeeId);
    if (!employee && data.employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      const doc = await Employee.findById(data.employeeId);
      if (doc) {
        employee = {
          id: String(doc._id),
          employeeId: doc.employeeId,
        } as unknown as typeof employee;
      }
    }
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    const timePeriod = parseTimePeriod(
      data.timePeriod,
      data.customStartDate,
      data.customEndDate,
    );

    // Key results: set initial status to not_started, parse deadline strings to Dates
    const keyResults = data.keyResults.map((kr) => ({
      description: kr.description,
      metric: kr.metric,
      deadline: new Date(kr.deadline),
      status: "not_started" as const,
    }));

    const isManagerOrHR =
      createdByRole === "hr" || createdByRole === "manager";

    const goal = await Goal.create({
      objectiveStatement: data.objectiveStatement,
      goalType: data.goalType,
      keyResults,
      strategyGoalId: data.strategyGoalId || null,
      teamGoalId: data.teamGoalId || null,
      supportAgreement: data.supportAgreement || "",
      checkInCadence: data.checkInCadence,
      timePeriod,
      notes: data.notes || "",
      status: isManagerOrHR ? "pending_confirmation" : "draft",
      managerConfirmed: isManagerOrHR
        ? { confirmed: true, at: new Date() }
        : { confirmed: false, at: null },
      employeeConfirmed: { confirmed: false, at: null },
      owner: employee.id,
      manager: employee.id,
      workflowRunId: effectiveRunId,
    });

    const goalObj = goal.toJSON() as Record<string, unknown>;
    const goalId = goalObj.id as string;

    if (runId) {
      await WorkflowRun.findByIdAndUpdate(runId, {
        $set: {
          status: "completed",
          currentStep: "completed",
          completedAt: new Date(),
        },
      });
    }

    await logAuditEvent({
      workflowRunId: effectiveRunId,
      actorId: "system",
      actorType: "system",
      action: "approved",
      description: `Goal created. Record ID: ${goalId}`,
      workflowVersion: 1,
      metadata: { recordId: goalId, recordType: "goal" },
    });

    return NextResponse.json({
      success: true,
      message: `Goal saved successfully for ${data.employeeName}.`,
      goalId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow goals API error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create goal" },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH — Goal actions (confirm, request_changes, update_status, recalibrate)
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { goalId, action } = body;

    if (!goalId || !action) {
      return NextResponse.json(
        { success: false, error: "goalId and action are required" },
        { status: 400 },
      );
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 },
      );
    }

    // --- Confirm ---
    if (action === "confirm") {
      const { role } = body as { role: "employee" | "manager" };
      if (!role || !["employee", "manager"].includes(role)) {
        return NextResponse.json(
          { success: false, error: "role must be 'employee' or 'manager'" },
          { status: 400 },
        );
      }

      const confirmField =
        role === "employee" ? "employeeConfirmed" : "managerConfirmed";
      goal[confirmField] = { confirmed: true, at: new Date() };

      // Auto-activate if both confirmed and strategy pillar is set
      const otherField =
        role === "employee" ? "managerConfirmed" : "employeeConfirmed";
      const bothConfirmed =
        goal[confirmField].confirmed && goal[otherField]?.confirmed;

      if (bothConfirmed && goal.strategyGoalId) {
        goal.status = "active";
      } else if (goal.status === "draft") {
        goal.status = "pending_confirmation";
      }

      await goal.save();

      return NextResponse.json({
        success: true,
        message:
          goal.status === "active"
            ? "Goal activated — both parties confirmed."
            : `${role === "employee" ? "Employee" : "Manager"} confirmation recorded.`,
        status: goal.status,
      });
    }

    // --- Request changes ---
    if (action === "request_changes") {
      goal.status = "draft";
      goal.employeeConfirmed = { confirmed: false, at: null };
      goal.managerConfirmed = { confirmed: false, at: null };
      await goal.save();

      return NextResponse.json({
        success: true,
        message: "Changes requested. Goal returned to draft.",
      });
    }

    // --- Update status ---
    if (action === "update_status") {
      const { status } = body as { status: string };
      const allowedStatuses = ["needs_attention", "blocked", "completed"];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `status must be one of: ${allowedStatuses.join(", ")}`,
          },
          { status: 400 },
        );
      }

      goal.status = status;
      await goal.save();

      return NextResponse.json({
        success: true,
        message: `Goal status updated to ${status}.`,
      });
    }

    // --- Recalibrate ---
    if (action === "recalibrate") {
      const { reason, revisedFields, revisedSupportAgreement } = body as {
        reason: string;
        revisedFields: Record<string, unknown>;
        revisedSupportAgreement?: string;
      };

      if (!reason || !revisedFields) {
        return NextResponse.json(
          { success: false, error: "reason and revisedFields are required" },
          { status: 400 },
        );
      }

      // Snapshot current state
      const snapshot: Record<string, unknown> = {
        objectiveStatement: goal.objectiveStatement,
        goalType: goal.goalType,
        keyResults: goal.keyResults?.map((kr: Record<string, unknown>) => ({
          description: kr.description,
          metric: kr.metric,
          deadline: kr.deadline,
          status: kr.status,
        })),
        supportAgreement: goal.supportAgreement,
        strategyGoalId: goal.strategyGoalId,
      };

      goal.recalibrations.push({
        recalibratedAt: new Date(),
        reason,
        previousSnapshot: snapshot,
        revisedFields,
        revisedSupportAgreement: revisedSupportAgreement || null,
      });

      // Apply revised fields
      for (const [key, value] of Object.entries(revisedFields)) {
        if (key in goal.schema.paths) {
          (goal as Record<string, unknown>)[key] = value;
        }
      }

      if (revisedSupportAgreement !== undefined) {
        goal.supportAgreement = revisedSupportAgreement;
      }

      // Reset confirmations
      goal.status = "pending_confirmation";
      goal.employeeConfirmed = { confirmed: false, at: null };
      goal.managerConfirmed = { confirmed: false, at: null };
      await goal.save();

      return NextResponse.json({
        success: true,
        message: "Goal recalibrated. Both parties must re-confirm.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow goals PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update goal" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify the route compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "api/grow/goals" | head -5`
Expected: No errors from this file.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/grow/goals/route.ts
git commit -m "refactor: update goals API with confirm, recalibrate, update_status actions"
```

---

### Task 5: Update Status Dashboard API

**Files:**
- Modify: `apps/platform/src/app/api/grow/status/route.ts`

- [ ] **Step 1: Update the status aggregation logic**

In the `GET` handler, update the goals query to use new statuses. Replace the `goals` query filter:

Change `status: { $ne: "completed" }` to remain the same (still correct).

Update the `employeeSummaries` map function to use new status values. Replace the `goalsByStatus` and `overallStatus` computation:

```typescript
// In the employeeSummaries map callback, replace goalsByStatus and overallStatus:
      const goalsByStatus = {
        active: empGoals.filter((g) => g.status === "active").length,
        needs_attention: empGoals.filter((g) => g.status === "needs_attention").length,
        blocked: empGoals.filter((g) => g.status === "blocked").length,
        draft: empGoals.filter((g) => g.status === "draft").length,
        pending_confirmation: empGoals.filter((g) => g.status === "pending_confirmation").length,
      };

      const hasBlocked = empGoals.some((g) => g.status === "blocked");
      const hasNeedsAttention = empGoals.some((g) => g.status === "needs_attention");
      const overallStatus = hasBlocked
        ? "blocked"
        : hasNeedsAttention
          ? "needs_attention"
          : "active";

      // Add goal type balance
      const performanceGoals = empGoals.filter((g) => g.goalType === "performance").length;
      const developmentGoals = empGoals.filter((g) => g.goalType === "development").length;
```

Then update the return object for each employee to include `goalTypeBalance` and `pendingConfirmation`:

```typescript
      return {
        id: empId,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        jobTitle: emp.jobTitle,
        goalCount: empGoals.length,
        goalsByStatus,
        overallStatus,
        goalTypeBalance: { performance: performanceGoals, development: developmentGoals },
        hasDevelopmentGoal: developmentGoals > 0,
        pendingConfirmation: goalsByStatus.pending_confirmation,
        checkInCompletion7d: totalLast7 > 0 ? completedLast7 / totalLast7 : null,
        checkInCompletion30d: totalLast30 > 0 ? completedLast30 / totalLast30 : null,
        overdueCheckIns: empOverdue.length,
      };
```

Update the top-level aggregates to include new counts:

```typescript
    // After employeeSummaries, add:
    const pendingConfirmationCount = goals.filter(
      (g) => g.status === "pending_confirmation",
    ).length;
    const blockedCount = goals.filter((g) => g.status === "blocked").length;
    const performanceCount = goals.filter(
      (g) => (g as Record<string, unknown>).goalType === "performance",
    ).length;
    const developmentCount = goals.filter(
      (g) => (g as Record<string, unknown>).goalType === "development",
    ).length;
```

Update the response JSON aggregates:

```typescript
      aggregates: {
        directReportsCount: directReports.length,
        activeGoalsCount: totalGoals,
        pendingConfirmationCount,
        blockedCount,
        goalTypeBalance: { performance: performanceCount, development: developmentCount },
        checkInCompletion7d: totalCheckIns7 > 0 ? totalCompleted7 / totalCheckIns7 : 0,
        overdueCheckIns: overdueCheckIns.length,
      },
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "api/grow/status" | head -5`
Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/grow/status/route.ts
git commit -m "refactor: update status dashboard API with new goal statuses and type balance"
```

---

### Task 6: Update AI Tools — Goal Workflow & Document

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`

- [ ] **Step 1: Update `startGoalWorkflowTool` description and step instructions**

Replace the tool description string (lines ~152-178) to reference new field names. Update step 2 to present only 2 goal types (Performance, Development). Update step 4 to collect 2-4 key results instead of a single success metric, and to discuss support agreement.

In the description, change:
```
**Step 2 — Department and team focus:**
Present the employee's department strategy goals (if any). Ask which one this goal aligns to (or none). Then ask goal type as a numbered list:
1. Performance
2. Development
3. Culture
4. Compliance
5. Operational
```

To:
```
**Step 2 — Department and team focus:**
Present the employee's department strategy goals (if any). Ask which one this goal aligns to (or none). Then ask goal type:
1. Performance Goal (delivering results in current role)
2. Development Goal (building capability for the future)
```

And update step 3 to say "Draft an objective statement (one sentence, outcome-focused, min 15 words)" instead of "Draft a goal title and description."

Update step 4:
```
**Step 4 — Key results and support:**
Based on the objective, suggest 2-4 key results. Each key result needs: what will be measured, the measurable target, and a deadline. Ask user to pick or customize. Discuss time period. Ask what support the manager can provide (resources, access, time, coaching). Then call openGoalDocument with all fields.
```

Also update the rule about resources/blockers: remove it since support agreement IS now persisted.

- [ ] **Step 2: Update `openGoalDocumentTool` input schema**

Replace the inputSchema:

```typescript
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
```

- [ ] **Step 3: Update the `execute` function's `prefilled` keys**

Replace the prefilled keys loop:

```typescript
    const prefilled: Record<string, unknown> = {};
    for (const key of [
      "employeeName", "employeeId", "objectiveStatement", "goalType",
      "keyResults", "strategyGoalId", "strategyGoalTitle", "teamGoalId",
      "supportAgreement", "timePeriod", "checkInCadence", "notes",
    ] as const) {
      if (params[key] !== undefined) prefilled[key] = params[key];
    }
```

- [ ] **Step 4: Update `updateWorkingDocumentTool`**

Find the `updateWorkingDocumentTool` in the file. Update its input schema properties to match new field names. Replace old field names (`title`, `description`, `category`, `measurementType`, `successMetric`) with new ones (`objectiveStatement`, `goalType`, `keyResults`, `supportAgreement`). The tool's execute function should remain the same pattern — it just passes updates to the frontend.

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "grow-tools" | head -10`
Expected: Clean (or only downstream errors from UI components).

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts
git commit -m "refactor: update goal AI tools with key results, goal types, and support agreement"
```

---

### Task 7: Add Goal Recommendations Block

**Files:**
- Modify: `apps/platform/src/lib/ai/workflow-constants.ts`
- Modify: `apps/platform/src/components/chat/workflow-blocks.tsx`

- [ ] **Step 1: Add new delimiter constants**

In `apps/platform/src/lib/ai/workflow-constants.ts`, add:

```typescript
export const GOAL_RECS_PREFIX = "[ASCENTA_GOAL_RECOMMENDATIONS]";
export const GOAL_RECS_SUFFIX = "[/ASCENTA_GOAL_RECOMMENDATIONS]";
```

- [ ] **Step 2: Add the GoalRecommendation type and parsing to workflow-blocks.tsx**

Add the import for the new constants:

```typescript
import {
  FIELD_PROMPT_PREFIX,
  FIELD_PROMPT_SUFFIX,
  FOLLOW_UP_PREFIX,
  FOLLOW_UP_SUFFIX,
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
  GOAL_RECS_PREFIX,
  GOAL_RECS_SUFFIX,
} from "@/lib/ai/workflow-constants";
```

Add the new interface after `WorkingDocData`:

```typescript
export interface GoalRecommendation {
  objectiveStatement: string;
  goalType: "performance" | "development";
  keyResults: { description: string; metric: string; deadline: string }[];
  strategyGoalId?: string;
  strategyGoalTitle?: string;
}

export interface GoalRecommendationsData {
  employeeId: string;
  employeeName: string;
  recommendations: GoalRecommendation[];
}
```

Update `ParsedContent` to include `goalRecommendations`:

```typescript
export interface ParsedContent {
  text: string;
  fieldPrompt: FieldPromptData | null;
  followUp: FollowUpData | null;
  workingDoc: WorkingDocData | null;
  goalRecommendations: GoalRecommendationsData | null;
}
```

Add parsing for the new block in `parseWorkflowBlocks`, before the return:

```typescript
  let goalRecommendations: GoalRecommendationsData | null = null;

  const goalRecsMatch = content.match(
    new RegExp(
      `${escapeRegex(GOAL_RECS_PREFIX)}([\\s\\S]*?)${escapeRegex(GOAL_RECS_SUFFIX)}`
    )
  );
  if (goalRecsMatch) {
    try {
      goalRecommendations = JSON.parse(goalRecsMatch[1].trim()) as GoalRecommendationsData;
      text = text.replace(goalRecsMatch[0], "").trim();
    } catch {
      // Invalid JSON, leave in text
    }
  }

  return { text, fieldPrompt, followUp, workingDoc, goalRecommendations };
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "workflow-blocks\|workflow-constants" | head -10`
Expected: Possibly errors in consumers of `ParsedContent` that don't destructure `goalRecommendations` — those get fixed in UI tasks.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/ai/workflow-constants.ts apps/platform/src/components/chat/workflow-blocks.tsx
git commit -m "feat: add goal recommendations block type for multi-select goal suggestions"
```

---

### Task 8: Update Goal Creation Form

**Files:**
- Modify: `apps/platform/src/components/grow/forms/goal-creation-form.tsx`

- [ ] **Step 1: Rewrite the form component**

Replace the entire file. The new form has: objective statement (textarea with word count), goal type (radio), key results (repeatable 2-4 rows), strategy pillar dropdown, team goal dropdown, support agreement, check-in cadence, time period, and notes.

```typescript
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import {
  goalFormSchema,
  getObjectiveWarning,
  type GoalFormValues,
} from "@/lib/validations/goal";
import {
  GOAL_TYPE_LABELS,
  CHECKIN_CADENCE_LABELS,
} from "@ascenta/db/goal-constants";
import { User, Plus, Trash2 } from "lucide-react";
import { EmployeePicker } from "./employee-picker";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const GOAL_TYPE_OPTIONS = Object.entries(GOAL_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const TIME_PERIOD_OPTIONS = [
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
  { value: "H1", label: "H1" },
  { value: "H2", label: "H2" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
] as const;

const CADENCE_OPTIONS = Object.entries(CHECKIN_CADENCE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GoalCreationFormProps {
  initialValues: Partial<GoalFormValues>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  strategyGoals?: { id: string; title: string; horizon: string }[];
}

export function GoalCreationForm({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
  strategyGoals = [],
}: GoalCreationFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      objectiveStatement: "",
      goalType: undefined,
      keyResults: [
        { description: "", metric: "", deadline: "" },
        { description: "", metric: "", deadline: "" },
      ],
      strategyGoalId: "",
      strategyGoalTitle: "",
      teamGoalId: "",
      supportAgreement: "",
      timePeriod: undefined,
      customStartDate: "",
      customEndDate: "",
      checkInCadence: "every_check_in",
      notes: "",
      ...initialValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keyResults",
  });

  const timePeriod = watch("timePeriod");
  const objectiveStatement = watch("objectiveStatement");
  const [objectiveWarning, setObjectiveWarning] = useState<string | null>(null);

  // Objective statement soft warning
  useEffect(() => {
    setObjectiveWarning(getObjectiveWarning(objectiveStatement || ""));
  }, [objectiveStatement]);

  // Word count
  const wordCount = (objectiveStatement || "").trim().split(/\s+/).filter(Boolean).length;

  // Sync every field change back to the chat context
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name) {
        onFieldChange(name, values[name as keyof GoalFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFieldChange]);

  const handleFormSubmit = form.handleSubmit(async () => {
    await onSubmit();
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Employee: picker for direct-open, read-only banner for AI-initiated */}
      {watch("employeeId") ? (
        <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
          <User className="size-4 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium">
              {watch("employeeName") || "Employee"}
            </span>
            <span className="ml-2 text-muted-foreground">
              ({watch("employeeId")})
            </span>
          </div>
        </div>
      ) : (
        <EmployeePicker
          onSelect={(employeeId, employeeName) => {
            setValue("employeeId", employeeId, { shouldValidate: true });
            setValue("employeeName", employeeName, { shouldValidate: true });
            onFieldChange("employeeId", employeeId);
            onFieldChange("employeeName", employeeName);
          }}
        />
      )}

      {/* Objective Statement */}
      <div className="space-y-1.5">
        <Label htmlFor="objectiveStatement">
          Objective Statement <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="objectiveStatement"
          rows={3}
          placeholder="One sentence naming the outcome and why it matters (min 15 words)"
          {...register("objectiveStatement")}
        />
        <div className="flex items-center justify-between">
          <div>
            {errors.objectiveStatement && (
              <p className="text-xs text-destructive">
                {errors.objectiveStatement.message}
              </p>
            )}
            {objectiveWarning && !errors.objectiveStatement && (
              <p className="text-xs text-amber-600">{objectiveWarning}</p>
            )}
          </div>
          <p className={`text-xs ${wordCount < 15 ? "text-muted-foreground" : "text-emerald-600"}`}>
            {wordCount} / 15 words
          </p>
        </div>
      </div>

      {/* Goal Type */}
      <div className="space-y-1.5">
        <Label>
          Goal Type <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-3">
          {GOAL_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                watch("goalType") === opt.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                checked={watch("goalType") === opt.value}
                onChange={() => {
                  setValue("goalType", opt.value as GoalFormValues["goalType"], {
                    shouldValidate: true,
                  });
                }}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {errors.goalType && (
          <p className="text-xs text-destructive">{errors.goalType.message}</p>
        )}
      </div>

      {/* Key Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>
            Key Results <span className="text-destructive">*</span>
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (2-4 required)
            </span>
          </Label>
          {fields.length < 4 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                append({ description: "", metric: "", deadline: "" })
              }
            >
              <Plus className="mr-1 size-3" />
              Add
            </Button>
          )}
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-2 rounded-lg border bg-muted/30 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Key Result {index + 1}
              </span>
              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
            <Input
              placeholder="What will be measured"
              {...register(`keyResults.${index}.description`)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Measurable target"
                {...register(`keyResults.${index}.metric`)}
              />
              <Input
                type="date"
                {...register(`keyResults.${index}.deadline`)}
              />
            </div>
            {errors.keyResults?.[index] && (
              <p className="text-xs text-destructive">
                {errors.keyResults[index]?.description?.message ||
                  errors.keyResults[index]?.metric?.message ||
                  errors.keyResults[index]?.deadline?.message}
              </p>
            )}
          </div>
        ))}
        {errors.keyResults?.root && (
          <p className="text-xs text-destructive">
            {errors.keyResults.root.message}
          </p>
        )}
      </div>

      {/* Strategy Pillar Link */}
      {strategyGoals.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="strategyGoalId">
            Strategy Pillar
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (required before activation)
            </span>
          </Label>
          <Select
            value={watch("strategyGoalId") ?? ""}
            onValueChange={(v: string) => {
              setValue("strategyGoalId", v, { shouldValidate: true });
              const matched = strategyGoals.find((g) => g.id === v);
              if (matched) {
                setValue("strategyGoalTitle", matched.title);
              }
            }}
          >
            <SelectTrigger id="strategyGoalId">
              <SelectValue placeholder="Link to a strategy pillar" />
            </SelectTrigger>
            <SelectContent>
              {strategyGoals.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title} ({g.horizon})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Support Agreement */}
      <div className="space-y-1.5">
        <Label htmlFor="supportAgreement">
          Support Agreement
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </Label>
        <Textarea
          id="supportAgreement"
          rows={2}
          placeholder="What will the manager provide? (resources, access, time, coaching)"
          {...register("supportAgreement")}
        />
      </div>

      {/* Time Period */}
      <div className="space-y-1.5">
        <Label htmlFor="timePeriod">
          Time Period <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("timePeriod") ?? ""}
          onValueChange={(v: string) =>
            setValue("timePeriod", v as GoalFormValues["timePeriod"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="timePeriod">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {TIME_PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timePeriod && (
          <p className="text-xs text-destructive">
            {errors.timePeriod.message}
          </p>
        )}
      </div>

      {/* Custom date fields */}
      {timePeriod === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="customStartDate">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customStartDate"
              type="date"
              {...register("customStartDate")}
            />
            {errors.customStartDate && (
              <p className="text-xs text-destructive">
                {errors.customStartDate.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customEndDate">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customEndDate"
              type="date"
              {...register("customEndDate")}
            />
            {errors.customEndDate && (
              <p className="text-xs text-destructive">
                {errors.customEndDate.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Check-in Cadence */}
      <div className="space-y-1.5">
        <Label htmlFor="checkInCadence">Check-in Cadence</Label>
        <Select
          value={watch("checkInCadence") ?? "every_check_in"}
          onValueChange={(v: string) =>
            setValue("checkInCadence", v as GoalFormValues["checkInCadence"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="checkInCadence">
            <SelectValue placeholder="Select cadence" />
          </SelectTrigger>
          <SelectContent>
            {CADENCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Any additional context"
          {...register("notes")}
        />
      </div>

      {/* Submit/cancel */}
      <div className="flex items-center justify-end gap-2 border-t pt-4 mt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Goal"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "goal-creation-form" | head -5`
Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/forms/goal-creation-form.tsx
git commit -m "refactor: rewrite goal creation form with key results, goal type toggle, and support agreement"
```

---

### Task 9: Update GoalsPanel

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`

- [ ] **Step 1: Update imports and status references**

Replace imports of old constants (`GOAL_CATEGORY_LABELS`, `GOAL_STATUSES`) with new ones (`GOAL_TYPE_LABELS`, `GOAL_STATUS_LABELS`, `KEY_RESULT_STATUS_LABELS`). Update from `@ascenta/db/goal-constants`.

- [ ] **Step 2: Update tab groupings**

Replace the existing tab/filter logic that groups by `pending_review`, `on_track`, `needs_attention`, `off_track`, `completed` with the new groups:

- "Draft" tab: `status === "draft"`
- "Pending Confirmation" tab: `status === "pending_confirmation"`
- "Active" tab: `status in ["active", "needs_attention", "blocked"]`
- "Completed" tab: `status === "completed"`

- [ ] **Step 3: Update goal row display**

Replace references to `goal.title` with `goal.objectiveStatement`. Replace category badge with goal type badge (`goal.goalType`). Replace `goal.successMetric` display with key results count/progress (e.g., `"2/3 achieved"` computed from `goal.keyResults`). Add strategy pillar name display if `goal.strategyGoalId` is set. Add dual confirmation indicators.

- [ ] **Step 4: Update action buttons**

Replace "Approve" button with "Confirm" button that sends `{ action: "confirm", role: "manager" }` or `{ action: "confirm", role: "employee" }` based on current user context. Keep "Request Changes" sending `{ action: "request_changes" }`. Add status update dropdown for active goals (needs_attention, blocked, completed). Add recalibrate button that opens a modal/dialog with reason field and revised fields.

- [ ] **Step 5: Add goal type balance warning**

After the employee selector / before the goals table, add a banner that shows when the employee has zero development goals:

```tsx
{goals.length > 0 && !goals.some((g) => g.goalType === "development") && (
  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
    Consider adding a development goal for this period.
  </div>
)}
```

- [ ] **Step 6: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "goals-panel" | head -10`
Expected: Clean.

- [ ] **Step 7: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "refactor: update goals panel with new tabs, dual confirmation, and key results display"
```

---

### Task 10: Update GoalCard

**Files:**
- Modify: `apps/platform/src/components/grow/goal-card.tsx`

- [ ] **Step 1: Update the card to display new fields**

Replace `goal.title`/`goal.description` references with `goal.objectiveStatement`. Replace category display with goal type badge. Add a key results mini-checklist showing each KR's description, metric, deadline, and status indicator (checkmark for achieved, circle for in_progress, dash for not_started, X for missed). Show strategy pillar as a tag if set. Add dual confirmation indicators (two checkmarks with labels: Employee, Manager).

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "goal-card" | head -5`
Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/goal-card.tsx
git commit -m "refactor: update goal card with key results checklist and dual confirmation"
```

---

### Task 11: Update PerformanceGoalForm (Direct Modal)

**Files:**
- Modify: `apps/platform/src/components/grow/performance-goal-form.tsx`

- [ ] **Step 1: Update to use new form fields**

This is the direct (non-Compass) goal creation modal. Update it to use the same field set as `GoalCreationForm`: objective statement, goal type, key results (2-4), strategy pillar, support agreement, check-in cadence, time period. Remove old fields (title, description, category, measurementType, successMetric).

If the form is structurally very similar to `GoalCreationForm` after the update, consider extracting a shared `GoalFormFields` component that both forms use, or simply have this component import and render `GoalCreationForm` with appropriate props.

- [ ] **Step 2: Update the submit handler**

Update the API payload to match new field names. The POST to `/api/grow/goals` now expects: `objectiveStatement`, `goalType`, `keyResults`, `strategyGoalId`, `supportAgreement`, `checkInCadence`, `timePeriod`.

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "performance-goal-form" | head -5`
Expected: Clean.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/performance-goal-form.tsx
git commit -m "refactor: update direct goal form with new schema fields"
```

---

### Task 12: Update StatusDashboard Component

**Files:**
- Modify: `apps/platform/src/components/grow/status-dashboard.tsx`

- [ ] **Step 1: Update stat cards**

Replace the 4 stat cards with: Active Goals, Pending Confirmation, Goal Type Balance (show performance/development counts), Blocked Goals. Remove `off_track` references.

- [ ] **Step 2: Update per-employee table**

Update the employee row to show: `pendingConfirmation` count, `hasDevelopmentGoal` indicator (flag if false), updated status dots using new status values.

Replace `goalStatus.off_track` column with `goalStatus.blocked`. Add `goalStatus.pending_confirmation` and `goalStatus.draft` if desired.

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "status-dashboard" | head -5`
Expected: Clean.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/status-dashboard.tsx
git commit -m "refactor: update status dashboard with new goal statuses and type balance"
```

---

### Task 13: Update Workflow Definition

**Files:**
- Modify: `apps/platform/src/lib/workflows/definitions/create-goal.ts`

- [ ] **Step 1: Update intake fields**

Replace the intake fields to match new schema:

- Remove: `title`, `description`, `category` (17-option), `measurementType`, `successMetric`, `alignment`
- Add/update:
  - `objectiveStatement` (textarea, required, placeholder: "One sentence naming the outcome and why it matters")
  - `goalType` (dropdown: performance, development)
  - `keyResults` (keep as a conceptual field — the actual collection happens via the form, but the workflow definition should reference it for completeness)
  - `strategyGoalId` (dropdown, populated dynamically)
  - `supportAgreement` (textarea, optional)
- Keep: `employeeName`, `employeeId`, `timePeriod`, `customStartDate`, `customEndDate`, `checkInCadence`

Update cadence options from `["monthly", "quarterly", "milestone", "manager_scheduled"]` to `["every_check_in", "monthly", "quarterly"]`.

- [ ] **Step 2: Update guardrails**

Replace `missing-success-metric` guardrail with a guardrail that checks for `objectiveStatement` being present. Keep `missing-time-period`.

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "create-goal" | head -5`
Expected: Clean.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/workflows/definitions/create-goal.ts
git commit -m "refactor: update create-goal workflow definition with new intake fields"
```

---

### Task 14: Update Seed Script

**Files:**
- Modify: `scripts/seed-grow.ts`

- [ ] **Step 1: Update goal seed data**

Replace the `goalDefs` array with goals using the new schema. Each goal needs: `objectiveStatement`, `goalType`, `keyResults` (2-4 items with description, metric, deadline, status), `checkInCadence` (new values), `status` (new values), `employeeConfirmed`, `managerConfirmed`. Remove old fields (`title`, `description`, `category`, `measurementType`, `successMetric`, `alignment`, `managerApproved`).

Example replacement for the first goal:

```typescript
    {
      objectiveStatement:
        "Reduce average customer support ticket resolution time from 4.2 hours to under 3.4 hours by streamlining the triage process and implementing auto-categorization so that customer satisfaction improves and support capacity scales with growth.",
      goalType: "performance" as const,
      keyResults: [
        {
          description: "Average resolution time consistently below target",
          metric: "Under 3.4 hours for 30 consecutive days",
          deadline: daysFromNow(60),
          status: "in_progress" as const,
        },
        {
          description: "Auto-categorization coverage",
          metric: "60% of incoming tickets auto-categorized accurately",
          deadline: daysFromNow(30),
          status: "achieved" as const,
        },
        {
          description: "Customer satisfaction score improvement",
          metric: "CSAT score above 4.2 (up from 3.8)",
          deadline: daysFromNow(60),
          status: "not_started" as const,
        },
      ],
      timePeriod: { start: daysAgo(30), end: daysFromNow(60) },
      checkInCadence: "monthly" as const,
      status: "active" as const,
      employeeConfirmed: { confirmed: true, at: daysAgo(28) },
      managerConfirmed: { confirmed: true, at: daysAgo(28) },
      owner: reports[0]._id,
      manager: manager._id,
      locked: true,
    },
```

Create similar updated seed data for all 7 goals, ensuring a mix of:
- Goal types: at least 2 development goals and 5 performance goals
- Statuses: draft (1), pending_confirmation (1), active (3), needs_attention (1), completed (1)
- Key result statuses: mix of not_started, in_progress, achieved, missed

- [ ] **Step 2: Run the seed script to verify**

Run: `npx tsx scripts/seed-grow.ts`
Expected: Output showing goals created with no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-grow.ts
git commit -m "refactor: update seed data with new goal schema fields"
```

---

### Task 15: Fix Remaining TypeScript Errors & Integration Test

**Files:**
- Various files that import old goal types/constants

- [ ] **Step 1: Run full type check and find all remaining errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -100`

Fix each error. Common issues will be:
- Files importing `GOAL_CATEGORIES`, `GOAL_CATEGORY_LABELS`, `MEASUREMENT_TYPES` — update to new imports
- Files referencing `goal.title`, `goal.description`, `goal.category`, `goal.successMetric`, `goal.managerApproved` — update to new field names
- Files referencing old status values `pending_review`, `on_track`, `off_track` — update to new values
- `ParsedContent` consumers that need to handle `goalRecommendations` — add the property
- Check-in schema or other schemas that reference goals — ensure they still work with new Goal shape

- [ ] **Step 2: Run full type check again to confirm zero errors**

Run: `npx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: Clean or only pre-existing warnings.

- [ ] **Step 4: Start dev server and verify goals page loads**

Run: `pnpm dev --filter=@ascenta/platform`
Navigate to the Grow > Performance page. Verify:
- Goals panel loads with new tabs (Draft, Pending Confirmation, Active, Completed)
- Seed data displays correctly with goal types, key results
- Goal creation form opens with new fields

- [ ] **Step 5: Commit all remaining fixes**

```bash
git add -A
git commit -m "fix: resolve remaining TypeScript errors from goal schema refactor"
```

---

### Task 16: Update System Prompt for Goals

**Files:**
- Modify: `apps/platform/src/lib/ai/prompts.ts`

- [ ] **Step 1: Update goal-related sections in the system prompt**

Find the sections that reference goal creation, goal fields, or the goal workflow. Update:
- References to "title and description" → "objective statement"
- References to "5 categories" → "2 goal types (Performance, Development)"
- References to "success metric" → "2-4 key results with SMART criteria"
- Add mention of support agreement as a field the AI should ask about
- Update check-in cadence options from old values to new values
- Add context about dual confirmation (employee and manager must both confirm)

- [ ] **Step 2: Verify by running the dev server and testing a goal workflow in chat**

Start a goal creation conversation in Compass. Verify the AI references new fields correctly.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/prompts.ts
git commit -m "refactor: update system prompt with new goal schema terminology"
```
