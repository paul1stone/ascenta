import { z } from "zod";
import {
  GOAL_CATEGORIES,
  MEASUREMENT_TYPES,
  CHECKIN_CADENCES,
} from "@ascenta/db/goal-constants";

const TIME_PERIODS = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "H1",
  "H2",
  "annual",
  "custom",
] as const;

export const goalFormSchema = z
  .object({
    employeeName: z.string().min(1, "Employee name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    description: z.string().min(1, "Description is required"),
    category: z.enum(GOAL_CATEGORIES, { message: "Goal type is required" }),
    measurementType: z.enum(MEASUREMENT_TYPES, {
      message: "Measurement type is required",
    }),
    successMetric: z.string().min(1, "Success metric is required"),
    timePeriod: z.enum(TIME_PERIODS, { message: "Time period is required" }),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
    checkInCadence: z.enum(CHECKIN_CADENCES, {
      message: "Check-in cadence is required",
    }),
    strategyGoalId: z.string().optional(),
    strategyGoalTitle: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.timePeriod === "custom") {
        return !!data.customStartDate && !!data.customEndDate;
      }
      return true;
    },
    {
      message:
        "Custom start date and end date are required when time period is custom",
      path: ["customStartDate"],
    },
  );

export type GoalFormValues = z.infer<typeof goalFormSchema>;
