import type {
  SelfAssessmentStatus,
  ManagerAssessmentStatus,
} from "@ascenta/db/performance-review-categories";
import type { ReviewStatus } from "@ascenta/db/performance-review-constants";

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

  // v1 legacy status "in_progress" is non-terminal and will be derived to the
  // appropriate v2 status when this function is called on existing records.
  // Do not override terminal statuses set by the finalize/acknowledge routes.
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
