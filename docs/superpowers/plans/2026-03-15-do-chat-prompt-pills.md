# Do Chat Prompt Pills Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the do-tab chat empty state with a centered layout, time-of-day greeting, and tool-grouped prompt pill menus that pre-fill the chat input and select the corresponding tool.

**Architecture:** Replace the current suggestion-tile empty state with a vertically centered layout (greeting + chat card + tool pills). Each pill opens a shadcn Popover with dynamic suggested prompts. Assistant messages in active chat lose their card styling (flat on the page). A mock user constant provides dynamic prompt data until auth exists.

**Tech Stack:** Next.js App Router (client components), React 19, shadcn/ui Popover, Tailwind CSS v4, Lucide icons

---

## Chunk 1: Data Layer & Utilities

### Task 1: Create MockUser constant

**Files:**
- Create: `apps/platform/src/lib/constants/mock-user.ts`

- [ ] **Step 1: Create the mock user file**

```typescript
// apps/platform/src/lib/constants/mock-user.ts
export interface MockUser {
  name: string;
  role: "manager" | "employee";
  directReports: { name: string; jobTitle: string }[];
}

export const MOCK_USER: MockUser = {
  name: "Jason",
  role: "manager",
  directReports: [
    { name: "Sarah Chen", jobTitle: "Senior Engineer" },
    { name: "Michael Torres", jobTitle: "Product Designer" },
    { name: "Emily Davis", jobTitle: "Marketing Manager" },
  ],
};
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`
Expected: No errors related to `mock-user.ts`

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/constants/mock-user.ts
git commit -m "feat: add MockUser constant for dynamic prompt suggestions"
```

---

### Task 2: Create greeting utility

**Files:**
- Create: `apps/platform/src/lib/utils/greeting.ts`

- [ ] **Step 1: Create the greeting utility**

```typescript
// apps/platform/src/lib/utils/greeting.ts
export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/utils/greeting.ts
git commit -m "feat: add getGreeting time-of-day utility"
```

---

### Task 3: Create prompt template resolver

**Files:**
- Create: `apps/platform/src/lib/utils/resolve-prompt.ts`

- [ ] **Step 1: Create the resolver**

```typescript
// apps/platform/src/lib/utils/resolve-prompt.ts
import type { MockUser } from "@/lib/constants/mock-user";

/**
 * Resolves template tokens in prompt strings.
 * Supported tokens: {{userName}}, {{directReport}} (picks first direct report name)
 * Unknown tokens are left as-is.
 */
export function resolvePrompt(template: string, user: MockUser): string {
  const firstReport = user.directReports[0];
  return template
    .replace(/\{\{userName\}\}/g, user.name)
    .replace(/\{\{directReport\}\}/g, firstReport?.name ?? "a team member");
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/utils/resolve-prompt.ts
git commit -m "feat: add resolvePrompt template utility for dynamic suggestions"
```

---

### Task 4: Update PageTool with promptSuggestions and add suggestions to grow/performance tools

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:159-163` (PageTool interface)
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:165-170` (PageConfig interface — remove suggestions)
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:172-399` (PAGE_CONFIG — remove all suggestions arrays)
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:302-306` (grow/performance tools — add promptSuggestions)
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:390-399` (DEFAULT_PAGE_CONFIG — remove suggestions)

- [ ] **Step 1: Add ToolSuggestion interface and promptSuggestions to PageTool**

In `dashboard-nav.ts`, add the `ToolSuggestion` interface and update `PageTool`:

```typescript
export interface ToolSuggestion {
  label: string;
  promptTemplate: string;
}

export interface PageTool {
  key: string;
  label: string;
  icon: LucideIcon;
  promptSuggestions?: ToolSuggestion[];
}
```

- [ ] **Step 2: Remove `suggestions` from PageConfig interface**

Change the `PageConfig` interface to remove the `suggestions` field:

```typescript
export interface PageConfig {
  title: string;
  description: string;
  tools?: PageTool[];
}
```

- [ ] **Step 3: Remove all `suggestions` arrays from every entry in PAGE_CONFIG and DEFAULT_PAGE_CONFIG**

Every page config entry currently has a `suggestions` array. Remove them all. For example, `plan/strategy-studio` becomes:

```typescript
"plan/strategy-studio": {
  title: "Strategy Studio",
  description: "Define and align your people strategy with business objectives.",
},
```

And `DEFAULT_PAGE_CONFIG` becomes:

```typescript
export const DEFAULT_PAGE_CONFIG: PageConfig = {
  title: "Ascenta",
  description: "Your AI-powered HR assistant.",
};
```

- [ ] **Step 4: Add promptSuggestions to grow/performance tools**

```typescript
tools: [
  {
    key: "startGoalCreation",
    label: "Create Goal",
    icon: Target,
    promptSuggestions: [
      { label: "Goal from job description", promptTemplate: "Create a goal for {{directReport}} based on their job description" },
      { label: "Leadership development goal", promptTemplate: "Create a development goal for {{directReport}} focused on leadership skills" },
      { label: "Q2 performance goals", promptTemplate: "Set up Q2 performance goals for {{directReport}} aligned to department objectives" },
    ],
  },
  {
    key: "startCheckIn",
    label: "Run Check-in",
    icon: CalendarCheck,
    promptSuggestions: [
      { label: "Weekly check-in", promptTemplate: "Run a weekly check-in with {{directReport}}" },
      { label: "Goal progress review", promptTemplate: "Run a check-in with {{directReport}} focused on goal progress" },
      { label: "Mid-quarter review", promptTemplate: "Run a mid-quarter performance check-in with {{directReport}}" },
    ],
  },
  {
    key: "startPerformanceNote",
    label: "Add Note",
    icon: FileText,
    promptSuggestions: [
      { label: "Coaching observation", promptTemplate: "Add a coaching note for {{directReport}} about today's meeting" },
      { label: "Recognition note", promptTemplate: "Add a recognition note for {{directReport}} for outstanding work" },
      { label: "Development observation", promptTemplate: "Add a development note for {{directReport}} on areas for growth" },
    ],
  },
],
```

- [ ] **Step 5: Fix any references to `pageConfig.suggestions` in the codebase**

Search for any remaining references to `pageConfig.suggestions` or `suggestions` on `PageConfig`. The main reference is in `do-tab-chat.tsx` (lines 162-179) — this will be replaced in Task 6, but verify no other files reference it.

Run: `cd /Users/jason/personal-repos/ascenta && grep -rn "\.suggestions" apps/platform/src/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v "promptSuggestions"`

If there are references outside `do-tab-chat.tsx`, update them accordingly.

- [ ] **Step 6: Verify it compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`

Note: This WILL have errors since `do-tab-chat.tsx` still references `pageConfig.suggestions`. That's expected — it's fixed in Task 6. If there are OTHER errors, fix them here.

- [ ] **Step 7: Commit**

```bash
git add apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "feat: add promptSuggestions to PageTool, remove old suggestions from PageConfig"
```

---

## Chunk 2: UI Components

### Task 5: Create SuggestPromptPills component

**Files:**
- Create: `apps/platform/src/components/chat/suggest-prompt-pills.tsx`

- [ ] **Step 1: Create the component**

```typescript
// apps/platform/src/components/chat/suggest-prompt-pills.tsx
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@ascenta/ui/popover";
import { Button } from "@ascenta/ui/button";
import type { PageTool } from "@/lib/constants/dashboard-nav";
import type { MockUser } from "@/lib/constants/mock-user";
import { resolvePrompt } from "@/lib/utils/resolve-prompt";

interface SuggestPromptPillsProps {
  tools: PageTool[];
  user: MockUser;
  accentColor: string;
  onPromptSelect: (prompt: string, toolKey: string) => void;
}

export function SuggestPromptPills({
  tools,
  user,
  accentColor,
  onPromptSelect,
}: SuggestPromptPillsProps) {
  // Only render tools that have promptSuggestions
  const toolsWithSuggestions = tools.filter(
    (t) => t.promptSuggestions && t.promptSuggestions.length > 0
  );

  if (toolsWithSuggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {toolsWithSuggestions.map((tool) => (
        <Popover key={tool.key}>
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
                    onClick={() => onPromptSelect(resolved, tool.key)}
                    className="rounded-lg px-3 py-2.5 text-left text-sm text-deep-blue/80 transition-colors hover:bg-glacier/50"
                  >
                    {resolved}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`

Note: May still have errors from `do-tab-chat.tsx` referencing removed `suggestions` — that's expected.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/chat/suggest-prompt-pills.tsx
git commit -m "feat: add SuggestPromptPills component with popover menus"
```

---

### Task 6: Redesign do-tab-chat empty state

**Files:**
- Modify: `apps/platform/src/components/do-tab-chat.tsx`

- [ ] **Step 1: Add new imports**

At the top of `do-tab-chat.tsx`, add:

```typescript
import { SuggestPromptPills } from "@/components/chat/suggest-prompt-pills";
import { MOCK_USER } from "@/lib/constants/mock-user";
import { getGreeting } from "@/lib/utils/greeting";
```

- [ ] **Step 2: Apply all changes atomically (Steps 2-4 must be done together before compiling)**

Replace the `handleSuggestionClick` callback (lines 108-113) with `handlePromptSelect`:

```typescript
const handlePromptSelect = useCallback(
  (prompt: string, toolKey: string) => {
    setPageInput(pageKey, prompt);
    setSelectedTool(toolKey);
  },
  [pageKey, setPageInput, setSelectedTool],
);
```

- [ ] **Step 3: Replace the empty state render**

Replace the entire empty state block (lines 149-201, the `if (!hasMessages)` block) with:

```typescript
if (!hasMessages) {
  const hasTools = pageConfig.tools && pageConfig.tools.length > 0;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Title & greeting */}
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {pageConfig.title}
      </p>
      {hasTools && (
        <h1 className="font-display mt-1 text-2xl font-bold text-deep-blue">
          {getGreeting(MOCK_USER.name)}
        </h1>
      )}

      {/* Chat input card */}
      <div className="mt-6 w-full max-w-2xl">
        <ChatInput
          value={input}
          onChange={(v) => setPageInput(pageKey, v)}
          onSubmit={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
          placeholder={`Ask about ${pageConfig.title.toLowerCase()}...`}
          model={model}
          onModelChange={setModel}
          tools={pageConfig.tools}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
        />
      </div>

      {/* Tool prompt pills */}
      {hasTools && pageConfig.tools && (
        <div className="mt-4">
          <SuggestPromptPills
            tools={pageConfig.tools}
            user={MOCK_USER}
            accentColor={accentColor}
            onPromptSelect={handlePromptSelect}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Visually verify in browser**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform`

Navigate to `http://localhost:3051/grow/performance` and verify:
- Page title "Performance System" appears as small text
- Greeting "Good afternoon, Jason" (or morning/evening) appears below
- Chat input is centered
- Three pills appear below: "Create Goal", "Run Check-in", "Add Note"
- Clicking a pill opens a popover with 3 suggested prompts (opening one pill closes any other open popover since the click is outside)
- Clicking a prompt fills the input and selects the tool
- Navigate to a page without tools (e.g., `/plan/strategy-studio`) — should show title + chat input only, no greeting, no pills (description is intentionally removed — these pages get a minimal layout until tools are added)

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/do-tab-chat.tsx
git commit -m "feat: redesign do-tab empty state with centered layout and prompt pills"
```

---

### Task 7: Flat assistant message styling

**Files:**
- Modify: `apps/platform/src/components/chat/chat-message.tsx:12-23` (props interface)
- Modify: `apps/platform/src/components/chat/chat-message.tsx:44-56` (inner card wrapper div — outer padding div at line 43 is preserved)
- Modify: `apps/platform/src/components/do-tab-chat.tsx:241-252` (pass variant prop)

- [ ] **Step 1: Add `variant` prop to ChatMessage**

In `chat-message.tsx`, add `variant` to the interface and destructure:

```typescript
interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  activeTool?: { label: string; icon: LucideIcon } | null;
  accentColor?: string;
  botColor?: string;
  variant?: "card" | "flat";
  onWorkflowOptionSelect?: (runId: string, fieldKey: string, value: string) => void;
  onFollowUpSelect?: (runId: string, type: "email" | "script") => void;
  onFollowUpOther?: (value: string) => void;
}
```

Add `variant = "card"` to the destructured props (default to card for backwards compatibility).

- [ ] **Step 2: Apply conditional styling to the outer wrapper**

Replace the inner card wrapper div (lines 44-56, inside the outer `px-4 md:px-6 py-2` div which stays) with:

```typescript
<div
  className={cn(
    "px-4 py-4 transition-colors",
    variant === "card" && "rounded-2xl border",
    variant === "card" && isUser && "border-primary/15 bg-primary/[0.03]",
    variant === "card" && !isUser && "bg-white/80",
  )}
  style={
    variant === "card" && !isUser && accentColor
      ? { borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)` }
      : undefined
  }
>
```

- [ ] **Step 3: Pass variant from DoTabChat**

In `do-tab-chat.tsx`, update the `ChatMessage` render in the active state (the messages `.map()`) to pass the variant:

```typescript
<ChatMessage
  key={msg.id}
  role={msg.role}
  content={msg.content}
  variant={msg.role === "user" ? "card" : "flat"}
  isStreaming={isLastStreaming}
  accentColor={accentColor}
  botColor={accentColor}
  activeTool={isLastStreaming && activeToolMeta ? { label: activeToolMeta.label, icon: activeToolMeta.icon } : null}
  onWorkflowOptionSelect={onFieldSelect}
  onFollowUpSelect={onFollowUpSelect}
  onFollowUpOther={onFollowUpOther}
/>
```

- [ ] **Step 4: Verify it compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Visually verify in browser**

Navigate to `http://localhost:3051/grow/performance`, send a message, and verify:
- User messages have card styling (rounded border, background)
- Assistant messages are flat (no border, no background, content sits on the page)
- Avatar, "Ascenta" label, and content rendering all still work
- Workflow blocks, streaming badge, and loading states all unaffected

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/chat/chat-message.tsx apps/platform/src/components/do-tab-chat.tsx
git commit -m "feat: flat assistant messages, card-only for user messages"
```

---

## Chunk 3: Cleanup & Verification

### Task 8: Final verification and lint

- [ ] **Step 1: Run TypeScript check**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm lint`
Expected: No errors (or only pre-existing warnings)

- [ ] **Step 3: Run tests**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm test`
Expected: All pass

- [ ] **Step 4: Full visual QA**

Check these pages in the browser:
1. `/grow/performance` — greeting, pills, popovers, prompt fill + tool select, active chat flat/card
2. `/grow/coaching` — no tools, just title + chat input, no pills, no greeting
3. `/plan/strategy-studio` — same as coaching (no tools)
4. `/care/total-rewards` — same
5. Send messages on any page, verify active chat layout unchanged (except flat assistant styling)

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address lint and verification issues"
```
