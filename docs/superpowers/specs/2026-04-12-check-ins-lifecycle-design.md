# Check-ins Lifecycle — Design Spec

> Full Prepare → Participate → Reflect lifecycle for the Check-in feature within Grow/Performance.

## Decisions

- **Scope**: Full lifecycle (Prepare, Participate, Reflect) with perception gap engine
- **Auth**: Basic auth context provider with dev-mode user picker in top nav profile slot. Persisted via localStorage. Refactor existing pages to consume the provider.
- **Routing**: Checkins tab = dashboard/scheduling. `/grow/check-ins/[id]` = dedicated phase-aware page.
- **Scheduling**: Hybrid — cadence-generated from goals + manual scheduling by manager. In-app notifications only, no email.
- **Gap engine**: Likert 1-5 scoring with simple numeric delta. No AI interpretation this phase.
- **Participate structure**: 4-move guided form with AI assist per section. Employee-sourced fields flow to manager. Mutual commitment approval.
- **Existing tool**: The `startCheckInTool` and workflow definition evolve to support the new schema. Old flat fields replaced.

## Auth Context & Dev Mode

### Data Shape

```ts
type UserRole = "manager" | "employee" | "hr";

type AuthUser = {
  id: string;           // Employee._id
  employeeId: string;   // e.g. "EMP-001"
  name: string;
  role: UserRole;
  managerId?: string;   // if role is "employee"
  directReports?: string[]; // if role is "manager"
};
```

### Implementation

- `AuthProvider` context provider wraps the app in root layout
- `useAuth()` hook returns `{ user, switchUser, isDevMode }`
- Profile dropdown in existing top nav (`app-navbar.tsx`) becomes the dev-mode user picker — lists employees from DB, selecting one switches identity and persists to localStorage
- API routes receive user identity via a `x-dev-user-id` header sent by the provider (designed to be replaced by real session auth later)
- `GET /api/auth/me` returns current user context
- `GET /api/auth/users` returns available users for the dev picker
- Existing pages refactored to use `useAuth()` for user-dependent data fetching (goals, check-ins, status dashboard, etc.)

## Check-in Data Model

Replaces the existing flat `checkin-schema.ts` with structured sub-documents per lifecycle phase.

### Schema

```ts
{
  // Identity
  employee: ObjectId       // ref Employee, required, indexed
  manager: ObjectId        // ref Employee, required, indexed
  goals: ObjectId[]        // ref Goal, required

  // Scheduling
  scheduledAt: Date        // when the conversation is scheduled, required, indexed
  cadenceSource: "auto" | "manual"
  status: "preparing" | "ready" | "in_progress" | "reflecting" | "completed" | "missed" | "cancelled"
    // required, indexed, default: "preparing"

  // Prepare — Employee (E-1, E-2, E-3)
  employeePrepare: {
    progressReflection: string | null     // E-1: tied to active goals
    stuckPointReflection: string | null   // E-2: free text
    conversationIntent: string | null     // E-3: what they want to leave with
    completedAt: Date | null
    distilledPreview: string | null       // AI-generated summary for manager (stub: truncation)
  }

  // Prepare — Manager (M-1 through M-6)
  managerPrepare: {
    contextBriefingViewed: boolean        // M-1: system-generated, track viewed
    gapRecoveryViewed: boolean            // M-6: conditional, track viewed
    openingMove: string | null            // M-2: AI-suggested, manager can edit
    recognitionNote: string | null        // M-3: manager prep note
    developmentalFocus: string | null     // M-4: manager prep note
    completedAt: Date | null
  }

  // Participate — 4 Moves
  participate: {
    // Move 1: Employee opens (employee-sourced)
    employeeOpening: string | null
    // Employee key takeaways (employee-sourced)
    employeeKeyTakeaways: string | null
    // Move 2: Stuck point discussion (manager-captured)
    stuckPointDiscussion: string | null
    // Move 3: Recognition, Development, Performance (manager-captured)
    recognition: string | null
    development: string | null
    performance: string | null            // optional
    // Move 4: Mutual commitments (each party writes their own)
    employeeCommitment: string | null
    managerCommitment: string | null
    // Approval flags
    employeeApprovedManagerCommitment: boolean | null
    managerApprovedEmployeeCommitment: boolean | null
    completedAt: Date | null
  }

  // Reflect — Employee (EP-1 through EP-5), Likert 1-5
  employeeReflect: {
    heard: number | null                  // EP-1
    clarity: number | null                // EP-2
    recognition: number | null            // EP-3
    development: number | null            // EP-4
    safety: number | null                 // EP-5
    completedAt: Date | null
  }

  // Reflect — Manager (MP-1 through MP-5)
  managerReflect: {
    clarity: number | null                // MP-1
    recognition: number | null            // MP-2
    development: number | null            // MP-3
    safety: number | null                 // MP-4
    forwardAction: string | null          // MP-5: free text, feeds next cycle M-1
    completedAt: Date | null
  }

  // Gap Signals (computed after both Reflect complete)
  gapSignals: {
    clarity: number | null                // EP-2 vs MP-1 delta
    recognition: number | null            // EP-3 vs MP-2 delta
    development: number | null            // EP-4 vs MP-3 delta
    safety: number | null                 // EP-5 vs MP-4 delta
    generatedAt: Date | null
  }

  // Lifecycle
  completedAt: Date | null
  previousCheckInId: ObjectId | null      // links the chain for loop mechanism

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

### Indexes

- `(employee, scheduledAt)` — employee's check-in timeline
- `(manager, status)` — manager's dashboard queries
- `(status, scheduledAt)` — cron job transitions
- `(employee, manager, status)` — finding active check-ins for a pair

### Migration

Old flat fields (`managerProgressObserved`, `managerCoachingNeeded`, `managerRecognition`, `employeeProgress`, `employeeObstacles`, `employeeSupportNeeded`) are replaced by the `participate` sub-document. Existing completed check-ins in the DB can remain as-is — new code reads from the structured fields. No data migration needed since the old check-ins were proof-of-concept.

## Lifecycle & Status Machine

### States

| Status | Meaning |
|---|---|
| `preparing` | Created, waiting for Prepare phase completion |
| `ready` | Prepare complete (or time reached), conversation can begin |
| `in_progress` | Participate phase active |
| `reflecting` | Conversation done, Reflect phase open |
| `completed` | Both Reflect responses in, or 24h window closed |
| `missed` | Time window passed without completion |
| `cancelled` | Manager cancelled |

### Transitions

| From | To | Trigger |
|---|---|---|
| `preparing` | `ready` | Both Prepare `completedAt` set, OR `scheduledAt` reached |
| `preparing` | `cancelled` | Manager cancels |
| `ready` | `in_progress` | Either party opens Participate |
| `ready` | `missed` | 24h past `scheduledAt` with no activity |
| `in_progress` | `reflecting` | Participate `completedAt` set (both commitments approved) |
| `in_progress` | `missed` | 48h past `scheduledAt` with no completion |
| `reflecting` | `completed` | Both Reflect `completedAt` set |
| `reflecting` | `completed` | 24h Reflect window closes (auto-complete with partial data) |

### Scheduling Engine

A cron job (extending existing `apps/platform/src/app/api/cron/reminders/route.ts` pattern):

1. **Generate upcoming check-ins** — Looks at goals with `checkInCadence` settings, generates check-ins 2 weeks ahead. Skips if one already exists for that employee+manager pair in the window.
2. **Transition stale check-ins** — Moves `ready` → `missed` (24h), `in_progress` → `missed` (48h), `reflecting` → `completed` (24h window close).
3. **Compute gap signals** — For check-ins in `reflecting` where both Reflect phases are complete but `gapSignals.generatedAt` is null.
4. **Generate notifications** — In-app notifications for phase transitions.

### In-App Notifications

New `notifications` collection:

```ts
{
  userId: ObjectId        // who receives it
  type: "prepare_open" | "prepare_reminder" | "checkin_ready" | "reflect_open" | "reflect_reminder" | "gap_signal"
  checkInId: ObjectId
  message: string
  read: boolean           // default false
  createdAt: Date
}
```

Surfaced through the existing `NotificationCenter` component in the top nav.

## Page Structure & Routing

### Routes

- `/grow/performance` → checkins tab = **Dashboard/scheduling view**
- `/grow/check-ins/[id]` → **Dedicated check-in page** with phase-aware rendering

### Checkins Tab (Dashboard)

**Manager view:**
- Stats row: upcoming count, 30-day completion rate, active gap count, overdue count
- "Schedule Check-in" button (manual scheduling)
- Upcoming check-ins list: employee name, linked goals, cadence, status dot + label, scheduled date. Click navigates to `/grow/check-ins/[id]`.
- Recent completed section with gap signal indicators (colored dots per dimension)

**Employee view:**
- Next check-in date with preparation deadline
- Status indicator (needs preparation / ready / reflecting)
- "Prepare Now" action button
- Own check-in history

### Dedicated Check-in Page (`/grow/check-ins/[id]`)

**Common layout:**
- Back link to checkins tab
- Header: employee name (or manager name if employee view), linked goals, scheduled time, status badge
- 3-step phase stepper: Prepare → Participate → Reflect (active step highlighted)
- Phase-specific content below, rendered based on `status` + `user.role`

**Privacy enforcement:** The page component checks `useAuth()` role and only renders the appropriate view. Employee never sees manager prep/reflect. Manager never sees raw employee prep text (only distilled preview).

## Prepare Phase

### Employee Prepare (E-1, E-2, E-3)

Three reflection prompts displayed as form cards:

1. **Progress Reflection (E-1)** — "What progress have you made toward your goals since your last check-in? What are you most proud of?" Shows linked goal names for reference.
2. **Stuck Point Reflection (E-2)** — "Where do you feel stuck, uncertain, or in need of more support right now?"
3. **Conversation Intent (E-3)** — "What is the one thing you most want to leave this conversation with?"

Privacy notice at top: "Your preparation is private — only a brief summary will be shared with your manager."

Submit saves to `employeePrepare` fields and sets `completedAt`. Triggers distilled preview generation (stub: first 200 chars of combined responses, TODO: AI summarization).

### Manager Prepare (M-1 through M-6)

**Context Briefing (M-1):**
- System-generated persistent context bar
- Shows: last cycle's forward action (from `previousCheckInId.managerReflect.forwardAction`), distilled employee preview
- Track `contextBriefingViewed` on render

**Gap Recovery (M-6, conditional):**
- Appears only if previous check-in has gap signals with |delta| >= 2
- Warm recovery language, e.g., "Your last check-in may have left some room on recognition. Consider opening with specific praise."
- Track `gapRecoveryViewed` on render

**Conversation Toolkit:**
- **Opening Move (M-2)** — AI-suggested opener derived from distilled employee preview. "✦ Regenerate" button. Editable text field.
- **Recognition Prep (M-3)** — Text field with "✦ Suggest" AI assist. Prompt: "What specific contribution will you recognize?"
- **Developmental Focus (M-4)** — Text field with "✦ Suggest" AI assist. Prompt: "What growth area will you focus on?"

"Mark Preparation Complete" button saves and sets `completedAt`.

### AI Assist Implementation

AI assist buttons call a `POST /api/grow/check-ins/[id]/assist` endpoint with:
- `field`: which toolkit field needs a suggestion
- `context`: check-in ID (server loads all context — employee preview, prior cycle data, goals)

Returns a generated suggestion. Uses the existing AI provider setup. Suggestions are non-binding — manager can edit or ignore.

**TODO:** Recognition prompts and developmental questions should filter through Leadership Library and org MVV (blocked on Leadership Library).
**TODO:** Developmental questions should calibrate to employee lifecycle stage (blocked on Lifecycle Stage definitions).

## Participate Phase

### 4-Move Structured Form

Both manager and employee have their own view open simultaneously during the conversation.

**Manager view — 4 moves:**

1. **Move 1: Open with the Employee** — Sees employee's opening text (live or after employee submits). AI "✦ Suggest opener" button. Manager captures their response notes.
2. **Move 2: Address Stuck Point** — Manager captures the discussion and actions identified. AI "✦ Coaching ideas" button.
3. **Move 3: Recognition, Development, Performance** — Three sub-sections in priority order. Recognition and Development have AI "✦ Suggest" buttons. Performance is optional and visually de-emphasized.
4. **Move 4: Mutual Commitment** — Manager writes their commitment. Sees employee's commitment (when submitted) with approve/flag action.

Collapsible prep notes available at top for reference during conversation.

**Employee view — simplified:**

1. **Your Opening** — What they shared (employee writes)
2. **Key Takeaways** — What stood out from the conversation (employee writes)
3. **Your Commitment** — One concrete next step (employee writes). Sees manager's commitment (when submitted) with approve/flag action.

### Mutual Commitment Approval

After both parties submit their parts:
- Each sees the other's commitment with an "Approve" or "This isn't what we agreed on" action
- "Flag" sends the commitment back to the author for editing
- Status stays `in_progress` until both commitments are approved
- Once both approved, `participate.completedAt` is set, status transitions to `reflecting`

### Employee-Sourced Fields

| Field | Written by | Visible to |
|---|---|---|
| `employeeOpening` | Employee | Manager (read-only in Move 1) |
| `employeeKeyTakeaways` | Employee | Manager (read-only, after completion) |
| `stuckPointDiscussion` | Manager | Employee (after completion) |
| `recognition` | Manager | Employee (after completion) |
| `development` | Manager | Employee (after completion) |
| `performance` | Manager | Employee (after completion) |
| `employeeCommitment` | Employee | Manager (for approval) |
| `managerCommitment` | Manager | Employee (for approval) |

## Reflect Phase

### Employee Reflect (EP-1 through EP-5)

5 Likert-scale dimensions (1-5), each with a contextual question and anchored endpoints:

| Dimension | Question | Low anchor | High anchor |
|---|---|---|---|
| Heard (EP-1) | Did you feel your perspective was genuinely heard? | Not at all | Completely |
| Clarity (EP-2) | Do you feel clear on what you committed to and confident you can deliver? | Not at all | Completely |
| Recognition (EP-3) | Did you feel your contributions were seen and named specifically? | Not at all | Completely |
| Development (EP-4) | Did this conversation feel focused on your growth and future? | Past-focused | Growth-focused |
| Safety (EP-5) | Did you feel comfortable being fully honest? | Not safe | Fully safe |

Privacy notice: "Your responses are completely private — they are never shared with your manager."

Submit saves to `employeeReflect` fields and sets `completedAt`.

### Manager Reflect (MP-1 through MP-5)

4 Likert dimensions + 1 free text:

| Dimension | Question |
|---|---|
| Clarity (MP-1) | What specific next step did this employee leave with? If you're not certain, what might that tell you? |
| Recognition (MP-2) | Did you name something specific this employee did well — particular to this period? |
| Development (MP-3) | How much of this conversation was about growth versus current performance? Does that balance feel right? |
| Safety (MP-4) | Was there anything that felt unfinished, avoided, or harder to say than it should have been? |
| Forward Action (MP-5) | What is the one thing you want to do differently or follow up on before the next check-in? (free text) |

Privacy notice: "Your responses are private — your employee will not see them."

Forward Action feeds into next cycle's Context Briefing (M-1).

### Gap Signal Computation

Triggered after both Reflect phases complete (either by submission or 24h window close):

```
gap.clarity     = managerReflect.clarity     - employeeReflect.clarity
gap.recognition = managerReflect.recognition - employeeReflect.recognition
gap.development = managerReflect.development - employeeReflect.development
gap.safety      = managerReflect.safety      - employeeReflect.safety
```

**Thresholds:**
- |delta| = 0 → Aligned (green) — no action
- |delta| = 1 → Watch (yellow) — no action, tracked for patterns
- |delta| >= 2 → Gap detected (red) — triggers gap recovery prompt in next Prepare

Negative delta means employee rated lower than manager (manager overestimates the conversation quality).

**Display:** Gap signals shown as color-coded cards in the manager's next Prepare context briefing. Each card shows the dimension name, delta value, and status label.

### Loop Mechanism

- `managerReflect.forwardAction` → next check-in's `managerPrepare` context briefing (M-1)
- `participate.employeeCommitment` → next check-in's employee Progress Reflection anchor (E-1)
- Gap signals → next check-in's conditional Gap Recovery prompt (M-6)
- `previousCheckInId` links the chain

## API Routes

### New Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/me` | GET | Current user context |
| `/api/auth/users` | GET | Available users for dev picker |
| `/api/grow/check-ins` | GET | List check-ins (filtered by role) |
| `/api/grow/check-ins` | POST | Schedule a manual check-in |
| `/api/grow/check-ins/[id]` | GET | Full check-in data (privacy-filtered by role) |
| `/api/grow/check-ins/[id]/prepare` | PATCH | Save Prepare phase data |
| `/api/grow/check-ins/[id]/participate` | PATCH | Save Participate phase data |
| `/api/grow/check-ins/[id]/reflect` | PATCH | Save Reflect phase data |
| `/api/grow/check-ins/[id]/approve` | POST | Approve mutual commitment |
| `/api/grow/check-ins/[id]/assist` | POST | AI assist for toolkit suggestions |
| `/api/grow/check-ins/[id]/cancel` | POST | Cancel a check-in |
| `/api/cron/check-ins` | POST | Cron: scheduling, transitions, gap computation |
| `/api/notifications` | GET | Fetch user notifications (extend existing) |
| `/api/notifications/[id]/read` | PATCH | Mark notification as read |

### Privacy Enforcement

All GET routes for check-in data filter fields based on the requesting user's role:
- Employee sees: own Prepare, own Participate fields, own Reflect, linked goal names. Never sees manager Prepare, manager Reflect, or gap signals.
- Manager sees: distilled employee preview (never raw), own Prepare, full Participate, own Reflect, gap signals. Never sees raw employee Prepare or employee Reflect scores.
- HR sees: aggregate gap patterns only (TODO: blocked on Canopy).

## Component Tree

```
apps/platform/src/
├── app/
│   ├── grow/
│   │   └── check-ins/
│   │       └── [id]/
│   │           └── page.tsx              # Dedicated check-in page
│   └── api/
│       ├── auth/
│       │   ├── me/route.ts
│       │   └── users/route.ts
│       ├── grow/
│       │   └── check-ins/
│       │       ├── route.ts              # GET list, POST create
│       │       └── [id]/
│       │           ├── route.ts          # GET detail
│       │           ├── prepare/route.ts
│       │           ├── participate/route.ts
│       │           ├── reflect/route.ts
│       │           ├── approve/route.ts
│       │           ├── assist/route.ts
│       │           └── cancel/route.ts
│       ├── cron/
│       │   └── check-ins/route.ts
│       └── notifications/
│           ├── route.ts                  # extend existing
│           └── [id]/
│               └── read/route.ts
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx
│   │   └── user-picker.tsx
│   ├── grow/
│   │   ├── checkins-panel.tsx            # Dashboard tab (replaces minimal existing)
│   │   └── check-in/
│   │       ├── check-in-page.tsx         # Phase-aware container
│   │       ├── phase-stepper.tsx
│   │       ├── prepare-employee.tsx
│   │       ├── prepare-manager.tsx
│   │       ├── participate-manager.tsx
│   │       ├── participate-employee.tsx
│   │       ├── reflect-employee.tsx
│   │       ├── reflect-manager.tsx
│   │       ├── gap-signals.tsx
│   │       ├── commitment-approval.tsx
│   │       └── ai-assist-button.tsx
│   └── notifications/
│       └── notification-center.tsx       # extend existing
└── lib/
    ├── auth/
    │   └── auth-context.tsx
    └── validations/
        └── check-in.ts                  # updated Zod schemas
```

## Workflow Tool Changes

The existing `startCheckInTool` in `grow-tools.ts` evolves:
- Instead of opening a working document form, it now creates/schedules a check-in and returns a link to `/grow/check-ins/[id]`
- The tool can still be invoked from chat: "Run a check-in with Sarah" → creates the check-in, returns link
- The workflow definition (`run-check-in.ts`) intake fields updated to match new schema
- The old `CheckInForm` in `components/grow/forms/` is replaced by the phase-specific components

## TODO Blockers

Track as GitHub issues — not built in this phase:

| Blocker | Blocks | Requirement Refs |
|---|---|---|
| Leadership Library | M-3 recognition prompts, M-4 developmental questions should filter through org MVV and leadership standards | Cross-View: MVV, Manager Prepare: M-3, M-4 |
| Lifecycle Stage definitions | M-4 developmental question should auto-calibrate to employee lifecycle stage (Onboarding, Development Stretch, Plateau Risk, Transition) | Cross-View: Lifecycle Stage Definitions |
| Canopy integration | Gap signals after 3+ consecutive cycles should surface aggregate patterns to HR via Canopy | HR View: Gap Signals, Loop: Pattern Signals to Canopy |
| Reflect feature linkage | Persistent gaps, safety issues, lifecycle milestones should be able to trigger Reflect for deeper conversation | Loop: Reflect Linkage |
| AI distilled preview | Employee Prepare → Manager context briefing needs AI-generated non-verbatim summary. Stub with truncation for now. | Employee Prepare: all, Manager Prepare: M-1, M-2 |
| Values-aligned communication | Recognition, coaching, and responses should be guided by org MVV from Strategy Studio | Cross-View: MVV, Participate: Values-Aligned Communication |
| Team/role-level cadence config | Check-in cadence currently per-goal only, not per-team or per-role | Cross-View: Check-in Cadence |
