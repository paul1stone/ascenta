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
