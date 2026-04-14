# Performance Reviews v2 — Phase A: Foundation Refactor Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Builds on:** `2026-04-03-performance-reviews-design.md` (v1, shipped)
**Next phases:** Phase B (Employee self-assessment UI), Phase C (Manager assessment UI), Phase D (Reflect + Ack), Phase E (Dev plan), Phase F (Cycles + cadence), Phase G (Analytics)

---

## Context

v1 performance reviews shipped as a manager-driven, free-text flow. The new reqs (`docs/reqs/perf-reviews.md`) require a structured, two-party process with 10 competency categories, anchored ratings, a hard gate requiring employee self-assessment before manager can begin, and HR-configured review cycles.

Phase A adds the **data layer** for all of this. No UI changes. All new fields are additive — existing review records remain valid.

---

## Decomposition Rationale

The full reqs are too large for a single spec/plan. Phases in order:

| Phase | Scope |
|-------|-------|
| **A — Foundation (this spec)** | Schema expansion, ReviewCycle entity, constants, API guards |
| B — Self-assessment UI | Employee-facing form, submission, status machine |
| C — Manager assessment UI | Gated manager form, evidence surfacing, anchored rating inputs |
| D — Reflect + Acknowledgment | Side-by-side comparison view, employee signature |
| E — Development plan | Mandatory dev plan editor, goal carry-forward |
| F — Cycles + cadence | HR configuration UI, 90-day new hire variant, no-lapse guardrail |
| G — Analytics | Category averages, alignment gaps, capability trends |

---

## Design

### Approach: Embedded two-party subdocuments

Two top-level subdocuments on `PerformanceReview`: `selfAssessment` and `managerAssessment`. Each holds an array of `CategorySection` objects (one per category). This makes the hard gate (`managerAssessment` blocked until `selfAssessment.status === "submitted"`) a trivial single-field check, and keeps all review data in one document for simple queries.

Alternative considered: separate `ReviewCategoryRating` collection (rejected — joins everywhere, premature for current analytics scope).

---

## Data Model

### New collection: `ReviewCycle`

HR-configured review periods. Links to one or more `PerformanceReview` records.

| Field | Type | Notes |
|-------|------|-------|
| `orgId` | string | defaults to `"default"` — future multi-tenancy hook |
| `label` | string | e.g., "Annual 2026", "Mid-Year Q2 2026" |
| `type` | enum | `annual \| mid_year \| ninety_day \| custom` |
| `periodStart` | Date | Review period start |
| `periodEnd` | Date | Review period end |
| `selfAssessmentDeadline` | Date | When self-assessments must be submitted |
| `managerDeadline` | Date | When manager assessments must be finalized |
| `participantEmployeeIds` | ObjectId[] | Employees included in this cycle |
| `status` | enum | `draft \| open \| closed` |
| timestamps | auto | createdAt, updatedAt |

**Indexes:** `{ orgId, status }`, `{ type, periodEnd }`

---

### `CategorySection` subdocument

Shared structure used in both `selfAssessment.sections[]` and `managerAssessment.sections[]`.

| Field | Type | Notes |
|-------|------|-------|
| `categoryKey` | enum | One of 10 keys (see constants) |
| `rating` | number \| null | 1–5 anchored scale, null = not yet rated |
| `notes` | string | Narrative response to guided prompts |
| `examples` | string | Specific behavioral examples from the period |
| `evidence` | array | `[{ type: "goal"\|"checkin"\|"note"\|"other", refId: ObjectId, label: string }]` |

---

### Expanded: `PerformanceReview`

All existing v1 fields kept unchanged. Additive only.

**New fields:**

| Field | Type | Notes |
|-------|------|-------|
| `reviewCycleId` | ObjectId ref ReviewCycle \| null | null = standalone review |
| `reviewType` | enum | `annual \| mid_year \| ninety_day \| custom`, default `custom` |
| `selfAssessment` | subdoc | See below |
| `managerAssessment` | subdoc | See below |
| `developmentPlan` | subdoc | See below |

**`selfAssessment` subdoc:**

| Field | Type | Default |
|-------|------|---------|
| `status` | enum `not_started\|in_progress\|submitted` | `not_started` |
| `submittedAt` | Date \| null | null |
| `sections` | CategorySection[] | `[]` |

**`managerAssessment` subdoc:**

| Field | Type | Default |
|-------|------|---------|
| `status` | enum `not_started\|in_progress\|submitted` | `not_started` |
| `submittedAt` | Date \| null | null |
| `blockedUntilSelfSubmitted` | boolean | `true` |
| `sections` | CategorySection[] | `[]` |

**`developmentPlan` subdoc:**

| Field | Type | Default |
|-------|------|---------|
| `status` | enum `not_started\|draft\|finalized` | `not_started` |
| `areasOfImprovement` | array `[{ area: string, actions: string[], timeline: string, owner: string }]` | `[]` |
| `managerCommitments` | string[] | `[]` |
| `nextReviewDate` | Date \| null | null |

**Expanded `status` enum** (replaces v1 enum):

```
not_started → self_in_progress → self_submitted → manager_in_progress
→ draft_complete → finalized → acknowledged
```

Old values `in_progress` and `shared` are kept in the enum for backward compatibility with existing records. New records use the expanded set.

**New indexes:** `{ reviewCycleId, status }`, `{ reviewType, "reviewPeriod.end" }`

---

## Constants Package

New file: `packages/db/src/performance-review-categories.ts`

Client-safe (no mongoose). Exports:

### `REVIEW_CATEGORIES`

Record of 10 category definitions:

```typescript
export const REVIEW_CATEGORIES: Record<ReviewCategoryKey, ReviewCategory> = {
  job_knowledge: {
    key: "job_knowledge",
    label: "Job Knowledge and Technical Competence",
    definition: "Ability to perform the role effectively using relevant skills, systems, and professional expertise.",
    subcategories: ["Technical skills", "Industry knowledge", "Tools/systems/technology", "Application of expertise", "Accuracy of work product"],
    competencies: ["Demonstrates strong understanding of job responsibilities", "Maintains knowledge of relevant tools and processes", "Applies technical skills effectively in daily work", "Maintains awareness of industry standards", "Uses technology and systems effectively"],
    guidedPrompts: ["Does the employee understand the role and responsibilities?", "Do they use required tools correctly?", "Do they apply expertise to solve problems?"],
  },
  quality_of_work: { ... },
  productivity: { ... },
  communication: { ... },
  collaboration: { ... },
  initiative: { ... },
  professionalism: { ... },
  leadership: { ... },
  learning_development: { ... },
  culture_values: { ... },
};
```

### `RATING_SCALE`

```typescript
export const RATING_SCALE: Record<1|2|3|4|5, { label: string; description: string }> = {
  1: { label: "Improvement Needed", description: "Performance does not consistently meet expectations; requires significant development." },
  2: { label: "Developing", description: "Partially meets expectations; developing toward full competency." },
  3: { label: "Meets Expectations", description: "Consistently meets role expectations; reliable, competent performance." },
  4: { label: "Exceeds Expectations", description: "Regularly exceeds expectations; notable contributions beyond the role." },
  5: { label: "Exceptional", description: "Consistently exceptional; recognized impact beyond immediate role." },
};
```

### Other exports

```typescript
export const REVIEW_CATEGORY_KEYS = [...] as const  // 10 keys
export type ReviewCategoryKey = typeof REVIEW_CATEGORY_KEYS[number]
export const REVIEW_TYPES = ["annual", "mid_year", "ninety_day", "custom"] as const
export const CYCLE_STATUSES = ["draft", "open", "closed"] as const
export const SELF_ASSESSMENT_STATUSES = ["not_started", "in_progress", "submitted"] as const
export const MANAGER_ASSESSMENT_STATUSES = ["not_started", "in_progress", "submitted"] as const
export const DEVELOPMENT_PLAN_STATUSES = ["not_started", "draft", "finalized"] as const
```

---

## API Routes

### New: `GET /api/grow/review-cycles`

Query: `?status=open&type=annual`
Returns list of cycles for the current org.

### New: `POST /api/grow/review-cycles`

Body: `{ label, type, periodStart, periodEnd, selfAssessmentDeadline, managerDeadline, participantEmployeeIds }`
Creates cycle with `status: "draft"`.

### New: `GET /api/grow/review-cycles/[id]`

Returns single cycle with participant count.

### New: `PATCH /api/grow/review-cycles/[id]`

Accepts any cycle field. If `status` changes to `"open"`, triggers (future) participant notifications.

### Modified: `PATCH /api/grow/reviews/[id]`

**New body fields accepted:**
- `reviewCycleId`
- `reviewType`
- `selfAssessment` (partial — status, sections array patch)
- `managerAssessment` (partial — status, sections array patch)
- `developmentPlan` (partial)

**New guard:**
```
if body contains managerAssessment data
  AND review.managerAssessment.blockedUntilSelfSubmitted === true
  AND review.selfAssessment.status !== "submitted"
→ 403: "Self-assessment must be submitted before manager assessment can begin"
```

**Status auto-advance logic:**
- When first `selfAssessment.sections` entry is saved (and `selfAssessment.status === "not_started"`) → set `selfAssessment.status: "in_progress"` and `review.status: "self_in_progress"`
- When `selfAssessment.status` set to `"submitted"` → set `review.status: "self_submitted"`
- When first `managerAssessment.sections` entry is saved (and `managerAssessment.status === "not_started"`) → set `managerAssessment.status: "in_progress"` and `review.status: "manager_in_progress"`
- When `managerAssessment.status` set to `"submitted"` → set `review.status: "draft_complete"`

---

## Package Exports

`packages/db/package.json` — add:
```json
"./performance-review-categories": {
  "default": "./src/performance-review-categories.ts"
}
```

`packages/db/src/index.ts` — re-export `ReviewCycle` model.

---

## Out of Scope for Phase A

- No UI changes (panels, forms, working document)
- No email/notification triggers
- No AI tool changes (grow-tools.ts unchanged)
- No migration scripts (additive schema, old records still valid)
- No analytics
- Full behavioral anchors per category per rating level deferred to Phase C (too verbose for schema; will be in constants for UI use)

---

## Phase A Acceptance Criteria

- [ ] `ReviewCycle` model created with all fields, indexes, and toJSON virtual
- [ ] `performance-review-categories.ts` exports all 10 category definitions + rating scale + all status enums
- [ ] `PerformanceReview` schema has `reviewCycleId`, `reviewType`, `selfAssessment`, `managerAssessment`, `developmentPlan` additive fields
- [ ] Expanded `status` enum is backward-compatible (old values retained)
- [ ] `db/package.json` exports `./performance-review-categories` and updated index
- [ ] `PATCH /api/grow/reviews/[id]` enforces the self-submission gate with 403
- [ ] `PATCH /api/grow/reviews/[id]` auto-advances `status` when assessments are submitted
- [ ] `GET/POST /api/grow/review-cycles` and `GET/PATCH /api/grow/review-cycles/[id]` routes exist
- [ ] `pnpm lint`, `pnpm test`, `tsc --noEmit` all pass

---

## Implementation Notes

- The `{ ... }` shorthand in the `REVIEW_CATEGORIES` example represents the same shape repeated for all 10 keys. The implementation plan will include the full definitions for all 10 categories sourced directly from `docs/reqs/perf-reviews.md`.
- TypeScript: `RATING_SCALE` keys should be typed as a mapped type or `Record<1|2|3|4|5, ...>` — numeric literal union is valid in TypeScript.
- The `evidence[].refId` field stores the MongoDB ObjectId as a string (not a Mongoose ObjectId ref) to keep `CategorySection` schema-agnostic across goal/check-in/note types. Type discrimination is via the `type` field.
- `status` enum on `PerformanceReview` retains old values (`in_progress`, `shared`) for backward compat with existing records. New records start with `not_started` and advance through the new lifecycle.
