/**
 * Goal Constants
 * Shared between client and server — no mongoose dependency.
 */

export const GOAL_CATEGORIES = [
  "performance",
  "development",
  "culture",
  "compliance",
  "operational",
] as const;

export const GOAL_CATEGORY_LABELS: Record<
  (typeof GOAL_CATEGORIES)[number],
  string
> = {
  performance: "Performance",
  development: "Development",
  culture: "Culture",
  compliance: "Compliance",
  operational: "Operational",
};

export const MEASUREMENT_TYPES = [
  "numeric_metric",
  "percentage_target",
  "milestone_completion",
  "behavior_change",
  "learning_completion",
] as const;

export const CHECKIN_CADENCES = [
  "monthly",
  "quarterly",
  "milestone",
  "manager_scheduled",
] as const;

export const GOAL_STATUSES = [
  "pending_review",
  "on_track",
  "needs_attention",
  "off_track",
  "completed",
] as const;
