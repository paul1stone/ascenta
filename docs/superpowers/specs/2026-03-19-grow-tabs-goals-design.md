# Grow Tab Restructure + Goals View

**Date:** 2026-03-19
**Section:** Grow / Performance System
**Status:** Draft

## Problem

The current Grow/Performance page uses generic Do/Learn tabs shared across all sections. The Do tab is a chat-only interface — there's no way for an employee to see their goals, check-ins, or performance data at a glance. The chat (Do) is also locked to per-page tool sets, limiting its utility.

## Solution

Three changes:

1. Extract Do into a top-level nav item with its own dedicated page
2. Replace Do/Learn tabs on Grow/Performance with domain-specific tabs: Goals, Performance Reviews, Check-ins, Reflect
3. Build the Goals tab showing the current user's active goals as accordion cards

## Scope

- Grow/Performance page only. Other Grow sub-pages (Coaching, Learning, Leadership Library) keep Do/Learn tabs unchanged.
- Goals tab is fully built. Performance Reviews, Check-ins, and Reflect render placeholder states.
- Mock user: query existing Jason Lee employee from seeded data.

---

## 1. Do as Top-Level Nav Item

**Route:** `/do`

**Navigation placement:** Between Home and Plan in the sidebar. Top-level category (like Home), not a section with sub-pages.

**Accent color:** Summit Orange (`#ff6b35`) — the AI assistant identity color, not tied to any section.

**Page content:** Full-width reuse of the existing `DoTabChat` component.

**Tool access:** All AI tools available — not scoped to any page's `toolsForPage` config. The system prompt does not inject a `[REQUIRED_TOOL]` constraint.

**Chat context:** `/do` gets its own conversation state key in `ChatContext`, separate from per-section conversations. The `pageKey` is `"do"`.

**Sidebar entry in `dashboard-nav.ts`:** New top-level nav item, not part of the `CATEGORIES` array. Similar to how Home is handled.

---

## 2. Tab System Refactor

### Current state

```typescript
export type TabKey = "do" | "learn";
export const FUNCTION_TABS: FunctionTab[] = [
  { key: "do", label: "Do", ... },
  { key: "learn", label: "Learn", ... },
];
```

All pages use the same two tabs. The `[category]/[sub]/page.tsx` renders `DoTabChat` for Do, `LearnPanel` for Learn.

### New state

Replace the global `FUNCTION_TABS` with per-page tab configs defined in `dashboard-nav.ts`:

```typescript
// Each page config gets an optional `tabs` array
tabs?: PageTab[];

interface PageTab {
  key: string;
  label: string;
  icon: LucideIcon;
}
```

**Grow/Performance tabs:**

| Key | Label | Icon | Renders |
|-----|-------|------|---------|
| `goals` | Goals | Target | `GoalsPanel` (new) |
| `reviews` | Performance Reviews | ClipboardCheck | Placeholder |
| `checkins` | Check-ins | MessageCircle | Placeholder |
| `reflect` | Reflect | Brain | Placeholder |

**Other pages:** If no `tabs` array is defined on a page config, fall back to the default Do/Learn tabs. This preserves existing behavior for all other sections.

**`FunctionTabs` component:** Updated to accept any tab config array instead of importing the hardcoded `FUNCTION_TABS`. The active tab key becomes a generic string rather than `TabKey`.

**`[category]/[sub]/page.tsx`:** Tab rendering logic branches on the tab key. For known keys like `"goals"`, render the corresponding component. For unknown keys or placeholders, render a coming-soon state.

---

## 3. Goals Tab

### Layout

Full-width content area (no chat split). Stacked goal cards with accordion expand/collapse.

### Header

- Title: "My Goals"
- Subtitle: count of active goals (e.g., "3 active goals")
- No action buttons in header for now (goal creation happens via Do chat)

### Goal Card — Collapsed State

Horizontal row containing:
- **Status dot** — colored circle: green (on-track), yellow (needs-attention), red (off-track)
- **Title** — goal title, semibold
- **Category tag** — pill badge (Performance / Leadership / Development) with category-specific color
- **Time period** — muted text (Q1 2026, H1 2026, Annual 2026, etc.)
- **Chevron** — right-aligned, rotates on expand

### Goal Card — Expanded State

Below the header row, an accordion body reveals:
- **Description** — full goal description text
- **Success metric** — labeled field showing the metric + measurement type
- **Check-in cadence** — Monthly / Quarterly / Milestone / Manager Scheduled
- **Alignment** — Mission / Value / Priority tag
- **Last check-in** — date of most recent check-in (if any), or "No check-ins yet"

### Data Source

**API route:** `/api/grow/goals?employeeId=<id>` — new GET endpoint (or extend existing `/api/grow/status`).

**Query:** `Goal.find({ owner: employeeId, status: { $ne: 'completed' } }).sort({ createdAt: -1 })`

**Mock user:** Query the Employee collection for a record matching "Jason Lee" (from `pnpm db:seed`). Hardcode the employee ID lookup at the component level for now — no auth system exists yet.

### Component Structure

```
components/grow/
  goals-panel.tsx          — Main Goals tab container
  goal-card.tsx            — Individual accordion card
```

`GoalsPanel` fetches goals via SWR or useEffect, renders a list of `GoalCard` components.

`GoalCard` manages its own open/closed state. Uses shadcn `Collapsible` or a simple state toggle with CSS transition.

---

## 4. Placeholder Tabs

Performance Reviews, Check-ins, and Reflect tabs render a centered empty state:
- Icon (muted)
- "Coming soon" heading
- One-line description of what will go here

Same pattern as the current Learn tab placeholder on non-performance pages.

---

## Non-Goals

- No auth system or user context provider. Mock user is a direct DB query.
- No goal CRUD from the Goals tab itself. Creation/editing happens via the Do chat.
- No changes to other Grow sub-pages (Coaching, Learning, Leadership Library).
- No changes to the working document or form system.
- No changes to the chat/AI tools layer.
