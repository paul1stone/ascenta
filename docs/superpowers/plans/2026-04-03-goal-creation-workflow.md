# Goal Creation Workflow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-shot goal creation flow with a 5-step conversational Compass workflow that aligns employee goals to company strategy, ending in manager review.

**Architecture:** Schema changes first (new categories, strategyGoalId, notes, pending_review status), then AI tools (startGoalWorkflow fetches strategy context, openGoalDocument opens pre-filled form at end of conversation), then form/table UI updates, then manager review actions and notifications.

**Tech Stack:** Next.js App Router, Mongoose ODM, Vercel AI SDK tool(), Zod, shadcn/ui Table, React

**Spec:** `docs/superpowers/specs/2026-04-03-goal-creation-workflow-design.md`

---

### Task 1: Update Goal Constants

**Files:**
- Modify: `packages/db/src/goal-constants.ts`

- [ ] **Step 1: Replace GOAL_CATEGORIES with 5 flat types**

```ts
export const GOAL_CATEGORIES = [
  "performance",
  "development",
  "culture",
  "compliance",
  "operational",
] as const;
```

- [ ] **Step 2: Remove GOAL_CATEGORY_GROUPS**

Delete the entire `GOAL_CATEGORY_GROUPS` export.

- [ ] **Step 3: Remove ALIGNMENT_TYPES**

Delete the `ALIGNMENT_TYPES` export.

- [ ] **Step 4: Add pending_review to GOAL_STATUSES**

```ts
export const GOAL_STATUSES = [
  "pending_review",
  "on_track",
  "needs_attention",
  "off_track",
  "completed",
] as const;
```

- [ ] **Step 5: Add GOAL_CATEGORY_LABELS for display**

```ts
export const GOAL_CATEGORY_LABELS: Record<
  (typeof GOAL_CATEGORIES)[number],
  string
> = {
  performance: "Performance",
  development: "Development",
  culture: "Culture",
  compliance: "Compliance",
  operational: "Operational",
};
```

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/goal-constants.ts
git commit -m "refactor: replace 16 goal subcategories with 5 flat types, add pending_review status"
```

---

### Task 2: Update Goal Schema

**Files:**
- Modify: `packages/db/src/goal-schema.ts`

- [ ] **Step 1: Add strategyGoalId and notes fields, remove alignment**

In the `goalSchema` definition, after the `alignment` field block, add the new fields and remove `alignment`:

```ts
// REMOVE this block:
//   alignment: {
//     type: String,
//     required: true,
//     enum: ALIGNMENT_TYPES,
//   },

// ADD these fields:
    strategyGoalId: {
      type: Schema.Types.ObjectId,
      ref: "StrategyGoal",
      default: null,
      index: true,
    },
    notes: { type: String, default: "" },
```

- [ ] **Step 2: Remove ALIGNMENT_TYPES from imports**

Remove `ALIGNMENT_TYPES` from both the re-export block (line 13) and the import block (line 20).

- [ ] **Step 3: Update Goal_Type type alias**

Replace `alignment` with:
```ts
  strategyGoalId: string | Types.ObjectId | null;
  notes: string;
```

Remove:
```ts
  alignment: (typeof ALIGNMENT_TYPES)[number];
```

- [ ] **Step 4: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: Type errors in files that reference `ALIGNMENT_TYPES` or `GOAL_CATEGORY_GROUPS` — these will be fixed in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/goal-schema.ts
git commit -m "refactor: add strategyGoalId, notes to goal schema, remove alignment field"
```

---

### Task 3: Update Goal Validation Schema

**Files:**
- Modify: `apps/platform/src/lib/validations/goal.ts`

- [ ] **Step 1: Rewrite the validation schema**

Replace the entire file content:

```ts
import { z } from "zod";
import {
  GOAL_CATEGORIES,
  MEASUREMENT_TYPES,
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

export const goalFormSchema = z
  .object({
    employeeName: z.string().min(1, "Employee name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    description: z.string().min(1, "Description is required"),
    category: z.enum(GOAL_CATEGORIES, { message: "Goal type is required" }),
    measurementType: z.enum(MEASUREMENT_TYPES, {
      message: "Measurement type is required",
    }),
    successMetric: z.string().min(1, "Success metric is required"),
    timePeriod: z.enum(TIME_PERIODS, { message: "Time period is required" }),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
    checkInCadence: z.enum(CHECKIN_CADENCES, {
      message: "Check-in cadence is required",
    }),
    strategyGoalId: z.string().optional(),
    strategyGoalTitle: z.string().optional(),
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

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/validations/goal.ts
git commit -m "refactor: update goal validation for 5 flat categories, add strategyGoalId and notes"
```

---

### Task 4: Update Goals API Route

**Files:**
- Modify: `apps/platform/src/app/api/grow/goals/route.ts`

- [ ] **Step 1: Update POST handler to handle new fields**

In the POST handler, after `const data = parsed.data;` (around line 80), update the `Goal.create()` call to include the new fields and remove `alignment`:

```ts
    const goal = await Goal.create({
      title: data.title,
      description: data.description,
      category: data.category,
      measurementType: data.measurementType,
      successMetric: data.successMetric,
      timePeriod,
      checkInCadence: data.checkInCadence,
      strategyGoalId: data.strategyGoalId || null,
      notes: data.notes || "",
      status: "pending_review",
      owner: employee.id,
      manager: employee.id,
      workflowRunId: effectiveRunId,
    });
```

Note: The API route also needs to accept an optional `createdByRole` field. When `createdByRole` is `"hr"` or `"manager"`, set `status: "on_track"` and `managerApproved: true` instead of `pending_review`. The frontend form should pass this based on the current user's role. Add this to the POST handler:

```ts
    const skipReview = body.createdByRole === "hr" || body.createdByRole === "manager";

    const goal = await Goal.create({
      // ... other fields ...
      status: skipReview ? "on_track" : "pending_review",
      managerApproved: skipReview,
    });
```

- [ ] **Step 2: Add PATCH endpoint for goal approval**

Add a new PATCH handler after the POST handler:

```ts
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

    if (action === "approve") {
      goal.status = "on_track";
      goal.managerApproved = true;
      await goal.save();

      return NextResponse.json({
        success: true,
        message: "Goal approved and activated.",
      });
    }

    if (action === "request_changes") {
      goal.managerApproved = false;
      await goal.save();

      return NextResponse.json({
        success: true,
        message: "Changes requested. Employee will be notified.",
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

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/grow/goals/route.ts
git commit -m "feat: add goal approval PATCH endpoint, default new goals to pending_review"
```

---

### Task 5: Create startGoalWorkflow AI Tool

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`

- [ ] **Step 1: Add imports for foundation and strategy schemas**

At the top of the file, add:

```ts
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
```

- [ ] **Step 2: Replace startGoalCreationTool with startGoalWorkflowTool**

Replace the entire `startGoalCreationTool` export (lines 148-209) with:

```ts
export const startGoalWorkflowTool = tool({
  description: `Start a goal creation workflow for an employee. This fetches company strategy context and begins a multi-step conversation. Do NOT open a working document yet.

After calling this tool, guide the employee through these steps ONE AT A TIME:

**Step 1 — Strategic pillar context:**
Present the company's mission, vision, and values (from foundation data) plus any company-wide strategy goals. Ask: "Which strategic pillar or company goal does this goal support? You can skip this if your goal is independent." Accept a reference or "skip."

**Step 2 — Department and team focus:**
Present the employee's department strategy goals (if any). Ask which one this goal aligns to (or none). Then ask goal type as a numbered list:
1. Performance
2. Development
3. Culture
4. Compliance
5. Operational

**Step 3 — Goal recommendation:**
Based on all context (selected pillar, department goal, goal type, employee role/department), generate 4-6 goal recommendations as a numbered list. Include a final option: "Or describe your own goal." User picks a number or writes custom. Draft a goal title and description.

**Step 4 — Metrics and milestones:**
Suggest 2-3 success metrics based on the goal type and description. Ask user to pick or customize. Discuss target date / time period. Ask about resources needed and potential blockers conversationally (these are NOT persisted). Then call openGoalDocument with all fields.

RULES:
- Ask ONE question at a time. Wait for the response before moving on.
- If the user gives rich answers, skip ahead where appropriate.
- After drafting the goal in step 3, confirm with the user before proceeding.
- Resources and blockers discussed in step 4 are conversation context only — do not try to save them as fields.
- When ready, call openGoalDocument with all collected values to open the form.`,
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee"),
    employeeId: z
      .string()
      .describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    managerName: z.string().optional(),
  }),
  execute: async (params) => {
    await connectDB();

    // Fetch foundation (MVV)
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

    // Fetch active strategy goals
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
    const hasDeptGoals = departmentGoals.length > 0;

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
```

- [ ] **Step 3: Add openGoalDocumentTool after the new tool**

```ts
export const openGoalDocumentTool = tool({
  description:
    "Open the goal creation working document with all fields pre-filled. Call this at the END of the goal conversation (after steps 1-4), not at the beginning. The user will review the form and submit.",
  inputSchema: z.object({
    employeeName: z.string(),
    employeeId: z.string(),
    title: z.string().describe("Goal title from step 3"),
    description: z.string().describe("Goal description from step 3"),
    category: z
      .string()
      .describe(
        "One of: performance, development, culture, compliance, operational",
      ),
    strategyGoalId: z
      .string()
      .optional()
      .describe("ObjectId of linked strategy goal, or omit for independent"),
    strategyGoalTitle: z
      .string()
      .optional()
      .describe("Display title of linked strategy goal"),
    measurementType: z
      .string()
      .describe(
        "numeric_metric, percentage_target, milestone_completion, behavior_change, or learning_completion",
      ),
    successMetric: z.string().describe("Success criteria from step 4"),
    timePeriod: z
      .string()
      .describe("Q1, Q2, Q3, Q4, H1, H2, annual, or custom"),
    checkInCadence: z
      .string()
      .describe("monthly, quarterly, milestone, or manager_scheduled"),
    notes: z.string().optional().describe("Additional context or notes"),
  }),
  execute: async (params) => {
    await ensureWorkflowsSynced();
    const initialInputs: WorkflowInputs = {
      employeeName: params.employeeName,
      employeeId: params.employeeId,
    };

    const run = await startWorkflowRun(
      "create-goal",
      "system",
      initialInputs,
    );

    const prefilled: Record<string, unknown> = {};
    for (const key of [
      "employeeName",
      "employeeId",
      "title",
      "description",
      "category",
      "strategyGoalId",
      "strategyGoalTitle",
      "measurementType",
      "successMetric",
      "timePeriod",
      "checkInCadence",
      "notes",
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
      message: `I've opened the goal form for ${params.employeeName} with everything pre-filled. Review and submit when ready.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
```

- [ ] **Step 4: Update the completeGrowWorkflowTool slug mapping**

In `completeGrowWorkflowTool`, find the section that maps slugs (around line 393):

```ts
      if (slug === "create-goal") {
```

This should still work — the workflow slug is unchanged. No changes needed here.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts
git commit -m "feat: add startGoalWorkflow and openGoalDocument tools, replace single-shot tool"
```

---

### Task 6: Update Tool Registration

**Files:**
- Modify: `apps/platform/src/lib/ai/tools.ts`
- Modify: `apps/platform/src/components/do-tab-chat.tsx`

- [ ] **Step 1: Update imports in tools.ts**

Replace:
```ts
  startGoalCreationTool,
```
With:
```ts
  startGoalWorkflowTool,
  openGoalDocumentTool,
```

- [ ] **Step 2: Update allTools and defaultChatTools**

In the tools map (find `startGoalCreation: startGoalCreationTool`), replace with:
```ts
  startGoalWorkflow: startGoalWorkflowTool,
  openGoalDocument: openGoalDocumentTool,
```

Do the same in `defaultChatTools`.

- [ ] **Step 3: Update do-tab-chat.tsx tool mapping**

Find the line:
```ts
  startGoalCreation: "create-goal",
```
Replace with:
```ts
  openGoalDocument: "create-goal",
```

The `startGoalWorkflow` tool does NOT open a working document, so it doesn't need a mapping here — only `openGoalDocument` does.

- [ ] **Step 4: Update dashboard-nav.ts tool references**

Search for references to `startGoalCreation` in `apps/platform/src/lib/constants/dashboard-nav.ts` and replace with `startGoalWorkflow`.

- [ ] **Step 5: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS (no more references to old tool name)

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/lib/ai/tools.ts apps/platform/src/components/do-tab-chat.tsx apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "refactor: register new goal workflow tools, remove old startGoalCreation"
```

---

### Task 7: Update PerformanceGoalForm

**Files:**
- Modify: `apps/platform/src/components/grow/performance-goal-form.tsx`

- [ ] **Step 1: Replace category options and remove alignment**

Replace `CATEGORY_GROUP_OPTIONS`, `CATEGORIES_BY_GROUP`, and `ALIGNMENT_OPTIONS` with:

```ts
const GOAL_TYPE_OPTIONS = [
  { value: "performance", label: "Performance" },
  { value: "development", label: "Development" },
  { value: "culture", label: "Culture" },
  { value: "compliance", label: "Compliance" },
  { value: "operational", label: "Operational" },
] as const;
```

- [ ] **Step 2: Update form state**

Remove:
```ts
const [categoryGroup, setCategoryGroup] = useState("");
const [category, setCategory] = useState("");
const [alignment, setAlignment] = useState("");
```

Add:
```ts
const [category, setCategory] = useState("");
const [strategyGoalId] = useState(defaultStrategyGoalId);
const [strategyGoalTitle] = useState(defaultStrategyGoalTitle);
const [notes, setNotes] = useState("");
```

Update the props interface to accept:
```ts
  defaultStrategyGoalId?: string;
  defaultStrategyGoalTitle?: string;
```

- [ ] **Step 3: Update form fields in JSX**

Replace the Category Group + Category grid with a single Goal Type select:

```tsx
<div>
  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    Goal Type
  </label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
  >
    <option value="">Select...</option>
    {GOAL_TYPE_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
  {errors.category && (
    <p className="text-xs text-red-500 mt-1">{errors.category}</p>
  )}
</div>
```

Replace the Alignment select with a Strategy Alignment read-only display:

```tsx
{strategyGoalTitle ? (
  <div>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Strategy Alignment
    </label>
    <div className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
      {strategyGoalTitle}
    </div>
  </div>
) : (
  <div>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Strategy Alignment
    </label>
    <div className="mt-1 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground italic">
      Independent goal
    </div>
  </div>
)}
```

Add Notes textarea before the actions:

```tsx
<div>
  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    Notes <span className="normal-case font-normal">(optional)</span>
  </label>
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    rows={2}
    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
    placeholder="Additional context..."
  />
</div>
```

- [ ] **Step 4: Update formData in handleSubmit**

```ts
const formData = {
  employeeName,
  employeeId,
  title,
  description,
  category: category || undefined,
  measurementType: measurementType || undefined,
  successMetric,
  timePeriod: timePeriod || undefined,
  customStartDate: timePeriod === "custom" ? customStartDate : undefined,
  customEndDate: timePeriod === "custom" ? customEndDate : undefined,
  checkInCadence: checkInCadence || undefined,
  strategyGoalId: strategyGoalId || undefined,
  strategyGoalTitle: strategyGoalTitle || undefined,
  notes: notes || undefined,
};
```

- [ ] **Step 5: Update submit button text**

Change "Create Goal" to "Submit for Review".

- [ ] **Step 6: Remove the categoryGroup useEffect** that resets category when group changes — no longer needed.

- [ ] **Step 7: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`

- [ ] **Step 8: Commit**

```bash
git add apps/platform/src/components/grow/performance-goal-form.tsx
git commit -m "feat: update goal form with 5 flat types, strategy alignment, notes, submit for review"
```

---

### Task 8: Update Goals Panel — Status Colors, Approval Actions, Review Skip

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`

- [ ] **Step 1: Add pending_review to STATUS_COLORS and STATUS_LABELS**

```ts
const STATUS_COLORS: Record<string, string> = {
  pending_review: "#8b5cf6",
  on_track: "#22c55e",
  needs_attention: "#f59e0b",
  off_track: "#ef4444",
  completed: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  on_track: "On Track",
  needs_attention: "Needs Attention",
  off_track: "Off Track",
  completed: "Completed",
};
```

- [ ] **Step 2: Replace GROUP_COLORS with CATEGORY_COLORS**

```ts
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  performance: { bg: "rgba(68, 170, 153, 0.1)", text: "#44aa99" },
  development: { bg: "rgba(102, 136, 187, 0.1)", text: "#6688bb" },
  culture: { bg: "rgba(187, 102, 136, 0.1)", text: "#bb6688" },
  compliance: { bg: "rgba(136, 136, 170, 0.1)", text: "#8888aa" },
  operational: { bg: "rgba(170, 136, 102, 0.1)", text: "#aa8866" },
};
```

- [ ] **Step 3: Remove getCategoryGroup and GROUP_COLORS**

Delete the `getCategoryGroup` function and `GROUP_COLORS` constant. In the table rendering, replace:
```ts
const group = getCategoryGroup(goal.category);
const groupColor = GROUP_COLORS[group] ?? ...
```
With:
```ts
const categoryColor = CATEGORY_COLORS[goal.category] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
```

And update the pill to use `goal.category` directly (capitalize first letter) and `categoryColor`.

- [ ] **Step 4: Add approve/request-changes actions to expanded row**

Import `useRole` (already imported). Inside the expanded detail `div`, after the existing content, add:

```tsx
{goal.status === "pending_review" && canViewOthers && !isViewingSelf && (
  <div className="flex items-center gap-2 pt-1">
    <button
      onClick={async () => {
        await fetch("/api/grow/goals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalId: goal.id, action: "approve" }),
        });
        fetchGoals();
      }}
      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
      style={{ backgroundColor: "#22c55e" }}
    >
      Approve
    </button>
    <button
      onClick={async () => {
        await fetch("/api/grow/goals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalId: goal.id, action: "request_changes" }),
        });
        fetchGoals();
      }}
      className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      Request Changes
    </button>
    <a
      href={`/do?prompt=Review%20this%20goal%20for%20${encodeURIComponent(goal.title)}`}
      className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      Review with Compass
    </a>
  </div>
)}
```

- [ ] **Step 5: Update GoalData interface**

Add to the `GoalData` interface:
```ts
  strategyGoalId: string | null;
  notes: string;
```

- [ ] **Step 6: Show strategy alignment and notes in expanded row**

After the description section in the expanded row, add:

```tsx
{goal.strategyGoalId && (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
      Strategy Alignment
    </p>
    <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold bg-muted text-foreground">
      Linked to strategy goal
    </span>
  </div>
)}
{goal.notes && (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
      Notes
    </p>
    <p className="text-sm font-normal text-foreground leading-relaxed">
      {goal.notes}
    </p>
  </div>
)}
```

- [ ] **Step 7: Update active/completed goal filtering**

Change the active goals filter to also exclude `pending_review` from completed, and add a pending section:

```ts
const pendingGoals = goals.filter((g) => g.status === "pending_review");
const activeGoals = goals.filter(
  (g) => g.status !== "completed" && g.status !== "pending_review",
);
const completedGoals = goals.filter((g) => g.status === "completed");
```

In the JSX, add a pending section before active:

```tsx
{pendingGoals.length > 0 && (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      Pending Review
    </p>
    {renderGoalTable(pendingGoals)}
  </div>
)}
{activeGoals.length > 0 && renderGoalTable(activeGoals)}
```

Update the header count:
```ts
{pendingGoals.length > 0 && `${pendingGoals.length} pending, `}
{activeGoals.length} active
```

- [ ] **Step 8: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`

- [ ] **Step 9: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "feat: add pending_review status, approval actions, strategy alignment display"
```

---

### Task 9: Update Compass CTA Links

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`

- [ ] **Step 1: Update Compass CTA tool reference**

Find the Compass CTA link:
```
/do?prompt=Help%20me%20create%20a%20performance%20goal&tool=startGoalCreation
```

Replace with:
```
/do?prompt=Help%20me%20create%20a%20performance%20goal&tool=startGoalWorkflow
```

Do this for all 3 occurrences (grid CTA, empty state CTA).

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "fix: update Compass CTA to use new startGoalWorkflow tool"
```

---

### Task 10: Update AI System Prompt

**Files:**
- Modify: `apps/platform/src/lib/ai/prompts.ts`

- [ ] **Step 1: Update the Grow workflow instructions**

Find the section about Grow workflows (around lines 40-45) that references `startGoalCreation`. Replace with instructions for the new flow:

Replace:
```
5. Once you have enough context, call the appropriate start tool (startGoalCreation, startCheckIn, startPerformanceNote) with **ALL field values** as parameters. This opens a pre-filled form for the user.
```

With:
```
5. For goal creation: call startGoalWorkflow first to load strategy context. Then guide the employee through the 5-step conversation (see tool description). At the end, call openGoalDocument with all values. For check-ins and performance notes: call startCheckIn or startPerformanceNote with **ALL field values** as parameters.
```

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/prompts.ts
git commit -m "docs: update system prompt for new goal creation workflow"
```

---

### Task 11: Add Goal Approval Notifications

**Files:**
- Modify: `apps/platform/src/app/api/notifications/route.ts`

- [ ] **Step 1: Import Goal model**

Add at top:
```ts
import { Goal } from "@ascenta/db/goal-schema";
```

- [ ] **Step 2: Add pending review notifications section**

After the existing notification blocks (e.g., after document acknowledged, before the final sort), add:

```ts
    // Goals pending review (last 7 days)
    try {
      const pendingGoals = await Goal.find({
        status: "pending_review",
        createdAt: { $gt: sevenDaysAgo },
      })
        .populate("owner", "firstName lastName")
        .lean();

      for (const goal of pendingGoals) {
        const g = goal as Record<string, unknown>;
        const owner = g.owner as Record<string, unknown> | null;
        const ownerName = owner
          ? `${owner.firstName} ${owner.lastName}`
          : "An employee";
        allNotifications.push({
          id: `goal-pending-${g._id}`,
          type: "goal_pending_review",
          title: "Goal Pending Review",
          message: `${ownerName} submitted a goal for review: ${g.title}`,
          timestamp: g.createdAt as Date,
          read: false,
        });
      }
    } catch {
      // silent
    }
```

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/notifications/route.ts
git commit -m "feat: add goal pending review notifications"
```

---

### Task 12: Clean Up — Remove Unused Imports and GoalCard Component

**Files:**
- Modify: `apps/platform/src/components/grow/goal-card.tsx`
- Modify: Any files still importing `GOAL_CATEGORY_GROUPS` or `ALIGNMENT_TYPES`

- [ ] **Step 1: Search for remaining references to removed exports**

Run:
```bash
grep -r "GOAL_CATEGORY_GROUPS\|ALIGNMENT_TYPES\|startGoalCreation\|categoryGroup" apps/platform/src/ --include="*.ts" --include="*.tsx" -l
```

Fix each file found — remove dead imports and references.

- [ ] **Step 2: Verify GoalCard is no longer imported anywhere**

Run:
```bash
grep -r "GoalCard\|goal-card" apps/platform/src/ --include="*.ts" --include="*.tsx" -l
```

If only `goal-card.tsx` itself and `strategy-goal-card.tsx` (which exports `StrategyGoalData` type) appear, `GoalCard` can be left in place for now (it's not imported). If it's imported somewhere, remove the import.

- [ ] **Step 3: Final build check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS with zero errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: clean up removed goal category groups, alignment types, old tool references"
```

---

### Task 13: End-to-End Manual Test

- [ ] **Step 1: Test employee goal creation via Compass**

Navigate to Grow > Performance as Employee role. Click "Create Goal with Compass." Verify:
- AI calls `startGoalWorkflow`, presents strategy context
- Walks through 5 steps conversationally
- Opens working document with pre-filled fields at the end
- Form shows Goal Type (5 options), strategy alignment pill, notes field
- Submit button says "Submit for Review"
- Goal appears in table with "Pending Review" purple status

- [ ] **Step 2: Test manager approval**

Switch to Manager role. Select the employee in the combobox. Verify:
- Pending goals show in a "Pending Review" section
- Expanded row shows Approve / Request Changes / Review with Compass buttons
- Clicking Approve changes status to "On Track"

- [ ] **Step 3: Test HR direct creation**

Switch to HR role. Select an employee. Click manual "Create" button. Verify:
- Form works with new fields
- Goal is created as "On Track" (skips review since HR is creating)

- [ ] **Step 4: Test Compass CTA links**

Verify both grid CTAs on the goals panel link to Compass with correct tool parameter.
