# Sidebar Popover Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When the sidebar is collapsed, clicking a category icon opens a popover showing its sub-pages instead of navigating directly.

**Architecture:** Single file change to `nav-sidebar.tsx`. When `collapsed`, each category renders a Radix Popover (via `@ascenta/ui/popover`) instead of a `<Link>`. The popover shows the category label and sub-page links. Clicking a sub-page navigates and closes the popover.

**Tech Stack:** React 19, Radix Popover (shadcn), Next.js Link, Tailwind CSS v4

---

### Task 1: Add popover imports and refactor category rendering

**Files:**
- Modify: `apps/platform/src/components/nav-sidebar.tsx`

**Step 1: Add Popover imports**

Add after the existing imports (line 9):
```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@ascenta/ui/popover";
```

**Step 2: Replace the category rendering block**

Replace lines 89-131 (the `DASHBOARD_NAV.map` callback body) with the following. The key change: when `collapsed`, the category icon becomes a `PopoverTrigger` button instead of a `Link`, and sub-pages render inside `PopoverContent`. When expanded, behavior is unchanged.

```tsx
return (
  <div key={cat.key}>
    {collapsed ? (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-center py-2.5 transition-colors",
              isActive
                ? "font-bold bg-primary/6 border-l-[3px]"
                : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
            )}
            style={isActive ? { borderLeftColor: cat.color } : undefined}
          >
            <CategoryIcon className="size-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-48 p-2"
        >
          <div
            className="mb-2 border-l-[3px] pl-2 text-xs font-semibold text-deep-blue"
            style={{ borderLeftColor: cat.color }}
          >
            {cat.label}
          </div>
          {cat.subPages.map((sub) => {
            const subKey = sub.key.split("/")[1];
            const isSubActive = activeSub === subKey && isActive;
            return (
              <Link
                key={sub.key}
                href={`/${cat.key}/${subKey}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm transition-colors",
                  isSubActive
                    ? "font-semibold bg-primary/8 text-deep-blue"
                    : "text-muted-foreground hover:bg-primary/5",
                )}
              >
                {sub.label}
              </Link>
            );
          })}
        </PopoverContent>
      </Popover>
    ) : (
      <>
        <Link
          href={`/${cat.key}/${firstSubKey}`}
          className={cn(
            "flex items-center gap-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors px-3.5",
            isActive
              ? "font-bold bg-primary/6 border-l-[3px]"
              : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
          )}
          style={isActive ? { borderLeftColor: cat.color } : undefined}
        >
          <CategoryIcon className="size-4 shrink-0" />
          <span>{cat.label}</span>
        </Link>

        {/* Subcategories */}
        {isActive && (
          <div>
            {cat.subPages.map((sub) => {
              const subKey = sub.key.split("/")[1];
              const isSubActive = activeSub === subKey;

              return (
                <Link
                  key={sub.key}
                  href={`/${cat.key}/${subKey}`}
                  className={cn(
                    "block py-1.5 pl-[30px] pr-3.5 text-xs whitespace-nowrap transition-colors",
                    isSubActive
                      ? "font-semibold bg-primary/8 text-deep-blue"
                      : "text-muted-foreground hover:bg-primary/5",
                  )}
                >
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}
      </>
    )}
  </div>
);
```

Note: The expanded branch no longer needs the `collapsed ? "justify-center px-0" : "px-3.5"` ternary since each branch now handles its own layout. The expanded `<Link>` always gets `px-3.5`.

### Task 2: Verify and commit

**Step 1: Run dev server**

Run: `pnpm dev --filter=@ascenta/platform`

**Step 2: Verify in browser at `http://localhost:3051`**

Check:
- Collapse sidebar → click any category icon → popover appears to the right
- Popover shows category label with colored left border
- Popover lists all sub-pages for that category
- Clicking a sub-page navigates to the correct page and popover closes
- Active sub-page is highlighted in the popover
- Expand sidebar → categories work as before (inline sub-pages, no popover)
- Home link still navigates directly (no popover) in both states

**Step 3: Commit**

```bash
git add apps/platform/src/components/nav-sidebar.tsx
git commit -m "feat: add popover to collapsed sidebar showing category sub-pages"
```
