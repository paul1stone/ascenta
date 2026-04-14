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
