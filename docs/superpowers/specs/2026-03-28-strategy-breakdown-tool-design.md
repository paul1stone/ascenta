# Strategy Breakdown Tool — Design Spec

**Date:** 2026-03-28
**Status:** Draft

## Overview

A Compass AI tool that breaks down company and department strategy for the current user, tailored to their role and department. The tool is conversational — the AI explains strategy, the user asks questions, and optionally generates a downloadable strategy brief document.

## User Flow

1. **Trigger** — User selects "Strategy Breakdown" in the Compass tool selector, or asks naturally (e.g., "break down our strategy for me").
2. **Data fetch** — AI calls `getStrategyBreakdown` tool, which pulls company strategy goals, department goals, foundation (MVV), and user context.
3. **Conversational breakdown** — AI explains strategy tailored to role:
   - **IC:** Company priorities, department focus, how their work connects.
   - **Manager:** Company strategy, department goals, how their team's work maps to these.
4. **Follow-up questions** — Open-ended conversation. User digs into specific goals, asks about priorities, clarifies connections.
5. **Document offer** — AI offers to generate a strategy brief: "Want me to put this together as a strategy brief you can download?"
6. **Brief generation** — AI calls `generateStrategyBrief`, which opens a read-only document in the working document panel (50/50 split with chat).
7. **Download** — User clicks download button (triggers `window.print()` with print stylesheet for PDF). User can also ask AI to revise sections before downloading.

## AI Tools

### `getStrategyBreakdown`

Fetches all strategy context for the AI to work with. Single tool call, returns structured data.

**Parameters:**
- `employeeId` (string) — The current user's employee ID
- `includePersonalGoals` (boolean, optional, default false) — Whether to also fetch the user's personal goals from Grow

**Data fetched:**
- `Foundation` — Published mission, vision, values (from `foundation-schema`)
- `StrategyGoal` where `scope: "company"` — All company-wide strategy goals
- `StrategyGoal` where `scope: "department"` and `department` matches user's department — Department goals
- `Employee` — User's name, role, department
- (If `includePersonalGoals`) `Goal` where `owner` matches user — Personal goals from Grow

**Returns:** Structured object with all data above, plus role context (isManager boolean based on whether the employee has direct reports).

### `generateStrategyBrief`

Generates the strategy brief document and opens it in the working document panel.

**Parameters:**
- `employeeName` (string) — For the document header
- `department` (string) — For the document header
- `sections` (object):
  - `companySummary` (string) — AI-written summary of company mission/vision
  - `companyGoals` (array) — Company strategy goals with `{ title, description, horizon, status }`
  - `departmentGoals` (array) — Department strategy goals with same shape
  - `relevance` (string) — AI-written "What This Means For You" narrative

**Returns:** `[ASCENTA_WORKING_DOC]` block with:
- `action: "open_working_document"` (reuses existing action — chat context routes by `workflowType`)
- `workflowType: "strategy-breakdown"`
- `sections` payload (structured data for frontend rendering, replaces `prefilled` used by form-based workflows)

**Note on user identity:** The platform currently has no auth layer. The AI tool receives the employee context the same way existing tools do — either the user mentions an employee by name and the AI calls `getEmployeeInfo` first, or (for self-service use) a default/demo user context is available. The tool does not require a logged-in user identity beyond what the existing system provides.

## Strategy Brief Panel

A new read-only document panel in the working document system. Introduces a reusable pattern for document preview (distinct from the existing form pattern).

### Panel Structure

- **Top bar:** Document title ("Strategy Brief"), employee name, department, date, download button
- **Body (scrollable):**
  - **Company Strategy** — Mission/vision one-liner, then company goals grouped by horizon (long-term, medium-term, short-term) with status indicators
  - **Department Strategy** — Department goals grouped by horizon with status indicators
  - **What This Means For You** — AI-generated narrative contextualizing strategy to the user's role

### Rendering

- Frontend renders from structured `sections` data — not raw HTML from the AI
- Reuses existing design tokens: horizon color coding from `StrategyGoalCard`, status indicators
- No form fields, no submit button — purely presentational
- Accent color: `#6688bb` (Plan category color)

### Download

- Download button triggers `window.print()` scoped to the panel content
- `@media print` stylesheet ensures clean PDF output (hides chrome, proper margins, page breaks)
- No external dependencies needed

### Revision Flow

- User can ask AI to revise sections via chat (e.g., "add more detail about Q2 goals")
- AI calls `generateStrategyBrief` again with updated sections
- Panel re-renders with new content (same `open_working_document` action with updated sections replaces previous content)

## Trigger: Strategy Studio CTA

The tool is triggered from a CTA button on the Strategy Studio strategy panel (not from the Compass tool selector). The CTA links to `/do?prompt=Break%20down%20our%20company%20strategy%20for%20me&tool=getStrategyBreakdown`, which navigates to Compass with the prompt pre-filled and auto-sent with the required tool.

The CTA is visible to all roles (not gated by canCreate) since every user should be able to understand strategy alignment. It sits alongside the existing "Build Strategy with Compass" CTA in `strategy-panel.tsx`.

### System Prompt

When `getStrategyBreakdown` is the required tool, the AI receives instructions to:
- Call `getStrategyBreakdown` first to fetch real data (never make up strategy goals)
- Tailor explanation to role — IC gets personal relevance, manager gets team-level view
- Explain conversationally, not as a data dump — make strategy tangible
- After explaining, offer to generate the strategy brief — do not auto-generate
- If user requests revisions to the brief, call `generateStrategyBrief` again

## Files Changed

### New Files
- `apps/platform/src/lib/ai/strategy-tools.ts` — `getStrategyBreakdown` and `generateStrategyBrief` tool definitions
- `apps/platform/src/components/strategy/strategy-brief-panel.tsx` — Read-only document panel component

### Modified Files
- `apps/platform/src/lib/constants/dashboard-nav.ts` — Add tool to `PAGE_CONFIG["do"].tools`
- `apps/platform/src/lib/ai/prompts.ts` — Add strategy breakdown instructions to system prompt
- `apps/platform/src/app/api/chat/route.ts` — Register strategy tools
- `apps/platform/src/lib/chat/chat-context.tsx` — Add `"strategy-breakdown"` to `WorkflowType`, handle `open_strategy_document` action
- `apps/platform/src/components/grow/working-document.tsx` — Route `strategy-breakdown` type to `StrategyBriefPanel`

### No New Schemas
- Reads from existing `StrategyGoal`, `Foundation`, `Employee`, and optionally `Goal` collections
- Brief is generated on-the-fly, not persisted to database
