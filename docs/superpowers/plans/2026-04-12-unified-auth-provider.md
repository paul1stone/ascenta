# Unified Auth Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy `RoleSwitcher` + `RoleProvider`/`useRole` stack with the new `UserPicker` + `AuthProvider`/`useAuth` stack as the single source of identity across every page of the platform app.

**Architecture:** Additive first (extend `AuthUser` with `firstName`, `lastName`, `title`, `department` so callers are mechanical renames). Migrate callers one at a time, each commit green under `tsc --noEmit`. Tear down the legacy provider, switcher, and constants only after all callers are migrated. Manual smoke test closes the loop.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, pnpm/Turborepo monorepo. No new libraries. No test framework changes — existing vitest config.

**Working directory:** all commands and paths run from the worktree root `/Users/jason/personal-repos/ascenta/.worktrees/feat/29-check-ins-lifecycle`. All file paths below are relative to that root.

**Branch:** `feat/29-check-ins-lifecycle`

**Verification strategy:** This is a mechanical refactor with no new behavior, so the TDD loop is replaced by a typecheck loop. After every task, `pnpm --filter=@ascenta/platform exec tsc --noEmit` must pass (or fail only in the specific way the task describes). The final smoke test in Task 15 is the behavioral verification.

---

## File Inventory

### Files to create
None. This plan only modifies and deletes.

### Files to modify
| Path | Responsibility |
|---|---|
| `apps/platform/src/lib/auth/auth-context.tsx` | Extend `AuthUser` type with `firstName`, `lastName`, `title`, `department` |
| `apps/platform/src/app/api/auth/me/route.ts` | Project new fields into response |
| `apps/platform/src/app/api/auth/users/route.ts` | Rename `jobTitle` → `title`, add `firstName`/`lastName` |
| `apps/platform/src/components/auth/user-picker.tsx` | Read `title` instead of `jobTitle` |
| `apps/platform/src/app/do/page.tsx` | `useRole` → `useAuth` |
| `apps/platform/src/components/grow/reviews-panel.tsx` | Drop `useRole` import and fallback |
| `apps/platform/src/components/grow/goals-panel.tsx` | Drop `useRole`, use `user.*` throughout |
| `apps/platform/src/components/grow/checkins-panel.tsx` | Drop `useRole`, use `user.*` in two functions |
| `apps/platform/src/components/plan/my-strategy-view.tsx` | `useRole` → `useAuth` |
| `apps/platform/src/components/plan/foundation-panel.tsx` | `useRole` → `useAuth` |
| `apps/platform/src/components/plan/strategy-panel.tsx` | `useRole` → `useAuth` |
| `apps/platform/src/components/do-tab-chat.tsx` | `useRole` → `useAuth`, pass `AuthUser` to `SuggestPromptPills` |
| `apps/platform/src/components/chat/suggest-prompt-pills.tsx` | Prop type `ResolvedPersona` → `AuthUser` |
| `apps/platform/src/lib/utils/resolve-prompt.ts` | Parameter type `ResolvedPersona` → `AuthUser` |
| `apps/platform/src/components/top-header.tsx` | Remove `<RoleSwitcher />` and its import |
| `apps/platform/src/app/layout.tsx` | Remove `<RoleProvider>` wrapper and import |

### Files to delete
- `apps/platform/src/lib/role/role-context.tsx`
- `apps/platform/src/lib/role/personas.ts`
- `apps/platform/src/components/role-switcher.tsx`
- `apps/platform/src/lib/constants/mock-user.ts`

If the `apps/platform/src/lib/role/` directory becomes empty after these deletes, it will be removed by `git rm`.

---

## Task 1: Extend `AuthUser` type and update `/api/auth/me`

**Rationale:** Do the additive type + server change first so every subsequent caller migration is safe (existing code continues to compile; new fields become available). By making this change first, later tasks that rename `persona.firstName` → `user.firstName` won't hit missing-field TS errors.

**Files:**
- Modify: `apps/platform/src/lib/auth/auth-context.tsx`
- Modify: `apps/platform/src/app/api/auth/me/route.ts`

- [ ] **Step 1: Extend the `AuthUser` type**

Replace the `AuthUser` type in `apps/platform/src/lib/auth/auth-context.tsx` (currently lines 7-14):

```ts
export type AuthUser = {
  id: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  title: string;
  department: string;
  managerId?: string;
  directReports?: string[];
};
```

- [ ] **Step 2: Update `/api/auth/me` response**

In `apps/platform/src/app/api/auth/me/route.ts`, the return at the end of the `GET` handler (currently lines 64-75) must include the new fields. Replace the final `return NextResponse.json(...)` block with:

```ts
return NextResponse.json({
  user: {
    id: employee._id.toString(),
    employeeId: employee.employeeId,
    name: `${employee.firstName} ${employee.lastName}`,
    firstName: employee.firstName,
    lastName: employee.lastName,
    role,
    title: employee.jobTitle,
    department: employee.department,
    managerId,
    directReports: hasDirectReports
      ? directReports.map((r) => r._id.toString())
      : undefined,
  },
});
```

Note: `employee.jobTitle` already flows through the `.select(...)` projection on line 26, so no other changes to that handler are needed.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: PASS. Adding fields to `AuthUser` is additive and doesn't break any existing reader. Every current `user.id`, `user.name`, etc. still compiles.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/auth/auth-context.tsx apps/platform/src/app/api/auth/me/route.ts
git commit -m "$(cat <<'EOF'
feat(auth): extend AuthUser with firstName/lastName/title/department

Adds the four fields needed by the Grow/Plan panels that currently
consume useRole() -- paves the way to migrate them onto useAuth().

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Update `/api/auth/users` response shape and `UserPicker`

**Rationale:** `/api/auth/users` currently returns `jobTitle`. For consistency with `AuthUser.title`, rename in both the API and its sole consumer (`UserPicker`). Also surface `firstName`/`lastName` so the picker can display them if needed (and for future consumers).

**Files:**
- Modify: `apps/platform/src/app/api/auth/users/route.ts`
- Modify: `apps/platform/src/components/auth/user-picker.tsx`

- [ ] **Step 1: Update `/api/auth/users` response**

In `apps/platform/src/app/api/auth/users/route.ts`, replace the `return` expression inside `employees.map(...)` (currently lines 51-60) with:

```ts
    return {
      id: emp._id.toString(),
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      title: emp.jobTitle,
      role,
      managerId,
      managerName: emp.managerName,
    };
```

This removes `jobTitle` from the response in favor of `title`.

- [ ] **Step 2: Update `PickerUser` type and usage in `UserPicker`**

In `apps/platform/src/components/auth/user-picker.tsx`, replace the `PickerUser` type (currently lines 14-21):

```ts
type PickerUser = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  title: string;
  role: "manager" | "employee" | "hr";
};
```

Then find the line that reads `u.jobTitle` (currently line 116) and change it to `u.title`:

```tsx
              <div className="text-xs text-muted-foreground">
                {u.title} · {u.department}
              </div>
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/auth/users/route.ts apps/platform/src/components/auth/user-picker.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): rename jobTitle to title in /api/auth/users

Aligns UserPicker's response shape with the extended AuthUser type.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Migrate `lib/utils/resolve-prompt.ts`

**Rationale:** Tiny, isolated. Handle it first so `suggest-prompt-pills.tsx` and callers above don't import the about-to-be-deleted `ResolvedPersona` type.

**Files:**
- Modify: `apps/platform/src/lib/utils/resolve-prompt.ts`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `apps/platform/src/lib/utils/resolve-prompt.ts` with:

```ts
import type { AuthUser } from "@/lib/auth/auth-context";

/**
 * Resolves template tokens in prompt strings.
 * Supported tokens: {{userName}}, {{directReport}} (placeholder for now)
 * Unknown tokens are left as-is.
 *
 * Note: {{directReport}} now resolves to a placeholder. Direct report data
 * is not available on AuthUser. When a team/reports feature is added,
 * this can be restored.
 */
export function resolvePrompt(template: string, user: AuthUser | null): string {
  const name = user ? user.name : "there";
  return template
    .replace(/\{\{userName\}\}/g, name)
    .replace(/\{\{directReport\}\}/g, "a team member");
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: **FAIL** on `apps/platform/src/components/chat/suggest-prompt-pills.tsx` (the only caller of `resolvePrompt`), because `suggest-prompt-pills` still passes a `ResolvedPersona | null` which now doesn't match `AuthUser | null`. That's expected — Task 4 fixes it.

- [ ] **Step 3: Do not commit yet**

We'll commit together with Task 4, since the intermediate state doesn't typecheck.

---

## Task 4: Migrate `components/chat/suggest-prompt-pills.tsx`

**Rationale:** Consumer of `resolvePrompt`; closes the typecheck break from Task 3.

**Files:**
- Modify: `apps/platform/src/components/chat/suggest-prompt-pills.tsx`

- [ ] **Step 1: Swap the type import and prop type**

In `apps/platform/src/components/chat/suggest-prompt-pills.tsx`:

Replace line 8:
```ts
import type { ResolvedPersona } from "@/lib/role/role-context";
```
with:
```ts
import type { AuthUser } from "@/lib/auth/auth-context";
```

Then in the `SuggestPromptPillsProps` interface (currently lines 11-17), change:
```ts
  user: ResolvedPersona | null;
```
to:
```ts
  user: AuthUser | null;
```

No changes are needed to the body — `user` is only passed through to `resolvePrompt`, which now accepts `AuthUser | null`.

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: **FAIL** on `apps/platform/src/components/do-tab-chat.tsx` — it still passes `persona` (a `ResolvedPersona | null`) as the `user` prop to `SuggestPromptPills`. Task 5 fixes it.

- [ ] **Step 3: Do not commit yet**

---

## Task 5: Migrate `components/do-tab-chat.tsx`

**Rationale:** The consumer of `SuggestPromptPills` and the last caller tied to `ResolvedPersona`. After this, `lib/utils/` and `components/chat/` are clean.

**Files:**
- Modify: `apps/platform/src/components/do-tab-chat.tsx`

- [ ] **Step 1: Swap the import**

Replace line 16:
```ts
import { useRole } from "@/lib/role/role-context";
```
with:
```ts
import { useAuth } from "@/lib/auth/auth-context";
```

- [ ] **Step 2: Swap the hook call**

Replace line 50:
```ts
  const { persona } = useRole();
```
with:
```ts
  const { user } = useAuth();
```

- [ ] **Step 3: Update the working-document block (the chat-to-form sync logic)**

Inside the `useEffect` that processes working-document blocks (currently around lines 96-123), the fallback to the current user's identity uses `persona?.id` and `persona.firstName`/`persona.lastName`. Replace the entire `if (wd.action === "open_working_document" && wd.workflowType) { ... }` block with:

```tsx
      if (wd.action === "open_working_document" && wd.workflowType) {
        // Use AI-provided employee info if valid, otherwise fall back to current auth user
        const aiEmployeeId = wd.employeeId ?? "";
        const aiEmployeeName = wd.employeeName ?? "";
        const hasValidAiEmployee =
          aiEmployeeId &&
          aiEmployeeId !== "CURRENT_USER" &&
          aiEmployeeName &&
          !aiEmployeeName.toLowerCase().includes("current user");
        const employeeId = hasValidAiEmployee
          ? aiEmployeeId
          : user?.id ?? "";
        const employeeName = hasValidAiEmployee
          ? aiEmployeeName
          : user
            ? `${user.firstName} ${user.lastName}`
            : "";
        const prefilled = {
          ...(wd.prefilled ?? {}),
          employeeId,
          employeeName,
        };
        openWorkingDocument(
          wd.workflowType as WorkflowType,
          wd.runId,
          employeeId,
          employeeName,
          prefilled,
          wd.availableGoals,
        );
      } else if (wd.action === "update_working_document" && wd.updates) {
        updateWorkingDocumentFields(wd.updates);
      }
```

- [ ] **Step 4: Update the greeting line**

Find (currently line 226):
```tsx
          {getGreeting(persona ? persona.firstName : "there")}
```
Replace with:
```tsx
          {getGreeting(user ? user.firstName : "there")}
```

- [ ] **Step 5: Update the `SuggestPromptPills` `user` prop**

Find (currently line 247):
```tsx
                user={persona}
```
Replace with:
```tsx
                user={user}
```

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: PASS for this file, but the overall typecheck will still fail on the remaining `useRole` callers (`app/do/page.tsx`, `reviews-panel.tsx`, `goals-panel.tsx`, `checkins-panel.tsx`, `my-strategy-view.tsx`, `foundation-panel.tsx`, `strategy-panel.tsx`). Those are handled next. No new errors should be introduced by this task.

- [ ] **Step 7: Commit Tasks 3-5 together**

```bash
git add apps/platform/src/lib/utils/resolve-prompt.ts apps/platform/src/components/chat/suggest-prompt-pills.tsx apps/platform/src/components/do-tab-chat.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): migrate chat prompt pipeline from useRole to useAuth

Flips resolvePrompt, SuggestPromptPills, and DoTabChat to consume
AuthUser instead of ResolvedPersona.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Migrate `app/do/page.tsx`

**Rationale:** Builds the `employeeInfo` object passed to `sendMessage` for URL-seeded prompts. Reads six persona fields — all now available on `AuthUser`.

**Files:**
- Modify: `apps/platform/src/app/do/page.tsx`

- [ ] **Step 1: Swap the import and hook**

Replace line 9:
```ts
import { useRole } from "@/lib/role/role-context";
```
with:
```ts
import { useAuth } from "@/lib/auth/auth-context";
```

Replace line 17:
```ts
  const { persona } = useRole();
```
with:
```ts
  const { user } = useAuth();
```

- [ ] **Step 2: Update the `employeeInfo` builder**

Replace the `employeeInfo` ternary inside the `setTimeout` (currently lines 35-44):

```ts
        const employeeInfo = user
          ? {
              id: user.id,
              employeeId: user.employeeId,
              firstName: user.firstName,
              lastName: user.lastName,
              department: user.department,
              title: user.title,
            }
          : undefined;
```

- [ ] **Step 3: Update the `useEffect` dependency array**

Find (currently line 52): `}, [searchParams, setPageInput, sendMessage, persona]);`
Replace with: `}, [searchParams, setPageInput, sendMessage, user]);`

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: `app/do/page.tsx` passes. Remaining errors only in the files still to migrate.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/do/page.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): migrate /do page seed to useAuth

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Migrate `components/grow/reviews-panel.tsx`

**Rationale:** Already partially migrated — it reads both `persona` (from `useRole`) and `user` (from `useAuth`). The persona path is a legacy fallback; we can drop it entirely.

**Files:**
- Modify: `apps/platform/src/components/grow/reviews-panel.tsx`

- [ ] **Step 1: Remove the `useRole` import**

Delete line 18:
```ts
import { useRole } from "@/lib/role/role-context";
```

- [ ] **Step 2: Remove the `useRole` hook call and fallback**

Replace lines 65-68:
```ts
  const { persona, loading: roleLoading } = useRole();
  const { user } = useAuth();
  // Prefer auth user's id; fall back to role persona for backwards compatibility
  const managerId = user?.id ?? persona?.employeeId ?? "";
```
with:
```ts
  const { user, loading: authLoading } = useAuth();
  const managerId = user?.id ?? "";
```

- [ ] **Step 3: Update the `useEffect` that depends on `roleLoading`**

Replace lines 104-110 (currently reading `roleLoading`) with:

```tsx
  useEffect(() => {
    if (managerId && !authLoading) {
      fetchReviews();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [managerId, authLoading, fetchReviews]);
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: `reviews-panel.tsx` passes. Remaining errors only in unmigrated files.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/grow/reviews-panel.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): drop useRole fallback from reviews-panel

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Migrate `components/grow/goals-panel.tsx`

**Rationale:** One of the two most-touched files. Reads `role`, `persona`, and uses both `user` (already imported) and `persona` side-by-side. Consolidate on `user`.

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`

- [ ] **Step 1: Remove the `useRole` import**

Delete line 25:
```ts
import { useRole } from "@/lib/role/role-context";
```

- [ ] **Step 2: Replace the hook calls and compound `canViewOthers` expression**

Replace lines 95-97:
```ts
  const { role, persona, loading: roleLoading } = useRole();
  const { user } = useAuth();
  const canViewOthers = user?.role === "manager" || user?.role === "hr" || role === "hr" || role === "manager";
```
with:
```ts
  const { user, loading: authLoading } = useAuth();
  const canViewOthers = user?.role === "manager" || user?.role === "hr";
```

- [ ] **Step 3: Update the `viewingEmployeeId`/`viewingEmployeeName` derivations**

Replace lines 110-115:
```ts
  const viewingEmployeeId = selectedEmployee?.id ?? persona?.id ?? user?.employeeId;
  const viewingEmployeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
    : persona
      ? `${persona.firstName} ${persona.lastName}`
      : "";
```
with:
```ts
  const viewingEmployeeId = selectedEmployee?.id ?? user?.id;
  const viewingEmployeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
    : user
      ? `${user.firstName} ${user.lastName}`
      : "";
```

Note: the legacy fallback to `user?.employeeId` is dropped because `user.id` is the actual Mongo ObjectId used by `/api/grow/goals` (the endpoint's `employeeId` query param accepts Mongo id; see the existing shape of `selectedEmployee?.id`). This matches how `persona?.id` (also a Mongo id — see `ResolvedPersona.id` in the old type) behaved before.

- [ ] **Step 4: Update `fetchGoals` dependency**

Replace line 147: `}, [viewingEmployeeId, roleLoading]);`
with: `}, [viewingEmployeeId, authLoading]);`

Replace line 119: `if (roleLoading) return;` with: `if (authLoading) return;`

- [ ] **Step 5: Update `EmployeeCombobox` `department` prop**

Find (currently line 670):
```tsx
                department={role === "manager" ? persona?.department : undefined}
```
Replace with:
```tsx
                department={user?.role === "manager" ? user?.department : undefined}
```

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: `goals-panel.tsx` passes. Remaining errors only in unmigrated files.

- [ ] **Step 7: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): migrate goals-panel from useRole to useAuth

Consolidates identity reads onto the auth user, dropping the parallel
useRole persona path.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Migrate `components/grow/checkins-panel.tsx`

**Rationale:** Same shape as goals-panel — `useAuth` already imported, `useRole` used alongside. Two call sites (`ScheduleDialog` and the main panel).

**Files:**
- Modify: `apps/platform/src/components/grow/checkins-panel.tsx`

- [ ] **Step 1: Remove the `useRole` import**

Delete line 29:
```ts
import { useRole } from "@/lib/role/role-context";
```

- [ ] **Step 2: Update `ScheduleDialog` hook usage**

Inside the `ScheduleDialog` component, replace lines 151-153:
```ts
  const { user } = useAuth();
  const { role, persona } = useRole();
  const canSelectEmployee = role === "hr" || role === "manager";
```
with:
```ts
  const { user } = useAuth();
  const canSelectEmployee = user?.role === "hr" || user?.role === "manager";
```

- [ ] **Step 3: Update `EmployeeCombobox` `department` prop inside `ScheduleDialog`**

Find (currently line 269-271):
```tsx
                department={
                  role === "manager" ? persona?.department : undefined
                }
```
Replace with:
```tsx
                department={
                  user?.role === "manager" ? user?.department : undefined
                }
```

- [ ] **Step 4: Remove the unused `role` read in the main panel**

Inside the `CheckinsPanel` function, delete line 382:
```ts
  const { role } = useRole();
```
(The `role` variable inside `CheckinsPanel` is unused — the component reads `apiRole` from the check-ins API response instead. Verify by searching: after deleting, there should be no bare `role` reference in `CheckinsPanel`'s body.)

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: `checkins-panel.tsx` passes. Remaining errors only in unmigrated files.

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/grow/checkins-panel.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): migrate checkins-panel from useRole to useAuth

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Migrate `components/plan/my-strategy-view.tsx`

**Rationale:** Reads `role`, `persona?.id`, and `roleLoading`. Straight swap.

**Files:**
- Modify: `apps/platform/src/components/plan/my-strategy-view.tsx`

- [ ] **Step 1: Swap the import**

Replace line 5:
```ts
import { useRole } from "@/lib/role/role-context";
```
with:
```ts
import { useAuth } from "@/lib/auth/auth-context";
```

- [ ] **Step 2: Swap the hook call**

Replace line 53:
```ts
  const { role, persona, loading: roleLoading } = useRole();
```
with:
```ts
  const { user, loading: authLoading } = useAuth();
```

- [ ] **Step 3: Update the `useEffect` gate and fetch**

Replace line 59:
```ts
    if (roleLoading || !persona?.id) return;
```
with:
```ts
    if (authLoading || !user?.id) return;
```

Replace line 64:
```ts
        const res = await fetch(`/api/plan/my-strategy?employeeId=${persona!.id}`);
```
with:
```ts
        const res = await fetch(`/api/plan/my-strategy?employeeId=${user!.id}`);
```

Replace the dependency array on line 79:
```ts
    }, [persona?.id, roleLoading]);
```
with:
```ts
    }, [user?.id, authLoading]);
```

- [ ] **Step 4: Update the loading gate**

Replace line 81:
```ts
  if (loading || roleLoading) {
```
with:
```ts
  if (loading || authLoading) {
```

- [ ] **Step 5: Update the `role` reads**

Replace line 110:
```tsx
          {role === "hr" && " Go to Strategy Studio \u2192 Translations to generate one."}
```
with:
```tsx
          {user?.role === "hr" && " Go to Strategy Studio \u2192 Translations to generate one."}
```

Replace lines 117-118:
```ts
  const isManager = role === "manager" || employee.isManager;
  const isHR = role === "hr";
```
with:
```ts
  const isManager = user?.role === "manager" || employee.isManager;
  const isHR = user?.role === "hr";
```

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: `my-strategy-view.tsx` passes.

- [ ] **Step 7: Commit**

```bash
git add apps/platform/src/components/plan/my-strategy-view.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): migrate my-strategy-view from useRole to useAuth

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Migrate `components/plan/foundation-panel.tsx`

**Rationale:** Smallest migration — only reads `role`.

**Files:**
- Modify: `apps/platform/src/components/plan/foundation-panel.tsx`

- [ ] **Step 1: Swap the import**

Replace line 6:
```ts
import { useRole } from "@/lib/role/role-context";
```
with:
```ts
import { useAuth } from "@/lib/auth/auth-context";
```

- [ ] **Step 2: Swap the hook call**

Replace lines 44-45:
```ts
  const { role } = useRole();
  const isAdmin = role === "hr";
```
with:
```ts
  const { user } = useAuth();
  const isAdmin = user?.role === "hr";
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: `foundation-panel.tsx` passes.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/plan/foundation-panel.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): migrate foundation-panel from useRole to useAuth

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Migrate `components/plan/strategy-panel.tsx`

**Rationale:** Last `useRole` caller. Reads `role` and `persona?.department` in three expressions.

**Files:**
- Modify: `apps/platform/src/components/plan/strategy-panel.tsx`

- [ ] **Step 1: Swap the import**

Replace line 18:
```ts
import { useRole } from "@/lib/role/role-context";
```
with:
```ts
import { useAuth } from "@/lib/auth/auth-context";
```

- [ ] **Step 2: Swap the hook and role-derived booleans**

Replace lines 65-67:
```ts
  const { role, persona } = useRole();
  const canCreate = role === "hr" || role === "manager";
  const canEditAll = role === "hr";
```
with:
```ts
  const { user } = useAuth();
  const canCreate = user?.role === "hr" || user?.role === "manager";
  const canEditAll = user?.role === "hr";
```

- [ ] **Step 3: Update the `visibleGoals` department filter**

Replace lines 118-124:
```ts
  const visibleGoals =
    role === "employee"
      ? filteredGoals.filter(
          (g) =>
            g.scope === "company" || g.department === persona?.department,
        )
      : filteredGoals;
```
with:
```ts
  const visibleGoals =
    user?.role === "employee"
      ? filteredGoals.filter(
          (g) =>
            g.scope === "company" || g.department === user?.department,
        )
      : filteredGoals;
```

- [ ] **Step 4: Update `canEditGoal`**

Replace lines 162-169:
```ts
  function canEditGoal(goal: StrategyGoalData) {
    return (
      canEditAll ||
      (role === "manager" &&
        goal.scope === "department" &&
        goal.department === persona?.department)
    );
  }
```
with:
```ts
  function canEditGoal(goal: StrategyGoalData) {
    return (
      canEditAll ||
      (user?.role === "manager" &&
        goal.scope === "department" &&
        goal.department === user?.department)
    );
  }
```

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: PASS. All `useRole` callers are migrated; no errors should remain.

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/plan/strategy-panel.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): migrate strategy-panel from useRole to useAuth

Last useRole caller -- unlocks removal of RoleProvider.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Remove `RoleSwitcher` from `TopHeader`

**Rationale:** No callers remain that depend on `RoleSwitcher`. Removing it from the header collapses the two-switcher UI to one.

**Files:**
- Modify: `apps/platform/src/components/top-header.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `apps/platform/src/components/top-header.tsx` with:

```tsx
"use client";

import { Button } from "@ascenta/ui/button";
import { Settings } from "lucide-react";
import { NotificationCenter } from "@/components/notification-center";
import { UserPicker } from "@/components/auth/user-picker";

export function TopHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
      {/* Left: Company branding */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-deep-blue text-xs font-bold text-white">
          SC
        </div>
        <span className="font-display text-sm font-bold text-deep-blue">
          StoneCyber
        </span>
      </div>

      {/* Right: App actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-deep-blue">
          <Settings className="size-4" />
        </Button>
        <NotificationCenter />
        <UserPicker />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/top-header.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): drop RoleSwitcher from TopHeader

UserPicker is now the sole identity switcher.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Remove `RoleProvider` from layout and delete legacy files

**Rationale:** No consumers remain for `RoleProvider`, `useRole`, `ResolvedPersona`, `RoleSwitcher`, `SEED_PERSONAS`, or `mock-user`. Safe to delete.

**Files:**
- Modify: `apps/platform/src/app/layout.tsx`
- Delete: `apps/platform/src/lib/role/role-context.tsx`
- Delete: `apps/platform/src/lib/role/personas.ts`
- Delete: `apps/platform/src/components/role-switcher.tsx`
- Delete: `apps/platform/src/lib/constants/mock-user.ts`

- [ ] **Step 1: Replace `app/layout.tsx`**

Replace the entire contents of `apps/platform/src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NavSidebar } from "@/components/nav-sidebar";
import { TopHeader } from "@/components/top-header";
import { ChatProvider } from "@/lib/chat/chat-context";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascenta Platform",
  description: "AI-powered HR workflows for peak performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ChatProvider>
            <div className="flex h-screen overflow-hidden">
              <NavSidebar />
              <main className="flex flex-1 flex-col overflow-hidden bg-glacier">
                <TopHeader />
                <div className="flex flex-1 flex-col overflow-hidden">
                  {children}
                </div>
              </main>
            </div>
          </ChatProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Delete the four legacy files**

Run:
```bash
git rm apps/platform/src/lib/role/role-context.tsx \
       apps/platform/src/lib/role/personas.ts \
       apps/platform/src/components/role-switcher.tsx \
       apps/platform/src/lib/constants/mock-user.ts
```

Expected: four files removed. The `apps/platform/src/lib/role/` directory is now empty and git will not track it (directories aren't tracked in git).

- [ ] **Step 3: Confirm no stale references**

Using the Grep tool, search `apps/platform/src` for the regex:

```
useRole|RoleProvider|ResolvedPersona|PersonaConfig|SEED_PERSONAS|RoleSwitcher|@/lib/role|mock-user
```

Expected: zero matches. If any hits appear, fix them before continuing.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: PASS.

- [ ] **Step 5: Lint**

Run: `pnpm --filter=@ascenta/platform lint`

Expected: PASS. If any "unused import" warnings appear, clean them up.

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/app/layout.tsx
git commit -m "$(cat <<'EOF'
refactor(auth): remove RoleProvider and delete legacy persona stack

All callers have been migrated to useAuth. Drops role-context,
personas, role-switcher, and the deprecated mock-user constant.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Verification sweep

**Rationale:** Close the loop: full typecheck, lint, tests, and a manual browser smoke test against the running dev server.

- [ ] **Step 1: Full typecheck**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit`

Expected: PASS with zero errors.

- [ ] **Step 2: Full lint**

Run: `pnpm lint`

Expected: PASS.

- [ ] **Step 3: Full test run**

Run: `pnpm test`

Expected: PASS. (This project uses vitest with `passWithNoTests: true`; the migration doesn't change test expectations.)

- [ ] **Step 4: Manual smoke test**

Start the dev server:
```bash
pnpm dev --filter=@ascenta/platform
```

Open `http://localhost:3051` in a browser, and confirm each of the following:

1. **Header shows only `UserPicker` on the right.** The `RoleSwitcher` segmented control + "Sarah Chen — HR Manager" dropdown on the left is gone. If you still see them, hard-reload (Shift+Reload) to clear any stale bundle.
2. **UserPicker opens and lists seeded employees.** Click the picker on the right side of the header. The popover shows a scrollable list titled "Switch Identity (Dev Mode)". Each row shows name · title · department and a role badge.
3. **Switching identities persists across refreshes.** Pick a user whose role is `employee` (e.g., an IC). Refresh the page. The picker still shows that user. `localStorage.ascenta-dev-user-id` in DevTools holds their ObjectId.
4. **/do page seeds an employeeInfo payload.** Navigate to `/do?prompt=hello&tool=startGoalWorkflow`. After the chat streams its first response, the tool call receives `employeeInfo` populated from the current user. If there's no user selected, it should be `undefined` (no crash).
5. **Grow Goals panel loads the current user's goals.** Switch to a user who has goals in the seed. Navigate to `/grow/performance`. The "My Goals" table renders. No "useRole must be used within RoleProvider" errors in the console.
6. **Grow Check-ins panel loads.** Same page. Confirm the panel renders for both a manager (sees stats + schedule button) and an employee (sees "My Check-ins" view).
7. **Grow Reviews panel loads for a manager.** Still on `/grow/performance`, switch to an HR or manager user. The reviews table renders.
8. **Plan/Foundation, Plan/Strategy, Plan/My Strategy pages load.** Visit `/plan/foundation`, `/plan/strategy`, `/plan/my-strategy`. No console errors. HR users see edit controls; non-HR users see read-only views.
9. **Switching users updates the open page.** On `/grow/performance`, switch identity. The data re-fetches and displays the new user's goals/check-ins/etc.

If any step fails, capture the console error and diagnose before declaring done.

- [ ] **Step 5: Commit summary entry**

Append a one-line commit summary to `~/repos/commit-summary/ascenta.md` covering this work (per the global `CLAUDE.md` rule). Example:

```
- **<short-sha>** (2026-04-12): Consolidate identity switchers onto AuthProvider, removing the legacy RoleProvider/RoleSwitcher stack and extending AuthUser with display fields.
```

(Use the SHA of the last commit from Task 14.)

- [ ] **Step 6: Open the PR**

Push the branch if not already pushed, then open a PR from `feat/29-check-ins-lifecycle` to `main` using `gh pr create`. The existing check-ins work on this branch is part of the same PR — call out the auth consolidation as one bullet in the summary; it's not the entire PR.
