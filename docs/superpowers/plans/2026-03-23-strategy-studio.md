# Strategy Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Strategy Studio with two tabs — Foundation (Mission/Vision/Values) and Strategy (company/department goals at long/medium/short time horizons).

**Architecture:** Two new database schemas in `packages/db`, API routes under `/api/plan/`, and two panel components rendered via custom tabs on the existing `plan/strategy-studio` page config. Follows the same patterns as Grow/Performance (goals-panel, goal-card, goal-schema).

**Tech Stack:** Next.js App Router, React 19, Mongoose, Zod, shadcn/ui, Tailwind CSS v4, Vercel AI SDK (for AI Assist endpoint)

**Spec:** `docs/superpowers/specs/2026-03-23-strategy-studio-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `packages/db/src/foundation-schema.ts` | Mongoose schema + model for CompanyFoundation (mission/vision/values) |
| `packages/db/src/strategy-goal-constants.ts` | Enums for strategy goal horizons, scopes, statuses (client-safe, no mongoose) |
| `packages/db/src/strategy-goal-schema.ts` | Mongoose schema + model for StrategyGoal |
| `apps/platform/src/lib/validations/foundation.ts` | Zod schema for foundation form |
| `apps/platform/src/lib/validations/strategy-goal.ts` | Zod schema for strategy goal form |
| `apps/platform/src/app/api/plan/foundation/route.ts` | GET/POST/PATCH for MVV document |
| `apps/platform/src/app/api/plan/strategy-goals/route.ts` | GET/POST for strategy goals |
| `apps/platform/src/app/api/plan/strategy-goals/[id]/route.ts` | PATCH for individual strategy goal |
| `apps/platform/src/app/api/plan/ai-assist/route.ts` | POST — inline AI assist for MVV and strategy fields |
| `apps/platform/src/components/plan/foundation-panel.tsx` | MVV form (edit) + display (read-only) with AI Assist |
| `apps/platform/src/components/plan/strategy-panel.tsx` | Strategy goals list with company/department toggle |
| `apps/platform/src/components/plan/strategy-goal-card.tsx` | Expandable card for a strategy goal |
| `apps/platform/src/components/plan/strategy-goal-form.tsx` | Creation/edit form for strategy goals |

### Modified Files

| File | Change |
|------|--------|
| `packages/db/package.json` | Add exports for `foundation-schema`, `strategy-goal-schema`, `strategy-goal-constants` |
| `apps/platform/src/lib/constants/dashboard-nav.ts` | Add `tabs` array to `plan/strategy-studio` page config; add `Compass` and `Target` icon imports |
| `apps/platform/src/app/[category]/[sub]/page.tsx` | Add `"foundation"` and `"strategy"` tab cases + lazy imports |

---

## Task 1: Foundation Database Schema

**Files:**
- Create: `packages/db/src/foundation-schema.ts`
- Modify: `packages/db/package.json`

- [ ] **Step 1: Create the foundation schema**

Create `packages/db/src/foundation-schema.ts`:

```typescript
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

const foundationSchema = new Schema(
  {
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    values: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

export const CompanyFoundation =
  mongoose.models.CompanyFoundation ||
  mongoose.model("CompanyFoundation", foundationSchema);
```

- [ ] **Step 2: Add export to packages/db/package.json**

Add to the `"exports"` object in `packages/db/package.json`:

```json
"./foundation-schema": "./src/foundation-schema.ts"
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm build --filter=@ascenta/db`

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/foundation-schema.ts packages/db/package.json
git commit -m "feat(db): add CompanyFoundation schema for mission/vision/values"
```

---

## Task 2: Strategy Goal Database Schema

**Files:**
- Create: `packages/db/src/strategy-goal-constants.ts`
- Create: `packages/db/src/strategy-goal-schema.ts`
- Modify: `packages/db/package.json`

- [ ] **Step 1: Create strategy goal constants (client-safe)**

Create `packages/db/src/strategy-goal-constants.ts`:

```typescript
/**
 * Strategy Goal Constants
 * Shared between client and server — no mongoose dependency.
 */

export const STRATEGY_HORIZONS = [
  "long_term",
  "medium_term",
  "short_term",
] as const;

export const STRATEGY_HORIZON_LABELS: Record<
  (typeof STRATEGY_HORIZONS)[number],
  string
> = {
  long_term: "Long-term",
  medium_term: "Medium-term",
  short_term: "Short-term",
};

export const STRATEGY_HORIZON_SUGGESTIONS: Record<
  (typeof STRATEGY_HORIZONS)[number],
  string
> = {
  long_term: "3–5 years",
  medium_term: "1–2 years",
  short_term: "This quarter – 6 months",
};

export const STRATEGY_SCOPES = ["company", "department"] as const;

export const STRATEGY_GOAL_STATUSES = [
  "draft",
  "on_track",
  "needs_attention",
  "off_track",
  "completed",
  "archived",
] as const;
```

- [ ] **Step 2: Create strategy goal schema**

Create `packages/db/src/strategy-goal-schema.ts`:

```typescript
import mongoose, { Schema } from "mongoose";
export {
  STRATEGY_HORIZONS,
  STRATEGY_HORIZON_LABELS,
  STRATEGY_HORIZON_SUGGESTIONS,
  STRATEGY_SCOPES,
  STRATEGY_GOAL_STATUSES,
} from "./strategy-goal-constants";
import {
  STRATEGY_HORIZONS,
  STRATEGY_SCOPES,
  STRATEGY_GOAL_STATUSES,
} from "./strategy-goal-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const strategyGoalSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    horizon: {
      type: String,
      required: true,
      enum: STRATEGY_HORIZONS,
      index: true,
    },
    timePeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    scope: {
      type: String,
      required: true,
      enum: STRATEGY_SCOPES,
      index: true,
    },
    department: { type: String, default: null, index: true },
    successMetrics: { type: String, default: "" },
    status: {
      type: String,
      required: true,
      enum: STRATEGY_GOAL_STATUSES,
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

strategyGoalSchema.index({ scope: 1, horizon: 1 });
strategyGoalSchema.index({ department: 1, horizon: 1 });

export const StrategyGoal =
  mongoose.models.StrategyGoal ||
  mongoose.model("StrategyGoal", strategyGoalSchema);
```

- [ ] **Step 3: Add exports to packages/db/package.json**

Add to the `"exports"` object:

```json
"./strategy-goal-constants": "./src/strategy-goal-constants.ts",
"./strategy-goal-schema": "./src/strategy-goal-schema.ts"
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm build --filter=@ascenta/db`

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/strategy-goal-constants.ts packages/db/src/strategy-goal-schema.ts packages/db/package.json
git commit -m "feat(db): add StrategyGoal schema with horizon, scope, and status"
```

---

## Task 3: Zod Validation Schemas

**Files:**
- Create: `apps/platform/src/lib/validations/foundation.ts`
- Create: `apps/platform/src/lib/validations/strategy-goal.ts`

- [ ] **Step 1: Create foundation validation**

Create `apps/platform/src/lib/validations/foundation.ts`:

```typescript
import { z } from "zod";

export const foundationFormSchema = z.object({
  mission: z.string().max(2000, "Mission must be 2000 characters or fewer").optional().default(""),
  vision: z.string().max(2000, "Vision must be 2000 characters or fewer").optional().default(""),
  values: z.string().max(2000, "Values must be 2000 characters or fewer").optional().default(""),
});

export type FoundationFormValues = z.infer<typeof foundationFormSchema>;
```

- [ ] **Step 2: Create strategy goal validation**

Create `apps/platform/src/lib/validations/strategy-goal.ts`:

```typescript
import { z } from "zod";
import {
  STRATEGY_HORIZONS,
  STRATEGY_SCOPES,
  STRATEGY_GOAL_STATUSES,
} from "@ascenta/db/strategy-goal-constants";

export const strategyGoalFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    description: z.string().min(1, "Description is required"),
    horizon: z.enum(STRATEGY_HORIZONS, { message: "Horizon is required" }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    scope: z.enum(STRATEGY_SCOPES, { message: "Scope is required" }),
    department: z.string().optional().default(""),
    successMetrics: z.string().optional().default(""),
    status: z.enum(STRATEGY_GOAL_STATUSES).optional().default("draft"),
  })
  .refine(
    (data) => {
      if (data.scope === "department") {
        return data.department.length > 0;
      }
      return true;
    },
    {
      message: "Department is required when scope is department",
      path: ["department"],
    },
  );

export type StrategyGoalFormValues = z.infer<typeof strategyGoalFormSchema>;
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/validations/foundation.ts apps/platform/src/lib/validations/strategy-goal.ts
git commit -m "feat: add Zod validation schemas for foundation and strategy goals"
```

---

## Task 4: Foundation API Route

**Files:**
- Create: `apps/platform/src/app/api/plan/foundation/route.ts`

- [ ] **Step 1: Create the foundation API route**

Create `apps/platform/src/app/api/plan/foundation/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { foundationFormSchema } from "@/lib/validations/foundation";

export async function GET() {
  try {
    await connectDB();
    // Single global document — findOne with no filter
    const doc = await CompanyFoundation.findOne().lean();
    if (!doc) {
      return NextResponse.json({ success: true, foundation: null });
    }
    const foundation = {
      ...doc,
      id: String(doc._id),
      _id: undefined,
      __v: undefined,
    };
    return NextResponse.json({ success: true, foundation });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Foundation GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch foundation" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = foundationFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Upsert: create if none exists, update if it does
    const doc = await CompanyFoundation.findOneAndUpdate(
      {},
      { $set: parsed.data },
      { upsert: true, new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, foundation: doc.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Foundation POST error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to save foundation" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { action } = body;

    if (action === "publish") {
      const doc = await CompanyFoundation.findOneAndUpdate(
        {},
        { $set: { status: "published", publishedAt: new Date() } },
        { new: true },
      );
      if (!doc) {
        return NextResponse.json(
          { success: false, error: "No foundation document exists" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, foundation: doc.toJSON() });
    }

    if (action === "unpublish") {
      const doc = await CompanyFoundation.findOneAndUpdate(
        {},
        { $set: { status: "draft" } },
        { new: true },
      );
      if (!doc) {
        return NextResponse.json(
          { success: false, error: "No foundation document exists" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, foundation: doc.toJSON() });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'publish' or 'unpublish'." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Foundation PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update foundation status" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify the route loads**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm build --filter=@ascenta/platform`
(Or start dev server and hit `GET /api/plan/foundation` — should return `{ success: true, foundation: null }`)

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/plan/foundation/route.ts
git commit -m "feat(api): add foundation CRUD route for mission/vision/values"
```

---

## Task 5: Strategy Goals API Routes

**Files:**
- Create: `apps/platform/src/app/api/plan/strategy-goals/route.ts`
- Create: `apps/platform/src/app/api/plan/strategy-goals/[id]/route.ts`

- [ ] **Step 1: Create the strategy goals list + create route**

Create `apps/platform/src/app/api/plan/strategy-goals/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { strategyGoalFormSchema } from "@/lib/validations/strategy-goal";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");
    const horizon = searchParams.get("horizon");
    const department = searchParams.get("department");

    const filter: Record<string, string> = {};
    if (scope) filter.scope = scope;
    if (horizon) filter.horizon = horizon;
    if (department) filter.department = department;

    // Exclude archived by default unless explicitly requested
    if (!searchParams.has("includeArchived")) {
      filter.status = { $ne: "archived" } as unknown as string;
    }

    const goals = await StrategyGoal.find(filter)
      .sort({ horizon: 1, createdAt: -1 })
      .lean();

    const transformed = goals.map((g: Record<string, unknown>) => ({
      ...g,
      id: String(g._id),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, goals: transformed });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy goals GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch strategy goals" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = strategyGoalFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const goal = await StrategyGoal.create({
      title: data.title,
      description: data.description,
      horizon: data.horizon,
      timePeriod: {
        start: new Date(data.startDate),
        end: new Date(data.endDate),
      },
      scope: data.scope,
      department: data.scope === "department" ? data.department : null,
      successMetrics: data.successMetrics,
      status: data.status,
    });

    return NextResponse.json({ success: true, goal: goal.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy goals POST error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create strategy goal" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Create the individual strategy goal update route**

Create `apps/platform/src/app/api/plan/strategy-goals/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { strategyGoalFormSchema } from "@/lib/validations/strategy-goal";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Allow partial updates — use the form schema as a partial validator
    const parsed = strategyGoalFormSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const update: Record<string, unknown> = {};

    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.horizon !== undefined) update.horizon = data.horizon;
    if (data.scope !== undefined) update.scope = data.scope;
    if (data.department !== undefined) update.department = data.scope === "department" ? data.department : null;
    if (data.successMetrics !== undefined) update.successMetrics = data.successMetrics;
    if (data.status !== undefined) update.status = data.status;
    if (data.startDate && data.endDate) {
      update.timePeriod = { start: new Date(data.startDate), end: new Date(data.endDate) };
    }

    const goal = await StrategyGoal.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Strategy goal not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, goal: goal.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy goal PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update strategy goal" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/plan/strategy-goals/route.ts apps/platform/src/app/api/plan/strategy-goals/\[id\]/route.ts
git commit -m "feat(api): add strategy goals CRUD routes"
```

---

## Task 6: AI Assist API Route

**Files:**
- Create: `apps/platform/src/app/api/plan/ai-assist/route.ts`

- [ ] **Step 1: Create the AI assist endpoint**

Create `apps/platform/src/app/api/plan/ai-assist/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { AI_CONFIG } from "@/lib/ai/config";
import { getModel } from "@/lib/ai/providers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, context, currentValue } = body;

    if (!section) {
      return NextResponse.json(
        { success: false, error: "section is required" },
        { status: 400 },
      );
    }

    const prompts: Record<string, string> = {
      mission: `You are helping craft a company mission statement. A mission statement describes the company's purpose — what it does, who it serves, and why it exists. It should be clear, concise (1-3 sentences), and inspiring.`,
      vision: `You are helping craft a company vision statement. A vision statement describes the future the company aspires to create — where it's headed. It should be aspirational, forward-looking, and concise (1-3 sentences).`,
      values: `You are helping define company values. Values describe the principles and beliefs that guide how the company operates and makes decisions. List 3-6 core values, each with a brief description (1-2 sentences).`,
      strategy_description: `You are helping write a strategy goal description. Make it specific, actionable, and measurable. 2-4 sentences.`,
      strategy_metrics: `You are helping define success metrics for a strategy goal. Suggest 2-4 concrete, measurable success criteria.`,
    };

    const systemPrompt = prompts[section];
    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: `Unknown section: ${section}` },
        { status: 400 },
      );
    }

    let userPrompt = "";
    if (currentValue) {
      userPrompt = `Here is the current draft:\n\n${currentValue}\n\nPlease refine and improve it.`;
    } else if (context) {
      userPrompt = `Here is context from other sections of the company strategy:\n\n${context}\n\nBased on this context, generate a strong draft.`;
    } else {
      userPrompt = `Generate a strong draft. The user will refine it from here.`;
    }

    // getModel(modelId) returns a provider-routed model instance
    const result = await generateText({
      model: getModel(AI_CONFIG.defaultModels.openai),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 500,
    });

    return NextResponse.json({ success: true, text: result.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI assist error:", message);
    return NextResponse.json(
      { success: false, error: "AI assist failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/plan/ai-assist/route.ts
git commit -m "feat(api): add AI assist endpoint for strategy studio content generation"
```

---

## Task 7: Dashboard Nav — Add Strategy Studio Tabs

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`

- [ ] **Step 1: Add tabs to the plan/strategy-studio page config**

In `apps/platform/src/lib/constants/dashboard-nav.ts`, update the `"plan/strategy-studio"` entry in `PAGE_CONFIG` to include custom tabs. The `Compass` and `Target` icons are already imported.

Change:

```typescript
  "plan/strategy-studio": {
    title: "Strategy Studio",
    description: "Define and align your people strategy with business objectives.",
  },
```

To:

```typescript
  "plan/strategy-studio": {
    title: "Strategy Studio",
    description: "Define and align your people strategy with business objectives.",
    tabs: [
      { key: "foundation", label: "Foundation", icon: Compass },
      { key: "strategy", label: "Strategy", icon: Target },
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "feat(nav): add Foundation and Strategy tabs to Strategy Studio page config"
```

---

## Task 8: Foundation Panel Component

**Files:**
- Create: `apps/platform/src/components/plan/foundation-panel.tsx`

- [ ] **Step 1: Create the foundation panel**

Create `apps/platform/src/components/plan/foundation-panel.tsx`. This component handles both edit and read-only modes:

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Sparkles, Pencil, Eye, ExternalLink } from "lucide-react";
import { cn } from "@ascenta/ui";
import Link from "next/link";

interface FoundationData {
  id: string;
  mission: string;
  vision: string;
  values: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
}

type SectionKey = "mission" | "vision" | "values";

const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
  {
    key: "mission",
    label: "Mission",
    description: "What does your company do, who does it serve, and why does it exist?",
  },
  {
    key: "vision",
    label: "Vision",
    description: "What future is your company working to create?",
  },
  {
    key: "values",
    label: "Values",
    description: "What principles guide how your company operates and makes decisions?",
  },
];

interface FoundationPanelProps {
  accentColor: string;
}

export function FoundationPanel({ accentColor }: FoundationPanelProps) {
  const [foundation, setFoundation] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ mission: "", vision: "", values: "" });
  const [aiLoading, setAiLoading] = useState<SectionKey | null>(null);

  const fetchFoundation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/plan/foundation");
      const data = await res.json();
      if (data.success) {
        setFoundation(data.foundation);
        if (data.foundation) {
          setForm({
            mission: data.foundation.mission,
            vision: data.foundation.vision,
            values: data.foundation.values,
          });
          // If draft or no doc, start in edit mode
          setEditMode(data.foundation.status === "draft");
        } else {
          setEditMode(true);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoundation();
  }, [fetchFoundation]);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/plan/foundation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setFoundation(data.foundation);
      }
    } catch {
      // silent — user sees the form still
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    const res = await fetch("/api/plan/foundation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    const data = await res.json();
    if (data.success) {
      setFoundation(data.foundation);
      setEditMode(false);
    }
  }

  async function handleUnpublish() {
    const res = await fetch("/api/plan/foundation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unpublish" }),
    });
    const data = await res.json();
    if (data.success) {
      setFoundation(data.foundation);
      setEditMode(true);
    }
  }

  async function handleAiAssist(section: SectionKey) {
    setAiLoading(section);
    try {
      const otherSections = SECTIONS.filter((s) => s.key !== section)
        .map((s) => `${s.label}: ${form[s.key]}`)
        .filter((s) => s.split(": ")[1])
        .join("\n");

      const res = await fetch("/api/plan/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          currentValue: form[section] || undefined,
          context: otherSections || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, [section]: data.text }));
      }
    } catch {
      // silent
    } finally {
      setAiLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Published read-only view
  if (foundation?.status === "published" && !editMode) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-deep-blue">
                Our Foundation
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Published{" "}
                {foundation.publishedAt
                  ? new Date(foundation.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="size-4" />
              Edit
            </button>
          </div>

          <div className="space-y-5">
            {SECTIONS.map((section) => (
              <div
                key={section.key}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <h3
                  className="font-display text-base font-bold mb-2"
                  style={{ color: accentColor }}
                >
                  {section.label}
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {foundation[section.key] || "Not yet defined."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-deep-blue">
              Company Foundation
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Define your company&apos;s mission, vision, and values.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {foundation?.status === "published" && (
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="size-4" />
                View
              </button>
            )}
            <Link
              href="/do"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-4" />
              Use Do
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3
                    className="font-display text-base font-bold"
                    style={{ color: accentColor }}
                  >
                    {section.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {section.description}
                  </p>
                </div>
                <button
                  onClick={() => handleAiAssist(section.key)}
                  disabled={aiLoading !== null}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    "border hover:bg-accent/5",
                  )}
                  style={{
                    color: accentColor,
                    borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                  }}
                >
                  {aiLoading === section.key ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  AI Assist
                </button>
              </div>
              <textarea
                value={form[section.key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [section.key]: e.target.value }))
                }
                onBlur={handleSave}
                placeholder={`Enter your company's ${section.label.toLowerCase()}...`}
                rows={4}
                className="w-full rounded-lg border px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[--accent] resize-y"
                style={{
                  "--accent": accentColor,
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {saving ? "Saving..." : foundation ? "Auto-saved" : ""}
          </p>
          <div className="flex items-center gap-2">
            {foundation?.status === "published" ? (
              <button
                onClick={handleUnpublish}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Unpublish
              </button>
            ) : null}
            <button
              onClick={handlePublish}
              disabled={!form.mission && !form.vision && !form.values}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              {foundation?.status === "published" ? "Re-publish" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/foundation-panel.tsx
git commit -m "feat: add FoundationPanel component with edit/read-only modes and AI assist"
```

---

## Task 9: Strategy Goal Card Component

**Files:**
- Create: `apps/platform/src/components/plan/strategy-goal-card.tsx`

- [ ] **Step 1: Create the strategy goal card**

Create `apps/platform/src/components/plan/strategy-goal-card.tsx`. Follows the same expandable pattern as `components/grow/goal-card.tsx`:

```typescript
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  STRATEGY_HORIZON_LABELS,
} from "@ascenta/db/strategy-goal-constants";

export interface StrategyGoalData {
  id: string;
  title: string;
  description: string;
  horizon: string;
  timePeriod: { start: string; end: string };
  scope: string;
  department: string | null;
  successMetrics: string;
  status: string;
  createdAt: string;
}

interface StrategyGoalCardProps {
  goal: StrategyGoalData;
  accentColor: string;
  onEdit?: (goal: StrategyGoalData) => void;
  onArchive?: (goalId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  on_track: "#22c55e",
  needs_attention: "#f59e0b",
  off_track: "#ef4444",
  completed: "#6b7280",
  archived: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  on_track: "On Track",
  needs_attention: "Needs Attention",
  off_track: "Off Track",
  completed: "Completed",
  archived: "Archived",
};

const HORIZON_COLORS: Record<string, { bg: string; text: string }> = {
  long_term: { bg: "rgba(102, 136, 187, 0.1)", text: "#6688bb" },
  medium_term: { bg: "rgba(68, 170, 153, 0.1)", text: "#44aa99" },
  short_term: { bg: "rgba(187, 102, 136, 0.1)", text: "#bb6688" },
};

function formatTimePeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const eMonth = e.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${sMonth} – ${eMonth}`;
}

export function StrategyGoalCard({ goal, accentColor, onEdit, onArchive }: StrategyGoalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";
  const horizonColor = HORIZON_COLORS[goal.horizon] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  const horizonLabel = STRATEGY_HORIZON_LABELS[goal.horizon as keyof typeof STRATEGY_HORIZON_LABELS] ?? goal.horizon;

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: statusColor }}
          title={STATUS_LABELS[goal.status]}
        />
        <span className="flex-1 font-display text-sm font-semibold text-deep-blue truncate">
          {goal.title}
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: horizonColor.bg, color: horizonColor.text }}
        >
          {horizonLabel}
        </span>
        {goal.scope === "department" && goal.department && (
          <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
            {goal.department}
          </span>
        )}
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {formatTimePeriod(goal.timePeriod.start, goal.timePeriod.end)}
        </span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t px-5 py-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {goal.description}
              </p>
            </div>

            {goal.successMetrics && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Success Metrics
                </p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {goal.successMetrics}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Horizon
                </p>
                <p className="text-sm text-foreground">{horizonLabel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Scope
                </p>
                <p className="text-sm text-foreground capitalize">
                  {goal.scope === "department" ? goal.department : "Company-wide"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="text-sm" style={{ color: statusColor }}>
                    {STATUS_LABELS[goal.status] ?? goal.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(goal);
                  }}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
              )}
              {onArchive && goal.status !== "archived" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(goal.id);
                  }}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/strategy-goal-card.tsx
git commit -m "feat: add StrategyGoalCard expandable component"
```

---

## Task 10: Strategy Goal Form Component

**Files:**
- Create: `apps/platform/src/components/plan/strategy-goal-form.tsx`

- [ ] **Step 1: Create the strategy goal form**

Create `apps/platform/src/components/plan/strategy-goal-form.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  STRATEGY_HORIZONS,
  STRATEGY_HORIZON_LABELS,
  STRATEGY_HORIZON_SUGGESTIONS,
  STRATEGY_GOAL_STATUSES,
} from "@ascenta/db/strategy-goal-constants";
import type { StrategyGoalData } from "./strategy-goal-card";

interface StrategyGoalFormProps {
  accentColor: string;
  onClose: () => void;
  onSaved: () => void;
  editGoal?: StrategyGoalData | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  on_track: "On Track",
  needs_attention: "Needs Attention",
  off_track: "Off Track",
  completed: "Completed",
  archived: "Archived",
};

export function StrategyGoalForm({
  accentColor,
  onClose,
  onSaved,
  editGoal,
}: StrategyGoalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [horizon, setHorizon] = useState<string>("short_term");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scope, setScope] = useState<"company" | "department">("company");
  const [department, setDepartment] = useState("");
  const [successMetrics, setSuccessMetrics] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [departments, setDepartments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Load departments from employees
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/dashboard/employees?limit=200");
        const data = await res.json();
        if (data.employees) {
          const depts = [
            ...new Set(
              data.employees
                .map((e: { department?: string }) => e.department)
                .filter(Boolean),
            ),
          ] as string[];
          setDepartments(depts.sort());
        }
      } catch {
        // silent
      }
    }
    fetchDepartments();
  }, []);

  // Pre-fill if editing
  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setDescription(editGoal.description);
      setHorizon(editGoal.horizon);
      setStartDate(editGoal.timePeriod.start.split("T")[0]);
      setEndDate(editGoal.timePeriod.end.split("T")[0]);
      setScope(editGoal.scope as "company" | "department");
      setDepartment(editGoal.department ?? "");
      setSuccessMetrics(editGoal.successMetrics);
      setStatus(editGoal.status);
    }
  }, [editGoal]);

  async function handleAiAssist(field: "description" | "successMetrics") {
    setAiLoading(field);
    try {
      const section = field === "description" ? "strategy_description" : "strategy_metrics";
      const context = `Title: ${title}\nHorizon: ${STRATEGY_HORIZON_LABELS[horizon as keyof typeof STRATEGY_HORIZON_LABELS]}\nScope: ${scope === "department" ? department : "Company-wide"}`;
      const res = await fetch("/api/plan/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          currentValue: field === "description" ? description : successMetrics,
          context,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (field === "description") setDescription(data.text);
        else setSuccessMetrics(data.text);
      }
    } catch {
      // silent
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (scope === "department" && !department) newErrors.department = "Department is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const url = editGoal
        ? `/api/plan/strategy-goals/${editGoal.id}`
        : "/api/plan/strategy-goals";
      const method = editGoal ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          horizon,
          startDate,
          endDate,
          scope,
          department: scope === "department" ? department : "",
          successMetrics,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        setErrors({ form: typeof data.error === "string" ? data.error : "Failed to save" });
      }
    } catch {
      setErrors({ form: "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-display text-base font-bold text-deep-blue">
            {editGoal ? "Edit Strategy Goal" : "Create Strategy Goal"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              placeholder="e.g., Expand into APAC market"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description + AI Assist */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <button
                type="button"
                onClick={() => handleAiAssist("description")}
                disabled={aiLoading !== null}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: accentColor }}
              >
                {aiLoading === "description" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI Assist
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="Describe the strategic objective..."
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Horizon + Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horizon
              </label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                {STRATEGY_HORIZONS.map((h) => (
                  <option key={h} value={h}>
                    {STRATEGY_HORIZON_LABELS[h]} ({STRATEGY_HORIZON_SUGGESTIONS[h]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Start
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                End
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Scope + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "company" | "department")}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="company">Company-wide</option>
                <option value="department">Department</option>
              </select>
            </div>
            {scope === "department" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                >
                  <option value="">Select department...</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
            )}
          </div>

          {/* Success Metrics + AI Assist */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Success Metrics
              </label>
              <button
                type="button"
                onClick={() => handleAiAssist("successMetrics")}
                disabled={aiLoading !== null}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: accentColor }}
              >
                {aiLoading === "successMetrics" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI Assist
              </button>
            </div>
            <textarea
              value={successMetrics}
              onChange={(e) => setSuccessMetrics(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="How will success be measured?"
            />
          </div>

          {/* Status */}
          {editGoal && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                {STRATEGY_GOAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s] ?? s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errors.form && (
            <p className="text-xs text-red-500">{errors.form}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editGoal ? (
                "Save Changes"
              ) : (
                "Create Goal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/strategy-goal-form.tsx
git commit -m "feat: add StrategyGoalForm modal component with AI assist"
```

---

## Task 11: Strategy Panel Component

**Files:**
- Create: `apps/platform/src/components/plan/strategy-panel.tsx`

- [ ] **Step 1: Create the strategy panel**

Create `apps/platform/src/components/plan/strategy-panel.tsx`:

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Target, Plus, ExternalLink } from "lucide-react";
import { cn } from "@ascenta/ui";
import { STRATEGY_HORIZON_LABELS } from "@ascenta/db/strategy-goal-constants";
import { StrategyGoalCard } from "./strategy-goal-card";
import { StrategyGoalForm } from "./strategy-goal-form";
import type { StrategyGoalData } from "./strategy-goal-card";
import Link from "next/link";

interface StrategyPanelProps {
  accentColor: string;
}

type ViewMode = "company" | "department";

export function StrategyPanel({ accentColor }: StrategyPanelProps) {
  const [goals, setGoals] = useState<StrategyGoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("company");
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<StrategyGoalData | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/plan/strategy-goals");
      const data = await res.json();
      if (data.success) {
        setGoals(data.goals ?? []);
      } else {
        setError(data.error ?? "Failed to fetch goals");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function handleArchive(goalId: string) {
    await fetch(`/api/plan/strategy-goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    fetchGoals();
  }

  function handleEdit(goal: StrategyGoalData) {
    setEditGoal(goal);
    setShowForm(true);
  }

  // Filter goals by view mode
  const filteredGoals =
    viewMode === "company"
      ? goals.filter((g) => g.scope === "company")
      : goals.filter((g) => g.scope === "department");

  // Group by horizon
  const horizonOrder = ["long_term", "medium_term", "short_term"] as const;
  const groupedByHorizon = horizonOrder.map((h) => ({
    horizon: h,
    label: STRATEGY_HORIZON_LABELS[h],
    goals: filteredGoals.filter((g) => g.horizon === h),
  }));

  // For department view, group by department then horizon
  const departments = [
    ...new Set(goals.filter((g) => g.scope === "department").map((g) => g.department).filter(Boolean)),
  ] as string[];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <Target className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Unable to Load Strategy Goals
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-deep-blue">
              Strategy Goals
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {goals.length} goal{goals.length !== 1 ? "s" : ""} across all horizons
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/do"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-4" />
              Use Do
            </Link>
            <button
              onClick={() => {
                setEditGoal(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="size-4" />
              Create Goal
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1 mb-6 w-fit">
          {(["company", "department"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                viewMode === mode
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode === "company" ? "Company-wide" : "By Department"}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No {viewMode === "company" ? "Company" : "Department"} Goals Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first strategy goal to get started.
            </p>
          </div>
        ) : viewMode === "company" ? (
          <div className="space-y-6">
            {groupedByHorizon.map(
              (group) =>
                group.goals.length > 0 && (
                  <div key={group.horizon}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-3">
                      {group.goals.map((goal) => (
                        <StrategyGoalCard
                          key={goal.id}
                          goal={goal}
                          accentColor={accentColor}
                          onEdit={handleEdit}
                          onArchive={handleArchive}
                        />
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {departments.map((dept) => {
              const deptGoals = filteredGoals.filter((g) => g.department === dept);
              if (deptGoals.length === 0) return null;
              return (
                <div key={dept}>
                  <h3 className="font-display text-base font-bold text-deep-blue mb-3">
                    {dept}
                  </h3>
                  <div className="space-y-6">
                    {horizonOrder.map((h) => {
                      const hGoals = deptGoals.filter((g) => g.horizon === h);
                      if (hGoals.length === 0) return null;
                      return (
                        <div key={h}>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            {STRATEGY_HORIZON_LABELS[h]}
                          </p>
                          <div className="space-y-3">
                            {hGoals.map((goal) => (
                              <StrategyGoalCard
                                key={goal.id}
                                goal={goal}
                                accentColor={accentColor}
                                onEdit={handleEdit}
                                onArchive={handleArchive}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <StrategyGoalForm
          accentColor={accentColor}
          onClose={() => {
            setShowForm(false);
            setEditGoal(null);
          }}
          onSaved={fetchGoals}
          editGoal={editGoal}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/strategy-panel.tsx
git commit -m "feat: add StrategyPanel with company/department views and horizon grouping"
```

---

## Task 12: Wire Tabs into Page Router

**Files:**
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

- [ ] **Step 1: Add imports and tab cases**

In `apps/platform/src/app/[category]/[sub]/page.tsx`, add imports at the top (after existing imports):

```typescript
import { FoundationPanel } from "@/components/plan/foundation-panel";
import { StrategyPanel } from "@/components/plan/strategy-panel";
```

Then add two new cases in the tab rendering JSX, after the `activeTab === "goals"` block and before the fallback `else`:

Add `activeTab === "foundation"` case:
```typescript
) : activeTab === "foundation" ? (
  <FoundationPanel accentColor={ctx.category.color} />
) : activeTab === "strategy" ? (
  <StrategyPanel accentColor={ctx.category.color} />
```

The full conditional chain should be: `do` → `learn` → `goals` → `foundation` → `strategy` → fallback.

- [ ] **Step 2: Verify it works**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform`

Navigate to `/plan/strategy-studio` — you should see Foundation and Strategy tabs. Foundation tab should show the MVV form. Strategy tab should show the empty goals state with a "Create Goal" button.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/\\[category\\]/\\[sub\\]/page.tsx
git commit -m "feat: wire Foundation and Strategy tabs into page router"
```

---

## Task 13: Verify Full Build

- [ ] **Step 1: Run lint**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm lint`

Fix any lint errors.

- [ ] **Step 2: Run type check**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm build`

Fix any type errors.

- [ ] **Step 3: Run tests**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm test`

All tests should pass.

- [ ] **Step 4: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix: resolve lint/type issues from Strategy Studio implementation"
```
