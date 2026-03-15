# Working Document Pattern Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace inline chat form fields with a side-panel working document for Grow workflows (goal creation, check-ins, performance notes).

**Architecture:** When AI invokes a Grow workflow, instead of returning `[ASCENTA_FIELD_PROMPT]` blocks one-at-a-time, a new tool returns all pre-filled values at once. The frontend opens a working document form panel to the right of the chat. Users edit the form directly or via chat. Submission is a standard form POST with Zod validation.

**Tech Stack:** Next.js 16 (App Router, RSC) / React 19 / React Hook Form / Zod / Tailwind CSS v4 / shadcn/ui / Mongoose / Vercel AI SDK

**Design Doc:** `docs/plans/2026-03-07-working-document-pattern-design.md`

---

## Task 1: Zod Validation Schemas for Grow Forms

Create Zod schemas that mirror the intake field definitions for each Grow workflow. These will be used by both the forms (client-side) and the API routes (server-side).

**Files:**
- Create: `apps/platform/src/lib/validations/goal.ts`
- Create: `apps/platform/src/lib/validations/check-in.ts`
- Create: `apps/platform/src/lib/validations/performance-note.ts`

**Step 1: Create goal validation schema**

Reference the intake fields in `apps/platform/src/lib/workflows/definitions/create-goal.ts` (13 fields) and the Goal model in `packages/db/src/goal-schema.ts` for enum values.

```typescript
// apps/platform/src/lib/validations/goal.ts
import { z } from "zod";
import {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_GROUPS,
  MEASUREMENT_TYPES,
  CHECKIN_CADENCES,
  ALIGNMENT_TYPES,
} from "@ascenta/db/goal-schema";

export const goalFormSchema = z
  .object({
    employeeName: z.string().min(1, "Employee name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    title: z.string().min(1, "Goal title is required").max(200),
    description: z.string().min(1, "Description is required"),
    categoryGroup: z.enum(
      GOAL_CATEGORY_GROUPS.map((g) => g.value) as [string, ...string[]],
      { required_error: "Category group is required" }
    ),
    category: z.enum(GOAL_CATEGORIES as [string, ...string[]], {
      required_error: "Category is required",
    }),
    measurementType: z.enum(MEASUREMENT_TYPES as [string, ...string[]], {
      required_error: "Measurement type is required",
    }),
    successMetric: z.string().min(1, "Success metric is required"),
    timePeriod: z.enum(
      ["Q1", "Q2", "Q3", "Q4", "H1", "H2", "annual", "custom"] as [
        string,
        ...string[],
      ],
      { required_error: "Time period is required" }
    ),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
    checkInCadence: z.enum(CHECKIN_CADENCES as [string, ...string[]], {
      required_error: "Check-in cadence is required",
    }),
    alignment: z.enum(ALIGNMENT_TYPES as [string, ...string[]], {
      required_error: "Alignment is required",
    }),
  })
  .refine(
    (data) => {
      if (data.timePeriod === "custom") {
        return !!data.customStartDate && !!data.customEndDate;
      }
      return true;
    },
    {
      message: "Custom dates are required when time period is 'custom'",
      path: ["customStartDate"],
    }
  );

export type GoalFormValues = z.infer<typeof goalFormSchema>;
```

**Step 2: Create check-in validation schema**

Reference `apps/platform/src/lib/workflows/definitions/run-check-in.ts` (8 fields) and `packages/db/src/checkin-schema.ts`.

```typescript
// apps/platform/src/lib/validations/check-in.ts
import { z } from "zod";

export const checkInFormSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  linkedGoals: z
    .array(z.string())
    .min(1, "At least one goal must be linked"),
  managerProgressObserved: z
    .string()
    .min(1, "Manager progress observation is required"),
  managerCoachingNeeded: z
    .string()
    .min(1, "Coaching needs assessment is required"),
  managerRecognition: z.string().optional(),
  employeeProgress: z
    .string()
    .min(1, "Employee progress update is required"),
  employeeObstacles: z
    .string()
    .min(1, "Employee obstacles assessment is required"),
  employeeSupportNeeded: z.string().optional(),
});

export type CheckInFormValues = z.infer<typeof checkInFormSchema>;
```

**Step 3: Create performance note validation schema**

Reference `apps/platform/src/lib/workflows/definitions/add-performance-note.ts` (6 fields) and `packages/db/src/performance-note-schema.ts`.

```typescript
// apps/platform/src/lib/validations/performance-note.ts
import { z } from "zod";
import { NOTE_TYPES } from "@ascenta/db/performance-note-schema";

export const performanceNoteFormSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  noteType: z.enum(NOTE_TYPES as [string, ...string[]], {
    required_error: "Note type is required",
  }),
  observation: z.string().min(1, "Observation is required"),
  expectation: z.string().optional(),
  followUp: z
    .enum(["none", "check_in", "goal", "escalate"])
    .optional()
    .default("none"),
});

export type PerformanceNoteFormValues = z.infer<
  typeof performanceNoteFormSchema
>;
```

**Step 4: Verify schemas compile**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors related to the new validation files.

**Step 5: Commit**

```bash
git add apps/platform/src/lib/validations/
git commit -m "feat: add Zod validation schemas for Grow workflow forms"
```

---

## Task 2: Working Document State in Chat Context

Add working document state management to the existing `ChatContext`. This tracks whether a working document is open, its workflow type, run ID, and current field values.

**Files:**
- Modify: `apps/platform/src/lib/chat/chat-context.tsx`

**Step 1: Add working document types and state**

Add these types and state to the existing chat context. The `WorkingDocumentState` tracks the open panel, and methods allow both chat and form to update fields.

At the top of `chat-context.tsx`, add these types (after existing interfaces around line 30):

```typescript
export interface WorkingDocumentState {
  isOpen: boolean;
  workflowType: "create-goal" | "run-check-in" | "add-performance-note" | null;
  runId: string | null;
  employeeId: string | null;
  employeeName: string | null;
  fields: Record<string, unknown>;
  /** For check-ins: available goals to link */
  availableGoals?: { id: string; title: string }[];
}

const INITIAL_WORKING_DOC: WorkingDocumentState = {
  isOpen: false,
  workflowType: null,
  runId: null,
  employeeId: null,
  employeeName: null,
  fields: {},
};
```

Add to `ChatContextValue` interface:

```typescript
workingDocument: WorkingDocumentState;
openWorkingDocument: (
  workflowType: WorkingDocumentState["workflowType"],
  runId: string,
  employeeId: string,
  employeeName: string,
  prefilled: Record<string, unknown>,
  availableGoals?: { id: string; title: string }[]
) => void;
updateWorkingDocumentField: (fieldKey: string, value: unknown) => void;
updateWorkingDocumentFields: (updates: Record<string, unknown>) => void;
closeWorkingDocument: () => void;
submitWorkingDocument: (pageKey: string) => Promise<void>;
```

**Step 2: Implement working document state and methods in the provider**

Inside `ChatProvider`, add state and methods (after existing state declarations):

```typescript
const [workingDocument, setWorkingDocument] =
  useState<WorkingDocumentState>(INITIAL_WORKING_DOC);

const openWorkingDocument = useCallback(
  (
    workflowType: WorkingDocumentState["workflowType"],
    runId: string,
    employeeId: string,
    employeeName: string,
    prefilled: Record<string, unknown>,
    availableGoals?: { id: string; title: string }[]
  ) => {
    setWorkingDocument({
      isOpen: true,
      workflowType,
      runId,
      employeeId,
      employeeName,
      fields: prefilled,
      availableGoals,
    });
  },
  []
);

const updateWorkingDocumentField = useCallback(
  (fieldKey: string, value: unknown) => {
    setWorkingDocument((prev) => ({
      ...prev,
      fields: { ...prev.fields, [fieldKey]: value },
    }));
  },
  []
);

const updateWorkingDocumentFields = useCallback(
  (updates: Record<string, unknown>) => {
    setWorkingDocument((prev) => ({
      ...prev,
      fields: { ...prev.fields, ...updates },
    }));
  },
  []
);

const closeWorkingDocument = useCallback(() => {
  setWorkingDocument(INITIAL_WORKING_DOC);
}, []);
```

**Step 3: Implement submitWorkingDocument**

This method calls the appropriate API route based on workflow type, then closes the working document and posts a confirmation message to chat.

```typescript
const submitWorkingDocument = useCallback(
  async (pageKey: string) => {
    const { workflowType, runId, fields, employeeId, employeeName } =
      workingDocument;
    if (!workflowType || !runId) return;

    const routeMap: Record<string, string> = {
      "create-goal": "/api/grow/goals",
      "run-check-in": "/api/grow/check-ins",
      "add-performance-note": "/api/grow/performance-notes",
    };

    const route = routeMap[workflowType];
    if (!route) return;

    const res = await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, employeeId, employeeName, runId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to submit");
    }

    const result = await res.json();

    // Add confirmation message to chat
    setConversations((prev) => {
      const next = new Map(prev);
      const page = next.get(pageKey) ?? {
        messages: [],
        conversationId: undefined,
        isLoading: false,
        input: "",
      };
      next.set(pageKey, {
        ...page,
        messages: [
          ...page.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: result.message || `Successfully saved ${workflowType}.`,
          },
        ],
      });
      return next;
    });

    closeWorkingDocument();
  },
  [workingDocument, closeWorkingDocument]
);
```

**Step 4: Add to context value**

In the `useMemo` that builds the context value, add the new properties:

```typescript
workingDocument,
openWorkingDocument,
updateWorkingDocumentField,
updateWorkingDocumentFields,
closeWorkingDocument,
submitWorkingDocument,
```

**Step 5: Verify types compile**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors.

**Step 6: Commit**

```bash
git add apps/platform/src/lib/chat/chat-context.tsx
git commit -m "feat: add working document state management to ChatContext"
```

---

## Task 3: Working Document Form Components

Create the form components for each Grow workflow type. These use React Hook Form + Zod + shadcn/ui components.

**Files:**
- Create: `apps/platform/src/components/grow/working-document.tsx`
- Create: `apps/platform/src/components/grow/forms/goal-creation-form.tsx`
- Create: `apps/platform/src/components/grow/forms/check-in-form.tsx`
- Create: `apps/platform/src/components/grow/forms/performance-note-form.tsx`

**Reference files for field definitions:**
- `apps/platform/src/lib/workflows/definitions/create-goal.ts` (intake fields, options)
- `apps/platform/src/lib/workflows/definitions/run-check-in.ts`
- `apps/platform/src/lib/workflows/definitions/add-performance-note.ts`

**Reference files for shadcn components available:**
- Check `packages/ui/src/components/` for available UI primitives (button, input, select, textarea, label, form, etc.)

**Step 1: Create the GoalCreationForm component**

This is the largest form (13 fields). It uses React Hook Form with the Zod schema from Task 1. Fields match the intake fields from the `create-goal` workflow definition. The form receives `initialValues` from the AI pre-fill and `onFieldChange` to sync back to chat context.

```typescript
// apps/platform/src/components/grow/forms/goal-creation-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  goalFormSchema,
  type GoalFormValues,
} from "@/lib/validations/goal";
import { Button } from "@ascenta/ui/components/button";
import { Input } from "@ascenta/ui/components/input";
import { Textarea } from "@ascenta/ui/components/textarea";
import { Label } from "@ascenta/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/components/select";
import { useEffect } from "react";

// Options from create-goal.ts workflow definition
const CATEGORY_GROUP_OPTIONS = [
  { value: "performance", label: "Performance & Results" },
  { value: "leadership", label: "Leadership & Management" },
  { value: "development", label: "Professional Development" },
];

const CATEGORY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  performance: [
    { value: "productivity", label: "Productivity" },
    { value: "quality", label: "Quality" },
    { value: "accuracy", label: "Accuracy" },
    { value: "efficiency", label: "Efficiency" },
    { value: "customer_satisfaction", label: "Customer Satisfaction" },
    { value: "revenue", label: "Revenue" },
  ],
  leadership: [
    { value: "team_building", label: "Team Building" },
    { value: "mentoring", label: "Mentoring" },
    { value: "communication", label: "Communication" },
    { value: "decision_making", label: "Decision Making" },
    { value: "strategic_thinking", label: "Strategic Thinking" },
  ],
  development: [
    { value: "technical_skills", label: "Technical Skills" },
    { value: "certifications", label: "Certifications" },
    { value: "cross_training", label: "Cross-Training" },
    { value: "innovation", label: "Innovation" },
    { value: "process_improvement", label: "Process Improvement" },
  ],
};

const MEASUREMENT_OPTIONS = [
  { value: "numeric_metric", label: "Numeric Metric" },
  { value: "percentage_target", label: "Percentage Target" },
  { value: "milestone_completion", label: "Milestone Completion" },
  { value: "behavior_change", label: "Behavior Change" },
  { value: "learning_completion", label: "Learning Completion" },
];

const TIME_PERIOD_OPTIONS = [
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
  { value: "H1", label: "H1 (First Half)" },
  { value: "H2", label: "H2 (Second Half)" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

const CADENCE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "milestone", label: "Milestone-based" },
  { value: "manager_scheduled", label: "Manager Scheduled" },
];

const ALIGNMENT_OPTIONS = [
  { value: "mission", label: "Company Mission" },
  { value: "value", label: "Core Value" },
  { value: "priority", label: "Strategic Priority" },
];

interface GoalCreationFormProps {
  initialValues: Partial<GoalFormValues>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function GoalCreationForm({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: GoalCreationFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      title: "",
      description: "",
      categoryGroup: undefined,
      category: undefined,
      measurementType: undefined,
      successMetric: "",
      timePeriod: undefined,
      customStartDate: "",
      customEndDate: "",
      checkInCadence: undefined,
      alignment: undefined,
      ...initialValues,
    },
  });

  const watchTimePeriod = form.watch("timePeriod");
  const watchCategoryGroup = form.watch("categoryGroup");

  // Sync form changes back to chat context
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name && values[name as keyof GoalFormValues] !== undefined) {
        onFieldChange(name, values[name as keyof GoalFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFieldChange]);

  const handleSubmit = form.handleSubmit(async () => {
    await onSubmit();
  });

  const categoryOptions = watchCategoryGroup
    ? CATEGORY_OPTIONS[watchCategoryGroup] ?? []
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Employee info (read-only, pre-filled by AI) */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-sm font-medium">
          {form.getValues("employeeName")}
        </p>
        <p className="text-xs text-muted-foreground">
          ID: {form.getValues("employeeId")}
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          placeholder="A short, clear title for this goal"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe what this goal aims to achieve"
          rows={3}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Category Group */}
      <div className="space-y-1.5">
        <Label>Category Group *</Label>
        <Select
          value={form.watch("categoryGroup") ?? ""}
          onValueChange={(v) => {
            form.setValue("categoryGroup", v, { shouldValidate: true });
            form.setValue("category", "" as never);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category group" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_GROUP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.categoryGroup && (
          <p className="text-xs text-destructive">
            {form.formState.errors.categoryGroup.message}
          </p>
        )}
      </div>

      {/* Category (conditional on categoryGroup) */}
      {watchCategoryGroup && (
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select
            value={form.watch("category") ?? ""}
            onValueChange={(v) =>
              form.setValue("category", v, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-xs text-destructive">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>
      )}

      {/* Measurement Type */}
      <div className="space-y-1.5">
        <Label>Measurement Type *</Label>
        <Select
          value={form.watch("measurementType") ?? ""}
          onValueChange={(v) =>
            form.setValue("measurementType", v, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="How will this goal be measured?" />
          </SelectTrigger>
          <SelectContent>
            {MEASUREMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.measurementType && (
          <p className="text-xs text-destructive">
            {form.formState.errors.measurementType.message}
          </p>
        )}
      </div>

      {/* Success Metric */}
      <div className="space-y-1.5">
        <Label htmlFor="successMetric">Success Metric *</Label>
        <Textarea
          id="successMetric"
          placeholder="Define what success looks like"
          rows={2}
          {...form.register("successMetric")}
        />
        {form.formState.errors.successMetric && (
          <p className="text-xs text-destructive">
            {form.formState.errors.successMetric.message}
          </p>
        )}
      </div>

      {/* Time Period */}
      <div className="space-y-1.5">
        <Label>Time Period *</Label>
        <Select
          value={form.watch("timePeriod") ?? ""}
          onValueChange={(v) =>
            form.setValue("timePeriod", v, { shouldValidate: true })
          }
        >
          <SelectTrigger>
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
        {form.formState.errors.timePeriod && (
          <p className="text-xs text-destructive">
            {form.formState.errors.timePeriod.message}
          </p>
        )}
      </div>

      {/* Custom dates (conditional) */}
      {watchTimePeriod === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="customStartDate">Start Date *</Label>
            <Input
              id="customStartDate"
              type="date"
              {...form.register("customStartDate")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customEndDate">End Date *</Label>
            <Input
              id="customEndDate"
              type="date"
              {...form.register("customEndDate")}
            />
          </div>
        </div>
      )}

      {/* Check-in Cadence */}
      <div className="space-y-1.5">
        <Label>Check-in Cadence *</Label>
        <Select
          value={form.watch("checkInCadence") ?? ""}
          onValueChange={(v) =>
            form.setValue("checkInCadence", v, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="How often to check in" />
          </SelectTrigger>
          <SelectContent>
            {CADENCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.checkInCadence && (
          <p className="text-xs text-destructive">
            {form.formState.errors.checkInCadence.message}
          </p>
        )}
      </div>

      {/* Alignment */}
      <div className="space-y-1.5">
        <Label>Alignment *</Label>
        <Select
          value={form.watch("alignment") ?? ""}
          onValueChange={(v) =>
            form.setValue("alignment", v, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="What does this align to?" />
          </SelectTrigger>
          <SelectContent>
            {ALIGNMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.alignment && (
          <p className="text-xs text-destructive">
            {form.formState.errors.alignment.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background pb-2">
        <Button type="submit" className="flex-1">
          Create Goal
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

**Step 2: Create the CheckInForm component**

Simpler form with 8 fields. The `linkedGoals` field uses checkbox-style selection from `availableGoals` prop (dynamically populated goals the employee has).

```typescript
// apps/platform/src/components/grow/forms/check-in-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkInFormSchema,
  type CheckInFormValues,
} from "@/lib/validations/check-in";
import { Button } from "@ascenta/ui/components/button";
import { Textarea } from "@ascenta/ui/components/textarea";
import { Label } from "@ascenta/ui/components/label";
import { cn } from "@ascenta/ui";
import { useEffect } from "react";

interface CheckInFormProps {
  initialValues: Partial<CheckInFormValues>;
  availableGoals: { id: string; title: string }[];
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function CheckInForm({
  initialValues,
  availableGoals,
  onFieldChange,
  onSubmit,
  onCancel,
}: CheckInFormProps) {
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      linkedGoals: [],
      managerProgressObserved: "",
      managerCoachingNeeded: "",
      managerRecognition: "",
      employeeProgress: "",
      employeeObstacles: "",
      employeeSupportNeeded: "",
      ...initialValues,
    },
  });

  const selectedGoals = form.watch("linkedGoals") ?? [];

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name && values[name as keyof CheckInFormValues] !== undefined) {
        onFieldChange(name, values[name as keyof CheckInFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFieldChange]);

  const toggleGoal = (goalId: string) => {
    const current = form.getValues("linkedGoals") ?? [];
    const next = current.includes(goalId)
      ? current.filter((id) => id !== goalId)
      : [...current, goalId];
    form.setValue("linkedGoals", next, { shouldValidate: true });
  };

  const handleSubmit = form.handleSubmit(async () => {
    await onSubmit();
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-sm font-medium">
          {form.getValues("employeeName")}
        </p>
        <p className="text-xs text-muted-foreground">
          ID: {form.getValues("employeeId")}
        </p>
      </div>

      {/* Linked Goals */}
      <div className="space-y-1.5">
        <Label>Linked Goals *</Label>
        <div className="flex flex-wrap gap-2">
          {availableGoals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition-colors",
                selectedGoals.includes(goal.id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted hover:bg-muted/80 border-border"
              )}
            >
              {goal.title}
            </button>
          ))}
        </div>
        {form.formState.errors.linkedGoals && (
          <p className="text-xs text-destructive">
            {form.formState.errors.linkedGoals.message}
          </p>
        )}
      </div>

      {/* Manager Assessment Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Manager Assessment
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="managerProgressObserved">
            Progress Observed *
          </Label>
          <Textarea
            id="managerProgressObserved"
            placeholder="What progress have you observed?"
            rows={3}
            {...form.register("managerProgressObserved")}
          />
          {form.formState.errors.managerProgressObserved && (
            <p className="text-xs text-destructive">
              {form.formState.errors.managerProgressObserved.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="managerCoachingNeeded">
            Coaching Needed *
          </Label>
          <Textarea
            id="managerCoachingNeeded"
            placeholder="What coaching or support is needed?"
            rows={3}
            {...form.register("managerCoachingNeeded")}
          />
          {form.formState.errors.managerCoachingNeeded && (
            <p className="text-xs text-destructive">
              {form.formState.errors.managerCoachingNeeded.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="managerRecognition">Recognition</Label>
          <Textarea
            id="managerRecognition"
            placeholder="Any recognition or praise (optional)"
            rows={2}
            {...form.register("managerRecognition")}
          />
        </div>
      </div>

      {/* Employee Input Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Employee Input
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="employeeProgress">Progress Update *</Label>
          <Textarea
            id="employeeProgress"
            placeholder="Employee's self-reported progress"
            rows={3}
            {...form.register("employeeProgress")}
          />
          {form.formState.errors.employeeProgress && (
            <p className="text-xs text-destructive">
              {form.formState.errors.employeeProgress.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employeeObstacles">Obstacles *</Label>
          <Textarea
            id="employeeObstacles"
            placeholder="What obstacles is the employee facing?"
            rows={3}
            {...form.register("employeeObstacles")}
          />
          {form.formState.errors.employeeObstacles && (
            <p className="text-xs text-destructive">
              {form.formState.errors.employeeObstacles.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employeeSupportNeeded">Support Needed</Label>
          <Textarea
            id="employeeSupportNeeded"
            placeholder="What support does the employee need? (optional)"
            rows={2}
            {...form.register("employeeSupportNeeded")}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background pb-2">
        <Button type="submit" className="flex-1">
          Complete Check-In
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

**Step 3: Create the PerformanceNoteForm component**

The simplest form (6 fields).

```typescript
// apps/platform/src/components/grow/forms/performance-note-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  performanceNoteFormSchema,
  type PerformanceNoteFormValues,
} from "@/lib/validations/performance-note";
import { Button } from "@ascenta/ui/components/button";
import { Textarea } from "@ascenta/ui/components/textarea";
import { Label } from "@ascenta/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/components/select";
import { useEffect } from "react";

const NOTE_TYPE_OPTIONS = [
  { value: "observation", label: "Observation" },
  { value: "feedback", label: "Feedback" },
  { value: "coaching", label: "Coaching" },
  { value: "recognition", label: "Recognition" },
  { value: "concern", label: "Concern" },
];

const FOLLOW_UP_OPTIONS = [
  { value: "none", label: "None" },
  { value: "check_in", label: "Schedule Check-In" },
  { value: "goal", label: "Create Goal" },
  { value: "escalate", label: "Escalate" },
];

interface PerformanceNoteFormProps {
  initialValues: Partial<PerformanceNoteFormValues>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function PerformanceNoteForm({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: PerformanceNoteFormProps) {
  const form = useForm<PerformanceNoteFormValues>({
    resolver: zodResolver(performanceNoteFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      noteType: undefined,
      observation: "",
      expectation: "",
      followUp: "none",
      ...initialValues,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (
        name &&
        values[name as keyof PerformanceNoteFormValues] !== undefined
      ) {
        onFieldChange(
          name,
          values[name as keyof PerformanceNoteFormValues]
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFieldChange]);

  const handleSubmit = form.handleSubmit(async () => {
    await onSubmit();
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-sm font-medium">
          {form.getValues("employeeName")}
        </p>
        <p className="text-xs text-muted-foreground">
          ID: {form.getValues("employeeId")}
        </p>
      </div>

      {/* Note Type */}
      <div className="space-y-1.5">
        <Label>Note Type *</Label>
        <Select
          value={form.watch("noteType") ?? ""}
          onValueChange={(v) =>
            form.setValue("noteType", v as PerformanceNoteFormValues["noteType"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select note type" />
          </SelectTrigger>
          <SelectContent>
            {NOTE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.noteType && (
          <p className="text-xs text-destructive">
            {form.formState.errors.noteType.message}
          </p>
        )}
      </div>

      {/* Observation */}
      <div className="space-y-1.5">
        <Label htmlFor="observation">Observation *</Label>
        <Textarea
          id="observation"
          placeholder="Describe what you observed"
          rows={4}
          {...form.register("observation")}
        />
        {form.formState.errors.observation && (
          <p className="text-xs text-destructive">
            {form.formState.errors.observation.message}
          </p>
        )}
      </div>

      {/* Expectation */}
      <div className="space-y-1.5">
        <Label htmlFor="expectation">Expectation</Label>
        <Textarea
          id="expectation"
          placeholder="What was the expected behavior? (optional)"
          rows={2}
          {...form.register("expectation")}
        />
      </div>

      {/* Follow Up */}
      <div className="space-y-1.5">
        <Label>Follow-Up Action</Label>
        <Select
          value={form.watch("followUp") ?? "none"}
          onValueChange={(v) =>
            form.setValue("followUp", v as PerformanceNoteFormValues["followUp"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select follow-up action" />
          </SelectTrigger>
          <SelectContent>
            {FOLLOW_UP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background pb-2">
        <Button type="submit" className="flex-1">
          Save Note
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

**Step 4: Create the WorkingDocument container**

This component wraps the appropriate form based on workflow type and connects to the chat context.

```typescript
// apps/platform/src/components/grow/working-document.tsx
"use client";

import { useChat } from "@/lib/chat/chat-context";
import { GoalCreationForm } from "./forms/goal-creation-form";
import { CheckInForm } from "./forms/check-in-form";
import { PerformanceNoteForm } from "./forms/performance-note-form";
import { X } from "lucide-react";
import { Button } from "@ascenta/ui/components/button";

const TITLES: Record<string, string> = {
  "create-goal": "Create Goal",
  "run-check-in": "Run Check-In",
  "add-performance-note": "Performance Note",
};

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

  if (!workingDocument.isOpen || !workingDocument.workflowType) {
    return null;
  }

  const title = TITLES[workingDocument.workflowType] ?? "Working Document";

  const handleSubmit = async () => {
    await submitWorkingDocument(pageKey);
  };

  return (
    <div className="flex h-full flex-col border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={closeWorkingDocument}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form content */}
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
```

**Step 5: Verify types compile**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors.

**Step 6: Commit**

```bash
git add apps/platform/src/components/grow/
git commit -m "feat: add working document container and Grow workflow form components"
```

---

## Task 4: Integrate Working Document into Page Layout

Modify the `DoTabChat` component (or its parent) to show the working document panel alongside chat when a workflow is active.

**Files:**
- Modify: `apps/platform/src/components/do-tab-chat.tsx`

**Step 1: Add working document to the DoTabChat layout**

The `DoTabChat` component currently takes full width. When `workingDocument.isOpen`, it should split into a two-panel layout: chat on the left (~50%), working document on the right (~50%).

Wrap the existing chat content in a flex container and conditionally render the `WorkingDocument` panel. Import `WorkingDocument` and `useChat` to access the working document state.

At the top of the component, add:
```typescript
import { WorkingDocument } from "./grow/working-document";
```

Then wrap the entire return JSX in a flex container. The existing chat content becomes the left panel, and `WorkingDocument` conditionally renders on the right:

```tsx
// Outer wrapper — replace the current root element
<div className="flex h-full">
  {/* Left panel: existing chat content */}
  <div className={cn(
    "flex flex-col h-full transition-all duration-300",
    workingDocument.isOpen ? "w-1/2" : "w-full"
  )}>
    {/* ... existing DoTabChat content unchanged ... */}
  </div>

  {/* Right panel: working document (conditional) */}
  {workingDocument.isOpen && (
    <div className="w-1/2 h-full">
      <WorkingDocument pageKey={pageKey} />
    </div>
  )}
</div>
```

The `workingDocument` state comes from the existing `useChat()` hook already used in this component.

**Step 2: Verify the layout renders correctly**

Run: `pnpm dev --filter=@ascenta/platform`
Navigate to `/grow/performance`, start a conversation. The chat should take full width. (Working document won't open yet since the AI tools haven't been updated — that's Task 6.)

**Step 3: Commit**

```bash
git add apps/platform/src/components/do-tab-chat.tsx
git commit -m "feat: integrate working document panel into DoTabChat layout"
```

---

## Task 5: API Routes for Direct Form Submission

Create the API routes that the working document forms submit to. These replace the chat-driven `completeGrowWorkflowTool` path for form submissions.

**Files:**
- Create: `apps/platform/src/app/api/grow/goals/route.ts`
- Create: `apps/platform/src/app/api/grow/check-ins/route.ts`
- Create: `apps/platform/src/app/api/grow/performance-notes/route.ts`

**Reference:** The record creation logic in `completeGrowWorkflowTool` at `apps/platform/src/lib/ai/grow-tools.ts:329-458`. The new API routes replicate this logic but accept form data directly instead of reading from workflow run inputs.

**Step 1: Create the goals API route**

```typescript
// apps/platform/src/app/api/grow/goals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { Employee } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { goalFormSchema } from "@/lib/validations/goal";
import { parseTimePeriod } from "@/lib/ai/grow-tools";
import { logAuditEvent } from "@/lib/workflows/engine";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = goalFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data } = parsed;
    const { runId } = body;

    // Look up employee for owner/manager refs
    const employee = await Employee.findOne({
      $or: [
        { employeeId: data.employeeId },
        { _id: data.employeeId },
      ],
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Find manager
    const manager = employee.managerName
      ? await Employee.findOne({ name: employee.managerName })
      : null;

    const timePeriod = parseTimePeriod(
      data.timePeriod,
      data.customStartDate,
      data.customEndDate
    );

    const goal = await Goal.create({
      title: data.title,
      description: data.description,
      category: data.category,
      measurementType: data.measurementType,
      successMetric: data.successMetric,
      timePeriod,
      checkInCadence: data.checkInCadence,
      alignment: data.alignment,
      owner: employee._id,
      manager: manager?._id ?? null,
      status: "on_track",
      workflowRunId: runId ?? null,
    });

    // Complete workflow run if exists
    if (runId) {
      await WorkflowRun.findByIdAndUpdate(runId, {
        status: "completed",
        completedAt: new Date(),
        currentStep: "completed",
      });

      await logAuditEvent({
        workflowRunId: runId,
        actorId: "anonymous",
        actorType: "user",
        action: "goal_created",
        description: `Goal "${data.title}" created for ${data.employeeName}`,
        metadata: { recordId: goal._id.toString(), recordType: "goal" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Goal "${data.title}" has been created for ${data.employeeName}.`,
      goalId: goal._id.toString(),
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create the check-ins API route**

```typescript
// apps/platform/src/app/api/grow/check-ins/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { checkInFormSchema } from "@/lib/validations/check-in";
import { logAuditEvent } from "@/lib/workflows/engine";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = checkInFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data } = parsed;
    const { runId } = body;

    const employee = await Employee.findOne({
      $or: [
        { employeeId: data.employeeId },
        { _id: data.employeeId },
      ],
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const manager = employee.managerName
      ? await Employee.findOne({ name: employee.managerName })
      : null;

    const checkIn = await CheckIn.create({
      goals: data.linkedGoals,
      employee: employee._id,
      manager: manager?._id ?? null,
      completedAt: new Date(),
      managerProgressObserved: data.managerProgressObserved,
      managerCoachingNeeded: data.managerCoachingNeeded,
      managerRecognition: data.managerRecognition || null,
      employeeProgress: data.employeeProgress,
      employeeObstacles: data.employeeObstacles,
      employeeSupportNeeded: data.employeeSupportNeeded || null,
      status: "completed",
      workflowRunId: runId ?? null,
    });

    if (runId) {
      await WorkflowRun.findByIdAndUpdate(runId, {
        status: "completed",
        completedAt: new Date(),
        currentStep: "completed",
      });

      await logAuditEvent({
        workflowRunId: runId,
        actorId: "anonymous",
        actorType: "user",
        action: "checkin_completed",
        description: `Check-in completed for ${data.employeeName}`,
        metadata: {
          recordId: checkIn._id.toString(),
          recordType: "checkin",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Check-in completed for ${data.employeeName}.`,
      checkInId: checkIn._id.toString(),
    });
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create the performance-notes API route**

```typescript
// apps/platform/src/app/api/grow/performance-notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { Employee } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { performanceNoteFormSchema } from "@/lib/validations/performance-note";
import { logAuditEvent } from "@/lib/workflows/engine";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = performanceNoteFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data } = parsed;
    const { runId } = body;

    const employee = await Employee.findOne({
      $or: [
        { employeeId: data.employeeId },
        { _id: data.employeeId },
      ],
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const note = await PerformanceNote.create({
      employee: employee._id,
      author: employee._id, // TODO: use actual logged-in user when auth exists
      type: data.noteType,
      observation: data.observation,
      expectation: data.expectation || null,
      workflowRunId: runId ?? null,
    });

    if (runId) {
      await WorkflowRun.findByIdAndUpdate(runId, {
        status: "completed",
        completedAt: new Date(),
        currentStep: "completed",
      });

      await logAuditEvent({
        workflowRunId: runId,
        actorId: "anonymous",
        actorType: "user",
        action: "performance_note_added",
        description: `Performance note added for ${data.employeeName}`,
        metadata: {
          recordId: note._id.toString(),
          recordType: "performance_note",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Performance note saved for ${data.employeeName}.`,
      noteId: note._id.toString(),
    });
  } catch (error) {
    console.error("Error creating performance note:", error);
    return NextResponse.json(
      { error: "Failed to create performance note" },
      { status: 500 }
    );
  }
}
```

**Step 4: Export `parseTimePeriod` from grow-tools**

The goals API route needs `parseTimePeriod`. Check that it's already exported from `apps/platform/src/lib/ai/grow-tools.ts`. If not, add `export` to the function declaration at approximately line 109.

**Step 5: Verify routes compile**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors.

**Step 6: Commit**

```bash
git add apps/platform/src/app/api/grow/ apps/platform/src/lib/ai/grow-tools.ts
git commit -m "feat: add direct API routes for Grow workflow form submissions"
```

---

## Task 6: Update AI Tools and System Prompt

Modify the Grow tools to return a `workingDocument` payload instead of `fieldPromptBlock`. Update the system prompt to instruct the AI to analyze prompts and ask minimal clarifying questions before opening the working document.

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`
- Modify: `apps/platform/src/lib/ai/prompts.ts`
- Create: `apps/platform/src/lib/ai/working-document-constants.ts`

**Step 1: Create working document delimiter constants**

```typescript
// apps/platform/src/lib/ai/working-document-constants.ts
export const WORKING_DOC_PREFIX = "[ASCENTA_WORKING_DOC]";
export const WORKING_DOC_SUFFIX = "[/ASCENTA_WORKING_DOC]";
```

**Step 2: Update startGoalCreationTool**

Modify `startGoalCreationTool` in `grow-tools.ts` to return a `workingDocument` payload with all pre-filled values at once, instead of a single `fieldPromptBlock` for the next missing field.

The tool currently (lines ~146-196):
1. Starts a workflow run
2. Finds the next missing field
3. Returns a `fieldPromptBlock` for that single field

Change it to:
1. Start a workflow run
2. Return ALL field info + any pre-filled values wrapped in `[ASCENTA_WORKING_DOC]` delimiters

The AI will receive `prefilled` values from its analysis of the user's prompt via the tool parameters. Add new optional parameters to the tool for AI-extracted fields:

```typescript
// Update the tool's parameters to accept pre-filled values
parameters: z.object({
  employeeName: z.string(),
  employeeId: z.string(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  managerName: z.string().optional(),
  // New: AI-extracted pre-fill values
  title: z.string().optional(),
  description: z.string().optional(),
  categoryGroup: z.string().optional(),
  category: z.string().optional(),
  measurementType: z.string().optional(),
  successMetric: z.string().optional(),
  timePeriod: z.string().optional(),
  checkInCadence: z.string().optional(),
  alignment: z.string().optional(),
}),
```

Update the execute function to return the working document payload:

```typescript
execute: async (params) => {
  await ensureWorkflowsSynced();
  const workflow = getRegisteredWorkflow("create-goal");
  if (!workflow) return { success: false, error: "Workflow not found" };

  const run = await startWorkflowRun("create-goal", "anonymous", {
    employeeName: params.employeeName,
    employeeId: params.employeeId,
  });

  // Collect all pre-filled values from AI analysis
  const prefilled: Record<string, unknown> = {
    employeeName: params.employeeName,
    employeeId: params.employeeId,
  };
  if (params.title) prefilled.title = params.title;
  if (params.description) prefilled.description = params.description;
  if (params.categoryGroup) prefilled.categoryGroup = params.categoryGroup;
  if (params.category) prefilled.category = params.category;
  if (params.measurementType) prefilled.measurementType = params.measurementType;
  if (params.successMetric) prefilled.successMetric = params.successMetric;
  if (params.timePeriod) prefilled.timePeriod = params.timePeriod;
  if (params.checkInCadence) prefilled.checkInCadence = params.checkInCadence;
  if (params.alignment) prefilled.alignment = params.alignment;

  const workingDocPayload = {
    action: "open_working_document" as const,
    workflowType: "create-goal" as const,
    runId: run.runId,
    employeeId: params.employeeId,
    employeeName: params.employeeName,
    prefilled,
  };

  const workingDocBlock = `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`;

  return {
    success: true,
    runId: run.runId,
    message: `I've opened the goal creation form for ${params.employeeName} with the details pre-filled. You can review and edit the form, or ask me to make changes.`,
    workingDocBlock,
  };
},
```

**Step 3: Update startCheckInTool and startPerformanceNoteTool similarly**

Apply the same pattern: accept optional pre-fill parameters, return `workingDocBlock` instead of `fieldPromptBlock`. For `startCheckInTool`, still fetch active goals and include them in the payload as `availableGoals`.

**Step 4: Add updateWorkingDocumentTool**

Create a new tool that the AI can call when the user asks to change a field via chat:

```typescript
export const updateWorkingDocumentTool = tool({
  description:
    "Update fields in the open working document form. Use when the user asks to change a value via chat.",
  parameters: z.object({
    runId: z.string().describe("The workflow run ID"),
    updates: z
      .record(z.unknown())
      .describe("Object with fieldKey: newValue pairs to update"),
  }),
  execute: async ({ runId, updates }) => {
    // The actual update happens on the frontend via chat context.
    // This tool just returns the update instruction for the frontend to parse.
    const payload = { action: "update_working_document", runId, updates };
    const block = `${WORKING_DOC_PREFIX}${JSON.stringify(payload)}${WORKING_DOC_SUFFIX}`;
    return {
      success: true,
      message: "I've updated the form with your changes.",
      workingDocBlock: block,
    };
  },
});
```

**Step 5: Update the system prompt**

In `apps/platform/src/lib/ai/prompts.ts`, update the Grow workflow section of `DEFAULT_SYSTEM_PROMPT` to instruct the AI on the new behavior:

Replace the current Grow workflow instructions (which tell the AI to use field prompts) with:

```
## Grow Performance System (Working Document Pattern)

When a user wants to create a goal, run a check-in, or add a performance note:

1. ANALYZE the user's message to extract as much information as possible (goal title, description, metrics, time periods, etc.)
2. If critical information is missing or ambiguous, ask 1-3 SHORT clarifying questions in regular chat messages. Do NOT use field prompt blocks.
3. Once you have enough context, call the appropriate start tool (startGoalCreation, startCheckIn, startPerformanceNote) with ALL extracted values as parameters. This opens a pre-filled form for the user.
4. After the form is open, the user may ask you to change fields. Use updateWorkingDocument to push changes to the form.
5. The user will submit the form themselves — do NOT call completeGrowWorkflow.

Key principles:
- Extract maximum information from the initial prompt
- Ask MINIMAL questions (0-3), not one per field
- Pre-fill everything you can infer
- The form is the source of truth — the user controls submission
```

**Step 6: Verify types compile**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors.

**Step 7: Commit**

```bash
git add apps/platform/src/lib/ai/
git commit -m "feat: update AI tools and prompts for working document pattern"
```

---

## Task 7: Frontend Parsing of Working Document Blocks

Update the frontend to parse `[ASCENTA_WORKING_DOC]` blocks from AI responses and trigger the working document panel.

**Files:**
- Modify: `apps/platform/src/components/chat/workflow-blocks.tsx`
- Modify: `apps/platform/src/components/chat/chat-message.tsx`
- Modify: `apps/platform/src/components/do-tab-chat.tsx`

**Step 1: Add working document parsing to workflow-blocks.tsx**

Add a new interface and update `parseWorkflowBlocks` to also extract working document blocks:

```typescript
import {
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
} from "@/lib/ai/working-document-constants";

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

// Add to ParsedContent interface:
// workingDoc: WorkingDocData | null;
```

Update `parseWorkflowBlocks` to extract `[ASCENTA_WORKING_DOC]` blocks using the same regex pattern as existing delimiters. Strip the block from the text and return parsed data.

**Step 2: Handle working document actions in DoTabChat**

In `do-tab-chat.tsx`, after a message is received (or in the message rendering), check for `workingDoc` data. If `action === "open_working_document"`, call `openWorkingDocument()` from chat context. If `action === "update_working_document"`, call `updateWorkingDocumentFields()`.

Add a `useEffect` that watches the latest assistant message for working document blocks:

```typescript
useEffect(() => {
  const messages = pageState.messages;
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== "assistant") return;

  const parsed = parseWorkflowBlocks(lastMsg.content);
  if (parsed.workingDoc) {
    const wd = parsed.workingDoc;
    if (wd.action === "open_working_document" && wd.workflowType) {
      openWorkingDocument(
        wd.workflowType,
        wd.runId,
        wd.employeeId ?? "",
        wd.employeeName ?? "",
        wd.prefilled ?? {},
        wd.availableGoals
      );
    } else if (wd.action === "update_working_document" && wd.updates) {
      updateWorkingDocumentFields(wd.updates);
    }
  }
}, [pageState.messages]);
```

**Step 3: Strip working doc blocks from displayed text**

In `chat-message.tsx`, the `parseWorkflowBlocks` function already strips delimited blocks from the displayed text. Since we added `[ASCENTA_WORKING_DOC]` parsing in Step 1, the blocks will be stripped automatically. No rendering component needed — the working document opens as a panel, not inline.

**Step 4: Verify the full flow manually**

Run: `pnpm dev --filter=@ascenta/platform`
Navigate to `/grow/performance`. Type "Create a goal for Ashley Garcia to improve customer response times by 20% this quarter."

Expected:
1. AI identifies Ashley Garcia, extracts goal details
2. AI may ask 0-2 clarifying questions
3. AI calls `startGoalCreation` with pre-filled values
4. Response contains `[ASCENTA_WORKING_DOC]` block
5. Frontend opens the working document panel with pre-filled form
6. User can edit fields and submit

**Step 5: Commit**

```bash
git add apps/platform/src/components/
git commit -m "feat: parse working document blocks and trigger side panel"
```

---

## Task 8: Add TODO Comments for Corrective Action Migration

Leave clear migration notes in the corrective action code paths.

**Files:**
- Modify: `apps/platform/src/lib/ai/workflow-tools.ts` (add TODO at top of file)
- Modify: `apps/platform/src/components/chat/field-prompt-block.tsx` (add TODO at top)

**Step 1: Add TODO comments**

At the top of `workflow-tools.ts`:
```typescript
// TODO: Migrate corrective action workflows (written-warning, PIP, investigation-summary)
// to the working document pattern. See docs/plans/2026-03-07-working-document-pattern-design.md
// The working document for corrective actions would show the document template being built.
// Follow-up actions (email/script) could become tabs or sections in the working document.
```

At the top of `field-prompt-block.tsx`:
```typescript
// TODO: This component is used by corrective action workflows only.
// Grow workflows now use the WorkingDocument pattern (see components/grow/working-document.tsx).
// When corrective actions are migrated, this component can be removed.
```

**Step 2: Commit**

```bash
git add apps/platform/src/lib/ai/workflow-tools.ts apps/platform/src/components/chat/field-prompt-block.tsx
git commit -m "chore: add TODO comments for corrective action workflow migration"
```

---

## Task 9: Verification and Cleanup

Final verification that everything works end-to-end.

**Step 1: Run type check**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No type errors.

**Step 2: Run linter**

Run: `pnpm lint`
Expected: No new lint errors.

**Step 3: Run tests**

Run: `pnpm test`
Expected: All existing tests pass (no test changes needed since existing tests don't cover the inline field flow).

**Step 4: Manual E2E verification**

Run: `pnpm dev --filter=@ascenta/platform`

Test each workflow:
1. **Goal creation**: "Create a goal for Ashley Garcia to improve customer satisfaction by 15% in Q2"
   - Expect: Form opens pre-filled with title, success metric, time period
2. **Check-in**: "Run a check-in for Ashley Garcia"
   - Expect: Form opens with employee info and linked goals populated
3. **Performance note**: "Add a performance note for Ashley Garcia - she handled the customer escalation really well today"
   - Expect: Form opens with note type = "recognition" and observation pre-filled
4. **Chat-driven field update**: With form open, type "Change the time period to Q3"
   - Expect: Time period field updates on the form
5. **Manual form edit**: Change a field directly on the form
   - Expect: Field updates, no side effects
6. **Submit**: Click "Create Goal" with all required fields filled
   - Expect: Goal saved to DB, confirmation in chat, form closes
7. **Corrective action still works**: Test a written warning flow
   - Expect: Old inline field prompt pattern still works as before

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during E2E verification"
```
