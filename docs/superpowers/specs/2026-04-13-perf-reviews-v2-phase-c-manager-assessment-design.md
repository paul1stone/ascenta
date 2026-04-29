# Performance Reviews v2 — Phase C: Manager Assessment UI Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Builds on:** Phase B (a947f03) — employee self-assessment UI
**Next phases:** Phase D (Reflect + Ack), Phase E (Dev plan)

---

## Context

Phase B surfaces the employee self-assessment form. Phase C surfaces the manager's parallel assessment. The manager sees the employee's submitted self-assessment as a read-only reference while filling in their own ratings across the same 10 competency categories.

The hard gate (employee must submit before manager can begin) is already enforced in `PATCH /api/grow/reviews/[id]` via `canManagerAssess`.

---

## Design

### Entry Point: ReviewsPanel

`ReviewsPanel` (`apps/platform/src/components/grow/reviews-panel.tsx`) is the manager-facing panel. It shows a table of direct reports and their review statuses.

**What changes:**
- `ReviewEntry` interface gains `selfAssessmentStatus` and `managerAssessmentStatus` fields
- Two new action buttons appear in the table:
  - `status === "self_submitted"` → "Begin Assessment" button (opens `ManagerAssessmentForm` inline)
  - `status === "manager_in_progress"` → "Continue Assessment" button (opens `ManagerAssessmentForm` inline)
- When `activeAssessmentReviewId` is set, the panel swaps to render `<ManagerAssessmentForm>` instead of the stats + table view (same pattern as `SelfAssessmentPanel`)
- Existing "Start Review" (via chat) and "Continue" (via chat) buttons remain for `not_started` / `in_progress` / `draft_complete` statuses

### API change: GET /api/grow/reviews — add selfAssessmentStatus + managerAssessmentStatus to manager view

The manager view (`?managerId=X`) currently returns `status` (overall) but not the sub-statuses. Add:
- `selfAssessmentStatus: (review.selfAssessment?.status ?? "not_started")`
- `managerAssessmentStatus: (review.managerAssessment?.status ?? "not_started")`

### ManagerAssessmentForm

New component: `apps/platform/src/components/grow/performance-reviews/manager-assessment-form.tsx`

Props:
```typescript
interface ManagerAssessmentFormProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  initialStatus: SelfAssessmentStatus;  // manager's own assessment status
  accentColor: string;
  onBack: () => void;
  onSubmitted: () => void;
}
```

**Data fetching on mount:**
- Fetch `GET /api/grow/reviews/${reviewId}` to get:
  - `review.selfAssessment.sections` — employee's sections (read-only reference)
  - `review.managerAssessment.sections` — manager's existing sections (editable)
  - `review.managerAssessment.status` — to initialize `submitted` state
- Show loading spinner while fetching

**Layout per category — employee reference + manager input:**

```
┌─────────────────────────────────────────────────────────────┐
│ [N] Category Label                              [Required]   │
│ Definition text (muted)                                      │
├─────────────────────────────────────────────────────────────┤
│ Employee's Self-Assessment                                   │
│ Rating: [●●●○○] (stars/dots, read-only — employee gave 3)   │
│ Notes: "..." (read-only, collapsed if empty)                 │
├─────────────────────────────────────────────────────────────┤
│ Guided prompts (italic bullets)                              │
├─────────────────────────────────────────────────────────────┤
│ Your Rating                                                  │
│ [Improvement Needed] [1] [2] [3] [4] [5] [Exceptional]     │
├─────────────────────────────────────────────────────────────┤
│ Notes (textarea)                                             │
│ Examples (textarea)                                          │
└─────────────────────────────────────────────────────────────┘
```

**Employee reference display:**
- Show employee's rating as a read-only value: e.g., "Self-assessment: 3 — Meets Expectations"
- Show employee's notes text if non-empty (truncated, read-only `<p>`)
- Employee examples not shown (keep reference lightweight)
- Styled with muted colors, clearly labeled "Employee's self-assessment" 

**CategorySectionCard changes:**
- Add optional `employeeRating?: number | null` and `employeeNotes?: string` props
- When provided, render the employee reference block above the guided prompts
- Existing behavior unchanged when props are omitted (self-assessment form still works)

**Auto-save behavior:** Same as `SelfAssessmentForm`:
- Rating change → immediate PATCH `managerAssessment.sections` (+ `status: "in_progress"` on first save)
- Text field blur → 500ms debounced PATCH `managerAssessment.sections`
- `sectionsRef` + `debounceRef` pattern for race-free saves

**Submit behavior:**
- "Submit Manager Assessment" button
- PATCH `{ managerAssessment: { status: "submitted", sections } }`
- On success: call `onSubmitted()` → ReviewsPanel refreshes + returns to list

**Read-only when submitted:**
- If `initialStatus === "submitted"`, all manager fields are disabled
- Submit button replaced by "Submitted ✓" indicator

**Completeness warning:**
- Same pattern as SelfAssessmentForm: warn (don't block) if any categories unrated

---

## File Map

| Action | File |
|--------|------|
| Modify | `apps/platform/src/app/api/grow/reviews/route.ts` — add selfAssessmentStatus + managerAssessmentStatus to manager view |
| Modify | `apps/platform/src/components/grow/reviews-panel.tsx` — add assessment buttons + inline swap |
| Modify | `apps/platform/src/components/grow/performance-reviews/category-section-card.tsx` — add optional employeeRating + employeeNotes props |
| Create | `apps/platform/src/components/grow/performance-reviews/manager-assessment-form.tsx` |

---

## Out of Scope for Phase C

- AI-generated narrative review language — Phase D
- Side-by-side full comparison view — Phase D (Reflect)
- Manager calibration/alignment scores — analytics
- Email notification to manager when employee submits — Phase F
- PDF export showing both assessments — Phase D/E

---

## Acceptance Criteria

- [ ] Manager/hr role sees `ReviewsPanel` with "Begin Assessment" button on `self_submitted` rows
- [ ] Clicking "Begin Assessment" opens `ManagerAssessmentForm` inline (same panel swap pattern)
- [ ] `GET /api/grow/reviews?managerId=X` response includes `selfAssessmentStatus` and `managerAssessmentStatus` per entry
- [ ] `ManagerAssessmentForm` fetches the full review on mount, shows employee's self-assessment ratings as read-only reference
- [ ] Manager can fill in their own rating + notes + examples per category
- [ ] Rating change auto-saves immediately; text fields auto-save on blur (500ms debounce)
- [ ] Status advances to `manager_in_progress` on first manager save
- [ ] "Submit Manager Assessment" PATCH sets `managerAssessment.status: "submitted"`, panel returns to list
- [ ] Submitted manager assessments render in read-only mode
- [ ] "Continue Assessment" button on `manager_in_progress` rows restores prior manager work
- [ ] `pnpm test` passes; `tsc --noEmit` no new errors
