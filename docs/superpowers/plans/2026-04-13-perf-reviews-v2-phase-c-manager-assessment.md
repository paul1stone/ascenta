# Performance Reviews v2 — Phase C: Manager Assessment UI Implementation Plan

**Date:** 2026-04-13
**Branch:** `feat/perf-reviews-v2-phase-c`
**Spec:** `docs/superpowers/specs/2026-04-13-perf-reviews-v2-phase-c-manager-assessment-design.md`
**Builds on:** Phase B commit a947f03 (main branch)

---

## Task 1 — API: add selfAssessmentStatus + managerAssessmentStatus to manager view

**File:** `apps/platform/src/app/api/grow/reviews/route.ts`

In the manager view GET handler (the `if (!managerId)` block further down, around line 97+), the `reviewEntries.map((emp) => ...)` currently returns:
```
{ employeeId, employeeObjectId, name, department, goalCount, status, currentStep, reviewId }
```

Add two more fields:
```typescript
selfAssessmentStatus: review ? (review.selfAssessment?.status ?? "not_started") : "not_started",
managerAssessmentStatus: review ? (review.managerAssessment?.status ?? "not_started") : "not_started",
```

`review` here is the already-fetched Mongoose document. Type these as `string` (they come from DB as-is).

**No new routes needed.** `GET /api/grow/reviews/[id]` already returns the full review document including both `selfAssessment.sections` and `managerAssessment.sections`.

---

## Task 2 — CategorySectionCard: add optional employee reference props

**File:** `apps/platform/src/components/grow/performance-reviews/category-section-card.tsx`

Add two optional props to `CategorySectionCardProps`:
```typescript
employeeRating?: number | null;
employeeNotes?: string;
```

When `employeeRating != null`, render a read-only reference block **between the definition text and the guided prompts**:

```
┌──────────────────────────────────────────────┐
│ Employee's self-assessment                   │
│ [rating label from RATING_SCALE] (read-only) │
│ [employeeNotes text if non-empty, max 3 lines]│
└──────────────────────────────────────────────┘
```

Styling: muted border, `bg-muted/30`, `text-xs`.

Rating display: `RATING_SCALE[employeeRating].label` — show the label (e.g., "Meets Expectations") with the numeric rating.

Notes display: only show if `employeeNotes` is non-empty — plain `<p>` with `line-clamp-3`.

**Unchanged:** all existing props and behavior. This is purely additive.

---

## Task 3 — ManagerAssessmentForm: new component

**File:** `apps/platform/src/components/grow/performance-reviews/manager-assessment-form.tsx`

Closely mirrors `SelfAssessmentForm`. Key differences:
- Fetches BOTH `selfAssessment.sections` (employee's, read-only) AND `managerAssessment.sections` (manager's, editable) from `GET /api/grow/reviews/${reviewId}`
- Passes `employeeRating` and `employeeNotes` to each `CategorySectionCard`
- PATCH endpoint uses `managerAssessment` key (not `selfAssessment`)
- `hasFirstSavedRef` advances `managerAssessment.status` to `"in_progress"` (not `selfAssessment.status`)
- Submit PATCH: `{ managerAssessment: { status: "submitted", sections } }`
- Header: "Manager Assessment" (not "Self-Assessment")
- Submit button: "Submit Manager Assessment"

All other patterns identical: `sectionsRef`, `debounceRef`, `isLoadingInitial`, `saveError`, `submitError`, unrated-count warning.

```typescript
interface ManagerAssessmentFormProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  initialStatus: SelfAssessmentStatus;  // manager's current assessment status
  accentColor: string;
  onBack: () => void;
  onSubmitted: () => void;
}
```

---

## Task 4 — ReviewsPanel: wire up inline manager assessment

**File:** `apps/platform/src/components/grow/reviews-panel.tsx`

Changes:
1. Extend `ReviewEntry` interface:
   ```typescript
   selfAssessmentStatus: string;
   managerAssessmentStatus: string;
   ```

2. Add state:
   ```typescript
   const [activeAssessmentReviewId, setActiveAssessmentReviewId] = useState<string | null>(null);
   ```

3. Derive `activeAssessmentReview` from `reviews` by `activeAssessmentReviewId`.

4. **Conditional render**: if `activeAssessmentReview` is set, render only:
   ```tsx
   <ManagerAssessmentForm
     reviewId={activeAssessmentReview.reviewId!}
     employeeName={activeAssessmentReview.name}
     reviewPeriod={period}
     initialStatus={activeAssessmentReview.managerAssessmentStatus as SelfAssessmentStatus}
     accentColor={accentColor}
     onBack={() => setActiveAssessmentReviewId(null)}
     onSubmitted={() => {
       fetchReviews();
       setActiveAssessmentReviewId(null);
     }}
   />
   ```

5. **New action buttons** in the table:
   - `status === "self_submitted"` → "Begin Assessment" button → `setActiveAssessmentReviewId(review.reviewId)`
   - `status === "manager_in_progress"` → "Continue Assessment" button → `setActiveAssessmentReviewId(review.reviewId)`
   - Keep existing "Start Review" (chat), "Continue" (chat), and PDF download buttons

6. Import `ManagerAssessmentForm` and `SelfAssessmentStatus` type.

---

## Commit Strategy

Single commit per task. All on `feat/perf-reviews-v2-phase-c` branch.

Tasks 1 and 2 can be implemented independently (no dependencies between them).
Task 3 depends on Task 2 (uses CategorySectionCard with new props).
Task 4 depends on Tasks 1 and 3 (uses new ReviewEntry fields + ManagerAssessmentForm).

**Suggested implementation order:** Task 1 → Task 2 → Task 3 → Task 4

---

## Definition of Done

- [ ] All 4 tasks committed
- [ ] `pnpm test` passes (88+ tests)
- [ ] `tsc --noEmit` no new errors (pre-existing chat-message.tsx error is acceptable)
- [ ] Spec compliance review: ✅
- [ ] Code quality review: ✅
- [ ] PR opened and merged
