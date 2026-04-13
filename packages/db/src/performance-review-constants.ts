// packages/db/src/performance-review-constants.ts

/**
 * Performance Review Constants
 * Shared between client and server — no mongoose dependency.
 */

export const REVIEW_STATUSES = [
  "not_started",
  "in_progress",        // v1 legacy — kept for backward compat
  "self_in_progress",   // v2: employee has started self-assessment
  "self_submitted",     // v2: employee submitted, manager now unlocked
  "manager_in_progress", // v2: manager has started assessment
  "draft_complete",
  "finalized",
  "acknowledged",       // v2: employee acknowledged final review
  "shared",             // v1 legacy — kept for backward compat
] as const;

export const REVIEW_STATUS_LABELS: Record<
  (typeof REVIEW_STATUSES)[number],
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  self_in_progress: "Self-Assessment In Progress",
  self_submitted: "Self-Assessment Submitted",
  manager_in_progress: "Manager Assessment In Progress",
  draft_complete: "Draft Complete",
  finalized: "Finalized",
  acknowledged: "Acknowledged",
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
