# Home Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `/home` to be a welcoming entry point — greeting first, tasks/activity prominent, metrics/directory secondary.

**Architecture:** Create one new `WelcomeBanner` component, then reorder existing components in `home/page.tsx`. No API changes, no component internal changes.

**Tech Stack:** Next.js App Router (RSC), React, Tailwind CSS

---

### Task 1: Create WelcomeBanner component

**Files:**
- Create: `apps/platform/src/components/dashboard/welcome-banner.tsx`

**Step 1: Create the component**

This is a server component (no "use client") — just renders based on the current time.

```tsx
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function WelcomeBanner() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-deep-blue">
        {getGreeting()}, Jason
      </h1>
      <p className="mt-1 text-muted-foreground">
        {getFormattedDate()} &middot; Here&apos;s what&apos;s happening
      </p>
    </div>
  );
}
```

**Step 2: Verify no build errors**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```
git add apps/platform/src/components/dashboard/welcome-banner.tsx
git commit -m "feat: add WelcomeBanner component for home page greeting"
```

---

### Task 2: Reorder home page layout

**Files:**
- Modify: `apps/platform/src/app/home/page.tsx`

**Step 1: Update the page**

Replace the entire file with the new layout order:

```tsx
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Welcome greeting */}
        <WelcomeBanner />

        {/* 2. Primary: Action items + Activity (two-column) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeedsAttention />
          <RecentActivity />
        </div>

        {/* 3. Quick actions */}
        <QuickActions />

        {/* 4. Stats overview */}
        <StatsOverview />

        {/* 5. Secondary: Directory + Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmployeeDirectory />
          </div>
          <div>
            <DocumentPipeline />
          </div>
        </div>
      </div>
    </div>
  );
}
```

Key changes from current:
- Static header replaced with `WelcomeBanner`
- `NeedsAttention` + `RecentActivity` in a 1/2 + 1/2 grid (was: NeedsAttention full-width, Activity in sidebar)
- `QuickActions` stays full-width
- `StatsOverview` moved below quick actions (was: first section)
- `EmployeeDirectory` + `DocumentPipeline` in 2/3 + 1/3 grid (same as before, minus RecentActivity from sidebar)

**Step 2: Verify build**

Run: `cd apps/platform && npx tsc --noEmit`
Expected: No errors

**Step 3: Visual check**

Run: `pnpm dev --filter=@ascenta/platform`
Open: `http://localhost:3051/home`
Verify: Greeting at top, two-column action/activity, quick actions, stats, directory/pipeline at bottom.

**Step 4: Commit**

```
git add apps/platform/src/app/home/page.tsx
git commit -m "feat: reorder home page — greeting first, tasks/activity prominent, metrics secondary"
```
