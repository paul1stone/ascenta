# Performance Reviews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a chat-guided performance review system where managers review employees against strategic goals and company foundation, with AI-drafted review language and PDF export.

**Architecture:** Single `PerformanceReview` Mongoose schema stores the full review lifecycle (pulled context → contributions → AI draft → final document → goal recommendations). Four new AI tools guide the manager through steps via the existing working document pattern. A new Reviews tab shows a status table with per-employee review tracking.

**Tech Stack:** Next.js App Router, Mongoose, Zod, react-hook-form, Vercel AI SDK, existing artifact engine for PDF

---

## File Map

**Create:**
- `packages/db/src/performance-review-schema.ts` — Mongoose schema + model
- `packages/db/src/performance-review-constants.ts` — Client-safe enums (statuses, steps)
- `apps/platform/src/lib/validations/performance-review.ts` — Zod schemas for API validation
- `apps/platform/src/app/api/grow/reviews/route.ts` — GET (list) + POST (create)
- `apps/platform/src/app/api/grow/reviews/[id]/route.ts` — GET (single) + PATCH (update)
- `apps/platform/src/app/api/grow/reviews/[id]/pdf/route.ts` — PDF generation
- `apps/platform/src/components/grow/reviews-panel.tsx` — Reviews tab UI
- `apps/platform/src/components/grow/forms/performance-review-form.tsx` — Multi-phase working document form

**Modify:**
- `packages/db/package.json` — Add exports for new schema + constants
- `apps/platform/src/lib/ai/grow-tools.ts` — Add 4 new AI tools
- `apps/platform/src/lib/chat/chat-context.tsx` — Add `"performance-review"` to WorkflowType, route map, and submit logic
- `apps/platform/src/components/grow/working-document.tsx` — Add performance-review branch
- `apps/platform/src/lib/constants/dashboard-nav.ts` — Add startPerformanceReview tool to Grow tools

---

### Task 1: Schema, Constants, and DB Package Exports

**Files:**
- Create: `packages/db/src/performance-review-constants.ts`
- Create: `packages/db/src/performance-review-schema.ts`
- Modify: `packages/db/package.json`

- [ ] **Step 1: Create performance-review-constants.ts**

```typescript
// packages/db/src/performance-review-constants.ts

/**
 * Performance Review Constants
 * Shared between client and server — no mongoose dependency.
 */

export const REVIEW_STATUSES = [
  "not_started",
  "in_progress",
  "draft_complete",
  "finalized",
  "shared",
] as const;

export const REVIEW_STATUS_LABELS: Record<
  (typeof REVIEW_STATUSES)[number],
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  draft_complete: "Draft Complete",
  finalized: "Finalized",
  shared: "Shared",
};

export const REVIEW_STEPS = [
  "contributions",
  "draft",
  "finalize",
  "goals",
] as const;

export const REVIEW_STEP_LABELS: Record<
  (typeof REVIEW_STEPS)[number],
  string
> = {
  contributions: "Contributions",
  draft: "Draft",
  finalize: "Finalize",
  goals: "Goals",
};
```

- [ ] **Step 2: Create performance-review-schema.ts**

```typescript
// packages/db/src/performance-review-schema.ts

import mongoose, { Schema } from "mongoose";
export {
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  REVIEW_STEPS,
  REVIEW_STEP_LABELS,
} from "./performance-review-constants";
import { REVIEW_STATUSES, REVIEW_STEPS } from "./performance-review-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const performanceReviewSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    reviewPeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      label: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: REVIEW_STATUSES,
      default: "in_progress",
      index: true,
    },
    currentStep: {
      type: String,
      required: true,
      enum: REVIEW_STEPS,
      default: "contributions",
    },

    // Step 1 — pulled context
    alignedGoals: [
      {
        goalId: { type: Schema.Types.ObjectId, ref: "Goal" },
        title: String,
        category: String,
        status: String,
        alignment: String,
        successMetric: String,
      },
    ],
    checkInSummaries: [
      {
        checkInId: { type: Schema.Types.ObjectId, ref: "CheckIn" },
        completedAt: Date,
        managerNotes: String,
        employeeNotes: String,
      },
    ],
    performanceNotes: [
      {
        noteId: { type: Schema.Types.ObjectId, ref: "PerformanceNote" },
        type: String,
        observation: String,
        createdAt: Date,
      },
    ],
    foundation: {
      mission: { type: String, default: "" },
      values: { type: String, default: "" },
    },
    strategyGoals: [
      {
        strategyGoalId: { type: Schema.Types.ObjectId, ref: "StrategyGoal" },
        title: String,
        horizon: String,
      },
    ],

    // Step 2 — manager contributions
    contributions: {
      strategicPriorities: { type: String, default: "" },
      outcomesAchieved: { type: String, default: "" },
      behaviors: { type: String, default: "" },
      additionalContext: { type: String, default: "" },
    },

    // Step 3 — AI draft
    draft: {
      summary: { type: String, default: "" },
      strengthsAndImpact: { type: String, default: "" },
      areasForGrowth: { type: String, default: "" },
      strategicAlignment: { type: String, default: "" },
      overallAssessment: { type: String, default: "" },
    },

    // Step 4 — final document
    finalDocument: {
      summary: { type: String, default: "" },
      strengthsAndImpact: { type: String, default: "" },
      areasForGrowth: { type: String, default: "" },
      strategicAlignment: { type: String, default: "" },
      overallAssessment: { type: String, default: "" },
      managerSignoff: {
        at: { type: Date, default: null },
        name: { type: String, default: "" },
      },
    },

    // Step 5 — goal recommendations
    goalRecommendations: [
      {
        title: String,
        description: String,
        category: String,
        alignment: String,
        rationale: String,
      },
    ],
    goalHandoffCompleted: { type: Boolean, default: false },

    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

performanceReviewSchema.index({ employee: 1, "reviewPeriod.end": 1 });
performanceReviewSchema.index({ manager: 1, status: 1 });
performanceReviewSchema.index({ status: 1, "reviewPeriod.end": 1 });

export const PerformanceReview =
  mongoose.models.PerformanceReview ||
  mongoose.model("PerformanceReview", performanceReviewSchema);
```

- [ ] **Step 3: Add exports to packages/db/package.json**

Add these two entries to the `"exports"` object in `packages/db/package.json`:

```json
"./performance-review-constants": "./src/performance-review-constants.ts",
"./performance-review-schema": "./src/performance-review-schema.ts"
```

- [ ] **Step 4: Verify build**

Run: `pnpm build --filter=@ascenta/db`
Expected: Clean build with no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/performance-review-constants.ts packages/db/src/performance-review-schema.ts packages/db/package.json
git commit -m "feat(db): add PerformanceReview schema and constants"
```

---

### Task 2: Zod Validation Schemas

**Files:**
- Create: `apps/platform/src/lib/validations/performance-review.ts`

- [ ] **Step 1: Create Zod validation schemas**

```typescript
// apps/platform/src/lib/validations/performance-review.ts

import { z } from "zod";
import { REVIEW_STATUSES, REVIEW_STEPS } from "@ascenta/db/performance-review-constants";

export const createReviewSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  managerId: z.string().min(1, "Manager ID is required"),
  reviewPeriod: z.enum(["Q1", "Q2", "Q3", "Q4", "H1", "H2", "annual", "custom"]),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.reviewPeriod === "custom") {
      return !!data.customStartDate && !!data.customEndDate;
    }
    return true;
  },
  {
    message: "Custom start and end dates required when period is custom",
    path: ["customStartDate"],
  },
);

export const updateReviewSchema = z.object({
  status: z.enum(REVIEW_STATUSES).optional(),
  currentStep: z.enum(REVIEW_STEPS).optional(),
  contributions: z.object({
    strategicPriorities: z.string().optional(),
    outcomesAchieved: z.string().optional(),
    behaviors: z.string().optional(),
    additionalContext: z.string().optional(),
  }).optional(),
  draft: z.object({
    summary: z.string().optional(),
    strengthsAndImpact: z.string().optional(),
    areasForGrowth: z.string().optional(),
    strategicAlignment: z.string().optional(),
    overallAssessment: z.string().optional(),
  }).optional(),
  finalDocument: z.object({
    summary: z.string().optional(),
    strengthsAndImpact: z.string().optional(),
    areasForGrowth: z.string().optional(),
    strategicAlignment: z.string().optional(),
    overallAssessment: z.string().optional(),
    managerSignoff: z.object({
      at: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
  }).optional(),
  goalRecommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    alignment: z.string(),
    rationale: z.string(),
  })).optional(),
  goalHandoffCompleted: z.boolean().optional(),
});

export type CreateReviewValues = z.infer<typeof createReviewSchema>;
export type UpdateReviewValues = z.infer<typeof updateReviewSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/lib/validations/performance-review.ts
git commit -m "feat: add Zod validation schemas for performance reviews"
```

---

### Task 3: API Routes — List and Create

**Files:**
- Create: `apps/platform/src/app/api/grow/reviews/route.ts`

- [ ] **Step 1: Create the reviews list + create route**

```typescript
// apps/platform/src/app/api/grow/reviews/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { createReviewSchema } from "@/lib/validations/performance-review";
import { parseTimePeriod } from "@/lib/ai/grow-tools";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    const periodLabel = searchParams.get("period");

    if (!managerId) {
      return NextResponse.json(
        { success: false, error: "managerId is required" },
        { status: 400 },
      );
    }

    // Find manager by employeeId string
    const manager = await Employee.findOne({ employeeId: managerId }).lean();
    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 },
      );
    }

    // Discover direct reports via goals (same pattern as /api/grow/status)
    const managedGoals = await Goal.find({ manager: manager._id }).lean();
    const directReportIds = [
      ...new Set(managedGoals.map((g) => String(g.owner))),
    ];

    // Get employee details
    const directReports = await Employee.find({
      _id: { $in: directReportIds },
    }).lean();

    // Get existing reviews for this manager
    const reviewFilter: Record<string, unknown> = { manager: manager._id };
    if (periodLabel) {
      reviewFilter["reviewPeriod.label"] = periodLabel;
    }
    const reviews = await PerformanceReview.find(reviewFilter)
      .sort({ "reviewPeriod.end": -1 })
      .lean();

    // Build review map by employee ID
    const reviewMap = new Map<string, (typeof reviews)[0]>();
    for (const review of reviews) {
      const key = `${String(review.employee)}-${review.reviewPeriod.label}`;
      reviewMap.set(key, review);
    }

    // Count goals per employee in the period
    const goalCountMap = new Map<string, number>();
    for (const goal of managedGoals) {
      const ownerId = String(goal.owner);
      goalCountMap.set(ownerId, (goalCountMap.get(ownerId) || 0) + 1);
    }

    // Build response: one entry per direct report
    const reviewEntries = directReports.map((emp) => {
      const empId = String(emp._id);
      const key = periodLabel ? `${empId}-${periodLabel}` : null;
      const review = key ? reviewMap.get(key) : null;

      return {
        employeeId: emp.employeeId,
        employeeObjectId: empId,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        goalCount: goalCountMap.get(empId) || 0,
        status: review ? review.status : "not_started",
        currentStep: review ? review.currentStep : null,
        reviewId: review ? String(review._id) : null,
      };
    });

    // Aggregates
    const aggregates = {
      directReports: directReports.length,
      notStarted: reviewEntries.filter((r) => r.status === "not_started").length,
      inProgress: reviewEntries.filter((r) =>
        ["in_progress", "draft_complete"].includes(r.status),
      ).length,
      finalized: reviewEntries.filter((r) =>
        ["finalized", "shared"].includes(r.status),
      ).length,
    };

    return NextResponse.json({
      success: true,
      reviews: reviewEntries,
      aggregates,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Look up employee
    const employee = await Employee.findOne({
      employeeId: data.employeeId,
    }).lean();
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    // Look up manager
    const manager = await Employee.findOne({
      employeeId: data.managerId,
    }).lean();
    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 },
      );
    }

    // Parse period
    const timePeriod = parseTimePeriod(
      data.reviewPeriod,
      data.customStartDate,
      data.customEndDate,
    );

    // Check for existing review
    const existing = await PerformanceReview.findOne({
      employee: employee._id,
      manager: manager._id,
      "reviewPeriod.label": data.reviewPeriod,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A review already exists for this employee and period" },
        { status: 409 },
      );
    }

    const review = await PerformanceReview.create({
      employee: employee._id,
      manager: manager._id,
      reviewPeriod: {
        start: timePeriod.start,
        end: timePeriod.end,
        label: data.reviewPeriod,
      },
      status: "in_progress",
      currentStep: "contributions",
    });

    return NextResponse.json({
      success: true,
      reviewId: String(review._id),
      message: `Performance review created for ${data.employeeName}`,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify the route compiles**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Clean build (or only unrelated warnings).

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/api/grow/reviews/route.ts
git commit -m "feat(api): add GET/POST routes for performance reviews"
```

---

### Task 4: API Routes — Single Review and Update

**Files:**
- Create: `apps/platform/src/app/api/grow/reviews/[id]/route.ts`

- [ ] **Step 1: Create the single review GET + PATCH route**

```typescript
// apps/platform/src/app/api/grow/reviews/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { updateReviewSchema } from "@/lib/validations/performance-review";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const review = await PerformanceReview.findById(id).lean();
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        id: String(review._id),
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const review = await PerformanceReview.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    // Apply updates using $set for nested fields
    const updateOps: Record<string, unknown> = {};

    if (data.status) updateOps.status = data.status;
    if (data.currentStep) updateOps.currentStep = data.currentStep;
    if (data.goalHandoffCompleted !== undefined) {
      updateOps.goalHandoffCompleted = data.goalHandoffCompleted;
    }

    if (data.contributions) {
      for (const [key, value] of Object.entries(data.contributions)) {
        if (value !== undefined) {
          updateOps[`contributions.${key}`] = value;
        }
      }
    }

    if (data.draft) {
      for (const [key, value] of Object.entries(data.draft)) {
        if (value !== undefined) {
          updateOps[`draft.${key}`] = value;
        }
      }
    }

    if (data.finalDocument) {
      for (const [key, value] of Object.entries(data.finalDocument)) {
        if (value !== undefined) {
          if (key === "managerSignoff" && typeof value === "object") {
            for (const [sk, sv] of Object.entries(value as Record<string, unknown>)) {
              if (sv !== undefined) {
                updateOps[`finalDocument.managerSignoff.${sk}`] = sv;
              }
            }
          } else {
            updateOps[`finalDocument.${key}`] = value;
          }
        }
      }
    }

    if (data.goalRecommendations) {
      updateOps.goalRecommendations = data.goalRecommendations;
    }

    await PerformanceReview.findByIdAndUpdate(id, { $set: updateOps });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/app/api/grow/reviews/\[id\]/route.ts
git commit -m "feat(api): add GET/PATCH routes for single performance review"
```

---

### Task 5: PDF Generation Route

**Files:**
- Create: `apps/platform/src/app/api/grow/reviews/[id]/pdf/route.ts`

- [ ] **Step 1: Create PDF generation route**

This route uses `renderArtifactAsHtml()` from the existing artifact engine to produce styled HTML, then returns it as a downloadable HTML file (which the manager can print-to-PDF from the browser). This avoids adding a PDF library dependency for v1.

```typescript
// apps/platform/src/app/api/grow/reviews/[id]/pdf/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { Employee } from "@ascenta/db/employee-schema";
import {
  renderArtifactAsHtml,
  formatDate,
} from "@/lib/workflows/artifacts";
import type { ArtifactTemplateDefinition } from "@/lib/workflows/types";

const REVIEW_TEMPLATE: ArtifactTemplateDefinition = {
  id: "performance-review",
  name: "Performance Review",
  type: "report",
  exportFormats: ["pdf"],
  sections: [
    {
      key: "header",
      title: "Performance Review",
      locked: true,
      content: "",
    },
    {
      key: "summary",
      title: "Summary",
      locked: false,
    },
    {
      key: "strengthsAndImpact",
      title: "Strengths & Impact",
      locked: false,
    },
    {
      key: "areasForGrowth",
      title: "Areas for Growth",
      locked: false,
    },
    {
      key: "strategicAlignment",
      title: "Strategic Alignment",
      locked: false,
    },
    {
      key: "overallAssessment",
      title: "Overall Assessment",
      locked: false,
    },
    {
      key: "signoff",
      title: "Manager Signoff",
      locked: true,
      content: "",
    },
  ],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const review = await PerformanceReview.findById(id).lean();
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    if (review.status !== "finalized" && review.status !== "shared") {
      return NextResponse.json(
        { success: false, error: "Review must be finalized before generating PDF" },
        { status: 400 },
      );
    }

    const employee = await Employee.findById(review.employee).lean();
    const employeeName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : "Unknown Employee";

    const final = review.finalDocument;

    // Build sections map for artifact renderer
    const sections: Record<string, string> = {
      header: [
        `**Employee:** ${employeeName}`,
        `**Department:** ${employee?.department ?? "N/A"}`,
        `**Review Period:** ${review.reviewPeriod.label} (${formatDate(review.reviewPeriod.start)} — ${formatDate(review.reviewPeriod.end)})`,
        `**Date:** ${formatDate(new Date())}`,
      ].join("\n\n"),
      summary: final.summary || "",
      strengthsAndImpact: final.strengthsAndImpact || "",
      areasForGrowth: final.areasForGrowth || "",
      strategicAlignment: final.strategicAlignment || "",
      overallAssessment: final.overallAssessment || "",
      signoff: [
        `**Manager:** ${final.managerSignoff?.name || "N/A"}`,
        `**Date:** ${final.managerSignoff?.at ? formatDate(final.managerSignoff.at) : "N/A"}`,
      ].join("\n\n"),
    };

    const html = renderArtifactAsHtml(REVIEW_TEMPLATE, sections);

    // Wrap in a printable HTML document
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Performance Review — ${employeeName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    .artifact-document { border: 1px solid #e0e0e0; padding: 40px; border-radius: 8px; }
    .section-title { font-size: 18px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; color: #0c1e3d; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; }
    .section-content { font-size: 14px; }
    .section-content p { margin: 8px 0; }
    .section-content ul, .section-content ol { margin: 8px 0; padding-left: 24px; }
    .artifact-section.locked { background: #f8fafc; padding: 12px 16px; border-radius: 6px; margin: 16px 0; }
    @media print { body { margin: 0; } .artifact-document { border: none; padding: 0; } }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="performance-review-${employeeName.replace(/\s+/g, "-").toLowerCase()}-${review.reviewPeriod.label}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating review PDF:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate review document" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/app/api/grow/reviews/\[id\]/pdf/route.ts
git commit -m "feat(api): add PDF generation route for performance reviews"
```

---

### Task 6: AI Tools — startPerformanceReview

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`

This is the first and most complex AI tool. It creates the review record, pulls all context data, pre-fills contributions, and returns a working document block.

- [ ] **Step 1: Add imports and the startPerformanceReview tool**

Add these imports at the top of `grow-tools.ts` (alongside existing imports):

```typescript
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
```

Then add the tool definition (add after the existing `completeGrowWorkflowTool` or at the end of the tools section):

```typescript
export const startPerformanceReviewTool = tool({
  description:
    "Start a performance review for an employee. Pulls their goals, check-ins, performance notes, and company foundation data for the review period. Opens a working document with the contributions form.",
  parameters: z.object({
    employeeName: z.string().describe("Full name of the employee being reviewed"),
    employeeId: z.string().describe("Employee ID (e.g., EMP1001)"),
    reviewPeriod: z
      .enum(["Q1", "Q2", "Q3", "Q4", "H1", "H2", "annual", "custom"])
      .describe("The review period"),
    customStartDate: z.string().optional().describe("Custom start date (ISO string) if reviewPeriod is 'custom'"),
    customEndDate: z.string().optional().describe("Custom end date (ISO string) if reviewPeriod is 'custom'"),
  }),
  execute: async (params) => {
    await connectDB();

    const employee = await getEmployeeByEmployeeId(params.employeeId);
    if (!employee) {
      return { success: false, error: `Employee ${params.employeeName} (${params.employeeId}) not found.` };
    }

    const timePeriod = parseTimePeriod(params.reviewPeriod, params.customStartDate, params.customEndDate);

    // Check for existing review
    const existing = await PerformanceReview.findOne({
      employee: employee._id,
      "reviewPeriod.label": params.reviewPeriod,
      status: { $nin: ["not_started"] },
    });
    if (existing) {
      // Resume existing review
      const review = existing;
      const workingDocPayload = {
        action: "open_working_document" as const,
        workflowType: "performance-review" as const,
        runId: String(review._id),
        employeeId: params.employeeId,
        employeeName: params.employeeName,
        prefilled: {
          reviewId: String(review._id),
          currentStep: review.currentStep,
          reviewPeriodLabel: review.reviewPeriod.label,
          // Pulled context
          alignedGoals: review.alignedGoals,
          checkInSummaries: review.checkInSummaries,
          performanceNotes: review.performanceNotes,
          foundation: review.foundation,
          strategyGoals: review.strategyGoals,
          // Contributions
          strategicPriorities: review.contributions?.strategicPriorities || "",
          outcomesAchieved: review.contributions?.outcomesAchieved || "",
          behaviors: review.contributions?.behaviors || "",
          additionalContext: review.contributions?.additionalContext || "",
          // Draft (if exists)
          draftSummary: review.draft?.summary || "",
          draftStrengthsAndImpact: review.draft?.strengthsAndImpact || "",
          draftAreasForGrowth: review.draft?.areasForGrowth || "",
          draftStrategicAlignment: review.draft?.strategicAlignment || "",
          draftOverallAssessment: review.draft?.overallAssessment || "",
          // Final (if exists)
          finalSummary: review.finalDocument?.summary || "",
          finalStrengthsAndImpact: review.finalDocument?.strengthsAndImpact || "",
          finalAreasForGrowth: review.finalDocument?.areasForGrowth || "",
          finalStrategicAlignment: review.finalDocument?.strategicAlignment || "",
          finalOverallAssessment: review.finalDocument?.overallAssessment || "",
          // Goal recommendations
          goalRecommendations: review.goalRecommendations || [],
        },
      };

      return {
        success: true,
        resumed: true,
        reviewId: String(review._id),
        message: `Resuming performance review for ${params.employeeName} (${params.reviewPeriod}). Currently on step: ${review.currentStep}.`,
        workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
      };
    }

    // Pull goals for the period
    const goals = await Goal.find({
      owner: employee._id,
      "timePeriod.start": { $lte: timePeriod.end },
      "timePeriod.end": { $gte: timePeriod.start },
    }).lean();

    const alignedGoals = goals.map((g) => ({
      goalId: g._id,
      title: g.title,
      category: g.category,
      status: g.status,
      alignment: g.alignment || "mission",
      successMetric: g.successMetric,
    }));

    // Pull check-ins linked to these goals
    const goalIds = goals.map((g) => g._id);
    const checkIns = await CheckIn.find({
      goals: { $in: goalIds },
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .lean();

    const checkInSummaries = checkIns.map((c) => ({
      checkInId: c._id,
      completedAt: c.completedAt,
      managerNotes: [c.managerProgressObserved, c.managerCoachingNeeded, c.managerRecognition]
        .filter(Boolean)
        .join(" | "),
      employeeNotes: [c.employeeProgress, c.employeeObstacles, c.employeeSupportNeeded]
        .filter(Boolean)
        .join(" | "),
    }));

    // Pull performance notes for the period
    const notes = await PerformanceNote.find({
      employee: employee._id,
      createdAt: { $gte: timePeriod.start, $lte: timePeriod.end },
    })
      .sort({ createdAt: -1 })
      .lean();

    const performanceNotesSummary = notes.map((n) => ({
      noteId: n._id,
      type: n.type,
      observation: n.observation,
      createdAt: n.createdAt,
    }));

    // Pull foundation data
    const foundation = await CompanyFoundation.findOne({ status: "published" }).lean();
    const foundationData = {
      mission: foundation?.mission || "",
      values: foundation?.values || "",
    };

    // Pull strategy goals linked to employee's goals
    const strategyGoalIds = goals
      .map((g) => g.strategyGoalId)
      .filter(Boolean);
    const strategyGoals = strategyGoalIds.length > 0
      ? await StrategyGoal.find({ _id: { $in: strategyGoalIds } }).lean()
      : [];
    const strategyGoalsSummary = strategyGoals.map((sg) => ({
      strategyGoalId: sg._id,
      title: sg.title,
      horizon: sg.horizon,
    }));

    // Pre-fill contributions from goal data
    const outcomesList = goals
      .filter((g) => g.status === "completed")
      .map((g) => `• ${g.title}: ${g.successMetric}`)
      .join("\n");

    const prioritiesList = strategyGoals.length > 0
      ? strategyGoals.map((sg) => `• ${sg.title}`).join("\n")
      : goals
          .map((g) => g.category)
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((c) => `• ${c.replace(/_/g, " ")}`)
          .join("\n");

    // Create the review record
    const review = await PerformanceReview.create({
      employee: employee._id,
      manager: employee._id, // Same as employee for now (no auth)
      reviewPeriod: {
        start: timePeriod.start,
        end: timePeriod.end,
        label: params.reviewPeriod,
      },
      status: "in_progress",
      currentStep: "contributions",
      alignedGoals,
      checkInSummaries,
      performanceNotes: performanceNotesSummary,
      foundation: foundationData,
      strategyGoals: strategyGoalsSummary,
      contributions: {
        strategicPriorities: prioritiesList,
        outcomesAchieved: outcomesList,
        behaviors: "",
        additionalContext: "",
      },
    });

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "performance-review" as const,
      runId: String(review._id),
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      prefilled: {
        reviewId: String(review._id),
        currentStep: "contributions",
        reviewPeriodLabel: params.reviewPeriod,
        alignedGoals,
        checkInSummaries,
        performanceNotes: performanceNotesSummary,
        foundation: foundationData,
        strategyGoals: strategyGoalsSummary,
        strategicPriorities: prioritiesList,
        outcomesAchieved: outcomesList,
        behaviors: "",
        additionalContext: "",
      },
    };

    return {
      success: true,
      reviewId: String(review._id),
      message: `Performance review started for ${params.employeeName} (${params.reviewPeriod}). Pulled ${goals.length} goals, ${checkIns.length} check-ins, and ${notes.length} performance notes. ${strategyGoals.length > 0 ? `Employee's goals align to ${strategyGoals.length} strategy goal(s).` : ""} ${foundation ? "Company foundation data loaded." : "No published foundation data found — review will proceed without pillar framing."} I've pre-filled strategic priorities and outcomes from the data. Please review and add your observations on behaviors and any additional context.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
```

- [ ] **Step 2: Verify the tool compiles**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts
git commit -m "feat(ai): add startPerformanceReview tool"
```

---

### Task 7: AI Tools — generateReviewDraft, finalizeReview, recommendNextGoals

**Files:**
- Modify: `apps/platform/src/lib/ai/grow-tools.ts`

- [ ] **Step 1: Add generateReviewDraft tool**

Add after `startPerformanceReviewTool`:

```typescript
export const generateReviewDraftTool = tool({
  description:
    "Generate an AI-drafted performance review from the employee's data and manager contributions. Call this after the manager has completed the contributions step.",
  parameters: z.object({
    reviewId: z.string().describe("The performance review ID"),
  }),
  execute: async (params) => {
    await connectDB();

    const review = await PerformanceReview.findById(params.reviewId);
    if (!review) {
      return { success: false, error: "Review not found." };
    }

    // Build context for AI generation
    const goalsContext = review.alignedGoals
      .map((g: { title: string; status: string; category: string; successMetric: string; alignment: string }) =>
        `- ${g.title} (${g.status}): ${g.successMetric} [${g.category}, aligns to ${g.alignment}]`,
      )
      .join("\n");

    const checkInsContext = review.checkInSummaries
      .map((c: { managerNotes: string; employeeNotes: string }) =>
        `- Manager: ${c.managerNotes || "N/A"} | Employee: ${c.employeeNotes || "N/A"}`,
      )
      .join("\n");

    const notesContext = review.performanceNotes
      .map((n: { type: string; observation: string }) => `- [${n.type}] ${n.observation}`)
      .join("\n");

    const foundationContext = review.foundation?.mission
      ? `Company Mission: ${review.foundation.mission}\nCompany Values: ${review.foundation.values}`
      : "";

    const strategyContext = review.strategyGoals?.length
      ? `Strategy Goals: ${review.strategyGoals.map((sg: { title: string }) => sg.title).join(", ")}`
      : "";

    const contributions = review.contributions;

    const prompt = `You are writing a performance review for an employee. Use the data below to generate each section. Frame language around the company's strategic pillars and values where available.

## Employee Data
Goals:
${goalsContext || "No goals recorded."}

Check-in Highlights:
${checkInsContext || "No check-ins recorded."}

Performance Notes:
${notesContext || "No performance notes recorded."}

${foundationContext}
${strategyContext}

## Manager's Contributions
Strategic Priorities Supported: ${contributions?.strategicPriorities || "Not provided"}
Outcomes Achieved: ${contributions?.outcomesAchieved || "Not provided"}
Behaviors: ${contributions?.behaviors || "Not provided"}
Additional Context: ${contributions?.additionalContext || "Not provided"}

## Instructions
Generate exactly five sections. Each section should be 2-4 paragraphs. Use specific details from the data — do not generalize. If company values/mission are available, explicitly tie the employee's contributions to them.

Sections:
1. SUMMARY — Brief overview of the employee's performance in this period
2. STRENGTHS_AND_IMPACT — What went well, tied to strategic pillars and values
3. AREAS_FOR_GROWTH — Development opportunities with specific, actionable suggestions
4. STRATEGIC_ALIGNMENT — How the employee's work connected to company direction
5. OVERALL_ASSESSMENT — Closing assessment

Format your response as JSON:
{"summary":"...","strengthsAndImpact":"...","areasForGrowth":"...","strategicAlignment":"...","overallAssessment":"..."}`;

    try {
      const { streamText: aiStreamText } = await import("ai");
      const { getModel } = await import("@/lib/ai/providers");
      const { AI_CONFIG } = await import("@/lib/ai/config");

      const result = await aiStreamText({
        model: getModel(AI_CONFIG.defaultModels.anthropic),
        prompt,
      });

      let content = "";
      for await (const chunk of result.textStream) {
        content += chunk;
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { success: false, error: "Failed to parse AI-generated draft." };
      }

      const draft = JSON.parse(jsonMatch[0]);

      // Save to review
      await PerformanceReview.findByIdAndUpdate(params.reviewId, {
        $set: {
          "draft.summary": draft.summary || "",
          "draft.strengthsAndImpact": draft.strengthsAndImpact || "",
          "draft.areasForGrowth": draft.areasForGrowth || "",
          "draft.strategicAlignment": draft.strategicAlignment || "",
          "draft.overallAssessment": draft.overallAssessment || "",
          status: "draft_complete",
          currentStep: "draft",
        },
      });

      const workingDocPayload = {
        action: "update_working_document" as const,
        updates: {
          currentStep: "draft",
          draftSummary: draft.summary || "",
          draftStrengthsAndImpact: draft.strengthsAndImpact || "",
          draftAreasForGrowth: draft.areasForGrowth || "",
          draftStrategicAlignment: draft.strategicAlignment || "",
          draftOverallAssessment: draft.overallAssessment || "",
        },
      };

      return {
        success: true,
        message: "Draft review generated. The review covers strengths and impact, areas for growth, strategic alignment, and an overall assessment. Please review the draft — you can ask me to adjust any section, or proceed to finalize.",
        workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
      };
    } catch (error) {
      console.error("Error generating review draft:", error);
      return { success: false, error: "Failed to generate review draft." };
    }
  },
});
```

- [ ] **Step 2: Add finalizeReview tool**

```typescript
export const finalizeReviewTool = tool({
  description:
    "Finalize a performance review. Copies the draft (with any manager edits) to the final document and records manager signoff.",
  parameters: z.object({
    reviewId: z.string().describe("The performance review ID"),
    managerName: z.string().describe("Name of the manager finalizing the review"),
    summary: z.string().optional().describe("Edited summary (if changed from draft)"),
    strengthsAndImpact: z.string().optional().describe("Edited strengths (if changed from draft)"),
    areasForGrowth: z.string().optional().describe("Edited areas for growth (if changed from draft)"),
    strategicAlignment: z.string().optional().describe("Edited strategic alignment (if changed from draft)"),
    overallAssessment: z.string().optional().describe("Edited overall assessment (if changed from draft)"),
  }),
  execute: async (params) => {
    await connectDB();

    const review = await PerformanceReview.findById(params.reviewId);
    if (!review) {
      return { success: false, error: "Review not found." };
    }

    if (!review.draft?.summary) {
      return { success: false, error: "No draft exists yet. Generate a draft first." };
    }

    // Use edited versions if provided, otherwise fall back to draft
    const finalDoc = {
      summary: params.summary || review.draft.summary,
      strengthsAndImpact: params.strengthsAndImpact || review.draft.strengthsAndImpact,
      areasForGrowth: params.areasForGrowth || review.draft.areasForGrowth,
      strategicAlignment: params.strategicAlignment || review.draft.strategicAlignment,
      overallAssessment: params.overallAssessment || review.draft.overallAssessment,
      managerSignoff: {
        at: new Date(),
        name: params.managerName,
      },
    };

    await PerformanceReview.findByIdAndUpdate(params.reviewId, {
      $set: {
        finalDocument: finalDoc,
        status: "finalized",
        currentStep: "finalize",
      },
    });

    const workingDocPayload = {
      action: "update_working_document" as const,
      updates: {
        currentStep: "finalize",
        finalSummary: finalDoc.summary,
        finalStrengthsAndImpact: finalDoc.strengthsAndImpact,
        finalAreasForGrowth: finalDoc.areasForGrowth,
        finalStrategicAlignment: finalDoc.strategicAlignment,
        finalOverallAssessment: finalDoc.overallAssessment,
      },
    };

    return {
      success: true,
      message: `Review finalized for the employee. You can download it as a PDF from the Reviews tab. Would you like me to suggest next-period goals based on this review?`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
```

- [ ] **Step 3: Add recommendNextGoals tool**

```typescript
export const recommendNextGoalsTool = tool({
  description:
    "Generate next-period goal recommendations based on a finalized performance review and current company strategy. Call this after finalizing the review.",
  parameters: z.object({
    reviewId: z.string().describe("The performance review ID"),
  }),
  execute: async (params) => {
    await connectDB();

    const review = await PerformanceReview.findById(params.reviewId);
    if (!review) {
      return { success: false, error: "Review not found." };
    }

    if (review.status !== "finalized") {
      return { success: false, error: "Review must be finalized before generating goal recommendations." };
    }

    // Get current foundation (may have changed since review was started)
    const foundation = await CompanyFoundation.findOne({ status: "published" }).lean();

    // Get current strategy goals
    const currentStrategyGoals = await StrategyGoal.find({
      status: { $in: ["draft", "on_track", "needs_attention"] },
    }).lean();

    const finalDoc = review.finalDocument;
    const prompt = `Based on this performance review, recommend 2-4 goals for the next period. Each goal should address gaps identified in the review or align with evolving company strategy.

## Review Summary
${finalDoc?.summary || "N/A"}

## Areas for Growth
${finalDoc?.areasForGrowth || "N/A"}

## Strategic Alignment
${finalDoc?.strategicAlignment || "N/A"}

## Company Foundation
Mission: ${foundation?.mission || "N/A"}
Values: ${foundation?.values || "N/A"}

## Current Strategy Goals
${currentStrategyGoals.map((sg) => `- ${sg.title} (${sg.horizon}): ${sg.description}`).join("\n") || "None defined"}

## Previous Goals
${review.alignedGoals?.map((g: { title: string; status: string }) => `- ${g.title} (${g.status})`).join("\n") || "None"}

## Instructions
Generate 2-4 goal recommendations. Each goal should:
- Have a clear, specific title
- Include a brief description (1-2 sentences)
- Map to a goal category (one of: productivity, quality, accuracy, efficiency, operational_excellence, customer_impact, communication, collaboration, conflict_resolution, decision_making, initiative, skill_development, certification, training_completion, leadership_growth, career_advancement)
- Specify an alignment type (mission, value, or priority)
- Include a rationale explaining why this goal matters now (1-2 sentences referencing the review or strategy)

Format as JSON array:
[{"title":"...","description":"...","category":"...","alignment":"...","rationale":"..."}]`;

    try {
      const { streamText: aiStreamText } = await import("ai");
      const { getModel } = await import("@/lib/ai/providers");
      const { AI_CONFIG } = await import("@/lib/ai/config");

      const result = await aiStreamText({
        model: getModel(AI_CONFIG.defaultModels.anthropic),
        prompt,
      });

      let content = "";
      for await (const chunk of result.textStream) {
        content += chunk;
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { success: false, error: "Failed to parse goal recommendations." };
      }

      const recommendations = JSON.parse(jsonMatch[0]);

      await PerformanceReview.findByIdAndUpdate(params.reviewId, {
        $set: {
          goalRecommendations: recommendations,
          currentStep: "goals",
        },
      });

      const workingDocPayload = {
        action: "update_working_document" as const,
        updates: {
          currentStep: "goals",
          goalRecommendations: recommendations,
        },
      };

      return {
        success: true,
        message: `Here are ${recommendations.length} goal recommendations for the next period based on the review and current strategy. You can create any of these goals now, or save them for later.`,
        workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
      };
    } catch (error) {
      console.error("Error generating goal recommendations:", error);
      return { success: false, error: "Failed to generate goal recommendations." };
    }
  },
});
```

- [ ] **Step 4: Register the new tools in the tools object**

Find where the existing grow tools are exported/registered (the object that maps tool names to tool definitions). Add the four new tools:

```typescript
startPerformanceReview: startPerformanceReviewTool,
generateReviewDraft: generateReviewDraftTool,
finalizeReview: finalizeReviewTool,
recommendNextGoals: recommendNextGoalsTool,
```

- [ ] **Step 5: Verify build**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/lib/ai/grow-tools.ts
git commit -m "feat(ai): add generateReviewDraft, finalizeReview, and recommendNextGoals tools"
```

---

### Task 8: Chat Context Integration

**Files:**
- Modify: `apps/platform/src/lib/chat/chat-context.tsx`

- [ ] **Step 1: Add "performance-review" to WorkflowType**

In `chat-context.tsx`, find the `WorkflowType` type definition (line ~28):

```typescript
// Before:
export type WorkflowType = "create-goal" | "run-check-in" | "add-performance-note" | "build-mvv" | "strategy-breakdown";

// After:
export type WorkflowType = "create-goal" | "run-check-in" | "add-performance-note" | "build-mvv" | "strategy-breakdown" | "performance-review";
```

- [ ] **Step 2: Update the submitWorkingDocument route map**

Find the `routeMap` inside `submitWorkingDocument` (around line ~164). The performance review working document does NOT submit through the standard POST route — it uses PATCH updates at each step. So we do NOT add it to the route map. Instead, the performance review form will handle its own submission logic via direct fetch calls to `/api/grow/reviews/[id]`.

This means `submitWorkingDocument` will throw for `"performance-review"` with the "read-only" error, which is correct — the review form manages its own multi-step submissions.

No code change needed here. The existing fallback (`"Workflow type is read-only and cannot be submitted"`) handles this correctly.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/chat/chat-context.tsx
git commit -m "feat: add performance-review to WorkflowType union"
```

---

### Task 9: Working Document Integration

**Files:**
- Modify: `apps/platform/src/components/grow/working-document.tsx`

- [ ] **Step 1: Import the PerformanceReviewForm**

Add this import at the top of `working-document.tsx`:

```typescript
import { PerformanceReviewForm } from "./forms/performance-review-form";
```

- [ ] **Step 2: Add to WORKFLOW_TITLES**

Find the `WORKFLOW_TITLES` Record and add:

```typescript
"performance-review": "Performance Review",
```

- [ ] **Step 3: Add the form branch**

Find where the component branches on `workflowType` (the if-chain that renders different forms). Add a new branch:

```typescript
if (workingDocument.workflowType === "performance-review") {
  formContent = (
    <PerformanceReviewForm
      initialValues={workingDocument.fields}
      onFieldChange={handleFieldChange}
      onCancel={handleCancel}
      reviewId={workingDocument.runId ?? ""}
      employeeId={workingDocument.employeeId ?? ""}
      employeeName={workingDocument.employeeName ?? ""}
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/working-document.tsx
git commit -m "feat: integrate performance review form into working document"
```

---

### Task 10: Performance Review Form Component

**Files:**
- Create: `apps/platform/src/components/grow/forms/performance-review-form.tsx`

This is the multi-phase working document form. It adapts per step: contributions → draft preview → edit & finalize → goal recommendations.

- [ ] **Step 1: Create the form component**

```typescript
// apps/platform/src/components/grow/forms/performance-review-form.tsx

"use client";

import { useState, useCallback } from "react";
import { Button } from "@ascenta/ui/components/button";
import { Textarea } from "@ascenta/ui/components/textarea";
import { Label } from "@ascenta/ui/components/label";
import {
  REVIEW_STEP_LABELS,
} from "@ascenta/db/performance-review-constants";
import { cn } from "@ascenta/ui";
import { Target, FileText, CheckCircle, Lightbulb, ChevronRight, Download } from "lucide-react";

interface GoalRecommendation {
  title: string;
  description: string;
  category: string;
  alignment: string;
  rationale: string;
}

interface AlignedGoal {
  goalId: string;
  title: string;
  category: string;
  status: string;
  alignment: string;
  successMetric: string;
}

interface PerformanceReviewFormProps {
  initialValues: Record<string, unknown>;
  onFieldChange: (field: string, value: unknown) => void;
  onCancel: () => void;
  reviewId: string;
  employeeId: string;
  employeeName: string;
}

const STEP_ICONS = {
  contributions: FileText,
  draft: Lightbulb,
  finalize: CheckCircle,
  goals: Target,
};

const STEPS = ["contributions", "draft", "finalize", "goals"] as const;

export function PerformanceReviewForm({
  initialValues,
  onFieldChange,
  onCancel,
  reviewId,
  employeeName,
}: PerformanceReviewFormProps) {
  const currentStep = (initialValues.currentStep as string) || "contributions";

  // Contributions fields
  const [strategicPriorities, setStrategicPriorities] = useState(
    (initialValues.strategicPriorities as string) || "",
  );
  const [outcomesAchieved, setOutcomesAchieved] = useState(
    (initialValues.outcomesAchieved as string) || "",
  );
  const [behaviors, setBehaviors] = useState(
    (initialValues.behaviors as string) || "",
  );
  const [additionalContext, setAdditionalContext] = useState(
    (initialValues.additionalContext as string) || "",
  );

  // Draft fields (editable in finalize step)
  const [finalSummary, setFinalSummary] = useState(
    (initialValues.finalSummary as string) || (initialValues.draftSummary as string) || "",
  );
  const [finalStrengths, setFinalStrengths] = useState(
    (initialValues.finalStrengthsAndImpact as string) || (initialValues.draftStrengthsAndImpact as string) || "",
  );
  const [finalGrowth, setFinalGrowth] = useState(
    (initialValues.finalAreasForGrowth as string) || (initialValues.draftAreasForGrowth as string) || "",
  );
  const [finalAlignment, setFinalAlignment] = useState(
    (initialValues.finalStrategicAlignment as string) || (initialValues.draftStrategicAlignment as string) || "",
  );
  const [finalAssessment, setFinalAssessment] = useState(
    (initialValues.finalOverallAssessment as string) || (initialValues.draftOverallAssessment as string) || "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const alignedGoals = (initialValues.alignedGoals as AlignedGoal[]) || [];
  const goalRecommendations = (initialValues.goalRecommendations as GoalRecommendation[]) || [];
  const periodLabel = (initialValues.reviewPeriodLabel as string) || "";

  const handleContributionChange = useCallback(
    (field: string, value: string, setter: (v: string) => void) => {
      setter(value);
      onFieldChange(field, value);
    },
    [onFieldChange],
  );

  const handleSaveContributions = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributions: {
            strategicPriorities,
            outcomesAchieved,
            behaviors,
            additionalContext,
          },
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/grow/reviews/${reviewId}/pdf`, "_blank");
  };

  // Determine current step index for the progress indicator
  const currentStepIndex = STEPS.indexOf(currentStep as typeof STEPS[number]);

  return (
    <div className="flex h-full flex-col">
      {/* Step Progress Bar */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          {STEPS.map((step, i) => {
            const Icon = STEP_ICONS[step];
            const isActive = step === currentStep;
            const isComplete = i < currentStepIndex;
            return (
              <div key={step} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="mx-1 h-3 w-3 text-muted-foreground/40" />
                )}
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1",
                    isActive && "bg-primary/10 text-primary font-medium",
                    isComplete && "text-primary/60",
                    !isActive && !isComplete && "text-muted-foreground/50",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{REVIEW_STEP_LABELS[step]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Context Sidebar (always visible in contributions/draft steps) */}
        {(currentStep === "contributions" || currentStep === "draft") &&
          alignedGoals.length > 0 && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {employeeName}&apos;s {periodLabel} Goals
              </h4>
              <div className="space-y-1.5">
                {alignedGoals.map((goal, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div
                      className={cn(
                        "mt-1 h-2 w-2 rounded-full shrink-0",
                        goal.status === "completed" && "bg-blue-500",
                        goal.status === "on_track" && "bg-green-500",
                        goal.status === "needs_attention" && "bg-yellow-500",
                        goal.status === "off_track" && "bg-red-500",
                      )}
                    />
                    <div>
                      <span className="font-medium">{goal.title}</span>
                      <span className="ml-1 text-muted-foreground">
                        ({goal.category.replace(/_/g, " ")})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Step: Contributions */}
        {currentStep === "contributions" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="strategicPriorities" className="text-sm font-medium">
                Strategic Priorities Supported
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Which company priorities or pillars did this employee support?
              </p>
              <Textarea
                id="strategicPriorities"
                value={strategicPriorities}
                onChange={(e) =>
                  handleContributionChange("strategicPriorities", e.target.value, setStrategicPriorities)
                }
                rows={4}
                placeholder="Pre-filled from goal alignment data..."
              />
            </div>

            <div>
              <Label htmlFor="outcomesAchieved" className="text-sm font-medium">
                Outcomes Achieved
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                What measurable outcomes were delivered?
              </p>
              <Textarea
                id="outcomesAchieved"
                value={outcomesAchieved}
                onChange={(e) =>
                  handleContributionChange("outcomesAchieved", e.target.value, setOutcomesAchieved)
                }
                rows={4}
                placeholder="Pre-filled from completed goals..."
              />
            </div>

            <div>
              <Label htmlFor="behaviors" className="text-sm font-medium">
                Behaviors & Collaboration
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Observations on accountability, collaboration, initiative, and other behaviors.
              </p>
              <Textarea
                id="behaviors"
                value={behaviors}
                onChange={(e) =>
                  handleContributionChange("behaviors", e.target.value, setBehaviors)
                }
                rows={4}
                placeholder="Describe observed behaviors..."
              />
            </div>

            <div>
              <Label htmlFor="additionalContext" className="text-sm font-medium">
                Additional Context
              </Label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Anything else you want to include in the review.
              </p>
              <Textarea
                id="additionalContext"
                value={additionalContext}
                onChange={(e) =>
                  handleContributionChange("additionalContext", e.target.value, setAdditionalContext)
                }
                rows={3}
                placeholder="Optional additional context..."
              />
            </div>
          </div>
        )}

        {/* Step: Draft Preview */}
        {currentStep === "draft" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI-generated draft based on {employeeName}&apos;s data and your contributions.
              Ask Compass to adjust any section, or proceed to edit and finalize.
            </p>
            {[
              { label: "Summary", value: initialValues.draftSummary as string },
              { label: "Strengths & Impact", value: initialValues.draftStrengthsAndImpact as string },
              { label: "Areas for Growth", value: initialValues.draftAreasForGrowth as string },
              { label: "Strategic Alignment", value: initialValues.draftStrategicAlignment as string },
              { label: "Overall Assessment", value: initialValues.draftOverallAssessment as string },
            ].map((section) => (
              <div key={section.label} className="rounded-lg border p-3">
                <h4 className="mb-1 text-sm font-semibold">{section.label}</h4>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {section.value || "Not yet generated."}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Step: Finalize (editable) */}
        {currentStep === "finalize" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review finalized. You can download the review as a PDF.
            </p>
            {[
              { label: "Summary", value: finalSummary },
              { label: "Strengths & Impact", value: finalStrengths },
              { label: "Areas for Growth", value: finalGrowth },
              { label: "Strategic Alignment", value: finalAlignment },
              { label: "Overall Assessment", value: finalAssessment },
            ].map((section) => (
              <div key={section.label} className="rounded-lg border p-3">
                <h4 className="mb-1 text-sm font-semibold">{section.label}</h4>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {section.value || "Not yet generated."}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Step: Goal Recommendations */}
        {currentStep === "goals" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Recommended next-period goals based on the review and current strategy.
            </p>
            {goalRecommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">{rec.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {rec.category.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">{rec.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Close
          </Button>

          <div className="flex gap-2">
            {currentStep === "contributions" && (
              <Button
                size="sm"
                onClick={handleSaveContributions}
                disabled={isSubmitting || !behaviors.trim()}
              >
                {isSubmitting ? "Saving..." : "Save & Generate Draft"}
              </Button>
            )}

            {(currentStep === "finalize" || currentStep === "goals") && (
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/forms/performance-review-form.tsx
git commit -m "feat: add multi-phase PerformanceReviewForm component"
```

---

### Task 11: Reviews Panel (Tab UI)

**Files:**
- Create: `apps/platform/src/components/grow/reviews-panel.tsx`

- [ ] **Step 1: Create the reviews panel component**

```typescript
// apps/platform/src/components/grow/reviews-panel.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@ascenta/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/components/select";
import {
  REVIEW_STATUS_LABELS,
  REVIEW_STEP_LABELS,
} from "@ascenta/db/performance-review-constants";
import { cn } from "@ascenta/ui";
import { useChat } from "@/lib/chat/chat-context";
import { AlertCircle, Download, Users, Clock, CheckCircle, FileX } from "lucide-react";

interface ReviewEntry {
  employeeId: string;
  employeeObjectId: string;
  name: string;
  department: string;
  goalCount: number;
  status: string;
  currentStep: string | null;
  reviewId: string | null;
}

interface ReviewAggregates {
  directReports: number;
  notStarted: number;
  inProgress: number;
  finalized: number;
}

interface ReviewsPanelProps {
  managerId: string;
  pageKey: string;
  accentColor: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  not_started: { bg: "bg-orange-500/15", text: "text-orange-500" },
  in_progress: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  draft_complete: { bg: "bg-teal-500/15", text: "text-teal-500" },
  finalized: { bg: "bg-blue-500/15", text: "text-blue-500" },
  shared: { bg: "bg-gray-500/15", text: "text-gray-500" },
};

function getCurrentPeriod(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${quarter}`;
}

function getAvailablePeriods(): string[] {
  return ["Q1", "Q2", "Q3", "Q4", "H1", "H2", "annual"];
}

export function ReviewsPanel({ managerId, pageKey, accentColor }: ReviewsPanelProps) {
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [aggregates, setAggregates] = useState<ReviewAggregates>({
    directReports: 0,
    notStarted: 0,
    inProgress: 0,
    finalized: 0,
  });
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [isLoading, setIsLoading] = useState(true);
  const { sendMessage } = useChat();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/grow/reviews?managerId=${managerId}&period=${period}`,
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAggregates(data.aggregates || aggregates);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [managerId, period]);

  useEffect(() => {
    if (managerId) {
      fetchReviews();
    }
  }, [managerId, fetchReviews]);

  const handleStartReview = (employeeName: string, employeeId: string) => {
    sendMessage(
      pageKey,
      `Start a performance review for ${employeeName} (${employeeId}) for ${period}`,
      "startPerformanceReview",
    );
  };

  const handleContinueReview = (employeeName: string, reviewId: string) => {
    sendMessage(
      pageKey,
      `Continue the performance review for ${employeeName} (review ID: ${reviewId})`,
    );
  };

  const handleDownloadPdf = (reviewId: string) => {
    window.open(`/api/grow/reviews/${reviewId}/pdf`, "_blank");
  };

  const dueWithin2Weeks = aggregates.notStarted > 0;

  return (
    <div className="space-y-4">
      {/* Nudge Banner */}
      {dueWithin2Weeks && (
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-3"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
            borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">
              <strong>{period} reviews:</strong> {aggregates.notStarted} of{" "}
              {aggregates.directReports} direct reports not started
            </span>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailablePeriods().map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Direct Reports", value: aggregates.directReports, icon: Users },
          { label: "Not Started", value: aggregates.notStarted, icon: FileX, highlight: aggregates.notStarted > 0 },
          { label: "In Progress", value: aggregates.inProgress, icon: Clock },
          { label: "Finalized", value: aggregates.finalized, icon: CheckCircle },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <stat.icon className="h-3 w-3" />
              {stat.label}
            </div>
            <div
              className={cn(
                "mt-1 text-2xl font-bold",
                stat.highlight && "text-orange-500",
              )}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Period Selector (when no banner) */}
      {!dueWithin2Weeks && (
        <div className="flex justify-end">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailablePeriods().map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Employee</th>
              <th className="px-3 py-2 text-left font-medium">Department</th>
              <th className="px-3 py-2 text-center font-medium">Goals</th>
              <th className="px-3 py-2 text-center font-medium">Status</th>
              <th className="px-3 py-2 text-center font-medium">Step</th>
              <th className="px-3 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No direct reports found.
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const colors = STATUS_COLORS[review.status] || STATUS_COLORS.not_started;
                return (
                  <tr key={review.employeeId} className="border-b last:border-0">
                    <td className="px-3 py-2.5 font-medium">{review.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {review.department}
                    </td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">
                      {review.goalCount}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                          colors.bg,
                          colors.text,
                        )}
                      >
                        {REVIEW_STATUS_LABELS[review.status as keyof typeof REVIEW_STATUS_LABELS] || review.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                      {review.currentStep
                        ? REVIEW_STEP_LABELS[review.currentStep as keyof typeof REVIEW_STEP_LABELS]
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {review.status === "not_started" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          style={{ color: accentColor }}
                          onClick={() => handleStartReview(review.name, review.employeeId)}
                        >
                          Start Review
                        </Button>
                      )}
                      {(review.status === "in_progress" || review.status === "draft_complete") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          style={{ color: accentColor }}
                          onClick={() => handleContinueReview(review.name, review.reviewId!)}
                        >
                          Continue →
                        </Button>
                      )}
                      {(review.status === "finalized" || review.status === "shared") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleDownloadPdf(review.reviewId!)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          PDF
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/grow/reviews-panel.tsx
git commit -m "feat: add ReviewsPanel component with status table and stats"
```

---

### Task 12: Wire Up Reviews Tab and Navigation

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`
- Modify: the component that renders Grow tabs (wherever the `reviews` tab placeholder currently renders)

- [ ] **Step 1: Add startPerformanceReview to the tools array in dashboard-nav.ts**

Find the `tools` array in the `"grow/performance"` page config and add:

```typescript
{
  key: "startPerformanceReview",
  label: "Start Review",
  icon: ClipboardCheck,
  promptSuggestions: [
    "Start a performance review for [employee name]",
    "Begin Q1 review for my team",
  ],
},
```

Also add `ClipboardCheck` to the lucide-react imports at the top of the file (if not already imported).

- [ ] **Step 2: Wire the reviews tab to render ReviewsPanel**

In `apps/platform/src/app/[category]/[sub]/page.tsx`, the tab rendering is a chain of ternaries (lines 40-86). Currently `"do"` → DoTabChat, `"learn"` → LearnPanel, `"goals"` → GoalsPanel, everything else → "Coming Soon" placeholder. Add `"reviews"` before the fallback.

Add the import at the top:

```typescript
import { ReviewsPanel } from "@/components/grow/reviews-panel";
```

Then add a new branch before the fallback (line 69), changing:

```typescript
      ) : activeTab === "goals" ? (
        <GoalsPanel accentColor={ctx.category.color} />
      ) : (
```

to:

```typescript
      ) : activeTab === "goals" ? (
        <GoalsPanel accentColor={ctx.category.color} />
      ) : activeTab === "reviews" ? (
        <div className="flex-1 overflow-y-auto p-6">
          <ReviewsPanel
            managerId=""
            pageKey={pageKey}
            accentColor={ctx.category.color}
          />
        </div>
      ) : (
```

Note: `managerId` is empty string for now (no auth). The ReviewsPanel will discover direct reports from Goal.manager relationships, same as the existing status dashboard. Once auth is added, pass the logged-in manager's employeeId here.

- [ ] **Step 3: Verify build and test locally**

Run: `pnpm dev --filter=@ascenta/platform`

Navigate to Grow → Performance → Reviews tab. Expected: the reviews panel renders with stats cards (all zeros), period selector, and an empty table (or "No direct reports found" if no goals are seeded for the current user as manager).

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/constants/dashboard-nav.ts
git add -A apps/platform/src/components/grow/ apps/platform/src/app/
git commit -m "feat: wire reviews tab to ReviewsPanel and add tool to nav"
```

---

### Task 13: Register AI Tools in Chat API

**Files:**
- Modify: the file where grow tools are registered with the chat API (likely `apps/platform/src/app/api/chat/route.ts` or wherever tools are assembled for `streamText`)

- [ ] **Step 1: Find where grow tools are imported and passed to streamText**

Search for where `startGoalCreation` or similar grow tools are imported and added to the tools object passed to the AI `streamText` call. Add the four new tools in the same location:

```typescript
import {
  startPerformanceReviewTool,
  generateReviewDraftTool,
  finalizeReviewTool,
  recommendNextGoalsTool,
} from "@/lib/ai/grow-tools";

// In the tools object passed to streamText:
startPerformanceReview: startPerformanceReviewTool,
generateReviewDraft: generateReviewDraftTool,
finalizeReview: finalizeReviewTool,
recommendNextGoals: recommendNextGoalsTool,
```

- [ ] **Step 2: Update system prompt for performance review context**

In `apps/platform/src/lib/ai/prompts.ts` (or wherever the system prompt is built), add guidance for the performance review flow. Find the section that describes Grow tools and add:

```
## Performance Reviews
When a manager asks to start, continue, or create a performance review:
1. Call startPerformanceReview with the employee name, ID, and review period
2. After the manager completes contributions, call generateReviewDraft with the review ID
3. After the manager reviews the draft and is ready to finalize, call finalizeReview with the review ID and any edited sections
4. If the manager wants next-period goal recommendations, call recommendNextGoals with the review ID
5. For goal creation from recommendations, use the existing startGoalCreation tool with pre-filled values

Always explain what data you've pulled and what the pre-filled values are based on. For subjective fields (behaviors, additional context), ask the manager to fill those in.
```

- [ ] **Step 3: Verify build**

Run: `pnpm build --filter=@ascenta/platform`
Expected: Clean build.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/chat/ apps/platform/src/lib/ai/prompts.ts
git commit -m "feat: register performance review tools in chat API and update system prompt"
```

---

### Task 14: End-to-End Smoke Test

**Files:** None (manual testing)

- [ ] **Step 1: Seed test data if needed**

Run: `pnpm db:seed && pnpm db:seed-grow`

This ensures there are employees with goals, check-ins, and performance notes for the review to pull.

- [ ] **Step 2: Start dev server and test the full flow**

Run: `pnpm dev --filter=@ascenta/platform`

Test the following:
1. Navigate to Grow → Performance → Reviews tab
2. Verify the status table shows employees with "Not Started" status
3. Click "Start Review" for an employee
4. Verify Compass starts the review flow and opens the working document with contributions form
5. Fill in behaviors field, tell Compass to generate the draft
6. Verify draft appears in the working document
7. Tell Compass to finalize
8. Verify PDF download works
9. Test goal recommendations (tell Compass "suggest goals")

- [ ] **Step 3: Fix any issues found during testing**

Address any issues discovered. Common things to check:
- Working document opens correctly with pre-filled data
- Step transitions update the form phase
- PDF renders with all sections
- Goal recommendation handoff works

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: address smoke test issues for performance reviews"
```

Only create this commit if there were actual fixes. Skip if everything worked on first try.
