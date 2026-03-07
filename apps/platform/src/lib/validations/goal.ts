import { z } from "zod";
import {
  GOAL_CATEGORIES,
  MEASUREMENT_TYPES,
  CHECKIN_CADENCES,
  ALIGNMENT_TYPES,
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

const CATEGORY_GROUPS = ["performance", "leadership", "development"] as const;

export const goalFormSchema = z
  .object({
    employeeName: z.string().min(1, "Employee name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    description: z.string().min(1, "Description is required"),
    categoryGroup: z.enum(CATEGORY_GROUPS, "Category group is required"),
    category: z.enum(GOAL_CATEGORIES, "Category is required"),
    measurementType: z.enum(MEASUREMENT_TYPES, "Measurement type is required"),
    successMetric: z.string().min(1, "Success metric is required"),
    timePeriod: z.enum(TIME_PERIODS, "Time period is required"),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
    checkInCadence: z.enum(CHECKIN_CADENCES, "Check-in cadence is required"),
    alignment: z.enum(ALIGNMENT_TYPES, "Alignment is required"),
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
