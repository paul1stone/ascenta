# Status & Insights Sidebar Pages — Design Spec

**Date:** 2026-03-13
**Status:** Approved

## Summary

Move Status and Insights from per-page tabs (inside `[category]/[sub]`) to standalone sidebar navigation items with their own overview pages. Each overview aggregates data across all HR categories, with "View Details" links to category-specific detail pages.

## Current State

- `FUNCTION_TABS` defines 4 tabs: Do, Learn, Status, Insights
- Status and Insights tabs render on every `[category]/[sub]` page
- Only `grow/performance` has a real Status implementation (`StatusDashboard` component + `/api/grow/status` API)
- Insights shows "coming soon" on all pages
- The sidebar (`NavSidebar`) has: Logo, Home, divider, then the 6 category links (Plan, Attract, Launch, Grow, Care, Protect)

## Design

### 1. Navigation Changes

**Tab system (`dashboard-nav.ts`):**
- Remove `"status"` and `"insights"` from `FUNCTION_TABS`, leaving `"do"` and `"learn"`
- Update `TabKey` type to `"do" | "learn"`

**Sidebar (`nav-sidebar.tsx`):**
- After the category nav list, add a divider
- Add an "OVERVIEW" section label (small, uppercase, muted — same style as existing section labels)
- Two links below the label:
  - **Status** — icon: `CircleDot`, route: `/status`
  - **Insights** — icon: `BarChart3`, route: `/insights`
- Active state: left border highlight + background tint, consistent with category items
- Collapsed state: show just the icon using a simple `Link` component (no popover — these are direct page links, unlike category items which use `CategoryPopover`)

### 2. Routes & Pages

**File structure (Next.js App Router):**
```
app/
  status/
    page.tsx            # /status — overview
    grow/
      page.tsx          # /status/grow — detail
  insights/
    page.tsx            # /insights — overview
    grow/
      page.tsx          # /insights/grow — detail
```

Static routes take priority over the `[category]/[sub]` dynamic route, so `/status/grow` resolves to `app/status/grow/page.tsx`, not `app/[category]/[sub]/page.tsx`. No conflict.

| Route | Page | Content |
|-------|------|---------|
| `/status` | Status Overview | Aggregated status cards per category, Grow has real data |
| `/status/grow` | Grow Status Detail | Full `StatusDashboard` component (existing) |
| `/insights` | Insights Overview | Same card layout as status, all placeholder |
| `/insights/grow` | Grow Insights Detail | Placeholder for now |

**Page layout:**
- Standalone pages — no tab bar, no chat panel
- These pages are still wrapped in `ChatProvider` via the root layout, which is harmless (context is unused)
- Simple page header (title + description) followed by category sections

### 3. Status Overview Page (`/status`)

**Data fetching:** The overview page is a client component that fetches from `/api/grow/status` to show the 4 aggregate stat cards for Grow. The detail page (`/status/grow`) reuses the existing `StatusDashboard` component, which fetches the same data independently via its own `useEffect`. This intentional duplication keeps the components decoupled and avoids refactoring `StatusDashboard`.

**Grow section (has data):**
- Card with colored dot + "Grow" label + "Performance & Development" subtitle
- "View Details →" link in card header, routes to `/status/grow`
- 4 stat cards inside: Direct Reports, Active Goals, Check-in Completion (7d), Overdue Check-ins
- Data fetched from existing `/api/grow/status` endpoint

**Category subtitles:** Hardcoded in the overview component (not sourced from `DASHBOARD_NAV`, which has no description field per category). Values:
- Plan: "Strategy & Workforce Planning"
- Attract: "Hiring Pipeline"
- Launch: "Onboarding & Enablement"
- Grow: "Performance & Development"
- Care: "Total Rewards & Leave"
- Protect: "Feedback & Case Management"

**Other categories (Plan, Attract, Launch, Care, Protect):**
- Card with colored dot + category label + subtitle
- Compact "Status tracking coming soon" dashed placeholder inside
- Bottom 3 categories (Launch, Care, Protect) render in a horizontal row to save space

**Loading & error states:** The overview page uses a loading skeleton (similar pattern to `StatusDashboard`) while fetching Grow data, and shows an error state with retry if the fetch fails. Placeholder category sections render immediately (no fetch needed).

### 4. Insights Overview Page (`/insights`)

- Same structural layout as Status Overview
- All sections show placeholder content ("Insights coming soon")
- "View Details →" links present but go to placeholder detail pages

### 5. Detail Pages (`/status/grow`, `/insights/grow`)

**`/status/grow`:**
- Page header with back link to `/status`
- Renders existing `StatusDashboard` component as-is
- No changes to the component or its API

**`/insights/grow`:**
- Page header with back link to `/insights`
- Placeholder content for now

### 6. Component Architecture

**New components:**
- `StatusOverviewPage` — client component for `/status`, fetches Grow data and renders category sections
- `InsightsOverviewPage` — client component for `/insights`, renders placeholder sections
- `CategoryStatusCard` — reusable card wrapper for each category section (colored dot, label, subtitle, optional "View Details" link, children slot)

**Reused (no changes):**
- `StatusDashboard` — existing component, used on `/status/grow`
- `/api/grow/status` — existing API, called by overview page

**Modified:**
- `nav-sidebar.tsx` — add Overview section with Status/Insights links
- `dashboard-nav.ts` — remove status/insights from `FUNCTION_TABS` and `TabKey`
- `[category]/[sub]/page.tsx` — remove status/insights tab branches and `StatusDashboard` import. The `learn` tab and `LearnPanel` import remain unchanged.

### 7. Collapsed Sidebar Behavior

When the sidebar is collapsed (52px width):
- Status and Insights show as icon-only `Link` components (not `CategoryPopover`)
- No popover needed since these are direct page links, not expandable categories
- Clicking navigates directly to `/status` or `/insights`

### 8. Future Extensibility

Detail pages use static routes for now (`/status/grow`, `/insights/grow`). When more categories get status data, these can be refactored into a dynamic `[category]` route (e.g., `app/status/[category]/page.tsx`). This refactor is deferred until a second category needs it.

## Out of Scope

- Insights data/analytics implementation (placeholder only)
- Status data for categories other than Grow
- Changes to the existing `/api/grow/status` API
- Auth/permissions for status or insights pages
- Fixing the pre-existing check-in completion ratio display (API returns 0-1, component displays as percentage — existing bug)
