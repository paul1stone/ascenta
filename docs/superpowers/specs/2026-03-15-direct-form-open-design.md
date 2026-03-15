# Direct Form Open & Tool Selector Removal

**Date**: 2026-03-15
**Status**: Draft
**Depends on**: `2026-03-15-do-chat-prompt-pills-design.md` (implemented on `feat/do-chat-prompt-pills`)

## Overview

Add a "Open form directly" action inside each tool's prompt pill popover to bypass AI and open a blank working document form with an employee picker. Remove the tool selector UI from the chat input bar. Delete the dead `tool-selector.tsx` file.

## Popover Direct Action

Each tool's popover (in `SuggestPromptPills`) gains a separator and a direct action button below the suggested prompts:

```
┌──────────────────────────────────────────┐
│  Create a goal for Sarah Chen based on   │
│  their job description                   │
├──────────────────────────────────────────┤
│  Create a development goal for Sarah...  │
├──────────────────────────────────────────┤
│  Set up Q2 performance goals for...      │
├──────────────────────────────────────────┤
│  ─────────────────────────────────────   │
│  ✏️ Open form directly                   │
└──────────────────────────────────────────┘
```

**Styling**: Muted text, smaller font than prompt items, `SquarePen` icon from Lucide. Visually distinct from the AI-assisted prompts above.

**On click**: Calls a new `onDirectOpen` callback with the tool key. The parent component maps the tool key to a workflow type and calls `openWorkingDocument()` with empty fields.

```typescript
onDirectOpen: (toolKey: string) => void
```

**Popover dismissal**: Use controlled `open` state on the Popover so both clicking "Open form directly" and clicking a prompt suggestion explicitly close it.

**Tool key to workflow type mapping**:
- `startGoalCreation` → `"create-goal"`
- `startCheckIn` → `"run-check-in"`
- `startPerformanceNote` → `"add-performance-note"`

This mapping lives as a simple `Record<string, WorkflowType>` constant in `do-tab-chat.tsx` (or a small utility if reused).

**openWorkingDocument call**: `openWorkingDocument(workflowType, null, null, null, {})` — null runId, employeeId, employeeName, and empty fields. Uses `null` to match the existing `WorkingDocumentState` initial values. The form opens completely blank for manual entry.

## Employee Picker on Direct-Open Forms

When a form is opened directly (no AI-provided employee — `employeeId` is null), an employee search/picker dropdown renders at the top of the form, replacing the read-only employee banner.

When AI opens the form (employee provided — `employeeId` is set), the picker is hidden and the existing read-only banner shows as before.

**Search endpoint**: The picker searches against the existing `GET /api/dashboard/employees` endpoint (supports `?search=` query param).

**On selection**: Sets `employeeId` and `employeeName` on the working document state via `updateWorkingDocumentFields()`.

**Implementation**: A new `EmployeePicker` component in `components/grow/forms/`. Used by `GoalCreationForm`, `CheckInForm`, and `PerformanceNoteForm` — each form conditionally renders either the picker or the read-only banner based on whether `employeeId` is present.

## Workflow Run Creation at Submit Time

Currently, `submitWorkingDocument` in `chat-context.tsx` throws if `runId` is empty. For direct-open forms, no workflow run exists yet.

**Change**: Update the Grow API routes (`/api/grow/goals`, `/api/grow/check-ins`, `/api/grow/performance-notes`) to handle submissions without a `runId`. When `runId` is missing or empty in the request body:
1. Generate a `runId` via `nanoid()`
2. Create a workflow run record server-side (via the existing workflow engine's `registerWorkflow`/`syncWorkflowToDatabase` pattern)
3. Proceed with the normal creation flow

Update `submitWorkingDocument` in `chat-context.tsx` to allow submission when `runId` is null — it sends the form data to the API without a `runId`, and the API handles run creation.

This preserves the audit trail for all form submissions, whether AI-initiated or direct.

## Remove Tool Selector UI

The `ToolSelector` component is removed from the `ChatInput` bottom bar. The `tool-selector.tsx` file is deleted (dead code).

**Props removed from `ChatInput`**: `tools`, `selectedTool`, `onToolChange`.

**Internal state preserved in `DoTabChat`**: The `selectedTool` state remains as an internal mechanism (not exposed in UI). When a user clicks a suggested prompt from a pill popover, `handlePromptSelect` still sets `selectedTool` so the AI knows which tool to call. `handleSend` consumes and clears it. The `ToolSelector` import and the separator (`|`) before it are removed from `ChatInput`.

**`activeToolForStream` state**: Unchanged — still used for the streaming badge on assistant messages.

## Empty State Transition

Currently the empty state renders when `!hasMessages`. With direct form open, the working document panel can be open with no messages.

**Change**: The empty state condition becomes `if (!hasMessages && !workingDocument.isOpen)`. When the working document is open with no messages, the active chat layout renders — chat input at bottom, empty message area, working document side panel. No greeting or pills in the chat half. The user can fill the form manually or type in the chat to ask AI for help.

## Scope

### In scope
- Direct action button in each tool's popover with controlled open state
- `onDirectOpen` callback on `SuggestPromptPills`
- Tool key → workflow type mapping
- `EmployeePicker` component for direct-open forms
- Update `submitWorkingDocument` to handle empty `runId` (generate + create run at submit time)
- Remove `ToolSelector` from `ChatInput` UI and its props
- Delete `tool-selector.tsx` file
- Update empty state condition to account for open working document

### Out of scope
- Auth/login system
- Changes to form field validation logic

## Files to Modify

- `apps/platform/src/components/chat/suggest-prompt-pills.tsx` — add separator + direct action button, `onDirectOpen` prop, controlled popover state
- `apps/platform/src/components/chat/chat-input.tsx` — remove `ToolSelector`, remove `tools`/`selectedTool`/`onToolChange` props
- `apps/platform/src/components/do-tab-chat.tsx` — add `handleDirectOpen` callback, update empty state condition, stop passing tool props to `ChatInput`
- `apps/platform/src/lib/chat/chat-context.tsx` — update `submitWorkingDocument` to handle empty `runId`
- `apps/platform/src/components/grow/forms/goal-creation-form.tsx` — conditionally render `EmployeePicker` or read-only banner
- `apps/platform/src/components/grow/forms/check-in-form.tsx` — same
- `apps/platform/src/components/grow/forms/performance-note-form.tsx` — same
- `apps/platform/src/app/api/grow/goals/route.ts` — handle missing `runId` by creating workflow run
- `apps/platform/src/app/api/grow/check-ins/route.ts` — same
- `apps/platform/src/app/api/grow/performance-notes/route.ts` — same

## Files to Create

- `apps/platform/src/components/grow/forms/employee-picker.tsx` — employee search/picker dropdown

## Files to Delete

- `apps/platform/src/components/chat/tool-selector.tsx` — dead code after removal from `ChatInput`
