# Strategy Translation Phase 2: Strategic Translation Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AI-powered translation engine that converts Foundation + Strategic Priorities into structured, role-based language (contribution statements, outcomes, behaviors, decision rights, alignment descriptors) and persists the results.

**Architecture:** New StrategyTranslation Mongoose model with embedded role arrays. AI generation tool uses Vercel AI SDK's `generateObject` with Zod schema validation to produce structured translations per role. New "Translations" tab in Strategy Studio for management.

**Tech Stack:** Mongoose (schema), Zod (validation + AI output schema), Vercel AI SDK `generateObject` (structured generation), Next.js App Router (API routes), React (management UI)

**Depends on:** Phase 1 (Foundation schema must have nonNegotiableBehaviors and livedPrinciples)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `packages/db/src/strategy-translation-constants.ts` | Create | Shared constants (statuses, role levels, labels) |
| `packages/db/src/strategy-translation-schema.ts` | Create | Mongoose schema + type aliases |
| `packages/db/package.json` | Modify | Add sub-path exports |
| `apps/platform/src/lib/validations/strategy-translation.ts` | Create | Zod schema for AI output + form validation |
| `apps/platform/src/lib/ai/translation-engine.ts` | Create | Core generation logic |
| `apps/platform/src/app/api/plan/strategy-translations/route.ts` | Create | POST (generate) + GET (list) |
| `apps/platform/src/app/api/plan/strategy-translations/[id]/route.ts` | Create | GET (single) + PATCH (publish/archive/edit) |
| `apps/platform/src/components/plan/translations-panel.tsx` | Create | Management UI — department cards |
| `apps/platform/src/components/plan/translation-role-preview.tsx` | Create | Role detail preview component |
| `apps/platform/src/app/strategy-studio/page.tsx` | Modify | Add Translations tab |
| `apps/platform/src/lib/constants/dashboard-nav.ts` | Modify | Add translations tab to strategy-studio config |
| `scripts/seed-strategy-translations.ts` | Create | Sample translation data |

---

### Task 1: Translation Constants

**Files:**
- Create: `packages/db/src/strategy-translation-constants.ts`

- [ ] **Step 1: Create constants file**

```ts
/**
 * Strategy Translation Constants
 * Shared between client and server — no mongoose dependency.
 */

export const TRANSLATION_STATUSES = [
  "generating",
  "draft",
  "published",
  "archived",
] as const;

export const TRANSLATION_STATUS_LABELS: Record<
  (typeof TRANSLATION_STATUSES)[number],
  string
> = {
  generating: "Generating",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const ROLE_LEVELS = [
  "executive",
  "manager",
  "individual_contributor",
] as const;

export const ROLE_LEVEL_LABELS: Record<
  (typeof ROLE_LEVELS)[number],
  string
> = {
  executive: "Executive",
  manager: "Manager",
  individual_contributor: "Individual Contributor",
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/db/src/strategy-translation-constants.ts
git commit -m "feat(db): add strategy translation constants"
```

---

### Task 2: Translation Schema

**Files:**
- Create: `packages/db/src/strategy-translation-schema.ts`

- [ ] **Step 1: Create schema file**

```ts
/**
 * Strategy Translation Schema (Mongoose)
 * Stores AI-generated role-based language derived from Foundation + Strategic Priorities.
 * One document per department per version. Versions are archived, never overwritten.
 */

import mongoose, { Schema, Types } from "mongoose";
import { TRANSLATION_STATUSES, ROLE_LEVELS } from "./strategy-translation-constants";

export {
  TRANSLATION_STATUSES,
  ROLE_LEVELS,
} from "./strategy-translation-constants";

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

const alignmentDescriptorSchema = new Schema(
  {
    strong: { type: String, required: true },
    acceptable: { type: String, required: true },
    poor: { type: String, required: true },
  },
  { _id: false },
);

const contributionSchema = new Schema(
  {
    strategyGoalId: {
      type: Schema.Types.ObjectId,
      ref: "StrategyGoal",
      required: true,
    },
    strategyGoalTitle: { type: String, required: true },
    roleContribution: { type: String, required: true },
    outcomes: { type: [String], required: true },
    alignmentDescriptors: {
      type: alignmentDescriptorSchema,
      required: true,
    },
  },
  { _id: false },
);

const behaviorSchema = new Schema(
  {
    valueName: { type: String, required: true },
    expectation: { type: String, required: true },
  },
  { _id: false },
);

const decisionRightsSchema = new Schema(
  {
    canDecide: { type: [String], default: [] },
    canRecommend: { type: [String], default: [] },
    mustEscalate: { type: [String], default: [] },
  },
  { _id: false },
);

const roleSchema = new Schema(
  {
    jobTitle: { type: String, required: true },
    level: {
      type: String,
      required: true,
      enum: ROLE_LEVELS,
    },
    contributions: { type: [contributionSchema], default: [] },
    behaviors: { type: [behaviorSchema], default: [] },
    decisionRights: {
      type: decisionRightsSchema,
      default: () => ({ canDecide: [], canRecommend: [], mustEscalate: [] }),
    },
  },
  { _id: true },
);

const generatedFromSchema = new Schema(
  {
    foundationId: { type: Schema.Types.ObjectId, ref: "CompanyFoundation" },
    foundationUpdatedAt: { type: Date },
    strategyGoalIds: [{ type: Schema.Types.ObjectId, ref: "StrategyGoal" }],
    generatedAt: { type: Date, required: true },
  },
  { _id: false },
);

// ============================================================================
// MAIN SCHEMA
// ============================================================================

const strategyTranslationSchema = new Schema(
  {
    department: { type: String, required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      required: true,
      enum: TRANSLATION_STATUSES,
      default: "generating",
      index: true,
    },
    generatedFrom: { type: generatedFromSchema, required: true },
    roles: { type: [roleSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

// Compound indexes
strategyTranslationSchema.index({ department: 1, status: 1 });
strategyTranslationSchema.index({ department: 1, version: -1 });

export const StrategyTranslation =
  mongoose.models.StrategyTranslation ||
  mongoose.model("StrategyTranslation", strategyTranslationSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type AlignmentDescriptors = {
  strong: string;
  acceptable: string;
  poor: string;
};

export type Contribution = {
  strategyGoalId: string | Types.ObjectId;
  strategyGoalTitle: string;
  roleContribution: string;
  outcomes: string[];
  alignmentDescriptors: AlignmentDescriptors;
};

export type Behavior = {
  valueName: string;
  expectation: string;
};

export type DecisionRights = {
  canDecide: string[];
  canRecommend: string[];
  mustEscalate: string[];
};

export type TranslationRole = {
  id: string;
  jobTitle: string;
  level: (typeof ROLE_LEVELS)[number];
  contributions: Contribution[];
  behaviors: Behavior[];
  decisionRights: DecisionRights;
};

export type StrategyTranslation_Type = {
  id: string;
  department: string;
  version: number;
  status: (typeof TRANSLATION_STATUSES)[number];
  generatedFrom: {
    foundationId: string | Types.ObjectId;
    foundationUpdatedAt: Date;
    strategyGoalIds: (string | Types.ObjectId)[];
    generatedAt: Date;
  };
  roles: TranslationRole[];
  createdAt: Date;
  updatedAt: Date;
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/db/src/strategy-translation-schema.ts
git commit -m "feat(db): add StrategyTranslation schema with role sub-documents"
```

---

### Task 3: Package Exports

**Files:**
- Modify: `packages/db/package.json`

- [ ] **Step 1: Add sub-path exports**

In the `"exports"` object in `packages/db/package.json`, add:

```json
    "./strategy-translation-constants": "./src/strategy-translation-constants.ts",
    "./strategy-translation-schema": "./src/strategy-translation-schema.ts"
```

Add these after the existing `"./strategy-goal-schema"` entry.

- [ ] **Step 2: Commit**

```bash
git add packages/db/package.json
git commit -m "feat(db): add strategy-translation sub-path exports"
```

---

### Task 4: Zod Schema for AI Output

**Files:**
- Create: `apps/platform/src/lib/validations/strategy-translation.ts`

- [ ] **Step 1: Create Zod schema**

```ts
import { z } from "zod";

/**
 * Zod schema for a single role's AI-generated translation.
 * Used with Vercel AI SDK's generateObject to validate structured output.
 */

export const alignmentDescriptorsSchema = z.object({
  strong: z.string().describe("What strong alignment looks like for this role relative to this priority"),
  acceptable: z.string().describe("What acceptable alignment looks like"),
  poor: z.string().describe("What poor alignment looks like — anchored to non-negotiable behaviors"),
});

export const contributionOutputSchema = z.object({
  strategyGoalId: z.string().describe("The ObjectId of the strategy goal this contribution maps to"),
  strategyGoalTitle: z.string().describe("The title of the strategy goal"),
  roleContribution: z.string().describe("What this role is expected to contribute toward this priority — anchored to the organization's mission"),
  outcomes: z.array(z.string()).min(1).max(4).describe("1-4 measurable results that demonstrate alignment between the role and this priority — shaped by the organization's vision"),
  alignmentDescriptors: alignmentDescriptorsSchema,
});

export const behaviorOutputSchema = z.object({
  valueName: z.string().describe("The core value this behavior derives from"),
  expectation: z.string().describe("The observable behavioral expectation for this role, contextualized to their function and level"),
});

export const decisionRightsOutputSchema = z.object({
  canDecide: z.array(z.string()).describe("Decisions this role can make autonomously"),
  canRecommend: z.array(z.string()).describe("Decisions this role can recommend but not finalize"),
  mustEscalate: z.array(z.string()).describe("Decisions this role must escalate to leadership"),
});

export const roleTranslationOutputSchema = z.object({
  contributions: z.array(contributionOutputSchema).describe("Role contribution per strategic priority"),
  behaviors: z.array(behaviorOutputSchema).describe("Values-derived behavioral expectations"),
  decisionRights: decisionRightsOutputSchema.describe("Decision authority calibrated to role level"),
});

export type RoleTranslationOutput = z.infer<typeof roleTranslationOutputSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/validations/strategy-translation.ts
git commit -m "feat(validation): add Zod schema for AI translation output"
```

---

### Task 5: Translation Generation Engine

**Files:**
- Create: `apps/platform/src/lib/ai/translation-engine.ts`

- [ ] **Step 1: Create the engine file**

```ts
/**
 * Strategy Translation Engine
 * Generates role-based language from Foundation + Strategic Priorities using AI.
 */

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { connectDB } from "@ascenta/db";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";
import { roleTranslationOutputSchema } from "@/lib/validations/strategy-translation";

// ---------------------------------------------------------------------------
// Role level inference from job title
// ---------------------------------------------------------------------------

const EXECUTIVE_KEYWORDS = ["director", "vp", "vice president", "chief", "head of", "cto", "ceo", "cfo", "coo", "cmo", "svp", "evp"];
const MANAGER_KEYWORDS = ["manager", "lead", "supervisor", "team lead", "principal"];

export function inferRoleLevel(
  jobTitle: string,
): "executive" | "manager" | "individual_contributor" {
  const lower = jobTitle.toLowerCase();
  if (EXECUTIVE_KEYWORDS.some((kw) => lower.includes(kw))) return "executive";
  if (MANAGER_KEYWORDS.some((kw) => lower.includes(kw))) return "manager";
  return "individual_contributor";
}

// ---------------------------------------------------------------------------
// Staleness detection
// ---------------------------------------------------------------------------

export async function checkTranslationStaleness(
  translation: Record<string, unknown>,
): Promise<{ isStale: boolean; reasons: string[] }> {
  const reasons: string[] = [];
  const generatedFrom = translation.generatedFrom as {
    foundationUpdatedAt?: Date;
    strategyGoalIds?: string[];
    generatedAt?: Date;
  };

  if (!generatedFrom?.generatedAt) {
    return { isStale: true, reasons: ["No generation timestamp found"] };
  }

  const genDate = new Date(generatedFrom.generatedAt);

  // Check foundation freshness
  const foundation = await CompanyFoundation.findOne().lean();
  if (foundation) {
    const foundationUpdated = new Date(
      (foundation as Record<string, unknown>).updatedAt as string,
    );
    if (foundationUpdated > genDate) {
      reasons.push("Foundation has been updated since this translation was generated");
    }
  }

  // Check strategy goals freshness
  const department = translation.department as string;
  const currentGoals = await StrategyGoal.find({
    $or: [
      { scope: "company", status: { $ne: "archived" } },
      { scope: "department", department, status: { $ne: "archived" } },
    ],
  }).lean();

  const currentIds = new Set(currentGoals.map((g) => String(g._id)));
  const storedIds = new Set(
    (generatedFrom.strategyGoalIds ?? []).map(String),
  );

  const addedGoals = [...currentIds].filter((id) => !storedIds.has(id));
  const removedGoals = [...storedIds].filter((id) => !currentIds.has(id));

  if (addedGoals.length > 0) {
    reasons.push(`${addedGoals.length} new strategy goal(s) added since generation`);
  }
  if (removedGoals.length > 0) {
    reasons.push(`${removedGoals.length} strategy goal(s) removed or archived since generation`);
  }

  return { isStale: reasons.length > 0, reasons };
}

// ---------------------------------------------------------------------------
// Core generation
// ---------------------------------------------------------------------------

export async function generateTranslationForDepartment(
  department: string,
): Promise<string> {
  await connectDB();

  // 1. Load published Foundation
  const foundationDoc = await CompanyFoundation.findOne({ status: "published" }).lean();
  if (!foundationDoc) {
    throw new Error("No published foundation found. Publish your Mission, Vision & Values first.");
  }
  const foundation = foundationDoc as Record<string, unknown>;

  // 2. Load active strategy goals (company + department)
  const strategyGoals = await StrategyGoal.find({
    $or: [
      { scope: "company", status: { $ne: "archived" } },
      { scope: "department", department, status: { $ne: "archived" } },
    ],
  }).lean();

  if (strategyGoals.length === 0) {
    throw new Error(`No active strategy goals found for department "${department}".`);
  }

  // 3. Load distinct job titles for department
  const employees = await Employee.find({
    department,
    status: "active",
  })
    .select("jobTitle")
    .lean();

  const jobTitles = [
    ...new Set(
      employees
        .map((e) => (e as Record<string, unknown>).jobTitle as string)
        .filter(Boolean),
    ),
  ];

  if (jobTitles.length === 0) {
    throw new Error(`No active employees found in department "${department}".`);
  }

  // 4. Determine next version number
  const lastTranslation = await StrategyTranslation.findOne({ department })
    .sort({ version: -1 })
    .lean();
  const nextVersion = lastTranslation
    ? ((lastTranslation as Record<string, unknown>).version as number) + 1
    : 1;

  // 5. Create translation document in "generating" status
  const goalIds = strategyGoals.map((g) => g._id);
  const translationDoc = await StrategyTranslation.create({
    department,
    version: nextVersion,
    status: "generating",
    generatedFrom: {
      foundationId: foundation._id,
      foundationUpdatedAt: foundation.updatedAt,
      strategyGoalIds: goalIds,
      generatedAt: new Date(),
    },
    roles: [],
  });

  const translationId = String(translationDoc._id);

  // 6. Build context for AI
  const mission = (foundation.mission as string) || "";
  const vision = (foundation.vision as string) || "";
  const values = (foundation.values as string) || "";
  const nonNegotiableBehaviors = (
    foundation.nonNegotiableBehaviors as { name: string; description: string }[] ?? []
  );
  const livedPrinciples = (
    foundation.livedPrinciples as { name: string; description: string }[] ?? []
  );

  const goalsContext = strategyGoals.map((g) => {
    const goal = g as Record<string, unknown>;
    return {
      id: String(goal._id),
      title: goal.title as string,
      description: goal.description as string,
      horizon: goal.horizon as string,
      scope: goal.scope as string,
      rationale: (goal.rationale as string) || "",
      successMetrics: (goal.successMetrics as string) || "",
    };
  });

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 7. Generate translation for each role
  const roles = [];

  for (const jobTitle of jobTitles) {
    const level = inferRoleLevel(jobTitle);

    const systemPrompt = `You are a strategic translation engine for Ascenta, an AI-powered HR platform. Your job is to convert organizational strategy into specific, actionable, role-based language.

You are generating translation output for a specific role. Every output you produce must be governed by the organization's foundation and strategic priorities as follows:

MISSION (anchors every role contribution statement — describe contributions in service of this mission):
${mission}

VISION (shapes forward-looking outcomes — outcomes should move toward this vision):
${vision}

CORE VALUES (each value must produce a behavioral expectation for this role):
${values}

NON-NEGOTIABLE BEHAVIORS (these set the floor for "poor" alignment descriptors — failure to demonstrate these defines poor alignment regardless of other performance):
${nonNegotiableBehaviors.map((b) => `- ${b.name}: ${b.description}`).join("\n") || "None defined"}

LIVED PRINCIPLES (woven into how contribution and decision rights are described):
${livedPrinciples.map((p) => `- ${p.name}: ${p.description}`).join("\n") || "None defined"}

STRATEGIC PRIORITIES:
${goalsContext.map((g) => `- [${g.horizon}] [${g.scope}] "${g.title}": ${g.description}${g.rationale ? ` (Rationale: ${g.rationale})` : ""}`).join("\n")}

RULES FOR GENERATION:
1. Role contributions must be specific to the job title and function, not generic.
2. Outcomes must be measurable — include numbers, percentages, or observable indicators where possible.
3. Behaviors must be observable actions, not attitudes or feelings.
4. Decision rights must be calibrated to the role level: executives decide broadly, managers decide within their teams, ICs decide within their scope.
5. Alignment descriptors must be concrete:
   - "Strong" describes what excellent looks like with specific behaviors
   - "Acceptable" describes meeting expectations adequately
   - "Poor" MUST reference non-negotiable behavior failures when relevant
6. For short-term priorities, produce more tactical, immediate language.
7. For long-term priorities, produce more developmental and capability-building language.
8. Every piece of language should feel like it was written for THIS specific role, not copy-pasted across roles.`;

    const userPrompt = `Generate the strategic translation for this role:

Department: ${department}
Job Title: ${jobTitle}
Role Level: ${level}

Generate contribution statements, outcomes, and alignment descriptors for EACH of the following strategy goals:
${goalsContext.map((g) => `- ID: ${g.id}, Title: "${g.title}" (${g.horizon}, ${g.scope})`).join("\n")}

Also generate behavioral expectations derived from the core values, and decision rights calibrated to the ${level} level.`;

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: roleTranslationOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    roles.push({
      jobTitle,
      level,
      contributions: object.contributions.map((c) => ({
        strategyGoalId: c.strategyGoalId,
        strategyGoalTitle: c.strategyGoalTitle,
        roleContribution: c.roleContribution,
        outcomes: c.outcomes,
        alignmentDescriptors: c.alignmentDescriptors,
      })),
      behaviors: object.behaviors,
      decisionRights: object.decisionRights,
    });
  }

  // 8. Update document with generated roles and set status to draft
  await StrategyTranslation.findByIdAndUpdate(translationId, {
    $set: { roles, status: "draft" },
  });

  return translationId;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/ai/translation-engine.ts
git commit -m "feat(ai): add strategy translation generation engine"
```

---

### Task 6: API Routes — POST (Generate) + GET (List)

**Files:**
- Create: `apps/platform/src/app/api/plan/strategy-translations/route.ts`

- [ ] **Step 1: Create route file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { generateTranslationForDepartment, checkTranslationStaleness } from "@/lib/ai/translation-engine";

// ============================================================================
// GET — List translations
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (department) filter.department = department;
    if (status) {
      filter.status = status;
    } else if (!searchParams.has("includeArchived")) {
      filter.status = { $ne: "archived" };
    }

    const translations = await StrategyTranslation.find(filter)
      .sort({ department: 1, version: -1 })
      .lean();

    // Check staleness for each non-archived translation
    const results = [];
    for (const t of translations) {
      const doc = t as Record<string, unknown>;
      let staleness = { isStale: false, reasons: [] as string[] };
      if (doc.status === "published" || doc.status === "draft") {
        staleness = await checkTranslationStaleness(doc);
      }
      results.push({
        ...doc,
        id: String(doc._id),
        _id: undefined,
        __v: undefined,
        isStale: staleness.isStale,
        stalenessReasons: staleness.reasons,
      });
    }

    return NextResponse.json({ success: true, translations: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translations GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch translations" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST — Trigger generation for a department (or all)
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { department } = body as { department: string };

    if (!department) {
      return NextResponse.json(
        { success: false, error: "department is required" },
        { status: 400 },
      );
    }

    if (department === "all") {
      // Generate for all departments that have active employees
      const departments = await Employee.distinct("department", {
        status: "active",
      });

      const results = [];
      for (const dept of departments) {
        if (!dept) continue;
        try {
          const id = await generateTranslationForDepartment(dept as string);
          results.push({ department: dept, translationId: id, success: true });
        } catch (err) {
          results.push({
            department: dept,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      return NextResponse.json({ success: true, results });
    }

    // Single department
    const translationId = await generateTranslationForDepartment(department);
    return NextResponse.json({
      success: true,
      translationId,
      message: `Translation generated for ${department}. Review and publish when ready.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translations POST error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/app/api/plan/strategy-translations/route.ts
git commit -m "feat(api): add strategy translation list and generate endpoints"
```

---

### Task 7: API Routes — Single Translation (GET + PATCH)

**Files:**
- Create: `apps/platform/src/app/api/plan/strategy-translations/[id]/route.ts`

- [ ] **Step 1: Create route file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await StrategyTranslation.findById(id).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Translation not found" },
        { status: 404 },
      );
    }

    const translation = doc as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      translation: {
        ...translation,
        id: String(translation._id),
        _id: undefined,
        __v: undefined,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translation GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch translation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { action } = body as { action: string };

    const doc = await StrategyTranslation.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Translation not found" },
        { status: 404 },
      );
    }

    if (action === "publish") {
      // Archive any existing published translation for this department
      await StrategyTranslation.updateMany(
        { department: doc.department, status: "published" },
        { $set: { status: "archived" } },
      );

      doc.status = "published";
      await doc.save();

      return NextResponse.json({
        success: true,
        message: `Translation for ${doc.department} published (v${doc.version}).`,
      });
    }

    if (action === "archive") {
      doc.status = "archived";
      await doc.save();

      return NextResponse.json({
        success: true,
        message: "Translation archived.",
      });
    }

    // Field edits — update role entries
    if (body.roles) {
      doc.roles = body.roles;
      await doc.save();

      return NextResponse.json({
        success: true,
        message: "Translation roles updated.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'publish', 'archive', or provide 'roles'." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translation PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update translation" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/app/api/plan/strategy-translations/\[id\]/route.ts
git commit -m "feat(api): add single translation get/patch endpoints"
```

---

### Task 8: Translation Role Preview Component

**Files:**
- Create: `apps/platform/src/components/plan/translation-role-preview.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { cn } from "@ascenta/ui";
import { ROLE_LEVEL_LABELS } from "@ascenta/db/strategy-translation-constants";

interface Contribution {
  strategyGoalTitle: string;
  roleContribution: string;
  outcomes: string[];
  alignmentDescriptors: { strong: string; acceptable: string; poor: string };
}

interface Behavior {
  valueName: string;
  expectation: string;
}

interface DecisionRights {
  canDecide: string[];
  canRecommend: string[];
  mustEscalate: string[];
}

interface TranslationRolePreviewProps {
  jobTitle: string;
  level: string;
  contributions: Contribution[];
  behaviors: Behavior[];
  decisionRights: DecisionRights;
  accentColor: string;
}

export function TranslationRolePreview({
  jobTitle,
  level,
  contributions,
  behaviors,
  decisionRights,
  accentColor,
}: TranslationRolePreviewProps) {
  const levelLabel = ROLE_LEVEL_LABELS[level as keyof typeof ROLE_LEVEL_LABELS] ?? level;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-bold text-deep-blue">
          {jobTitle}
        </h4>
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 10%, white)`,
            color: accentColor,
          }}
        >
          {levelLabel}
        </span>
      </div>

      {/* Contributions per priority */}
      {contributions.map((c, i) => (
        <div key={i} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {c.strategyGoalTitle}
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {c.roleContribution}
          </p>
          {c.outcomes.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                Success Outcomes
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {c.outcomes.map((o, j) => (
                  <li key={j} className="text-sm text-muted-foreground">{o}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["strong", "acceptable", "poor"] as const).map((level) => (
              <div
                key={level}
                className={cn(
                  "rounded-lg p-2.5 text-xs",
                  level === "strong" && "bg-emerald-50 text-emerald-800",
                  level === "acceptable" && "bg-amber-50 text-amber-800",
                  level === "poor" && "bg-rose-50 text-rose-800",
                )}
              >
                <p className="font-semibold capitalize mb-0.5">{level}</p>
                <p className="leading-relaxed">{c.alignmentDescriptors[level]}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Behaviors */}
      {behaviors.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Behavioral Expectations
          </p>
          <div className="space-y-2">
            {behaviors.map((b, i) => (
              <div key={i}>
                <span className="text-sm font-medium text-foreground">{b.valueName}:</span>{" "}
                <span className="text-sm text-muted-foreground">{b.expectation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Rights */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Decision Rights
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-700 mb-1">Can Decide</p>
            <ul className="space-y-0.5">
              {decisionRights.canDecide.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-1">Can Recommend</p>
            <ul className="space-y-0.5">
              {decisionRights.canRecommend.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700 mb-1">Must Escalate</p>
            <ul className="space-y-0.5">
              {decisionRights.mustEscalate.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/translation-role-preview.tsx
git commit -m "feat(ui): add translation role preview component"
```

---

### Task 9: Translations Panel

**Files:**
- Create: `apps/platform/src/components/plan/translations-panel.tsx`

- [ ] **Step 1: Create panel component**

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Languages, RefreshCw, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@ascenta/ui";
import { TRANSLATION_STATUS_LABELS } from "@ascenta/db/strategy-translation-constants";
import { TranslationRolePreview } from "./translation-role-preview";

interface Role {
  jobTitle: string;
  level: string;
  contributions: {
    strategyGoalTitle: string;
    roleContribution: string;
    outcomes: string[];
    alignmentDescriptors: { strong: string; acceptable: string; poor: string };
  }[];
  behaviors: { valueName: string; expectation: string }[];
  decisionRights: { canDecide: string[]; canRecommend: string[]; mustEscalate: string[] };
}

interface TranslationData {
  id: string;
  department: string;
  version: number;
  status: string;
  generatedFrom: { generatedAt: string };
  roles: Role[];
  isStale: boolean;
  stalenessReasons: string[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  generating: "#8b5cf6",
  draft: "#f59e0b",
  published: "#22c55e",
  archived: "#6b7280",
};

interface TranslationsPanelProps {
  accentColor: string;
}

export function TranslationsPanel({ accentColor }: TranslationsPanelProps) {
  const [translations, setTranslations] = useState<TranslationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/plan/strategy-translations");
      const data = await res.json();
      if (data.success) {
        setTranslations(data.translations ?? []);
      } else {
        setError(data.error ?? "Failed to fetch");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  async function handleGenerate(department: string) {
    setGenerating(department);
    try {
      const res = await fetch("/api/plan/strategy-translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Generation failed");
      }
      await fetchTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  async function handleGenerateAll() {
    setGenerating("all");
    try {
      const res = await fetch("/api/plan/strategy-translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: "all" }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Generation failed");
      }
      await fetchTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  async function handlePublish(id: string) {
    await fetch(`/api/plan/strategy-translations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    fetchTranslations();
  }

  async function handleArchive(id: string) {
    await fetch(`/api/plan/strategy-translations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    fetchTranslations();
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group by department — show latest version per department
  const byDept = new Map<string, TranslationData>();
  for (const t of translations) {
    const existing = byDept.get(t.department);
    if (!existing || t.version > existing.version) {
      byDept.set(t.department, t);
    }
  }
  const departments = [...byDept.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-bold text-deep-blue">
              Strategic Translations
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-generated role-based language derived from your Foundation and Strategic Priorities.
            </p>
          </div>
          <button
            onClick={handleGenerateAll}
            disabled={generating !== null}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: accentColor }}
          >
            {generating === "all" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Generate All
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 mb-4">
            {error}
          </div>
        )}

        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Languages className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Translations Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Generate strategic translations to convert your strategy into role-based language.
            </p>
            <button
              onClick={handleGenerateAll}
              disabled={generating !== null}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              Generate All Departments
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map(([dept, translation]) => {
              const isExpanded = expandedDept === dept;
              const statusColor = STATUS_COLORS[translation.status] ?? "#6b7280";
              const statusLabel =
                TRANSLATION_STATUS_LABELS[
                  translation.status as keyof typeof TRANSLATION_STATUS_LABELS
                ] ?? translation.status;

              return (
                <div key={dept} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedDept(isExpanded ? null : dept)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className="flex-1 font-display text-sm font-semibold text-deep-blue">
                      {dept}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {translation.roles.length} role{translation.roles.length !== 1 ? "s" : ""}
                    </span>
                    {translation.isStale && (
                      <span title={translation.stalenessReasons.join(", ")}>
                        <AlertTriangle className="size-4 text-amber-500" />
                      </span>
                    )}
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${statusColor} 12%, white)`,
                        color: statusColor,
                      }}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      v{translation.version}
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-90",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200",
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t px-5 py-4 space-y-4">
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleGenerate(dept)}
                            disabled={generating !== null}
                            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                          >
                            {generating === dept ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <RefreshCw className="size-3" />
                            )}
                            Regenerate
                          </button>
                          {translation.status === "draft" && (
                            <button
                              onClick={() => handlePublish(translation.id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                              style={{ backgroundColor: "#22c55e" }}
                            >
                              Publish
                            </button>
                          )}
                          {translation.status !== "archived" && (
                            <button
                              onClick={() => handleArchive(translation.id)}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Archive
                            </button>
                          )}
                        </div>

                        {/* Role previews */}
                        {translation.roles.map((role, i) => (
                          <TranslationRolePreview
                            key={i}
                            jobTitle={role.jobTitle}
                            level={role.level}
                            contributions={role.contributions}
                            behaviors={role.behaviors}
                            decisionRights={role.decisionRights}
                            accentColor={accentColor}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/translations-panel.tsx
git commit -m "feat(ui): add translations management panel"
```

---

### Task 10: Strategy Studio Page — Add Translations Tab

**Files:**
- Modify: `apps/platform/src/app/strategy-studio/page.tsx`
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`

- [ ] **Step 1: Add translations tab to nav config**

In `apps/platform/src/lib/constants/dashboard-nav.ts`, find the `PAGE_CONFIG` object and locate the `"strategy-studio"` entry. Add `{ key: "translations", label: "Translations" }` to its `tabs` array:

```ts
tabs: [
  { key: "foundation", label: "Foundation" },
  { key: "strategy", label: "Strategy" },
  { key: "translations", label: "Translations" },
],
```

- [ ] **Step 2: Update Strategy Studio page**

In `apps/platform/src/app/strategy-studio/page.tsx`, add the import:

```ts
import { TranslationsPanel } from "@/components/plan/translations-panel";
```

Add the translations tab rendering after the strategy tab check:

```tsx
      ) : activeTab === "translations" ? (
        <TranslationsPanel accentColor={ACCENT_COLOR} />
```

The full conditional becomes:

```tsx
      {activeTab === "foundation" ? (
        <FoundationPanel accentColor={ACCENT_COLOR} />
      ) : activeTab === "strategy" ? (
        <StrategyPanel accentColor={ACCENT_COLOR} />
      ) : activeTab === "translations" ? (
        <TranslationsPanel accentColor={ACCENT_COLOR} />
      ) : (
        <DoTabChat
          pageKey="strategy-studio"
          pageConfig={pageConfig}
          accentColor={ACCENT_COLOR}
        />
      )}
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/strategy-studio/page.tsx apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "feat(ui): add Translations tab to Strategy Studio"
```

---

### Task 11: Seed Data

**Files:**
- Create: `scripts/seed-strategy-translations.ts`

- [ ] **Step 1: Create seed script**

```ts
/**
 * Seed script: Populates sample Strategy Translations
 * Run: npx tsx scripts/seed-strategy-translations.ts
 *
 * Prerequisites: Run `pnpm db:seed` and seed-strategy.ts first.
 */

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { CompanyFoundation } from "../packages/db/src/foundation-schema";
import { StrategyGoal } from "../packages/db/src/strategy-goal-schema";
import { StrategyTranslation } from "../packages/db/src/strategy-translation-schema";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected. Seeding Strategy Translations...\n");

  // Clear existing translations
  const deleted = await StrategyTranslation.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} existing translations\n`);

  // Load foundation and goals
  const foundation = await CompanyFoundation.findOne().lean();
  if (!foundation) {
    console.error("No foundation found. Run seed-strategy.ts first.");
    process.exit(1);
  }

  const goals = await StrategyGoal.find({ status: { $ne: "archived" } }).lean();
  const companyGoals = goals.filter((g) => g.scope === "company");

  const goalIds = goals.map((g) => g._id);

  // Helper to build a translation for a department
  function buildTranslation(
    department: string,
    roles: {
      jobTitle: string;
      level: "executive" | "manager" | "individual_contributor";
    }[],
  ) {
    return {
      department,
      version: 1,
      status: "published" as const,
      generatedFrom: {
        foundationId: foundation!._id,
        foundationUpdatedAt: (foundation as Record<string, unknown>).updatedAt,
        strategyGoalIds: goalIds,
        generatedAt: new Date(),
      },
      roles: roles.map((r) => ({
        jobTitle: r.jobTitle,
        level: r.level,
        contributions: companyGoals.map((g) => ({
          strategyGoalId: g._id,
          strategyGoalTitle: (g as Record<string, unknown>).title as string,
          roleContribution: `As a ${r.jobTitle}, contribute to "${(g as Record<string, unknown>).title}" by delivering ${r.level === "executive" ? "strategic direction and resource allocation" : r.level === "manager" ? "team coordination and execution oversight" : "hands-on technical execution and quality delivery"}.`,
          outcomes: [
            `Deliver measurable progress on ${((g as Record<string, unknown>).title as string).toLowerCase()} within the current planning horizon`,
            `Maintain alignment with the organization's mission in all related work`,
          ],
          alignmentDescriptors: {
            strong: `Consistently drives progress on ${((g as Record<string, unknown>).title as string).toLowerCase()} with measurable impact. Proactively identifies opportunities and removes blockers.`,
            acceptable: `Meets expectations for contribution. Completes assigned work on time with acceptable quality.`,
            poor: `Fails to demonstrate commitment to this priority. Does not follow through on commitments or meet basic expectations for transparency and accountability.`,
          },
        })),
        behaviors: [
          {
            valueName: "People First",
            expectation: `As a ${r.jobTitle}, prioritize team well-being and development in all decisions. Advocate for resources and support needed by colleagues.`,
          },
          {
            valueName: "Transparency by Default",
            expectation: `Communicate decisions, progress, and blockers openly. Share context proactively rather than waiting to be asked.`,
          },
        ],
        decisionRights: {
          canDecide:
            r.level === "executive"
              ? ["Strategic direction for department", "Resource allocation above $50K", "Hiring and team structure"]
              : r.level === "manager"
                ? ["Sprint priorities and task assignment", "Team process and tooling", "Hiring recommendations"]
                : ["Technical implementation approach", "Code review standards", "Tool selection for individual tasks"],
          canRecommend:
            r.level === "executive"
              ? ["Company-wide policy changes", "Cross-department initiatives"]
              : r.level === "manager"
                ? ["Budget allocation", "Cross-team dependencies"]
                : ["Process improvements", "Architecture decisions"],
          mustEscalate:
            r.level === "executive"
              ? ["Board-level commitments", "Legal and compliance matters"]
              : r.level === "manager"
                ? ["Organizational restructuring", "Budget overruns", "Policy exceptions"]
                : ["Security incidents", "Data breaches", "Customer-facing outages"],
        },
      })),
    };
  }

  const translationDefs = [
    buildTranslation("Engineering", [
      { jobTitle: "Software Engineer", level: "individual_contributor" },
      { jobTitle: "Engineering Manager", level: "manager" },
    ]),
    buildTranslation("HR", [
      { jobTitle: "HR Specialist", level: "individual_contributor" },
      { jobTitle: "HR Director", level: "executive" },
    ]),
    buildTranslation("Product", [
      { jobTitle: "Product Manager", level: "manager" },
      { jobTitle: "Product Designer", level: "individual_contributor" },
    ]),
  ];

  const created = await StrategyTranslation.insertMany(translationDefs);
  console.log(`Created ${created.length} translations:`);
  created.forEach((t) => {
    console.log(
      `  - ${t.department}: ${t.roles.length} roles (v${t.version}, ${t.status})`,
    );
  });

  console.log("\nStrategy Translation seed complete!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add script to package.json**

In the root `package.json`, add to `"scripts"`:

```json
"db:seed-translations": "npx tsx scripts/seed-strategy-translations.ts"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-strategy-translations.ts package.json
git commit -m "feat(seed): add strategy translation sample data"
```
