# Goal Follow-Through: Action Plan Feature Design

**Date**: 2026-03-08
**Status**: Proposal

## Overview

After a goal is created in the Grow system, the chat offers to build a structured action plan with milestones to help the employee achieve the goal. The action plan opens in the existing working document panel (50/50 split with chat) and can be refined through conversation.

## Target User

The employee is the primary consumer of the action plan — it's their personal execution roadmap. However, either a manager or employee can trigger it. The chat offers it after any goal creation regardless of who created the goal.

## Key Design Decisions

- **Persisted data model** — Action plans are saved to the database, linked 1:1 to a Goal
- **Working document pattern** — Reuses the same 50/50 side-panel UX as goal creation, check-ins, and performance notes
- **Loosely coupled to check-ins** — Milestones are the employee's tool; check-ins remain the manager's formal tracking instrument. No direct reference between them
- **AI-generated, user-refined** — AI analyzes the goal and generates 3-6 milestones spread across the time period. User can edit in the form or refine through chat

## Data Model: `ActionPlan`

Collection: `actionplans`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `goal` | ObjectId ref → Goal | Yes | Indexed, 1:1 relationship |
| `employee` | ObjectId ref → Employee | Yes | Indexed, the person executing the plan |
| `createdBy` | ObjectId ref → Employee | Yes | Could be manager or employee |
| `status` | Enum: `active`, `completed`, `abandoned` | Yes | Default: `active` |
| `milestones` | Embedded array (see below) | Yes | Ordered list of steps |
| `workflowRunId` | String | No | Links to workflow run |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

### Milestone Sub-document

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | String | Yes | nanoid short ID |
| `title` | String | Yes | What to do |
| `description` | String | No | More detail on how/why |
| `targetDate` | Date | Yes | When to aim for |
| `status` | Enum: `not_started`, `in_progress`, `completed` | Yes | Default: `not_started` |
| `notes` | String | No | Freeform field for the employee |
| `completedAt` | Date | No | Timestamp when marked completed |
| `order` | Number | Yes | Integer for sequencing |

### Indexes

- `{ goal: 1 }` — unique, 1:1 lookup
- `{ employee: 1, status: 1 }` — find active plans for an employee

## Chat Flow

```
1. User creates goal → goal saved
2. AI responds: "Goal created! Would you like me to build
   an action plan with milestones to help [employee] achieve this?"
3. User: "Yes" (or declines — no pressure)
4. AI calls startActionPlanTool → analyzes goal → generates milestones
5. Working document panel opens with prefilled action plan
6. User can:
   - Edit milestones directly in the form
   - Ask AI to refine ("add a step for the training course",
     "spread these out more evenly")
   - Submit when satisfied
7. Action plan persisted, linked to goal
```

## AI Tools

### `startActionPlanTool` (new)

- Takes goal ID + employee info
- Reads the goal's title, description, success metric, time period, measurement type
- Generates 3-6 milestones spread across the goal's time period
- Returns `[ASCENTA_WORKING_DOC]` block with `workflowType: "create-action-plan"` and prefilled milestones
- Opens the working document panel

### `updateWorkingDocumentTool` (existing)

Already handles field updates via chat — works for refining milestones (e.g., "add a milestone for completing the certification by end of April").

## Form: `ActionPlanForm`

Renders in the working document panel:

- **Goal summary banner** — read-only: goal title, time period, success metric
- **Milestones list** — ordered, each milestone is an editable card:
  - Title input
  - Description textarea
  - Target date picker
  - Status dropdown (not_started / in_progress / completed)
  - Notes textarea (optional, collapsed by default)
  - Drag to reorder / delete button
- **Add milestone button** at the bottom
- **Submit / Cancel** buttons

## Workflow Definition: `create-action-plan`

- **Slug**: `"create-action-plan"`
- **Category**: `"grow"`
- **Intake fields**: goalId, employeeId, employeeName, milestones
- **Guardrails**:
  - Must have at least 1 milestone (hard_stop)
  - Each milestone must have a title and target date (hard_stop)

## Explicitly Out of Scope

- No direct tie between milestones and check-ins
- No notifications/reminders for milestone target dates
- No milestone completion affecting goal status
- No dependencies between milestones
- No assigning milestones to other people

These could all be added in future iterations.
