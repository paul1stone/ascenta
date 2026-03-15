# Direct Form Open & Tool Selector Removal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Open form directly" action in each tool's prompt pill popover to bypass AI, create an employee picker for direct-open forms, remove the tool selector UI, and update the empty state to handle open working documents.

**Architecture:** Extend `SuggestPromptPills` with a direct action button per tool that opens the working document panel with blank fields. An `EmployeePicker` component (using the existing employees search API) replaces the read-only employee banner when no employee is pre-set. The tool selector is removed from the chat input (kept as internal state for prompt pill pre-selection). The `submitWorkingDocument` guard is relaxed to allow null `runId` since the API already handles it.

**Tech Stack:** React 19, shadcn/ui (Popover, Separator, Command), react-hook-form, Tailwind CSS v4, Lucide icons

---

## Chunk 1: Remove Tool Selector & Update Submit Logic

### Task 1: Remove ToolSelector from ChatInput

**Files:**
- Modify: `apps/platform/src/components/chat/chat-input.tsx:1-144`
- Delete: `apps/platform/src/components/chat/tool-selector.tsx`

- [ ] **Step 1: Remove ToolSelector imports and props from ChatInput**

In `chat-input.tsx`, make these changes:

1. Remove line 8: `import { ToolSelector } from "./tool-selector";`
2. Remove line 9: `import type { PageTool } from "@/lib/constants/dashboard-nav";`
3. Remove from `ChatInputProps` interface (lines 22-24):
   ```
   tools?: PageTool[];
   selectedTool: string | null;
   onToolChange: (tool: string | null) => void;
   ```
4. Remove from destructured props (lines 36-38):
   ```
   tools,
   selectedTool,
   onToolChange,
   ```
5. Replace the bottom bar contents (lines 118-132) — remove the separator and ToolSelector, keep only ModelSelector:
   ```typescript
   <div className="flex items-center justify-between border-t border-border/50 px-2 py-1.5">
     <ModelSelector
       value={model}
       onChange={onModelChange}
       disabled={isLoading}
     />
     <span className="text-[10px] text-muted-foreground/60">
       Press Enter to send, Shift+Enter for new line
     </span>
   </div>
   ```

- [ ] **Step 2: Remove tool-related props from ChatInput usage in DoTabChat**

In `do-tab-chat.tsx`, remove the three tool props from both `ChatInput` instances:

Empty state ChatInput (around line 180-182):
```
tools={pageConfig.tools}
selectedTool={selectedTool}
onToolChange={setSelectedTool}
```

Active state ChatInput (around line 269-271):
```
tools={pageConfig.tools}
selectedTool={selectedTool}
onToolChange={setSelectedTool}
```

- [ ] **Step 3: Delete tool-selector.tsx**

Delete the file `apps/platform/src/components/chat/tool-selector.tsx`.

- [ ] **Step 4: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep -E "(chat-input|tool-selector|do-tab-chat)" | head -20`
Expected: No errors in our files

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/chat/chat-input.tsx apps/platform/src/components/do-tab-chat.tsx
git rm apps/platform/src/components/chat/tool-selector.tsx
git commit -m "feat: remove ToolSelector from ChatInput, delete dead tool-selector.tsx"
```

---

### Task 2: Update submitWorkingDocument to allow null runId

**Files:**
- Modify: `apps/platform/src/lib/chat/chat-context.tsx:155-162`

- [ ] **Step 1: Relax the runId guard in submitWorkingDocument**

In `chat-context.tsx`, replace the guard at line 160:

```typescript
if (!workflowType || !runId) {
  throw new Error("No active working document to submit");
}
```

With:

```typescript
if (!workflowType) {
  throw new Error("No active working document to submit");
}
```

The API routes already handle missing `runId` — in `goals/route.ts` line 53: `workflowRunId: runId ?? undefined`, and the audit event on line 59 is wrapped in `if (runId)`. Same pattern in the other two routes.

- [ ] **Step 2: Update the fetch body to handle null runId**

In the same function, the body currently sends `runId` unconditionally (line 177). Update the `JSON.stringify` call (lines 173-178) to conditionally include `runId`:

```typescript
body: JSON.stringify({
  ...fields,
  employeeId,
  employeeName,
  ...(runId ? { runId } : {}),
}),
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep "chat-context" | head -10`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/chat/chat-context.tsx
git commit -m "feat: allow submitWorkingDocument with null runId for direct-open forms"
```

---

### Task 2b: Add audit trail for direct-open submissions in API routes

**Files:**
- Modify: `apps/platform/src/app/api/grow/goals/route.ts:14-77`
- Modify: `apps/platform/src/app/api/grow/check-ins/route.ts:14-71`
- Modify: `apps/platform/src/app/api/grow/performance-notes/route.ts:14-64`

All three routes follow the same pattern. Currently they only create a `WorkflowRun` and log audit events when `runId` is present. For direct-open submissions, we want to generate a `runId` and create a workflow run so every submission has an audit trail.

- [ ] **Step 1: Update goals/route.ts**

Add `nanoid` import at the top:
```typescript
import { nanoid } from "nanoid";
```

After `const { runId, ...formData } = body;` (line 15), add:
```typescript
const effectiveRunId = runId || nanoid();
```

Replace `workflowRunId: runId ?? undefined,` (line 53) with:
```typescript
workflowRunId: effectiveRunId,
```

Replace the `if (runId) { ... }` block (lines 59-77) with:
```typescript
if (runId) {
  await WorkflowRun.findByIdAndUpdate(runId, {
    $set: {
      status: "completed",
      currentStep: "completed",
      completedAt: new Date(),
    },
  });
}

await logAuditEvent({
  workflowRunId: effectiveRunId,
  actorId: "system",
  actorType: "system",
  action: "approved",
  description: `Completed goal workflow. Record ID: ${goalId}`,
  workflowVersion: 1,
  metadata: { recordId: goalId, recordType: "goal" },
});
```

This way: AI-initiated submissions update the existing run AND log audit. Direct-open submissions skip the run update (no run to update) but still log an audit event.

- [ ] **Step 2: Apply the same pattern to check-ins/route.ts and performance-notes/route.ts**

Same changes in both files:
1. Add `import { nanoid } from "nanoid";`
2. Add `const effectiveRunId = runId || nanoid();` after destructuring
3. Replace `workflowRunId: runId ?? undefined` with `workflowRunId: effectiveRunId`
4. Move the `logAuditEvent` call outside the `if (runId)` block (keep the `WorkflowRun.findByIdAndUpdate` inside `if (runId)`)

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep -E "(goals/route|check-ins/route|performance-notes/route)" | head -10`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/grow/goals/route.ts apps/platform/src/app/api/grow/check-ins/route.ts apps/platform/src/app/api/grow/performance-notes/route.ts
git commit -m "feat: add audit trail for direct-open form submissions"
```

---

## Chunk 2: Direct Open Action & Popover Control

### Task 3: Add controlled popover state and direct action to SuggestPromptPills

**Files:**
- Modify: `apps/platform/src/components/chat/suggest-prompt-pills.tsx:1-72`

- [ ] **Step 1: Rewrite the component with controlled popovers and direct action**

Replace the entire contents of `suggest-prompt-pills.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@ascenta/ui/popover";
import { Separator } from "@ascenta/ui/separator";
import { Button } from "@ascenta/ui/button";
import { SquarePen } from "lucide-react";
import type { PageTool } from "@/lib/constants/dashboard-nav";
import type { MockUser } from "@/lib/constants/mock-user";
import { resolvePrompt } from "@/lib/utils/resolve-prompt";

interface SuggestPromptPillsProps {
  tools: PageTool[];
  user: MockUser;
  accentColor: string;
  onPromptSelect: (prompt: string, toolKey: string) => void;
  onDirectOpen: (toolKey: string) => void;
}

export function SuggestPromptPills({
  tools,
  user,
  accentColor,
  onPromptSelect,
  onDirectOpen,
}: SuggestPromptPillsProps) {
  const [openToolKey, setOpenToolKey] = useState<string | null>(null);

  const toolsWithSuggestions = tools.filter(
    (t) => t.promptSuggestions && t.promptSuggestions.length > 0
  );

  if (toolsWithSuggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {toolsWithSuggestions.map((tool) => (
        <Popover
          key={tool.key}
          open={openToolKey === tool.key}
          onOpenChange={(open) => setOpenToolKey(open ? tool.key : null)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-glacier/50"
              style={{
                borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
                color: accentColor,
              }}
            >
              <tool.icon className="size-3.5" />
              {tool.label}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-1"
            align="center"
            sideOffset={8}
          >
            <div className="flex flex-col">
              {tool.promptSuggestions!.map((suggestion) => {
                const resolved = resolvePrompt(suggestion.promptTemplate, user);
                return (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => {
                      onPromptSelect(resolved, tool.key);
                      setOpenToolKey(null);
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm text-deep-blue/80 transition-colors hover:bg-glacier/50"
                  >
                    {resolved}
                  </button>
                );
              })}
              <Separator className="my-1" />
              <button
                type="button"
                onClick={() => {
                  onDirectOpen(tool.key);
                  setOpenToolKey(null);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-glacier/50 hover:text-deep-blue"
              >
                <SquarePen className="size-3" />
                Open form directly
              </button>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
```

Key changes:
- `useState<string | null>` for `openToolKey` — controlled popover state, only one open at a time
- `onDirectOpen` prop added
- Both prompt clicks and direct open clicks explicitly set `openToolKey(null)` to dismiss
- Separator + "Open form directly" button at the bottom of each popover
- `SquarePen` icon, muted text, smaller font for visual distinction

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep "suggest-prompt" | head -10`
Expected: Error about missing `onDirectOpen` prop in `do-tab-chat.tsx` — that's expected, fixed in Task 4.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/chat/suggest-prompt-pills.tsx
git commit -m "feat: add controlled popovers and direct form open action to prompt pills"
```

---

### Task 4: Add handleDirectOpen and update empty state condition in DoTabChat

**Files:**
- Modify: `apps/platform/src/components/do-tab-chat.tsx`

- [ ] **Step 1: Add the tool key → workflow type mapping and handleDirectOpen callback**

In `do-tab-chat.tsx`, add the import for `WorkflowType` at the top (with the other imports):

```typescript
import type { WorkflowType } from "@/lib/chat/chat-context";
```

Add the mapping constant **outside** the component function (module-level, after imports):

```typescript
const TOOL_KEY_TO_WORKFLOW: Record<string, WorkflowType> = {
  startGoalCreation: "create-goal",
  startCheckIn: "run-check-in",
  startPerformanceNote: "add-performance-note",
};
```

Add the `handleDirectOpen` callback (near the other handlers):

```typescript
const handleDirectOpen = useCallback(
  (toolKey: string) => {
    const workflowType = TOOL_KEY_TO_WORKFLOW[toolKey];
    if (workflowType) {
      openWorkingDocument(workflowType, "", "", "", {});
    }
  },
  [openWorkingDocument],
);
```

Note: passing empty strings here because `openWorkingDocument` currently types these as `string`. The `submitWorkingDocument` check uses `!runId` which is falsy for both `""` and `null`.

- [ ] **Step 2: Pass onDirectOpen to SuggestPromptPills**

In the empty state render, update the `SuggestPromptPills` usage (around line 189-194) to include `onDirectOpen`:

```typescript
<SuggestPromptPills
  tools={pageConfig.tools}
  user={MOCK_USER}
  accentColor={accentColor}
  onPromptSelect={handlePromptSelect}
  onDirectOpen={handleDirectOpen}
/>
```

- [ ] **Step 3: Update the empty state condition**

Change line 154 from:

```typescript
if (!hasMessages) {
```

To:

```typescript
if (!hasMessages && !workingDocument.isOpen) {
```

This ensures that when the working document panel is open (from direct open) with no messages, the active chat layout renders instead of the empty state.

- [ ] **Step 4: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep -E "(do-tab-chat|suggest-prompt)" | head -10`
Expected: No errors

- [ ] **Step 5: Visually verify in browser**

Run: `pnpm dev --filter=@ascenta/platform`

Navigate to `http://localhost:3051/grow/performance` and verify:
- Three prompt pills appear below the chat input
- Clicking a pill opens a popover with 3 suggestions + separator + "Open form directly"
- Clicking "Open form directly" opens the working document side panel with a blank form
- The empty state transitions to the active layout (chat input + side panel)
- Clicking a suggested prompt still fills the input and dismisses the popover
- Opening one pill's popover closes any other that was open
- The tool selector is gone from the chat input bar

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/do-tab-chat.tsx
git commit -m "feat: add direct form open handler and update empty state condition"
```

---

## Chunk 3: Employee Picker

### Task 5: Create EmployeePicker component

**Files:**
- Create: `apps/platform/src/components/grow/forms/employee-picker.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import { Search, User } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
}

interface EmployeePickerProps {
  onSelect: (employeeId: string, employeeName: string) => void;
}

export function EmployeePicker({ onSelect }: EmployeePickerProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/dashboard/employees?search=${encodeURIComponent(search)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.employees ?? []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <Label htmlFor="employee-search">
        Employee <span className="text-destructive">*</span>
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="employee-search"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => search.length >= 2 && setIsOpen(true)}
          className="pl-9"
        />
      </div>
      {isOpen && (results.length > 0 || isLoading || search.length >= 2) && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            results.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  const name = `${emp.firstName} ${emp.lastName}`;
                  onSelect(emp.id, name);
                  setSearch(name);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-glacier/50"
              >
                <User className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-deep-blue">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {emp.jobTitle} · {emp.department}
                  </div>
                </div>
              </button>
            ))
          )}
          {!isLoading && results.length === 0 && search.length >= 2 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No employees found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep "employee-picker" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/forms/employee-picker.tsx
git commit -m "feat: add EmployeePicker component with debounced search"
```

---

### Task 6: Integrate EmployeePicker into GoalCreationForm

**Files:**
- Modify: `apps/platform/src/components/grow/forms/goal-creation-form.tsx:1-5` (imports)
- Modify: `apps/platform/src/components/grow/forms/goal-creation-form.tsx:169-180` (employee banner)

- [ ] **Step 1: Add EmployeePicker import**

Add at the top of `goal-creation-form.tsx`:

```typescript
import { EmployeePicker } from "./employee-picker";
```

- [ ] **Step 2: Replace the employee banner with conditional picker/banner**

Replace lines 169-180 (the employee info banner):

```typescript
{/* Employee info banner */}
<div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
  <User className="size-4 text-muted-foreground" />
  <div className="text-sm">
    <span className="font-medium">{watch("employeeName") || "Employee"}</span>
    {watch("employeeId") && (
      <span className="ml-2 text-muted-foreground">
        ({watch("employeeId")})
      </span>
    )}
  </div>
</div>
```

With:

```typescript
{/* Employee: picker for direct-open, read-only banner for AI-initiated */}
{watch("employeeId") ? (
  <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
    <User className="size-4 text-muted-foreground" />
    <div className="text-sm">
      <span className="font-medium">{watch("employeeName") || "Employee"}</span>
      <span className="ml-2 text-muted-foreground">
        ({watch("employeeId")})
      </span>
    </div>
  </div>
) : (
  <EmployeePicker
    onSelect={(employeeId, employeeName) => {
      setValue("employeeId", employeeId, { shouldValidate: true });
      setValue("employeeName", employeeName, { shouldValidate: true });
      onFieldChange("employeeId", employeeId);
      onFieldChange("employeeName", employeeName);
    }}
  />
)}
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep "goal-creation-form" | head -10`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/forms/goal-creation-form.tsx
git commit -m "feat: add EmployeePicker to GoalCreationForm for direct-open"
```

---

### Task 7: Integrate EmployeePicker into CheckInForm and PerformanceNoteForm

**Files:**
- Modify: `apps/platform/src/components/grow/forms/check-in-form.tsx`
- Modify: `apps/platform/src/components/grow/forms/performance-note-form.tsx`

- [ ] **Step 1: Update CheckInForm**

Apply the same pattern as Task 6:

1. Add import: `import { EmployeePicker } from "./employee-picker";`
2. Find the employee info banner (around lines 84-97 — look for `{/* Employee info banner */}`)
3. Replace with the same conditional picker/banner pattern from Task 6 Step 2

Additionally, the CheckInForm needs to fetch available goals when an employee is selected. In the `EmployeePicker`'s `onSelect` callback, after setting employee fields, fetch goals for the selected employee:

```typescript
<EmployeePicker
  onSelect={async (employeeId, employeeName) => {
    setValue("employeeId", employeeId, { shouldValidate: true });
    setValue("employeeName", employeeName, { shouldValidate: true });
    onFieldChange("employeeId", employeeId);
    onFieldChange("employeeName", employeeName);
    // Fetch goals for this employee to populate the linkedGoals field
    try {
      const res = await fetch(`/api/grow/status?managerId=${encodeURIComponent(employeeId)}`);
      if (res.ok) {
        const data = await res.json();
        const goals = (data.employees?.[0]?.goals ?? []).map(
          (g: { id: string; title: string }) => ({ id: g.id, title: g.title })
        );
        onFieldChange("availableGoals", goals);
      }
    } catch {
      // Goals will remain empty — user can still submit without linked goals
    }
  }}
/>
```

Note: The `availableGoals` data flows through the working document state. The `WorkingDocument` component passes it as a prop to `CheckInForm`. Update `onFieldChange` to use `updateWorkingDocumentFields` if needed to set `availableGoals` on the working document state. If the current `onFieldChange` only updates form fields (not working doc state), use `updateWorkingDocumentFields({ availableGoals: goals })` from the chat context instead. Check the `WorkingDocument` component to confirm the data flow.

- [ ] **Step 2: Update PerformanceNoteForm**

Same pattern:

1. Add import: `import { EmployeePicker } from "./employee-picker";`
2. Find the employee info banner (around lines 94-106 — look for `{/* Employee info banner */}`)
3. Replace with the same conditional picker/banner pattern from Task 6 Step 2

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep -E "(check-in-form|performance-note-form)" | head -10`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/forms/check-in-form.tsx apps/platform/src/components/grow/forms/performance-note-form.tsx
git commit -m "feat: add EmployeePicker to CheckInForm and PerformanceNoteForm"
```

---

## Chunk 4: Verification

### Task 8: Final verification

- [ ] **Step 1: Run TypeScript check**

Run: `pnpm --filter=@ascenta/platform exec tsc --noEmit 2>&1 | grep -v "packages/ui" | head -30`
Expected: No errors in platform app files

- [ ] **Step 2: Full visual QA in browser**

Run: `pnpm dev --filter=@ascenta/platform`

Test these scenarios at `http://localhost:3051/grow/performance`:

1. **Prompt pill popover**: Click "Create Goal" pill → popover shows 3 suggestions + separator + "Open form directly"
2. **Prompt selection**: Click a suggestion → fills input, selects tool internally, popover closes
3. **Direct form open**: Click "Open form directly" → side panel opens with blank GoalCreationForm, employee picker visible
4. **Employee picker**: Type in the search box → debounced search results appear → click an employee → form shows read-only banner
5. **Form submission without runId**: Fill out the form completely → submit → should succeed (no runId error)
6. **Direct open for Check-in**: Click "Run Check-in" pill → "Open form directly" → blank check-in form with employee picker
7. **Direct open for Note**: Click "Add Note" pill → "Open form directly" → blank note form with employee picker
8. **Tool selector gone**: Verify the chat input bottom bar shows only the model selector, no tool selector
9. **Non-tool pages**: Navigate to `/grow/coaching` → no pills, no popover, just chat input
10. **Active chat**: Send a message on any page → user messages have cards, assistant messages are flat

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address verification issues"
```
