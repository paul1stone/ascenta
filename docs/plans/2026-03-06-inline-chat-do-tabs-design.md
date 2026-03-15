# Inline Chat on "Do" Tabs

**Date:** 2026-03-06
**Status:** Approved

## Summary

Bring chat functionality back into the platform by making each sub-page's "Do" tab an inline conversational interface. Workflow cards serve as quick-start launchers; once a conversation begins, cards disappear and the chat fills the content area. Each sub-page maintains its own conversation thread.

## Layout

### Empty State (no active conversation)

- Page title + description at top
- 2x2 grid of workflow cards (from `PAGE_CONFIG` suggestions)
- Each card is clickable — sends its prompt to the chat API and transitions to active state

### Active State (conversation in progress)

- Cards disappear
- Chat messages fill the content area (scrollable)
- Chat input pinned at the bottom of the content area
- "New conversation" button in header/top area to reset back to empty state

## Data Flow

- Each sub-page key (e.g. `grow/coaching`) maps to its own conversation
- Conversation ID stored per page in chat context (`Map<string, string>` instead of single `conversationId`)
- Navigating away and back restores the conversation (messages loaded from API)
- "New conversation" clears the current page's thread and shows cards again

## What Changes

1. **`layout.tsx`** — Wrap with `ChatProvider` (needed for state management)
2. **`chat-context.tsx`** — Refactor from single-conversation to per-page conversations. Add `pageKey` awareness, `resetConversation(pageKey)` method
3. **`[category]/[sub]/page.tsx`** — "Do" tab renders either cards (empty) or inline chat (active). Real clickable cards that trigger chat
4. **Slide-over panel not rendered** — `ChatPanel`, `ChatPanelTrigger` not wired up (kept for potential future use)
5. **New component: `DoTabChat`** — Combines empty/active states, card grid, inline messages, and input. Reuses `ChatMessage` and `ChatInput`

## What Doesn't Change

- Chat API route (`/api/chat`) — works as-is
- `ChatMessage`, `ChatInput`, `workflow-blocks` components — reused inline
- `PAGE_CONFIG` suggestions — already defined per page
- "Learn", "Status", "Insights" tabs — untouched
