import { z } from "zod";
import {
  STRATEGY_HORIZONS,
  STRATEGY_SCOPES,
  STRATEGY_GOAL_STATUSES,
} from "@ascenta/db/strategy-goal-constants";

const strategyGoalBaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z.string().min(1, "Description is required"),
  horizon: z.enum(STRATEGY_HORIZONS, { message: "Horizon is required" }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  scope: z.enum(STRATEGY_SCOPES, { message: "Scope is required" }),
  department: z.string().optional().default(""),
  successMetrics: z.string().optional().default(""),
  rationale: z.string().optional().default(""),
  status: z.enum(STRATEGY_GOAL_STATUSES).optional().default("draft"),
});

export const strategyGoalFormSchema = strategyGoalBaseSchema.refine(
  (data) => {
    if (data.scope === "department") {
      return data.department.length > 0;
    }
    return true;
  },
  {
    message: "Department is required when scope is department",
    path: ["department"],
  },
);

export const strategyGoalPatchSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    description: z.string().min(1, "Description is required"),
    horizon: z.enum(STRATEGY_HORIZONS, { message: "Horizon is required" }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    scope: z.enum(STRATEGY_SCOPES, { message: "Scope is required" }),
    department: z.string(),
    successMetrics: z.string(),
    rationale: z.string(),
    status: z.enum(STRATEGY_GOAL_STATUSES),
  })
  .partial();

export type StrategyGoalFormValues = z.infer<typeof strategyGoalFormSchema>;
