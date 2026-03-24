/**
 * Strategy Goal Constants
 * Shared between client and server — no mongoose dependency.
 */

export const STRATEGY_HORIZONS = [
  "long_term",
  "medium_term",
  "short_term",
] as const;

export const STRATEGY_HORIZON_LABELS: Record<
  (typeof STRATEGY_HORIZONS)[number],
  string
> = {
  long_term: "Long-term",
  medium_term: "Medium-term",
  short_term: "Short-term",
};

export const STRATEGY_HORIZON_SUGGESTIONS: Record<
  (typeof STRATEGY_HORIZONS)[number],
  string
> = {
  long_term: "3–5 years",
  medium_term: "1–2 years",
  short_term: "This quarter – 6 months",
};

export const STRATEGY_SCOPES = ["company", "department"] as const;

export const STRATEGY_GOAL_STATUSES = [
  "draft",
  "on_track",
  "needs_attention",
  "off_track",
  "completed",
  "archived",
] as const;
