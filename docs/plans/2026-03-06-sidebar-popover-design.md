# Sidebar Popover Design

**Date:** 2026-03-06
**Scope:** Add popover to collapsed sidebar category icons showing sub-pages

## Behavior

- Collapsed state: clicking a category icon opens a Radix Popover to the right with category label and sub-page links
- Clicking a sub-page link navigates and closes the popover (sidebar stays collapsed)
- Expanded state: no change — inline sub-pages as before
- Home icon: no popover (no sub-pages), stays as direct link

## Implementation

Single file change: `apps/platform/src/components/nav-sidebar.tsx`

Uses existing `@ascenta/ui/popover` (shadcn Popover wrapping Radix).

When `collapsed`:
- Category `<Link>` becomes `<Popover>` with `<PopoverTrigger asChild><button>` containing the icon
- `<PopoverContent side="right" align="start">` shows category label + sub-page links

When not `collapsed`:
- Existing behavior unchanged

## Popover Styling

- Width: `w-48`, padding: `p-2`
- Category label: `font-semibold text-xs text-deep-blue` with left border in `cat.color`
- Sub-page links: `text-sm hover:bg-primary/5 rounded-md px-2 py-1.5`
- Active sub-page: `bg-primary/8 text-deep-blue font-semibold`

## What Stays the Same

- Expanded sidebar behavior
- Home link (no popover)
- Collapse toggle, layout, routing
