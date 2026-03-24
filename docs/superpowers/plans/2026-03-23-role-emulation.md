# Role Emulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add HR/Manager/Employee role emulation with a persona switcher in the header, so pages render role-appropriate views without real auth.

**Architecture:** A React context (`RoleProvider`) wraps the app outside `ChatProvider`, exposing the current role and DB-resolved persona via `useRole()`. A `RoleSwitcher` component in the `TopHeader` lets users switch roles and personas. Existing components consume the context to gate admin actions and filter data. The seed script is updated to deterministically create three personas.

**Tech Stack:** React 19 context, localStorage, existing `/api/dashboard/employees` endpoint, Tailwind CSS, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-23-role-emulation-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `apps/platform/src/lib/role/personas.ts` | Seed persona definitions — names, titles, departments per role |
| `apps/platform/src/lib/role/role-context.tsx` | RoleProvider, useRole hook, localStorage persistence, DB resolution |
| `apps/platform/src/components/role-switcher.tsx` | Header UI — role segmented control + persona dropdown |

### Modified Files

| File | Change |
|------|--------|
| `packages/db/scripts/seed-employees.ts` | Insert 3 deterministic personas before random employees |
| `apps/platform/src/app/layout.tsx` | Wrap app in RoleProvider (outside ChatProvider) |
| `apps/platform/src/components/top-header.tsx` | Add RoleSwitcher component |
| `apps/platform/src/components/do-tab-chat.tsx` | Replace MOCK_USER with persona from useRole() |
| `apps/platform/src/components/chat/suggest-prompt-pills.tsx` | Replace MockUser type with role persona type |
| `apps/platform/src/lib/utils/resolve-prompt.ts` | Replace MockUser type with role persona type |
| `apps/platform/src/components/plan/foundation-panel.tsx` | Gate edit/publish behind HR role |
| `apps/platform/src/components/plan/strategy-panel.tsx` | Gate create/edit/archive behind role |
| `apps/platform/src/components/grow/goals-panel.tsx` | Use persona ID instead of hardcoded "Jason" lookup |

---

## Task 1: Seed Script — Deterministic Personas

**Files:**
- Modify: `packages/db/scripts/seed-employees.ts`

- [ ] **Step 1: Add deterministic persona insertion before random employees**

In `packages/db/scripts/seed-employees.ts`, after the `await Employee.deleteMany({})` line (line 83) and before the random employee loop, add:

```typescript
  // ── Deterministic seed personas (for role emulation) ──────────────
  const seedPersonas = [
    {
      employeeId: "EMP0001",
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@company.com",
      department: "HR",
      jobTitle: "HR Manager",
      managerName: "Executive Team",
      hireDate: new Date("2020-03-15"),
      status: "active" as const,
      notes: [],
    },
    {
      employeeId: "EMP0002",
      firstName: "Jason",
      lastName: "Lee",
      email: "jason.lee@company.com",
      department: "Engineering",
      jobTitle: "Engineering Manager",
      managerName: "Sarah Chen",
      hireDate: new Date("2021-06-01"),
      status: "active" as const,
      notes: [],
    },
    {
      employeeId: "EMP0003",
      firstName: "Alex",
      lastName: "Rivera",
      email: "alex.rivera@company.com",
      department: "Engineering",
      jobTitle: "Software Engineer",
      managerName: "Jason Lee",
      hireDate: new Date("2022-09-12"),
      status: "active" as const,
      notes: [],
    },
  ];

  await Employee.insertMany(seedPersonas);
  console.log(`  ✓ Inserted ${seedPersonas.length} seed personas`);
```

Also update the random employee loop to skip seed persona names to avoid collisions. After the seed persona insertion and before the random loop, add:

```typescript
  const seedNames = new Set(seedPersonas.map((p) => `${p.firstName} ${p.lastName}`));
```

Then inside the random loop, after generating `firstName` and `lastName`, add a skip:

```typescript
    if (seedNames.has(`${firstName} ${lastName}`)) {
      i--;
      continue;
    }
```

This ensures no random employee duplicates a seed persona name.

- [ ] **Step 2: Commit**

```bash
git add packages/db/scripts/seed-employees.ts
git commit -m "feat(seed): add deterministic personas for role emulation (Sarah Chen, Jason Lee, Alex Rivera)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Personas Config

**Files:**
- Create: `apps/platform/src/lib/role/personas.ts`

- [ ] **Step 1: Create the personas config**

```typescript
export type RoleType = "hr" | "manager" | "employee";

export interface PersonaConfig {
  firstName: string;
  lastName: string;
  title: string;
  department: string;
}

export const SEED_PERSONAS: Record<RoleType, PersonaConfig[]> = {
  hr: [
    { firstName: "Sarah", lastName: "Chen", title: "HR Manager", department: "HR" },
  ],
  manager: [
    { firstName: "Jason", lastName: "Lee", title: "Engineering Manager", department: "Engineering" },
  ],
  employee: [
    { firstName: "Alex", lastName: "Rivera", title: "Software Engineer", department: "Engineering" },
  ],
};

export const DEFAULT_ROLE: RoleType = "hr";

export function getDefaultPersona(role: RoleType): PersonaConfig {
  return SEED_PERSONAS[role][0];
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/role/personas.ts
git commit -m "feat: add seed persona config for role emulation

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Role Context Provider

**Files:**
- Create: `apps/platform/src/lib/role/role-context.tsx`

- [ ] **Step 1: Create the RoleProvider and useRole hook**

```typescript
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type RoleType,
  type PersonaConfig,
  SEED_PERSONAS,
  DEFAULT_ROLE,
  getDefaultPersona,
} from "./personas";

export interface ResolvedPersona {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
}

interface RoleContextValue {
  role: RoleType;
  persona: ResolvedPersona | null;
  loading: boolean;
  setRole: (role: RoleType) => void;
  setPersona: (config: PersonaConfig) => void;
  personas: PersonaConfig[];
}

const RoleContext = createContext<RoleContextValue | null>(null);

const LS_ROLE_KEY = "ascenta-role";
const LS_PERSONA_KEY = "ascenta-persona";

function readLS(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // silent
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleType>(DEFAULT_ROLE);
  const [personaConfig, setPersonaConfig] = useState<PersonaConfig>(
    getDefaultPersona(DEFAULT_ROLE),
  );
  const [persona, setResolvedPersona] = useState<ResolvedPersona | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve persona config to DB employee
  const resolvePersona = useCallback(async (config: PersonaConfig) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/employees?search=${encodeURIComponent(config.firstName)}&limit=10`,
      );
      const data = await res.json();
      if (data.employees) {
        const match = data.employees.find(
          (e: { firstName: string; lastName: string }) =>
            e.firstName === config.firstName && e.lastName === config.lastName,
        );
        if (match) {
          setResolvedPersona({
            id: match.id ?? match._id,
            firstName: match.firstName,
            lastName: match.lastName,
            title: match.jobTitle ?? config.title,
            department: match.department ?? config.department,
          });
          setLoading(false);
          return;
        }
      }
      // Fallback: use config without DB ID
      setResolvedPersona(null);
    } catch {
      setResolvedPersona(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedRole = readLS(LS_ROLE_KEY) as RoleType | null;
    const savedPersonaJson = readLS(LS_PERSONA_KEY);

    let initialRole = DEFAULT_ROLE;
    let initialPersona = getDefaultPersona(DEFAULT_ROLE);

    if (savedRole && SEED_PERSONAS[savedRole]) {
      initialRole = savedRole;
      initialPersona = getDefaultPersona(savedRole);
    }

    if (savedPersonaJson) {
      try {
        const parsed = JSON.parse(savedPersonaJson) as PersonaConfig;
        // Verify it belongs to the role
        const match = SEED_PERSONAS[initialRole].find(
          (p) => p.firstName === parsed.firstName && p.lastName === parsed.lastName,
        );
        if (match) initialPersona = match;
      } catch {
        // ignore
      }
    }

    setRoleState(initialRole);
    setPersonaConfig(initialPersona);
    resolvePersona(initialPersona);
  }, [resolvePersona]);

  const setRole = useCallback(
    (newRole: RoleType) => {
      const newPersona = getDefaultPersona(newRole);
      setRoleState(newRole);
      setPersonaConfig(newPersona);
      writeLS(LS_ROLE_KEY, newRole);
      writeLS(LS_PERSONA_KEY, JSON.stringify(newPersona));
      resolvePersona(newPersona);
    },
    [resolvePersona],
  );

  const setPersonaFromConfig = useCallback(
    (config: PersonaConfig) => {
      setPersonaConfig(config);
      writeLS(LS_PERSONA_KEY, JSON.stringify(config));
      resolvePersona(config);
    },
    [resolvePersona],
  );

  return (
    <RoleContext.Provider
      value={{
        role,
        persona,
        loading,
        setRole,
        setPersona: setPersonaFromConfig,
        personas: SEED_PERSONAS[role],
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/role/role-context.tsx
git commit -m "feat: add RoleProvider context with localStorage persistence and DB resolution

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Role Switcher Component

**Files:**
- Create: `apps/platform/src/components/role-switcher.tsx`

- [ ] **Step 1: Create the role switcher UI**

```typescript
"use client";

import { useRole } from "@/lib/role/role-context";
import type { RoleType } from "@/lib/role/personas";
import { cn } from "@ascenta/ui";
import { Loader2, AlertCircle } from "lucide-react";

const ROLE_LABELS: Record<RoleType, string> = {
  hr: "HR",
  manager: "Manager",
  employee: "Employee",
};

export function RoleSwitcher() {
  const { role, persona, loading, setRole, setPersona, personas } = useRole();

  return (
    <div className="flex items-center gap-2">
      {/* Role segmented control */}
      <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
        {(["hr", "manager", "employee"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              role === r
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Persona dropdown */}
      <div className="flex items-center gap-1.5">
        {loading ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : persona ? (
          <select
            value={`${persona.firstName} ${persona.lastName}`}
            onChange={(e) => {
              const selected = personas.find(
                (p) => `${p.firstName} ${p.lastName}` === e.target.value,
              );
              if (selected) setPersona(selected);
            }}
            className="h-7 rounded-md border bg-white px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1"
          >
            {personas.map((p) => (
              <option key={`${p.firstName}-${p.lastName}`} value={`${p.firstName} ${p.lastName}`}>
                {p.firstName} {p.lastName} — {p.title}
              </option>
            ))}
          </select>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="size-3" />
            Run db:seed
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/role-switcher.tsx
git commit -m "feat: add RoleSwitcher component with role segmented control and persona picker

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Wire RoleProvider and RoleSwitcher into App

**Files:**
- Modify: `apps/platform/src/app/layout.tsx`
- Modify: `apps/platform/src/components/top-header.tsx`

- [ ] **Step 1: Wrap app in RoleProvider in layout.tsx**

Read `apps/platform/src/app/layout.tsx`. Add import:

```typescript
import { RoleProvider } from "@/lib/role/role-context";
```

Wrap `RoleProvider` **outside** `ChatProvider`:

Change:
```typescript
        <ChatProvider>
```
To:
```typescript
        <RoleProvider>
        <ChatProvider>
```

And the closing:
Change:
```typescript
        </ChatProvider>
```
To:
```typescript
        </ChatProvider>
        </RoleProvider>
```

- [ ] **Step 2: Add RoleSwitcher to TopHeader**

Read `apps/platform/src/components/top-header.tsx`. Add import:

```typescript
import { RoleSwitcher } from "@/components/role-switcher";
```

Add `<RoleSwitcher />` inside the right-side `<div>`, before the Settings button:

```typescript
      <div className="flex items-center gap-1">
        <RoleSwitcher />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-deep-blue">
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/layout.tsx apps/platform/src/components/top-header.tsx
git commit -m "feat: wire RoleProvider into app layout and RoleSwitcher into TopHeader

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Replace MOCK_USER in Do Chat and Prompt Utils

**Files:**
- Modify: `apps/platform/src/components/do-tab-chat.tsx`
- Modify: `apps/platform/src/components/chat/suggest-prompt-pills.tsx`
- Modify: `apps/platform/src/lib/utils/resolve-prompt.ts`
- Modify: `apps/platform/src/lib/constants/mock-user.ts`

- [ ] **Step 1: Update resolve-prompt.ts**

Read `apps/platform/src/lib/utils/resolve-prompt.ts`. Replace entire contents:

```typescript
import type { ResolvedPersona } from "@/lib/role/role-context";

/**
 * Resolves template tokens in prompt strings.
 * Supported tokens: {{userName}}, {{directReport}} (placeholder for now)
 * Unknown tokens are left as-is.
 */
/**
 * Note: {{directReport}} now resolves to a placeholder. Direct report data
 * is not available on ResolvedPersona. When a team/reports feature is added,
 * this can be restored.
 */
export function resolvePrompt(template: string, persona: ResolvedPersona | null): string {
  const name = persona ? `${persona.firstName} ${persona.lastName}` : "there";
  return template
    .replace(/\{\{userName\}\}/g, name)
    .replace(/\{\{directReport\}\}/g, "a team member");
}
```

- [ ] **Step 2: Update suggest-prompt-pills.tsx**

Read `apps/platform/src/components/chat/suggest-prompt-pills.tsx`.

Change the import from:
```typescript
import type { MockUser } from "@/lib/constants/mock-user";
```
To:
```typescript
import type { ResolvedPersona } from "@/lib/role/role-context";
```

Change the interface prop from:
```typescript
  user: MockUser;
```
To:
```typescript
  user: ResolvedPersona | null;
```

And the destructured prop name stays `user`. Find where `resolvePrompt` is called with `user` — it should still work since the signature was updated in step 1.

- [ ] **Step 3: Update do-tab-chat.tsx**

Read `apps/platform/src/components/do-tab-chat.tsx`.

Remove the MOCK_USER import:
```typescript
import { MOCK_USER } from "@/lib/constants/mock-user";
```

Add the role import:
```typescript
import { useRole } from "@/lib/role/role-context";
```

Inside the `DoTabChat` component, at the top of the function body (after the `useChat()` call), add:
```typescript
  const { persona } = useRole();
```

Replace `MOCK_USER.name` in the greeting (around line 181):
```typescript
          {getGreeting(persona ? persona.firstName : "there")}
```

Replace `MOCK_USER` in the SuggestPromptPills usage (around line 201):
```typescript
                user={persona}
```

- [ ] **Step 4: Deprecate mock-user.ts**

Read `apps/platform/src/lib/constants/mock-user.ts`. Replace entire contents with:

```typescript
/**
 * @deprecated Use useRole() from @/lib/role/role-context instead.
 * This file is kept temporarily for reference during migration.
 */
export interface MockUser {
  name: string;
  role: "manager" | "employee";
  directReports: { name: string; jobTitle: string }[];
}

export const MOCK_USER: MockUser = {
  name: "Jason",
  role: "manager",
  directReports: [
    { name: "Sarah Chen", jobTitle: "Senior Engineer" },
    { name: "Michael Torres", jobTitle: "Product Designer" },
    { name: "Emily Davis", jobTitle: "Marketing Manager" },
  ],
};
```

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/do-tab-chat.tsx apps/platform/src/components/chat/suggest-prompt-pills.tsx apps/platform/src/lib/utils/resolve-prompt.ts apps/platform/src/lib/constants/mock-user.ts
git commit -m "feat: replace MOCK_USER with role context persona in chat and prompt utils

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Role-Gate Foundation Panel

**Files:**
- Modify: `apps/platform/src/components/plan/foundation-panel.tsx`

- [ ] **Step 1: Add role gating to FoundationPanel**

Read `apps/platform/src/components/plan/foundation-panel.tsx`.

Add import at the top:
```typescript
import { useRole } from "@/lib/role/role-context";
```

Inside the `FoundationPanel` component, at the top of the function body, add:
```typescript
  const { role } = useRole();
  const isAdmin = role === "hr";
```

**Do not modify `fetchFoundation`** — it's a `useCallback` with an empty dependency array, so `isAdmin` would be stale inside it. Instead, add a separate `useEffect` after the existing `fetchFoundation` effect to gate edit mode based on role:

```typescript
  // Gate edit mode based on role — runs after foundation loads and when role changes
  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      setEditMode(false);
    } else if (!foundation || foundation.status === "draft") {
      setEditMode(true);
    }
  }, [loading, isAdmin, foundation?.status]);
```

This keeps the fetch logic clean and responds to role changes correctly.

In the published read-only view, conditionally hide the Edit button:
Wrap the Edit button in `{isAdmin && ( ... )}`.

In the edit mode view, conditionally hide the "Use Do" link, the Publish/Unpublish buttons, and the AI Assist buttons for non-admin roles. Since non-admins won't enter edit mode (due to the `isAdmin` gate), this is mostly a safety net.

In the published read-only view's return block, the Edit button:
```typescript
            <button
              onClick={() => setEditMode(true)}
              ...
            >
```
Wrap with: `{isAdmin && ( <button ... /> )}`

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/foundation-panel.tsx
git commit -m "feat: gate Foundation panel edit/publish behind HR role

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Role-Gate Strategy Panel

**Files:**
- Modify: `apps/platform/src/components/plan/strategy-panel.tsx`

- [ ] **Step 1: Add role gating to StrategyPanel**

Read `apps/platform/src/components/plan/strategy-panel.tsx`.

Add import:
```typescript
import { useRole } from "@/lib/role/role-context";
```

Inside `StrategyPanel`, at the top:
```typescript
  const { role, persona } = useRole();
  const canCreate = role === "hr" || role === "manager";
  const canEditAll = role === "hr";
```

**Create Goal button**: Wrap in `{canCreate && ( ... )}` so employees don't see it.

**StrategyGoalCard props**: Conditionally pass `onEdit` and `onArchive`:
- HR: always pass both
- Manager: pass `onEdit` and `onArchive` only for goals in their department (`goal.scope === "department" && goal.department === persona?.department`)
- Employee: pass neither

Change the `onEdit` and `onArchive` props on each `<StrategyGoalCard>` to:

```typescript
  onEdit={canEditAll || (role === "manager" && goal.scope === "department" && goal.department === persona?.department) ? handleEdit : undefined}
  onArchive={canEditAll || (role === "manager" && goal.scope === "department" && goal.department === persona?.department) ? handleArchive : undefined}
```

**Filtering for Employee view**: When role is "employee", filter strategy goals to only show `scope === "company"` and goals matching the persona's department. Add after the existing `filteredGoals` logic:

Add `visibleGoals` **before** the `groupedByHorizon` computation so all downstream logic uses it:

```typescript
  // Further filter for employee role: only company + own department
  const visibleGoals = role === "employee"
    ? filteredGoals.filter(
        (g) => g.scope === "company" || g.department === persona?.department,
      )
    : filteredGoals;
```

Then update `groupedByHorizon` to use `visibleGoals`:

```typescript
  const groupedByHorizon = horizonOrder.map((h) => ({
    horizon: h,
    label: STRATEGY_HORIZON_LABELS[h],
    goals: visibleGoals.filter((g) => g.horizon === h),
  }));
```

And update the `departments` derivation to also use `visibleGoals`:

```typescript
  const departments = [
    ...new Set(visibleGoals.filter((g) => g.scope === "department").map((g) => g.department).filter(Boolean)),
  ] as string[];
```

Also update the empty state check and JSX to reference `visibleGoals.length` instead of `filteredGoals.length`.

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/strategy-panel.tsx
git commit -m "feat: gate Strategy panel actions behind role (HR=all, Manager=department, Employee=read-only)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Goals Panel — Use Persona ID

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`

- [ ] **Step 1: Replace hardcoded "Jason" lookup with persona**

Read `apps/platform/src/components/grow/goals-panel.tsx`.

Add import:
```typescript
import { useRole } from "@/lib/role/role-context";
```

Inside `GoalsPanel`, at the top:
```typescript
  const { persona, loading: roleLoading } = useRole();
```

Replace the entire `useEffect` fetch logic. Currently it:
1. Fetches employees searching for "Jason"
2. Gets the first match's ID
3. Fetches goals for that ID

Change it to use `persona?.id` directly. Wait for role loading to complete before deciding there's no persona:

```typescript
  useEffect(() => {
    async function fetchGoals() {
      if (roleLoading) return; // Wait for persona to resolve
      if (!persona?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        setEmployeeInfo({
          id: persona.id,
          name: `${persona.firstName} ${persona.lastName}`,
        });

        const goalsRes = await fetch(`/api/grow/goals?employeeId=${persona.id}`);
        const goalsData = await goalsRes.json();

        if (goalsData.success) {
          setGoals(goalsData.goals ?? []);
        } else {
          setError(goalsData.error ?? "Failed to fetch goals");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load goals");
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, [persona?.id, persona?.firstName, persona?.lastName, roleLoading]);
```

Remove the old employee search fetch entirely.

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "feat: use role persona ID for goals panel instead of hardcoded Jason lookup

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Verify Full Build

- [ ] **Step 1: Run build**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm build`

Fix any type errors.

- [ ] **Step 2: Run lint**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm lint`

Fix any lint errors.

- [ ] **Step 3: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix: resolve lint/type issues from role emulation implementation

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```
