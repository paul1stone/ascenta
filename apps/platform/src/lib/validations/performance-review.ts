import { z } from "zod";
import { REVIEW_STATUSES, REVIEW_STEPS } from "@ascenta/db/performance-review-constants";
import {
  REVIEW_CATEGORY_KEYS,
  REVIEW_TYPES,
  SELF_ASSESSMENT_STATUSES,
  MANAGER_ASSESSMENT_STATUSES,
  DEVELOPMENT_PLAN_STATUSES,
} from "@ascenta/db/performance-review-categories";

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
  status: z.enum(SELF_ASSESSMENT_STATUSES).optional(),
  sections: z.array(categorySectionSchema).optional(),
});

const managerAssessmentUpdateSchema = z.object({
  status: z.enum(MANAGER_ASSESSMENT_STATUSES).optional(),
  blockedUntilSelfSubmitted: z.boolean().optional(),
  sections: z.array(categorySectionSchema).optional(),
});

const developmentPlanUpdateSchema = z.object({
  status: z.enum(DEVELOPMENT_PLAN_STATUSES).optional(),
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
  employeeResponse: z
    .object({
      text: z.string().optional(),
    })
    .optional(),
});

export type CreateReviewValues = z.infer<typeof createReviewSchema>;
export type UpdateReviewValues = z.infer<typeof updateReviewSchema>;
