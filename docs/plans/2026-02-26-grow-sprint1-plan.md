# Grow Section — Sprint 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Grow section's Performance System foundation — Goals, Check-Ins, Performance Notes — with chat-driven and form-based creation, role simulation, status dashboards, and contextual help.

**Architecture:** Hybrid — plain CRUD for Goals & Performance Notes (API routes + AI tools), workflow engine for Check-In Completion. All data in MongoDB via Mongoose. Chat as side panel, tabs (DO/LEARN/STATUS/DASHBOARD) as main workspace. Role simulation via context + header.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Mongoose, MongoDB Atlas, Vercel AI SDK (`tool()` from `ai`), Zod, Tailwind CSS v4, shadcn/ui, Lucide icons

---

## Phase 1: Data Models (Issue #8)

### Task 1: Create Goal Schema

**Files:**
- Create: `packages/db/src/goal-schema.ts`

**Step 1: Create the Goal schema file**

```typescript
/**
 * Goal Schema (Mongoose)
 * Performance goals for employees — team, role, or individual
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

const GOAL_TYPES = ["team", "role", "individual"] as const;
const GOAL_STATUSES = ["draft", "active", "locked", "completed", "cancelled"] as const;
const VISIBILITY_LEVELS = ["employee", "manager", "hr"] as const;

const goalSchema = new Schema(
  {
    statement: { type: String, required: true },
    measure: { type: String, required: true },
    type: { type: String, required: true, enum: GOAL_TYPES, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    timeperiod: {
      start: { type: Date },
      end: { type: Date },
    },
    parentGoal: { type: Schema.Types.ObjectId, ref: "Goal", default: null },
    dependencies: [{ type: String }],
    status: { type: String, required: true, enum: GOAL_STATUSES, default: "draft", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    visibility: { type: String, required: true, enum: VISIBILITY_LEVELS, default: "manager" },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

goalSchema.index({ owner: 1, status: 1 });
goalSchema.index({ "timeperiod.end": 1 });

export const Goal =
  mongoose.models.Goal || mongoose.model("Goal", goalSchema);

export type Goal_Type = {
  id: string;
  statement: string;
  measure: string;
  type: (typeof GOAL_TYPES)[number];
  owner: string;
  timeperiod: { start: Date | null; end: Date | null };
  parentGoal: string | null;
  dependencies: string[];
  status: (typeof GOAL_STATUSES)[number];
  createdBy: string;
  visibility: (typeof VISIBILITY_LEVELS)[number];
  createdAt: Date;
  updatedAt: Date;
};

export type NewGoal = Omit<Goal_Type, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: Goal_Type["status"];
};

export { GOAL_TYPES, GOAL_STATUSES, VISIBILITY_LEVELS };
```

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`

**Step 3: Commit**

```bash
git add packages/db/src/goal-schema.ts
git commit -m "feat(db): add Goal mongoose schema (#8)"
```

---

### Task 2: Create CheckIn Schema

**Files:**
- Create: `packages/db/src/checkin-schema.ts`

**Step 1: Create the CheckIn schema file**

```typescript
/**
 * CheckIn Schema (Mongoose)
 * Scheduled check-ins linked to goals
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

const CHECKIN_CADENCES = ["weekly", "biweekly", "monthly", "quarterly"] as const;
const CHECKIN_STATUSES = ["scheduled", "completed", "missed", "cancelled"] as const;
const CHECKIN_RATINGS = ["on_track", "at_risk", "off_track"] as const;

const checkinSchema = new Schema(
  {
    goal: { type: Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    scheduledDate: { type: Date, required: true, index: true },
    completedDate: { type: Date, default: null },
    cadence: { type: String, required: true, enum: CHECKIN_CADENCES },
    progress: { type: String, default: null },
    blockers: { type: String, default: null },
    supportNeeded: { type: String, default: null },
    rating: { type: String, enum: CHECKIN_RATINGS, default: null },
    status: { type: String, required: true, enum: CHECKIN_STATUSES, default: "scheduled", index: true },
    performanceNote: { type: Schema.Types.ObjectId, ref: "PerformanceNote", default: null },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

checkinSchema.index({ employee: 1, scheduledDate: 1 });
checkinSchema.index({ status: 1, scheduledDate: 1 });

export const CheckIn =
  mongoose.models.CheckIn || mongoose.model("CheckIn", checkinSchema);

export type CheckIn_Type = {
  id: string;
  goal: string;
  employee: string;
  scheduledDate: Date;
  completedDate: Date | null;
  cadence: (typeof CHECKIN_CADENCES)[number];
  progress: string | null;
  blockers: string | null;
  supportNeeded: string | null;
  rating: (typeof CHECKIN_RATINGS)[number] | null;
  status: (typeof CHECKIN_STATUSES)[number];
  performanceNote: string | null;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewCheckIn = Pick<CheckIn_Type, "goal" | "employee" | "scheduledDate" | "cadence"> & {
  status?: CheckIn_Type["status"];
};

export { CHECKIN_CADENCES, CHECKIN_STATUSES, CHECKIN_RATINGS };
```

**Step 2: Commit**

```bash
git add packages/db/src/checkin-schema.ts
git commit -m "feat(db): add CheckIn mongoose schema (#8)"
```

---

### Task 3: Create PerformanceNote Schema

**Files:**
- Create: `packages/db/src/performance-note-schema.ts`

**Step 1: Create the PerformanceNote schema file**

```typescript
/**
 * PerformanceNote Schema (Mongoose)
 * Manager/HR observations and feedback tied to employees
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

const NOTE_TYPES = ["observation", "feedback", "coaching", "recognition", "concern"] as const;
const NOTE_VISIBILITY = ["manager_only", "hr_only", "shared_with_employee"] as const;

const performanceNoteSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    type: { type: String, required: true, enum: NOTE_TYPES, index: true },
    content: { type: String, required: true },
    context: { type: String, default: null },
    relatedGoal: { type: Schema.Types.ObjectId, ref: "Goal", default: null },
    relatedCheckIn: { type: Schema.Types.ObjectId, ref: "CheckIn", default: null },
    visibility: { type: String, required: true, enum: NOTE_VISIBILITY, default: "manager_only" },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

performanceNoteSchema.index({ employee: 1, createdAt: -1 });

export const PerformanceNote =
  mongoose.models.PerformanceNote || mongoose.model("PerformanceNote", performanceNoteSchema);

export type PerformanceNote_Type = {
  id: string;
  employee: string;
  author: string;
  type: (typeof NOTE_TYPES)[number];
  content: string;
  context: string | null;
  relatedGoal: string | null;
  relatedCheckIn: string | null;
  visibility: (typeof NOTE_VISIBILITY)[number];
  createdAt: Date;
  updatedAt: Date;
};

export type NewPerformanceNote = Omit<PerformanceNote_Type, "id" | "createdAt" | "updatedAt">;

export { NOTE_TYPES, NOTE_VISIBILITY };
```

**Step 2: Commit**

```bash
git add packages/db/src/performance-note-schema.ts
git commit -m "feat(db): add PerformanceNote mongoose schema (#8)"
```

---

### Task 4: Wire Up DB Exports

**Files:**
- Modify: `packages/db/src/schema.ts` (add re-exports)
- Modify: `packages/db/package.json` (add sub-path exports)

**Step 1: Add re-exports to schema.ts**

Append to the end of `packages/db/src/schema.ts`:

```typescript
export * from "./goal-schema";
export * from "./checkin-schema";
export * from "./performance-note-schema";
```

**Step 2: Add sub-path exports to package.json**

Add these entries to the `exports` field in `packages/db/package.json`:

```json
"./goal-schema": "./src/goal-schema.ts",
"./checkin-schema": "./src/checkin-schema.ts",
"./performance-note-schema": "./src/performance-note-schema.ts"
```

**Step 3: Verify imports work**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`

**Step 4: Commit**

```bash
git add packages/db/src/schema.ts packages/db/package.json
git commit -m "feat(db): wire up Grow schema exports (#8)"
```

---

### Task 5: Add "grow" to Workflow Categories

**Files:**
- Modify: `apps/platform/src/lib/workflows/types.ts:10-17`

**Step 1: Add "grow" to WORKFLOW_CATEGORIES**

In `types.ts`, add `"grow"` to the `WORKFLOW_CATEGORIES` array and `"employee"` to `WORKFLOW_AUDIENCES`:

```typescript
export const WORKFLOW_CATEGORIES = [
  "corrective",
  "performance",
  "investigation",
  "scheduling",
  "compliance",
  "communication",
  "grow",
] as const;
```

Also add `"employee"` to audiences since Grow workflows can be employee-facing:

```typescript
export const WORKFLOW_AUDIENCES = ["manager", "hr", "hr_only", "employee"] as const;
```

**Step 2: Commit**

```bash
git add apps/platform/src/lib/workflows/types.ts
git commit -m "feat(workflows): add grow category and employee audience (#8)"
```

---

## Phase 2: Role Simulation (Issue #9)

### Task 6: Create Role Context Provider

**Files:**
- Create: `apps/platform/src/lib/role/role-context.tsx`

**Step 1: Create the role context**

```typescript
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const ROLES = ["employee", "manager", "hr"] as const;
type Role = (typeof ROLES)[number];

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  roles: readonly typeof ROLES;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("manager");

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, roles: ROLES }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}

export type { Role };
export { ROLES };
```

**Step 2: Commit**

```bash
git add apps/platform/src/lib/role/role-context.tsx
git commit -m "feat: add role simulation context provider (#9)"
```

---

### Task 7: Add Role Provider to Layout and Role Switcher to Navbar

**Files:**
- Modify: `apps/platform/src/app/layout.tsx` (wrap with RoleProvider)
- Modify: `apps/platform/src/app/page.tsx` (add role switcher to header)

**Step 1: Add RoleProvider to layout.tsx**

Import `RoleProvider` and wrap it around the children inside the `ChatProvider`:

```typescript
import { RoleProvider } from "@/lib/role/role-context";
```

Wrap inside ChatProvider:
```tsx
<ChatProvider>
  <RoleProvider>
    <ChatPanelLayout>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </ChatPanelLayout>
    <ChatPanel />
    <ChatPanelTrigger />
  </RoleProvider>
  <Analytics />
</ChatProvider>
```

**Step 2: Add role switcher to the page header**

In `apps/platform/src/app/page.tsx`, import and add a role switcher dropdown to the header bar (right side of the nav). Use a simple `<select>` styled with Tailwind:

```tsx
import { useRole } from "@/lib/role/role-context";
```

Inside `RootPage()`, add:
```tsx
const { role, setRole, roles } = useRole();
```

After the `</nav>` closing tag in the header, add:
```tsx
<div className="ml-auto flex items-center gap-2">
  <span className="text-xs text-muted-foreground">Role:</span>
  <select
    value={role}
    onChange={(e) => setRole(e.target.value as typeof role)}
    className="rounded-md border bg-white px-2 py-1 text-xs font-medium text-deep-blue capitalize"
  >
    {roles.map((r) => (
      <option key={r} value={r}>
        {r.charAt(0).toUpperCase() + r.slice(1)}
      </option>
    ))}
  </select>
</div>
```

**Step 3: Verify it renders**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform` and check localhost:3051

**Step 4: Commit**

```bash
git add apps/platform/src/app/layout.tsx apps/platform/src/app/page.tsx
git commit -m "feat: add role simulation switcher to navbar (#9)"
```

---

## Phase 3: Grow DO Tab — Category Drill-In (Issues #10, #11)

### Task 8: Add selectedCategory State and Grow Action Cards to ChatWelcome

**Files:**
- Modify: `apps/platform/src/components/chat/chat-welcome.tsx`

**Step 1: Update ChatWelcome to support category drill-in**

When a category is selected, instead of just highlighting the card, show a new view with action cards for that category. For now, only Grow has content — others show a "Coming soon" placeholder.

The component should:
1. Track `selectedCategoryKey` state (existing)
2. When a category is selected, replace the grid with category-specific action cards
3. For "grow": show action cards for Create Goal, Log Check-In, Add Performance Note, View Goals, View Check-Ins, and a Back button
4. Each action card has an icon, title, and description
5. Clicking an action card either opens a form or navigates

Define the Grow action cards as a constant:

```typescript
import {
  Target,
  CheckCircle,
  FileText,
  List,
  Calendar,
  ArrowLeft,
} from "lucide-react";

type ActionCard = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const GROW_ACTIONS: ActionCard[] = [
  { key: "create-goal", label: "Create Goal", description: "Set a new performance goal", icon: Target },
  { key: "log-checkin", label: "Log Check-In", description: "Record progress on a goal", icon: CheckCircle },
  { key: "add-note", label: "Add Note", description: "Capture a performance observation", icon: FileText },
  { key: "view-goals", label: "View Goals", description: "See all goals and progress", icon: List },
  { key: "view-checkins", label: "View Check-Ins", description: "Upcoming and past check-ins", icon: Calendar },
];
```

When `selectedCategoryKey === "grow"`, render these action cards instead of the category grid. Add a back button that clears the selection.

Each action card should set a new state `activeAction` which will determine what form/view to render below the cards (implemented in later tasks).

**Step 2: Commit**

```bash
git add apps/platform/src/components/chat/chat-welcome.tsx
git commit -m "feat: add Grow category drill-in with action cards (#10)"
```

---

### Task 9: Create Goal Form Component

**Files:**
- Create: `apps/platform/src/components/grow/goal-form.tsx`

**Step 1: Create the GoalForm component**

A form with fields matching the Goal schema:
- Statement (text input, required)
- Measure (text input, required)
- Type (dropdown: team/role/individual)
- Owner (dropdown of employees — fetched from `/api/dashboard/employees`)
- Time period start (date input)
- Time period end (date input)
- Dependencies (optional text input)

On submit, POST to `/api/goals`. Show success/error toast. Use shadcn/ui components (`Input`, `Button`, `Select`, `Label`) from `@ascenta/ui`.

```typescript
"use client";

import { useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import { Textarea } from "@ascenta/ui/textarea";
import { useRole } from "@/lib/role/role-context";

interface GoalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const { role } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      statement: formData.get("statement") as string,
      measure: formData.get("measure") as string,
      type: formData.get("type") as string,
      timeperiod: {
        start: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
        end: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
      },
      dependencies: (formData.get("dependencies") as string)?.split(",").map((d) => d.trim()).filter(Boolean) || [],
    };

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ascenta-Role": role,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create goal");
      }

      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-deep-blue">Create Goal</h3>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="statement">Goal Statement *</Label>
        <Textarea id="statement" name="statement" required placeholder="What do you want to achieve?" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="measure">How will you measure success? *</Label>
        <Textarea id="measure" name="measure" required placeholder="Quantitative or observable measure" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Goal Type</Label>
        <select
          id="type"
          name="type"
          defaultValue="individual"
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="individual">Individual</option>
          <option value="team">Team</option>
          <option value="role">Role</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dependencies">Dependencies (comma-separated)</Label>
        <Input id="dependencies" name="dependencies" placeholder="Optional" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Goal"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/goal-form.tsx
git commit -m "feat: add GoalForm component (#10)"
```

---

### Task 10: Create Goals API Route

**Files:**
- Create: `apps/platform/src/app/api/goals/route.ts`

**Step 1: Create the goals API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { Employee } from "@ascenta/db/employee-schema";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const role = req.headers.get("X-Ascenta-Role") || "manager";

    const { statement, measure, type, timeperiod, dependencies } = body;

    if (!statement || !measure) {
      return NextResponse.json(
        { error: "Statement and measure are required" },
        { status: 400 }
      );
    }

    // For MVP, use first employee as owner/createdBy (no auth yet)
    const defaultEmployee = await Employee.findOne({ status: "active" });
    if (!defaultEmployee) {
      return NextResponse.json(
        { error: "No employees found. Run seed script first." },
        { status: 400 }
      );
    }

    const goal = await Goal.create({
      statement,
      measure,
      type: type || "individual",
      owner: body.owner || defaultEmployee._id,
      timeperiod: timeperiod || {},
      dependencies: dependencies || [],
      status: "draft",
      createdBy: defaultEmployee._id,
      visibility: role === "hr" ? "hr" : "manager",
    });

    return NextResponse.json(goal.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const owner = searchParams.get("owner");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (owner) filter.owner = owner;

    const goals = await Goal.find(filter)
      .populate("owner", "firstName lastName email department jobTitle")
      .sort({ createdAt: -1 });

    return NextResponse.json({ goals: goals.map((g) => g.toJSON()) });
  } catch (error) {
    console.error("List goals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create goals/[id] route**

Create: `apps/platform/src/app/api/goals/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const goal = await Goal.findById(id)
      .populate("owner", "firstName lastName email department jobTitle");

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal.toJSON());
  } catch (error) {
    console.error("Get goal error:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const role = req.headers.get("X-Ascenta-Role") || "manager";
    const body = await req.json();

    const goal = await Goal.findById(id);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const goalObj = goal.toJSON() as Record<string, unknown>;
    // Block updates to locked goals unless HR override
    if (goalObj.status === "locked" && role !== "hr") {
      return NextResponse.json(
        { error: "Goal is locked. HR override required." },
        { status: 403 }
      );
    }

    const updated = await Goal.findByIdAndUpdate(id, { $set: body }, { new: true })
      .populate("owner", "firstName lastName email department jobTitle");

    return NextResponse.json(updated!.toJSON());
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create goals/[id]/lock route**

Create: `apps/platform/src/app/api/goals/[id]/lock/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const goal = await Goal.findByIdAndUpdate(
      id,
      { $set: { status: "locked" } },
      { new: true }
    );

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal.toJSON());
  } catch (error) {
    console.error("Lock goal error:", error);
    return NextResponse.json(
      { error: "Failed to lock goal" },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add apps/platform/src/app/api/goals/
git commit -m "feat: add Goals API routes (CRUD + lock) (#10)"
```

---

### Task 11: Create Goal List Component

**Files:**
- Create: `apps/platform/src/components/grow/goal-list.tsx`

**Step 1: Create the GoalList component**

Fetches goals from `/api/goals` and renders them as a filterable list. Each goal shows statement, measure, status badge, owner, and time period.

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@ascenta/ui/button";
import { useRole } from "@/lib/role/role-context";
import { Target } from "lucide-react";

interface GoalData {
  id: string;
  statement: string;
  measure: string;
  type: string;
  status: string;
  owner: { firstName: string; lastName: string; department: string } | null;
  timeperiod: { start: string | null; end: string | null };
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  active: "bg-green-100 text-green-700",
  locked: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

interface GoalListProps {
  onBack?: () => void;
}

export function GoalList({ onBack }: GoalListProps) {
  const { role } = useRole();
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/goals?${params.toString()}`, {
        headers: { "X-Ascenta-Role": role },
      });
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  }, [role, statusFilter]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-deep-blue">Goals</h3>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border bg-white px-2 py-1 text-xs"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="completed">Completed</option>
          </select>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Target className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No goals found. Create your first goal to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-deep-blue">{goal.statement}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{goal.measure}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[goal.status] || ""}`}>
                  {goal.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {goal.owner && (
                  <span>{goal.owner.firstName} {goal.owner.lastName}</span>
                )}
                <span className="capitalize">{goal.type}</span>
                {goal.timeperiod.end && (
                  <span>Due {new Date(goal.timeperiod.end).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/goal-list.tsx
git commit -m "feat: add GoalList component with filtering (#11)"
```

---

## Phase 4: Check-In API (Issue #12)

### Task 12: Create Check-In API Routes

**Files:**
- Create: `apps/platform/src/app/api/check-ins/route.ts`
- Create: `apps/platform/src/app/api/check-ins/[id]/route.ts`
- Create: `apps/platform/src/app/api/check-ins/overdue/route.ts`

**Step 1: Create main check-ins route**

`apps/platform/src/app/api/check-ins/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { goal, employee, scheduledDate, cadence } = body;

    if (!goal || !employee || !scheduledDate || !cadence) {
      return NextResponse.json(
        { error: "goal, employee, scheduledDate, and cadence are required" },
        { status: 400 }
      );
    }

    const checkin = await CheckIn.create({
      goal,
      employee,
      scheduledDate: new Date(scheduledDate),
      cadence,
      status: "scheduled",
    });

    return NextResponse.json(checkin.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Create check-in error:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const employee = searchParams.get("employee");
    const goal = searchParams.get("goal");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (employee) filter.employee = employee;
    if (goal) filter.goal = goal;
    if (status) filter.status = status;

    const checkins = await CheckIn.find(filter)
      .populate("goal", "statement measure status")
      .populate("employee", "firstName lastName email")
      .sort({ scheduledDate: -1 });

    return NextResponse.json({ checkIns: checkins.map((c) => c.toJSON()) });
  } catch (error) {
    console.error("List check-ins error:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create check-ins/[id] route**

`apps/platform/src/app/api/check-ins/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const checkin = await CheckIn.findById(id);
    if (!checkin) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }

    // If completing, require progress
    if (body.status === "completed" && !body.progress) {
      return NextResponse.json(
        { error: "Progress is required when completing a check-in" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...body };
    if (body.status === "completed") {
      updateData.completedDate = new Date();
    }

    const updated = await CheckIn.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate("goal", "statement measure status")
      .populate("employee", "firstName lastName email");

    return NextResponse.json(updated!.toJSON());
  } catch (error) {
    console.error("Update check-in error:", error);
    return NextResponse.json(
      { error: "Failed to update check-in" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create overdue endpoint**

`apps/platform/src/app/api/check-ins/overdue/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function GET() {
  try {
    await connectDB();

    const overdue = await CheckIn.find({
      status: "scheduled",
      scheduledDate: { $lt: new Date() },
    })
      .populate("goal", "statement measure")
      .populate("employee", "firstName lastName email managerName")
      .sort({ scheduledDate: 1 });

    return NextResponse.json({ checkIns: overdue.map((c) => c.toJSON()) });
  } catch (error) {
    console.error("Overdue check-ins error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overdue check-ins" },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add apps/platform/src/app/api/check-ins/
git commit -m "feat: add Check-In API routes with overdue endpoint (#12)"
```

---

## Phase 5: Performance Notes API (Issue #14)

### Task 13: Create Performance Notes API Routes

**Files:**
- Create: `apps/platform/src/app/api/performance-notes/route.ts`
- Create: `apps/platform/src/app/api/performance-notes/[id]/route.ts`

**Step 1: Create main route**

`apps/platform/src/app/api/performance-notes/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { Employee } from "@ascenta/db/employee-schema";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { employee, type, content, context, relatedGoal, relatedCheckIn, visibility } = body;

    if (!employee || !type || !content) {
      return NextResponse.json(
        { error: "employee, type, and content are required" },
        { status: 400 }
      );
    }

    // For MVP, use first active employee as author (no auth)
    const defaultAuthor = await Employee.findOne({ status: "active" });
    if (!defaultAuthor) {
      return NextResponse.json(
        { error: "No employees found. Run seed script first." },
        { status: 400 }
      );
    }

    const note = await PerformanceNote.create({
      employee,
      author: body.author || defaultAuthor._id,
      type,
      content,
      context: context || null,
      relatedGoal: relatedGoal || null,
      relatedCheckIn: relatedCheckIn || null,
      visibility: visibility || "manager_only",
    });

    return NextResponse.json(note.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Create performance note error:", error);
    return NextResponse.json(
      { error: "Failed to create performance note" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const employee = searchParams.get("employee");
    const type = searchParams.get("type");
    const author = searchParams.get("author");

    const filter: Record<string, unknown> = {};
    if (employee) filter.employee = employee;
    if (type) filter.type = type;
    if (author) filter.author = author;

    const notes = await PerformanceNote.find(filter)
      .populate("employee", "firstName lastName email")
      .populate("author", "firstName lastName")
      .populate("relatedGoal", "statement")
      .sort({ createdAt: -1 });

    return NextResponse.json({ notes: notes.map((n) => n.toJSON()) });
  } catch (error) {
    console.error("List performance notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance notes" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create [id] route**

`apps/platform/src/app/api/performance-notes/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const note = await PerformanceNote.findById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updated = await PerformanceNote.findByIdAndUpdate(
      id,
      { $set: { content: body.content, context: body.context, visibility: body.visibility } },
      { new: true }
    )
      .populate("employee", "firstName lastName email")
      .populate("author", "firstName lastName");

    return NextResponse.json(updated!.toJSON());
  } catch (error) {
    console.error("Update performance note error:", error);
    return NextResponse.json(
      { error: "Failed to update performance note" },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add apps/platform/src/app/api/performance-notes/
git commit -m "feat: add Performance Notes API routes (#14)"
```

---

### Task 14: Create Performance Note Form Component

**Files:**
- Create: `apps/platform/src/components/grow/performance-note-form.tsx`

**Step 1: Create the form component**

Similar pattern to GoalForm. Fields: employee (dropdown), type (dropdown), content (textarea), context (optional text), related goal (optional dropdown), visibility (dropdown).

Fetch employees from `/api/dashboard/employees` and goals from `/api/goals` for the dropdowns.

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/performance-note-form.tsx
git commit -m "feat: add PerformanceNoteForm component (#14)"
```

---

## Phase 6: Check-In Completion Workflow (Issue #13)

### Task 15: Create Check-In Completion Workflow Definition

**Files:**
- Create: `apps/platform/src/lib/workflows/definitions/check-in-completion.ts`
- Modify: `apps/platform/src/lib/workflows/definitions/index.ts`

**Step 1: Create the workflow definition**

```typescript
import type { WorkflowDefinitionConfig } from "../types";
import { isEmpty } from "../guardrails";

export const checkInCompletionWorkflow: WorkflowDefinitionConfig = {
  slug: "check-in-completion",
  name: "Check-In Completion",
  description: "Guided check-in flow for recording progress against a goal",
  category: "grow",
  audience: "employee",
  riskLevel: "low",
  estimatedMinutes: 5,
  icon: "CheckCircle",

  intakeFields: [
    {
      fieldKey: "goalId",
      label: "Goal",
      type: "dropdown",
      placeholder: "Select the goal for this check-in",
      required: true,
      sortOrder: 1,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "progress",
      label: "What progress have you made?",
      type: "textarea",
      placeholder: "Describe the progress since your last check-in",
      required: true,
      validationRules: { minLength: 10 },
      sortOrder: 2,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "blockers",
      label: "Any blockers?",
      type: "textarea",
      placeholder: "What's standing in your way? (optional)",
      required: false,
      sortOrder: 3,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "supportNeeded",
      label: "Support needed from your manager?",
      type: "textarea",
      placeholder: "What help would make a difference? (optional)",
      required: false,
      sortOrder: 4,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "rating",
      label: "How is this goal tracking?",
      type: "dropdown",
      options: [
        { value: "on_track", label: "On Track" },
        { value: "at_risk", label: "At Risk" },
        { value: "off_track", label: "Off Track" },
      ],
      required: true,
      sortOrder: 5,
      groupName: "Assessment",
    },
  ],

  guardrails: [
    {
      id: "progress-required",
      name: "Progress Required",
      description: "Check-in must include a progress update",
      triggerCondition: isEmpty("progress"),
      severity: "hard_stop",
      message: "A progress update is required to complete the check-in.",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "off-track-support",
      name: "Off Track Support Suggestion",
      description: "Suggest noting support needed when goal is off track",
      triggerCondition: {
        field: "rating",
        operator: "equals",
        value: "off_track",
        and: [{ field: "supportNeeded", operator: "is_empty" }],
      },
      severity: "warning",
      message: "This goal is off track. Consider noting what support from your manager would help.",
      sortOrder: 2,
      isActive: true,
    },
  ],

  artifactTemplates: [],

  guidedActions: [
    {
      id: "summarize-progress",
      label: "Summarize progress objectively",
      description: "Rewrite your progress notes in clear, objective terms",
      icon: "FileText",
      requiredInputs: ["progress"],
      outputType: "rewrite",
      outputTarget: "progress",
      promptTemplate: "Rewrite this progress update in clear, objective, professional terms. Focus on observable outcomes and measurable progress. Original: {{progress}}",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "suggest-followups",
      label: "Suggest follow-up actions",
      description: "Get AI-suggested next steps based on your blockers",
      icon: "Lightbulb",
      requiredInputs: ["blockers"],
      outputType: "analysis",
      promptTemplate: "Based on these blockers, suggest 2-3 concrete follow-up actions the employee or manager could take: {{blockers}}",
      sortOrder: 2,
      isActive: true,
    },
  ],
};
```

**Step 2: Register the workflow**

In `apps/platform/src/lib/workflows/definitions/index.ts`, add:

```typescript
import { checkInCompletionWorkflow } from "./check-in-completion";
```

And in `registerAllWorkflows()`:

```typescript
registerWorkflow(checkInCompletionWorkflow);
```

**Step 3: Commit**

```bash
git add apps/platform/src/lib/workflows/definitions/check-in-completion.ts
git add apps/platform/src/lib/workflows/definitions/index.ts
git commit -m "feat: add check-in-completion workflow definition (#13)"
```

---

## Phase 7: AI Tools

### Task 16: Add Grow AI Tools

**Files:**
- Create: `apps/platform/src/lib/ai/grow-tools.ts`
- Modify: `apps/platform/src/lib/ai/tools.ts`

**Step 1: Create grow-tools.ts**

```typescript
import { z } from "zod";
import { tool } from "ai";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db/employee-schema";

export const createGoalTool = tool({
  description: "Create a new performance goal for an employee. Use this when a user wants to set up a goal.",
  inputSchema: z.object({
    statement: z.string().describe("The goal statement — what needs to be achieved"),
    measure: z.string().describe("How success will be measured (quantitative or observable)"),
    type: z.enum(["team", "role", "individual"]).optional().default("individual").describe("Goal type"),
    employeeName: z.string().optional().describe("Employee name to assign the goal to"),
    startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
  }),
  execute: async ({ statement, measure, type, employeeName, startDate, endDate }) => {
    await connectDB();

    let owner = await Employee.findOne({ status: "active" });
    if (employeeName) {
      const found = await Employee.findOne({
        $or: [
          { firstName: { $regex: employeeName, $options: "i" } },
          { lastName: { $regex: employeeName, $options: "i" } },
        ],
      });
      if (found) owner = found;
    }

    if (!owner) {
      return { success: false, message: "No employee found to assign the goal to." };
    }

    const goal = await Goal.create({
      statement,
      measure,
      type,
      owner: owner._id,
      createdBy: owner._id,
      timeperiod: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null,
      },
      status: "draft",
      visibility: "manager",
    });

    const goalObj = goal.toJSON() as Record<string, unknown>;
    return {
      success: true,
      message: `Goal created for ${(owner.toJSON() as Record<string, unknown>).firstName} ${(owner.toJSON() as Record<string, unknown>).lastName}`,
      goal: {
        id: goalObj.id,
        statement: goalObj.statement,
        measure: goalObj.measure,
        type: goalObj.type,
        status: goalObj.status,
      },
    };
  },
});

export const addPerformanceNoteTool = tool({
  description: "Add a performance note for an employee. Use for observations, feedback, coaching, recognition, or concerns.",
  inputSchema: z.object({
    employeeName: z.string().describe("Employee name to add the note for"),
    type: z.enum(["observation", "feedback", "coaching", "recognition", "concern"]).describe("Type of note"),
    content: z.string().describe("The note content"),
    context: z.string().optional().describe("Context for the note (e.g., 'During 1:1 meeting')"),
  }),
  execute: async ({ employeeName, type, content, context }) => {
    await connectDB();

    const employee = await Employee.findOne({
      $or: [
        { firstName: { $regex: employeeName, $options: "i" } },
        { lastName: { $regex: employeeName, $options: "i" } },
      ],
      status: "active",
    });

    if (!employee) {
      return { success: false, message: `No active employee found matching "${employeeName}"` };
    }

    const author = await Employee.findOne({ status: "active" });

    const note = await PerformanceNote.create({
      employee: employee._id,
      author: author!._id,
      type,
      content,
      context: context || null,
      visibility: "manager_only",
    });

    const noteObj = note.toJSON() as Record<string, unknown>;
    const empObj = employee.toJSON() as Record<string, unknown>;
    return {
      success: true,
      message: `Performance note (${type}) added for ${empObj.firstName} ${empObj.lastName}`,
      note: {
        id: noteObj.id,
        type: noteObj.type,
        content: noteObj.content,
      },
    };
  },
});

export const getGrowStatusTool = tool({
  description: "Get Grow section status: goal counts, check-in completion rates, overdue items. Use when a user asks about performance metrics or check-in status.",
  inputSchema: z.object({
    scope: z.enum(["all", "team", "individual"]).optional().default("all").describe("Scope of the status report"),
  }),
  execute: async () => {
    await connectDB();

    const [
      totalGoals,
      activeGoals,
      totalCheckIns,
      completedCheckIns,
      overdueCheckIns,
      recentNotes,
    ] = await Promise.all([
      Goal.countDocuments(),
      Goal.countDocuments({ status: "active" }),
      CheckIn.countDocuments(),
      CheckIn.countDocuments({ status: "completed" }),
      CheckIn.countDocuments({ status: "scheduled", scheduledDate: { $lt: new Date() } }),
      PerformanceNote.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);

    const completionRate = totalCheckIns > 0 ? Math.round((completedCheckIns / totalCheckIns) * 100) : 0;

    return {
      success: true,
      status: {
        goals: { total: totalGoals, active: activeGoals },
        checkIns: { total: totalCheckIns, completed: completedCheckIns, overdue: overdueCheckIns, completionRate: `${completionRate}%` },
        performanceNotes: { last30Days: recentNotes },
      },
    };
  },
});
```

**Step 2: Register in tools.ts**

Add imports and register in both `allTools` and `defaultChatTools`:

```typescript
import { createGoalTool, addPerformanceNoteTool, getGrowStatusTool } from "./grow-tools";
```

Add to `allTools`:
```typescript
createGoal: createGoalTool,
addPerformanceNote: addPerformanceNoteTool,
getGrowStatus: getGrowStatusTool,
```

Add to `defaultChatTools`:
```typescript
createGoal: createGoalTool,
addPerformanceNote: addPerformanceNoteTool,
getGrowStatus: getGrowStatusTool,
```

**Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts apps/platform/src/lib/ai/tools.ts
git commit -m "feat: add Grow AI tools (createGoal, addPerformanceNote, getGrowStatus)"
```

---

## Phase 8: Grow Status API & STATUS Tab (Issues #15, #16)

### Task 17: Create Grow Status API

**Files:**
- Create: `apps/platform/src/app/api/grow/status/route.ts`

**Step 1: Create status endpoint**

```typescript
import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";

export async function GET() {
  try {
    await connectDB();

    const [
      goalsByStatus,
      checkInCompletionByMonth,
      overdueCheckIns,
      goalsWithoutCheckIns,
      recentNotes,
    ] = await Promise.all([
      Goal.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      CheckIn.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$scheduledDate" },
              year: { $year: "$scheduledDate" },
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 24 },
      ]),
      CheckIn.find({ status: "scheduled", scheduledDate: { $lt: new Date() } })
        .populate("goal", "statement")
        .populate("employee", "firstName lastName managerName")
        .sort({ scheduledDate: 1 })
        .limit(20),
      Goal.aggregate([
        { $match: { status: { $in: ["active", "draft"] } } },
        {
          $lookup: {
            from: "checkins",
            localField: "_id",
            foreignField: "goal",
            as: "checkIns",
          },
        },
        { $match: { checkIns: { $size: 0 } } },
        { $project: { statement: 1, owner: 1, status: 1 } },
      ]),
      PerformanceNote.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    return NextResponse.json({
      goalsByStatus: goalsByStatus.map((g) => ({ status: g._id, count: g.count })),
      checkInCompletion: checkInCompletionByMonth,
      overdueCheckIns: overdueCheckIns.map((c) => c.toJSON()),
      goalsWithoutCheckIns,
      recentNotesCount: recentNotes,
    });
  } catch (error) {
    console.error("Grow status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grow status" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/platform/src/app/api/grow/status/
git commit -m "feat: add Grow status aggregation API (#15)"
```

---

### Task 18: Create STATUS Tab Component

**Files:**
- Create: `apps/platform/src/components/grow/grow-status.tsx`

**Step 1: Create the GrowStatus component**

Renders check-in completion rates, goal distribution, overdue flags, and missing documentation. Fetches from `/api/grow/status`.

This component shows:
- Summary stat cards at the top
- Overdue check-ins list with employee names and days overdue
- Goals without scheduled check-ins
- Goal status distribution as colored badges with counts

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/grow-status.tsx
git commit -m "feat: add GrowStatus component for STATUS tab (#15, #16)"
```

---

## Phase 9: LEARN Tab (Issue #17)

### Task 19: Create Learn Panel Content for Grow

**Files:**
- Create: `apps/platform/src/components/grow/grow-learn.tsx`

**Step 1: Create the GrowLearn component**

Static contextual help content rendered as expandable cards. Topics:

1. **What makes a good goal** — SMART framework, examples of good vs bad goals
2. **How to write objective notes** — behavior → impact format, examples
3. **Strong vs weak check-in examples** — side-by-side comparison
4. **Feedback scripts** — templates for positive, redirecting, and mixed feedback

Each card has a title, icon, and expandable content section. Content is hardcoded markdown-style strings (no external fetch needed).

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/grow-learn.tsx
git commit -m "feat: add contextual help content for Grow LEARN tab (#17)"
```

---

## Phase 10: DASHBOARD Tab

### Task 20: Create Grow Dashboard Component

**Files:**
- Create: `apps/platform/src/components/grow/grow-dashboard.tsx`

**Step 1: Create GrowDashboard component**

Overview dashboard scoped to Grow data:
- Summary cards: Active Goals, Check-Ins This Month, Notes Logged, Overdue Items
- Recent activity feed (latest goal creations, check-in completions, notes)
- Attention queue (overdue check-ins, goals nearing deadline)

Fetches from `/api/grow/status` and `/api/goals` and `/api/check-ins`.

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/grow-dashboard.tsx
git commit -m "feat: add GrowDashboard component for DASHBOARD tab"
```

---

## Phase 11: Wire Up Tabs in Main Page

### Task 21: Integrate Grow Components into Tab Content

**Files:**
- Modify: `apps/platform/src/app/page.tsx`
- Modify: `apps/platform/src/components/chat/chat-welcome.tsx`
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`

**Step 1: Add selectedCategory state to the page-level context**

Add `selectedCategory` state to the main page. Pass it down to `ChatWelcome`. When a category is selected and we're on a non-DO tab, show category-specific content.

**Step 2: Wire up tab content**

- **DO tab**: `ChatWelcome` with Grow action cards and forms (already built in Tasks 8-9)
- **LEARN tab**: When Grow is selected, show `GrowLearn` instead of generic learn content
- **STATUS tab**: When Grow is selected, show `GrowStatus` instead of `DocumentTracker`
- **DASHBOARD tab**: When Grow is selected, show `GrowDashboard` instead of generic dashboard

Add the `selectedCategory` to `dashboard-nav.ts` types and pass through context or props.

**Step 3: Add category-specific TAB_HEADERS**

```typescript
const GROW_TAB_HEADERS: Record<TabKey, { title: string; description: string }> = {
  do: { title: "", description: "" },
  learn: {
    title: "Performance Management Guide",
    description: "Frameworks, scripts, and best practices for goals, check-ins, and feedback.",
  },
  status: {
    title: "Performance Status",
    description: "Check-in completion rates, overdue flags, and documentation gaps.",
  },
  dashboard: {
    title: "Grow Dashboard",
    description: "Overview of performance goals, check-ins, and team health.",
  },
};
```

**Step 4: Commit**

```bash
git add apps/platform/src/app/page.tsx apps/platform/src/components/chat/chat-welcome.tsx apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "feat: wire up Grow components into all four tabs"
```

---

## Phase 12: Check-In Form Component

### Task 22: Create Check-In Form Component

**Files:**
- Create: `apps/platform/src/components/grow/checkin-form.tsx`

**Step 1: Create the CheckInForm component**

A form for quick check-in scheduling and completion. Two modes:
- **Schedule mode**: Select goal, set date, pick cadence → POST to `/api/check-ins`
- **Complete mode**: Given a check-in ID, fill in progress/blockers/support/rating → PATCH to `/api/check-ins/[id]`

Fetch active goals from `/api/goals?status=active` for the goal dropdown.

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/checkin-form.tsx
git commit -m "feat: add CheckInForm component (#13)"
```

---

### Task 23: Create Check-In List Component

**Files:**
- Create: `apps/platform/src/components/grow/checkin-list.tsx`

**Step 1: Create the CheckInList component**

Shows upcoming and past check-ins. Each row shows: goal name, scheduled date, status badge, and completion details if available.

Status badges: scheduled (blue), completed (green), missed (red), cancelled (gray).

Filter by status. If overdue, show a warning indicator.

**Step 2: Commit**

```bash
git add apps/platform/src/components/grow/checkin-list.tsx
git commit -m "feat: add CheckInList component (#13)"
```

---

## Phase 13: Seed Data (Issue #18)

### Task 24: Create Grow Seed Script

**Files:**
- Create: `packages/db/scripts/seed-grow.ts`
- Modify: `packages/db/package.json` (add seed script)

**Step 1: Create seed script**

Seeds sample goals, check-ins, and performance notes for the existing seeded employees.

```typescript
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: resolve(__dirname, "../../../.env") });

import mongoose from "mongoose";
import { Employee } from "../src/employee-schema";
import { Goal } from "../src/goal-schema";
import { CheckIn } from "../src/checkin-schema";
import { PerformanceNote } from "../src/performance-note-schema";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);

  // Clear existing grow data
  await Goal.deleteMany({});
  await CheckIn.deleteMany({});
  await PerformanceNote.deleteMany({});

  // Get employees
  const employees = await Employee.find({ status: "active" }).limit(5);
  if (employees.length === 0) {
    console.error("No employees found. Run seed-employees first.");
    process.exit(1);
  }

  const now = new Date();
  const goals = [];
  const checkIns = [];
  const notes = [];

  for (const emp of employees) {
    // Create 2 goals per employee
    goals.push(
      {
        statement: `Improve ${emp.department} team productivity by 15%`,
        measure: "Measured by sprint velocity increase over Q1",
        type: "individual",
        owner: emp._id,
        createdBy: emp._id,
        timeperiod: {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth() + 2, 0),
        },
        status: "active",
        visibility: "manager",
      },
      {
        statement: `Complete ${emp.jobTitle} certification program`,
        measure: "Certificate obtained and filed with HR",
        type: "individual",
        owner: emp._id,
        createdBy: emp._id,
        timeperiod: {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 3, 0),
        },
        status: "draft",
        visibility: "manager",
      }
    );
  }

  const createdGoals = await Goal.insertMany(goals);
  console.log(`Created ${createdGoals.length} goals`);

  // Create check-ins for active goals
  for (const goal of createdGoals) {
    const goalObj = goal.toJSON() as Record<string, unknown>;
    if (goalObj.status !== "active") continue;

    const emp = employees.find((e) => String(e._id) === String(goalObj.owner));
    if (!emp) continue;

    // Past completed check-in
    checkIns.push({
      goal: goal._id,
      employee: emp._id,
      scheduledDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      completedDate: new Date(now.getFullYear(), now.getMonth() - 1, 16),
      cadence: "monthly",
      progress: "Made solid progress on initial milestones. Completed training modules 1-3.",
      blockers: null,
      supportNeeded: null,
      rating: "on_track",
      status: "completed",
    });

    // Upcoming scheduled check-in
    checkIns.push({
      goal: goal._id,
      employee: emp._id,
      scheduledDate: new Date(now.getFullYear(), now.getMonth(), 15),
      cadence: "monthly",
      status: "scheduled",
    });

    // Overdue check-in (for some)
    if (Math.random() > 0.5) {
      checkIns.push({
        goal: goal._id,
        employee: emp._id,
        scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
        cadence: "monthly",
        status: "scheduled",
      });
    }
  }

  const createdCheckIns = await CheckIn.insertMany(checkIns);
  console.log(`Created ${createdCheckIns.length} check-ins`);

  // Create performance notes
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const author = employees[(i + 1) % employees.length];
    notes.push({
      employee: emp._id,
      author: author._id,
      type: i % 2 === 0 ? "observation" : "recognition",
      content: i % 2 === 0
        ? `Observed strong collaboration during the ${emp.department} sprint review. Actively contributed to problem-solving.`
        : `Outstanding work on the recent ${emp.department} project. Delivered ahead of schedule with high quality.`,
      context: "Sprint review meeting",
      visibility: "manager_only",
    });
  }

  const createdNotes = await PerformanceNote.insertMany(notes);
  console.log(`Created ${createdNotes.length} performance notes`);

  await mongoose.disconnect();
  console.log("Grow seed complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Step 2: Add seed script to package.json**

In `packages/db/package.json`, add to scripts:
```json
"db:seed-grow": "npx tsx scripts/seed-grow.ts"
```

And in root `package.json` (if it has a seed script):
```json
"db:seed-grow": "pnpm --filter @ascenta/db db:seed-grow"
```

**Step 3: Run the seed**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm db:seed-grow`

**Step 4: Commit**

```bash
git add packages/db/scripts/seed-grow.ts packages/db/package.json
git commit -m "feat: add Grow seed script with sample goals, check-ins, notes (#18)"
```

---

## Phase 14: End-to-End Validation (Issue #18)

### Task 25: Manual E2E Verification

**Steps:**
1. Start dev server: `pnpm dev --filter=@ascenta/platform`
2. Open `localhost:3051`
3. Verify role switcher shows in navbar
4. Click "Grow" on DO tab → verify action cards appear
5. Click "Create Goal" → verify form renders and submit works
6. Click "View Goals" → verify goal list shows seeded goals
7. Click "Log Check-In" → verify form works
8. Click "View Check-Ins" → verify list shows seeded check-ins
9. Click "Add Note" → verify form works
10. Switch to LEARN tab → verify Grow help content renders
11. Switch to STATUS tab → verify completion rates and overdue flags
12. Switch to DASHBOARD tab → verify summary cards and activity feed
13. Open chat panel → type "Create a goal for [employee name]" → verify AI tool works
14. Type "Add a recognition note for [employee name]" → verify AI tool works
15. Type "How are check-ins looking?" → verify getGrowStatus tool works

**Step 2: Fix any issues discovered**

**Step 3: Final commit**

```bash
git add -A
git commit -m "fix: end-to-end validation fixes for Grow section (#18)"
```

---

## Dependency Graph

```
Task 1 (Goal schema)     ─┐
Task 2 (CheckIn schema)  ─┤── Task 4 (DB exports) ── Task 5 (workflow types)
Task 3 (Note schema)     ─┘
                                    │
                    ┌───────────────┼───────────────────┐
                    ▼               ▼                   ▼
            Task 6-7 (Roles)   Task 10 (Goals API)  Task 12 (CheckIns API)
                    │               │                   │
                    ▼               ▼                   ▼
            Task 8 (DO tab)    Task 9 (Goal form)  Task 15 (Workflow def)
                    │          Task 11 (Goal list)      │
                    │               │                   │
                    └───────┬───────┘                   │
                            ▼                           │
                    Task 13 (Notes API) ────────────────┤
                    Task 14 (Note form)                 │
                            │                           │
                            ▼                           ▼
                    Task 16 (AI tools) ─── Task 17 (Status API)
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                            Task 18 (STATUS) Task 19 (LEARN) Task 20 (DASHBOARD)
                                    │           │           │
                                    └───────┬───┘───────────┘
                                            ▼
                                    Task 21 (Wire tabs)
                                    Task 22-23 (CheckIn UI)
                                            │
                                            ▼
                                    Task 24 (Seed data)
                                            │
                                            ▼
                                    Task 25 (E2E validation)
```

## Parallelization Opportunities

- Tasks 1-3 can run in parallel (independent schemas)
- Tasks 9-11 can run in parallel with Task 12 (goals UI vs check-in API)
- Task 13 can run in parallel with Task 15 (notes API vs workflow def)
- Tasks 18-20 can run in parallel (STATUS, LEARN, DASHBOARD tabs are independent)
- Task 19 (LEARN) can start anytime after Task 8 (no API dependency)
