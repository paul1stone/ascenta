import { z } from "zod";
import {
  GOAL_TYPES,
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

// Soft warning: common activity verbs that suggest task-like (not outcome-like) wording
const ACTIVITY_VERBS = ["try", "help", "support", "participate", "assist", "attend", "contribute"];

export function getObjectiveWarning(text: string): string | null {
  const words = text.trim().split(/\s+/);
  if (words.length < 15) return null; // Only warn if enough words to evaluate
  const firstWord = words[0]?.toLowerCase();
  if (ACTIVITY_VERBS.includes(firstWord ?? "")) {
    const hasPurpose = /so that|in order to/i.test(text);
    if (!hasPurpose) {
      return "This reads like a task. Try framing it as an outcome with a \"so that\" connection.";
    }
  }
  return null;
}

const keyResultSchema = z.object({
  description: z.string().min(1, "Description is required"),
  metric: z.string().min(1, "Measurable target is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

const milestoneSchema = z.object({
  label: z.string().min(1, "Milestone label is required"),
  targetDate: z.string().min(1, "Target date is required"),
  notes: z.string().optional(),
});

// Best-practice guidance: stretch goals sit at 70-80% confidence.
// Returns a soft warning string (not a hard validation error) the UI can show.
export function getStretchConfidenceGuidance(
  value: number | null | undefined,
): string | null {
  if (value == null) return null;
  if (value >= 90) return "That's very high confidence — consider a more ambitious target.";
  if (value <= 50) return "That's low confidence — consider whether this is achievable or needs support.";
  if (value < 70 || value > 80) return null;
  return null;
}

export const goalFormSchema = z
  .object({
    employeeName: z.string().min(1, "Employee name is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    objectiveStatement: z
      .string()
      .min(1, "Objective statement is required")
      .refine(
        (val) => val.trim().split(/\s+/).length >= 15,
        { message: "Objective statement must be at least 15 words" },
      ),
    goalType: z.enum(GOAL_TYPES, { message: "Goal type is required" }),
    keyResults: z
      .array(keyResultSchema)
      .min(1, "At least 1 key result is required"),
    strategyGoalId: z.string().optional(),
    strategyGoalTitle: z.string().optional(),
    teamGoalId: z.string().optional(),
    supportAgreement: z.string().optional(),
    timePeriod: z.enum(TIME_PERIODS, { message: "Time period is required" }),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
    checkInCadence: z.enum(CHECKIN_CADENCES, {
      message: "Check-in cadence is required",
    }),
    notes: z.string().optional(),
    contributionRef: z.string().optional(),
    stretchConfidence: z.number().int().min(0).max(100).optional().nullable(),
    milestones: z.array(milestoneSchema).optional(),
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
