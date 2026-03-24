# Role Emulation — Design Spec

**Date:** 2026-03-23
**Purpose:** Emulate HR, Manager, and Employee roles for demo/development without real auth, so pages can render role-appropriate views.

---

## Role Switcher UI

A persistent control in the `TopHeader` component (top-right, near existing Settings/Notifications/User icon buttons):

1. **Role selector** — Segmented control: HR / Manager / Employee
2. **Persona selector** — Dropdown showing seed personas for the selected role

Defaults to HR + default HR persona on first load. Selection persists in `localStorage` across page refreshes.

---

## Seed Personas

The seed script (`packages/db/scripts/seed-employees.ts`) must be updated to deterministically insert these three personas **before** the random employees. This ensures they always exist with the correct names, departments, and titles.

| Role | Default Persona | Title | Department | Notes |
|------|----------------|-------|------------|-------|
| HR | Sarah Chen | HR Manager | HR | Full admin access |
| Manager | Jason Lee | Engineering Manager | Engineering | Has direct reports |
| Employee | Alex Rivera | Software Engineer | Engineering | Has goals |

If a persona isn't found in the DB after seed (e.g., DB wasn't seeded), the switcher shows a warning message.

---

## Role Context

React context provider (`RoleProvider`) wrapping the app **outside** `ChatProvider` (so chat context can access the role). Exposes via `useRole()` hook:

- `role` — `"hr" | "manager" | "employee"`
- `persona` — `{ id: string; firstName: string; lastName: string; title: string; department: string }` (DB-resolved employee)
- `setRole(role)` — switches role and auto-selects default persona for that role
- `setPersona(persona)` — switches persona within current role
- `loading` — boolean, true while resolving persona from DB

**Initialization:** On mount, reads role + persona name from `localStorage`. Fetches the persona's employee record from `/api/dashboard/employees?search={firstName}` to resolve the DB ID. Falls back to defaults if not found.

**During loading:** Components should render normally with a null persona. The switcher shows a loading indicator. No full-page spinner.

**On role/persona switch:** Chat state is not reset — conversations persist independently per page key (existing ChatContext behavior). The persona change only affects which data is fetched and which UI controls are shown.

---

## Role Behaviors

### HR
- All admin actions: publish, edit, create, archive
- Sees all employees, all departments
- Foundation: edit + publish mode
- Strategy: all goals + create/edit/archive
- Goals: can view any employee's goals

### Manager
- Edit/create on their team's data
- "My Team" view showing direct reports
- Foundation: read-only display
- Strategy: company goals (read-only) + own department goals (create/edit)
- Goals: sees their own goals + direct reports' goals

### Employee
- Read-only on company content (MVV, company strategy goals)
- Sees only their own goals/check-ins
- Foundation: read-only display
- Strategy: read-only, filtered to company + their department
- Goals: own goals only, no create (uses Do chat for that)

---

## New Files

| File | Responsibility |
|------|---------------|
| `apps/platform/src/lib/role/personas.ts` | Seed persona config — names, titles, departments per role |
| `apps/platform/src/lib/role/role-context.tsx` | RoleProvider context, useRole hook, localStorage persistence, DB resolution |
| `apps/platform/src/components/role-switcher.tsx` | TopHeader dropdown — role segmented control + persona picker |

## Modified Files

| File | Change |
|------|--------|
| `packages/db/scripts/seed-employees.ts` | Insert 3 deterministic personas before random employees |
| `apps/platform/src/app/layout.tsx` | Wrap app in RoleProvider (outside ChatProvider) |
| `apps/platform/src/components/top-header.tsx` | Add RoleSwitcher component |
| `apps/platform/src/components/plan/foundation-panel.tsx` | Check role for edit vs read-only |
| `apps/platform/src/components/plan/strategy-panel.tsx` | Filter by role, conditionally show create/edit/archive |
| `apps/platform/src/components/grow/goals-panel.tsx` | Use persona ID instead of hardcoded "Jason" lookup |
| `apps/platform/src/components/do-tab-chat.tsx` | Replace MOCK_USER with persona from useRole() |
| `apps/platform/src/components/chat/suggest-prompt-pills.tsx` | Replace MockUser type with persona from useRole() |
| `apps/platform/src/lib/utils/resolve-prompt.ts` | Replace MockUser type with role persona type |
| `apps/platform/src/lib/constants/mock-user.ts` | Deprecate/remove — replaced by role context |

---

## Out of Scope

- Real authentication / login
- Role-based API route protection (all routes remain open)
- Per-route access control or redirects
- Manager approval workflows
