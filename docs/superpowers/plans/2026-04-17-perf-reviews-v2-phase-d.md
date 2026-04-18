# Performance Reviews v2 — Phase D Implementation Plan

**Date:** 2026-04-17
**Branch:** `feat/perf-reviews-v2-phase-d`
**Spec:** `docs/superpowers/specs/2026-04-17-perf-reviews-v2-phase-d-design.md`
**Builds on:** Phase C commit f08902e (main branch)

---

## Task Overview

| # | Task | Depends on |
|---|---|---|
| 1 | API: finalize + acknowledge gates; add `status` to employee list | — |
| 2 | API: evidence endpoint | — |
| 3 | CategorySectionCard: evidence sidebar UI | — |
| 4 | ManagerAssessmentForm: wire evidence fetch + saves | 2, 3 |
| 5 | DevelopmentPlanForm: new component | — |
| 6 | ReviewsPanel: dev plan + finalize actions | 1, 5 |
| 7 | AcknowledgmentView + SelfAssessmentPanel extension | 1 |

Tasks 1, 2, 3, and 5 are fully independent. Tasks 4, 6, and 7 each depend on earlier tasks. Suggested order: 1 → 2 → 3 → 5 (parallel if using sub-agents) → 4 → 6 → 7.

---

## Task 1 — API: status gates + employee list `status` field

**Files modified:**
- `apps/platform/src/app/api/grow/reviews/route.ts`
- `apps/platform/src/app/api/grow/reviews/[id]/route.ts`

### 1a — Employee list: add `status` to response

In `route.ts`, the `employeeObjectId` branch (~line 27) maps reviews. Add `status` to each entry:

```typescript
status: (r.status as string) ?? "not_started",
```

The `ReviewSummary` interface in `self-assessment-panel.tsx` also gains `status: string` (updated in Task 7).

### 1b — PATCH: finalize gate

In `[id]/route.ts`, after the `managerAssessmentWorkBeingWritten` guard block (~line 91), add:

```typescript
if (data.status === "finalized") {
  const devPlanStatus = review.developmentPlan?.status ?? "not_started";
  if (devPlanStatus !== "finalized") {
    return NextResponse.json(
      { success: false, error: "Development plan must be finalized before the review can be finalized." },
      { status: 422 }
    );
  }
}
```

### 1c — PATCH: acknowledge gate

Immediately after the finalize gate:

```typescript
if (data.status === "acknowledged") {
  if (review.status !== "finalized") {
    return NextResponse.json(
      { success: false, error: "Review must be finalized before it can be acknowledged." },
      { status: 422 }
    );
  }
}
```

**Pitfall:** Both guards must execute **before** `updateOps` is built and `findByIdAndUpdate` is called. Place them right after the existing manager-assessment gate block, before the `updateOps` object is assembled.

**Commit:** `feat: add finalize and acknowledge status gates to PATCH /api/grow/reviews/[id]`

---

## Task 2 — API: evidence endpoint

**File created:** `apps/platform/src/app/api/grow/reviews/[id]/evidence/route.ts`

Create a `GET` handler only. Steps:

1. `await connectDB()`
2. Look up the review: `PerformanceReview.findById(id).lean()` — need `employee`, `reviewPeriod.start`, `reviewPeriod.end`
3. Return 404 if not found
4. Run three queries in parallel via `Promise.all`:
   - `Goal.find({ owner: review.employee, "timePeriod.end": { $gte: reviewPeriod.start }, "timePeriod.start": { $lte: reviewPeriod.end } }).select("_id objectiveStatement goalType status").lean()`
   - `CheckIn.find({ employee: review.employee, scheduledDate: { $gte: reviewPeriod.start, $lte: reviewPeriod.end } }).select("_id participate.completedAt participate.managerCommitment participate.employeeCommitment").lean()`
   - `PerformanceNote.find({ employee: review.employee, createdAt: { $gte: reviewPeriod.start, $lte: reviewPeriod.end } }).select("_id type observation createdAt").lean()`
5. Map each to a minimal shape:
   - Goal: `{ id: String(g._id), kind: "goal", label: g.objectiveStatement, category: g.goalType, status: g.status }`
   - CheckIn: `{ id: String(c._id), kind: "checkin", label: formatCheckInLabel(c) }` where `formatCheckInLabel` returns a short string like `"Check-in · Mar 15, 2026"` using `c.participate?.completedAt`
   - Note: `{ id: String(n._id), kind: "note", label: \`${n.type}: ${n.observation.slice(0, 60)}…\` }`
6. Return `{ success: true, goals, checkIns, notes }`

**Client-safe import pitfall:** This is a server route file — it can import from `@ascenta/db/goal-schema`, `@ascenta/db/checkin-schema`, `@ascenta/db/performance-note-schema` safely. Do NOT import these from any client component.

**Pitfall:** `CheckIn` schema uses `scheduledDate` as the date field. Confirm import name: `import { CheckIn } from "@ascenta/db/checkin-schema"` — the model export is `CheckIn`.

**Commit:** `feat: add GET /api/grow/reviews/[id]/evidence endpoint`

---

## Task 3 — CategorySectionCard: evidence sidebar

**File modified:** `apps/platform/src/components/grow/performance-reviews/category-section-card.tsx`

### New types (define at top of file, client-safe — no mongoose)

```typescript
export interface EvidenceItem {
  id: string;
  kind: "goal" | "checkin" | "note";
  label: string;
}

export interface EvidenceRef {
  type: "goal" | "checkin" | "note" | "other";
  refId: string;
  label: string;
}
```

### New props on `CategorySectionCardProps`

```typescript
evidenceItems?: EvidenceItem[];
selectedEvidence?: EvidenceRef[];
onEvidenceChange?: (refs: EvidenceRef[]) => void;
```

### Render changes

Add a collapsible evidence section at the very bottom of the card, after the "Specific Examples" block, when `evidenceItems` is provided:

- Use a React `useState<boolean>` for `isOpen` (default `false`)
- Collapsed state: a small button showing "Supporting Evidence (N tagged)" or "Tag evidence →" using `selectedEvidence?.length`
- Expanded state: group items by `kind` with headings "Goals", "Check-ins", "Notes". Each item is a checkbox row.
- Checkbox `onChange`: compute new `EvidenceRef[]` by adding or removing the item. Call `onEvidenceChange(newRefs)`. Match by `id`/`refId` to avoid duplicates.
- When `disabled` prop is true: if `selectedEvidence` has entries, render them as a flat read-only list. If empty, render nothing. Never render checkboxes when disabled.
- When `evidenceItems` is empty array: render "No linked items found for this review period." inside the expanded panel.

**Pitfall:** `evidenceItems` is passed from the parent, which has all items. The card does not fetch anything — it only renders what it's given. This keeps the card simple and the fetch centralized in the form.

**Commit:** `feat: add evidence sidebar to CategorySectionCard`

---

## Task 4 — ManagerAssessmentForm: wire evidence

**File modified:** `apps/platform/src/components/grow/performance-reviews/manager-assessment-form.tsx`

### State additions

```typescript
const [evidenceData, setEvidenceData] = useState<{
  goals: EvidenceItem[];
  checkIns: EvidenceItem[];
  notes: EvidenceItem[];
} | null>(null);
const [sections, setSections] = useState<CategorySectionValue[]>(() => buildInitialSections([]));
// extend CategorySectionValue to include evidence:
// evidence: EvidenceRef[]  (already in the schema, just not in the TS interface yet)
```

Extend `CategorySectionValue` to include `evidence: EvidenceRef[]`:
```typescript
interface CategorySectionValue {
  categoryKey: ReviewCategoryKey;
  rating: number | null;
  notes: string;
  examples: string;
  evidence: EvidenceRef[];
}
```
Update `buildInitialSections` to default `evidence: []` and pick up evidence from fetched sections.

### Load evidence in parallel

In the existing `loadSections` effect, add a second fetch in `Promise.all`:

```typescript
const [reviewRes, evidenceRes] = await Promise.all([
  fetch(`/api/grow/reviews/${reviewId}`),
  fetch(`/api/grow/reviews/${reviewId}/evidence`),
]);
```

On success, map the evidence response into flat `EvidenceItem[]`:
```typescript
const allItems: EvidenceItem[] = [
  ...goals.map((g) => ({ id: g.id, kind: "goal" as const, label: g.label })),
  ...checkIns.map((c) => ({ id: c.id, kind: "checkin" as const, label: c.label })),
  ...notes.map((n) => ({ id: n.id, kind: "note" as const, label: n.label })),
];
setEvidenceData({ goals: allItems.filter(i => i.kind === "goal"), ... });
```

Or simpler: store a single flat `allEvidenceItems: EvidenceItem[]` array — the card groups by `kind` itself.

### Pass to CategorySectionCard

In the render loop:
```tsx
<CategorySectionCard
  ...existing props...
  evidenceItems={allEvidenceItems}
  selectedEvidence={section.evidence}
  onEvidenceChange={(refs) => handleEvidenceChange(index, refs)}
/>
```

`handleEvidenceChange`:
```typescript
const handleEvidenceChange = useCallback((index: number, refs: EvidenceRef[]) => {
  setSections((prev) => {
    const updated = prev.map((s, i) => i === index ? { ...s, evidence: refs } : s);
    sectionsRef.current = updated;
    saveSections(updated);  // immediate save (no debounce — checkbox interaction)
    return updated;
  });
}, [saveSections]);
```

**Pitfall:** `saveSections` already serializes the full sections array including `evidence`. No changes to the PATCH body structure are needed — evidence is just another field in each section object that gets written along with rating/notes/examples.

**Pitfall:** `evidenceRes` may 404 or 500 in edge cases (no goals/check-ins in the period). Handle gracefully: catch errors and default `allEvidenceItems` to `[]`. Do not block the form from loading.

**Commit:** `feat: wire evidence fetch and category tagging into ManagerAssessmentForm`

---

## Task 5 — DevelopmentPlanForm: new component

**File created:** `apps/platform/src/components/grow/performance-reviews/development-plan-form.tsx`

Mirror the structure of `SelfAssessmentForm` / `ManagerAssessmentForm`. Key patterns:

- `"use client"` directive
- Imports from `@ascenta/ui/*` and `@ascenta/db/performance-review-categories` (client-safe) only
- `planRef` instead of `sectionsRef` — holds `{ areasOfImprovement, managerCommitments, nextReviewDate }`
- `hasFirstSavedRef` — initialized to `initialStatus !== "not_started"`
- Auto-save on blur: 500ms debounced `PATCH /api/grow/reviews/${reviewId}` with `{ developmentPlan: { status: "draft", ...planRef.current } }`
- On first save when status is `not_started`: include `status: "draft"` in the payload, set `hasFirstSavedRef.current = true`

Data fetch on mount:
```typescript
const res = await fetch(`/api/grow/reviews/${reviewId}`);
// load review.developmentPlan — populate form fields
// if developmentPlan.status === "finalized", set finalized=true (read-only)
```

Form fields:
- **Areas of Improvement**: dynamic array of `{ area, actions, timeline, owner }`. Use `useState<AreaItem[]>`. Each area row is a bordered sub-card with: a text input for `area`, a textarea for `actions` (one per line — split on `\n` for save), a text input for `timeline`, a text input for `owner`, and a "Remove" button.
- **Manager Commitments**: single textarea, one commitment per line. On save, split on `\n` to produce `string[]`.
- **Next Review Date**: `<input type="date" />`. On save, serialize to ISO string.

"Finalize Dev Plan" button:
1. Clear debounce timer
2. PATCH `{ developmentPlan: { status: "finalized", areasOfImprovement, managerCommitments, nextReviewDate } }`
3. On success: `setFinalized(true)`, call `onFinalized()`

State variables: `isSaving`, `isFinalizing`, `saveError`, `finalizeError`, `finalized`, `isLoadingInitial`.

Header row (same as other forms): back button, title "Development Plan", auto-save indicator.

**Pitfall:** `managerCommitments` comes back from DB as `string[]` but is edited in a single textarea. On load, join with `"\n"`. On save, split by `"\n"` and filter empty strings.

**Commit:** `feat: add DevelopmentPlanForm component`

---

## Task 6 — ReviewsPanel: dev plan and finalize actions

**File modified:** `apps/platform/src/components/grow/reviews-panel.tsx`

### State additions

```typescript
const [activePlanReviewId, setActivePlanReviewId] = useState<string | null>(null);
```

### Derive active review

```typescript
const activePlanReview = activePlanReviewId
  ? (reviews.find((r) => r.reviewId === activePlanReviewId) ?? null)
  : null;
```

### Conditional render

Add a second early-return block (after the existing `activeAssessmentReview` check):

```tsx
if (activePlanReview) {
  return (
    <DevelopmentPlanForm
      reviewId={activePlanReview.reviewId!}
      employeeName={activePlanReview.employeeName}
      reviewPeriod={period}
      accentColor={accentColor}
      onBack={() => setActivePlanReviewId(null)}
      onFinalized={() => {
        fetchReviews();
        setActivePlanReviewId(null);
      }}
    />
  );
}
```

### New action buttons

In the table row actions, add (after the existing "Continue Assessment →" button):

```tsx
{review.status === "draft_complete" && review.reviewId && (
  <Button
    variant="ghost"
    size="sm"
    className="h-7 text-xs"
    style={{ color: accentColor }}
    onClick={() => setActivePlanReviewId(review.reviewId!)}
  >
    {review.devPlanStatus === "draft" ? "Continue Dev Plan →" : "Complete Dev Plan"}
  </Button>
)}
{review.status === "draft_complete" && review.devPlanStatus === "finalized" && review.reviewId && (
  <Button
    variant="ghost"
    size="sm"
    className="h-7 text-xs"
    style={{ color: accentColor }}
    onClick={() => handleFinalizeReview(review.reviewId!)}
  >
    Finalize Review →
  </Button>
)}
```

### `ReviewEntry` interface extension

Add `devPlanStatus: string` to the `ReviewEntry` interface.

Add to the GET response mapping in `route.ts`:
```typescript
devPlanStatus: review ? (review.developmentPlan?.status as string | undefined) ?? "not_started" : "not_started",
```

### `handleFinalizeReview` handler

```typescript
const handleFinalizeReview = async (reviewId: string) => {
  const res = await fetch(`/api/grow/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "finalized" }),
  });
  if (res.ok) {
    fetchReviews();
  } else {
    const data = await res.json().catch(() => ({}));
    console.error("Finalize failed:", data.error);
  }
};
```

**Pitfall:** The "Finalize Review" button and "Continue Dev Plan" button may both be visible if `draft_complete` but `devPlanStatus === "finalized"`. Use `else if` or make the conditions mutually exclusive: show "Finalize Review" only if `devPlanStatus === "finalized"`, otherwise show "Complete/Continue Dev Plan".

**Commit:** `feat: wire development plan and finalize actions into ReviewsPanel`

---

## Task 7 — AcknowledgmentView + SelfAssessmentPanel extension

**Files:**
- Create: `apps/platform/src/components/grow/performance-reviews/acknowledgment-view.tsx`
- Modify: `apps/platform/src/components/grow/performance-reviews/self-assessment-panel.tsx`

### AcknowledgmentView

New component. Fetch `GET /api/grow/reviews/${reviewId}` on mount. Show loading spinner while fetching. Read-only throughout — no auto-save.

Layout:
1. Back button + header "Performance Review — {reviewPeriod}"
2. Two-column section heading row: "Your Self-Assessment" (left) and "Manager's Assessment" (right)
3. For each of the 10 category keys (in `REVIEW_CATEGORY_KEYS` order): a comparison row card showing both assessments side-by-side
4. Development plan summary block
5. Sign-off row

Comparison card per category (simple, inline — no need for a separate component file):
```tsx
<div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4">
  <div>
    <p className="text-xs font-semibold text-muted-foreground mb-1">Self-Assessment</p>
    <p className="text-sm">Rating: {selfRating ? `${selfRating} — ${RATING_SCALE[selfRating].label}` : "Not rated"}</p>
    {selfNotes && <p className="text-xs text-muted-foreground mt-1">{selfNotes}</p>}
  </div>
  <div>
    <p className="text-xs font-semibold text-muted-foreground mb-1">Manager's Assessment</p>
    <p className="text-sm">Rating: {mgrRating ? `${mgrRating} — ${RATING_SCALE[mgrRating].label}` : "Not rated"}</p>
    {mgrNotes && <p className="text-xs text-muted-foreground mt-1">{mgrNotes}</p>}
  </div>
</div>
```

Development plan block (read-only):
- Each `areasOfImprovement` entry: area + bullet-list of actions + timeline + owner
- `managerCommitments` as a bullet list
- `nextReviewDate` formatted as locale date string

Sign-off row:
```tsx
<div className="flex flex-col items-end gap-2 pt-4 border-t">
  {!acknowledged && (
    <>
      <p className="text-xs text-muted-foreground">
        By signing off you confirm you have reviewed and understand this assessment.
      </p>
      {ackError && <p className="text-xs text-red-500">{ackError}</p>}
      <Button onClick={handleAcknowledge} disabled={isAcknowledging} style={{ backgroundColor: accentColor }} className="text-white">
        {isAcknowledging ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing off…</> : "Sign Off →"}
      </Button>
    </>
  )}
  {acknowledged && (
    <div className="flex items-center gap-1.5 text-sm" style={{ color: accentColor }}>
      <CheckCircle2 className="h-4 w-4" /> Acknowledged
    </div>
  )}
</div>
```

`handleAcknowledge`:
```typescript
const handleAcknowledge = async () => {
  setIsAcknowledging(true);
  const res = await fetch(`/api/grow/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "acknowledged" }),
  });
  if (res.ok) {
    setAcknowledged(true);
    onAcknowledged();
  } else {
    const data = await res.json().catch(() => ({}));
    setAckError(data.error ?? "Failed to acknowledge — please try again.");
  }
  setIsAcknowledging(false);
};
```

### SelfAssessmentPanel changes

1. Add `status: string` to `ReviewSummary` interface
2. In `STATUS_CONFIG`, add entries for `"finalized"` and `"acknowledged"`:
   ```typescript
   finalized: { label: "Ready to Review", bg: "bg-blue-500/15", text: "text-blue-600", icon: CheckCircle },
   acknowledged: { label: "Acknowledged", bg: "bg-gray-500/15", text: "text-gray-500", icon: CheckCircle },
   ```
3. Add `activeAckReviewId` state (same pattern as `activeReviewId`)
4. Early-return block for acknowledgment view:
   ```tsx
   if (activeAckReview) {
     return <AcknowledgmentView reviewId={...} ... onAcknowledged={() => { fetchReviews(); setActiveAckReviewId(null); }} />;
   }
   ```
5. In each review row, replace single action button with conditional logic:
   - `status === "finalized"` → "View & Sign Off" button → `setActiveAckReviewId(review.id)`
   - `status === "acknowledged"` → no button (status badge is sufficient)
   - Otherwise → existing "Start" / "Continue" / "View" self-assessment button logic

**Pitfall:** `STATUS_CONFIG` is typed `Record<SelfAssessmentStatus, ...>`. Since `finalized` and `acknowledged` are not `SelfAssessmentStatus` values, either widen the type to `Record<string, ...>` or handle the display logic outside of `STATUS_CONFIG` with a fallback.

**Commit:** `feat: add AcknowledgmentView and wire employee sign-off in SelfAssessmentPanel`

---

## Commit Strategy

One commit per task, all on `feat/perf-reviews-v2-phase-d`:

1. `feat: add finalize and acknowledge status gates to PATCH /api/grow/reviews/[id]`
2. `feat: add GET /api/grow/reviews/[id]/evidence endpoint`
3. `feat: add evidence sidebar to CategorySectionCard`
4. `feat: wire evidence fetch and category tagging into ManagerAssessmentForm`
5. `feat: add DevelopmentPlanForm component`
6. `feat: wire development plan and finalize actions into ReviewsPanel`
7. `feat: add AcknowledgmentView and wire employee sign-off in SelfAssessmentPanel`

---

## Dependencies

```
Task 1 ──────────────────────────────────┐
Task 2 ──────┐                           │
Task 3 ──────┤──→ Task 4                 │
             │                           │
Task 5 ──────────────────────→ Task 6 ←─┘
Task 1 ──────────────────────→ Task 7
```

---

## Definition of Done

- [ ] All 7 tasks committed on `feat/perf-reviews-v2-phase-d`
- [ ] `pnpm test` passes
- [ ] `tsc --noEmit` no new errors (pre-existing chat-message.tsx error is acceptable)
- [ ] No N+1 queries in the evidence endpoint (confirmed: `Promise.all` with 3 parallel queries)
- [ ] No mongoose imports in client components (evidence types defined inline; all DB access in route files)
- [ ] Spec compliance review: ✅
- [ ] PR opened against main
