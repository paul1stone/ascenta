# Centralized Home Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Home" page at `/home` as the root entry point, with a persistent sidebar link above all categories.

**Architecture:** New `/home` route with placeholder content, sidebar gets a Home link above the category loop, root `/` redirect updated from `/launch/onboarding` to `/home`.

**Tech Stack:** Next.js App Router, React, lucide-react, Tailwind CSS

---

### Task 1: Create the Home page

**Files:**
- Create: `apps/platform/src/app/home/page.tsx`

**Step 1: Create the page**

```tsx
export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-deep-blue">Home</h1>
        <p className="mt-1 text-muted-foreground">
          Your centralized HR dashboard.
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/platform/src/app/home/page.tsx
git commit -m "feat: add home page placeholder"
```

---

### Task 2: Add Home link to sidebar

**Files:**
- Modify: `apps/platform/src/components/nav-sidebar.tsx`

**Step 1: Add import**

Add `LayoutDashboard` to the lucide-react import at line 8:

```tsx
import { PanelLeftClose, PanelLeft, LayoutDashboard } from "lucide-react";
```

**Step 2: Add Home link above the category nav loop**

Insert before `{/* Category nav */}` (before line 67), inside the `<nav>` element:

```tsx
{/* Home */}
<Link
  href="/home"
  className={cn(
    "flex items-center gap-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors",
    collapsed ? "justify-center px-0" : "px-3.5",
    pathname === "/home"
      ? "font-bold bg-[#ddd]"
      : "text-muted-foreground hover:bg-[#e8e8e8]",
  )}
  style={{
    borderLeft: pathname === "/home"
      ? "3px solid #0c1e3d"
      : "3px solid transparent",
  }}
>
  <LayoutDashboard className="size-4 shrink-0" />
  {!collapsed && <span>Home</span>}
</Link>
<div className="mx-3 my-1 border-b" />
```

**Step 3: Commit**

```bash
git add apps/platform/src/components/nav-sidebar.tsx
git commit -m "feat: add Home link to sidebar above categories"
```

---

### Task 3: Update root redirect

**Files:**
- Modify: `apps/platform/src/app/page.tsx`

**Step 1: Change redirect target**

Change line 4 from:
```tsx
  redirect("/launch/onboarding");
```
To:
```tsx
  redirect("/home");
```

**Step 2: Commit**

```bash
git add apps/platform/src/app/page.tsx
git commit -m "feat: redirect root to /home"
```

---

### Task 4: Verify

**Step 1: Run dev server and check**

```bash
pnpm dev --filter=@ascenta/platform
```

Verify:
- `/` redirects to `/home`
- `/home` shows the placeholder page
- Sidebar shows "Home" at the top, highlighted when on `/home`
- Clicking a category still works as before
- Home link deactivates when navigating to a category

**Step 2: Run lint and typecheck**

```bash
pnpm lint
pnpm build --filter=@ascenta/platform
```
