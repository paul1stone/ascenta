# Platform Brand Styling Design

**Date:** 2026-03-06
**Scope:** Bring Ascenta brand tokens into the platform sidebar

## Context

The shared `packages/ui/src/globals.css` already defines all Ascenta brand tokens (Deep Blue, Summit orange, Glacier, Montserrat/Inter fonts, sidebar-dark theme). The marketing app uses them consistently. The platform sidebar (`nav-sidebar.tsx`) uses hardcoded grays (`bg-[#f0f0f0]`, `bg-[#ddd]`, `bg-[#e8e8e8]`) and inline border styles instead of brand tokens.

## Approach: Token-only swap

Replace hardcoded grays in `nav-sidebar.tsx` with existing CSS tokens. No new CSS variables or classes needed. Dark mode will be added later by conditionally applying the existing `.sidebar-dark` class.

## Styling Map

| Element | Current | Branded |
|---------|---------|---------|
| Sidebar bg | `bg-[#f0f0f0]` | `bg-white` |
| Logo "ASCENTA" | `text-sm font-bold` | `font-display text-sm font-bold text-deep-blue` |
| Collapse btn hover | `hover:bg-[#e8e8e8]` | `hover:bg-primary/5` |
| Home active | `bg-[#ddd]` + inline border | `bg-primary/6` + Tailwind `border-l-[3px] border-deep-blue` |
| Home inactive | `hover:bg-[#e8e8e8]` | `hover:bg-primary/5` |
| Category active | `bg-[#ddd]` + inline border | `bg-primary/6` + `border-l-[3px]` with `style={{ borderColor: cat.color }}` |
| Category inactive | `hover:bg-[#e8e8e8]` | `hover:bg-primary/5` |
| Sub-item active | `bg-[#e8e8e8]` | `bg-primary/8 text-deep-blue` |
| Sub-item inactive | `hover:bg-[#e8e8e8]` | `hover:bg-primary/5` |

## Files Changed

- `apps/platform/src/components/nav-sidebar.tsx` — replace hardcoded colors with brand tokens

## What Stays the Same

- Layout structure, collapse behavior, routing logic
- `globals.css` — no changes needed
- Category accent colors in `dashboard-nav.ts`
- All other platform components
