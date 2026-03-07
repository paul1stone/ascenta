# Platform Brand Styling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded gray colors in the platform sidebar with Ascenta brand tokens.

**Architecture:** Single-file token swap in `nav-sidebar.tsx`. All brand tokens already exist in `packages/ui/src/globals.css`. No new CSS needed.

**Tech Stack:** Tailwind CSS v4, React, Next.js

---

### Task 1: Replace sidebar background and logo styling

**Files:**
- Modify: `apps/platform/src/components/nav-sidebar.tsx:20-47`

**Step 1: Update sidebar background**

Change the `<aside>` className from:
```tsx
"flex flex-col shrink-0 border-r bg-[#f0f0f0] transition-[width] duration-200 overflow-hidden"
```
to:
```tsx
"flex flex-col shrink-0 border-r border-border bg-white transition-[width] duration-200 overflow-hidden"
```

**Step 2: Add brand font to logo text**

Change the "ASCENTA" span from:
```tsx
<span className="text-sm font-bold tracking-wider">ASCENTA</span>
```
to:
```tsx
<span className="font-display text-sm font-bold tracking-wider text-deep-blue">ASCENTA</span>
```

### Task 2: Replace collapse button and Home link colors

**Files:**
- Modify: `apps/platform/src/components/nav-sidebar.tsx:50-88`

**Step 1: Update collapse button hover**

Change the collapse button className from:
```tsx
"flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground hover:bg-[#e8e8e8] transition-colors"
```
to:
```tsx
"flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground hover:bg-primary/5 transition-colors"
```

**Step 2: Update Home link active/inactive states**

Change the Home link className from:
```tsx
pathname === "/home"
  ? "font-bold bg-[#ddd]"
  : "text-muted-foreground hover:bg-[#e8e8e8]",
```
to:
```tsx
pathname === "/home"
  ? "font-bold bg-primary/6"
  : "text-muted-foreground hover:bg-primary/5",
```

**Step 3: Replace Home link inline border style with Tailwind classes**

Replace the `style` prop on the Home link:
```tsx
style={{
  borderLeft: pathname === "/home"
    ? "3px solid #0c1e3d"
    : "3px solid transparent",
}}
```
with a className addition (merge into the existing `cn()` call):
```tsx
pathname === "/home"
  ? "font-bold bg-primary/6 border-l-[3px] border-l-deep-blue"
  : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
```
Remove the `style` prop entirely.

### Task 3: Replace category and sub-item colors

**Files:**
- Modify: `apps/platform/src/components/nav-sidebar.tsx:89-141`

**Step 1: Update category active/inactive states**

Change the category link className from:
```tsx
isActive
  ? "font-bold bg-[#ddd]"
  : "text-muted-foreground hover:bg-[#e8e8e8]",
```
to:
```tsx
isActive
  ? "font-bold bg-primary/6 border-l-[3px]"
  : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
```

Keep the `style` prop but simplify — only set `borderColor` when active (the border width is now in Tailwind):
```tsx
style={isActive ? { borderLeftColor: cat.color } : undefined}
```

**Step 2: Update sub-item active/inactive states**

Change the sub-item link className from:
```tsx
isSubActive
  ? "font-semibold bg-[#e8e8e8]"
  : "text-muted-foreground hover:bg-[#e8e8e8]",
```
to:
```tsx
isSubActive
  ? "font-semibold bg-primary/8 text-deep-blue"
  : "text-muted-foreground hover:bg-primary/5",
```

### Task 4: Visual verification and commit

**Step 1: Run the dev server**

Run: `pnpm dev --filter=@ascenta/platform`

**Step 2: Verify in browser**

Check at `http://localhost:3051`:
- Sidebar has white background
- "ASCENTA" logo uses Montserrat font
- Hover states show subtle deep-blue tint
- Active nav items show `primary/6` background with colored left border
- Active sub-items show slightly stronger `primary/8` tint
- No hardcoded hex grays remain in the sidebar

**Step 3: Commit**

```bash
git add apps/platform/src/components/nav-sidebar.tsx
git commit -m "style: replace hardcoded grays with Ascenta brand tokens in platform sidebar"
```
