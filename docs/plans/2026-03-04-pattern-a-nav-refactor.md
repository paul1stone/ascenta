# Pattern A Nav Refactor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the chat-centric sidebar + header layout with Pattern A (Sidebar + Tabs) from `nav-wireframe.jsx` — collapsible category sidebar, horizontal function tabs, dynamic category/sub routes.

**Architecture:** Collapsible sidebar renders 6 HR categories from `DASHBOARD_NAV` with expandable subcategories. Clicking a subcategory navigates to `/[category]/[sub]`. A horizontal tab bar (Do/Learn/Status/Insights) sits above the content area as client-side state. Chat panel and providers are removed from the layout.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide icons, `@ascenta/ui` (cn utility), `usePathname`/`useRouter` from `next/navigation`.

**Design doc:** `docs/plans/2026-03-04-pattern-a-nav-refactor-design.md`

---

### Task 1: Update dashboard-nav.ts constants

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`

**Step 1: Add color field to NavCategory and accent colors to each category**

Add `color: string` to the `NavCategory` interface. Add colors to each entry:
```ts
export interface NavCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  subPages: SubPage[];
}
```

Colors:
- launch: `"#bb6688"` (rose)
- protect: `"#6688bb"` (blue)
- attract: `"#aa8866"` (amber)
- develop: `"#44aa99"` (green)
- transition: `"#8888aa"` (slate)
- analyze: `"#55aa88"` (teal)

**Step 2: Update TabKey and add FUNCTION_TABS config**

Replace `"dashboard"` with `"insights"` in the TabKey type. Add new imports and config:

```ts
import { Play, BookOpen, CircleDot, BarChart3 } from "lucide-react";

export type TabKey = "do" | "learn" | "status" | "insights";

export interface FunctionTab {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FUNCTION_TABS: FunctionTab[] = [
  { key: "do", label: "Do", icon: Play, title: "Action Center", description: "Primary workspace for executing tasks" },
  { key: "learn", label: "Learn", icon: BookOpen, title: "Knowledge Base", description: "Documentation, guides, and training" },
  { key: "status", label: "Status", icon: CircleDot, title: "Status Dashboard", description: "Real-time monitoring and health checks" },
  { key: "insights", label: "Insights", icon: BarChart3, title: "Analytics & Insights", description: "Data analysis and reporting" },
];
```

**Step 3: Add helper to look up category/sub from URL params**

```ts
export function findNavContext(categoryKey: string, subKey: string) {
  const category = DASHBOARD_NAV.find((c) => c.key === categoryKey);
  if (!category) return null;
  const subPage = category.subPages.find((s) => s.key === `${categoryKey}/${subKey}`);
  if (!subPage) return null;
  return { category, subPage };
}
```

**Step 4: Verify no TypeScript errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm exec tsc --noEmit --project apps/platform/tsconfig.json`

Note: There will be errors in files that reference the old `"dashboard"` TabKey — that's expected and fixed in later tasks.

**Step 5: Commit**

```
feat: update dashboard-nav constants with colors, function tabs, and insights tab key
```

---

### Task 2: Create the collapsible nav sidebar component

**Files:**
- Create: `apps/platform/src/components/nav-sidebar.tsx`

**Step 1: Build the NavSidebar component**

This is a standalone client component that:
- Renders the Ascenta compass logo + branding at top
- Has a collapse toggle (220px full / 52px icon-only) using local state
- Lists 6 categories from `DASHBOARD_NAV` with Lucide icons
- Active category (matched from `usePathname()`) shows subcategories indented below
- Active category has a colored left border using `category.color`
- Subcategory clicks use `next/link` to navigate to `/${category.key}/${subKey}`
- Collapsed mode shows only category icons centered

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@ascenta/ui";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";

export function NavSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Extract active category and sub from pathname like "/protect/warnings"
  const segments = pathname.split("/").filter(Boolean);
  const activeCategoryKey = segments[0] || "";
  const activeSubKey = segments[1] || "";

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r bg-[#f0f0f0] transition-[width] duration-200 overflow-hidden",
        collapsed ? "w-[52px]" : "w-[220px]"
      )}
    >
      {/* Logo + Branding */}
      <div
        className={cn(
          "flex items-center gap-2 border-b h-14 shrink-0",
          collapsed ? "justify-center px-0" : "px-3.5"
        )}
      >
        <Image src="/compass.svg" alt="Ascenta" width={collapsed ? 24 : 28} height={collapsed ? 24 : 28} />
        {!collapsed && (
          <div>
            <div className="font-display text-[10px] text-muted-foreground tracking-[2px]">ASCENTA</div>
            <div className="text-[11px] text-muted-foreground/60 -mt-0.5">StoneCyber</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "flex items-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground border-b transition-colors",
          collapsed ? "justify-center px-0" : "px-2.5"
        )}
      >
        {collapsed ? <PanelLeft className="size-4" /> : <><PanelLeftClose className="size-4" /><span>collapse</span></>}
      </button>

      {/* Category list */}
      <nav className="flex-1 overflow-y-auto py-1">
        {DASHBOARD_NAV.map((cat) => {
          const isActive = cat.key === activeCategoryKey;
          const Icon = cat.icon;

          return (
            <div key={cat.key}>
              {/* Category item — clicking navigates to first sub */}
              <Link
                href={`/${cat.key}/${cat.subPages[0].key.split("/")[1]}`}
                className={cn(
                  "flex items-center gap-2 py-2.5 text-[13px] whitespace-nowrap transition-colors",
                  collapsed ? "justify-center px-0" : "px-3.5",
                  isActive ? "font-bold text-foreground bg-[#ddd]" : "text-muted-foreground hover:text-foreground hover:bg-[#e8e8e8]"
                )}
                style={{
                  borderLeft: isActive ? `3px solid ${cat.color}` : "3px solid transparent",
                }}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span>{cat.label}</span>}
              </Link>

              {/* Subcategories (expanded only when active and not collapsed) */}
              {!collapsed && isActive && cat.subPages.map((sub) => {
                const subKey = sub.key.split("/")[1];
                const isSubActive = subKey === activeSubKey;
                return (
                  <Link
                    key={sub.key}
                    href={`/${cat.key}/${subKey}`}
                    className={cn(
                      "block py-1.5 pl-[30px] pr-3.5 text-xs whitespace-nowrap transition-colors",
                      isSubActive
                        ? "font-semibold text-foreground bg-[#e8e8e8]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm exec tsc --noEmit --project apps/platform/tsconfig.json`

Ignore errors in files not yet updated (page.tsx, chat-context.tsx).

**Step 3: Commit**

```
feat: add collapsible nav sidebar component with category navigation
```

---

### Task 3: Create the function tabs component

**Files:**
- Create: `apps/platform/src/components/function-tabs.tsx`

**Step 1: Build FunctionTabs component**

Client component that renders the Do/Learn/Status/Insights horizontal tab bar. Takes `activeTab`, `onTabChange`, and `accentColor` props.

```tsx
"use client";

import { cn } from "@ascenta/ui";
import { FUNCTION_TABS, type TabKey } from "@/lib/constants/dashboard-nav";

interface FunctionTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  accentColor: string;
}

export function FunctionTabs({ activeTab, onTabChange, accentColor }: FunctionTabsProps) {
  return (
    <div className="flex border-b bg-[#fafafa]">
      {FUNCTION_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-6 py-3 text-[13px] font-mono transition-colors",
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

**Step 2: Commit**

```
feat: add function tabs component (Do, Learn, Status, Insights)
```

---

### Task 4: Create the breadcrumb component

**Files:**
- Create: `apps/platform/src/components/breadcrumb-nav.tsx`

**Step 1: Build BreadcrumbNav component**

Simple breadcrumb showing Category / Subcategory / Function tab name.

```tsx
import { cn } from "@ascenta/ui";

interface BreadcrumbNavProps {
  category: string;
  subPage: string;
  functionTab: string;
}

export function BreadcrumbNav({ category, subPage, functionTab }: BreadcrumbNavProps) {
  const crumbs = [category, subPage, functionTab].filter(Boolean);
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          <span>{crumb}</span>
        </span>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```
feat: add breadcrumb nav component
```

---

### Task 5: Create the dynamic [category]/[sub] route page

**Files:**
- Create: `apps/platform/src/app/[category]/[sub]/page.tsx`

**Step 1: Build the dynamic page**

This page:
- Reads `params.category` and `params.sub` to resolve the nav context via `findNavContext()`
- If not found, calls `notFound()`
- Renders FunctionTabs (client-side state, default "do")
- Renders BreadcrumbNav
- Renders placeholder content: title, description, and suggestion cards from `PAGE_CONFIG`

```tsx
"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { findNavContext, FUNCTION_TABS, PAGE_CONFIG, DEFAULT_PAGE_CONFIG, type TabKey } from "@/lib/constants/dashboard-nav";
import { FunctionTabs } from "@/components/function-tabs";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default function CategorySubPage({
  params,
}: {
  params: Promise<{ category: string; sub: string }>;
}) {
  const { category, sub } = use(params);
  const ctx = findNavContext(category, sub);
  if (!ctx) notFound();

  const [activeTab, setActiveTab] = useState<TabKey>("do");
  const tabMeta = FUNCTION_TABS.find((t) => t.key === activeTab)!;
  const pageConfig = PAGE_CONFIG[`${category}/${sub}`] || DEFAULT_PAGE_CONFIG;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FunctionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ctx.category.color}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <BreadcrumbNav
          category={ctx.category.label}
          subPage={ctx.subPage.label}
          functionTab={tabMeta.label}
        />
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          {tabMeta.title}
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          {ctx.category.label} / {ctx.subPage.label} — {tabMeta.description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pageConfig.suggestions.map((s) => (
            <div
              key={s.title}
              className="rounded-lg border-2 border-dashed flex items-center justify-center h-[100px] text-sm text-muted-foreground"
              style={{
                borderColor: `${ctx.category.color}66`,
                background: `${ctx.category.color}08`,
                color: ctx.category.color,
              }}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors in this file**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm exec tsc --noEmit --project apps/platform/tsconfig.json`

Expect errors in other files (page.tsx, chat-context.tsx) — those are fixed next.

**Step 3: Commit**

```
feat: add dynamic [category]/[sub] route with function tabs and placeholder content
```

---

### Task 6: Update root layout — remove chat, wire sidebar

**Files:**
- Modify: `apps/platform/src/app/layout.tsx`

**Step 1: Rewrite the root layout**

Remove `ChatProvider`, `ChatPanelLayout`, `ChatPanel`, `ChatPanelTrigger`, and `SidebarProvider`. Replace with `NavSidebar` + content slot.

```tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NavSidebar } from "@/components/nav-sidebar";
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
        <div className="flex h-screen overflow-hidden">
          <NavSidebar />
          <main className="flex flex-1 flex-col overflow-hidden bg-glacier">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
```

**Step 2: Update the root page.tsx to a simple redirect**

Replace `apps/platform/src/app/page.tsx` with a redirect to the first subcategory:

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/launch/onboarding");
}
```

**Step 3: Update /dashboard/page.tsx and /tracker/page.tsx**

These pages previously used `SidebarInset` and `AppNavbar`. Simplify them to just render their content inside the new layout (they're already wrapped by the root layout sidebar):

`apps/platform/src/app/dashboard/page.tsx`:
```tsx
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-blue">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of your HR operations and team activity.</p>
        </div>
        <StatsOverview />
        <NeedsAttention />
        <QuickActions />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmployeeDirectory />
          </div>
          <div className="space-y-6">
            <DocumentPipeline />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
```

`apps/platform/src/app/tracker/page.tsx`:
```tsx
import { DocumentTracker } from "@/components/document-tracker";

export default function TrackerPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-blue">Document Tracker</h1>
          <p className="mt-1 text-muted-foreground">Track and manage HR documents through their delivery lifecycle.</p>
        </div>
        <DocumentTracker />
      </div>
    </div>
  );
}
```

**Step 4: Verify TypeScript compiles clean**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm exec tsc --noEmit --project apps/platform/tsconfig.json`

Fix any remaining type errors (likely in `chat-context.tsx` referencing old `"dashboard"` tab key — update to `"insights"` or leave chat-context alone since it's not imported anymore).

**Step 5: Commit**

```
refactor: rewire root layout with nav sidebar, remove chat panel providers
```

---

### Task 7: Verify the app runs and all routes work

**Step 1: Start the dev server**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform`

**Step 2: Verify these routes in the browser**

- `/` — should redirect to `/launch/onboarding`
- `/launch/onboarding` — sidebar shows Launch active with subcategories, Onboarding highlighted, function tabs visible
- `/protect/warnings` — sidebar shows Protect active, Written Warnings highlighted
- `/protect/pip` — PIP Management highlighted
- `/dashboard` — legacy dashboard page renders inside new layout
- `/tracker` — legacy tracker page renders inside new layout
- Collapse/expand sidebar toggle works
- Function tabs switch between Do/Learn/Status/Insights
- Breadcrumb updates on tab switch
- Category accent colors show on active sidebar item and active tab underline

**Step 3: Run lint**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm lint`

Fix any lint issues.

**Step 4: Final commit**

```
chore: verify nav refactor — lint clean, all routes working
```

---

### Task 8: Clean up unused chat components (optional, low priority)

**Files that are no longer imported from root layout but still exist:**
- `apps/platform/src/components/chat/chat-panel-layout.tsx`
- `apps/platform/src/components/chat/chat-panel.tsx`
- `apps/platform/src/components/chat/chat-panel-trigger.tsx`
- `apps/platform/src/lib/chat/chat-context.tsx`
- `apps/platform/src/components/chat/app-sidebar.tsx`
- `apps/platform/src/components/app-navbar.tsx`

**Do NOT delete these files** — they contain working chat functionality that will be reintegrated later. Just leave them as unreferenced code for now. If TypeScript complains about them (e.g., referencing old `"dashboard"` TabKey), update the minimum needed to fix compilation:

- In `chat-context.tsx`: change default tab from `"dashboard"` to `"insights"` if it references `TabKey`
- In `app/page.tsx` (root): already replaced with redirect, so old references are gone

**Step 1: Fix any remaining TS errors in unreferenced files**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm exec tsc --noEmit --project apps/platform/tsconfig.json`

**Step 2: Commit**

```
chore: fix remaining type errors in unused chat components
```
