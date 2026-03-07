# Top Header Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent top header with company branding (left) and app actions (right) above all page content.

**Architecture:** New `TopHeader` client component rendered in `app/layout.tsx` main area. Uses existing `NotificationCenter` component. Placeholder branding for "StoneCyber" — configurable later.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS v4, Lucide icons, shadcn/ui Button

---

### Task 1: Create TopHeader component

**Files:**
- Create: `apps/platform/src/components/top-header.tsx`

**Step 1: Create the component file**

```tsx
"use client";

import { Button } from "@ascenta/ui/button";
import { Settings, CircleUser } from "lucide-react";
import { NotificationCenter } from "@/components/notification-center";

export function TopHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-4">
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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-deep-blue">
          <CircleUser className="size-4" />
        </Button>
      </div>
    </header>
  );
}
```

### Task 2: Integrate TopHeader into layout

**Files:**
- Modify: `apps/platform/src/app/layout.tsx:1-29`

**Step 1: Add TopHeader import**

Add after the `NavSidebar` import (line 3):
```tsx
import { TopHeader } from "@/components/top-header";
```

**Step 2: Wrap children with TopHeader above**

Replace the `<main>` element (line 21):
```tsx
<main className="flex flex-1 flex-col overflow-hidden bg-glacier">
  {children}
</main>
```
with:
```tsx
<main className="flex flex-1 flex-col overflow-hidden bg-glacier">
  <TopHeader />
  <div className="flex flex-1 flex-col overflow-hidden">
    {children}
  </div>
</main>
```

### Task 3: Verify and commit

**Step 1: Run dev server**

Run: `pnpm dev --filter=@ascenta/platform`

**Step 2: Verify in browser at `http://localhost:3051`**

Check:
- Header appears at top of main content area (right of sidebar)
- Left side shows "SC" logo box + "StoneCyber" text
- Right side shows settings gear, notification bell, profile icon
- Notification bell popover still works when clicked
- FunctionTabs on category pages render below the header
- Home page shows header above its content
- Header stays fixed while page content scrolls

**Step 3: Commit**

```bash
git add apps/platform/src/components/top-header.tsx apps/platform/src/app/layout.tsx
git commit -m "feat: add persistent top header with company branding and app actions"
```
