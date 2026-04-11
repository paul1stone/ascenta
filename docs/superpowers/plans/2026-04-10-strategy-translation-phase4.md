# Strategy Translation Phase 4: Downstream Integrations

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire published strategy translations into Goals, Performance Reviews, Check-ins, Coaching, and the Strategy Breakdown ATC so translated language drives downstream workflows.

**Architecture:** Each integration follows the same pattern: load the published translation for the employee's department + job title via a shared lookup helper, inject relevant data into the AI tool's context, and gracefully fall back when no translation exists. Changes are additive — existing behavior is preserved.

**Tech Stack:** Mongoose (schema additions), Vercel AI SDK (tool updates), Next.js API routes, React components

**Depends on:** Phase 2 (StrategyTranslation schema and published data)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `apps/platform/src/lib/ai/translation-lookup.ts` | Create | Shared helper to load translation for an employee |
| `packages/db/src/goal-schema.ts` | Modify | Add contributionRef field |
| `apps/platform/src/lib/validations/goal.ts` | Modify | Add contributionRef to Zod schema |
| `apps/platform/src/app/api/grow/goals/route.ts` | Modify | Persist contributionRef |
| `apps/platform/src/lib/ai/grow-tools.ts` | Modify | Load translations in goal + check-in tools |
| `packages/db/src/performance-review-schema.ts` | Modify | Add alignmentLevel field |
| `apps/platform/src/lib/ai/strategy-tools.ts` | Modify | Enhance breakdown tools with translation data |
| `apps/platform/src/lib/ai/prompts.ts` | Modify | Update system prompt for translation-aware behavior |

---

### Task 1: Translation Lookup Helper

**Files:**
- Create: `apps/platform/src/lib/ai/translation-lookup.ts`

- [ ] **Step 1: Create the helper**

```ts
/**
 * Translation Lookup Helper
 * Shared function to find a published translation role entry for an employee.
 * Used by all downstream integrations.
 */

import { connectDB } from "@ascenta/db";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";

const EXECUTIVE_KEYWORDS = ["director", "vp", "vice president", "chief", "head of", "cto", "ceo", "cfo", "coo", "svp", "evp"];
const MANAGER_KEYWORDS = ["manager", "lead", "supervisor", "team lead", "principal"];

function inferRoleLevel(
  jobTitle: string,
): "executive" | "manager" | "individual_contributor" {
  const lower = jobTitle.toLowerCase();
  if (EXECUTIVE_KEYWORDS.some((kw) => lower.includes(kw))) return "executive";
  if (MANAGER_KEYWORDS.some((kw) => lower.includes(kw))) return "manager";
  return "individual_contributor";
}

export interface TranslationContribution {
  strategyGoalId: string;
  strategyGoalTitle: string;
  roleContribution: string;
  outcomes: string[];
  alignmentDescriptors: { strong: string; acceptable: string; poor: string };
}

export interface TranslationBehavior {
  valueName: string;
  expectation: string;
}

export interface TranslationDecisionRights {
  canDecide: string[];
  canRecommend: string[];
  mustEscalate: string[];
}

export interface TranslationRoleData {
  jobTitle: string;
  level: string;
  contributions: TranslationContribution[];
  behaviors: TranslationBehavior[];
  decisionRights: TranslationDecisionRights;
}

/**
 * Look up the published translation for an employee's department + job title.
 * Returns the matching role entry, or null if no translation exists.
 */
export async function getTranslationForEmployee(
  department: string,
  jobTitle: string,
): Promise<TranslationRoleData | null> {
  await connectDB();

  const translation = await StrategyTranslation.findOne({
    department,
    status: "published",
  })
    .sort({ version: -1 })
    .lean();

  if (!translation) return null;

  const t = translation as Record<string, unknown>;
  const roles = t.roles as TranslationRoleData[];

  // Exact title match first
  const exactMatch = roles.find(
    (r) => r.jobTitle.toLowerCase() === jobTitle.toLowerCase(),
  );
  if (exactMatch) return exactMatch;

  // Fallback: match by inferred level
  const level = inferRoleLevel(jobTitle);
  const levelMatch = roles.find((r) => r.level === level);
  return levelMatch ?? null;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/ai/translation-lookup.ts
git commit -m "feat(ai): add shared translation lookup helper"
```

---

### Task 2: Goal Schema — Add contributionRef

**Files:**
- Modify: `packages/db/src/goal-schema.ts`
- Modify: `apps/platform/src/lib/validations/goal.ts`
- Modify: `apps/platform/src/app/api/grow/goals/route.ts`

- [ ] **Step 1: Add field to Mongoose schema**

In `packages/db/src/goal-schema.ts`, add after the `workflowRunId` field in the goalSchema:

```ts
    contributionRef: { type: String, default: null },
```

Add to the `Goal_Type` type alias:

```ts
  contributionRef: string | null;
```

- [ ] **Step 2: Add to Zod validation**

In `apps/platform/src/lib/validations/goal.ts`, add to the `goalFormSchema` object, after `notes`:

```ts
    contributionRef: z.string().optional(),
```

- [ ] **Step 3: Persist in API**

In `apps/platform/src/app/api/grow/goals/route.ts`, in the POST handler's `Goal.create({...})` call, add after `workflowRunId: effectiveRunId,`:

```ts
      contributionRef: data.contributionRef || null,
```

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/goal-schema.ts apps/platform/src/lib/validations/goal.ts apps/platform/src/app/api/grow/goals/route.ts
git commit -m "feat(db): add contributionRef to Goal schema for strategy traceability"
```

---

### Task 3: Goal Workflow — Load Translations

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`

- [ ] **Step 1: Add import**

At the top of `grow-tools.ts`, add:

```ts
import { getTranslationForEmployee } from "./translation-lookup";
```

- [ ] **Step 2: Update startGoalWorkflowTool execute**

In the `startGoalWorkflowTool` execute function, after the `departmentGoals` section (around line 228), add:

```ts
    // Load translation for role-based goal recommendations
    let roleContributions: { strategyGoalTitle: string; roleContribution: string; outcomes: string[] }[] | null = null;
    try {
      const translation = await getTranslationForEmployee(
        params.department ?? "",
        params.jobTitle ?? "",
      );
      if (translation) {
        roleContributions = translation.contributions.map((c) => ({
          strategyGoalTitle: c.strategyGoalTitle,
          roleContribution: c.roleContribution,
          outcomes: c.outcomes,
        }));
      }
    } catch {
      // silent — fall back to raw strategy goals
    }
```

Then add `roleContributions` to the return object (alongside `companyGoals`, `departmentGoals`):

```ts
      roleContributions,
```

- [ ] **Step 3: Update tool description Step 3**

In the `startGoalWorkflowTool` description string, update Step 3 to include translation awareness. Find the paragraph that starts with `**Step 3 — Goal recommendation:**` and replace it with:

```
**Step 3 — Goal recommendation:**
If roleContributions are available in the tool response, use them as the PRIMARY source for goal recommendations. Generate 4-6 goal recommendations, each tracing back to a specific role contribution statement. If no roleContributions are available, fall back to generating recommendations from raw strategy goal titles as before. Include a final option: "Or describe your own goal." User picks a number or writes custom. Draft an objective statement (one sentence, outcome-focused, min 15 words).
```

- [ ] **Step 4: Update openGoalDocumentTool schema**

In the `openGoalDocumentTool` inputSchema, add:

```ts
    contributionRef: z.string().optional().describe("The role contribution statement this goal traces back to, for strategy traceability"),
```

Add `"contributionRef"` to the `for...of` array that builds the `prefilled` object.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts
git commit -m "feat(ai): load strategy translations in goal creation workflow"
```

---

### Task 4: Check-In Tool — Load Translations + Support Agreements

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`

- [ ] **Step 1: Update startCheckInTool execute**

In the `startCheckInTool` execute function, after the `availableGoals` section, add:

```ts
    // Load translation for strategy context
    let roleContributions: { strategyGoalTitle: string; roleContribution: string }[] | null = null;
    if (employee) {
      try {
        const translation = await getTranslationForEmployee(
          (employee as Record<string, unknown>).department as string,
          (employee as Record<string, unknown>).jobTitle as string,
        );
        if (translation) {
          roleContributions = translation.contributions.map((c) => ({
            strategyGoalTitle: c.strategyGoalTitle,
            roleContribution: c.roleContribution,
          }));
        }
      } catch {
        // silent
      }
    }

    // Load active goals with support agreements
    let supportAgreements: { goal: string; support: string }[] = [];
    if (employee) {
      const goalsWithSupport = await Goal.find({
        owner: (employee as Record<string, unknown>)._id,
        status: "active",
        supportAgreement: { $ne: "" },
      })
        .select("objectiveStatement supportAgreement")
        .lean();

      supportAgreements = goalsWithSupport.map((g) => ({
        goal: (g as Record<string, unknown>).objectiveStatement as string,
        support: (g as Record<string, unknown>).supportAgreement as string,
      }));
    }
```

Add `roleContributions` and `supportAgreements` to the return object:

```ts
      roleContributions,
      supportAgreements,
```

- [ ] **Step 2: Update tool description**

Add to the end of the `startCheckInTool` description:

```
When roleContributions are available in the response, reference the employee's strategic contribution expectations when drafting manager observations. When supportAgreements are present, remind the manager of their committed support for each active goal.
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts
git commit -m "feat(ai): load translations and support agreements in check-in tool"
```

---

### Task 5: Performance Review Schema — Add alignmentLevel

**Files:**
- Modify: `packages/db/src/performance-review-schema.ts`

- [ ] **Step 1: Read and update the schema**

First read `packages/db/src/performance-review-schema.ts` to find where review sections are defined. Add `alignmentLevel` to each section sub-schema:

```ts
    alignmentLevel: {
      type: String,
      enum: ["strong", "acceptable", "poor", null],
      default: null,
    },
```

This goes in whatever sub-schema holds individual assessment/evaluation sections within a review.

- [ ] **Step 2: Commit**

```bash
git add packages/db/src/performance-review-schema.ts
git commit -m "feat(db): add alignmentLevel to performance review sections"
```

---

### Task 6: Strategy Breakdown ATC — Use Translations

**Files:**
- Modify: `apps/platform/src/lib/ai/strategy-tools.ts`

- [ ] **Step 1: Add import**

At the top of `strategy-tools.ts`, add:

```ts
import { getTranslationForEmployee } from "./translation-lookup";
```

- [ ] **Step 2: Update getStrategyBreakdownTool execute**

After the `personalGoals` section in the execute function, add:

```ts
    // Load translation for role-based language
    let translatedContributions: { strategyGoalTitle: string; roleContribution: string; outcomes: string[] }[] | null = null;
    let translatedBehaviors: { valueName: string; expectation: string }[] | null = null;
    let translatedDecisionRights: { canDecide: string[]; canRecommend: string[]; mustEscalate: string[] } | null = null;

    try {
      const translation = await getTranslationForEmployee(department, jobTitle);
      if (translation) {
        translatedContributions = translation.contributions.map((c) => ({
          strategyGoalTitle: c.strategyGoalTitle,
          roleContribution: c.roleContribution,
          outcomes: c.outcomes,
        }));
        translatedBehaviors = translation.behaviors;
        translatedDecisionRights = translation.decisionRights;
      }
    } catch {
      // silent — fall back to raw data
    }
```

Add these three fields to the return object:

```ts
      translatedContributions,
      translatedBehaviors,
      translatedDecisionRights,
```

- [ ] **Step 3: Update tool description**

Add to the end of the `getStrategyBreakdownTool` description:

```
When translatedContributions, translatedBehaviors, and translatedDecisionRights are available in the response, use them as the authoritative source for role-based language rather than synthesizing from raw strategy goals. Present the translated contribution for each priority, the behavioral expectations, and the decision rights. If no translation exists, fall back to the current behavior of presenting raw strategy data and synthesizing relevance.
```

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/ai/strategy-tools.ts
git commit -m "feat(ai): use published translations in strategy breakdown tool"
```

---

### Task 7: System Prompt Updates

**Files:**
- Modify: `apps/platform/src/lib/ai/prompts.ts`

- [ ] **Step 1: Update goal creation guidance**

In the system prompt, find the section about goal creation (in the "Grow > Performance System Workflows" block). After the existing field inference guidance, add:

```
**Strategy Translation Integration (Goal Creation):**
When startGoalWorkflow returns roleContributions (non-null), these are AI-generated translations of company strategy into specific language for this employee's role. Use them as the PRIMARY source for goal recommendations in Step 3:
- Each recommended goal should trace back to a specific roleContribution statement
- Use the translated outcomes as inspiration for key results
- When the user selects a goal based on a contribution, pass the roleContribution text as contributionRef to openGoalDocument
- If roleContributions is null, fall back to generating recommendations from raw strategy goal titles as before
```

- [ ] **Step 2: Update check-in guidance**

After the existing check-in guidance, add:

```
**Strategy Translation Integration (Check-ins):**
When startCheckIn returns roleContributions (non-null), reference the employee's strategic contribution expectations when drafting manager observations. Frame progress in terms of the translated role language.
When supportAgreements are present, include a reminder: "Support commitments to review:" followed by each goal's support agreement. This ensures managers follow through on commitments made during goal creation.
```

- [ ] **Step 3: Update corrective action guidance**

In the corrective action / coaching section, add:

```
**Strategy Translation Integration (Coaching & Corrective Action):**
When alignment descriptors are available for an employee's role (via getStrategyBreakdown), reference them to ground corrective feedback in strategy:
- "The expected behavior per [priority] is: [strong alignment descriptor]."
- "The observed behavior falls closer to: [poor alignment descriptor]."
This connects corrective feedback to organizational expectations, not just manager opinion.
```

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/ai/prompts.ts
git commit -m "feat(ai): add strategy translation integration to system prompts"
```

---

### Task 8: Strategy Brief Tool — Prefer Translations

**Files:**
- Modify: `apps/platform/src/lib/ai/strategy-tools.ts`

- [ ] **Step 1: Update generateStrategyBriefTool description**

Update the tool description to prefer translated data:

Change the existing description to:

```
Generate a strategy brief document and open it in the working document panel. Call this when the user wants a downloadable summary of the strategy breakdown. When translatedContributions are available from getStrategyBreakdown, use them as the authoritative source for role-specific language rather than synthesizing from raw goal data. You must synthesize the content — do not just repeat raw data.
```

- [ ] **Step 2: Add optional translated fields to input schema**

In the `generateStrategyBriefTool` inputSchema, add:

```ts
    translatedContributions: z
      .array(
        z.object({
          strategyGoalTitle: z.string(),
          roleContribution: z.string(),
          outcomes: z.array(z.string()),
        }),
      )
      .optional()
      .describe("Translated role contributions from published strategy translations — use as authoritative source when available"),
```

- [ ] **Step 3: Include in brief sections**

In the execute function, update the `sections` object to include translated data:

```ts
    const sections = {
      companySummary: params.companySummary,
      companyGoals: params.companyGoals,
      departmentGoals: params.departmentGoals,
      relevance: params.relevance,
      translatedContributions: params.translatedContributions ?? null,
    };
```

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/ai/strategy-tools.ts
git commit -m "feat(ai): prefer translated language in strategy brief generation"
```
