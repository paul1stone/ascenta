// packages/db/src/performance-review-constants.ts

/**
 * Performance Review Constants
 * Shared between client and server — no mongoose dependency.
 */

export const REVIEW_STATUSES = [
  "not_started",
  "in_progress",
  "draft_complete",
  "finalized",
  "shared",
] as const;

export const REVIEW_STATUS_LABELS: Record<
  (typeof REVIEW_STATUSES)[number],
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  draft_complete: "Draft Complete",
  finalized: "Finalized",
  shared: "Shared",
};

export const REVIEW_STEPS = [
  "contributions",
  "draft",
  "finalize",
  "goals",
] as const;

export const REVIEW_STEP_LABELS: Record<
  (typeof REVIEW_STEPS)[number],
  string
> = {
  contributions: "Contributions",
  draft: "Draft",
  finalize: "Finalize",
  goals: "Goals",
};
