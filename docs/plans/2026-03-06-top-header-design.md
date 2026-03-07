# Top Header Design

**Date:** 2026-03-06
**Scope:** Add a persistent top header bar to the platform app

## Context

The platform has a sidebar nav but no top header. Pages with action bars (FunctionTabs) render them at the top of their own content. A shared header is needed for company branding (left) and app-level actions (right).

## Component: `TopHeader`

- New file: `apps/platform/src/components/top-header.tsx`
- Client component (NotificationCenter uses state)
- Height: `h-14`, white bg, bottom border

### Left side — Company branding
- Placeholder logo (styled div with "SC" initials)
- "StoneCyber" in `font-display font-bold text-deep-blue`
- Hardcoded for now, will be configurable per-company later

### Right side — App actions (3 icon buttons)
- Settings: `Settings` lucide icon, ghost button, placeholder
- Notifications: Existing `NotificationCenter` component
- Profile: `CircleUser` lucide icon, ghost button, placeholder

## Layout Integration

Modify `app/layout.tsx` main area:
```tsx
<main className="flex flex-1 flex-col overflow-hidden bg-glacier">
  <TopHeader />
  <div className="flex flex-1 flex-col overflow-hidden">
    {children}
  </div>
</main>
```

## What Stays the Same
- FunctionTabs remains inside `[category]/[sub]/page.tsx`
- Sidebar, routing, all page content untouched
- NotificationCenter component itself unchanged, just rendered in header
