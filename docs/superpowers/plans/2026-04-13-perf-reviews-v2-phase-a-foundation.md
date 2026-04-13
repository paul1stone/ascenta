# Performance Reviews v2 — Phase A: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the performance review data layer to support the structured two-party model (employee self-assessment + manager assessment with hard gate), 10 review categories with ratings, ReviewCycle entity for HR-configured periods, and development plan subdocument.

**Architecture:** Additive-only schema changes on `PerformanceReview` (two new embedded subdocuments: `selfAssessment` + `managerAssessment`, each holding `CategorySection[]`). New `ReviewCycle` collection for HR-managed periods. Status machine logic extracted into a pure function module (`review-transitions.ts`) tested in isolation — the same pattern used by check-in transitions. API guard enforces the self-assessment hard gate at PATCH time.

**Tech Stack:** Next.js App Router, Mongoose, Zod, Vitest

---

## File Map

**Create:**
- `packages/db/src/performance-review-categories.ts` — 10 review category definitions + 5-point rating scale + v2 status/type enums (client-safe, no mongoose)
- `packages/db/src/review-cycle-schema.ts` — ReviewCycle Mongoose schema + model
- `apps/platform/src/lib/validations/review-cycle.ts` — Zod schemas for ReviewCycle API inputs
- `apps/platform/src/lib/review-transitions.ts` — Pure status machine: determines the correct `PerformanceReview.status` given current state
- `apps/platform/src/tests/review-transitions.test.ts` — Vitest tests for the status machine
- `apps/platform/src/app/api/grow/review-cycles/route.ts` — GET list + POST create
- `apps/platform/src/app/api/grow/review-cycles/[id]/route.ts` — GET single + PATCH update

**Modify:**
- `packages/db/src/performance-review-constants.ts` — Add v2 status values
- `packages/db/src/performance-review-schema.ts` — Add `selfAssessment`, `managerAssessment`, `developmentPlan`, `reviewCycleId`, `reviewType` fields
- `packages/db/package.json` — Add exports for `./performance-review-categories` and `./review-cycle-schema`
- `packages/db/src/index.ts` — Export `ReviewCycle` model
- `apps/platform/src/lib/validations/performance-review.ts` — Extend `updateReviewSchema` with v2 fields
- `apps/platform/src/app/api/grow/reviews/[id]/route.ts` — Add self-assessment gate + status auto-advance

---

### Task 1: Expand constants and add categories file

**Files:**
- Modify: `packages/db/src/performance-review-constants.ts`
- Create: `packages/db/src/performance-review-categories.ts`

- [ ] **Step 1: Expand performance-review-constants.ts with v2 statuses**

Replace the full file content:

```typescript
// packages/db/src/performance-review-constants.ts

/**
 * Performance Review Constants
 * Shared between client and server — no mongoose dependency.
 */

export const REVIEW_STATUSES = [
  "not_started",
  "in_progress",        // v1 legacy — kept for backward compat
  "self_in_progress",   // v2: employee has started self-assessment
  "self_submitted",     // v2: employee submitted, manager now unlocked
  "manager_in_progress", // v2: manager has started assessment
  "draft_complete",
  "finalized",
  "acknowledged",       // v2: employee acknowledged final review
  "shared",             // v1 legacy — kept for backward compat
] as const;

export const REVIEW_STATUS_LABELS: Record<
  (typeof REVIEW_STATUSES)[number],
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  self_in_progress: "Self-Assessment In Progress",
  self_submitted: "Self-Assessment Submitted",
  manager_in_progress: "Manager Assessment In Progress",
  draft_complete: "Draft Complete",
  finalized: "Finalized",
  acknowledged: "Acknowledged",
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

- [ ] **Step 2: Create performance-review-categories.ts**

```typescript
// packages/db/src/performance-review-categories.ts

/**
 * Performance Review Categories, Rating Scale, and V2 Enums
 * Client-safe — no mongoose dependency.
 * Source: docs/reqs/perf-reviews.md
 */

export const REVIEW_CATEGORY_KEYS = [
  "job_knowledge",
  "quality_of_work",
  "productivity",
  "communication",
  "collaboration",
  "initiative",
  "professionalism",
  "leadership",
  "learning_development",
  "culture_values",
] as const;

export type ReviewCategoryKey = (typeof REVIEW_CATEGORY_KEYS)[number];

export interface ReviewCategory {
  key: ReviewCategoryKey;
  label: string;
  definition: string;
  subcategories: string[];
  competencies: string[];
  guidedPrompts: string[];
}

export const REVIEW_CATEGORIES: Record<ReviewCategoryKey, ReviewCategory> = {
  job_knowledge: {
    key: "job_knowledge",
    label: "Job Knowledge and Technical Competence",
    definition:
      "Ability to perform the role effectively using relevant skills, systems, and professional expertise.",
    subcategories: [
      "Technical skills related to the job",
      "Industry knowledge and best practices",
      "Understanding of tools/systems/technology",
      "Application of professional expertise",
      "Accuracy of work product",
    ],
    competencies: [
      "Demonstrates strong understanding of job responsibilities",
      "Maintains knowledge of relevant tools, systems, and processes",
      "Applies technical skills effectively in daily work",
      "Maintains awareness of industry standards or best practices",
      "Uses technology and systems effectively",
    ],
    guidedPrompts: [
      "Does the employee understand the role and responsibilities?",
      "Do they use required tools correctly?",
      "Do they apply expertise to solve problems?",
    ],
  },
  quality_of_work: {
    key: "quality_of_work",
    label: "Quality of Work",
    definition:
      "Produces accurate, thorough, and reliable work that meets organizational standards.",
    subcategories: [
      "Accuracy and attention to detail",
      "Thoroughness and completeness",
      "Work standards and consistency",
      "Error prevention",
    ],
    competencies: [
      "Accuracy and attention to detail",
      "Completeness and reliability of work",
      "Consistency of performance",
      "Adherence to professional standards",
      "Minimizes errors and rework",
    ],
    guidedPrompts: [
      "Does the employee produce dependable work?",
      "Do they maintain quality standards?",
      "Do they complete tasks correctly the first time?",
    ],
  },
  productivity: {
    key: "productivity",
    label: "Productivity and Time Management",
    definition:
      "Manages workload effectively and completes responsibilities in a timely manner.",
    subcategories: [
      "Work output",
      "Meeting deadlines",
      "Work prioritization",
      "Efficiency and workflow management",
      "Time management",
    ],
    competencies: [
      "Meets deadlines and commitments",
      "Prioritizes work effectively",
      "Maintains appropriate work pace",
      "Demonstrates efficient use of time",
      "Manages workload independently",
    ],
    guidedPrompts: [
      "Does the employee complete work within expected timeframes?",
      "Do they manage competing priorities?",
      "Do they use time productively?",
    ],
  },
  communication: {
    key: "communication",
    label: "Communication",
    definition:
      "Communicates information clearly, professionally, and effectively with others.",
    subcategories: [
      "Verbal communication",
      "Written communication",
      "Listening skills",
      "Clarity of messaging",
      "Responsiveness",
    ],
    competencies: [
      "Communicates clearly and respectfully",
      "Demonstrates strong listening skills",
      "Shares relevant information with stakeholders",
      "Writes professional and effective communications",
      "Responds appropriately and timely",
    ],
    guidedPrompts: [
      "Does the employee communicate clearly?",
      "Do they provide timely updates?",
      "Do they maintain professional communication?",
    ],
  },
  collaboration: {
    key: "collaboration",
    label: "Collaboration and Interpersonal Effectiveness",
    definition:
      "Works effectively with others and contributes positively to team success.",
    subcategories: [
      "Team collaboration",
      "Respect and professionalism",
      "Relationship building",
      "Conflict resolution",
      "Stakeholder engagement",
    ],
    competencies: [
      "Demonstrates respect for colleagues",
      "Contributes to team goals",
      "Builds positive working relationships",
      "Supports collaboration across teams",
      "Resolves disagreements professionally",
    ],
    guidedPrompts: [
      "Does the employee contribute positively to the team?",
      "Do they support coworkers?",
      "Do they collaborate effectively?",
    ],
  },
  initiative: {
    key: "initiative",
    label: "Initiative and Problem Solving",
    definition:
      "Demonstrates ownership of work and proactively addresses challenges.",
    subcategories: [
      "Initiative and ownership",
      "Problem identification",
      "Decision making",
      "Continuous improvement",
      "Creativity and innovation",
    ],
    competencies: [
      "Takes initiative to address challenges",
      "Identifies opportunities for improvement",
      "Uses sound judgment in decision making",
      "Demonstrates critical thinking",
      "Suggests innovative solutions",
    ],
    guidedPrompts: [
      "Does the employee solve problems independently?",
      "Do they contribute ideas?",
      "Do they take ownership of outcomes?",
    ],
  },
  professionalism: {
    key: "professionalism",
    label: "Professionalism and Accountability",
    definition:
      "Demonstrates reliability, integrity, and adherence to organizational standards.",
    subcategories: [
      "Reliability and dependability",
      "Attendance and punctuality",
      "Ethical conduct",
      "Compliance with policies",
      "Responsibility for results",
    ],
    competencies: [
      "Demonstrates dependability and reliability",
      "Maintains punctuality and attendance",
      "Accepts responsibility for outcomes",
      "Follows policies and procedures",
      "Demonstrates ethical behavior",
    ],
    guidedPrompts: [
      "Does the employee behave professionally?",
      "Do they follow policies?",
      "Do they take accountability for work?",
    ],
  },
  leadership: {
    key: "leadership",
    label: "Leadership and Influence",
    definition:
      "Demonstrates behaviors that positively influence others and contribute to organizational success.",
    subcategories: [
      "Leadership potential",
      "Mentoring and coaching others",
      "Influencing positive outcomes",
      "Decision making",
      "Strategic thinking",
    ],
    competencies: [
      "Demonstrates leadership behaviors",
      "Supports and mentors colleagues",
      "Encourages collaboration and engagement",
      "Demonstrates confidence in decision making",
      "Positively influences team culture",
    ],
    guidedPrompts: [
      "Does the employee demonstrate leadership potential?",
      "Do they support the growth of others?",
      "Do they positively influence the team?",
    ],
  },
  learning_development: {
    key: "learning_development",
    label: "Learning and Development",
    definition:
      "Demonstrates commitment to continuous improvement and professional growth.",
    subcategories: [
      "Skill development",
      "Training completion",
      "Professional certifications",
      "Learning new responsibilities",
      "Career development effort",
    ],
    competencies: [
      "Participates in training or development opportunities",
      "Demonstrates willingness to learn new skills",
      "Applies new knowledge to work",
      "Seeks feedback and coaching",
      "Demonstrates adaptability to change",
    ],
    guidedPrompts: [
      "Does the employee pursue growth opportunities?",
      "Do they learn new skills?",
      "Do they adapt to new expectations?",
    ],
  },
  culture_values: {
    key: "culture_values",
    label: "Culture and Values Alignment",
    definition:
      "Demonstrates behaviors that align with the organization's mission, values, and culture.",
    subcategories: [
      "Integrity",
      "Respect",
      "Accountability",
      "Service orientation",
      "Team support",
    ],
    competencies: [
      "Demonstrates respect and integrity",
      "Treats others fairly and professionally",
      "Supports a positive workplace culture",
      "Demonstrates commitment to organizational values",
      "Contributes positively to the work environment",
    ],
    guidedPrompts: [
      "Does the employee reflect company values in daily work?",
      "Do they contribute positively to the culture?",
    ],
  },
};

export const RATING_SCALE = {
  1: {
    label: "Improvement Needed",
    description:
      "Performance does not consistently meet expectations; requires significant development.",
  },
  2: {
    label: "Developing",
    description:
      "Partially meets expectations; developing toward full competency.",
  },
  3: {
    label: "Meets Expectations",
    description:
      "Consistently meets role expectations; reliable, competent performance.",
  },
  4: {
    label: "Exceeds Expectations",
    description:
      "Regularly exceeds expectations; notable contributions beyond the role.",
  },
  5: {
    label: "Exceptional",
    description:
      "Consistently exceptional; recognized impact beyond immediate role.",
  },
} as const;

export type RatingValue = keyof typeof RATING_SCALE;

export const REVIEW_TYPES = [
  "annual",
  "mid_year",
  "ninety_day",
  "custom",
] as const;

export type ReviewType = (typeof REVIEW_TYPES)[number];

export const CYCLE_STATUSES = ["draft", "open", "closed"] as const;
export type CycleStatus = (typeof CYCLE_STATUSES)[number];

export const SELF_ASSESSMENT_STATUSES = [
  "not_started",
  "in_progress",
  "submitted",
] as const;
export type SelfAssessmentStatus = (typeof SELF_ASSESSMENT_STATUSES)[number];

export const MANAGER_ASSESSMENT_STATUSES = [
  "not_started",
  "in_progress",
  "submitted",
] as const;
export type ManagerAssessmentStatus =
  (typeof MANAGER_ASSESSMENT_STATUSES)[number];

export const DEVELOPMENT_PLAN_STATUSES = [
  "not_started",
  "draft",
  "finalized",
] as const;
export type DevelopmentPlanStatus =
  (typeof DEVELOPMENT_PLAN_STATUSES)[number];
```

- [ ] **Step 3: Verify lint and types pass**

```bash

pnpm -F @ascenta/db exec tsc --noEmit 2>&1 | head -30
pnpm -F @ascenta/db exec eslint src --max-warnings 0 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/performance-review-constants.ts packages/db/src/performance-review-categories.ts
git commit -m "feat(db): add v2 review status constants and 10-category definitions"
```

---

### Task 2: ReviewCycle schema and package exports

**Files:**
- Create: `packages/db/src/review-cycle-schema.ts`
- Modify: `packages/db/package.json`
- Modify: `packages/db/src/index.ts`

- [ ] **Step 1: Create review-cycle-schema.ts**

```typescript
// packages/db/src/review-cycle-schema.ts

import mongoose, { Schema } from "mongoose";
import {
  REVIEW_TYPES,
  CYCLE_STATUSES,
} from "./performance-review-categories";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const reviewCycleSchema = new Schema(
  {
    orgId: { type: String, default: "default", index: true },
    label: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: REVIEW_TYPES,
      default: "custom",
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    selfAssessmentDeadline: { type: Date, default: null },
    managerDeadline: { type: Date, default: null },
    participantEmployeeIds: [
      { type: Schema.Types.ObjectId, ref: "Employee" },
    ],
    status: {
      type: String,
      required: true,
      enum: CYCLE_STATUSES,
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

reviewCycleSchema.index({ orgId: 1, status: 1 });
reviewCycleSchema.index({ type: 1, periodEnd: 1 });

export const ReviewCycle =
  mongoose.models.ReviewCycle ||
  mongoose.model("ReviewCycle", reviewCycleSchema);
```

- [ ] **Step 2: Add package exports in packages/db/package.json**

In the `"exports"` object, add after the `"./performance-review-schema"` line:

```json
"./performance-review-categories": "./src/performance-review-categories.ts",
"./review-cycle-schema": "./src/review-cycle-schema.ts",
```

- [ ] **Step 3: Export ReviewCycle from packages/db/src/index.ts**

Add at the end of `index.ts`:

```typescript
export * from "./review-cycle-schema";
```

- [ ] **Step 4: Verify types pass**

```bash
pnpm -F @ascenta/db exec tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/review-cycle-schema.ts packages/db/package.json packages/db/src/index.ts
git commit -m "feat(db): add ReviewCycle schema and package exports"
```

---

### Task 3: Expand PerformanceReview schema

**Files:**
- Modify: `packages/db/src/performance-review-schema.ts`

- [ ] **Step 1: Add new fields to performanceReviewSchema**

After the `workflowRunId` field and before the closing `},` of the schema definition (line ~142 in the current file), insert:

```typescript
    // V2 — review cycle link and type
    reviewCycleId: {
      type: Schema.Types.ObjectId,
      ref: "ReviewCycle",
      default: null,
    },
    reviewType: {
      type: String,
      enum: ["annual", "mid_year", "ninety_day", "custom"],
      default: "custom",
    },

    // V2 — employee self-assessment (must be submitted before manager can begin)
    selfAssessment: {
      status: {
        type: String,
        enum: ["not_started", "in_progress", "submitted"],
        default: "not_started",
      },
      submittedAt: { type: Date, default: null },
      sections: [
        {
          categoryKey: { type: String, required: true },
          rating: { type: Number, min: 1, max: 5, default: null },
          notes: { type: String, default: "" },
          examples: { type: String, default: "" },
          evidence: [
            {
              type: { type: String, enum: ["goal", "checkin", "note", "other"] },
              refId: { type: String, default: null },
              label: { type: String, default: "" },
            },
          ],
        },
      ],
    },

    // V2 — manager assessment (gated on selfAssessment.status === "submitted")
    managerAssessment: {
      status: {
        type: String,
        enum: ["not_started", "in_progress", "submitted"],
        default: "not_started",
      },
      submittedAt: { type: Date, default: null },
      blockedUntilSelfSubmitted: { type: Boolean, default: true },
      sections: [
        {
          categoryKey: { type: String, required: true },
          rating: { type: Number, min: 1, max: 5, default: null },
          notes: { type: String, default: "" },
          examples: { type: String, default: "" },
          evidence: [
            {
              type: { type: String, enum: ["goal", "checkin", "note", "other"] },
              refId: { type: String, default: null },
              label: { type: String, default: "" },
            },
          ],
        },
      ],
    },

    // V2 — development plan (mandatory in final review)
    developmentPlan: {
      status: {
        type: String,
        enum: ["not_started", "draft", "finalized"],
        default: "not_started",
      },
      areasOfImprovement: [
        {
          area: { type: String, default: "" },
          actions: [{ type: String }],
          timeline: { type: String, default: "" },
          owner: { type: String, default: "" },
        },
      ],
      managerCommitments: [{ type: String }],
      nextReviewDate: { type: Date, default: null },
    },
```

- [ ] **Step 2: Confirm the status enum uses the imported REVIEW_STATUSES constant**

In `packages/db/src/performance-review-schema.ts`, find the `status` field in the schema and confirm it reads:

```typescript
    status: {
      type: String,
      required: true,
      enum: REVIEW_STATUSES,
      default: "in_progress",
      index: true,
    },
```

It must reference `REVIEW_STATUSES` (the imported constant from `"./performance-review-constants"`), not a hardcoded array. After Task 1 expanded `REVIEW_STATUSES`, this field automatically picks up the new values. No edit needed if it already imports the constant.

- [ ] **Step 3: Add two new compound indexes after the existing indexes**

After line `performanceReviewSchema.index({ status: 1, "reviewPeriod.end": 1 });`, add:

```typescript
performanceReviewSchema.index({ reviewCycleId: 1, status: 1 });
performanceReviewSchema.index({ reviewType: 1, "reviewPeriod.end": 1 });
```

- [ ] **Step 4: Verify types and lint**

```bash
pnpm -F @ascenta/db exec tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/performance-review-schema.ts
git commit -m "feat(db): expand PerformanceReview schema with v2 self/manager assessment and development plan fields"
```

---

### Task 4: Status machine logic + tests (TDD)

**Files:**
- Create: `apps/platform/src/lib/review-transitions.ts`
- Create: `apps/platform/src/tests/review-transitions.test.ts`

This follows the same pattern as `lib/check-in/transitions.ts` — pure functions, no DB, fully testable.

- [ ] **Step 1: Write the failing tests first**

Create `apps/platform/src/tests/review-transitions.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  deriveReviewStatus,
  canManagerAssess,
} from "@/lib/review-transitions";

describe("canManagerAssess", () => {
  it("returns false when selfAssessment status is not_started", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "not_started", blockedUntilSelfSubmitted: true })).toBe(false);
  });

  it("returns false when selfAssessment status is in_progress", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "in_progress", blockedUntilSelfSubmitted: true })).toBe(false);
  });

  it("returns true when selfAssessment status is submitted", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "submitted", blockedUntilSelfSubmitted: true })).toBe(true);
  });

  it("returns true when blockedUntilSelfSubmitted is false regardless of self status", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "not_started", blockedUntilSelfSubmitted: false })).toBe(true);
    expect(canManagerAssess({ selfAssessmentStatus: "in_progress", blockedUntilSelfSubmitted: false })).toBe(true);
  });
});

describe("deriveReviewStatus", () => {
  const base = {
    currentStatus: "not_started" as const,
    selfAssessmentStatus: "not_started" as const,
    managerAssessmentStatus: "not_started" as const,
  };

  it("advances to self_in_progress when self starts", () => {
    expect(
      deriveReviewStatus({ ...base, selfAssessmentStatus: "in_progress" })
    ).toBe("self_in_progress");
  });

  it("advances to self_submitted when self submits", () => {
    expect(
      deriveReviewStatus({ ...base, selfAssessmentStatus: "submitted" })
    ).toBe("self_submitted");
  });

  it("advances to manager_in_progress when manager starts (self already submitted)", () => {
    expect(
      deriveReviewStatus({
        ...base,
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "in_progress",
      })
    ).toBe("manager_in_progress");
  });

  it("advances to draft_complete when manager submits", () => {
    expect(
      deriveReviewStatus({
        ...base,
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "submitted",
      })
    ).toBe("draft_complete");
  });

  it("returns current status unchanged when already finalized", () => {
    expect(
      deriveReviewStatus({
        currentStatus: "finalized",
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "submitted",
      })
    ).toBe("finalized");
  });

  it("returns current status unchanged when already acknowledged", () => {
    expect(
      deriveReviewStatus({
        currentStatus: "acknowledged",
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "submitted",
      })
    ).toBe("acknowledged");
  });

  it("returns not_started when both still not started", () => {
    expect(deriveReviewStatus(base)).toBe("not_started");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash

pnpm -F @ascenta/platform run test 2>&1 | grep -E "FAIL|PASS|review-transitions"
```

Expected: tests fail with "Cannot find module '@/lib/review-transitions'".

- [ ] **Step 3: Implement review-transitions.ts**

Create `apps/platform/src/lib/review-transitions.ts`:

```typescript
// apps/platform/src/lib/review-transitions.ts

import type {
  SelfAssessmentStatus,
  ManagerAssessmentStatus,
} from "@ascenta/db/performance-review-categories";

type ReviewStatus =
  | "not_started"
  | "in_progress"
  | "self_in_progress"
  | "self_submitted"
  | "manager_in_progress"
  | "draft_complete"
  | "finalized"
  | "acknowledged"
  | "shared";

/**
 * Returns true if the manager is allowed to begin their assessment.
 * Gate: self-assessment must be submitted (unless blockedUntilSelfSubmitted is false).
 */
export function canManagerAssess(params: {
  selfAssessmentStatus: SelfAssessmentStatus;
  blockedUntilSelfSubmitted: boolean;
}): boolean {
  if (!params.blockedUntilSelfSubmitted) return true;
  return params.selfAssessmentStatus === "submitted";
}

/**
 * Derives the correct overall PerformanceReview.status from the current
 * subdocument statuses. Terminal statuses (finalized, acknowledged) are
 * not overridden — they are set explicitly by the finalize/acknowledge routes.
 */
export function deriveReviewStatus(params: {
  currentStatus: ReviewStatus;
  selfAssessmentStatus: SelfAssessmentStatus;
  managerAssessmentStatus: ManagerAssessmentStatus;
}): ReviewStatus {
  const { currentStatus, selfAssessmentStatus, managerAssessmentStatus } =
    params;

  // Do not override terminal statuses
  if (
    currentStatus === "finalized" ||
    currentStatus === "acknowledged" ||
    currentStatus === "shared"
  ) {
    return currentStatus;
  }

  if (managerAssessmentStatus === "submitted") return "draft_complete";
  if (managerAssessmentStatus === "in_progress") return "manager_in_progress";
  if (selfAssessmentStatus === "submitted") return "self_submitted";
  if (selfAssessmentStatus === "in_progress") return "self_in_progress";
  return "not_started";
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @ascenta/platform run test 2>&1 | grep -E "FAIL|PASS|review-transitions"
```

Expected: all 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/review-transitions.ts apps/platform/src/tests/review-transitions.test.ts
git commit -m "feat: add review status machine with transition logic and tests"
```

---

### Task 5: Zod validation updates

**Files:**
- Modify: `apps/platform/src/lib/validations/performance-review.ts`
- Create: `apps/platform/src/lib/validations/review-cycle.ts`

- [ ] **Step 1: Update updateReviewSchema with v2 fields**

Replace the full file `apps/platform/src/lib/validations/performance-review.ts`:

```typescript
import { z } from "zod";
import { REVIEW_STATUSES, REVIEW_STEPS } from "@ascenta/db/performance-review-constants";
import { REVIEW_CATEGORY_KEYS, REVIEW_TYPES } from "@ascenta/db/performance-review-categories";

const categorySectionSchema = z.object({
  categoryKey: z.enum(REVIEW_CATEGORY_KEYS),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().optional(),
  examples: z.string().optional(),
  evidence: z.array(
    z.object({
      type: z.enum(["goal", "checkin", "note", "other"]),
      refId: z.string().nullable().optional(),
      label: z.string().optional(),
    })
  ).optional(),
});

const selfAssessmentUpdateSchema = z.object({
  status: z.enum(["not_started", "in_progress", "submitted"]).optional(),
  sections: z.array(categorySectionSchema).optional(),
});

const managerAssessmentUpdateSchema = z.object({
  status: z.enum(["not_started", "in_progress", "submitted"]).optional(),
  blockedUntilSelfSubmitted: z.boolean().optional(),
  sections: z.array(categorySectionSchema).optional(),
});

const developmentPlanUpdateSchema = z.object({
  status: z.enum(["not_started", "draft", "finalized"]).optional(),
  areasOfImprovement: z.array(
    z.object({
      area: z.string(),
      actions: z.array(z.string()),
      timeline: z.string(),
      owner: z.string(),
    })
  ).optional(),
  managerCommitments: z.array(z.string()).optional(),
  nextReviewDate: z.string().nullable().optional(),
});

export const createReviewSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  managerId: z.string().min(1, "Manager ID is required"),
  reviewPeriod: z.enum(["Q1", "Q2", "Q3", "Q4", "H1", "H2", "annual", "custom"]),
  reviewType: z.enum(REVIEW_TYPES).optional(),
  reviewCycleId: z.string().nullable().optional(),
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
  // V1 fields — preserved
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
  // V2 fields
  reviewCycleId: z.string().nullable().optional(),
  reviewType: z.enum(REVIEW_TYPES).optional(),
  selfAssessment: selfAssessmentUpdateSchema.optional(),
  managerAssessment: managerAssessmentUpdateSchema.optional(),
  developmentPlan: developmentPlanUpdateSchema.optional(),
});

export type CreateReviewValues = z.infer<typeof createReviewSchema>;
export type UpdateReviewValues = z.infer<typeof updateReviewSchema>;
```

- [ ] **Step 2: Create review-cycle.ts validation**

Create `apps/platform/src/lib/validations/review-cycle.ts`:

```typescript
import { z } from "zod";
import {
  REVIEW_TYPES,
  CYCLE_STATUSES,
} from "@ascenta/db/performance-review-categories";

export const createCycleSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(REVIEW_TYPES),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  selfAssessmentDeadline: z.string().nullable().optional(),
  managerDeadline: z.string().nullable().optional(),
  participantEmployeeIds: z.array(z.string()).optional(),
});

export const updateCycleSchema = z.object({
  label: z.string().optional(),
  type: z.enum(REVIEW_TYPES).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  selfAssessmentDeadline: z.string().nullable().optional(),
  managerDeadline: z.string().nullable().optional(),
  participantEmployeeIds: z.array(z.string()).optional(),
  status: z.enum(CYCLE_STATUSES).optional(),
});

export type CreateCycleValues = z.infer<typeof createCycleSchema>;
export type UpdateCycleValues = z.infer<typeof updateCycleSchema>;
```

- [ ] **Step 3: Verify types**

```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/validations/performance-review.ts apps/platform/src/lib/validations/review-cycle.ts
git commit -m "feat: extend review validation schemas with v2 self/manager assessment fields"
```

---

### Task 6: ReviewCycle API routes

**Files:**
- Create: `apps/platform/src/app/api/grow/review-cycles/route.ts`
- Create: `apps/platform/src/app/api/grow/review-cycles/[id]/route.ts`

- [ ] **Step 1: Create the list + create route**

Create `apps/platform/src/app/api/grow/review-cycles/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { ReviewCycle } from "@ascenta/db/review-cycle-schema";
import { createCycleSchema } from "@/lib/validations/review-cycle";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const filter: Record<string, unknown> = { orgId: "default" };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const cycles = await ReviewCycle.find(filter)
      .sort({ periodEnd: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      cycles: cycles.map((c) => ({ ...c, id: String(c._id) })),
    });
  } catch (error) {
    console.error("Error fetching review cycles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review cycles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = createCycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { periodStart, periodEnd, selfAssessmentDeadline, managerDeadline, participantEmployeeIds, ...rest } = parsed.data;

    const cycle = await ReviewCycle.create({
      ...rest,
      orgId: "default",
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      selfAssessmentDeadline: selfAssessmentDeadline
        ? new Date(selfAssessmentDeadline)
        : null,
      managerDeadline: managerDeadline ? new Date(managerDeadline) : null,
      participantEmployeeIds: participantEmployeeIds ?? [],
    });

    return NextResponse.json({ success: true, cycle }, { status: 201 });
  } catch (error) {
    console.error("Error creating review cycle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review cycle" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Create the single-cycle route**

Create `apps/platform/src/app/api/grow/review-cycles/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { ReviewCycle } from "@ascenta/db/review-cycle-schema";
import { updateCycleSchema } from "@/lib/validations/review-cycle";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cycle = await ReviewCycle.findById(id).lean() as any;
    if (!cycle) {
      return NextResponse.json(
        { success: false, error: "Review cycle not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      cycle: { ...cycle, id: String(cycle._id) },
    });
  } catch (error) {
    console.error("Error fetching review cycle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review cycle" },
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

    const parsed = updateCycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const cycle = await ReviewCycle.findById(id);
    if (!cycle) {
      return NextResponse.json(
        { success: false, error: "Review cycle not found" },
        { status: 404 },
      );
    }

    const data = parsed.data;
    const updateOps: Record<string, unknown> = {};

    if (data.label !== undefined) updateOps.label = data.label;
    if (data.type !== undefined) updateOps.type = data.type;
    if (data.status !== undefined) updateOps.status = data.status;
    if (data.periodStart !== undefined)
      updateOps.periodStart = new Date(data.periodStart);
    if (data.periodEnd !== undefined)
      updateOps.periodEnd = new Date(data.periodEnd);
    if (data.selfAssessmentDeadline !== undefined)
      updateOps.selfAssessmentDeadline = data.selfAssessmentDeadline
        ? new Date(data.selfAssessmentDeadline)
        : null;
    if (data.managerDeadline !== undefined)
      updateOps.managerDeadline = data.managerDeadline
        ? new Date(data.managerDeadline)
        : null;
    if (data.participantEmployeeIds !== undefined)
      updateOps.participantEmployeeIds = data.participantEmployeeIds;

    await ReviewCycle.findByIdAndUpdate(id, { $set: updateOps });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating review cycle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review cycle" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Verify types**

```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/grow/review-cycles/
git commit -m "feat(api): add review-cycles GET/POST list and GET/PATCH single routes"
```

---

### Task 7: PATCH /reviews/[id] — self-assessment gate + auto-advance

**Files:**
- Modify: `apps/platform/src/app/api/grow/reviews/[id]/route.ts`

- [ ] **Step 1: Add the gate and auto-advance logic to PATCH handler**

Replace the full file `apps/platform/src/app/api/grow/reviews/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { updateReviewSchema } from "@/lib/validations/performance-review";
import { canManagerAssess, deriveReviewStatus } from "@/lib/review-transitions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const review = await PerformanceReview.findById(id).lean() as any;
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

    // V2 gate: block manager assessment updates until self-assessment is submitted
    if (data.managerAssessment) {
      const selfStatus = review.selfAssessment?.status ?? "not_started";
      const blocked = review.managerAssessment?.blockedUntilSelfSubmitted ?? true;
      if (
        !canManagerAssess({
          selfAssessmentStatus: selfStatus as "not_started" | "in_progress" | "submitted",
          blockedUntilSelfSubmitted: blocked,
        })
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Self-assessment must be submitted before manager assessment can begin.",
          },
          { status: 403 },
        );
      }
    }

    // Build $set update ops
    const updateOps: Record<string, unknown> = {};

    // V1 fields
    if (data.status) updateOps.status = data.status;
    if (data.currentStep) updateOps.currentStep = data.currentStep;
    if (data.goalHandoffCompleted !== undefined) {
      updateOps.goalHandoffCompleted = data.goalHandoffCompleted;
    }
    if (data.contributions) {
      for (const [key, value] of Object.entries(data.contributions)) {
        if (value !== undefined) updateOps[`contributions.${key}`] = value;
      }
    }
    if (data.draft) {
      for (const [key, value] of Object.entries(data.draft)) {
        if (value !== undefined) updateOps[`draft.${key}`] = value;
      }
    }
    if (data.finalDocument) {
      for (const [key, value] of Object.entries(data.finalDocument)) {
        if (value !== undefined) {
          if (key === "managerSignoff" && typeof value === "object") {
            for (const [sk, sv] of Object.entries(
              value as Record<string, unknown>,
            )) {
              if (sv !== undefined)
                updateOps[`finalDocument.managerSignoff.${sk}`] = sv;
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

    // V2 fields
    if (data.reviewCycleId !== undefined)
      updateOps.reviewCycleId = data.reviewCycleId;
    if (data.reviewType !== undefined) updateOps.reviewType = data.reviewType;

    // Self-assessment sections patch
    if (data.selfAssessment?.sections !== undefined) {
      updateOps["selfAssessment.sections"] = data.selfAssessment.sections;
    }
    if (data.selfAssessment?.status !== undefined) {
      updateOps["selfAssessment.status"] = data.selfAssessment.status;
      if (data.selfAssessment.status === "submitted") {
        updateOps["selfAssessment.submittedAt"] = new Date();
      }
    }

    // Manager assessment sections patch
    if (data.managerAssessment?.sections !== undefined) {
      updateOps["managerAssessment.sections"] = data.managerAssessment.sections;
    }
    if (data.managerAssessment?.status !== undefined) {
      updateOps["managerAssessment.status"] = data.managerAssessment.status;
      if (data.managerAssessment.status === "submitted") {
        updateOps["managerAssessment.submittedAt"] = new Date();
      }
    }
    if (data.managerAssessment?.blockedUntilSelfSubmitted !== undefined) {
      updateOps["managerAssessment.blockedUntilSelfSubmitted"] =
        data.managerAssessment.blockedUntilSelfSubmitted;
    }

    // Development plan patch
    if (data.developmentPlan) {
      for (const [key, value] of Object.entries(data.developmentPlan)) {
        if (value !== undefined) {
          if (key === "nextReviewDate" && value) {
            updateOps["developmentPlan.nextReviewDate"] = new Date(value as string);
          } else {
            updateOps[`developmentPlan.${key}`] = value;
          }
        }
      }
    }

    // V2 auto-advance: derive overall status from subdocument statuses
    // (only applies when v2 assessment data is being updated)
    if (data.selfAssessment || data.managerAssessment) {
      const newSelfStatus =
        (data.selfAssessment?.status as "not_started" | "in_progress" | "submitted" | undefined) ??
        (review.selfAssessment?.status as "not_started" | "in_progress" | "submitted") ??
        "not_started";
      const newManagerStatus =
        (data.managerAssessment?.status as "not_started" | "in_progress" | "submitted" | undefined) ??
        (review.managerAssessment?.status as "not_started" | "in_progress" | "submitted") ??
        "not_started";
      const currentStatus = review.status as
        | "not_started"
        | "in_progress"
        | "self_in_progress"
        | "self_submitted"
        | "manager_in_progress"
        | "draft_complete"
        | "finalized"
        | "acknowledged"
        | "shared";

      const derived = deriveReviewStatus({
        currentStatus,
        selfAssessmentStatus: newSelfStatus,
        managerAssessmentStatus: newManagerStatus,
      });

      // Only override status if not explicitly set in the request
      if (!data.status) {
        updateOps.status = derived;
      }
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

- [ ] **Step 2: Run all tests**

```bash
pnpm test 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 3: Run tsc and lint**

```bash
pnpm tsc --noEmit 2>&1 | head -40
pnpm lint 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/app/api/grow/reviews/[id]/route.ts
git commit -m "feat(api): add self-assessment gate and status auto-advance to PATCH /reviews/[id]"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full test suite**

```bash
pnpm test 2>&1 | tail -30
```

Expected: all tests pass, `passWithNoTests: true` for packages with no tests.

- [ ] **Step 2: Run full type check**

```bash
pnpm tsc --noEmit 2>&1
```

Expected: no errors across all packages.

- [ ] **Step 3: Run lint**

```bash
pnpm lint 2>&1
```

Expected: no errors.

- [ ] **Step 4: Verify acceptance criteria from spec**

Manually check each item in the spec's acceptance criteria section:
- `ReviewCycle` model exists with all fields ✓
- `performance-review-categories.ts` exports all 10 categories + rating scale + enums ✓
- `PerformanceReview` schema has all new v2 fields ✓
- Expanded `status` enum retains old values ✓
- `db/package.json` exports `./performance-review-categories` and `./review-cycle-schema` ✓
- `PATCH /api/grow/reviews/[id]` enforces the self-submission gate with 403 ✓
- `PATCH /api/grow/reviews/[id]` auto-advances `status` when assessments are updated ✓
- `GET/POST /api/grow/review-cycles` routes exist ✓
- `GET/PATCH /api/grow/review-cycles/[id]` routes exist ✓

- [ ] **Step 5: Push branch and create PR**

```bash
git push -u origin HEAD
```

Then use `/gh-pr-main` skill to create the PR.
