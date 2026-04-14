// apps/platform/src/lib/review-transitions.ts

import type {
  SelfAssessmentStatus,
  ManagerAssessmentStatus,
} from "@ascenta/db/performance-review-categories";

type ReviewStatus =
  | "not_started"
  | "in_progress"
  | "self_in_progress"
  | "self_submitted"
  | "manager_in_progress"
  | "draft_complete"
  | "finalized"
  | "acknowledged"
  | "shared";

/**
 * Returns true if the manager is allowed to begin their assessment.
 * Gate: self-assessment must be submitted (unless blockedUntilSelfSubmitted is false).
 */
export function canManagerAssess(params: {
  selfAssessmentStatus: SelfAssessmentStatus;
  blockedUntilSelfSubmitted: boolean;
}): boolean {
  if (!params.blockedUntilSelfSubmitted) return true;
  return params.selfAssessmentStatus === "submitted";
}

/**
 * Derives the correct overall PerformanceReview.status from the current
 * subdocument statuses. Terminal statuses (finalized, acknowledged) are
 * not overridden — they are set explicitly by the finalize/acknowledge routes.
 */
export function deriveReviewStatus(params: {
  currentStatus: ReviewStatus;
  selfAssessmentStatus: SelfAssessmentStatus;
  managerAssessmentStatus: ManagerAssessmentStatus;
}): ReviewStatus {
  const { currentStatus, selfAssessmentStatus, managerAssessmentStatus } =
    params;

  // Do not override terminal statuses
  if (
    currentStatus === "finalized" ||
    currentStatus === "acknowledged" ||
    currentStatus === "shared"
  ) {
    return currentStatus;
  }

  if (managerAssessmentStatus === "submitted") return "draft_complete";
  if (managerAssessmentStatus === "in_progress") return "manager_in_progress";
  if (selfAssessmentStatus === "submitted") return "self_submitted";
  if (selfAssessmentStatus === "in_progress") return "self_in_progress";
  return "not_started";
}
