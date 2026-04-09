/**
 * Goal Constants
 * Shared between client and server — no mongoose dependency.
 */

export const GOAL_TYPES = ["performance", "development"] as const;

export const GOAL_TYPE_LABELS: Record<(typeof GOAL_TYPES)[number], string> = {
  performance: "Performance Goal",
  development: "Development Goal",
};

export const GOAL_STATUSES = [
  "draft",
  "pending_confirmation",
  "active",
  "needs_attention",
  "blocked",
  "completed",
] as const;

export const GOAL_STATUS_LABELS: Record<
  (typeof GOAL_STATUSES)[number],
  string
> = {
  draft: "Draft",
  pending_confirmation: "Pending Confirmation",
  active: "Active",
  needs_attention: "Needs Attention",
  blocked: "Blocked",
  completed: "Completed",
};

export const KEY_RESULT_STATUSES = [
  "not_started",
  "in_progress",
  "achieved",
  "missed",
] as const;

export const KEY_RESULT_STATUS_LABELS: Record<
  (typeof KEY_RESULT_STATUSES)[number],
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  achieved: "Achieved",
  missed: "Missed",
};

export const CHECKIN_CADENCES = [
  "every_check_in",
  "monthly",
  "quarterly",
] as const;

export const CHECKIN_CADENCE_LABELS: Record<
  (typeof CHECKIN_CADENCES)[number],
  string
> = {
  every_check_in: "Every Check-in",
  monthly: "Monthly",
  quarterly: "Quarterly",
};
