# Do Chat Page Redesign: Prompt Pills & Empty State

**Date**: 2026-03-15
**Status**: Draft

## Overview

Redesign the do-tab chat empty state to center the chat input (inspired by Claude's chat UI) and replace the current suggestion tiles with tool-grouped prompt pill menus below the input. Assistant messages in active chat become flat (no card styling).

## Empty State Layout

The current layout (title, description, 4 suggestion tiles above, chat input at bottom) is replaced with a vertically centered layout:

1. **Page title** — small, muted subheading text (e.g., "Performance System")
2. **Greeting** — larger, bolder text: "Good morning/afternoon/evening, {{name}}" based on time of day
3. **Chat card** — the existing chat input card (textarea, model selector, tool selector), centered
4. **Tool pills** — horizontal row of pill buttons below the card, one per tool defined on the page

Pages without tools show no pills and no greeting — just the chat card with the page title above it. The old `PageConfig.suggestions` array and tile rendering are removed entirely (dead code cleanup).

## Tool Pills & Popovers

Each pill displays the tool's icon and label (e.g., "Create Goal", "Run Check-in", "Add Note"). Clicking a pill opens a shadcn Popover (existing `packages/ui` Radix-based component) containing 3-4 suggested prompts for that tool. Only one popover open at a time; clicking outside dismisses.

Prompts are dynamic — employee names and context are filled from a mock user object (hardcoded manager with direct reports, ready to swap for real auth later).

**On prompt selection — callback contract:**

```typescript
onPromptSelect: (prompt: string, toolKey: string) => void
```

This callback is passed from `DoTabChat` to `SuggestPromptPills`. It calls `setPageInput(pageKey, prompt)` to fill the textarea and `setSelectedTool(toolKey)` to pre-select the tool. The popover dismisses after selection.

**Pill styling:** Border with accent color tint, tool icon colored, horizontally centered, wrapping if needed.

## Data Model

### ToolSuggestion (new)

```typescript
interface ToolSuggestion {
  label: string;
  promptTemplate: string;  // e.g., "Create a goal for {{directReport}} based on job description"
}
```

Template tokens (e.g., `{{directReport}}`, `{{userName}}`) are resolved at render time by a simple `resolvePrompt(template, user)` utility function. This avoids functions in constants (keeps data serializable) and works across server/client boundaries.

Added as a `promptSuggestions` array on the existing `PageTool` interface in `dashboard-nav.ts`. Named `promptSuggestions` to avoid collision with the existing `PageConfig.suggestions` field (which is being removed).

### MockUser (new)

```typescript
interface MockUser {
  name: string;
  role: "manager" | "employee";
  directReports: { name: string; jobTitle: string }[];
}
```

Lives in `lib/constants/mock-user.ts`. Hardcoded to a manager from the employee seed data (use an actual seeded manager so names match the database). Single source of truth — easy to replace with auth context later.

### Greeting logic

Extracted as a `getGreeting(name: string): string` utility (not inline in the component):
- Before 12:00 → "Good morning, {{name}}"
- 12:00–17:00 → "Good afternoon, {{name}}"
- After 17:00 → "Good evening, {{name}}"

## Active Chat State

Once messages exist, the empty state (greeting, pills) disappears and the active chat layout renders as before, with one change to message styling:

- **User messages**: retain card styling — `rounded-2xl border px-4 py-4`, background, dynamic border color
- **Assistant messages**: flat — remove the outer card wrapper (`rounded-2xl border bg-white/80`), but keep the avatar, label, flex layout with `gap-3`, and all content rendering (markdown, workflow blocks, streaming badge)

**Implementation:** Add a `variant?: "card" | "flat"` prop to `ChatMessage`. `DoTabChat` passes `variant="card"` for user messages and `variant="flat"` for assistant messages. The variant only controls the outer wrapper div styling.

No changes to: chat input, working document side panel, tool selector, model selector, message parsing, or workflow blocks. Transition from empty to active state is instant (no animation).

## Scope

### In scope
- New empty state layout for `do-tab-chat.tsx`
- `SuggestPromptPills` component with shadcn Popover per tool
- `ToolSuggestion` type and `promptSuggestions` added to `PageTool`
- `resolvePrompt()` template resolver utility
- Suggested prompts defined for `grow/performance` tools (Create Goal, Run Check-in, Add Note)
- `MockUser` constant file with seeded manager data
- `getGreeting()` utility
- Flat assistant message styling via `variant` prop on `ChatMessage`
- Remove old suggestion tiles and `PageConfig.suggestions` field

### Out of scope
- Auth/login system
- Tool definitions for pages that don't have them yet
- Changes to the chat API or AI behavior
- Changes to learn tab or other tabs

## Files to Modify

- `apps/platform/src/components/do-tab-chat.tsx` — new empty state layout, pass variant to ChatMessage
- `apps/platform/src/components/chat/chat-message.tsx` — add `variant` prop, conditional card vs flat styling
- `apps/platform/src/lib/constants/dashboard-nav.ts` — `ToolSuggestion` type, `promptSuggestions` on `PageTool`, remove `PageConfig.suggestions`

## Files to Create

- `apps/platform/src/components/chat/suggest-prompt-pills.tsx` — pill buttons with shadcn Popovers
- `apps/platform/src/lib/constants/mock-user.ts` — mock user data
- `apps/platform/src/lib/utils/greeting.ts` — `getGreeting()` utility
- `apps/platform/src/lib/utils/resolve-prompt.ts` — template token resolver
