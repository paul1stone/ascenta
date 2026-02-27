# Grow Section — Sprint 1 Design

**Date**: 2026-02-26
**Scope**: Sprint 1 (Issues #8–#18) — Performance System Foundation
**Architecture**: Hybrid — CRUD for Goals & Notes, Workflow Engine for Check-In Completion

## Overview

The Grow section is the fourth pillar of Ascenta's HR lifecycle (Plan → Attract → Launch → **Grow** → Care → Protect). Sprint 1 builds the Performance System foundation: Goals, Check-Ins, and Performance Notes.

**Key decisions:**
- Chat-driven with quick-entry forms (hybrid input)
- All four tabs active: DO, LEARN, STATUS, DASHBOARD
- Role simulation (Employee/Manager/HR switcher) instead of real auth
- Hybrid architecture: plain CRUD for Goals & Notes, workflow engine for Check-In Completion
- All MongoDB/Mongoose (no Postgres)

## Data Models

### Goal (`packages/db/src/goal-schema.ts`)

| Field | Type | Notes |
|-------|------|-------|
| statement | string | Required. The goal text |
| measure | string | Required. How success is measured |
| type | enum: team, role, individual | |
| owner | ObjectId → Employee | Required |
| timeperiod | { start: Date, end: Date } | |
| parentGoal | ObjectId → Goal | Nullable, for cascading |
| dependencies | string[] | Optional |
| status | enum: draft, active, locked, completed, cancelled | |
| createdBy | ObjectId → Employee | |
| visibility | enum: employee, manager, hr | |

### CheckIn (`packages/db/src/checkin-schema.ts`)

| Field | Type | Notes |
|-------|------|-------|
| goal | ObjectId → Goal | Required |
| employee | ObjectId → Employee | Required |
| scheduledDate | Date | |
| completedDate | Date | Nullable |
| cadence | enum: weekly, biweekly, monthly, quarterly | |
| progress | string | Required on completion |
| blockers | string | Optional |
| supportNeeded | string | Optional |
| status | enum: scheduled, completed, missed, cancelled | |
| performanceNote | ObjectId → PerformanceNote | Optional linked note |

### PerformanceNote (`packages/db/src/performance-note-schema.ts`)

| Field | Type | Notes |
|-------|------|-------|
| employee | ObjectId → Employee | Required |
| author | ObjectId → Employee | Required |
| type | enum: observation, feedback, coaching, recognition, concern | |
| content | string | Required |
| context | string | Optional (e.g., "During Q1 check-in") |
| relatedGoal | ObjectId → Goal | Optional |
| relatedCheckIn | ObjectId → CheckIn | Optional |
| visibility | enum: manager_only, hr_only, shared_with_employee | |

### Audit Events

Extend existing `auditEvents` with new event types: `goal.created`, `goal.updated`, `goal.locked`, `checkin.completed`, `checkin.missed`, `note.created`.

## API Routes

### Goals (`/api/goals/`)

- `POST /api/goals` — Create goal
- `GET /api/goals` — List goals (filter: owner, status, type, time period)
- `GET /api/goals/[id]` — Single goal with linked check-ins
- `PATCH /api/goals/[id]` — Update (blocked if locked without HR override)
- `POST /api/goals/[id]/lock` — Lock goal

### Check-Ins (`/api/check-ins/`)

- `POST /api/check-ins` — Schedule check-in
- `GET /api/check-ins` — List (filter: employee, goal, status, date range)
- `PATCH /api/check-ins/[id]` — Complete check-in (triggers workflow)
- `GET /api/check-ins/overdue` — Overdue check-ins

### Performance Notes (`/api/performance-notes/`)

- `POST /api/performance-notes` — Create note
- `GET /api/performance-notes` — List (filter: employee, type, date, author)
- `PATCH /api/performance-notes/[id]` — Edit (author only)

### Status (`/api/grow/status`)

- `GET /api/grow/status` — Aggregated dashboard data

## AI Tools

| Tool | Purpose |
|------|---------|
| `createGoal` | Chat-based goal creation → `POST /api/goals` |
| `addPerformanceNote` | Quick note via chat → `POST /api/performance-notes` |
| `getGrowStatus` | Pull status data for conversational queries |

Check-in completion goes through the **workflow engine** (see below).

## Check-In Completion Workflow

Workflow definition: `check-in-completion` in `lib/workflows/definitions/`

**Category**: `"grow"` (new workflow category)

**Intake Fields:**
1. `goal` — Select from active goals (dropdown)
2. `progress` — What progress was made? (textarea, required)
3. `blockers` — Any blockers? (textarea, optional)
4. `supportNeeded` — Support from manager? (textarea, optional)
5. `rating` — Self-assessment: On Track / At Risk / Off Track

**Guardrails:**
- `progress` not empty → hard_stop
- `rating` = "Off Track" + `supportNeeded` empty → warning

**Guided Actions:**
- "Summarize progress in objective terms"
- "Suggest follow-up actions based on blockers"

**On Completion:**
- Creates/updates CheckIn record
- Optionally creates linked PerformanceNote
- Writes audit event

## Frontend — Four Tabs

### DO Tab

Default: 3x2 category grid. Clicking **Grow** shows action cards:

| Card | Action |
|------|--------|
| Create Goal | Inline form (statement, measure, type, owner, time period) |
| Log Check-In | Inline form or chat workflow |
| Add Performance Note | Inline form (employee, type, content, optional goal link) |
| View Goals | Filterable goal list with status/progress indicators |
| View Check-Ins | Upcoming/past check-ins with status badges |
| Back to Categories | Returns to 3x2 grid |

### LEARN Tab

Contextual help for Grow category:
- "What makes a good goal" (SMART framework)
- "How to write objective notes" (behavior → impact)
- "Strong vs weak check-in examples"
- "Feedback scripts" (positive, redirecting, mixed)

Static markdown content rendered as cards.

### STATUS Tab

- Check-in completion rate by manager/team
- Goal status distribution
- Overdue flags (missed/overdue check-ins)
- Missing documentation (goals without scheduled check-ins)

Role-filtered: Managers see team, HR sees all.

### DASHBOARD Tab

- Summary cards: Active goals, Check-ins this period, Notes logged, Overdue items
- Recent activity feed
- Attention queue (overdue check-ins, goals nearing deadline)

## Role Simulation

Navbar dropdown: Employee | Manager | HR. Stored in React context, sent as `X-Ascenta-Role` header. API routes filter based on role:
- **Employee**: own goals, check-ins, shared notes
- **Manager**: team goals, check-ins, all notes for reports
- **HR**: everything

## Build Order

| Phase | Issues | Dependencies |
|-------|--------|--------------|
| 1. Foundation | #8 (schemas), #9 (roles) | None |
| 2. Core CRUD | #10 (goal create), #12 (check-in scheduling) | Phase 1 |
| 3. Views + Notes | #11 (goal list), #14 (performance notes) | Phase 1 |
| 4. Workflow | #13 (check-in completion) | Phase 1 + #12 |
| 5. Dashboards | #15 (status), #16 (overdue flags) | Phase 1 |
| 6. Help | #17 (learn panel) | Independent |
| 7. Hardening | #18 (seed data + E2E) | All above |

Phases 2–3 and 5–6 can run in parallel.
