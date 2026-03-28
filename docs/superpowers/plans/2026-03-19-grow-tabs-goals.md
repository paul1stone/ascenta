# Grow Tab Restructure + Goals View — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Do/Learn tabs on Grow/Performance with Goals/Performance Reviews/Check-ins/Reflect tabs, build the Goals tab showing the mock user's active goals as accordion cards, and add Do as a top-level nav item with its own full-page chat.

**Architecture:** The tab system becomes per-page configurable via `dashboard-nav.ts`. The Goals tab fetches goals from a new GET endpoint and renders accordion cards. Do becomes a standalone route (`/do`) reusing the existing `DoTabChat` component with all tools enabled.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, shadcn/ui (Collapsible), Mongoose, existing `@ascenta/db/goal-schema`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/platform/src/app/api/grow/goals/route.ts` | Add GET handler for fetching goals by employeeId (with last check-in date) |
| Create | `apps/platform/src/components/grow/goal-card.tsx` | Individual accordion goal card |
| Create | `apps/platform/src/components/grow/goals-panel.tsx` | Goals tab container — fetches and lists goals |
| Modify | `apps/platform/src/lib/constants/dashboard-nav.ts` | Add per-page tab configs, add Do nav entry, keep backward compat |
| Modify | `apps/platform/src/components/function-tabs.tsx` | Accept generic tab configs instead of hardcoded `FUNCTION_TABS` |
| Modify | `apps/platform/src/app/[category]/[sub]/page.tsx` | Route to new tab components based on page-specific tab config |
| Create | `apps/platform/src/app/do/page.tsx` | Full-page chat with all tools |
| Modify | `apps/platform/src/components/nav-sidebar.tsx` | Add Do nav item between Home and divider |

Tasks are ordered so the project compiles cleanly after every task.

---

### Task 1: Add GET Endpoint for Goals

**Files:**
- Modify: `apps/platform/src/app/api/grow/goals/route.ts`

- [ ] **Step 1: Add GET handler to the existing goals route**

Add a `GET` export to the existing file (which already has `POST`). Place it above the `POST` function. The endpoint also looks up the most recent check-in date for each goal:

```typescript
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId query parameter is required" },
        { status: 400 },
      );
    }

    const goals = await Goal.find({ owner: employeeId })
      .sort({ createdAt: -1 })
      .lean();

    // Look up the most recent check-in date for each goal
    const goalIds = goals.map((g) => g._id);
    const latestCheckIns = await CheckIn.aggregate([
      { $match: { goalIds: { $in: goalIds } } },
      { $unwind: "$goalIds" },
      { $match: { goalIds: { $in: goalIds } } },
      { $group: { _id: "$goalIds", lastCheckInDate: { $max: "$createdAt" } } },
    ]);
    const checkInMap = new Map(
      latestCheckIns.map((c: { _id: unknown; lastCheckInDate: Date }) => [
        String(c._id),
        c.lastCheckInDate,
      ]),
    );

    // Transform _id to id for frontend
    const transformed = goals.map((g: Record<string, unknown>) => ({
      ...g,
      id: String(g._id),
      lastCheckInDate: checkInMap.get(String(g._id)) ?? null,
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, goals: transformed });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow goals GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch goals" },
      { status: 500 },
    );
  }
}
```

Note: Add `import { CheckIn } from "@ascenta/db/checkin-schema";` to the top of the file alongside the existing imports.

- [ ] **Step 2: Verify no type errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm tsc --noEmit --filter=@ascenta/platform`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/grow/goals/route.ts
git commit -m "feat: add GET endpoint for fetching goals by employeeId with last check-in dates"
```

---

### Task 2: Build GoalCard Component

**Files:**
- Create: `apps/platform/src/components/grow/goal-card.tsx`

- [ ] **Step 1: Create the accordion goal card component**

```typescript
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@ascenta/ui";
import { GOAL_CATEGORY_GROUPS } from "@ascenta/db/goal-constants";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    category: string;
    measurementType: string;
    successMetric: string;
    timePeriod: { start: string; end: string };
    checkInCadence: string;
    alignment: string;
    status: string;
    lastCheckInDate: string | null;
    createdAt: string;
  };
  accentColor: string;
}

const STATUS_COLORS: Record<string, string> = {
  on_track: "#22c55e",
  needs_attention: "#f59e0b",
  off_track: "#ef4444",
  completed: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  on_track: "On Track",
  needs_attention: "Needs Attention",
  off_track: "Off Track",
  completed: "Completed",
};

function getCategoryGroup(category: string): string {
  for (const [group, cats] of Object.entries(GOAL_CATEGORY_GROUPS)) {
    if ((cats as readonly string[]).includes(category)) {
      return group.replace(" Goals", "");
    }
  }
  return category;
}

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  Performance: { bg: "rgba(68, 170, 153, 0.1)", text: "#44aa99" },
  Leadership: { bg: "rgba(102, 136, 187, 0.1)", text: "#6688bb" },
  Development: { bg: "rgba(187, 102, 136, 0.1)", text: "#bb6688" },
};

function formatTimePeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString("en-US", { month: "short" });
  const eMonth = e.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${sMonth} – ${eMonth}`;
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GoalCard({ goal, accentColor }: GoalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const group = getCategoryGroup(goal.category);
  const groupColor = GROUP_COLORS[group] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        {/* Status dot */}
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: statusColor }}
          title={STATUS_LABELS[goal.status]}
        />

        {/* Title */}
        <span className="flex-1 font-display text-sm font-semibold text-deep-blue truncate">
          {goal.title}
        </span>

        {/* Category tag */}
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: groupColor.bg, color: groupColor.text }}
        >
          {group}
        </span>

        {/* Time period */}
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {formatTimePeriod(goal.timePeriod.start, goal.timePeriod.end)}
        </span>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {/* Expanded body */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t px-5 py-4 space-y-4">
            {/* Description */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {goal.description}
              </p>
            </div>

            {/* Metric row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Success Metric
                </p>
                <p className="text-sm text-foreground">{goal.successMetric}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Measurement
                </p>
                <p className="text-sm text-foreground">{formatLabel(goal.measurementType)}</p>
              </div>
            </div>

            {/* Details row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Check-in Cadence
                </p>
                <p className="text-sm text-foreground">{formatLabel(goal.checkInCadence)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Alignment
                </p>
                <p className="text-sm text-foreground capitalize">{goal.alignment}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Category
                </p>
                <p className="text-sm text-foreground">{formatLabel(goal.category)}</p>
              </div>
            </div>

            {/* Status + Last Check-in row */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="text-xs font-medium" style={{ color: statusColor }}>
                  {STATUS_LABELS[goal.status] ?? goal.status}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Last check-in: {goal.lastCheckInDate ? formatDate(goal.lastCheckInDate) : "No check-ins yet"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm tsc --noEmit --filter=@ascenta/platform`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/goal-card.tsx
git commit -m "feat: add GoalCard accordion component with last check-in date"
```

---

### Task 3: Build GoalsPanel Component

**Files:**
- Create: `apps/platform/src/components/grow/goals-panel.tsx`

The GoalsPanel fetches goals for the mock user and renders a list of GoalCard components. Since there's no auth, it queries the employees API for a "Jason" match and uses the first result.

- [ ] **Step 1: Create the GoalsPanel component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { Target, Loader2 } from "lucide-react";
import { GoalCard } from "@/components/grow/goal-card";

interface GoalData {
  id: string;
  title: string;
  description: string;
  category: string;
  measurementType: string;
  successMetric: string;
  timePeriod: { start: string; end: string };
  checkInCadence: string;
  alignment: string;
  status: string;
  lastCheckInDate: string | null;
  createdAt: string;
}

interface GoalsPanelProps {
  accentColor: string;
}

export function GoalsPanel({ accentColor }: GoalsPanelProps) {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        setError(null);

        // Look up the mock user (first employee matching "Jason")
        const empRes = await fetch("/api/dashboard/employees?search=Jason&limit=1");
        const empData = await empRes.json();

        if (!empData.employees || empData.employees.length === 0) {
          setError("No employee found. Run `pnpm db:seed` to populate employees.");
          setLoading(false);
          return;
        }

        const employee = empData.employees[0];
        const employeeId = employee.id ?? employee._id;
        setEmployeeInfo({
          id: employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
        });

        // Fetch goals for this employee
        const goalsRes = await fetch(`/api/grow/goals?employeeId=${employeeId}`);
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
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <Target className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Unable to Load Goals
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-deep-blue">
            My Goals
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {employeeInfo?.name ? `${employeeInfo.name} — ` : ""}
            {activeGoals.length} active goal{activeGoals.length !== 1 ? "s" : ""}
            {completedGoals.length > 0 && `, ${completedGoals.length} completed`}
          </p>
        </div>

        {/* Goal list */}
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Goals Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Use the Do chat to create your first goal. Goals you create will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />
            ))}
            {completedGoals.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4 pb-1">
                  Completed
                </p>
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm tsc --noEmit --filter=@ascenta/platform`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "feat: add GoalsPanel component with goal fetching and display"
```

---

### Task 4: Add Per-Page Tab Configs to dashboard-nav.ts

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:316-331`

- [ ] **Step 1: Add PageTab interface and page-level tab config**

Add imports for new icons at the top of the file (add `Brain, MessageCircle, ClipboardCheck` to the existing lucide-react import). Then add a `PageTab` interface and a `tabs` field to `PageConfig`:

```typescript
// Add to lucide-react imports: Brain, MessageCircle, ClipboardCheck

export interface PageTab {
  key: string;
  label: string;
  icon: LucideIcon;
}
```

Add `tabs?: PageTab[];` to the existing `PageConfig` interface (after the `tools` field).

Add tabs config to the `"grow/performance"` entry in `PAGE_CONFIG`:

```typescript
  "grow/performance": {
    title: "Performance System",
    description: "Manage performance reviews, goals, and check-ins for continuous growth.",
    tabs: [
      { key: "goals", label: "Goals", icon: Target },
      { key: "reviews", label: "Performance Reviews", icon: ClipboardCheck },
      { key: "checkins", label: "Check-ins", icon: MessageCircle },
      { key: "reflect", label: "Reflect", icon: Brain },
    ],
    tools: [
      // ... existing tools unchanged
    ],
  },
```

Keep the existing `FUNCTION_TABS` and `TabKey` exports unchanged — they remain the default for pages without custom tabs.

- [ ] **Step 2: Add Do page config**

Add a new entry to `PAGE_CONFIG`:

```typescript
  "do": {
    title: "Do",
    description: "Your AI workspace — create goals, run check-ins, draft documents, and more.",
  },
```

- [ ] **Step 3: Verify no type errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm tsc --noEmit --filter=@ascenta/platform`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "feat: add per-page tab configs and Do page config to dashboard-nav"
```

---

### Task 5: Make FunctionTabs Accept Generic Tab Configs

**Files:**
- Modify: `apps/platform/src/components/function-tabs.tsx`

This task and Task 6 are tightly coupled — FunctionTabs changes its props, and page.tsx must be updated immediately after to pass the new props. Do them in quick succession.

- [ ] **Step 1: Update FunctionTabs to accept generic tabs**

Replace the entire file content:

```typescript
"use client";

import { cn } from "@ascenta/ui";
import type { LucideIcon } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface FunctionTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  accentColor: string;
}

export function FunctionTabs({ tabs, activeTab, onTabChange, accentColor }: FunctionTabsProps) {
  return (
    <div className="flex border-b bg-[#fafafa]">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-6 py-3 text-[13px] transition-colors",
              isActive ? "font-bold text-foreground bg-white" : "text-muted-foreground hover:text-foreground"
            )}
            style={{
              borderBottom: isActive ? `3px solid ${accentColor}` : "3px solid transparent",
            }}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Immediately proceed to Task 6** (do NOT commit yet — page.tsx will have type errors until Task 6 is done)

---

### Task 6: Update Page.tsx to Route Tabs Per Page

**Files:**
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

- [ ] **Step 1: Rewrite the page component**

Replace the entire file. Key changes:
- Import `FUNCTION_TABS` as the default fallback tabs
- Read `pageConfig.tabs` for page-specific tabs, fall back to `FUNCTION_TABS`
- Active tab state becomes `string` instead of `TabKey`
- Pass `tabs` prop to `FunctionTabs`
- Route tab content: `"do"` → `DoTabChat`, `"learn"` → `LearnPanel`, `"goals"` → `GoalsPanel`, else placeholder

```typescript
"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import {
  findNavContext,
  FUNCTION_TABS,
  PAGE_CONFIG,
  DEFAULT_PAGE_CONFIG,
} from "@/lib/constants/dashboard-nav";
import { FunctionTabs } from "@/components/function-tabs";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { DoTabChat } from "@/components/do-tab-chat";
import { LearnPanel } from "@/components/grow/learn-panel";
import { GoalsPanel } from "@/components/grow/goals-panel";

export default function CategorySubPage({
  params,
}: {
  params: Promise<{ category: string; sub: string }>;
}) {
  const { category, sub } = use(params);
  const ctx = findNavContext(category, sub);
  if (!ctx) notFound();

  const pageKey = `${category}/${sub}`;
  const pageConfig = PAGE_CONFIG[pageKey] || DEFAULT_PAGE_CONFIG;
  const tabs = pageConfig.tabs ?? FUNCTION_TABS;
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FunctionTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ctx.category.color}
      />

      {activeTab === "do" ? (
        <DoTabChat
          pageKey={pageKey}
          pageConfig={pageConfig}
          accentColor={ctx.category.color}
        />
      ) : activeTab === "learn" ? (
        <div className="flex-1 overflow-y-auto p-6">
          <BreadcrumbNav
            category={ctx.category.label}
            subPage={ctx.subPage.label}
            functionTab="Learn"
          />
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            Knowledge Base
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {ctx.category.label} / {ctx.subPage.label} — Documentation, guides, and training
          </p>
          {pageKey === "grow/performance" ? (
            <LearnPanel />
          ) : (
            <div className="rounded-lg border-2 border-dashed flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              Learn content coming soon
            </div>
          )}
        </div>
      ) : activeTab === "goals" ? (
        <GoalsPanel accentColor={ctx.category.color} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="text-muted-foreground/40 mb-3">
            {(() => {
              const tab = tabs.find((t) => t.key === activeTab);
              if (!tab) return null;
              const Icon = tab.icon;
              return <Icon className="size-10 mx-auto" />;
            })()}
          </div>
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            {tabs.find((t) => t.key === activeTab)?.label ?? "Coming Soon"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This section is under development. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm tsc --noEmit --filter=@ascenta/platform`
Expected: Pass (both FunctionTabs and page.tsx are now in sync, GoalsPanel exists from Task 3)

- [ ] **Step 3: Commit both files together**

```bash
git add apps/platform/src/components/function-tabs.tsx apps/platform/src/app/\\[category\\]/\\[sub\\]/page.tsx
git commit -m "refactor: make tabs per-page configurable and route Grow/Performance to Goals/Reviews/Check-ins/Reflect"
```

---

### Task 7: Create the /do Route Page

**Files:**
- Create: `apps/platform/src/app/do/page.tsx`

- [ ] **Step 1: Create the Do page**

```typescript
"use client";

import { DoTabChat } from "@/components/do-tab-chat";
import { PAGE_CONFIG, DEFAULT_PAGE_CONFIG } from "@/lib/constants/dashboard-nav";

const DO_ACCENT_COLOR = "#ff6b35"; // Summit Orange

export default function DoPage() {
  const pageConfig = PAGE_CONFIG["do"] || DEFAULT_PAGE_CONFIG;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DoTabChat
        pageKey="do"
        pageConfig={pageConfig}
        accentColor={DO_ACCENT_COLOR}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm tsc --noEmit --filter=@ascenta/platform`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/do/page.tsx
git commit -m "feat: add /do route with full-page chat"
```

---

### Task 8: Add Do to Nav Sidebar

**Files:**
- Modify: `apps/platform/src/components/nav-sidebar.tsx`

- [ ] **Step 1: Add Do nav item between Home link and the divider**

Add `Play` to the lucide-react imports (line 8). Then add a Do `<Link>` after the Home `<Link>` and before the divider (`<div className="mx-3 my-1 border-b" />`):

```typescript
// Add to imports: Play

// After the Home <Link> and before the divider, add:
<Link
  href="/do"
  className={cn(
    "flex items-center gap-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors",
    collapsed ? "justify-center px-0" : "px-3.5",
    pathname === "/do" || pathname.startsWith("/do/")
      ? "font-bold bg-primary/6 border-l-[3px]"
      : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
  )}
  style={{
    borderLeftColor: pathname === "/do" || pathname.startsWith("/do/") ? "#ff6b35" : undefined,
  }}
>
  <Play className="size-4 shrink-0" style={{ color: "#ff6b35" }} />
  {!collapsed && <span>Do</span>}
</Link>
```

- [ ] **Step 2: Verify no type errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm tsc --noEmit --filter=@ascenta/platform`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/nav-sidebar.tsx
git commit -m "feat: add Do to nav sidebar between Home and categories"
```

---

### Task 9: Visual Verification

- [ ] **Step 1: Start the dev server**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform`

- [ ] **Step 2: Verify the Do nav item**

Navigate to `http://localhost:3051/do`. Confirm:
- Do appears in sidebar between Home and the divider with Summit Orange icon
- Full-page chat loads with empty state greeting
- Chat input works (sends messages)

- [ ] **Step 3: Verify Grow/Performance tabs**

Navigate to `http://localhost:3051/grow/performance`. Confirm:
- Tabs show: Goals | Performance Reviews | Check-ins | Reflect
- Goals tab is selected by default
- Goals tab shows "My Goals" header with employee name
- If goals exist in DB, they render as accordion cards
- If no goals, empty state with "No Goals Yet" message
- Performance Reviews, Check-ins, Reflect tabs show placeholder state
- Clicking each tab works

- [ ] **Step 4: Verify other pages unchanged**

Navigate to `http://localhost:3051/grow/coaching`. Confirm:
- Still shows Do | Learn tabs (unchanged)
- Do tab loads the chat as before

- [ ] **Step 5: Test accordion expand/collapse**

On the Goals tab, click a goal card. Confirm:
- Card expands smoothly revealing description, metric, cadence, alignment, last check-in date
- Chevron rotates
- Click again to collapse

- [ ] **Step 6: Commit any fixes**

If visual issues found, fix and commit with descriptive message.
