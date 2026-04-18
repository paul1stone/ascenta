# Performance Reviews v2 — Phase D Design Spec

**Date:** 2026-04-17
**Status:** Draft
**Builds on:** Phase C (f08902e) — manager assessment UI
**Branch:** `feat/perf-reviews-v2-phase-d`

---

## Context

Phase C delivers the manager's 10-category assessment form with auto-save and a self-assessment reference panel. Phase D closes the review lifecycle with three features: (1) a development plan form the manager must complete before finalizing, (2) evidence surfacing inside the manager assessment so managers can tag supporting goals/check-ins/notes per category, and (3) an employee acknowledgment UI where the employee views a side-by-side comparison and signs off.

---

## Goals

- Give managers a structured development plan form gated on manager assessment submission
- Prevent finalization until the development plan is complete (`developmentPlan.status === "finalized"`)
- Surface contextual evidence (goals, check-ins, performance notes) per assessment category so managers can ground ratings in data
- Let employees view the completed review side-by-side and sign off, advancing status to `acknowledged`

## Non-Goals

- Email/notification to employee when the review is ready — out of scope for Phase D
- Email/notification to manager when employee acknowledges — out of scope for Phase D
- PDF export — out of scope for Phase D
- AI-generated narrative or summary text — out of scope for Phase D
- Admin override / HR calibration flow — out of scope for Phase D

---

## Data Model

### No new schema changes required

All fields needed for Phase D already exist:

| Field | Location | Notes |
|---|---|---|
| `developmentPlan.status` | `DEVELOPMENT_PLAN_STATUSES` enum: `not_started`, `draft`, `finalized` | Already in schema and Zod validation |
| `developmentPlan.areasOfImprovement[]` | `{ area, actions[], timeline, owner }` | Already in schema |
| `developmentPlan.managerCommitments[]` | `string[]` | Already in schema |
| `developmentPlan.nextReviewDate` | `Date` | Already in schema |
| `managerAssessment.sections[].evidence[]` | `{ type, refId, label }` | Already in schema and Zod |
| `status: "acknowledged"` | `REVIEW_STATUSES` | Already in enum |

### Status lifecycle

The `deriveReviewStatus` function in `lib/review-transitions.ts` currently handles transitions through `draft_complete`. Phase D adds two additional transitions that are set **explicitly** (not derived), consistent with how `finalized` already works:

```
not_started
  → self_in_progress      (employee starts self-assessment)
  → self_submitted        (employee submits)
  → manager_in_progress   (manager begins assessment)
  → draft_complete        (manager submits assessment)
  → finalized             [NEW gate] set explicitly when dev plan status → "finalized"
  → acknowledged          [NEW] set explicitly when employee signs off
```

`draft_complete` is already a terminal status in `deriveReviewStatus` (it stops auto-derive). The PATCH handler respects explicit `status` writes, so the finalize and acknowledge transitions just need to call PATCH with `{ status: "finalized" }` and `{ status: "acknowledged" }` respectively. No changes to `deriveReviewStatus` are needed.

### `REVIEW_STATUS_LABELS` addition

Add label for completeness (already has `"acknowledged": "Acknowledged"` — confirmed present).

---

## API

### Existing endpoints (no new routes needed)

**`GET /api/grow/reviews?employeeObjectId={objectId}`** — already works for the employee acknowledgment view. Returns `{ id, reviewPeriod, reviewType, selfAssessmentStatus }` per review. Needs one addition: return `status` (overall) so the employee panel knows when a review is `finalized` and ready to acknowledge.

**`GET /api/grow/reviews/[id]`** — returns the full review document including both assessment sections, `developmentPlan`, and employee/manager refs. Used by the acknowledgment UI and the dev plan form.

**`PATCH /api/grow/reviews/[id]`** — already handles `developmentPlan`, `managerAssessment.sections` (for evidence writes), and explicit `status` overrides. No structural changes needed.

### Small extension: employee list response

In `GET /api/grow/reviews` (the `employeeObjectId` branch, ~line 28), add `status` to each entry:

```typescript
status: (r.status as string) ?? "not_started",
```

This lets `SelfAssessmentPanel` (repurposed as `EmployeeReviewPanel`) know which reviews are `finalized` and show the "View & Sign Off" action.

### Evidence fetch endpoint (new)

**`GET /api/grow/reviews/[id]/evidence`**

Returns goals, check-ins, and performance notes for the review's employee scoped to the review period. One endpoint, no N+1.

Response shape:
```typescript
{
  goals: Array<{ id: string; title: string; category: string; status: string }>;
  checkIns: Array<{ id: string; completedAt: string | null; managerNotes: string; employeeNotes: string }>;
  notes: Array<{ id: string; type: string; observation: string; createdAt: string }>;
}
```

Query logic (all in one handler, three parallel `find` calls):
- Goals: `Goal.find({ owner: review.employee, "timePeriod.end": { $gte: review.reviewPeriod.start }, "timePeriod.start": { $lte: review.reviewPeriod.end } })` — select `_id, objectiveStatement, goalType, status`
- Check-ins: `CheckIn.find({ employee: review.employee, scheduledDate: { $gte: review.reviewPeriod.start, $lte: review.reviewPeriod.end } })` — select `_id, participate.completedAt, participate.managerCommitment, participate.employeeCommitment`
- Notes: `PerformanceNote.find({ employee: review.employee, createdAt: { $gte: review.reviewPeriod.start, $lte: review.reviewPeriod.end } })` — select `_id, type, observation, createdAt`

Use `Promise.all([...])` — no N+1.

**Auth convention:** No auth layer. Trust the request. The `reviewId` param already scopes the employee; no additional guard needed. Matches existing convention.

### Finalize gate enforcement

When the manager clicks "Finalize Review," the UI sends:
```
PATCH /api/grow/reviews/[id]  { status: "finalized" }
```

The existing PATCH handler accepts explicit `status` writes. However, it does not currently validate that `developmentPlan.status === "finalized"` before allowing a transition to `"finalized"`. Add a guard in the PATCH handler:

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

### Acknowledge transition

Employee sends:
```
PATCH /api/grow/reviews/[id]  { status: "acknowledged" }
```

Add a guard: only allow this transition if the review's current status is `"finalized"`:

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

No employee identity verification beyond trusting the `employeeObjectId` passed by the UI (matches existing self-assessment convention; no auth layer in app).

---

## UI Flows

### Feature 1: Development Plan Form

**Entry point — ReviewsPanel**

When `review.status === "draft_complete"` and `review.reviewId` is set, show a "Complete Dev Plan" button in the action column. Clicking it sets `activePlanReviewId`, which swaps the panel to render `<DevelopmentPlanForm>`.

When `developmentPlan.status === "draft"` (started but not finalized), show a "Continue Dev Plan" button.

When `developmentPlan.status === "finalized"`, show a "Finalize Review" button that sends `PATCH { status: "finalized" }`. On success, refresh the list.

**DevelopmentPlanForm component**

New file: `apps/platform/src/components/grow/performance-reviews/development-plan-form.tsx`

Props:
```typescript
interface DevelopmentPlanFormProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  accentColor: string;
  onBack: () => void;
  onFinalized: () => void;
}
```

Data fetch on mount: `GET /api/grow/reviews/${reviewId}` — loads `developmentPlan` and `managerAssessment.status`.

Layout:
```
┌──────────────────────────────────────────────┐
│ ← Back    Development Plan   [Auto-saving…]  │
│ Employee Name · Review Period                │
├──────────────────────────────────────────────┤
│ Areas of Improvement                         │
│ [+ Add area]                                 │
│ Each area row:                               │
│   Area (text input)                          │
│   Actions (textarea, line-per-item)          │
│   Timeline (text input)                      │
│   Owner (text input)                         │
│   [Remove]                                   │
├──────────────────────────────────────────────┤
│ Manager Commitments                          │
│ [textarea — one per line, split on save]     │
├──────────────────────────────────────────────┤
│ Next Review Date                             │
│ [date input]                                 │
├──────────────────────────────────────────────┤
│                     [Finalize Dev Plan →]    │
└──────────────────────────────────────────────┘
```

Auto-save behavior (matching existing forms):
- Text field `onBlur` → 500ms debounced PATCH `{ developmentPlan: { status: "draft", areasOfImprovement, managerCommitments, nextReviewDate } }`
- First save advances `developmentPlan.status` to `"draft"` (via `hasFirstSavedRef`)
- `sectionsRef` equivalent: `planRef` holds current form state for race-free saves

"Finalize Dev Plan" button:
- PATCH `{ developmentPlan: { status: "finalized", ... all fields } }`
- On success: call `onFinalized()` → ReviewsPanel refreshes + returns to list and shows the "Finalize Review" button for that row

Read-only when `developmentPlan.status === "finalized"`: all inputs disabled, button replaced with "Dev Plan Finalized ✓"

Completeness warning: warn (don't block) if no areas of improvement are entered.

---

### Feature 2: Evidence Sidebar

**Integration point:** `manager-assessment-form.tsx` and `category-section-card.tsx`

On mount of `ManagerAssessmentForm`, fetch `GET /api/grow/reviews/${reviewId}/evidence` in parallel with the existing review fetch. Store result in `evidenceData` state.

Pass `evidenceData` and a per-category `onEvidenceChange` handler down to each `CategorySectionCard`.

**CategorySectionCard changes**

Add optional props:
```typescript
evidenceItems?: EvidenceItem[];       // all available items (goals + check-ins + notes)
selectedEvidence?: EvidenceRef[];     // current section's evidence[] from DB
onEvidenceChange?: (refs: EvidenceRef[]) => void;
```

Where:
```typescript
interface EvidenceItem {
  id: string;
  kind: "goal" | "checkin" | "note";
  label: string;         // human-readable: goal title, check-in date, note type + snippet
}
interface EvidenceRef {
  type: "goal" | "checkin" | "note" | "other";
  refId: string;
  label: string;
}
```

Render a collapsible "Supporting Evidence" section at the bottom of each card (below the examples textarea). Uses a `<details>` or a state-toggled div. When collapsed, show a count badge: "2 items tagged" or "Tag evidence →" if none.

When expanded:
```
Supporting Evidence
───────────────────────────────────────
Goals
  ☐ Improve customer response time (active)
  ☑ Q1 OKR — reduce incidents (achieved)
Check-ins
  ☐ 2026-03-15 check-in
Notes
  ☑ Coaching: exceeded SLA targets on 3 occasions
```

Checkbox toggle calls `onEvidenceChange` with the updated `EvidenceRef[]`. Parent saves immediately (no debounce needed — it's a checkbox, not a text field). Save PATCH writes the full sections array as usual; the evidence array is embedded in the section.

Idempotency: Evidence refs are matched by `refId`. Toggle adds or removes by `refId` — no duplicates. The full sections array replaces the DB value on each save (same as notes/rating saves).

Do not show the evidence sidebar when `disabled` (submitted state). When disabled and evidence refs exist, show them read-only as a flat list.

---

### Feature 3: Employee Acknowledgment UI

**Entry point: SelfAssessmentPanel → EmployeeReviewPanel**

`SelfAssessmentPanel` currently shows only `selfAssessmentStatus`. Extend it to also show the overall `status` and handle the `finalized` / `acknowledged` states.

The `GET /api/grow/reviews?employeeObjectId=X` response needs `status` added (per API section above). `ReviewSummary` interface gains:
```typescript
status: string;
```

New action logic per review row:
- `selfAssessmentStatus !== "submitted"` → existing "Start" / "Continue" / "View" button for the self-assessment
- `status === "finalized"` → "View & Sign Off" button → opens `AcknowledgmentView`
- `status === "acknowledged"` → "Acknowledged ✓" indicator (no action)

**AcknowledgmentView component**

New file: `apps/platform/src/components/grow/performance-reviews/acknowledgment-view.tsx`

Props:
```typescript
interface AcknowledgmentViewProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  accentColor: string;
  onBack: () => void;
  onAcknowledged: () => void;
}
```

Data fetch on mount: `GET /api/grow/reviews/${reviewId}` — loads both `selfAssessment.sections` and `managerAssessment.sections`.

Layout — side-by-side comparison:
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back             Performance Review — Q1 2026             │
│                                                             │
│  Your Self-Assessment          Manager's Assessment         │
│  ─────────────────────         ─────────────────────────    │
│  [For each of 10 categories]                                │
│  ┌───────────────────────┐    ┌────────────────────────┐   │
│  │ 1. Job Knowledge      │    │ 1. Job Knowledge        │   │
│  │ Rating: 3 — Meets     │    │ Rating: 4 — Exceeds     │   │
│  │ Notes: "..."          │    │ Notes: "..."            │   │
│  └───────────────────────┘    └────────────────────────┘   │
│  ...                          ...                           │
├─────────────────────────────────────────────────────────────┤
│  Development Plan                                           │
│  Areas of Improvement: [...]                                │
│  Manager Commitments: [...]                                 │
│  Next Review: [date]                                        │
├─────────────────────────────────────────────────────────────┤
│  [I have reviewed this assessment and acknowledge receipt]  │
│                                           [Sign Off →]     │
└─────────────────────────────────────────────────────────────┘
```

The comparison renders a `ComparisonSectionCard` subcomponent (or inline) per category: category label, then two columns — employee rating + notes (left, read-only) and manager rating + notes (right, read-only). Development plan shown below as a read-only summary block.

"Sign Off" button:
- PATCH `{ status: "acknowledged" }`
- On success: call `onAcknowledged()` → panel refreshes + returns to list, row shows "Acknowledged ✓"

No auto-save. Entirely read-only except for the final sign-off action.

---

## File Map

| Action | File |
|---|---|
| Modify | `apps/platform/src/app/api/grow/reviews/route.ts` — add `status` to employee view response |
| Modify | `apps/platform/src/app/api/grow/reviews/[id]/route.ts` — add finalize gate + acknowledge gate to PATCH |
| Create | `apps/platform/src/app/api/grow/reviews/[id]/evidence/route.ts` — evidence fetch endpoint |
| Modify | `apps/platform/src/components/grow/performance-reviews/category-section-card.tsx` — add evidence sidebar props + UI |
| Modify | `apps/platform/src/components/grow/performance-reviews/manager-assessment-form.tsx` — fetch evidence, pass to cards, handle evidence saves |
| Create | `apps/platform/src/components/grow/performance-reviews/development-plan-form.tsx` |
| Create | `apps/platform/src/components/grow/performance-reviews/acknowledgment-view.tsx` |
| Modify | `apps/platform/src/components/grow/performance-reviews/self-assessment-panel.tsx` — add `status` field, `finalized`/`acknowledged` row states, "View & Sign Off" action |
| Modify | `apps/platform/src/components/grow/reviews-panel.tsx` — add "Complete Dev Plan", "Continue Dev Plan", "Finalize Review" actions + `DevelopmentPlanForm` panel swap |

---

## Acceptance Criteria

### Feature 1 — Development Plan Form

- [ ] `ReviewsPanel` shows "Complete Dev Plan" for `draft_complete` rows; "Continue Dev Plan" for rows where `developmentPlan.status === "draft"`
- [ ] Clicking either opens `DevelopmentPlanForm` inline (same panel swap pattern)
- [ ] Form auto-saves on blur; first save advances `developmentPlan.status` to `"draft"`
- [ ] "Finalize Dev Plan" sets `developmentPlan.status: "finalized"`, returns to list
- [ ] After dev plan finalized, "Finalize Review" button appears; clicking sends `PATCH { status: "finalized" }`
- [ ] PATCH handler returns 422 if `status: "finalized"` is requested but `developmentPlan.status !== "finalized"`
- [ ] Dev plan form renders read-only when `developmentPlan.status === "finalized"`

### Feature 2 — Evidence Sidebar

- [ ] `GET /api/grow/reviews/[id]/evidence` returns goals, check-ins, and performance notes for the employee/period in a single request
- [ ] Evidence sidebar renders as collapsible within each `CategorySectionCard` when `evidenceItems` prop is provided
- [ ] Checking an item adds it to `evidence[]` and saves immediately via PATCH
- [ ] Unchecking removes it; no duplicates by `refId`
- [ ] Evidence sidebar is hidden / read-only when the manager assessment is in submitted state
- [ ] If no evidence items exist for the review period, sidebar shows "No linked items found" (not an error)

### Feature 3 — Employee Acknowledgment

- [ ] `GET /api/grow/reviews?employeeObjectId=X` response includes `status` per review entry
- [ ] `SelfAssessmentPanel` shows "View & Sign Off" for `status === "finalized"` rows
- [ ] `AcknowledgmentView` loads both self-assessment and manager sections side-by-side in read-only mode
- [ ] Development plan section shown read-only below the comparison
- [ ] "Sign Off" sends `PATCH { status: "acknowledged" }` and transitions the review to `acknowledged`
- [ ] PATCH handler returns 422 if `status: "acknowledged"` is requested but current status is not `"finalized"`
- [ ] After sign-off, row shows "Acknowledged ✓" state in `SelfAssessmentPanel`
- [ ] `pnpm test` passes; `tsc --noEmit` no new errors

---

## Out of Scope

- Email notifications of any kind (finalized → employee, acknowledged → manager)
- AI-generated development plan suggestions
- PDF export of the completed review
- Multi-reviewer calibration or override flows
- Manager editing the review after employee acknowledgment
