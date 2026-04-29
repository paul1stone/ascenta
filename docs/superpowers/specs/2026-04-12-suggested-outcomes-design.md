# Suggested Outcomes on Goals Tab

**Date:** 2026-04-12
**Status:** Approved

## Problem

The translations system generates role-specific outcomes tied to strategy goals (`roles.contributions.outcomes`), but these are only surfaced deep in the Plan section. Employees on the Goals tab have no visibility into what outcomes their role is expected to deliver — they have to go through the full 4-step Compass conversation to discover them.

## Solution

Add a "Suggested Outcomes" section below the goals table on the Goals tab. Each outcome links to its parent strategy goal and contribution. Clicking "Create with Compass" on any outcome navigates to the `/do` page and starts goal creation with that outcome pre-loaded, skipping Steps 1-3 of the conversation and going straight to key results refinement.

## Data Source

Outcomes come from the published `StrategyTranslation` for the employee's department, matched by job title (exact match, then level-based fallback). The existing `getTranslationForEmployee()` helper in `apps/platform/src/lib/ai/translation-lookup.ts` handles this lookup.

Each contribution has 1-4 outcomes. A role typically has 3-4 contributions, yielding up to ~16 outcomes total.

## API

### `GET /api/grow/suggested-outcomes?employeeId={id}`

New endpoint. Looks up the employee's department and job title, calls `getTranslationForEmployee()`, and returns a flat list of outcomes with their contribution context.

**Response:**

```ts
{
  outcomes: {
    text: string;              // the outcome string
    strategyGoalId: string;    // ObjectId of linked strategy goal
    strategyGoalTitle: string; // display title
    roleContribution: string;  // parent contribution statement
  }[]
}
```

Returns `{ outcomes: [] }` if no published translation exists or the employee's role isn't found. This is not an error — the frontend uses it to decide whether to render the section.

**Auth:** None (consistent with existing API routes).

## UI: Goals Panel

### Placement

Below the goal tables (after the last status group — completed), before the `PerformanceGoalForm` modal. Not rendered when `outcomes` is empty.

### Layout

- **Section label:** "Suggested Outcomes" — same `text-xs font-semibold uppercase tracking-wider text-muted-foreground` style as the "Draft"/"Active"/"Completed" group headers.
- **Outcome cards:** Compact rows. Each shows:
  - The outcome text (primary)
  - Strategy goal title (secondary, muted)
  - "Create with Compass" action link with Compass icon, styled subtly (text link, not a button)
- **Show 3 initially.** If more than 3 outcomes exist, show a "Show more" text link after the 3rd. Clicking it expands to show all outcomes for that role. No collapse back needed.
- **Hidden entirely** when the API returns an empty outcomes array.

### Navigation

Each "Create with Compass" link navigates to:

```
/do?prompt={encoded}&tool=startGoalWorkflow&outcomeText={encoded}&strategyGoalId={id}&strategyGoalTitle={encoded}&contributionRef={encoded}
```

The `prompt` param is a natural sentence like: `Create a goal based on this outcome: "{outcomeText}"`

## Chat Fast-Path

### `/do` page changes

Read the additional query params (`outcomeText`, `strategyGoalId`, `strategyGoalTitle`, `contributionRef`). If `outcomeText` is present, package them into an `outcomeContext` object and pass to `sendMessage()`.

### `sendMessage` changes

Add an optional `outcomeContext` parameter:

```ts
outcomeContext?: {
  outcomeText: string;
  strategyGoalId: string;
  strategyGoalTitle: string;
  contributionRef: string;
}
```

When present, include it in the POST body to `/api/chat`.

### `/api/chat` route changes

When `outcomeContext` is present in the request body, inject it into the system prompt:

```
[OUTCOME_CONTEXT] The user has pre-selected an outcome from their role translation:
- Outcome: "{outcomeText}"
- Strategy Goal: "{strategyGoalTitle}" (ID: {strategyGoalId})
- Role Contribution: "{contributionRef}"
Skip Steps 1-3. Default goalType to "performance" (strategy-linked outcomes are role delivery). Use this outcome as the basis for the objective statement. Go directly to Step 4: suggest 1-3 key results for this outcome, discuss time period and support, then call openGoalDocument with strategyGoalId, strategyGoalTitle, and contributionRef pre-filled. [/OUTCOME_CONTEXT]
```

### `startGoalWorkflowTool` description update

Add to the existing tool description:

> **Fast-path:** If the system prompt contains `[OUTCOME_CONTEXT]`, skip Steps 1-3 entirely. The strategic pillar and objective are already determined. Default goalType to "performance". Use the outcome text to draft the objective statement and proceed directly to Step 4 (key results, time period, support agreement). Ensure `strategyGoalId`, `strategyGoalTitle`, and `contributionRef` from the context are passed through to `openGoalDocument`.

No changes to the tool's `inputSchema` or `execute` function — the fast-path is purely prompt-driven.

## Files Changed

| File | Change |
|------|--------|
| `apps/platform/src/app/api/grow/suggested-outcomes/route.ts` | **New.** GET endpoint: employee lookup, translation fetch, flatten outcomes |
| `apps/platform/src/components/grow/goals-panel.tsx` | Add suggested outcomes section with fetch, 3-item limit + "Show more" |
| `apps/platform/src/app/do/page.tsx` | Read outcomeText/strategyGoalId/strategyGoalTitle/contributionRef params, pass to sendMessage |
| `apps/platform/src/lib/chat/chat-context.tsx` | Extend `sendMessage` signature with optional `outcomeContext`, include in POST body |
| `apps/platform/src/app/api/chat/route.ts` | Read `outcomeContext` from body, inject `[OUTCOME_CONTEXT]` block into system prompt |
| `apps/platform/src/lib/ai/grow-tools.ts` | Add fast-path instructions to `startGoalWorkflowTool` description |

## What This Does Not Do

- No filtering of outcomes already covered by existing goals — all outcomes shown regardless
- No reordering or prioritization — outcomes appear in translation order
- No empty state UI — section simply not rendered when no outcomes
- No new AI tool — reuses `startGoalWorkflowTool` with prompt-level fast-path
- No changes to the goal schema, form, or submission flow
