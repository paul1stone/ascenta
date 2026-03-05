# Pattern A Navigation Refactor

## Goal

Replace the current chat-centric sidebar + header layout with the "Pattern A: Sidebar + Tabs" navigation from `nav-wireframe.jsx`. The sidebar becomes category navigation; the chat panel is removed entirely for now.

## Navigation Model

### Sidebar (collapsible)

- Compass logo + "Ascenta" branding at top
- Collapse toggle: full width (220px) to icon-only (52px)
- 6 categories from `DASHBOARD_NAV` with Lucide icons
- Active category expands to show subcategories indented below it
- Active category gets a colored left border accent
- Clicking a subcategory navigates to `/<category>/<sub>` (e.g., `/protect/warnings`)

### Function Tabs (horizontal bar above content)

- Four tabs: Do, Learn, Status, Insights
- Client-side state (not URL segments) — functions are reusable across all categories
- Active tab indicator uses the active category's accent color
- Icons per tab (matching wireframe): Do = Play, Learn = BookOpen, Status = CircleDot, Insights = BarChart

### Content Area

- Breadcrumb: Category / Subcategory / Function
- Title + description from existing `PAGE_CONFIG`
- Placeholder content: contextual suggestion cards from `PAGE_CONFIG`

## Routing

```
/<category>/<sub>   e.g., /protect/warnings, /launch/onboarding
```

- Categories and subcategories are URL segments (supports deep linking, back/forward)
- Function tabs are client-side state (default: "do")
- Dynamic catch-all route: `app/[category]/[sub]/page.tsx`

## What Gets Removed

- `ChatPanelLayout` — removed from root layout
- `ChatPanel` — removed from root layout
- `ChatPanelTrigger` — removed from root layout
- `ChatProvider` — removed from root layout
- `AppSidebar` (chat/app-sidebar.tsx) — replaced by new category sidebar
- `AppNavbar` (app-navbar.tsx) — replaced by function tabs
- `SidebarProvider` from `@ascenta/ui` — replaced by local sidebar state

## What Gets Created

- `components/nav-sidebar.tsx` — collapsible category sidebar with subcategory expansion
- `components/function-tabs.tsx` — horizontal Do/Learn/Status/Insights tab bar
- `components/breadcrumb-nav.tsx` — breadcrumb component
- `app/[category]/[sub]/page.tsx` — dynamic route rendering function tabs + placeholder content

## What Gets Modified

- `app/layout.tsx` — simplified: just sidebar + content slot, no chat providers
- `lib/constants/dashboard-nav.ts` — add `color` field to `NavCategory`, update `TabKey` to replace `"dashboard"` with `"insights"`, add tab metadata (icons, labels, content descriptions)

## Data Changes to `dashboard-nav.ts`

Add accent colors to each category:
- Launch: `#b68` (rose)
- Protect: `#68b` (blue)
- Attract: `#a86` (amber)
- Develop: `#4a9` (green)
- Transition: `#88a` (slate)
- Analyze: `#5a8` (teal)

Add function tab config:
```ts
export const FUNCTION_TABS = [
  { key: "do", label: "Do", icon: Play, title: "Action Center", desc: "Primary workspace for executing tasks" },
  { key: "learn", label: "Learn", icon: BookOpen, title: "Knowledge Base", desc: "Documentation, guides, and training" },
  { key: "status", label: "Status", icon: CircleDot, title: "Status Dashboard", desc: "Real-time monitoring and health checks" },
  { key: "insights", label: "Insights", icon: BarChart3, title: "Analytics & Insights", desc: "Data analysis and reporting" },
];
```

## Existing Pages

- `/dashboard`, `/tracker` — left in place but not wired into the new nav for now
- `/chat` — already redirects to `/`, can remain
- The root `/` page will need to be addressed separately (not in scope)
