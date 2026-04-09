# Goals Schema & Creation Refactor — Design Spec

**Date:** 2026-04-08
**Phase:** A (Schema + Creation Refactor)
**Scope:** Goal schema, constants, validation, API routes, creation form, AI tools, UI components
**Approach:** Evolutionary refactor — modify existing model in place, clean break (all test data)

## Context

The current goals implementation has a flat schema with 5 categories, a single `successMetric` string, optional strategy linking, and single-party manager approval. The Goals Blueprint and Claude Version Goals requirements documents (from the #grow Slack channel) define a richer model with structured key results, dual confirmation, strategy pillar linkage, recalibration history, and a simplified Performance/Development goal type system.

This spec covers Phase A only: schema, fields, dual confirmation, new statuses, and recalibration. Deferred to later phases: preparation & conversation flow (employee/manager prep nodes), HR analytics & governance (Canopy/Vantage dashboards), and the playbook recommendation selection UI.

**Key decisions made during brainstorming:**
- Team goals are created in Strategy Studio, not Grow — individual goals reference them via `teamGoalId`
- Clean break on data — all existing goals are test/seed data
- Existing creation flows (Compass + direct form) stay, adapted to new fields
- AI recommendation multi-select is in scope as a lightweight addition to the working document pattern
- Strategy pillar link uses existing `StrategyGoal` model (maps to "Strategic Priorities" in Strategy Studio)

## 1. Goal Schema

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `objectiveStatement` | String | Yes | One sentence naming the outcome and why it matters. Min 15 words. Replaces `title` + `description`. |
| `goalType` | Enum | Yes | `"performance"` or `"development"`. Replaces 5-value `category`. |
| `keyResults` | Embedded Array (2-4) | Yes | Structured key results replacing single `successMetric` string. |
| `keyResults[].description` | String | Yes | What will be measured. |
| `keyResults[].metric` | String | Yes | The measurable target (number, percentage, yes/no). |
| `keyResults[].deadline` | Date | Yes | Specific deadline for this key result. |
| `keyResults[].status` | Enum | Yes | `"not_started"` \| `"in_progress"` \| `"achieved"` \| `"missed"`. Default `"not_started"`. |
| `strategyGoalId` | ObjectId (ref StrategyGoal) | Required for activation | Links to a Strategy Studio pillar. Optional during draft, required to move to `active`. |
| `teamGoalId` | ObjectId | Optional | Links to a team goal in Strategy Studio. |
| `supportAgreement` | String | Optional | Manager's committed resources, access, time, coaching, or tools. Surfaced in check-in prompts. |
| `checkInCadence` | Enum | Optional | `"every_check_in"` \| `"monthly"` \| `"quarterly"`. Default `"every_check_in"`. |
| `timePeriod` | Object (start: Date, end: Date) | Yes | Goal period boundaries. |
| `status` | Enum | Yes | See Status Lifecycle below. Default `"draft"`. |
| `employeeConfirmed` | Object | No | `{ confirmed: Boolean, at: Date }`. |
| `managerConfirmed` | Object | No | `{ confirmed: Boolean, at: Date }`. |
| `recalibrations` | Embedded Array | No | History of goal revisions. See Recalibration below. |
| `owner` | ObjectId (ref Employee) | Yes | Employee who owns the goal. |
| `manager` | ObjectId (ref Employee) | Yes | Manager responsible. |
| `locked` | Boolean | No | Default false. |
| `notes` | String | No | Default "". |
| `workflowRunId` | String | No | Links to workflow execution. |

### Removed Fields

- `title` — replaced by `objectiveStatement`
- `description` — absorbed into `objectiveStatement`
- `category` — replaced by `goalType`
- `measurementType` — removed, absorbed into key results
- `successMetric` — replaced by `keyResults[]`
- `managerApproved` — replaced by dual confirmation (`managerConfirmed` + `employeeConfirmed`)

### Status Lifecycle

```
draft → pending_confirmation → active → completed
                                 ↓
                          needs_attention
                                 ↓
                              blocked
```

- **draft** — goal being constructed, fields may be incomplete
- **pending_confirmation** — all required fields complete, awaiting both confirmations
- **active** — both employee + manager confirmed, strategyGoalId set
- **needs_attention** — either party flags a concern
- **blocked** — blocker identified, surfaced to manager with notification
- **completed** — goal achieved, triggers completion reflection

**Activation rule:** Goal transitions from `pending_confirmation` → `active` only when:
1. `employeeConfirmed.confirmed === true`
2. `managerConfirmed.confirmed === true`
3. `strategyGoalId` is set

### Recalibration

When a goal is recalibrated, the original state is preserved:

```
recalibrations[]: [
  {
    recalibratedAt: Date,
    reason: String,           // What changed
    previousSnapshot: Mixed,  // Frozen copy of goal fields before change
    revisedFields: Mixed,     // Which fields changed and new values
    revisedSupportAgreement: String (optional)
  }
]
```

After recalibration, confirmations are reset and status returns to `pending_confirmation`.

### Indexes

- `owner` + `status`
- `manager` + `status`
- `timePeriod.end`
- `strategyGoalId` (for reverse lookup)

## 2. Constants & Client Exports

**File:** `packages/db/src/goal-constants.ts`

```typescript
export const GOAL_TYPES = ["performance", "development"] as const;
export const GOAL_TYPE_LABELS: Record<string, string> = {
  performance: "Performance Goal",
  development: "Development Goal",
};

export const GOAL_STATUSES = [
  "draft", "pending_confirmation", "active",
  "needs_attention", "blocked", "completed"
] as const;
export const GOAL_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_confirmation: "Pending Confirmation",
  active: "Active",
  needs_attention: "Needs Attention",
  blocked: "Blocked",
  completed: "Completed",
};

export const KEY_RESULT_STATUSES = [
  "not_started", "in_progress", "achieved", "missed"
] as const;
export const KEY_RESULT_STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  achieved: "Achieved",
  missed: "Missed",
};

export const CHECKIN_CADENCES = [
  "every_check_in", "monthly", "quarterly"
] as const;
export const CHECKIN_CADENCE_LABELS: Record<string, string> = {
  every_check_in: "Every Check-in",
  monthly: "Monthly",
  quarterly: "Quarterly",
};
```

**Removed exports:** `GOAL_CATEGORIES`, `GOAL_CATEGORY_LABELS`, `MEASUREMENT_TYPES`

## 3. Zod Validation

**File:** `apps/platform/src/lib/validations/goal.ts`

- `objectiveStatement` — string, required, custom validator: min 15 words
- `goalType` — enum (performance, development), required
- `keyResults` — array, min 2, max 4. Each: `{ description: string, metric: string, deadline: date }`
- `strategyGoalId` — optional string (required for activation enforced server-side)
- `teamGoalId` — optional string
- `supportAgreement` — optional string
- `checkInCadence` — enum, default "every_check_in"
- `timePeriod` — string (Q1-Q4, H1, H2, annual, custom) or object with custom dates

Soft warning (client-side, not blocking): simple regex check flags objective statements that start with common activity verbs (e.g., "try", "help", "support", "participate") without a "so that" or "in order to" connection. Displayed as inline hint text below the textarea.

## 4. API Routes

### POST `/api/grow/goals` — Create Goal

- Validates against new Zod schema
- Creates goal with `status: "draft"` by default
- If created by manager/HR with all required fields + strategyGoalId: auto-set `managerConfirmed`, status = `pending_confirmation`
- Returns `{ success, goalId }`

### PATCH `/api/grow/goals` — Goal Actions

Accepts `{ goalId, action, ...params }`:

| Action | Params | Behavior |
|---|---|---|
| `confirm` | `role: "employee" \| "manager"` | Sets confirmation for role. If both confirmed + strategyGoalId → auto-transition to `active`. |
| `request_changes` | none | Resets to `draft`, clears both confirmations. |
| `update_status` | `status: "needs_attention" \| "blocked" \| "completed"` | Updates status on active goals. |
| `recalibrate` | `reason, revisedFields, revisedSupportAgreement?` | Snapshots current state into `recalibrations[]`, applies changes, resets confirmations, status → `pending_confirmation`. |

### GET `/api/grow/goals` — Fetch Goals

- Query: `?employeeId={id}` (required)
- Returns goals with new shape, including key results and confirmation status

### GET `/api/grow/status` — Status Dashboard

Updated aggregates:
- `activeGoalsCount` — status = active
- `pendingConfirmationCount` — status = pending_confirmation
- `blockedCount` — status = blocked
- `goalTypeBalance` — `{ performance: n, development: n }` with warning flag if zero development goals
- Per-employee row adds: pending confirmation count, development goal flag

## 5. Goal Creation Form

**File:** `apps/platform/src/components/grow/forms/goal-creation-form.tsx`

### Updated Fields

| Field | UI Element | Notes |
|---|---|---|
| Objective Statement | Textarea | Word count indicator (min 15). Soft warning for activity-based wording. |
| Goal Type | Radio/toggle | Performance / Development |
| Key Results | Repeatable section (2-4) | Each row: description (text), metric (text), deadline (date picker). Add/remove buttons. Min 2 enforced. |
| Strategy Pillar Link | Dropdown | Populated from StrategyGoal records. Shows title + horizon. Hint: "Required before activation". |
| Team Goal Link | Dropdown | Optional, filtered by selected pillar. |
| Support Agreement | Textarea | Optional. Label: "What will the manager provide?" |
| Check-in Cadence | Dropdown | Every Check-in / Monthly / Quarterly |
| Time Period | Select | Q1-Q4 / H1 / H2 / Annual / Custom (with date pickers) |

### Removed Fields

- Category dropdown
- Measurement type dropdown
- Single success metric textarea

### Consolidation

Evaluate whether `PerformanceGoalForm` (direct modal) and `GoalCreationForm` (working document) can be consolidated into a single form component, since they will share the same field set.

## 6. AI Tools

### `startGoalWorkflowTool`

- Still fetches foundation data + strategy goals
- Conversation framing updated: pillar selection → goal type → objective statement + key results → support agreement
- Parameters updated to match new schema

### `openGoalDocumentTool`

- Accepts: `objectiveStatement, goalType, keyResults[], strategyGoalId, supportAgreement, checkInCadence, timePeriod`
- Pre-fills the new form shape in `[ASCENTA_WORKING_DOC]` block

### Goal Recommendation Block (New)

- New delimiter: `[ASCENTA_GOAL_RECOMMENDATIONS]...[/ASCENTA_GOAL_RECOMMENDATIONS]`
- Contains JSON array of 3-5 suggested goals, each with: objectiveStatement, goalType, keyResults[], strategyGoalId
- Frontend renders as selectable cards with checkboxes
- Employee selects goals → "Use selected" → creates all selected goals as `draft` status and navigates to the Goals tab where they appear in the Draft section for individual review/editing
- New block type added to `workflow-blocks.tsx`

### `updateWorkingDocumentTool`

- Field names updated to match new schema (objectiveStatement, goalType, keyResults, etc.)

## 7. UI Components

### GoalsPanel (`goals-panel.tsx`)

**Tab groupings:**
- **Draft** — status = draft
- **Pending Confirmation** — status = pending_confirmation
- **Active** — status in (active, needs_attention, blocked)
- **Completed** — status = completed

**Goal row display:**
- Objective statement (truncated)
- Goal type badge (Performance / Development)
- Strategy pillar name
- Key results progress (e.g., "2/3 achieved")
- Status badge

**Expanded row:**
- Full objective statement
- Key results list with individual statuses
- Support agreement
- Confirmation status: employee checkmark / manager checkmark

**Actions:**
- **Confirm** button — visible on pending_confirmation goals when current user's role hasn't confirmed
- **Request Changes** — resets to draft
- **Recalibrate** button — on active goals, opens modal: reason (required), revised fields, revised support agreement
- **Status update** dropdown — on active goals: needs_attention, blocked, completed
- **Goal type balance warning** — banner if employee has zero development goals

### GoalCard (`goal-card.tsx`)

- Key results shown as mini checklist
- Strategy pillar shown as tag
- Dual confirmation indicators (two checkmarks: employee, manager)

### StatusDashboard

- Stat cards: active goals, pending confirmation, goal type balance, blocked goals
- Per-employee row: pending confirmation count, development goal flag

## 8. Files Changed

| File | Change |
|---|---|
| `packages/db/src/goal-schema.ts` | Full schema rewrite |
| `packages/db/src/goal-constants.ts` | Replace categories/measurement with types/statuses |
| `apps/platform/src/lib/validations/goal.ts` | New Zod schema |
| `apps/platform/src/app/api/grow/goals/route.ts` | POST/PATCH/GET updated |
| `apps/platform/src/app/api/grow/status/route.ts` | New aggregates |
| `apps/platform/src/components/grow/forms/goal-creation-form.tsx` | New field set |
| `apps/platform/src/components/grow/goals-panel.tsx` | New tabs, actions, display |
| `apps/platform/src/components/grow/goal-card.tsx` | Key results, dual confirmation |
| `apps/platform/src/components/grow/performance-goal-form.tsx` | Updated or consolidated |
| `apps/platform/src/components/grow/status-dashboard.tsx` | Updated aggregates |
| `apps/platform/src/lib/ai/grow-tools.ts` | Updated tool schemas + recommendation block |
| `apps/platform/src/lib/ai/prompts.ts` | Updated goal-related prompt sections |
| `apps/platform/src/lib/workflows/definitions/create-goal.ts` | Updated intake fields |
| `apps/platform/src/components/chat/workflow-blocks.tsx` | New recommendation block type |
| `apps/platform/src/lib/constants/dashboard-nav.ts` | Tool config updates if needed |
| `scripts/seed-grow.ts` (or equivalent) | Updated seed data |

## 9. Out of Scope (Deferred)

- Preparation phase (employee/manager prep nodes, 48-72hr pre-conversation)
- Full playbook model (structured 5-move conversation)
- HR/People Ops analytics (Canopy/Vantage dashboards, alignment rates, health scores)
- Goal cycle administration (launch dates, deadlines, completion tracking)
- Leadership Library recommendation engine
- Completion reflection prompts
- Mid-period auto-triggered reviews
- Alignment descriptors (strong/acceptable/poor)
