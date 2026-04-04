# Performance Reviews v1 — Design Spec

**Date:** 2026-04-03
**Status:** Draft
**Location:** Grow / Performance → Reviews tab

## Overview

Performance reviews are a chat-guided, multi-step workflow where a manager reviews an employee's performance for a period, with AI drafting review language tied to strategic pillars and company values. The flow follows the existing Grow working document pattern: Compass walks the manager through each step, opening and updating a side-panel form.

The 5-step cycle:
1. **Pull aligned goals and strategy** — system gathers goals, check-ins, notes, and foundation data
2. **Prompt for contributions** — manager provides context (hybrid: AI pre-fills from data, open prompts for subjective areas)
3. **AI drafts review comments** — language tied to strategic pillars and values
4. **Manager reviews and finalizes** — edits AI draft, adds examples, confirms narrative
5. **Next-period goal creation** — AI recommends goals aligned to evolving strategy; optional handoff to existing goal creation flow

## Data Model

New schema: `packages/db/src/performance-review-schema.ts`

### PerformanceReview

| Field | Type | Description |
|-------|------|-------------|
| `employee` | ObjectId ref → Employee | The employee being reviewed |
| `manager` | ObjectId ref → Employee | The reviewing manager |
| `reviewPeriod` | `{ start: Date, end: Date, label: string }` | e.g., "Q1 2026" |
| `status` | enum | `not_started`, `in_progress`, `draft_complete`, `finalized`, `shared` |
| `currentStep` | enum | `contributions`, `draft`, `finalize`, `goals` — tracks wizard progress |

**Step 1 — Pulled context (system-populated):**

| Field | Type | Description |
|-------|------|-------------|
| `alignedGoals` | Array of `{ goalId, title, category, status, alignment, successMetric }` | Snapshot of goals for the period |
| `checkInSummaries` | Array of `{ checkInId, completedAt, managerNotes, employeeNotes }` | Check-in highlights |
| `performanceNotes` | Array of `{ noteId, type, observation, createdAt }` | Relevant performance notes |
| `foundation` | `{ mission: string, values: string[], pillars: string[] }` | Company foundation snapshot |

**Step 2 — Manager contributions (hybrid pre-fill):**

| Field | Type | Description |
|-------|------|-------------|
| `contributions.strategicPriorities` | string | Which pillars/priorities the employee supported |
| `contributions.outcomesAchieved` | string | Measurable outcomes |
| `contributions.behaviors` | string | Accountability, collaboration, etc. (open-ended) |
| `contributions.additionalContext` | string | Anything else the manager wants to add |

**Step 3 — AI-drafted review:**

| Field | Type | Description |
|-------|------|-------------|
| `draft.summary` | string | Overall narrative |
| `draft.strengthsAndImpact` | string | What went well, tied to pillars |
| `draft.areasForGrowth` | string | Development opportunities |
| `draft.strategicAlignment` | string | How work connected to company direction |
| `draft.overallAssessment` | string | Closing assessment |

**Step 4 — Final document (manager-edited):**

| Field | Type | Description |
|-------|------|-------------|
| `finalDocument.summary` | string | Manager-edited version |
| `finalDocument.strengthsAndImpact` | string | Manager-edited version |
| `finalDocument.areasForGrowth` | string | Manager-edited version |
| `finalDocument.strategicAlignment` | string | Manager-edited version |
| `finalDocument.overallAssessment` | string | Manager-edited version |
| `finalDocument.managerSignoff` | `{ at: Date, name: string }` | When and who finalized |

**Step 5 — Goal recommendations:**

| Field | Type | Description |
|-------|------|-------------|
| `goalRecommendations` | Array of `{ title, description, category, alignment, rationale }` | AI-suggested next-period goals |
| `goalHandoffCompleted` | boolean | Whether manager created goals from recommendations |

**Other fields:**

| Field | Type | Description |
|-------|------|-------------|
| `workflowRunId` | string | Links to workflow execution |
| `timestamps` | auto | createdAt, updatedAt |

**Indexes:** `{employee, reviewPeriod.end}`, `{manager, status}`, `{status, reviewPeriod.end}`

## AI Tools

Four new tools in `grow-tools.ts`:

### 1. `startPerformanceReview`

**Input:** employeeName, employeeId, reviewPeriod (Q1/Q2/Q3/Q4/H1/H2/annual/custom)

**Behavior:**
- Creates a `PerformanceReview` record with status `in_progress`, currentStep `contributions`
- Queries goals for the employee within the review period
- Queries check-ins linked to those goals
- Queries performance notes for the employee within the period
- Queries `CompanyFoundation` for mission, values, pillars
- Snapshots all pulled data onto the review record
- Pre-fills `contributions.strategicPriorities` and `contributions.outcomesAchieved` from goal data
- Leaves `contributions.behaviors` and `contributions.additionalContext` empty for manager input
- Returns working document block at Step 2 (contributions form) with context sidebar

### 2. `generateReviewDraft`

**Input:** reviewId (contributions already saved on the record)

**Behavior:**
- Reads the review record (pulled context + contributions)
- Uses the artifact engine pattern to generate each draft section
- AI prompt includes foundation data so language frames around strategic pillars/values
- Saves generated sections to `draft.*` fields
- Updates status to `draft_complete`, currentStep to `draft`
- Returns working document block at Step 3 (read-only draft preview)

### 3. `finalizeReview`

**Input:** reviewId, edited sections (any/all of: summary, strengthsAndImpact, areasForGrowth, strategicAlignment, overallAssessment)

**Behavior:**
- Called when the manager clicks "Finalize" after editing the draft in Step 4
- Copies draft sections to `finalDocument`, applying any manager edits passed as input
- Records `managerSignoff` with timestamp and manager name
- Updates status to `finalized`, currentStep to `finalize`
- Returns working document block with finalization confirmation and PDF download button

### 4. `recommendNextGoals`

**Input:** reviewId

**Behavior:**
- Reads the finalized review + current foundation data
- AI analyzes: areas for growth, pillar coverage gaps, evolving strategy priorities
- Generates 2-4 goal recommendations with title, description, category, alignment, and rationale
- Saves to `goalRecommendations` array
- Returns working document block at Step 5 (goal list with "Create This Goal" handoff buttons)
- Each "Create This Goal" button triggers existing `startGoalCreation` tool with pre-filled values
- "Save for Later" stores recommendations on the record; manager can revisit anytime

**Existing tool reuse:**
- `updateWorkingDocument` — used for mid-step edits during any phase
- `startGoalCreation` — handoff target for Step 5 goal creation

## Reviews Tab UI

Located in the existing Grow/Performance tab set, replacing the "Coming soon" placeholder.

### Components

**`reviews-panel.tsx`** — main tab content:
- Period selector dropdown (default: current/most recent period)
- Nudge banner (appears when review period deadline is within 2 weeks and not all reviews are finalized)
- Stats row: 4 cards (Direct Reports, Not Started, In Progress, Finalized)
- Employee status table

**Stats row** mirrors the existing `StatusDashboard` pattern (4 stat cards).

### Status Table

| Column | Content |
|--------|---------|
| Employee | Name |
| Department | Department |
| Goals | Count of goals in the review period |
| Status | Badge: Not Started (orange), In Progress (green), Draft Complete (teal), Finalized (blue), Shared (gray) |
| Step | Current step label for in-progress reviews, "—" otherwise |
| Action | "Start Review" button (not started), "Continue →" (in progress), "Download PDF" (finalized) |

### UI Behaviors

- **Start Review button** sends a pre-filled message to Compass: "Start a performance review for [employee] for [period]"
- **Continue →** reopens the working document at the current step; Compass re-loads context
- **Download PDF** calls `/api/grow/reviews/[id]/pdf`
- **Period selector** filters the table to show reviews for that period
- **Nudge banner** shows when: review period end date is within 2 weeks AND count of not-started/in-progress reviews > 0

## API Routes

New routes under `apps/platform/src/app/api/grow/reviews/`:

### `GET /api/grow/reviews`

Query params: `managerId`, `period` (label string)

Returns: `{ success, reviews[], aggregates: { directReports, notStarted, inProgress, finalized } }`

Logic:
- Find all employees managed by the manager (same discovery as `/api/grow/status`)
- For each, find or synthesize a review record for the period
- Employees without a review record get a virtual "not_started" entry
- Return aggregated counts for stats cards

### `POST /api/grow/reviews`

Body: `{ employeeId, managerId, reviewPeriod: { start, end, label } }`

Creates a new `PerformanceReview` with status `in_progress`. Called by `startPerformanceReview` tool.

### `GET /api/grow/reviews/[id]`

Returns the full review record with all fields.

### `PATCH /api/grow/reviews/[id]`

Body: partial update — contributions, draft, finalDocument, status, currentStep, goalRecommendations.

Used by AI tools to update the review as the manager progresses through steps.

### `GET /api/grow/reviews/[id]/pdf`

Generates a PDF from the `finalDocument` sections using the existing artifact engine:
- Defines a performance review artifact template with sections matching the document structure
- Uses `renderArtifactAsHtml()` to produce styled HTML
- Converts to PDF and returns as download

Returns 400 if review is not finalized.

## Strategy Integration

The review bridges individual performance and company direction through deep foundation data integration.

### Data Flow

1. `startPerformanceReview` queries `CompanyFoundation` (same collection Strategy Studio writes to)
2. Employee goals are grouped by their `alignment` field (mission/value/priority) to show which pillars they ladder to
3. Foundation snapshot stored on the review record for consistency

### Per-Step Integration

| Step | Integration |
|------|------------|
| Pull (1) | Foundation data fetched and stored. Goals grouped by pillar alignment. |
| Contributions (2) | Sidebar shows "Pillars this employee supports" with goal counts per pillar. Pre-filled `strategicPriorities` references these. |
| AI Draft (3) | AI prompt includes foundation context. Language frames strengths/growth around specific pillars and values. "Strategic Alignment" section explicitly maps contributions to company direction. |
| Finalize (4) | Manager can edit strategic framing. Pillar references stay visible in sidebar. |
| Goals (5) | AI recommends goals addressing pillar coverage gaps or aligning with evolving strategy. Rationale explains the strategic connection. |

### Fallback

If no foundation data exists (Strategy Studio not configured), the review works without pillar framing. Uses goal categories and alignment types instead. No hard dependency on Strategy Studio.

## Working Document Form Phases

The side-panel form adapts per step:

### Steps 1-2: Input Phase
- Context sidebar showing pulled goals, notes, and pillar alignment
- Pre-filled contributions form (strategicPriorities, outcomesAchieved)
- Empty text areas for subjective input (behaviors, additionalContext)
- "Generate Draft" button when contributions are ready

### Step 3: Draft Preview
- Read-only display of AI-generated sections
- Each section rendered as formatted text
- "Edit & Finalize" button to proceed to Step 4

### Step 4: Edit & Finalize
- All draft sections become editable text areas
- Manager can edit directly or ask Compass to revise specific sections
- Pillar sidebar remains visible for reference
- "Finalize" button with confirmation
- "Download PDF" available after finalizing

### Step 5: Goal Recommendations
- List of 2-4 recommended goals with rationale
- "Create This Goal" button per recommendation (hands off to `startGoalCreation`)
- "Save for Later" option (stores on record, manager can revisit)
- "Skip" to complete the review cycle without creating goals

## Review Period Detection

For the nudge banner and system-prompted reviews:
- Query goals with `timePeriod.end` approaching within 2 weeks
- Cross-reference with existing `PerformanceReview` records for that period
- Surface employees missing reviews in the nudge banner
- The `/api/grow/reviews` GET endpoint handles this aggregation

## Navigation Update

In `dashboard-nav.ts`, the Reviews tab configuration adds `startPerformanceReview` to the tools array so the tool selector shows "Start Review" as an option alongside existing Grow tools.

## Scope Boundaries

**In scope for v1:**
- Full 5-step review cycle
- Chat-guided working document interaction
- Strategy/foundation integration
- Status tracking table with nudge banner
- PDF download
- Goal recommendations with optional handoff

**Out of scope for v1:**
- Email delivery / sharing pipeline (manual PDF sharing)
- Employee self-review / 360 feedback
- Review templates / customizable sections
- Historical review comparison
- Review approval chains
- Calibration workflows
