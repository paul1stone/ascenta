# Strategy Translation Phase 1: Foundation & Priority Schema Enhancements

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Foundation schema with non-negotiable behaviors and lived principles, add rationale to strategy goals, and update all UI/API/AI tools to support the new fields.

**Architecture:** Additive schema changes to existing CompanyFoundation and StrategyGoal models. New embedded arrays for structured behaviors/principles. All existing functionality preserved — new fields are optional with defaults.

**Tech Stack:** Mongoose (schemas), Zod (validation), Next.js App Router (API routes), React (UI components), Vercel AI SDK (tools)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `packages/db/src/foundation-schema.ts` | Modify | Add nonNegotiableBehaviors and livedPrinciples arrays |
| `packages/db/src/strategy-goal-schema.ts` | Modify | Add rationale field |
| `apps/platform/src/components/plan/strategy-goal-card.tsx` | Modify | Add rationale to StrategyGoalData interface |
| `apps/platform/src/lib/validations/foundation.ts` | Modify | Add Zod validation for new fields |
| `apps/platform/src/lib/validations/strategy-goal.ts` | Modify | Add rationale to Zod schema |
| `apps/platform/src/app/api/plan/foundation/route.ts` | Verify | POST already uses `$set: parsed.data` — just verify |
| `apps/platform/src/app/api/plan/strategy-goals/route.ts` | Modify | Pass rationale in POST |
| `apps/platform/src/app/api/plan/strategy-goals/[id]/route.ts` | Modify | Pass rationale in PATCH |
| `apps/platform/src/components/plan/foundation-panel.tsx` | Modify | Add behaviors/principles sections |
| `apps/platform/src/components/plan/strategy-goal-form.tsx` | Modify | Add rationale textarea |
| `apps/platform/src/components/plan/strategy-panel.tsx` | Modify | Show rationale, add priority count warning |
| `apps/platform/src/lib/ai/plan-tools.ts` | Modify | Extend buildMVV for behaviors/principles |
| `apps/platform/src/lib/ai/strategy-tools.ts` | Modify | Return new fields in strategy breakdown |
| `scripts/seed-strategy.ts` | Modify | Add sample data for new fields |

---

### Task 1: Foundation Schema — Add Behaviors and Principles

**Files:**
- Modify: `packages/db/src/foundation-schema.ts`

- [ ] **Step 1: Add embedded sub-schema and new fields**

In `packages/db/src/foundation-schema.ts`, add a sub-schema for name+description items and add the two new array fields to the foundation schema:

```ts
const namedItemSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);
```

Add these fields inside the `foundationSchema` definition, after the `values` field:

```ts
    nonNegotiableBehaviors: { type: [namedItemSchema], default: [] },
    livedPrinciples: { type: [namedItemSchema], default: [] },
```

- [ ] **Step 2: Commit**

```bash
git add packages/db/src/foundation-schema.ts
git commit -m "feat(db): add nonNegotiableBehaviors and livedPrinciples to Foundation schema"
```

---

### Task 2: StrategyGoal Schema — Add Rationale

**Files:**
- Modify: `packages/db/src/strategy-goal-schema.ts`
- Modify: `apps/platform/src/components/plan/strategy-goal-card.tsx`

- [ ] **Step 1: Add rationale field to schema**

In `packages/db/src/strategy-goal-schema.ts`, add after the `successMetrics` field:

```ts
    rationale: { type: String, default: "" },
```

- [ ] **Step 2: Update StrategyGoalData interface**

In `apps/platform/src/components/plan/strategy-goal-card.tsx`, add `rationale` to the `StrategyGoalData` interface:

```ts
export interface StrategyGoalData {
  id: string;
  title: string;
  description: string;
  horizon: string;
  timePeriod: { start: string; end: string };
  scope: string;
  department: string | null;
  successMetrics: string;
  rationale: string;
  status: string;
  createdAt: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/strategy-goal-schema.ts apps/platform/src/components/plan/strategy-goal-card.tsx
git commit -m "feat(db): add rationale field to StrategyGoal schema"
```

---

### Task 3: Zod Validation Schemas

**Files:**
- Modify: `apps/platform/src/lib/validations/foundation.ts`
- Modify: `apps/platform/src/lib/validations/strategy-goal.ts`

- [ ] **Step 1: Update foundation validation**

Replace the contents of `apps/platform/src/lib/validations/foundation.ts`:

```ts
import { z } from "zod";

const namedItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export const foundationFormSchema = z.object({
  mission: z.string().max(2000, "Mission must be 2000 characters or fewer").optional().default(""),
  vision: z.string().max(2000, "Vision must be 2000 characters or fewer").optional().default(""),
  values: z.string().max(2000, "Values must be 2000 characters or fewer").optional().default(""),
  nonNegotiableBehaviors: z.array(namedItemSchema).optional().default([]),
  livedPrinciples: z.array(namedItemSchema).optional().default([]),
});

export type FoundationFormValues = z.infer<typeof foundationFormSchema>;
```

- [ ] **Step 2: Add rationale to strategy goal validation**

In `apps/platform/src/lib/validations/strategy-goal.ts`, add `rationale` field inside the `.object({...})` definition, after `successMetrics`:

```ts
    rationale: z.string().optional().default(""),
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/validations/foundation.ts apps/platform/src/lib/validations/strategy-goal.ts
git commit -m "feat(validation): add Zod schemas for behaviors, principles, and rationale"
```

---

### Task 4: Foundation API Route — Verify

**Files:**
- Verify: `apps/platform/src/app/api/plan/foundation/route.ts`

- [ ] **Step 1: Verify POST handler passes new fields**

The existing POST handler does:
```ts
const doc = await CompanyFoundation.findOneAndUpdate(
  {},
  { $set: parsed.data },
  { upsert: true, new: true, runValidators: true },
);
```

Since `parsed.data` now includes `nonNegotiableBehaviors` and `livedPrinciples` from the updated Zod schema, and Mongoose's `$set` passes them through, **no code changes needed** to this file. The validation layer handles it.

---

### Task 5: Strategy Goals API Routes — Add Rationale

**Files:**
- Modify: `apps/platform/src/app/api/plan/strategy-goals/route.ts`
- Modify: `apps/platform/src/app/api/plan/strategy-goals/[id]/route.ts`

- [ ] **Step 1: Update POST handler**

In `apps/platform/src/app/api/plan/strategy-goals/route.ts`, add `rationale` to the create call. Change the `StrategyGoal.create({...})` block to include:

```ts
      rationale: data.rationale || "",
```

Add it after the `successMetrics: data.successMetrics,` line.

- [ ] **Step 2: Update PATCH handler**

In `apps/platform/src/app/api/plan/strategy-goals/[id]/route.ts`, add after the `if (data.successMetrics !== undefined)` line:

```ts
    if (data.rationale !== undefined) update.rationale = data.rationale;
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/plan/strategy-goals/route.ts apps/platform/src/app/api/plan/strategy-goals/\[id\]/route.ts
git commit -m "feat(api): accept rationale in strategy goal create/update"
```

---

### Task 6: Foundation Panel UI — Add Behaviors and Principles Sections

**Files:**
- Modify: `apps/platform/src/components/plan/foundation-panel.tsx`

This is the largest task. The foundation panel currently handles mission/vision/values as simple text fields. Behaviors and principles are arrays of name+description items, requiring a different UI pattern.

- [ ] **Step 1: Update FoundationData interface and form state**

At the top of `foundation-panel.tsx`, update the `FoundationData` interface:

```ts
interface NamedItem {
  name: string;
  description: string;
}

interface FoundationData {
  id: string;
  mission: string;
  vision: string;
  values: string;
  nonNegotiableBehaviors: NamedItem[];
  livedPrinciples: NamedItem[];
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
}
```

Update the `form` state to include the new fields:

```ts
const [form, setForm] = useState({
  mission: "",
  vision: "",
  values: "",
  nonNegotiableBehaviors: [] as NamedItem[],
  livedPrinciples: [] as NamedItem[],
});
```

Update `fetchFoundation` to populate the new fields:

```ts
setForm({
  mission: data.foundation.mission,
  vision: data.foundation.vision,
  values: data.foundation.values,
  nonNegotiableBehaviors: data.foundation.nonNegotiableBehaviors ?? [],
  livedPrinciples: data.foundation.livedPrinciples ?? [],
});
```

- [ ] **Step 2: Add NamedItemListEditor sub-component**

Add this component inside the file (above `FoundationPanel`):

```tsx
function NamedItemListEditor({
  items,
  onChange,
  onSave,
  label,
  description,
  accentColor,
  namePlaceholder,
  descriptionPlaceholder,
}: {
  items: NamedItem[];
  onChange: (items: NamedItem[]) => void;
  onSave: () => void;
  label: string;
  description: string;
  accentColor: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
}) {
  function updateItem(index: number, field: "name" | "description", value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function addItem() {
    onChange([...items, { name: "", description: "" }]);
  }

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
    // Auto-save after removal
    setTimeout(onSave, 0);
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h3 className="font-display text-base font-bold" style={{ color: accentColor }}>
          {label}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <input
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                onBlur={onSave}
                placeholder={namePlaceholder}
                className="w-full rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[--accent]"
                style={{ "--accent": accentColor } as React.CSSProperties}
              />
              <textarea
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                onBlur={onSave}
                placeholder={descriptionPlaceholder}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[--accent] resize-y"
                style={{ "--accent": accentColor } as React.CSSProperties}
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="shrink-0 self-start mt-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors w-full justify-center"
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Add {label.replace(/s$/, "")}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add list editors to edit mode**

In the edit mode return block, after the `{SECTIONS.map(...)}` closing `</div>`, add:

```tsx
        <div className="space-y-5 mt-5">
          <NamedItemListEditor
            items={form.nonNegotiableBehaviors}
            onChange={(items) => setForm((prev) => ({ ...prev, nonNegotiableBehaviors: items }))}
            onSave={handleSave}
            label="Non-Negotiable Behaviors"
            description="What behaviors are absolutely required regardless of role or department?"
            accentColor={accentColor}
            namePlaceholder="Behavior name (e.g., Transparency in decision-making)"
            descriptionPlaceholder="Describe what this looks like in practice..."
          />
          <NamedItemListEditor
            items={form.livedPrinciples}
            onChange={(items) => setForm((prev) => ({ ...prev, livedPrinciples: items }))}
            onSave={handleSave}
            label="Lived Principles"
            description="What principles guide how work gets done day-to-day?"
            accentColor={accentColor}
            namePlaceholder="Principle name (e.g., Default to action over consensus)"
            descriptionPlaceholder="Describe how this principle shows up in daily work..."
          />
        </div>
```

- [ ] **Step 4: Add behaviors/principles to published view**

In the published read-only view, after the `{SECTIONS.map(...)}` closing `</div>`, add two new sections inside the card (before the closing `</div>` of `foundation-card`):

```tsx
              {/* Non-Negotiable Behaviors */}
              {foundation.nonNegotiableBehaviors && foundation.nonNegotiableBehaviors.length > 0 && (
                <div className="px-8 py-6 border-t border-border/50">
                  <h4 className="font-display text-sm font-bold text-deep-blue mb-2.5">
                    Non-Negotiable Behaviors
                  </h4>
                  <div className="space-y-3">
                    {foundation.nonNegotiableBehaviors.map((item: NamedItem, i: number) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lived Principles */}
              {foundation.livedPrinciples && foundation.livedPrinciples.length > 0 && (
                <div className="px-8 py-6 border-t border-border/50">
                  <h4 className="font-display text-sm font-bold text-deep-blue mb-2.5">
                    Lived Principles
                  </h4>
                  <div className="space-y-3">
                    {foundation.livedPrinciples.map((item: NamedItem, i: number) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
```

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/plan/foundation-panel.tsx
git commit -m "feat(ui): add non-negotiable behaviors and lived principles to foundation panel"
```

---

### Task 7: Strategy Goal Form — Add Rationale Textarea

**Files:**
- Modify: `apps/platform/src/components/plan/strategy-goal-form.tsx`

- [ ] **Step 1: Add rationale state**

Add to the state declarations (after `const [successMetrics, setSuccessMetrics] = useState("");`):

```ts
  const [rationale, setRationale] = useState("");
```

- [ ] **Step 2: Pre-fill rationale on edit**

In the `useEffect` that pre-fills on edit, add after `setSuccessMetrics(editGoal.successMetrics);`:

```ts
      setRationale(editGoal.rationale ?? "");
```

- [ ] **Step 3: Add rationale textarea to form**

After the Description textarea section and before the Horizon/Dates grid, add:

```tsx
          {/* Rationale */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rationale
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="Why is this a priority? What's the business case?"
            />
          </div>
```

- [ ] **Step 4: Include rationale in submit body**

In the `JSON.stringify({...})` call inside `handleSubmit`, add `rationale,` after `successMetrics,`.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/plan/strategy-goal-form.tsx
git commit -m "feat(ui): add rationale textarea to strategy goal form"
```

---

### Task 8: Strategy Panel — Show Rationale + Priority Count Warning

**Files:**
- Modify: `apps/platform/src/components/plan/strategy-panel.tsx`

- [ ] **Step 1: Add rationale to expanded detail**

In the expanded detail section of `renderGoalTable`, after the description block and before the successMetrics block, add:

```tsx
                          {goal.rationale && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Rationale
                              </p>
                              <p className="text-sm font-normal text-foreground leading-relaxed">
                                {goal.rationale}
                              </p>
                            </div>
                          )}
```

Find the existing block that renders `goal.description` (around line 226-234) — the rationale block goes right after it.

- [ ] **Step 2: Add priority count warning**

After the header row (the `<div className="flex items-center justify-between mb-4">` block) and before the goal tables, add:

```tsx
        {/* Priority count warning */}
        {viewMode === "company" && (() => {
          const companyCount = goals.filter((g) => g.scope === "company").length;
          if (companyCount > 0 && (companyCount < 3 || companyCount > 5)) {
            return (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 mb-4">
                Strategy Studio recommends 3–5 enterprise priorities per planning cycle.
                You currently have {companyCount}.
              </div>
            );
          }
          return null;
        })()}
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/strategy-panel.tsx
git commit -m "feat(ui): show rationale in strategy panel, add priority count warning"
```

---

### Task 9: AI Tools — Extend buildMVV for Behaviors and Principles

**Files:**
- Modify: `apps/platform/src/lib/ai/plan-tools.ts`

- [ ] **Step 1: Update tool description**

In `buildMVVTool`, after the existing Values questions section in the description, add:

```
**Non-Negotiable Behaviors questions (ask one at a time, AFTER values are done):**
16. What behaviors are absolutely non-negotiable in your organization, regardless of role or department?
17. What would you consider a fireable offense related to conduct or culture?
18. What behaviors must every employee demonstrate, even under pressure?

After enough answers, synthesize into 3-5 non-negotiable behaviors. Each should have a clear **name** and description. Call updateWorkingDocument with { nonNegotiableBehaviors: [{ name: "...", description: "..." }, ...] }.

**Lived Principles questions (ask one at a time, AFTER behaviors):**
19. What principles guide how decisions are made day-to-day?
20. When two good options conflict, what tiebreaker principles does your team use?
21. What would a new hire need to internalize to fit in culturally?

After enough answers, synthesize into 3-5 lived principles with **name** and description. Call updateWorkingDocument with { livedPrinciples: [{ name: "...", description: "..." }, ...] }.
```

- [ ] **Step 2: Update prefilled data and execute return**

In the `execute` function, update the `existing` object initialization:

```ts
    let existing = { mission: "", vision: "", values: "", nonNegotiableBehaviors: [] as { name: string; description: string }[], livedPrinciples: [] as { name: string; description: string }[] };
```

Update the `if (doc)` block:

```ts
        existing = {
          mission: doc.mission || "",
          vision: doc.vision || "",
          values: doc.values || "",
          nonNegotiableBehaviors: doc.nonNegotiableBehaviors ?? [],
          livedPrinciples: doc.livedPrinciples ?? [],
        };
```

Update the `prefilled` object:

```ts
    const prefilled: Record<string, unknown> = {
      mission: params.existingMission ?? existing.mission,
      vision: params.existingVision ?? existing.vision,
      values: params.existingValues ?? existing.values,
      nonNegotiableBehaviors: existing.nonNegotiableBehaviors,
      livedPrinciples: existing.livedPrinciples,
    };
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/plan-tools.ts
git commit -m "feat(ai): extend buildMVV tool for behaviors and principles"
```

---

### Task 10: AI Tools — Extend getStrategyBreakdown

**Files:**
- Modify: `apps/platform/src/lib/ai/strategy-tools.ts`

- [ ] **Step 1: Return new foundation fields**

In `getStrategyBreakdownTool`, update the foundation return block. Change:

```ts
      foundation: foundation
        ? {
            mission: (foundation as Record<string, unknown>).mission,
            vision: (foundation as Record<string, unknown>).vision,
            values: (foundation as Record<string, unknown>).values,
          }
        : null,
```

To:

```ts
      foundation: foundation
        ? {
            mission: (foundation as Record<string, unknown>).mission,
            vision: (foundation as Record<string, unknown>).vision,
            values: (foundation as Record<string, unknown>).values,
            nonNegotiableBehaviors: (foundation as Record<string, unknown>).nonNegotiableBehaviors ?? [],
            livedPrinciples: (foundation as Record<string, unknown>).livedPrinciples ?? [],
          }
        : null,
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/ai/strategy-tools.ts
git commit -m "feat(ai): return behaviors and principles in strategy breakdown"
```

---

### Task 11: Seed Data — Add Sample Behaviors, Principles, and Rationale

**Files:**
- Modify: `scripts/seed-strategy.ts`

- [ ] **Step 1: Add behaviors and principles to foundation**

In the `CompanyFoundation.create({...})` call, add after the `values` field:

```ts
    nonNegotiableBehaviors: [
      {
        name: "Transparency in Decision-Making",
        description: "Every significant decision must be explainable to anyone affected by it. No black-box choices, no hidden agendas.",
      },
      {
        name: "Psychological Safety in Feedback",
        description: "Feedback flows in all directions without fear of retaliation. Dissent is welcomed when respectful and constructive.",
      },
      {
        name: "Data Before Opinion",
        description: "When data is available, it leads the conversation. Gut feel is a starting point, not a conclusion.",
      },
      {
        name: "Follow Through on Commitments",
        description: "If you commit to something, deliver it or renegotiate early. Ghosting on commitments erodes trust faster than anything else.",
      },
    ],
    livedPrinciples: [
      {
        name: "Default to Action Over Consensus",
        description: "When a decision is reversible and low-risk, move forward. Don't wait for perfect alignment when progress is possible.",
      },
      {
        name: "Own the Outcome, Not Just the Task",
        description: "Completing your assignment isn't enough. If the outcome isn't right, keep pushing until it is or escalate clearly.",
      },
      {
        name: "Teach What You Learn",
        description: "Knowledge shared is knowledge multiplied. Document, demo, and debrief so the team levels up together.",
      },
    ],
```

- [ ] **Step 2: Add rationale to each strategy goal**

Add a `rationale` field to each object in `strategyGoalDefs`:

For "Achieve product-market fit...":
```ts
      rationale: "Mid-market HR is underserved by both enterprise incumbents (too complex, too expensive) and SMB tools (too simple). Our AI-first approach can deliver enterprise-quality workflows at mid-market pricing.",
```

For "Build self-serve onboarding...":
```ts
      rationale: "Sales-assisted onboarding doesn't scale past 100 customers. Product-led growth reduces CAC by 60% and lets HR teams self-discover value without a demo call.",
```

For "Launch Grow performance module...":
```ts
      rationale: "Performance management is the #1 requested feature from beta customers and the primary differentiator against competitors who only do corrective actions.",
```

For "Reduce P95 API response time...":
```ts
      rationale: "Beta customers report that slow AI responses during check-ins and goal creation reduce adoption. Sub-500ms is the threshold where the tool feels instant.",
```

For "Establish CI/CD pipeline...":
```ts
      rationale: "Manual deploys have caused two production incidents in the last month. Automated quality gates are non-negotiable before scaling the team.",
```

For "Design and roll out standardized performance review process":
```ts
      rationale: "Three departments currently use different review formats. Standardization is required before Ascenta can generate meaningful cross-org analytics.",
```

For "Complete competitive analysis...":
```ts
      rationale: "The sales team lacks battle cards and positioning against Lattice, 15Five, and Culture Amp. Win rates drop 30% in competitive deals without clear differentiation.",
```

- [ ] **Step 3: Update seed summary**

Update the summary log at the bottom to include new field counts:

```ts
  console.log(`  Foundation:       1 document (${foundation.status})`);
  console.log(`    Behaviors:      ${foundation.nonNegotiableBehaviors.length}`);
  console.log(`    Principles:     ${foundation.livedPrinciples.length}`);
```

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-strategy.ts
git commit -m "feat(seed): add sample behaviors, principles, and rationale to strategy data"
```
