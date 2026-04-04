# Goal Creation Workflow Redesign

**Date:** 2026-04-03
**Status:** Approved
**Replaces:** Current single-shot `startGoalCreationTool` flow

## Summary

Replace the current goal creation flow (AI pre-fills all fields at once, opens form) with a 5-step conversational workflow through Compass that aligns employee goals to company strategy. Goals go through manager review before activation.

## Motivation

Employee goals should connect to company and department strategy. The current flow skips strategy context entirely — the AI guesses alignment from a generic mission/value/priority enum. The new flow walks the employee through strategic alignment first, then uses that context to generate better goal recommendations.

## Schema Changes

### Goal Categories — Replace

Remove the 16 subcategories and 3 category groups. Replace with 5 flat goal types:

```
performance | development | culture | compliance | operational
```

**Files affected:**
- `packages/db/src/goal-constants.ts` — Replace `GOAL_CATEGORIES` array, remove `GOAL_CATEGORY_GROUPS`, remove `ALIGNMENT_TYPES`
- `packages/db/src/goal-schema.ts` — Update `category` enum, remove `alignment` field, add new fields
- `apps/platform/src/lib/validations/goal.ts` — Update Zod schema

### Goal Schema — New/Changed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | String enum | Yes | One of: performance, development, culture, compliance, operational |
| `strategyGoalId` | ObjectId ref → StrategyGoal | No | Links to a company or department strategy goal. Null for independent goals. |
| `notes` | String | No | Free-form additional context |
| `status` | String enum | Yes | Add `pending_review` to existing: on_track, needs_attention, off_track, completed |

### Goal Schema — Removed Fields

| Field | Reason |
|-------|--------|
| `alignment` | Replaced by `strategyGoalId` reference |

### Fields Unchanged

title, description, measurementType, successMetric, timePeriod, checkInCadence, owner, manager, managerApproved, locked, workflowRunId

## AI Tool Redesign

### Remove

- `startGoalCreationTool` — Replaced by the two new tools below

### New Tool: `startGoalWorkflow`

**Purpose:** Kick off the goal creation conversation. Fetches all strategy context upfront and returns it to the AI with instructions for the 5-step flow. Does NOT open a working document.

**Input schema:**
- `employeeName` (string, required)
- `employeeId` (string, required)
- `department` (string, optional)
- `jobTitle` (string, optional)
- `managerName` (string, optional)

**Behavior:**
1. Fetch company foundation (MVV) from `CompanyFoundation.findOne()`
2. Fetch active strategy goals: company-wide + department-scoped for the employee's department
3. Return all context to the AI as structured data
4. AI proceeds through the 5-step conversation (see below)

**Returns:**
```json
{
  "success": true,
  "foundation": { "mission": "...", "vision": "...", "values": "..." },
  "companyGoals": [{ "id": "...", "title": "...", "horizon": "..." }],
  "departmentGoals": [{ "id": "...", "title": "...", "horizon": "..." }],
  "message": "Context loaded. Begin step 1."
}
```

### Conversational Flow (encoded in tool description)

**Step 1 — Strategic pillar context:**
Present the company's mission, vision, and values as strategic pillars, plus any company-wide strategy goals. Ask: "Which strategic pillar does this goal support? You can also skip this if your goal is independent."

Accept a pillar reference or "none/skip."

**Step 2 — Department and team focus:**
Present department strategy goals (if any). Ask which one this goal aligns to (or none). Then ask goal type: Performance, Development, Culture, Compliance, or Operational. Present as a numbered list.

**Step 3 — Goal recommendation:**
Based on all context (selected pillar, department goal, goal type, employee role/department), generate 4-6 goal recommendations as a numbered list. Include a final option: "Or describe your own goal."

User picks a number or writes a custom goal. AI drafts a goal title and description.

**Step 4 — Metrics and milestones:**
AI suggests 2-3 success metrics based on the goal type and description. Ask user to pick or customize. Discuss target date / time period. Conversationally ask about resources needed and potential blockers (these inform the conversation but are NOT persisted as fields). Then call `openGoalDocument`.

**Step 5 — Submit for review:**
Working document form opens with all fields pre-filled. User reviews, optionally edits notes field, and submits. Goal saves with `status: pending_review`.

### New Tool: `openGoalDocument`

**Purpose:** Open the working document form at the end of the conversation with all fields pre-filled. This is the equivalent of the old `startGoalCreation` but called after steps 1-4.

**Input schema:**
- `employeeName` (string)
- `employeeId` (string)
- `title` (string)
- `description` (string)
- `category` (string — one of the 5 types)
- `strategyGoalId` (string, optional — ObjectId of linked strategy goal)
- `strategyGoalTitle` (string, optional — display title for the form)
- `measurementType` (string)
- `successMetric` (string)
- `timePeriod` (string — Q1, Q2, Q3, Q4, H1, H2, annual, custom)
- `checkInCadence` (string)
- `notes` (string, optional)

**Behavior:**
1. Start a workflow run (same as current pattern)
2. Build working document payload with all pre-filled values
3. Return the working document block for the frontend to render

## Goal Form (Working Document) Changes

**Updated fields displayed:**
- Title (text)
- Description (textarea)
- Goal Type (select — 5 options)
- Strategy Alignment (read-only pill — shows linked strategy goal title, or "Independent goal")
- Success Metric (text)
- Measurement Type (select — unchanged enum)
- Time Period (select — unchanged)
- Check-in Cadence (select — unchanged)
- Notes (textarea — new, optional)
- Employee (shown for HR/manager creating for others, hidden for self-creation)

**Submit button:** "Submit for Review"

**When HR/manager creates for an employee:** Goal skips review, created as `on_track` with `managerApproved: true`.

## Goal Table Changes

### Status Colors

Add `pending_review` to the status system:

| Status | Color | Label |
|--------|-------|-------|
| `pending_review` | `#8b5cf6` (purple) | Pending Review |
| `on_track` | `#22c55e` (green) | On Track |
| `needs_attention` | `#f59e0b` (amber) | Needs Attention |
| `off_track` | `#ef4444` (red) | Off Track |
| `completed` | `#6b7280` (gray) | Completed |

### Expanded Row — New Content

- **Strategy Alignment** — Shows linked strategy goal title as a pill, or "Independent" if none
- **Notes** — If present, shown below description
- **Manager actions** (for `pending_review` goals, manager/HR only):
  - "Approve" button — sets `status: on_track`, `managerApproved: true`
  - "Request Changes" button — keeps status as `pending_review`, sets `managerApproved: false`, triggers notification to employee. Employee edits and resubmits.
  - "Review with Compass" link — opens Compass with goal context for conversational review/editing

## Permissions

### Goal Creation

| Role | Can create for |
|------|---------------|
| Employee | Self only |
| Manager | Self + any employee in their department |
| HR | Self + any employee |

### Goal Review

| Role | Can review |
|------|-----------|
| Employee | Cannot review (submitter) |
| Manager | Goals from employees in their department |
| HR | Any goal |

### Review Skip

Goals created BY a manager or HR for an employee are created with `status: on_track` and `managerApproved: true` — no review step needed since the manager/HR is already authoring the goal.

## Notifications

| Event | Recipient | Message |
|-------|-----------|---------|
| Goal submitted | Manager | "[Employee] submitted a goal for review: [title]" |
| Goal approved | Employee | "Your goal [title] was approved by [manager]" |
| Changes requested | Employee | "[Manager] requested changes to your goal: [title]" |

Notifications use the existing notification system (`/api/notifications`).

## What Gets Removed

- `GOAL_CATEGORIES` (16 subcategories) — replaced by 5 types
- `GOAL_CATEGORY_GROUPS` — no longer needed
- `ALIGNMENT_TYPES` (mission/value/priority) — replaced by `strategyGoalId`
- `startGoalCreationTool` — replaced by `startGoalWorkflow` + `openGoalDocument`
- `categoryGroup` references in form and tools
- `alignment` field from schema, form, and tools
- `GoalCard` component — already replaced by table view

## What Stays Unchanged

- Check-in flow (`startCheckInTool`)
- Performance notes flow (`startPerformanceNoteTool`)
- `measurementType` enum (numeric_metric, percentage_target, milestone_completion, behavior_change, learning_completion)
- `checkInCadence` enum (monthly, quarterly, milestone, manager_scheduled)
- Goals API route structure (GET by employeeId, POST to create)
- Employee combobox component
- Goal table UI (compact table with expandable rows)
