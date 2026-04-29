# Suggested Outcomes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface role translation outcomes on the Goals tab so employees can launch goal creation from a specific outcome, skipping the discovery steps.

**Architecture:** New GET endpoint flattens outcomes from `getTranslationForEmployee()`. GoalsPanel fetches and renders them below the goal tables. Clicking "Create with Compass" navigates to `/do` with outcome context params. The `/do` page passes these through `sendMessage` → `/api/chat` → system prompt injection. The existing `startGoalWorkflowTool` gets a prompt-level fast-path instruction to skip Steps 1-3.

**Tech Stack:** Next.js App Router, React, Mongoose, existing `getTranslationForEmployee()` helper

---

### Task 1: API Endpoint — `GET /api/grow/suggested-outcomes`

**Files:**
- Create: `apps/platform/src/app/api/grow/suggested-outcomes/route.ts`

- [ ] **Step 1: Create the endpoint**

```ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { getEmployeeById } from "@ascenta/db/employees";
import { getTranslationForEmployee } from "@/lib/ai/translation-lookup";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId query parameter is required" },
        { status: 400 },
      );
    }

    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      return NextResponse.json({ outcomes: [] });
    }

    const translation = await getTranslationForEmployee(
      employee.department,
      employee.jobTitle,
    );

    if (!translation) {
      return NextResponse.json({ outcomes: [] });
    }

    const outcomes: {
      text: string;
      strategyGoalId: string;
      strategyGoalTitle: string;
      roleContribution: string;
    }[] = [];

    for (const contribution of translation.contributions) {
      for (const outcomeText of contribution.outcomes) {
        outcomes.push({
          text: outcomeText,
          strategyGoalId: contribution.strategyGoalId,
          strategyGoalTitle: contribution.strategyGoalTitle,
          roleContribution: contribution.roleContribution,
        });
      }
    }

    return NextResponse.json({ outcomes });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Suggested outcomes GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suggested outcomes" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify endpoint works**

Run: `curl http://localhost:3051/api/grow/suggested-outcomes?employeeId=<valid-employee-object-id>`

Expected: JSON with `{ outcomes: [...] }` array (populated if the employee's department has a published translation, empty otherwise).

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/grow/suggested-outcomes/route.ts
git commit -m "feat(grow): add suggested-outcomes API endpoint"
```

---

### Task 2: Goals Panel — Fetch and Render Suggested Outcomes

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`

- [ ] **Step 1: Add outcome interface and state**

At the top of the file, after the `GoalData` interface (line 47), add:

```ts
interface SuggestedOutcome {
  text: string;
  strategyGoalId: string;
  strategyGoalTitle: string;
  roleContribution: string;
}
```

Inside `GoalsPanel`, after the existing `useState` declarations (after line 96), add:

```ts
const [suggestedOutcomes, setSuggestedOutcomes] = useState<SuggestedOutcome[]>([]);
const [showAllOutcomes, setShowAllOutcomes] = useState(false);
```

- [ ] **Step 2: Fetch outcomes alongside goals**

After the `fetchGoals` callback (after line ~140), add a `fetchOutcomes` callback:

```ts
const fetchOutcomes = useCallback(async () => {
  if (!viewingEmployeeId) return;
  try {
    const res = await fetch(
      `/api/grow/suggested-outcomes?employeeId=${viewingEmployeeId}`,
    );
    if (res.ok) {
      const data = await res.json();
      setSuggestedOutcomes(data.outcomes ?? []);
    }
  } catch {
    // silent — section just won't render
  }
}, [viewingEmployeeId]);
```

In the existing `useEffect` that calls `fetchGoals()`, add `fetchOutcomes()` alongside it. Also reset `showAllOutcomes` when the employee changes:

```ts
// In the useEffect that calls fetchGoals():
fetchOutcomes();
setShowAllOutcomes(false);
```

Add `fetchOutcomes` to that effect's dependency array.

- [ ] **Step 3: Build the outcome link URL helper**

Before the `return` statement in GoalsPanel, add:

```ts
function buildOutcomeLink(outcome: SuggestedOutcome): string {
  const prompt = `Create a goal based on this outcome: "${outcome.text}"`;
  const params = new URLSearchParams({
    prompt,
    tool: "startGoalWorkflow",
    outcomeText: outcome.text,
    strategyGoalId: outcome.strategyGoalId,
    strategyGoalTitle: outcome.strategyGoalTitle,
    contributionRef: outcome.roleContribution,
  });
  return `/do?${params.toString()}`;
}
```

- [ ] **Step 4: Render suggested outcomes section**

After the goal tables `</div>` that closes the `space-y-5` div (around line 650, inside the `goals.length > 0` branch), and also after the empty state block, add the suggested outcomes section:

```tsx
{suggestedOutcomes.length > 0 && (
  <div className="mt-6">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      Suggested Outcomes
    </p>
    <div className="space-y-2">
      {(showAllOutcomes
        ? suggestedOutcomes
        : suggestedOutcomes.slice(0, 3)
      ).map((outcome, i) => (
        <div
          key={`${outcome.strategyGoalId}-${i}`}
          className="flex items-center justify-between rounded-lg border px-3 py-2.5"
        >
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-sm text-foreground truncate">
              {outcome.text}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {outcome.strategyGoalTitle}
            </p>
          </div>
          <Link
            href={buildOutcomeLink(outcome)}
            className="flex items-center gap-1 shrink-0 text-xs font-medium transition-colors"
            style={{ color: "#ff6b35" }}
          >
            <Compass className="size-3" />
            Create with Compass
          </Link>
        </div>
      ))}
      {!showAllOutcomes && suggestedOutcomes.length > 3 && (
        <button
          onClick={() => setShowAllOutcomes(true)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Show {suggestedOutcomes.length - 3} more
        </button>
      )}
    </div>
  </div>
)}
```

Place this block in two locations:
1. Inside the `goals.length > 0` branch, after the `space-y-5` div closes (after the goal tables)
2. Inside the `goals.length === 0` branch, after the empty state div

Extract it as a local variable above the return to avoid duplication:

```tsx
const suggestedOutcomesSection = suggestedOutcomes.length > 0 ? (
  <div className="mt-6">
    {/* ... the JSX from above ... */}
  </div>
) : null;
```

Then render `{suggestedOutcomesSection}` in both branches.

- [ ] **Step 5: Verify in browser**

Run: `pnpm dev --filter=@ascenta/platform`

Navigate to the Goals tab. If the current persona has a published translation with outcomes, the "Suggested Outcomes" section should appear below the goals table. Verify:
- First 3 outcomes shown
- "Show more" link appears if >3 outcomes
- Clicking "Show more" reveals all outcomes
- Each outcome shows text + strategy goal title
- "Create with Compass" links are visible

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "feat(grow): render suggested outcomes below goals table"
```

---

### Task 3: Pass Outcome Context Through the Chat Pipeline

**Files:**
- Modify: `apps/platform/src/app/do/page.tsx`
- Modify: `apps/platform/src/lib/chat/chat-context.tsx`
- Modify: `apps/platform/src/app/api/chat/route.ts`

- [ ] **Step 1: Extend `sendMessage` signature in chat-context.tsx**

In the `ChatContextValue` interface (line 48), update the `sendMessage` type:

```ts
sendMessage: (pageKey: string, content: string, requiredTool?: string, currentEmployee?: { id: string; employeeId?: string; firstName: string; lastName: string; department: string; title: string }, outcomeContext?: { outcomeText: string; strategyGoalId: string; strategyGoalTitle: string; contributionRef: string }) => Promise<void>;
```

In the `sendMessage` implementation (line ~299-300), add the parameter:

```ts
const sendMessage = useCallback(
  async (pageKey: string, content: string, requiredTool?: string, currentEmployee?: { id: string; employeeId?: string; firstName: string; lastName: string; department: string; title: string }, outcomeContext?: { outcomeText: string; strategyGoalId: string; strategyGoalTitle: string; contributionRef: string }) => {
```

In the `fetch` body (line ~347-355), add `outcomeContext`:

```ts
body: JSON.stringify({
  messages: [{ role: "user", content: trimmed }],
  conversationId: pageState.conversationId,
  userId: "anonymous",
  model,
  ...(activeWorkflowRunId ? { activeWorkflowRunId } : {}),
  ...(requiredTool ? { requiredTool } : {}),
  ...(currentEmployee ? { currentEmployee } : {}),
  ...(outcomeContext ? { outcomeContext } : {}),
}),
```

- [ ] **Step 2: Read outcome params in `/do` page**

In `apps/platform/src/app/do/page.tsx`, update the `useEffect` (lines 21-43):

```ts
useEffect(() => {
  if (hasSeededRef.current) return;
  const prompt = searchParams.get("prompt");
  const toolKey = searchParams.get("tool");
  const outcomeText = searchParams.get("outcomeText");
  const strategyGoalId = searchParams.get("strategyGoalId");
  const strategyGoalTitle = searchParams.get("strategyGoalTitle");
  const contributionRef = searchParams.get("contributionRef");

  if (prompt) {
    hasSeededRef.current = true;
    setPageInput("do", prompt);
    // Auto-send after a brief delay to let the component mount
    setTimeout(() => {
      const employeeInfo = persona
        ? {
            id: persona.id,
            employeeId: persona.employeeId,
            firstName: persona.firstName,
            lastName: persona.lastName,
            department: persona.department,
            title: persona.title,
          }
        : undefined;
      const outcomeCtx =
        outcomeText && strategyGoalId && strategyGoalTitle && contributionRef
          ? { outcomeText, strategyGoalId, strategyGoalTitle, contributionRef }
          : undefined;
      sendMessage("do", prompt, toolKey ?? undefined, employeeInfo, outcomeCtx);
    }, 100);
  }
}, [searchParams, setPageInput, sendMessage, persona]);
```

- [ ] **Step 3: Inject outcome context in `/api/chat` route**

In `apps/platform/src/app/api/chat/route.ts`, add `outcomeContext` to the `ChatRequest` interface (after line 59):

```ts
outcomeContext?: { outcomeText: string; strategyGoalId: string; strategyGoalTitle: string; contributionRef: string };
```

Destructure it from `body` (after the `currentEmployee` destructure, line ~78):

```ts
outcomeContext,
```

After the `requiredTool` injection block (after line ~179), add:

```ts
if (outcomeContext) {
  effectiveSystemPrompt += `\n\n[OUTCOME_CONTEXT] The user has pre-selected an outcome from their role translation:\n- Outcome: "${outcomeContext.outcomeText}"\n- Strategy Goal: "${outcomeContext.strategyGoalTitle}" (ID: ${outcomeContext.strategyGoalId})\n- Role Contribution: "${outcomeContext.contributionRef}"\nSkip Steps 1-3. Default goalType to "performance". Use this outcome as the basis for the objective statement. Go directly to Step 4: suggest 1-3 key results for this outcome, discuss time period and support, then call openGoalDocument with strategyGoalId, strategyGoalTitle, and contributionRef pre-filled. [/OUTCOME_CONTEXT]`;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/do/page.tsx apps/platform/src/lib/chat/chat-context.tsx apps/platform/src/app/api/chat/route.ts
git commit -m "feat(grow): pass outcome context through chat pipeline"
```

---

### Task 4: Update Tool Description with Fast-Path Instructions

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`

- [ ] **Step 1: Add fast-path to tool description**

In `apps/platform/src/lib/ai/grow-tools.ts`, in the `startGoalWorkflowTool` description string (line 153-180), add before the `RULES:` section (before line 172):

```
**Fast-path:** If the system prompt contains [OUTCOME_CONTEXT], skip Steps 1-3 entirely. The strategic pillar and objective are already determined. Default goalType to "performance". Use the outcome text to draft the objective statement and proceed directly to Step 4 (key results, time period, support agreement). Ensure strategyGoalId, strategyGoalTitle, and contributionRef from the context are passed through to openGoalDocument.
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts
git commit -m "feat(grow): add fast-path instructions to startGoalWorkflow tool"
```

---

### Task 5: End-to-End Verification

- [ ] **Step 1: Verify full flow in browser**

Run: `pnpm dev --filter=@ascenta/platform`

1. Navigate to the Goals tab
2. Confirm "Suggested Outcomes" section appears below goals (requires a persona with published translation)
3. Verify "Show more" works when >3 outcomes
4. Click "Create with Compass" on one outcome
5. Confirm it navigates to `/do` with the correct URL params
6. Confirm the AI skips Steps 1-3 and goes directly to suggesting key results for the selected outcome
7. Complete the goal creation flow and verify the form opens with strategyGoalId and contributionRef populated

- [ ] **Step 2: Verify empty state**

Switch to a persona whose department has no published translation. Confirm the "Suggested Outcomes" section does not appear at all.

- [ ] **Step 3: Lint check**

Run: `pnpm lint`

Expected: No new lint errors.

- [ ] **Step 4: Type check**

Run: `pnpm exec tsc --noEmit -p apps/platform/tsconfig.json`

Expected: No new type errors.
