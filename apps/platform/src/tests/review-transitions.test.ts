import { describe, it, expect } from "vitest";
import {
  deriveReviewStatus,
  canManagerAssess,
} from "@/lib/review-transitions";

describe("canManagerAssess", () => {
  it("returns false when selfAssessment status is not_started", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "not_started", blockedUntilSelfSubmitted: true })).toBe(false);
  });

  it("returns false when selfAssessment status is in_progress", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "in_progress", blockedUntilSelfSubmitted: true })).toBe(false);
  });

  it("returns true when selfAssessment status is submitted", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "submitted", blockedUntilSelfSubmitted: true })).toBe(true);
  });

  it("returns true when blockedUntilSelfSubmitted is false regardless of self status", () => {
    expect(canManagerAssess({ selfAssessmentStatus: "not_started", blockedUntilSelfSubmitted: false })).toBe(true);
    expect(canManagerAssess({ selfAssessmentStatus: "in_progress", blockedUntilSelfSubmitted: false })).toBe(true);
  });
});

describe("deriveReviewStatus", () => {
  const base = {
    currentStatus: "not_started" as const,
    selfAssessmentStatus: "not_started" as const,
    managerAssessmentStatus: "not_started" as const,
  };

  it("advances to self_in_progress when self starts", () => {
    expect(
      deriveReviewStatus({ ...base, selfAssessmentStatus: "in_progress" })
    ).toBe("self_in_progress");
  });

  it("advances to self_submitted when self submits", () => {
    expect(
      deriveReviewStatus({ ...base, selfAssessmentStatus: "submitted" })
    ).toBe("self_submitted");
  });

  it("advances to manager_in_progress when manager starts (self already submitted)", () => {
    expect(
      deriveReviewStatus({
        ...base,
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "in_progress",
      })
    ).toBe("manager_in_progress");
  });

  it("advances to draft_complete when manager submits", () => {
    expect(
      deriveReviewStatus({
        ...base,
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "submitted",
      })
    ).toBe("draft_complete");
  });

  it("returns current status unchanged when already finalized", () => {
    expect(
      deriveReviewStatus({
        currentStatus: "finalized",
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "submitted",
      })
    ).toBe("finalized");
  });

  it("returns current status unchanged when already acknowledged", () => {
    expect(
      deriveReviewStatus({
        currentStatus: "acknowledged",
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "submitted",
      })
    ).toBe("acknowledged");
  });

  it("returns current status unchanged when already shared (v1 legacy)", () => {
    expect(
      deriveReviewStatus({
        currentStatus: "shared",
        selfAssessmentStatus: "submitted",
        managerAssessmentStatus: "submitted",
      })
    ).toBe("shared");
  });

  it("returns not_started when both still not started", () => {
    expect(deriveReviewStatus(base)).toBe("not_started");
  });
});
