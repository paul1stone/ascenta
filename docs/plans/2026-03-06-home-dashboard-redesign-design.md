# Home Dashboard Redesign — Design

**Date:** 2026-03-06

## Goal

Redesign the home page (`/home`) to be a welcoming app entry point. Prioritize tasks/activity/notifications; push metrics/directory secondary. Manager view only for now — role-based visibility comes later.

## Greeting Banner

New `WelcomeBanner` component:
- Time-of-day greeting: "Good morning/afternoon/evening, Jason" (hardcoded name, no auth)
- Subtitle: formatted date + "Here's what's happening"
- Clean typography, no decorative elements

## Layout (top to bottom)

```
1. WelcomeBanner
2. NeedsAttention (1/2)  |  RecentActivity (1/2)
3. QuickActions (full width)
4. StatsOverview (full width)
5. EmployeeDirectory (2/3)  |  DocumentPipeline (1/3)
```

## Component Changes

- **`home/page.tsx`** — Reorder sections, add WelcomeBanner
- **`components/dashboard/welcome-banner.tsx`** — New component, no data fetching
- All other components unchanged, just reordered

## Role-based visibility (future)

Wrap manager-only sections (Stats, Directory, Pipeline, possibly NeedsAttention) in conditionals when auth is added. Quick Actions and Activity are universal.

## Not changing

- No new API routes
- No changes to existing component internals
- No auth/role system
