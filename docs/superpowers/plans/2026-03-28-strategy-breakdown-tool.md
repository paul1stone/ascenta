# Strategy Breakdown Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Compass AI tool that breaks down company and department strategy for the current user, with an optional downloadable strategy brief document.

**Architecture:** Two AI tools (`getStrategyBreakdown` for data fetch, `generateStrategyBrief` for document generation) integrated into Compass via the existing tool selector and working document panel. A new read-only `StrategyBriefPanel` component renders the brief in the working document panel instead of a form.

**Tech Stack:** Next.js App Router, Vercel AI SDK `tool()`, Zod, Mongoose, React, Tailwind CSS, shadcn/ui, `window.print()` for PDF download.

**Spec:** `docs/superpowers/specs/2026-03-28-strategy-breakdown-tool-design.md`

---

## File Map

### New Files
- `apps/platform/src/lib/ai/strategy-tools.ts` — `getStrategyBreakdown` and `generateStrategyBrief` tool definitions
- `apps/platform/src/components/strategy/strategy-brief-panel.tsx` — Read-only document panel component

### Modified Files
- `apps/platform/src/lib/chat/chat-context.tsx` — Add `"strategy-breakdown"` to `WorkflowType`
- `apps/platform/src/components/grow/working-document.tsx` — Route `strategy-breakdown` to `StrategyBriefPanel`
- `apps/platform/src/lib/constants/dashboard-nav.ts` — Add tool to `PAGE_CONFIG["do"].tools`
- `apps/platform/src/components/do-tab-chat.tsx` — Add `getStrategyBreakdown` to `TOOL_KEY_TO_WORKFLOW`
- `apps/platform/src/app/api/chat/route.ts` — Register strategy tools
- `apps/platform/src/lib/ai/prompts.ts` — Add strategy breakdown instructions

---

### Task 1: Add `"strategy-breakdown"` to WorkflowType and Chat Context

**Files:**
- Modify: `apps/platform/src/lib/chat/chat-context.tsx:28`

- [ ] **Step 1: Update WorkflowType union**

In `apps/platform/src/lib/chat/chat-context.tsx`, change line 28 from:

```typescript
export type WorkflowType = "create-goal" | "run-check-in" | "add-performance-note" | "build-mvv";
```

to:

```typescript
export type WorkflowType = "create-goal" | "run-check-in" | "add-performance-note" | "build-mvv" | "strategy-breakdown";
```

The `strategy-breakdown` type does not need a submit route in `submitWorkingDocument` because the brief panel is read-only — there's no form submission. The existing `routeMap` will simply not have an entry for it, which is fine since the panel has no submit button.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors (the new union member is additive and doesn't break exhaustiveness checks since the routing uses `Record` lookup, not switch).

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/chat/chat-context.tsx
git commit -m "feat: add strategy-breakdown to WorkflowType union"
```

---

### Task 2: Create `getStrategyBreakdown` Tool

**Files:**
- Create: `apps/platform/src/lib/ai/strategy-tools.ts`

- [ ] **Step 1: Create the strategy tools file with `getStrategyBreakdown`**

Create `apps/platform/src/lib/ai/strategy-tools.ts`:

```typescript
/**
 * Strategy Breakdown AI tools
 * Enables conversational strategy breakdown and brief generation via Compass
 */

import { z } from "zod";
import { tool } from "ai";
import { connectDB } from "@ascenta/db";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { Foundation } from "@ascenta/db/foundation-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { Goal } from "@ascenta/db/goal-schema";
import {
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
} from "./workflow-constants";

// ---------------------------------------------------------------------------
// getStrategyBreakdown — fetch all strategy context for the AI
// ---------------------------------------------------------------------------

export const getStrategyBreakdownTool = tool({
  description:
    "Fetch company and department strategy goals, foundation (mission/vision/values), and user context to enable a conversational strategy breakdown. Call this first when the user wants to understand company or department strategy.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee to contextualize the breakdown for"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    includePersonalGoals: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to also fetch the user's personal goals from Grow for alignment context"),
  }),
  execute: async (params) => {
    await connectDB();

    // Fetch employee details
    const employee = await Employee.findOne({ employeeId: params.employeeId }).lean();
    if (!employee) {
      return {
        success: false,
        message: `Could not find employee with ID ${params.employeeId}.`,
      };
    }

    const department = (employee as Record<string, unknown>).department as string;
    const jobTitle = (employee as Record<string, unknown>).jobTitle as string;

    // Determine if manager (has direct reports)
    const directReportCount = await Employee.countDocuments({ managerId: (employee as Record<string, unknown>)._id });
    const isManager = directReportCount > 0;

    // Fetch foundation (published MVV)
    const foundation = await Foundation.findOne({ status: "published" }).lean();

    // Fetch company-wide strategy goals (non-archived)
    const companyGoals = await StrategyGoal.find({
      scope: "company",
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1, createdAt: -1 })
      .lean();

    // Fetch department strategy goals
    const departmentGoals = await StrategyGoal.find({
      scope: "department",
      department,
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1, createdAt: -1 })
      .lean();

    // Optionally fetch personal goals
    let personalGoals: unknown[] = [];
    if (params.includePersonalGoals) {
      personalGoals = await Goal.find({
        owner: (employee as Record<string, unknown>)._id,
        status: { $ne: "completed" },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    return {
      success: true,
      employee: {
        name: params.employeeName,
        employeeId: params.employeeId,
        department,
        jobTitle,
        isManager,
        directReportCount,
      },
      foundation: foundation
        ? {
            mission: (foundation as Record<string, unknown>).mission,
            vision: (foundation as Record<string, unknown>).vision,
            values: (foundation as Record<string, unknown>).values,
          }
        : null,
      companyGoals: (companyGoals as Record<string, unknown>[]).map((g) => ({
        title: g.title,
        description: g.description,
        horizon: g.horizon,
        status: g.status,
        successMetrics: g.successMetrics,
        timePeriod: g.timePeriod,
      })),
      departmentGoals: (departmentGoals as Record<string, unknown>[]).map((g) => ({
        title: g.title,
        description: g.description,
        horizon: g.horizon,
        status: g.status,
        successMetrics: g.successMetrics,
        timePeriod: g.timePeriod,
      })),
      personalGoals: (personalGoals as Record<string, unknown>[]).map((g) => ({
        title: g.title,
        description: g.description,
        category: g.category,
        status: g.status,
        alignment: g.alignment,
      })),
      message: `Retrieved strategy context for ${params.employeeName} (${department}). ${companyGoals.length} company goals, ${departmentGoals.length} department goals.`,
    };
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/strategy-tools.ts
git commit -m "feat: add getStrategyBreakdown tool for fetching strategy context"
```

---

### Task 3: Add `generateStrategyBrief` Tool

**Files:**
- Modify: `apps/platform/src/lib/ai/strategy-tools.ts`

- [ ] **Step 1: Add the `generateStrategyBrief` tool**

Append to the end of `apps/platform/src/lib/ai/strategy-tools.ts`:

```typescript
// ---------------------------------------------------------------------------
// generateStrategyBrief — generate a downloadable strategy brief document
// ---------------------------------------------------------------------------

export const generateStrategyBriefTool = tool({
  description:
    "Generate a strategy brief document and open it in the working document panel. Call this when the user wants a downloadable summary of the strategy breakdown. You must synthesize the content — do not just repeat raw goal data.",
  inputSchema: z.object({
    employeeName: z.string().describe("Employee name for the document header"),
    department: z.string().describe("Department name for the document header"),
    companySummary: z
      .string()
      .describe("AI-written 2-3 sentence summary of company mission and strategic direction"),
    companyGoals: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          horizon: z.string(),
          status: z.string(),
        }),
      )
      .describe("Company strategy goals to include in the brief"),
    departmentGoals: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          horizon: z.string(),
          status: z.string(),
        }),
      )
      .describe("Department strategy goals to include in the brief"),
    relevance: z
      .string()
      .describe(
        "AI-written 'What This Means For You' narrative — 3-5 sentences contextualizing strategy to this person's role and department",
      ),
  }),
  execute: async (params) => {
    const sections = {
      companySummary: params.companySummary,
      companyGoals: params.companyGoals,
      departmentGoals: params.departmentGoals,
      relevance: params.relevance,
    };

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "strategy-breakdown" as const,
      runId: `strategy-brief-${Date.now()}`,
      employeeId: "",
      employeeName: params.employeeName,
      prefilled: {
        employeeName: params.employeeName,
        department: params.department,
        generatedAt: new Date().toISOString(),
        sections,
      },
    };

    return {
      success: true,
      message: `I've generated your strategy brief. You can review it in the panel and download it as a PDF.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/strategy-tools.ts
git commit -m "feat: add generateStrategyBrief tool for document generation"
```

---

### Task 4: Create the `StrategyBriefPanel` Component

**Files:**
- Create: `apps/platform/src/components/strategy/strategy-brief-panel.tsx`

- [ ] **Step 1: Create the strategy brief panel**

Create `apps/platform/src/components/strategy/strategy-brief-panel.tsx`:

```typescript
"use client";

import { useRef } from "react";
import { Download, X, Building2, Users, Sparkles } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { cn } from "@ascenta/ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyGoalSection {
  title: string;
  description: string;
  horizon: string;
  status: string;
}

interface BriefSections {
  companySummary: string;
  companyGoals: StrategyGoalSection[];
  departmentGoals: StrategyGoalSection[];
  relevance: string;
}

interface StrategyBriefPanelProps {
  initialValues: Record<string, unknown>;
  onCancel: () => void;
  accentColor?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HORIZON_LABELS: Record<string, string> = {
  long_term: "Long-term (3-5 years)",
  medium_term: "Medium-term (1-2 years)",
  short_term: "Short-term (this quarter - 6 months)",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-400",
  on_track: "bg-emerald-500",
  needs_attention: "bg-amber-500",
  off_track: "bg-red-500",
  completed: "bg-gray-400",
};

function groupByHorizon(goals: StrategyGoalSection[]) {
  const groups: Record<string, StrategyGoalSection[]> = {};
  for (const goal of goals) {
    const key = goal.horizon;
    if (!groups[key]) groups[key] = [];
    groups[key].push(goal);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StrategyBriefPanel({ initialValues, onCancel, accentColor = "#6688bb" }: StrategyBriefPanelProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const employeeName = initialValues.employeeName as string;
  const department = initialValues.department as string;
  const generatedAt = initialValues.generatedAt as string;
  const sections = initialValues.sections as BriefSections;

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Strategy Brief - ${employeeName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #0c1e3d; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          h2 { font-size: 18px; margin-top: 32px; margin-bottom: 12px; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; }
          h3 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
          .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
          .goal { margin-bottom: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; }
          .goal-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .goal-desc { font-size: 13px; color: #555; }
          .status { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
          .relevance { background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; line-height: 1.6; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const companyByHorizon = groupByHorizon(sections?.companyGoals ?? []);
  const deptByHorizon = groupByHorizon(sections?.departmentGoals ?? []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
          <span className="text-sm font-semibold">Strategy Brief</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download PDF
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div ref={printRef}>
          {/* Document header */}
          <h1 className="text-lg font-bold" style={{ color: "#0c1e3d" }}>
            Strategy Brief
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {employeeName} &middot; {department} &middot; {formattedDate}
          </p>

          {/* Company Strategy */}
          <h2
            className="mb-3 flex items-center gap-2 border-b pb-1 text-sm font-semibold"
            style={{ borderColor: accentColor }}
          >
            <Building2 className="h-4 w-4" style={{ color: accentColor }} />
            Company Strategy
          </h2>
          {sections?.companySummary && (
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {sections.companySummary}
            </p>
          )}
          {Object.entries(companyByHorizon).map(([horizon, goals]) => (
            <div key={horizon} className="mb-4">
              <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                {HORIZON_LABELS[horizon] ?? horizon}
              </h3>
              {goals.map((goal, i) => (
                <div key={i} className="mb-2 rounded-md border p-3">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-2 w-2 rounded-full", STATUS_COLORS[goal.status] ?? "bg-gray-400")} />
                    <span className="text-sm font-medium">{goal.title}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">{goal.description}</p>
                </div>
              ))}
            </div>
          ))}

          {/* Department Strategy */}
          {(sections?.departmentGoals?.length ?? 0) > 0 && (
            <>
              <h2
                className="mb-3 mt-6 flex items-center gap-2 border-b pb-1 text-sm font-semibold"
                style={{ borderColor: accentColor }}
              >
                <Users className="h-4 w-4" style={{ color: accentColor }} />
                {department} Department Strategy
              </h2>
              {Object.entries(deptByHorizon).map(([horizon, goals]) => (
                <div key={horizon} className="mb-4">
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                    {HORIZON_LABELS[horizon] ?? horizon}
                  </h3>
                  {goals.map((goal, i) => (
                    <div key={i} className="mb-2 rounded-md border p-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", STATUS_COLORS[goal.status] ?? "bg-gray-400")} />
                        <span className="text-sm font-medium">{goal.title}</span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{goal.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* What This Means For You */}
          {sections?.relevance && (
            <>
              <h2
                className="mb-3 mt-6 flex items-center gap-2 border-b pb-1 text-sm font-semibold"
                style={{ borderColor: accentColor }}
              >
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                What This Means For You
              </h2>
              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed">
                {sections.relevance}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/strategy/strategy-brief-panel.tsx
git commit -m "feat: add StrategyBriefPanel read-only document component"
```

---

### Task 5: Wire `StrategyBriefPanel` into Working Document Router

**Files:**
- Modify: `apps/platform/src/components/grow/working-document.tsx`

- [ ] **Step 1: Add import and title mapping**

In `apps/platform/src/components/grow/working-document.tsx`, add the import after the existing form imports (after line 10):

```typescript
import { StrategyBriefPanel } from "@/components/strategy/strategy-brief-panel";
```

Add `"strategy-breakdown"` to the `WORKFLOW_TITLES` record (after line 20):

```typescript
const WORKFLOW_TITLES: Record<WorkflowType, string> = {
  "create-goal": "Create Goal",
  "run-check-in": "Run Check-in",
  "add-performance-note": "Performance Note",
  "build-mvv": "Mission, Vision & Values",
  "strategy-breakdown": "Strategy Brief",
};
```

- [ ] **Step 2: Add the StrategyBriefPanel route**

In the same file, find the section where form components are conditionally rendered (the `{workingDocument.workflowType === "build-mvv" && (` block). After that block, add:

```typescript
{workingDocument.workflowType === "strategy-breakdown" && (
  <StrategyBriefPanel
    initialValues={workingDocument.fields}
    onCancel={closeWorkingDocument}
    accentColor={accentColor}
  />
)}
```

Note: `StrategyBriefPanel` does not receive `onFieldChange` or `onSubmit` because it is read-only.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/working-document.tsx
git commit -m "feat: route strategy-breakdown workflowType to StrategyBriefPanel"
```

---

### Task 6: Register Strategy Tools in Chat API Route

**Files:**
- Modify: `apps/platform/src/app/api/chat/route.ts`

- [ ] **Step 1: Add import**

In `apps/platform/src/app/api/chat/route.ts`, add the import alongside the existing tool imports:

```typescript
import { getStrategyBreakdownTool, generateStrategyBriefTool } from "@/lib/ai/strategy-tools";
```

- [ ] **Step 2: Add tools to the `workflowTools` object**

Find the `workflowTools` object and add the two new tools:

```typescript
getStrategyBreakdown: getStrategyBreakdownTool,
generateStrategyBrief: generateStrategyBriefTool,
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/chat/route.ts
git commit -m "feat: register strategy breakdown tools in chat API route"
```

---

### Task 7: Add Tool to Compass Tool Selector

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`
- Modify: `apps/platform/src/components/do-tab-chat.tsx`

- [ ] **Step 1: Add Target import if not present**

In `apps/platform/src/lib/constants/dashboard-nav.ts`, verify `Target` is already imported from `lucide-react` (line 14). It is — no change needed.

- [ ] **Step 2: Add tools array to `PAGE_CONFIG["do"]`**

In `dashboard-nav.ts`, find the `"do"` page config entry (around line 269):

```typescript
"do": {
  title: "Compass",
  description: "Your AI workspace — brainstorm strategy, create goals, run check-ins, and more.",
},
```

Replace it with:

```typescript
"do": {
  title: "Compass",
  description: "Your AI workspace — brainstorm strategy, create goals, run check-ins, and more.",
  tools: [
    {
      key: "getStrategyBreakdown",
      label: "Strategy Breakdown",
      icon: Target,
      promptSuggestions: [
        { label: "Break down company strategy", promptTemplate: "Break down our company strategy for me" },
        { label: "Department alignment", promptTemplate: "How do my department's goals connect to the company strategy?" },
        { label: "What should I focus on", promptTemplate: "What should I focus on based on our current strategy?" },
      ],
    },
  ],
},
```

- [ ] **Step 3: Add `getStrategyBreakdown` to TOOL_KEY_TO_WORKFLOW in do-tab-chat.tsx**

In `apps/platform/src/components/do-tab-chat.tsx`, find the `TOOL_KEY_TO_WORKFLOW` mapping (around line 18):

```typescript
const TOOL_KEY_TO_WORKFLOW: Record<string, WorkflowType> = {
  startGoalCreation: "create-goal",
  startCheckIn: "run-check-in",
  startPerformanceNote: "add-performance-note",
  buildMVV: "build-mvv",
};
```

Add the new entry:

```typescript
const TOOL_KEY_TO_WORKFLOW: Record<string, WorkflowType> = {
  startGoalCreation: "create-goal",
  startCheckIn: "run-check-in",
  startPerformanceNote: "add-performance-note",
  buildMVV: "build-mvv",
  getStrategyBreakdown: "strategy-breakdown",
};
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/constants/dashboard-nav.ts apps/platform/src/components/do-tab-chat.tsx
git commit -m "feat: add Strategy Breakdown tool to Compass tool selector"
```

---

### Task 8: Add Strategy Breakdown Instructions to System Prompt

**Files:**
- Modify: `apps/platform/src/lib/ai/prompts.ts`

- [ ] **Step 1: Add strategy breakdown instructions**

In `apps/platform/src/lib/ai/prompts.ts`, find the section where Grow workflow instructions are defined (the tool-specific guidance). After the existing Grow instructions, add a new section:

```typescript
## Strategy Breakdown

When the user wants to understand company or department strategy:

1. **ALWAYS call getStrategyBreakdown first** — never make up or guess strategy goals. Use the real data from Strategy Studio.
2. Use getEmployeeInfo first if you need to look up the employee.
3. **Tailor to role:**
   - **Individual contributors:** Explain what the company is focused on, what their department is prioritizing, and how their day-to-day work connects to these priorities.
   - **Managers:** Explain company strategy, department goals, and how their team's collective work maps to these objectives.
4. **Be conversational, not a data dump.** Don't just list goals — explain the story: what the organization is trying to achieve and why it matters.
5. **Include foundation context** (mission/vision/values) when it adds meaning, but don't force it into every response.
6. **After the breakdown, offer to generate a strategy brief:** "Would you like me to put this together as a strategy brief you can download?" Do NOT auto-generate the brief.
7. When the user confirms, call generateStrategyBrief with:
   - A synthesized companySummary (not a copy-paste of the mission statement)
   - The company and department goals from the data
   - A relevance narrative written specifically for this person's role and department
8. If the user asks to revise the brief, call generateStrategyBrief again with updated content.
```

The exact location depends on how `prompts.ts` structures its sections — append this to the system prompt string where tool-specific guidance lives.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/prompts.ts
git commit -m "feat: add strategy breakdown instructions to system prompt"
```

---

### Task 9: Manual End-to-End Verification

- [ ] **Step 1: Ensure strategy seed data exists**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm db:seed-strategy 2>&1 | tail -5`
Expected: Seed script completes, showing strategy goals and foundation seeded. If the script doesn't exist as a package.json script, run: `npx tsx scripts/seed-strategy.ts`

- [ ] **Step 2: Start the dev server**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform`
Expected: Platform starts on port 3051.

- [ ] **Step 3: Verify tool appears in Compass**

Open `http://localhost:3051` and navigate to Compass. Verify:
- "Strategy Breakdown" tool pill appears in the tool selector
- Clicking it shows the three prompt suggestions
- Selecting a prompt populates the chat input

- [ ] **Step 4: Test the conversation flow**

Select "Break down company strategy for me" and send. Verify:
- AI calls `getStrategyBreakdown` (may need to call `getEmployeeInfo` first depending on context)
- AI responds with a conversational breakdown of company and department strategy
- Strategy goals from seed data are referenced (not hallucinated)

- [ ] **Step 5: Test the brief generation**

Ask the AI to generate a strategy brief. Verify:
- AI calls `generateStrategyBrief`
- Working document panel opens on the right (50/50 split)
- Brief shows: header with name/dept/date, company strategy section with goals grouped by horizon, department section, "What This Means For You" narrative
- Download button works — opens print dialog for PDF

- [ ] **Step 6: Test panel close and revision**

- Close the panel via X button — panel closes, chat remains
- Ask AI to regenerate with a change — panel reopens with updated content

- [ ] **Step 7: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix: adjustments from manual testing of strategy breakdown tool"
```
