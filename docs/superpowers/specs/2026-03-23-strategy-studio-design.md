# Strategy Studio — Design Spec

**Date:** 2026-03-23
**Location:** Plan > Strategy Studio (`/plan/strategy-studio`)

## Overview

Strategy Studio is a two-tab page under the Plan category that allows organizations to define their foundational identity (Mission, Vision & Values) and set strategic goals at multiple time horizons and scopes. It is form-first with inline AI assistance, with the option to use the Do page chat for deeper AI collaboration.

---

## Tab 1: Foundation (Mission, Vision & Values)

### Purpose

One-time setup of the company's mission, vision, and values. Editable for future changes/reorgs. Once published, viewable by all employees.

### Admin/HR View (Edit Mode)

- Three vertically stacked section cards: **Mission**, **Vision**, **Values**
- Each card contains:
  - A text area (supports a paragraph or two)
  - An **AI Assist** button that generates/refines content inline, using other filled sections as context
- A **"Use Do for deeper collaboration"** link that redirects to the Do page where the chat can help draft content
- A **Publish** action that locks the content and makes it visible to all employees
- After publishing, an **Edit** toggle switches back to the form view

### Employee View (Read-Only)

- Polished display cards showing Mission, Vision, and Values — presentation-style, no form fields
- Published date shown

### Data Model (High Level)

Single document per organization (global for now since no auth):

- `mission` — string
- `vision` — string
- `values` — string
- `status` — enum: `draft` | `published`
- `publishedAt` — Date (nullable)
- `createdAt`, `updatedAt` — timestamps

---

## Tab 2: Strategy (Company & Department Goals)

### Purpose

Define strategic goals at different time horizons (long/medium/short term), scoped to the whole company or specific departments.

### View Organization

Two primary views via a segmented control toggle:

1. **Company-wide** — Strategy goals that apply to the whole organization
2. **By Department** — Goals grouped by department

Within each view, goals are grouped by time horizon: Long-term at top, then Medium-term, then Short-term.

### Time Horizons

Fixed category labels with custom date ranges:

- **Long-term** (suggested: 3-5 years)
- **Medium-term** (suggested: 1-2 years)
- **Short-term** (suggested: this quarter / 6 months)

User picks the category and sets their own start/end dates.

### Goal Creation

- **"Create Strategy Goal"** button opens a form (similar to Grow goal creation)
- Fields:
  - Title
  - Description (with AI Assist button)
  - Time horizon (Long-term / Medium-term / Short-term picker)
  - Custom date range (start/end)
  - Scope (Company-wide / specific department)
  - Success metrics (with AI Assist button)
  - Status
- **"Use Do for deeper collaboration"** link for chat-driven creation

### Goal Display

- Expandable cards (similar to GoalCard in Grow)
- Each card shows: title, description snippet, date range, status indicator, horizon badge
- Expand to see full details, success metrics
- Edit/archive actions for admins

### Statuses & Lifecycle

Goals follow this lifecycle: created as `draft` → moved to `active` when ready → tracking statuses (`on_track` / `needs_attention` / `off_track`) are sub-states of active → `completed` when done → `archived` to remove from view.

Statuses: `draft` | `on_track` | `needs_attention` | `off_track` | `completed` | `archived`

(No separate `active` status — `on_track` is the default active state, matching Grow goals.)

### Delete Behavior

Strategy goals cannot be deleted, only archived. Archiving removes them from the default view but preserves the record.

### Data Model (High Level)

Separate schema from Grow goals:

- `title` — string
- `description` — string
- `horizon` — enum: `long_term` | `medium_term` | `short_term`
- `timePeriod` — { start: Date, end: Date }
- `scope` — enum: `company` | `department`
- `department` — string (nullable, set when scope is department; department list derived from existing Employee records)
- `successMetrics` — string
- `status` — enum (see above)
- `createdAt`, `updatedAt` — timestamps

---

## Architecture

### Navigation

Add custom tabs to the `plan/strategy-studio` page config in `dashboard-nav.ts`. These **replace** the default Do/Learn tabs entirely (same pattern as Grow/Performance):

```typescript
tabs: [
  { key: "foundation", label: "Foundation", icon: Compass },
  { key: "strategy", label: "Strategy", icon: Target },
]
```

Tab rendering follows the same pattern as Grow/Performance — add `"foundation"` and `"strategy"` cases to the tab-branching logic in `[category]/[sub]/page.tsx`.

### "Use Do" Link Behavior

The "Use Do for deeper collaboration" links navigate to `/do` (the global Do page). No context is passed — the user re-states their intent in the Do chat. This keeps the integration simple and avoids coupling between the two pages. Future iterations could pass query params to seed the chat with context.

### Components

| Component | Purpose |
|-----------|---------|
| `components/plan/foundation-panel.tsx` | MVV form/display with edit and read-only modes |
| `components/plan/strategy-panel.tsx` | Strategy goals list with company/department toggle |
| `components/plan/strategy-goal-card.tsx` | Expandable card for each strategy goal |
| `components/plan/strategy-goal-form.tsx` | Creation/edit form for strategy goals |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/plan/foundation` | GET | Fetch MVV document |
| `/api/plan/foundation` | POST | Create/update MVV document |
| `/api/plan/foundation` | PATCH | Update status (publish/unpublish) |
| `/api/plan/strategy-goals` | GET | List strategy goals (filterable by scope, horizon, department) |
| `/api/plan/strategy-goals` | POST | Create a strategy goal |
| `/api/plan/strategy-goals/[id]` | PATCH | Update a strategy goal |
| `/api/plan/ai-assist` | POST | Inline AI assist (takes context + section, returns suggestion) |

### AI Integration

- **AI Assist buttons** make calls to `/api/plan/ai-assist` with the current section context (e.g., existing mission text when assisting with vision)
- **Do page chat** gains awareness of strategy context so it can help draft MVV or strategy goals conversationally

---

## Out of Scope

- Version history for MVV publish/unpublish cycles (only current state tracked via `updatedAt`)
- Authentication / role-based access (no auth layer exists yet)
- Linking strategy goals to individual Grow goals (future feature)
- AI Translation layer (exists as mockup, not part of this build)
- Workflow engine integration (strategy goals are direct CRUD, not workflow-driven)
