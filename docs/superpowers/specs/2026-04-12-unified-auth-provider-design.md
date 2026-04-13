# Unified Auth Provider — Design Spec

**Date:** 2026-04-12
**Branch:** `feat/29-check-ins-lifecycle`
**Status:** Approved, ready for implementation plan

## Goal

Remove the legacy `RoleSwitcher` (HR/Manager/Employee segmented control + "Sarah Chen — HR Manager" persona dropdown) and the underlying `RoleProvider`/`useRole` stack. The newer `UserPicker` + `AuthProvider` become the single source of truth for "who am I?" across every page of the platform app.

Today, `top-header.tsx` renders **both** switchers side by side, and `app/layout.tsx` wraps the tree in **both** providers. Each page individually decides which hook to consume. This spec consolidates onto one.

## Non-goals

- No new authentication/authorization semantics. We remain in dev-mode, identified by the `x-dev-user-id` request header.
- No UI redesign of `UserPicker` itself.
- No API contract changes beyond `/api/auth/me` adding four employee fields.
- No changes to server-side identity resolution (already based on `x-dev-user-id`).

## Current state

### New (keep)
- **`lib/auth/auth-context.tsx`** — defines `AuthContext`, `AuthUser`, `UserRole`, `useAuth()`
- **`components/auth/auth-provider.tsx`** — `AuthProvider`, persists selected user id in `localStorage` under `ascenta-dev-user-id`, fetches user via `GET /api/auth/me` with `x-dev-user-id` header
- **`components/auth/user-picker.tsx`** — dropdown in `TopHeader` right side; fetches `/api/auth/users` on open; calls `switchUser(id)` on select
- **`AuthUser` shape today:** `{ id, employeeId, name, role, managerId?, directReports? }`

### Legacy (delete)
- **`lib/role/role-context.tsx`** — `RoleProvider`, `useRole()`, `ResolvedPersona`
- **`lib/role/personas.ts`** — `SEED_PERSONAS`, `DEFAULT_ROLE`, `PersonaConfig`, `RoleType`
- **`components/role-switcher.tsx`** — segmented role control + persona `<select>` in `TopHeader` left side
- **`lib/constants/mock-user.ts`** — already marked `@deprecated`

### Callers that need migration (10 files)
Consumers of `useRole()` or `ResolvedPersona`:

1. `app/do/page.tsx` — reads `persona.{id, employeeId, firstName, lastName, department, title}` to build `employeeInfo` passed to `sendMessage()`
2. `components/grow/reviews-panel.tsx` — reads `persona`, `loading`; already imports `useAuth` (partial migration)
3. `components/grow/goals-panel.tsx` — reads `role`, `persona`, `loading`; already imports `useAuth`
4. `components/grow/checkins-panel.tsx` — reads `role`, `persona` (2 call sites); already imports `useAuth`
5. `components/plan/my-strategy-view.tsx` — reads `role`, `persona`, `loading`
6. `components/plan/foundation-panel.tsx` — reads `role`
7. `components/plan/strategy-panel.tsx` — reads `role`, `persona`
8. `components/do-tab-chat.tsx` — reads `persona.firstName`, `persona.lastName`
9. `components/chat/suggest-prompt-pills.tsx` — imports `ResolvedPersona` type only
10. `lib/utils/resolve-prompt.ts` — accepts `ResolvedPersona | null` parameter, reads `firstName`, `lastName`

## Migration mapping

| Old `useRole()` | New `useAuth()` |
|---|---|
| `role: RoleType` | `user?.role: UserRole` (same `"hr" \| "manager" \| "employee"` literals) |
| `persona: ResolvedPersona \| null` | `user: AuthUser \| null` |
| `persona.id` | `user.id` |
| `persona.employeeId` | `user.employeeId` |
| `persona.firstName` | `user.firstName` *(new field — see below)* |
| `persona.lastName` | `user.lastName` *(new field)* |
| `persona.title` | `user.title` *(new field)* |
| `persona.department` | `user.department` *(new field)* |
| `loading` | `loading` |
| `setRole` / `setPersona` / `personas` | **removed** — identity switching only happens in `UserPicker` |

## Extending `AuthUser`

Current `AuthUser` carries only a concatenated `name`. Several callers use `firstName`/`lastName` separately for display or downstream payloads, and some use `title`/`department`. The cleanest migration is to extend `AuthUser` so each caller becomes a mechanical `persona.X` → `user.X` rename.

**New `AuthUser` shape:**
```ts
export type AuthUser = {
  id: string;
  employeeId: string;
  name: string;           // existing — kept for components that use it directly
  firstName: string;      // new
  lastName: string;       // new
  role: UserRole;
  title: string;          // new
  department: string;     // new
  managerId?: string;
  directReports?: string[];
};
```

**Server change:** `GET /api/auth/me` (and `GET /api/auth/users`, since `UserPicker` consumes it) must include these four fields from the underlying employee document. The Employee schema already has `firstName`, `lastName`, `jobTitle`, `department` — the API routes just need to project them into the response.

Handler for `user.name` stays as `firstName + " " + lastName`.

## Layout changes

### `app/layout.tsx`
- Remove `import { RoleProvider } from "@/lib/role/role-context"`
- Remove `<RoleProvider>` wrapper and the associated "superseded by AuthProvider" comment
- `<AuthProvider>` becomes the sole identity provider; `<ChatProvider>` stays nested inside it

### `components/top-header.tsx`
- Remove `import { RoleSwitcher } from "@/components/role-switcher"`
- Remove `<RoleSwitcher />` render

## Caller-by-caller changes

Each caller follows the mapping table. A few specific notes:

- **`lib/utils/resolve-prompt.ts`** — parameter type changes from `ResolvedPersona | null` to `AuthUser | null`. Body uses `user.name` directly (already a concatenated string) instead of rebuilding from `firstName`/`lastName`. Remove `ResolvedPersona` import.
- **`components/chat/suggest-prompt-pills.tsx`** — type import switches from `ResolvedPersona` (from `@/lib/role/role-context`) to `AuthUser` (from `@/lib/auth/auth-context`).
- **`app/do/page.tsx`** — the `employeeInfo` object passed to `sendMessage` now reads `{ user.id, user.employeeId, user.firstName, user.lastName, user.department, user.title }`.
- **Components already importing both hooks** (reviews-panel, goals-panel, checkins-panel) — drop the `useRole` import and replace all remaining `persona`/`role` references with `user`/`user?.role`. Remove the `roleLoading` alias in favor of the auth `loading`.

No caller currently uses `setRole`, `setPersona`, or `personas` for anything other than rendering `RoleSwitcher`, so there is no replacement needed.

## Verification

- `pnpm tsc --noEmit` passes with no `useRole`/`RoleProvider`/`ResolvedPersona`/`PersonaConfig`/`RoleType` references anywhere under `apps/platform/src`
- `pnpm lint` passes (no unused imports left behind)
- `pnpm test` passes
- Manual smoke test: start `pnpm dev`, confirm:
  - Top header shows only `UserPicker` on the right
  - Switching users via `UserPicker` updates the header label and the active page
  - `/do`, `/grow/performance` (goals + check-ins + reviews), `/plan/*` pages all render without "useRole must be used within RoleProvider" errors
  - Pre-seeded chat links (`/do?prompt=...`) still attach correct `employeeInfo`

## Risk & rollback

- **Blast radius:** 10 caller files migrated + 3 infrastructure files modified (`lib/auth/auth-context.tsx`, `app/layout.tsx`, `components/top-header.tsx`), 4 files deleted, 2 API routes extended (`/api/auth/me`, `/api/auth/users`). Entirely within `apps/platform`.
- **Rollback:** revert the single PR. No data migration, no API-breaking changes for external consumers.
