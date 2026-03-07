# Grow > Performance System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build AI-guided goal creation, check-in, and performance note workflows under Grow > Performance System, with a manager Status dashboard and static Learn tab.

**Architecture:** Three new AI workflow definitions (create-goal, run-check-in, add-performance-note) following the existing conversational workflow engine pattern. Three new Mongoose schemas (Goal, CheckIn, PerformanceNote) aligned to Andrea's full spec. Status and Learn tabs rendered as traditional UI in the `[category]/[sub]/page.tsx` dynamic route. All interactions in the Do tab are AI-conversational — no standalone forms.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Mongoose ODM, Vercel AI SDK, existing workflow engine (`lib/workflows/`)

---

## Task 1: Goal Schema

**Files:**
- Create: `packages/db/src/goal-schema.ts`
- Modify: `packages/db/src/index.ts`

**Step 1: Create the Goal schema**

Create `packages/db/src/goal-schema.ts`:

```typescript
/**
 * Goal Schema (Mongoose)
 * Performance goals for employees — aligned to Andrea's full spec (GROW-101).
 */

import mongoose, { Schema } from "mongoose";

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
// CONSTANTS
// ============================================================================

export const GOAL_CATEGORIES = [
  // Performance Goals
  "productivity",
  "quality",
  "accuracy",
  "efficiency",
  "operational_excellence",
  "customer_impact",
  // Leadership Goals
  "communication",
  "collaboration",
  "conflict_resolution",
  "decision_making",
  "initiative",
  // Development Goals
  "skill_development",
  "certification",
  "training_completion",
  "leadership_growth",
  "career_advancement",
] as const;

export const GOAL_CATEGORY_GROUPS: Record<string, (typeof GOAL_CATEGORIES)[number][]> = {
  "Performance Goals": ["productivity", "quality", "accuracy", "efficiency", "operational_excellence", "customer_impact"],
  "Leadership Goals": ["communication", "collaboration", "conflict_resolution", "decision_making", "initiative"],
  "Development Goals": ["skill_development", "certification", "training_completion", "leadership_growth", "career_advancement"],
};

export const MEASUREMENT_TYPES = [
  "numeric_metric",
  "percentage_target",
  "milestone_completion",
  "behavior_change",
  "learning_completion",
] as const;

export const CHECKIN_CADENCES = [
  "monthly",
  "quarterly",
  "milestone",
  "manager_scheduled",
] as const;

export const ALIGNMENT_TYPES = [
  "mission",
  "value",
  "priority",
] as const;

export const GOAL_STATUSES = [
  "on_track",
  "needs_attention",
  "off_track",
  "completed",
] as const;

// ============================================================================
// GOAL SCHEMA
// ============================================================================

const goalSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: GOAL_CATEGORIES,
      index: true,
    },
    measurementType: {
      type: String,
      required: true,
      enum: MEASUREMENT_TYPES,
    },
    successMetric: { type: String, required: true },
    timePeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    checkInCadence: {
      type: String,
      required: true,
      enum: CHECKIN_CADENCES,
    },
    alignment: {
      type: String,
      required: true,
      enum: ALIGNMENT_TYPES,
    },
    status: {
      type: String,
      required: true,
      enum: GOAL_STATUSES,
      default: "on_track",
      index: true,
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
    managerApproved: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

goalSchema.index({ owner: 1, status: 1 });
goalSchema.index({ manager: 1, status: 1 });
goalSchema.index({ "timePeriod.end": 1 });

export const Goal =
  mongoose.models.Goal || mongoose.model("Goal", goalSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type Goal_Type = {
  id: string;
  title: string;
  description: string;
  category: (typeof GOAL_CATEGORIES)[number];
  measurementType: (typeof MEASUREMENT_TYPES)[number];
  successMetric: string;
  timePeriod: { start: Date; end: Date };
  checkInCadence: (typeof CHECKIN_CADENCES)[number];
  alignment: (typeof ALIGNMENT_TYPES)[number];
  status: (typeof GOAL_STATUSES)[number];
  owner: string;
  manager: string;
  managerApproved: boolean;
  locked: boolean;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

**Step 2: Export from packages/db**

Add to `packages/db/src/index.ts` after existing re-exports:

```typescript
export * from "./goal-schema";
```

Also add a sub-path export to `packages/db/package.json` exports map (if pattern exists) so consumers can `import { Goal } from "@ascenta/db/goal-schema"`.

**Step 3: Verify**

Run: `pnpm build --filter=@ascenta/db`
Expected: Build succeeds, no type errors.

**Step 4: Commit**

```
feat(db): add Goal schema with full spec fields (GROW-101)
```

---

## Task 2: CheckIn Schema

**Files:**
- Create: `packages/db/src/checkin-schema.ts`
- Modify: `packages/db/src/index.ts`

**Step 1: Create the CheckIn schema**

Create `packages/db/src/checkin-schema.ts`:

```typescript
/**
 * CheckIn Schema (Mongoose)
 * Scheduled check-ins linked to goals — per GROW-104.
 */

import mongoose, { Schema } from "mongoose";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

export const CHECKIN_STATUSES = [
  "scheduled",
  "completed",
  "missed",
  "cancelled",
] as const;

const checkInSchema = new Schema(
  {
    goals: [{
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    }],
    employee: {
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
    dueDate: { type: Date, required: true, index: true },
    completedAt: { type: Date, default: null },
    // Manager prompts
    managerProgressObserved: { type: String, default: null },
    managerCoachingNeeded: { type: String, default: null },
    managerRecognition: { type: String, default: null },
    // Employee prompts
    employeeProgress: { type: String, default: null },
    employeeObstacles: { type: String, default: null },
    employeeSupportNeeded: { type: String, default: null },
    status: {
      type: String,
      required: true,
      enum: CHECKIN_STATUSES,
      default: "scheduled",
      index: true,
    },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

checkInSchema.index({ employee: 1, dueDate: 1 });
checkInSchema.index({ status: 1, dueDate: 1 });
checkInSchema.index({ manager: 1, status: 1 });

export const CheckIn =
  mongoose.models.CheckIn || mongoose.model("CheckIn", checkInSchema);

export type CheckIn_Type = {
  id: string;
  goals: string[];
  employee: string;
  manager: string;
  dueDate: Date;
  completedAt: Date | null;
  managerProgressObserved: string | null;
  managerCoachingNeeded: string | null;
  managerRecognition: string | null;
  employeeProgress: string | null;
  employeeObstacles: string | null;
  employeeSupportNeeded: string | null;
  status: (typeof CHECKIN_STATUSES)[number];
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

**Step 2: Export from packages/db**

Add to `packages/db/src/index.ts`:

```typescript
export * from "./checkin-schema";
```

**Step 3: Verify**

Run: `pnpm build --filter=@ascenta/db`
Expected: Build succeeds.

**Step 4: Commit**

```
feat(db): add CheckIn schema with manager/employee prompts (GROW-104)
```

---

## Task 3: PerformanceNote Schema

**Files:**
- Create: `packages/db/src/performance-note-schema.ts`
- Modify: `packages/db/src/index.ts`

**Step 1: Create the PerformanceNote schema**

Create `packages/db/src/performance-note-schema.ts`:

```typescript
/**
 * PerformanceNote Schema (Mongoose)
 * Manager observations and feedback linked to employees.
 */

import mongoose, { Schema } from "mongoose";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

export const NOTE_TYPES = [
  "observation",
  "feedback",
  "coaching",
  "recognition",
  "concern",
] as const;

const performanceNoteSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: NOTE_TYPES,
      index: true,
    },
    observation: { type: String, required: true },
    expectation: { type: String, default: null },
    relatedGoal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    relatedCheckIn: {
      type: Schema.Types.ObjectId,
      ref: "CheckIn",
      default: null,
    },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

performanceNoteSchema.index({ employee: 1, createdAt: -1 });

export const PerformanceNote =
  mongoose.models.PerformanceNote ||
  mongoose.model("PerformanceNote", performanceNoteSchema);

export type PerformanceNote_Type = {
  id: string;
  employee: string;
  author: string;
  type: (typeof NOTE_TYPES)[number];
  observation: string;
  expectation: string | null;
  relatedGoal: string | null;
  relatedCheckIn: string | null;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

**Step 2: Export from packages/db**

Add to `packages/db/src/index.ts`:

```typescript
export * from "./performance-note-schema";
```

**Step 3: Verify**

Run: `pnpm build --filter=@ascenta/db`
Expected: Build succeeds.

**Step 4: Commit**

```
feat(db): add PerformanceNote schema (GROW teaching moments)
```

---

## Task 4: Create Goal Workflow Definition

**Files:**
- Create: `apps/platform/src/lib/workflows/definitions/create-goal.ts`
- Modify: `apps/platform/src/lib/workflows/definitions/index.ts`

**Step 1: Create the workflow definition**

Create `apps/platform/src/lib/workflows/definitions/create-goal.ts`:

```typescript
/**
 * Create Goal Workflow
 * AI-guided goal creation for employee performance — per GROW-101, GROW-102, GROW-103.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const createGoalWorkflow: WorkflowDefinitionConfig = {
  slug: "create-goal",
  name: "Create Goal",
  description:
    "Guide a manager through creating a structured performance goal for an employee, with category selection, measurement criteria, and alignment to company priorities.",
  category: "grow",
  audience: "manager",
  riskLevel: "low",
  estimatedMinutes: 10,
  icon: "Target",

  intakeFields: [
    // Employee Selection
    {
      fieldKey: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Which employee is this goal for?",
      helpText: "The AI will look up the employee by name.",
      required: true,
      sortOrder: 1,
      groupName: "Employee",
    },
    {
      fieldKey: "employeeId",
      label: "Employee ID",
      type: "text",
      required: true,
      sortOrder: 2,
      groupName: "Employee",
    },

    // Goal Details
    {
      fieldKey: "title",
      label: "Goal Title",
      type: "text",
      placeholder: "A short, clear title for this goal",
      helpText: "Example: 'Reduce ticket resolution time by 50%'",
      required: true,
      sortOrder: 3,
      groupName: "Goal Details",
    },
    {
      fieldKey: "description",
      label: "Goal Description",
      type: "textarea",
      placeholder: "Describe the goal in detail — what does success look like?",
      required: true,
      sortOrder: 4,
      groupName: "Goal Details",
    },

    // Category (GROW-102)
    {
      fieldKey: "categoryGroup",
      label: "Goal Category Group",
      type: "dropdown",
      required: true,
      sortOrder: 5,
      groupName: "Classification",
      options: [
        { value: "performance", label: "Performance Goals" },
        { value: "leadership", label: "Leadership Goals" },
        { value: "development", label: "Development Goals" },
      ],
    },
    {
      fieldKey: "category",
      label: "Specific Category",
      type: "dropdown",
      required: true,
      sortOrder: 6,
      groupName: "Classification",
      conditionalOn: "categoryGroup",
      options: [
        // Performance
        { value: "productivity", label: "Productivity" },
        { value: "quality", label: "Quality" },
        { value: "accuracy", label: "Accuracy" },
        { value: "efficiency", label: "Efficiency" },
        { value: "operational_excellence", label: "Operational Excellence" },
        { value: "customer_impact", label: "Customer/Patient Impact" },
        // Leadership
        { value: "communication", label: "Communication" },
        { value: "collaboration", label: "Collaboration" },
        { value: "conflict_resolution", label: "Conflict Resolution" },
        { value: "decision_making", label: "Decision Making" },
        { value: "initiative", label: "Initiative" },
        // Development
        { value: "skill_development", label: "Skill Development" },
        { value: "certification", label: "Certification" },
        { value: "training_completion", label: "Training Completion" },
        { value: "leadership_growth", label: "Leadership Growth" },
        { value: "career_advancement", label: "Career Advancement" },
      ],
    },

    // Measurement (GROW-103)
    {
      fieldKey: "measurementType",
      label: "How will progress be measured?",
      type: "dropdown",
      required: true,
      sortOrder: 7,
      groupName: "Measurement",
      options: [
        { value: "numeric_metric", label: "Numeric Metric (e.g., reduce from X to Y)" },
        { value: "percentage_target", label: "Percentage Target (e.g., achieve 95%)" },
        { value: "milestone_completion", label: "Milestone Completion (e.g., launch by date)" },
        { value: "behavior_change", label: "Behavior Change (e.g., consistently demonstrates X)" },
        { value: "learning_completion", label: "Learning Completion (e.g., finish course/cert)" },
      ],
    },
    {
      fieldKey: "successMetric",
      label: "Success Metric",
      type: "textarea",
      placeholder: "Define the specific, measurable target",
      helpText: "Be specific: 'Reduce average resolution time from 48h to 24h for 4 consecutive weeks'",
      required: true,
      sortOrder: 8,
      groupName: "Measurement",
    },

    // Time Period
    {
      fieldKey: "timePeriod",
      label: "Time Period",
      type: "dropdown",
      required: true,
      sortOrder: 9,
      groupName: "Timeline",
      options: [
        { value: "Q1", label: "Q1 (Jan-Mar)" },
        { value: "Q2", label: "Q2 (Apr-Jun)" },
        { value: "Q3", label: "Q3 (Jul-Sep)" },
        { value: "Q4", label: "Q4 (Oct-Dec)" },
        { value: "H1", label: "H1 (Jan-Jun)" },
        { value: "H2", label: "H2 (Jul-Dec)" },
        { value: "annual", label: "Full Year" },
        { value: "custom", label: "Custom Date Range" },
      ],
    },
    {
      fieldKey: "customStartDate",
      label: "Start Date",
      type: "date",
      required: false,
      sortOrder: 10,
      groupName: "Timeline",
      conditionalOn: "timePeriod",
    },
    {
      fieldKey: "customEndDate",
      label: "End Date",
      type: "date",
      required: false,
      sortOrder: 11,
      groupName: "Timeline",
      conditionalOn: "timePeriod",
    },

    // Cadence
    {
      fieldKey: "checkInCadence",
      label: "Check-in Cadence",
      type: "dropdown",
      required: true,
      sortOrder: 12,
      groupName: "Check-ins",
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "milestone", label: "At Milestones" },
        { value: "manager_scheduled", label: "Manager Scheduled" },
      ],
    },

    // Alignment
    {
      fieldKey: "alignment",
      label: "What does this goal align to?",
      type: "dropdown",
      required: true,
      sortOrder: 13,
      groupName: "Alignment",
      options: [
        { value: "mission", label: "Company Mission" },
        { value: "value", label: "Company Value/Principle" },
        { value: "priority", label: "Strategic Priority" },
      ],
    },
  ],

  guardrails: [
    {
      name: "missing_success_metric",
      description: "Goals must have a measurable success metric",
      triggerCondition: { field: "successMetric", operator: "is_empty" },
      severity: "hard_stop" as const,
      message: "A goal cannot be created without a defined success metric.",
    },
    {
      name: "missing_time_period",
      description: "Goals must have a time period",
      triggerCondition: { field: "timePeriod", operator: "is_empty" },
      severity: "hard_stop" as const,
      message: "A goal must have a time period defined.",
    },
  ],

  artifactTemplates: [],
  guidedActions: [
    {
      label: "Suggest goal improvements",
      description: "Get AI suggestions to make this goal more specific and measurable",
      icon: "Lightbulb",
      requiredInputs: ["title", "description"],
      outputType: "analysis" as const,
      promptTemplate:
        "Review this goal and suggest improvements to make it more SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Goal title: {{title}}. Description: {{description}}. Category: {{category}}.",
    },
    {
      label: "Leadership Library guidance",
      description: "Get relevant Leadership Library principles for this goal area",
      icon: "BookOpen",
      requiredInputs: ["category"],
      outputType: "analysis" as const,
      promptTemplate:
        "Based on the goal category '{{category}}', suggest relevant leadership principles and development approaches from the Leadership Library that would help the employee succeed.",
    },
  ],
  textLibraryEntries: [],
};
```

**Step 2: Register the workflow**

In `apps/platform/src/lib/workflows/definitions/index.ts`, add:

```typescript
import { createGoalWorkflow } from "./create-goal";

// In registerAllWorkflows():
registerWorkflow(createGoalWorkflow);
```

**Step 3: Verify**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Build succeeds. Workflow registers without errors.

**Step 4: Commit**

```
feat(workflows): add create-goal workflow definition (GROW-101/102/103)
```

---

## Task 5: Run Check-In Workflow Definition

**Files:**
- Create: `apps/platform/src/lib/workflows/definitions/run-check-in.ts`
- Modify: `apps/platform/src/lib/workflows/definitions/index.ts`

**Step 1: Create the workflow definition**

Create `apps/platform/src/lib/workflows/definitions/run-check-in.ts`:

```typescript
/**
 * Run Check-In Workflow
 * AI-guided check-in completion — per GROW-104.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const runCheckInWorkflow: WorkflowDefinitionConfig = {
  slug: "run-check-in",
  name: "Run Check-In",
  description:
    "Guide a manager through a structured check-in conversation with an employee, documenting progress, blockers, coaching needs, and recognition.",
  category: "grow",
  audience: "manager",
  riskLevel: "low",
  estimatedMinutes: 10,
  icon: "CalendarCheck",

  intakeFields: [
    {
      fieldKey: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Which employee is this check-in for?",
      required: true,
      sortOrder: 1,
      groupName: "Employee",
    },
    {
      fieldKey: "employeeId",
      label: "Employee ID",
      type: "text",
      required: true,
      sortOrder: 2,
      groupName: "Employee",
    },
    {
      fieldKey: "linkedGoals",
      label: "Linked Goals",
      type: "checkbox_group",
      helpText: "Select the goals this check-in covers. The AI will show the employee's active goals.",
      required: true,
      sortOrder: 3,
      groupName: "Goals",
      options: [],
    },

    // Manager Prompts
    {
      fieldKey: "managerProgressObserved",
      label: "What progress do you see?",
      type: "textarea",
      placeholder: "Describe the progress you've observed since the last check-in",
      required: true,
      sortOrder: 4,
      groupName: "Manager Assessment",
    },
    {
      fieldKey: "managerCoachingNeeded",
      label: "What coaching is needed?",
      type: "textarea",
      placeholder: "Describe any coaching, support, or course correction needed",
      required: true,
      sortOrder: 5,
      groupName: "Manager Assessment",
    },
    {
      fieldKey: "managerRecognition",
      label: "What recognition should be given?",
      type: "textarea",
      placeholder: "Note any wins, effort, or behaviors worth recognizing",
      required: false,
      sortOrder: 6,
      groupName: "Manager Assessment",
    },

    // Employee Prompts
    {
      fieldKey: "employeeProgress",
      label: "What progress did you make?",
      type: "textarea",
      placeholder: "Employee's self-reported progress",
      required: true,
      sortOrder: 7,
      groupName: "Employee Input",
    },
    {
      fieldKey: "employeeObstacles",
      label: "What obstacles are you facing?",
      type: "textarea",
      placeholder: "Blockers, challenges, or risks the employee has identified",
      required: true,
      sortOrder: 8,
      groupName: "Employee Input",
    },
    {
      fieldKey: "employeeSupportNeeded",
      label: "What support do you need?",
      type: "textarea",
      placeholder: "Resources, help, or decisions the employee needs from their manager",
      required: true,
      sortOrder: 9,
      groupName: "Employee Input",
    },
  ],

  guardrails: [
    {
      name: "missing_manager_assessment",
      description: "Manager must provide progress observation",
      triggerCondition: { field: "managerProgressObserved", operator: "is_empty" },
      severity: "hard_stop" as const,
      message: "A check-in requires manager progress observations.",
    },
  ],

  artifactTemplates: [],
  guidedActions: [
    {
      label: "Coaching suggestions",
      description: "Get AI-powered coaching suggestions based on the check-in so far",
      icon: "Lightbulb",
      requiredInputs: ["employeeProgress", "employeeObstacles"],
      outputType: "analysis" as const,
      promptTemplate:
        "Based on this check-in data, suggest specific coaching actions for the manager. Employee progress: {{employeeProgress}}. Obstacles: {{employeeObstacles}}.",
    },
  ],
  textLibraryEntries: [],
};
```

**Step 2: Register the workflow**

In `apps/platform/src/lib/workflows/definitions/index.ts`, add:

```typescript
import { runCheckInWorkflow } from "./run-check-in";

// In registerAllWorkflows():
registerWorkflow(runCheckInWorkflow);
```

**Step 3: Verify**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Build succeeds.

**Step 4: Commit**

```
feat(workflows): add run-check-in workflow definition (GROW-104)
```

---

## Task 6: Add Performance Note Workflow Definition

**Files:**
- Create: `apps/platform/src/lib/workflows/definitions/add-performance-note.ts`
- Modify: `apps/platform/src/lib/workflows/definitions/index.ts`

**Step 1: Create the workflow definition**

Create `apps/platform/src/lib/workflows/definitions/add-performance-note.ts`:

```typescript
/**
 * Add Performance Note Workflow
 * AI-guided manager observation/feedback capture — per GROW teaching moments.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const addPerformanceNoteWorkflow: WorkflowDefinitionConfig = {
  slug: "add-performance-note",
  name: "Add Performance Note",
  description:
    "Capture a coaching moment, observation, or feedback about an employee. Notes are stored in the employee's record and visible during reviews.",
  category: "grow",
  audience: "manager",
  riskLevel: "low",
  estimatedMinutes: 5,
  icon: "FileText",

  intakeFields: [
    {
      fieldKey: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Which employee is this note about?",
      required: true,
      sortOrder: 1,
      groupName: "Employee",
    },
    {
      fieldKey: "employeeId",
      label: "Employee ID",
      type: "text",
      required: true,
      sortOrder: 2,
      groupName: "Employee",
    },
    {
      fieldKey: "noteType",
      label: "Note Type",
      type: "dropdown",
      required: true,
      sortOrder: 3,
      groupName: "Note Details",
      options: [
        { value: "observation", label: "Observation" },
        { value: "feedback", label: "Feedback" },
        { value: "coaching", label: "Coaching Moment" },
        { value: "recognition", label: "Recognition" },
        { value: "concern", label: "Concern" },
      ],
    },
    {
      fieldKey: "observation",
      label: "What happened?",
      type: "textarea",
      placeholder: "Describe the situation — what did you observe?",
      helpText: "Be specific: who, what, when, where. Stick to facts.",
      required: true,
      sortOrder: 4,
      groupName: "Note Details",
    },
    {
      fieldKey: "expectation",
      label: "Expectation or Feedback",
      type: "textarea",
      placeholder: "What was the expectation, or what feedback was given?",
      required: false,
      sortOrder: 5,
      groupName: "Note Details",
    },
    {
      fieldKey: "followUp",
      label: "Follow-up needed?",
      type: "dropdown",
      required: false,
      sortOrder: 6,
      groupName: "Note Details",
      options: [
        { value: "none", label: "No follow-up needed" },
        { value: "check_in", label: "Schedule a follow-up check-in" },
        { value: "goal", label: "Create a related goal" },
        { value: "escalate", label: "Escalate to HR" },
      ],
    },
  ],

  guardrails: [],
  artifactTemplates: [],
  guidedActions: [
    {
      label: "Help me write this objectively",
      description: "Get AI help writing a factual, objective note",
      icon: "PenLine",
      requiredInputs: ["observation"],
      outputType: "rewrite" as const,
      promptTemplate:
        "Rewrite this performance note to be more objective, factual, and professionally documented. Keep the key facts but remove subjective language. Original: {{observation}}",
    },
  ],
  textLibraryEntries: [],
};
```

**Step 2: Register the workflow**

In `apps/platform/src/lib/workflows/definitions/index.ts`, add:

```typescript
import { addPerformanceNoteWorkflow } from "./add-performance-note";

// In registerAllWorkflows():
registerWorkflow(addPerformanceNoteWorkflow);
```

**Step 3: Verify**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Build succeeds.

**Step 4: Commit**

```
feat(workflows): add performance-note workflow definition
```

---

## Task 7: Grow Workflow Tools (AI Tool Layer)

This is the core task — creating the AI tools that power the conversational Do tab for Grow > Performance System. These tools follow the same pattern as the existing corrective action tools in `workflow-tools.ts`.

**Files:**
- Create: `apps/platform/src/lib/ai/grow-tools.ts`
- Modify: `apps/platform/src/lib/ai/tools.ts` (register new tools)
- Modify: `apps/platform/src/lib/ai/prompts.ts` (add Grow workflow instructions to system prompt)
- Modify: `apps/platform/src/app/api/chat/route.ts` (wire up Grow tools and workflow memory)

**Step 1: Create grow-tools.ts**

Create `apps/platform/src/lib/ai/grow-tools.ts`. This file defines four tools:

1. `startGoalCreation` — Starts the create-goal workflow, returns first field prompt
2. `startCheckIn` — Starts the run-check-in workflow, fetches employee's active goals for the linkedGoals field options, returns first field prompt
3. `startPerformanceNote` — Starts the add-performance-note workflow, returns first field prompt
4. `completeGrowWorkflow` — Finalizes any Grow workflow: creates the Goal/CheckIn/PerformanceNote DB record from collected inputs, logs audit event

Follow the exact pattern from `workflow-tools.ts`:
- Use `startWorkflowRun()` from engine.ts to create the run
- Use `fieldToPromptPayload()` pattern to build field prompt JSON
- Wrap in `[ASCENTA_FIELD_PROMPT]...[/ASCENTA_FIELD_PROMPT]` delimiters
- Return `{ success, runId, fieldPrompt, fieldPromptBlock, collectedSoFar, stillNeeded }`

The `updateWorkflowField` tool from `workflow-tools.ts` is **reused as-is** — it's already generic and works with any workflow run.

For `completeGrowWorkflow`:
- Read the workflow run's `inputsSnapshot`
- Based on the workflow slug (`create-goal`, `run-check-in`, `add-performance-note`), create the appropriate DB record using the Goal/CheckIn/PerformanceNote models
- For goals: resolve employee by name/ID, create Goal with all fields, log audit event
- For check-ins: resolve employee, find linked goals, create CheckIn record with all prompt responses, log audit event
- For performance notes: resolve employee, create PerformanceNote, log audit event
- Update workflow run status to "completed"
- Return `{ success, message, recordId }`

**Step 2: Register tools in tools.ts**

In `apps/platform/src/lib/ai/tools.ts`, import the new tools and add them to `defaultChatTools`:

```typescript
import {
  startGoalCreationTool,
  startCheckInTool,
  startPerformanceNoteTool,
  completeGrowWorkflowTool,
} from "./grow-tools";

// Add to defaultChatTools object:
export const defaultChatTools = {
  // ...existing tools
  startGoalCreation: startGoalCreationTool,
  startCheckIn: startCheckInTool,
  startPerformanceNote: startPerformanceNoteTool,
  completeGrowWorkflow: completeGrowWorkflowTool,
};
```

**Step 3: Update system prompt**

In `apps/platform/src/lib/ai/prompts.ts`, add a new section to `DEFAULT_SYSTEM_PROMPT` for Grow workflows:

```typescript
## Grow > Performance System Workflows

When users want to create goals, run check-ins, or add performance notes:

**Goal Creation:**
1. Use getEmployeeInfo to look up the employee
2. Use startGoalCreation with the employee's details to begin
3. Walk through fields using field prompts — include fieldPromptBlock verbatim
4. When all fields collected (readyToGenerate), call completeGrowWorkflow to save the goal

**Check-In:**
1. Use getEmployeeInfo to look up the employee
2. Use startCheckIn — this will fetch the employee's active goals for selection
3. Walk through manager and employee prompts via field prompts
4. When complete, call completeGrowWorkflow to save the check-in

**Performance Note:**
1. Use getEmployeeInfo to look up the employee
2. Use startPerformanceNote to begin
3. Collect observation, expectation, note type
4. When complete, call completeGrowWorkflow to save the note

Same rules as corrective actions: include fieldPromptBlock verbatim, respect workflow memory, never re-ask collected fields.
```

**Step 4: Update chat route for Grow workflow memory**

In `apps/platform/src/app/api/chat/route.ts`, the existing `activeWorkflowRunId` + `getWorkflowStateSummary()` injection already works generically for any workflow. Verify this — no changes should be needed unless the route hardcodes "corrective" anywhere.

**Step 5: Verify**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Build succeeds. New tools are available in chat.

**Step 6: Commit**

```
feat(ai): add Grow workflow tools (goal, check-in, performance note)
```

---

## Task 8: Grow Status API Route

**Files:**
- Create: `apps/platform/src/app/api/grow/status/route.ts`

**Step 1: Create the Status API**

Create `apps/platform/src/app/api/grow/status/route.ts`:

This endpoint returns manager dashboard data:
- Direct reports with their goal counts and statuses
- Check-in completion rates (last 7, last 30 days)
- Overdue check-ins
- Goal progress summary per employee

```typescript
import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  if (!managerId) {
    return NextResponse.json({ error: "managerId required" }, { status: 400 });
  }

  const manager = await Employee.findById(managerId).lean();
  if (!manager) {
    return NextResponse.json({ error: "Manager not found" }, { status: 404 });
  }

  // Find direct reports (employees whose managerName matches this manager)
  const managerName = `${manager.firstName} ${manager.lastName}`;
  const directReports = await Employee.find({
    managerName: { $regex: new RegExp(managerName, "i") },
    status: "active",
  }).lean();

  const reportIds = directReports.map((e) => e._id);

  // Goals for direct reports
  const goals = await Goal.find({
    owner: { $in: reportIds },
    status: { $ne: "completed" },
  }).lean();

  // Check-ins for direct reports
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const checkInsLast30 = await CheckIn.find({
    employee: { $in: reportIds },
    dueDate: { $gte: thirtyDaysAgo },
  }).lean();

  const checkInsLast7 = checkInsLast30.filter(
    (c) => new Date(c.dueDate) >= sevenDaysAgo
  );

  const overdueCheckIns = await CheckIn.find({
    employee: { $in: reportIds },
    status: "scheduled",
    dueDate: { $lt: now },
  }).lean();

  // Build per-employee summary
  const employeeSummaries = directReports.map((emp) => {
    const empId = String(emp._id);
    const empGoals = goals.filter((g) => String(g.owner) === empId);
    const empCheckIns7 = checkInsLast7.filter((c) => String(c.employee) === empId);
    const empCheckIns30 = checkInsLast30.filter((c) => String(c.employee) === empId);
    const empOverdue = overdueCheckIns.filter((c) => String(c.employee) === empId);

    const completedLast7 = empCheckIns7.filter((c) => c.status === "completed").length;
    const totalLast7 = empCheckIns7.length;
    const completedLast30 = empCheckIns30.filter((c) => c.status === "completed").length;
    const totalLast30 = empCheckIns30.length;

    // Determine overall status from goals
    const hasOffTrack = empGoals.some((g) => g.status === "off_track");
    const hasNeedsAttention = empGoals.some((g) => g.status === "needs_attention");
    const overallStatus = hasOffTrack
      ? "off_track"
      : hasNeedsAttention
        ? "needs_attention"
        : "on_track";

    return {
      id: empId,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      jobTitle: emp.jobTitle,
      goalCount: empGoals.length,
      goalsByStatus: {
        on_track: empGoals.filter((g) => g.status === "on_track").length,
        needs_attention: empGoals.filter((g) => g.status === "needs_attention").length,
        off_track: empGoals.filter((g) => g.status === "off_track").length,
      },
      overallStatus,
      checkInCompletion7d: totalLast7 > 0 ? completedLast7 / totalLast7 : null,
      checkInCompletion30d: totalLast30 > 0 ? completedLast30 / totalLast30 : null,
      overdueCheckIns: empOverdue.length,
    };
  });

  // Aggregate stats
  const totalGoals = goals.length;
  const totalCompleted7 = checkInsLast7.filter((c) => c.status === "completed").length;
  const totalCheckIns7 = checkInsLast7.length;
  const totalCompleted30 = checkInsLast30.filter((c) => c.status === "completed").length;
  const totalCheckIns30 = checkInsLast30.length;

  return NextResponse.json({
    manager: { id: String(manager._id), name: managerName },
    summary: {
      directReportCount: directReports.length,
      totalActiveGoals: totalGoals,
      checkInCompletion7d: totalCheckIns7 > 0 ? totalCompleted7 / totalCheckIns7 : null,
      checkInCompletion30d: totalCheckIns30 > 0 ? totalCompleted30 / totalCheckIns30 : null,
      totalOverdueCheckIns: overdueCheckIns.length,
    },
    employees: employeeSummaries,
  });
}
```

**Step 2: Verify**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Build succeeds.

**Step 3: Commit**

```
feat(api): add Grow status API for manager dashboard (GROW-401/402)
```

---

## Task 9: Status Tab UI Component

**Files:**
- Create: `apps/platform/src/components/grow/status-dashboard.tsx`
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

**Step 1: Create the Status Dashboard component**

Create `apps/platform/src/components/grow/status-dashboard.tsx`:

Build a manager team dashboard component that:
- Fetches from `/api/grow/status?managerId=...` (use a hardcoded manager ID for now since no auth)
- Shows aggregate stats at top: direct report count, active goals, check-in completion rates, overdue count
- Shows a table/card list of direct reports with:
  - Employee name, department, job title
  - Goal count with colored status indicators (green = on_track, yellow = needs_attention, red = off_track)
  - Check-in completion % (last 7 / last 30 days)
  - Overdue check-in count (highlighted red if > 0)
- Uses shadcn/ui components: Card, Table, Badge
- Uses `cn()` from `@ascenta/ui` for class merging

**Step 2: Wire into the dynamic page**

Modify `apps/platform/src/app/[category]/[sub]/page.tsx` to render the StatusDashboard when `activeTab === "status"` and `pageKey === "grow/performance"`:

```typescript
import { StatusDashboard } from "@/components/grow/status-dashboard";

// In the render, replace the placeholder:
{activeTab === "status" && pageKey === "grow/performance" ? (
  <div className="flex-1 overflow-y-auto p-6">
    <BreadcrumbNav category={ctx.category.label} subPage={ctx.subPage.label} functionTab="Status" />
    <StatusDashboard />
  </div>
) : activeTab !== "do" ? (
  // ...existing placeholder
) : null}
```

**Step 3: Verify**

Run: `pnpm dev --filter=@ascenta/platform`
Navigate to Grow > Performance System > Status tab.
Expected: Dashboard renders (empty state if no seed data).

**Step 4: Commit**

```
feat(ui): add Grow status dashboard for manager view (GROW-401/402)
```

---

## Task 10: Learn Tab UI Component

**Files:**
- Create: `apps/platform/src/components/grow/learn-panel.tsx`
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

**Step 1: Create the Learn Panel component**

Create `apps/platform/src/components/grow/learn-panel.tsx`:

Build a static content panel with three sections using shadcn/ui Accordion or Card components:

1. **"What makes a good goal"** — Content about SMART goals, examples from each category group (Performance, Leadership, Development), tips on writing measurable success metrics.

2. **"How to write objective performance notes"** — Guidance on sticking to facts, avoiding subjective language, the observation → expectation → follow-up structure, examples of good vs. bad notes.

3. **"Effective check-in conversations"** — Framework for manager check-ins: prepare with data, ask open-ended questions, listen for blockers, document coaching moments, end with clear next steps.

Use the shadcn/ui Accordion component for expandable sections. Each section should have a clear heading, 2-3 paragraphs, and concrete examples.

**Step 2: Wire into the dynamic page**

Similar to Status tab — render LearnPanel when `activeTab === "learn"` and `pageKey === "grow/performance"`.

**Step 3: Verify**

Run: `pnpm dev --filter=@ascenta/platform`
Navigate to Grow > Performance System > Learn tab.
Expected: Static content renders in accordion sections.

**Step 4: Commit**

```
feat(ui): add Grow learn panel with goal/note/check-in guidance
```

---

## Task 11: Seed Script

**Files:**
- Create: `scripts/seed-grow.ts`

**Step 1: Create the seed script**

Create `scripts/seed-grow.ts` that:
- Connects to MongoDB using `connectDB()`
- Finds existing employees from `pnpm db:seed`
- Creates 5 sample goals across different categories and statuses
- Creates 3-4 check-ins (mix of completed, scheduled, and overdue)
- Creates 2-3 performance notes of different types
- Logs what was created

Follow the existing pattern from `packages/db/scripts/seed-employees.ts`.

**Step 2: Add a package.json script**

In root `package.json`, add:

```json
"db:seed-grow": "npx tsx scripts/seed-grow.ts"
```

**Step 3: Verify**

Run: `pnpm db:seed && pnpm db:seed-grow`
Expected: Seed data created. Status dashboard shows populated data.

**Step 4: Commit**

```
feat(scripts): add Grow module seed script with sample goals/check-ins/notes
```

---

## Task 12: End-to-End Verification

**Step 1: Start dev server**

Run: `pnpm dev --filter=@ascenta/platform`

**Step 2: Test Do tab — Goal Creation**

Navigate to Grow > Performance System > Do tab.
Type: "Create a goal for [seeded employee name]"
Expected: AI calls getEmployeeInfo, then startGoalCreation, walks through fields with button selections.

**Step 3: Test Do tab — Check-In**

Type: "Run a check-in with [employee name]"
Expected: AI calls startCheckIn, shows active goals for selection, walks through prompts.

**Step 4: Test Do tab — Performance Note**

Type: "Add a performance note for [employee name]"
Expected: AI calls startPerformanceNote, walks through observation/expectation capture.

**Step 5: Test Status tab**

Click Status tab.
Expected: Dashboard shows employee with goals created in step 2, status indicators visible.

**Step 6: Test Learn tab**

Click Learn tab.
Expected: Static content renders with all three sections.

**Step 7: Commit any fixes**

```
fix: end-to-end fixes for Grow performance system
```

---

## Dependency Order

```
Task 1 (Goal Schema)
Task 2 (CheckIn Schema)      ─── can run in parallel
Task 3 (PerformanceNote Schema)

Task 4 (Goal Workflow Def)
Task 5 (CheckIn Workflow Def)  ─── can run in parallel, depend on Tasks 1-3
Task 6 (PerfNote Workflow Def)

Task 7 (Grow Tools)            ─── depends on Tasks 4-6

Task 8 (Status API)            ─── depends on Tasks 1-2
Task 9 (Status Tab UI)         ─── depends on Task 8

Task 10 (Learn Tab UI)         ─── independent, can run anytime

Task 11 (Seed Script)          ─── depends on Tasks 1-3
Task 12 (E2E Verification)     ─── depends on all
```
