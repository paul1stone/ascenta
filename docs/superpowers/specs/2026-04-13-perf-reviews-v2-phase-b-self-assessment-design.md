# Performance Reviews v2 — Phase B: Employee Self-Assessment UI Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Builds on:** Phase A (86fea34) — schema, constants, API routes
**Next phases:** Phase C (Manager assessment UI), Phase D (Reflect + Ack), Phase E (Dev plan)

---

## Context

Phase A added the data layer. Phase B surfaces it to employees — a form where they rate themselves across all 10 competency categories, add notes and examples, and submit before the manager can begin their own assessment.

The existing `ReviewsPanel` is manager-facing. Phase B adds a parallel employee-facing surface on the same `/grow/performance` page, gated by `user.role`.

---

## Design

### Role-based rendering on `/grow/performance`

The performance page currently renders `<ReviewsPanel>` unconditionally. Phase B adds conditional rendering:

- `user.role === "employee"` → show `<SelfAssessmentPanel>` (new)
- `user.role === "manager"` or `"hr"` → show existing `<ReviewsPanel>` (unchanged)

This is a single `if/else` in the page component — no shared component changes needed.

### SelfAssessmentPanel

New component: `apps/platform/src/components/grow/performance-reviews/self-assessment-panel.tsx`

Responsibilities:
- Fetches reviews assigned to the current employee via `GET /api/grow/reviews?employeeObjectId={user.id}`
- Shows a list of reviews with status badges (self-assessment status, not overall status)
- "Start" / "Continue" button per review opens the inline `SelfAssessmentForm` (replaces list view)
- Back button returns to the list

State:
```typescript
type PanelView = "list" | "form";
const [view, setPanelView] = useState<PanelView>("list");
const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
```

Status badge mapping for self-assessment status:
- `not_started` → orange "Not Started"
- `in_progress` → teal "In Progress"
- `submitted` → blue "Submitted" (read-only, no action button)

### SelfAssessmentForm

New component: `apps/platform/src/components/grow/performance-reviews/self-assessment-form.tsx`

Props:
```typescript
interface SelfAssessmentFormProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  initialSections: CategorySectionValue[];
  initialStatus: SelfAssessmentStatus;
  accentColor: string;
  onBack: () => void;
  onSubmitted: () => void;
}

interface CategorySectionValue {
  categoryKey: ReviewCategoryKey;
  rating: number | null;
  notes: string;
  examples: string;
}
```

**No react-hook-form** — the 10-category structure is better managed with plain `useState` (array of section values indexed by category key). react-hook-form's `useFieldArray` adds complexity without benefit here since sections are a fixed, known set.

**Auto-save behavior:**
- On `rating` change: immediate PATCH `selfAssessment.sections` (status auto-advances to `in_progress` via `deriveReviewStatus` if currently `not_started`)
- On text field blur: PATCH `selfAssessment.sections`
- Debounce: 500ms for text fields only
- No explicit "save" button — saving is automatic

**Submit behavior:**
- "Submit Self-Assessment" button at the bottom
- PATCH `{ selfAssessment: { status: "submitted" } }`
- On success: call `onSubmitted()` → panel returns to list view with updated status

**Read-only when submitted:**
- If `initialStatus === "submitted"`, all fields are disabled, submit button replaced by "Submitted ✓" badge

**Layout — `CategorySectionCard` sub-component:**

New component: `apps/platform/src/components/grow/performance-reviews/category-section-card.tsx`

Per category:
```
┌─────────────────────────────────────────────────────┐
│ [Number] Category Label                   [Required] │
│ Definition text (muted, smaller)                     │
├─────────────────────────────────────────────────────┤
│ Guided prompts (italicized, muted)                   │
│ • "Does the employee..."                             │
├─────────────────────────────────────────────────────┤
│ Rating                                               │
│ [Improvement Needed] [1] [2] [3] [4] [5] [Exceptional] │
│ (reuses LikertScale — low/high labels from RATING_SCALE)│
├─────────────────────────────────────────────────────┤
│ Notes (textarea, placeholder: "Describe your...")    │
│ Examples (textarea, placeholder: "Specific examples")│
└─────────────────────────────────────────────────────┘
```

Uses `LikertScale` from `@/components/grow/check-in/likert-scale.tsx` with:
- `lowLabel="Improvement Needed"` (rating 1–2 band)
- `highLabel="Exceptional"` (rating 5)

All data from `REVIEW_CATEGORIES[key]` — label, definition, guidedPrompts.

### API change: GET /api/grow/reviews — add employeeObjectId filter

Existing route requires `?managerId=X` (employee string ID). Phase B adds:
- `?employeeObjectId=X` — MongoDB ObjectId string — returns reviews where `employee` field matches

Response shape for employee view (simpler than manager view):
```json
{
  "success": true,
  "reviews": [
    {
      "id": "...",
      "employeeName": "...",
      "reviewPeriod": "Q2 2026",
      "selfAssessmentStatus": "in_progress",
      "reviewType": "annual"
    }
  ]
}
```

Note: `managerId` remains required for the manager view; `employeeObjectId` is an alternative path. Both cannot be used together; route returns 400 if neither is provided.

---

## File Map

| Action | File |
|--------|------|
| Create | `apps/platform/src/components/grow/performance-reviews/self-assessment-panel.tsx` |
| Create | `apps/platform/src/components/grow/performance-reviews/self-assessment-form.tsx` |
| Create | `apps/platform/src/components/grow/performance-reviews/category-section-card.tsx` |
| Modify | `apps/platform/src/app/[category]/[sub]/page.tsx` — role-based render |
| Modify | `apps/platform/src/app/api/grow/reviews/route.ts` — add employeeObjectId filter |

---

## Out of Scope for Phase B

- Evidence linking (goals/check-ins surfaced into sections) — Phase C
- Manager can-see-employee self-assessment view — Phase C
- Email notification when self-assessment submitted — Phase F
- Guided prompt expansion/collapse animation — UX polish
- Category-level validation requiring all 10 rated before submit — not in reqs; partial submission allowed

---

## Acceptance Criteria

- [ ] Employee role sees `SelfAssessmentPanel`; manager/hr role sees existing `ReviewsPanel`
- [ ] `GET /api/grow/reviews?employeeObjectId=X` returns reviews assigned to that employee
- [ ] `SelfAssessmentPanel` lists the employee's reviews with self-assessment status badges
- [ ] Clicking "Start" / "Continue" opens `SelfAssessmentForm` inline (not modal, not working-doc)
- [ ] Form shows all 10 categories with LikertScale + notes + examples per category
- [ ] Rating change auto-saves immediately; text fields auto-save on blur (500ms debounce)
- [ ] "Submit Self-Assessment" PATCH sets `selfAssessment.status: "submitted"`, panel returns to list
- [ ] Submitted reviews render in read-only mode
- [ ] `pnpm test` passes; `tsc --noEmit` no new errors
