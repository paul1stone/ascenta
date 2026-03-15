# Working Document Pattern for Grow Workflows

**Date**: 2026-03-07
**Status**: Approved
**Branch**: feat/grow-performance-system

## Problem

The current workflow interaction model collects fields one-at-a-time inline in chat via `[ASCENTA_FIELD_PROMPT]` blocks. This is clunky: it re-asks similar questions, the user can't see overall progress, and there's no way to take over and fill fields directly. The AI drives a sequential loop through `updateWorkflowFieldTool` which feels slow and uncontrolled.

## Solution

Replace inline form fields with a **working document panel** that opens alongside chat when a Grow workflow is invoked. The AI analyzes the user's initial prompt, asks 0-3 clarifying questions only for what's truly missing, then opens a pre-filled form. The user can edit the form directly or ask the chat to make changes. Submission is a standard form submit with validation.

## Scope

- **In scope**: Grow workflows (goal creation, check-ins, performance notes)
- **Out of scope for now**: Corrective action workflows (written warning, PIP, investigation summary) — these keep the current inline pattern with TODO comments for future migration

## Layout

```
+----------+-------------------------+--------------------------+
|  Sidebar  |       Chat (left)       |  Working Document (right) |
|          |                         |                          |
|  Grow    |  conversation messages  |  Goal Creation Form      |
|  Perf... |  no inline form blocks  |  - Title: [pre-filled]   |
|  Coach.. |                         |  - Description: [...]    |
|          |  "Change time period    |  - Category: [dropdown]  |
|          |   to Q3" -> updates form|  - Success Metric: [...] |
|          |                         |  - Time Period: [Q2 v]   |
|          |                         |                          |
|          |  [chat input]           |  [Validate] [Submit]     |
+----------+-------------------------+--------------------------+
```

- Chat takes ~50% of main content area, working document takes ~50%
- Working document slides in when workflow is ready to show the form
- Working document closes on submit or cancel
- When no workflow is active, chat takes full width (current behavior)

## AI Interaction Flow

```
User prompt: "Create a goal for Ashley to improve response times by 20% this quarter"
                |
                v
   AI analyzes prompt, extracts:
   - employee: Ashley Garcia
   - title: "Improve response times"
   - successMetric: "20% improvement"
   - timePeriod: "quarter"
                |
                v
   AI determines: enough context, no clarifying questions needed
                |
                v
   AI tool call returns: { action: "open_working_document", workflowType: "create-goal",
                           prefilled: { title, description, successMetric, timePeriod, ... } }
                |
                v
   Frontend opens WorkingDocument with pre-filled form
                |
        +-------+-------+
        v               v
   User edits      Chat says "change
   form directly    metric to 25%"
        |               |
        +-------+-------+
                v
         Form state updated (single source of truth)
                |
                v
         User clicks Submit -> validation -> API call -> save Goal
```

### Clarifying Questions Logic

The AI evaluates the initial prompt against the workflow's required intake fields:
- If all required fields can be inferred: skip questions, open form immediately
- If some fields are ambiguous or missing: ask 1-3 targeted questions in regular chat (no special blocks)
- Questions are contextual to what's missing, not a fixed script
- After questions are answered, open the form with everything pre-filled

## New Components

### `WorkingDocument` (container)
- Right panel container that renders the appropriate form based on workflow type
- Receives initial values from chat context
- Exposes field update API for chat-driven edits
- Handles open/close transitions
- Location: `apps/platform/src/components/grow/working-document.tsx`

### `GoalCreationForm` / `CheckInForm` / `PerformanceNoteForm`
- Workflow-specific forms using React Hook Form + Zod validation
- All intake fields from the workflow definition rendered as proper form fields
- Pre-filled with AI-inferred values
- Submit calls a direct API route
- Location: `apps/platform/src/components/grow/forms/`

## Data Flow

### Chat Context Changes
- Add `workingDocument` state to chat context: `{ isOpen, workflowType, runId, fields }`
- Add `openWorkingDocument(type, runId, prefilled)` method
- Add `updateWorkingDocumentField(fieldKey, value)` method (called by chat or form)
- Add `closeWorkingDocument()` method

### New Tool: `openWorkingDocumentTool`
Replaces the field-by-field loop for Grow workflows. Returns all pre-filled values at once:
```typescript
{
  action: "open_working_document",
  workflowType: "create-goal" | "run-check-in" | "add-performance-note",
  runId: string,
  prefilled: Record<string, unknown>,
  employeeId: string,
  employeeName: string
}
```

### New Tool: `updateWorkingDocumentTool`
AI calls this when user asks to change a field via chat:
```typescript
{
  runId: string,
  updates: Record<string, unknown> // { fieldKey: newValue, ... }
}
```

### New Response Delimiter
Replace `[ASCENTA_FIELD_PROMPT]` with `[ASCENTA_WORKING_DOC]...[/ASCENTA_WORKING_DOC]` for Grow workflows. Frontend parses this to trigger the working document panel.

## Validation & Submission

- Zod schema per workflow type (mirrors intake field definitions)
- Client-side validation on blur + on submit
- Submit button disabled until required fields pass validation
- On submit: POST to `/api/grow/goals` (or `/check-ins`, `/performance-notes`)
- Endpoint creates the record, completes the workflow run, logs audit event
- Working document closes, chat shows confirmation message

### API Routes
- `POST /api/grow/goals` — create goal record
- `POST /api/grow/check-ins` — create check-in record
- `POST /api/grow/performance-notes` — create performance note record

These replace the chat-driven `completeGrowWorkflowTool` path for form submissions.

## What Changes in Existing System

### Removed (for Grow workflows)
- `[ASCENTA_FIELD_PROMPT]` delimiter usage in Grow tool responses
- Field-by-field `updateWorkflowFieldTool` loop for Grow workflows
- Synthetic `[SELECT:runId:fieldKey:value]` messages for Grow workflows
- `FieldPromptBlock` rendering in chat for Grow workflow messages

### Modified
- `startGoalCreationTool` / `startCheckInTool` / `startPerformanceNoteTool` — return `workingDocument` payload instead of `fieldPromptBlock`
- Chat context — add working document state management
- Chat page layout — support two-panel mode when working document is open
- System prompt — instruct AI to analyze prompts, ask minimal questions, and use `openWorkingDocument` tool

### Preserved
- Corrective action workflows keep `[ASCENTA_FIELD_PROMPT]` inline pattern
- `updateWorkflowFieldTool` remains available for corrective actions
- All existing audit logging, guardrails, and workflow run tracking

### TODO: Future Migration
- Migrate corrective action workflows (written-warning, PIP, investigation-summary) to working document pattern
- The working document for corrective actions would show the document template being built, not just form fields
- Follow-up actions (email/script) could become tabs or sections in the working document
