/**
 * Goal Constants
 * Shared between client and server — no mongoose dependency.
 */

export const GOAL_CATEGORIES = [
  "productivity",
  "quality",
  "accuracy",
  "efficiency",
  "operational_excellence",
  "customer_impact",
  "communication",
  "collaboration",
  "conflict_resolution",
  "decision_making",
  "initiative",
  "skill_development",
  "certification",
  "training_completion",
  "leadership_growth",
  "career_advancement",
] as const;

export const GOAL_CATEGORY_GROUPS: Record<
  string,
  (typeof GOAL_CATEGORIES)[number][]
> = {
  "Performance Goals": [
    "productivity",
    "quality",
    "accuracy",
    "efficiency",
    "operational_excellence",
    "customer_impact",
  ],
  "Leadership Goals": [
    "communication",
    "collaboration",
    "conflict_resolution",
    "decision_making",
    "initiative",
  ],
  "Development Goals": [
    "skill_development",
    "certification",
    "training_completion",
    "leadership_growth",
    "career_advancement",
  ],
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

export const ALIGNMENT_TYPES = ["mission", "value", "priority"] as const;

export const GOAL_STATUSES = [
  "on_track",
  "needs_attention",
  "off_track",
  "completed",
] as const;
