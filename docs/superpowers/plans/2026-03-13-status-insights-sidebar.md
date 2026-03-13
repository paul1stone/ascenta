# Status & Insights Sidebar Pages — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Status and Insights from per-page tabs to standalone sidebar navigation items with their own overview and detail pages.

**Architecture:** Remove status/insights from the tab system (`FUNCTION_TABS`), add an "Overview" section at the bottom of the sidebar with two links (`/status`, `/insights`). Each overview page aggregates category-level status cards; Grow has real data from the existing `/api/grow/status` API, other categories show placeholders. "View Details" links drill down to `/status/grow` and `/insights/grow`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui, Lucide icons

**Spec:** `docs/superpowers/specs/2026-03-13-status-insights-sidebar-design.md`

---

## Chunk 1: Tab System Cleanup & Sidebar Update

### Task 1: Remove status/insights from tab system and category sub-page

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:418-433`
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

> **Note:** These two files must be changed together. Narrowing `TabKey` without removing the `=== "status"` branch in the page would cause a TypeScript error.

- [ ] **Step 1: Update TabKey type**

In `apps/platform/src/lib/constants/dashboard-nav.ts`, change line 418 from:
```ts
export type TabKey = "do" | "learn" | "status" | "insights";
```
to:
```ts
export type TabKey = "do" | "learn";
```

- [ ] **Step 2: Remove status/insights entries from FUNCTION_TABS**

In the same file, change lines 428-433 from:
```ts
export const FUNCTION_TABS: FunctionTab[] = [
  { key: "do", label: "Do", icon: Play, title: "Action Center", description: "Primary workspace for executing tasks" },
  { key: "learn", label: "Learn", icon: BookOpen, title: "Knowledge Base", description: "Documentation, guides, and training" },
  { key: "status", label: "Status", icon: CircleDot, title: "Status Dashboard", description: "Real-time monitoring and health checks" },
  { key: "insights", label: "Insights", icon: BarChart3, title: "Analytics & Insights", description: "Data analysis and reporting" },
];
```
to:
```ts
export const FUNCTION_TABS: FunctionTab[] = [
  { key: "do", label: "Do", icon: Play, title: "Action Center", description: "Primary workspace for executing tasks" },
  { key: "learn", label: "Learn", icon: BookOpen, title: "Knowledge Base", description: "Documentation, guides, and training" },
];
```

Keep the `CircleDot` and `BarChart3` imports — they'll be used by the sidebar.

- [ ] **Step 3: Remove StatusDashboard import from category sub-page**

In `apps/platform/src/app/[category]/[sub]/page.tsx`, remove the import on line 16:
```ts
import { StatusDashboard } from "@/components/grow/status-dashboard";
```

Keep the `FUNCTION_TABS` import — it's still needed for `tabMeta` lookup.

- [ ] **Step 4: Simplify the non-do tab rendering**

Replace lines 59-66 (the conditional rendering inside the non-"do" branch):
```tsx
          {activeTab === "status" && pageKey === "grow/performance" ? (
            <StatusDashboard />
          ) : activeTab === "learn" && pageKey === "grow/performance" ? (
            <LearnPanel />
          ) : (
            <div className="rounded-lg border-2 border-dashed flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              {tabMeta.label} content coming soon
            </div>
          )}
```
with:
```tsx
          {activeTab === "learn" && pageKey === "grow/performance" ? (
            <LearnPanel />
          ) : (
            <div className="rounded-lg border-2 border-dashed flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              {tabMeta.label} content coming soon
            </div>
          )}
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/fv_123/ascenta && pnpm build --filter=@ascenta/platform`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/lib/constants/dashboard-nav.ts apps/platform/src/app/[category]/[sub]/page.tsx
git commit -m "refactor: remove status/insights from tab system and category sub-page"
```

---

### Task 2: Add Overview section to sidebar

**Files:**
- Modify: `apps/platform/src/components/nav-sidebar.tsx`

- [ ] **Step 1: Add CircleDot and BarChart3 icon imports**

In `apps/platform/src/components/nav-sidebar.tsx`, update the lucide-react import on line 8 from:
```ts
import { PanelLeftClose, PanelLeft, LayoutDashboard } from "lucide-react";
```
to:
```ts
import { PanelLeftClose, PanelLeft, LayoutDashboard, CircleDot, BarChart3 } from "lucide-react";
```

- [ ] **Step 2: Add the Overview section after the category nav loop**

Inside the `<nav>` element, after the `{DASHBOARD_NAV.map(...)}` block (after line 219's closing `</div>` and before line 220's closing `</nav>`), add:

```tsx
        {/* Overview section */}
        <div className="mx-3 my-2 border-b" />
        {!collapsed && (
          <div className="px-3.5 pt-1 pb-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Overview
          </div>
        )}
        {[
          { key: "status", label: "Status", icon: CircleDot, href: "/status", color: "#22c55e" },
          { key: "insights", label: "Insights", icon: BarChart3, href: "/insights", color: "#6366f1" },
        ].map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors border-l-[3px]",
                collapsed ? "justify-center px-0" : "px-3.5",
                isActive
                  ? "font-bold bg-primary/6"
                  : "text-muted-foreground hover:bg-primary/5 border-l-transparent",
              )}
              style={{
                borderLeftColor: isActive ? item.color : undefined,
              }}
            >
              <Icon className="size-4 shrink-0" style={{ color: item.color }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/fv_123/ascenta && pnpm build --filter=@ascenta/platform`
Expected: Build succeeds

- [ ] **Step 4: Start dev server and visually verify sidebar**

Run: `cd /Users/fv_123/ascenta && pnpm dev --filter=@ascenta/platform`
Verify: Navigate to `http://localhost:3051/home`. Confirm the sidebar shows the "Overview" label with Status and Insights links below the category nav. Collapse the sidebar and confirm icons still appear. Click the links — they will 404 (pages not created yet), which is expected.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/nav-sidebar.tsx
git commit -m "feat: add Status and Insights links to sidebar Overview section"
```

---

## Chunk 2: CategoryStatusCard Component & Status Overview Page

### Task 3: Create CategoryStatusCard component

**Files:**
- Create: `apps/platform/src/components/overview/category-status-card.tsx`

- [ ] **Step 1: Create the component**

Create directory and file at `apps/platform/src/components/overview/category-status-card.tsx`:

```tsx
"use client";

import Link from "next/link";

interface CategoryStatusCardProps {
  label: string;
  subtitle: string;
  color: string;
  detailHref?: string;
  children: React.ReactNode;
}

export function CategoryStatusCard({
  label,
  subtitle,
  color,
  detailHref,
  children,
}: CategoryStatusCardProps) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-bold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        {detailHref && (
          <Link
            href={detailHref}
            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            View Details →
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fv_123/ascenta && pnpm build --filter=@ascenta/platform`
Expected: Build succeeds (component is created but not yet imported anywhere — tree-shaking is fine)

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/overview/category-status-card.tsx
git commit -m "feat: add CategoryStatusCard component"
```

---

### Task 4: Create Status Overview page

**Files:**
- Create: `apps/platform/src/app/status/page.tsx`

- [ ] **Step 1: Create the status overview page**

Create directory and file at `apps/platform/src/app/status/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ascenta/ui/card";
import { Skeleton } from "@ascenta/ui/skeleton";
import { cn } from "@ascenta/ui";
import { Users, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { CategoryStatusCard } from "@/components/overview/category-status-card";

// ---------------------------------------------------------------------------
// Types — mirrors /api/grow/status response (aggregates only)
// ---------------------------------------------------------------------------

interface StatusAggregates {
  directReportsCount: number;
  activeGoalsCount: number;
  checkInCompletion7d: number;
  overdueCheckIns: number;
}

interface GrowStatusResponse {
  aggregates: StatusAggregates;
}

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { key: "grow", label: "Grow", subtitle: "Performance & Development", color: "#44aa99", hasData: true },
  { key: "plan", label: "Plan", subtitle: "Strategy & Workforce Planning", color: "#6688bb", hasData: false },
  { key: "attract", label: "Attract", subtitle: "Hiring Pipeline", color: "#aa8866", hasData: false },
  { key: "launch", label: "Launch", subtitle: "Onboarding & Enablement", color: "#bb6688", hasData: false },
  { key: "care", label: "Care", subtitle: "Total Rewards & Leave", color: "#cc6677", hasData: false },
  { key: "protect", label: "Protect", subtitle: "Feedback & Case Management", color: "#8888aa", hasData: false },
] as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: "red" | "green";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            highlight === "red" && "text-rose-600",
            highlight === "green" && "text-emerald-600",
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function GrowLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlaceholderContent() {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed py-6">
      <span className="text-xs text-muted-foreground">Status tracking coming soon</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function StatusOverviewPage() {
  const [aggregates, setAggregates] = useState<StatusAggregates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrowStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/grow/status");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
      }
      const json = (await res.json()) as GrowStatusResponse;
      setAggregates(json.aggregates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowStatus();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-foreground">Status Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Cross-functional health check across all HR domains
        </p>
      </div>

      <div className="space-y-4">
        {/* Grow — real data */}
        <CategoryStatusCard
          label="Grow"
          subtitle="Performance & Development"
          color="#44aa99"
          detailHref="/status/grow"
        >
          {loading ? (
            <GrowLoadingSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center py-6">
              <p className="text-xs text-destructive mb-2">{error}</p>
              <button
                type="button"
                onClick={fetchGrowStatus}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : aggregates ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Direct Reports" value={aggregates.directReportsCount} icon={Users} />
              <StatCard title="Active Goals" value={aggregates.activeGoalsCount} icon={Target} />
              <StatCard
                title="Check-in Completion (7d)"
                value={`${Math.round(aggregates.checkInCompletion7d)}%`}
                icon={CheckCircle2}
                highlight={aggregates.checkInCompletion7d >= 80 ? "green" : undefined}
              />
              <StatCard
                title="Overdue Check-ins"
                value={aggregates.overdueCheckIns}
                icon={AlertTriangle}
                highlight={aggregates.overdueCheckIns > 0 ? "red" : undefined}
              />
            </div>
          ) : (
            <PlaceholderContent />
          )}
        </CategoryStatusCard>

        {/* Plan & Attract — placeholder, full width */}
        {CATEGORIES.filter((c) => !c.hasData && ["plan", "attract"].includes(c.key)).map((cat) => (
          <CategoryStatusCard
            key={cat.key}
            label={cat.label}
            subtitle={cat.subtitle}
            color={cat.color}
          >
            <PlaceholderContent />
          </CategoryStatusCard>
        ))}

        {/* Launch, Care, Protect — placeholder, horizontal row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORIES.filter((c) => !c.hasData && ["launch", "care", "protect"].includes(c.key)).map((cat) => (
            <CategoryStatusCard
              key={cat.key}
              label={cat.label}
              subtitle={cat.subtitle}
              color={cat.color}
            >
              <PlaceholderContent />
            </CategoryStatusCard>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fv_123/ascenta && pnpm build --filter=@ascenta/platform`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/status/page.tsx
git commit -m "feat: add Status Overview page at /status"
```

---

## Chunk 3: Detail Pages & Insights Overview

### Task 5: Create Status Grow detail page

**Files:**
- Create: `apps/platform/src/app/status/grow/page.tsx`

- [ ] **Step 1: Create the detail page**

Create directory and file at `apps/platform/src/app/status/grow/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusDashboard } from "@/components/grow/status-dashboard";

export default function StatusGrowDetailPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <Link
          href="/status"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-3" />
          Back to Status Overview
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground">Grow — Performance Status</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed performance metrics for your direct reports
        </p>
      </div>
      <StatusDashboard />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fv_123/ascenta && pnpm build --filter=@ascenta/platform`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/status/grow/page.tsx
git commit -m "feat: add Grow status detail page at /status/grow"
```

---

### Task 6: Create Insights Overview page

**Files:**
- Create: `apps/platform/src/app/insights/page.tsx`

- [ ] **Step 1: Create the insights overview page**

Create file at `apps/platform/src/app/insights/page.tsx`:

```tsx
import { CategoryStatusCard } from "@/components/overview/category-status-card";

const CATEGORIES = [
  { key: "grow", label: "Grow", subtitle: "Performance & Development", color: "#44aa99" },
  { key: "plan", label: "Plan", subtitle: "Strategy & Workforce Planning", color: "#6688bb" },
  { key: "attract", label: "Attract", subtitle: "Hiring Pipeline", color: "#aa8866" },
  { key: "launch", label: "Launch", subtitle: "Onboarding & Enablement", color: "#bb6688" },
  { key: "care", label: "Care", subtitle: "Total Rewards & Leave", color: "#cc6677" },
  { key: "protect", label: "Protect", subtitle: "Feedback & Case Management", color: "#8888aa" },
] as const;

function PlaceholderContent() {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed py-6">
      <span className="text-xs text-muted-foreground">Insights coming soon</span>
    </div>
  );
}

export default function InsightsOverviewPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-foreground">Insights</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Analytics and reporting across all HR domains
        </p>
      </div>

      <div className="space-y-4">
        {/* Grow — full width with detail link (only category with a detail page) */}
        <CategoryStatusCard
          label="Grow"
          subtitle="Performance & Development"
          color="#44aa99"
          detailHref="/insights/grow"
        >
          <PlaceholderContent />
        </CategoryStatusCard>

        {/* Plan & Attract — full width, no detail links yet */}
        {CATEGORIES.filter((c) => ["plan", "attract"].includes(c.key)).map((cat) => (
          <CategoryStatusCard
            key={cat.key}
            label={cat.label}
            subtitle={cat.subtitle}
            color={cat.color}
          >
            <PlaceholderContent />
          </CategoryStatusCard>
        ))}

        {/* Launch, Care, Protect — horizontal row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORIES.filter((c) => ["launch", "care", "protect"].includes(c.key)).map((cat) => (
            <CategoryStatusCard
              key={cat.key}
              label={cat.label}
              subtitle={cat.subtitle}
              color={cat.color}
            >
              <PlaceholderContent />
            </CategoryStatusCard>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fv_123/ascenta && pnpm build --filter=@ascenta/platform`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/insights/page.tsx
git commit -m "feat: add Insights Overview page at /insights"
```

---

### Task 7: Create Insights Grow detail page

**Files:**
- Create: `apps/platform/src/app/insights/grow/page.tsx`

- [ ] **Step 1: Create the detail page**

Create directory and file at `apps/platform/src/app/insights/grow/page.tsx`:

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InsightsGrowDetailPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <Link
          href="/insights"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-3" />
          Back to Insights
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground">Grow — Performance Insights</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Trends and analytics for performance, goals, and check-ins
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed h-[300px]">
        <span className="text-sm text-muted-foreground">Performance insights coming soon</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fv_123/ascenta && pnpm build --filter=@ascenta/platform`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/insights/grow/page.tsx
git commit -m "feat: add Grow insights detail page at /insights/grow"
```

---

## Chunk 4: End-to-End Verification

### Task 8: Full build and manual verification

- [ ] **Step 1: Run full build**

Run: `cd /Users/fv_123/ascenta && pnpm build`
Expected: Both platform and marketing apps build successfully

- [ ] **Step 2: Run lint**

Run: `cd /Users/fv_123/ascenta && pnpm lint`
Expected: No lint errors

- [ ] **Step 3: Run tests**

Run: `cd /Users/fv_123/ascenta && pnpm test`
Expected: All tests pass

- [ ] **Step 4: Start dev server and verify all routes**

Run: `cd /Users/fv_123/ascenta && pnpm dev --filter=@ascenta/platform`

Verify at `http://localhost:3051`:
1. **Sidebar:** "Overview" label visible below Protect. Status and Insights links present with colored icons. Clicking them navigates to `/status` and `/insights`.
2. **Collapsed sidebar:** Collapse via toggle. Status/Insights icons visible. Clicking navigates correctly.
3. **`/status`:** Page renders with Grow section showing 4 stat cards (or loading/error state). Plan and Attract show as full-width placeholders. Launch/Care/Protect show as compact row.
4. **`/status/grow`:** Back link to `/status` works. Full StatusDashboard renders with table.
5. **`/insights`:** All category sections show placeholder. "View Details" links work.
6. **`/insights/grow`:** Back link works. Placeholder content shows.
7. **`/grow/performance`:** Tab bar shows only Do and Learn. Status tab is gone. Learn tab still renders LearnPanel.
8. **Other category pages** (e.g., `/plan/strategy-studio`): Tab bar shows only Do and Learn. No status/insights tabs.
9. **Active states:** Sidebar highlights Status when on `/status` or `/status/grow`. Same for Insights.
