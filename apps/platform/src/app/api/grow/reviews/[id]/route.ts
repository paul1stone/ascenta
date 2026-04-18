import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { updateReviewSchema } from "@/lib/validations/performance-review";
import { canManagerAssess, deriveReviewStatus } from "@/lib/review-transitions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const review = await PerformanceReview.findById(id).lean() as any;
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        id: String(review._id),
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const review = await PerformanceReview.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    // V2 gate: block manager assessment work until self-assessment is submitted.
    // Only applies when sections or status are being written — not on config-only
    // payloads (e.g., admin toggling blockedUntilSelfSubmitted).
    const managerAssessmentWorkBeingWritten =
      data.managerAssessment?.sections !== undefined ||
      data.managerAssessment?.status !== undefined;
    if (managerAssessmentWorkBeingWritten) {
      const selfStatus = review.selfAssessment?.status ?? "not_started";
      const blocked = review.managerAssessment?.blockedUntilSelfSubmitted ?? true;
      if (
        !canManagerAssess({
          selfAssessmentStatus: selfStatus as "not_started" | "in_progress" | "submitted",
          blockedUntilSelfSubmitted: blocked,
        })
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Self-assessment must be submitted before manager assessment can begin.",
          },
          { status: 403 },
        );
      }
    }

    // Status transition gates
    if (data.status === "finalized") {
      const devPlanStatus = review.developmentPlan?.status ?? "not_started";
      if (devPlanStatus !== "finalized") {
        return NextResponse.json(
          { success: false, error: "Development plan must be finalized before the review can be finalized." },
          { status: 422 },
        );
      }
    }

    if (data.status === "acknowledged") {
      if (review.status !== "finalized") {
        return NextResponse.json(
          { success: false, error: "Review must be finalized before it can be acknowledged." },
          { status: 422 },
        );
      }
    }

    // Build $set update ops
    const updateOps: Record<string, unknown> = {};

    // V1 fields
    if (data.status !== undefined) {
      updateOps.status = data.status;
      if (data.status === "finalized" && !review.finalizedAt) {
        updateOps.finalizedAt = new Date();
      }
      if (data.status === "acknowledged" && !review.acknowledgedAt) {
        updateOps.acknowledgedAt = new Date();
      }
    }
    if (data.currentStep !== undefined) updateOps.currentStep = data.currentStep;
    if (data.goalHandoffCompleted !== undefined) {
      updateOps.goalHandoffCompleted = data.goalHandoffCompleted;
    }
    if (data.contributions) {
      for (const [key, value] of Object.entries(data.contributions)) {
        if (value !== undefined) updateOps[`contributions.${key}`] = value;
      }
    }
    if (data.draft) {
      for (const [key, value] of Object.entries(data.draft)) {
        if (value !== undefined) updateOps[`draft.${key}`] = value;
      }
    }
    if (data.finalDocument) {
      for (const [key, value] of Object.entries(data.finalDocument)) {
        if (value !== undefined) {
          if (key === "managerSignoff" && typeof value === "object") {
            for (const [sk, sv] of Object.entries(
              value as Record<string, unknown>,
            )) {
              if (sv !== undefined)
                updateOps[`finalDocument.managerSignoff.${sk}`] = sv;
            }
          } else {
            updateOps[`finalDocument.${key}`] = value;
          }
        }
      }
    }
    if (data.goalRecommendations) {
      updateOps.goalRecommendations = data.goalRecommendations;
    }

    // V2 fields
    if (data.reviewCycleId !== undefined)
      updateOps.reviewCycleId = data.reviewCycleId;
    if (data.reviewType !== undefined) updateOps.reviewType = data.reviewType;

    // Self-assessment sections patch
    if (data.selfAssessment?.sections !== undefined) {
      updateOps["selfAssessment.sections"] = data.selfAssessment.sections;
    }
    if (data.selfAssessment?.status !== undefined) {
      updateOps["selfAssessment.status"] = data.selfAssessment.status;
      if (data.selfAssessment.status === "submitted") {
        updateOps["selfAssessment.submittedAt"] = new Date();
      }
    }

    // Manager assessment sections patch
    if (data.managerAssessment?.sections !== undefined) {
      updateOps["managerAssessment.sections"] = data.managerAssessment.sections;
    }
    if (data.managerAssessment?.status !== undefined) {
      updateOps["managerAssessment.status"] = data.managerAssessment.status;
      if (data.managerAssessment.status === "submitted") {
        updateOps["managerAssessment.submittedAt"] = new Date();
      }
    }
    if (data.managerAssessment?.blockedUntilSelfSubmitted !== undefined) {
      updateOps["managerAssessment.blockedUntilSelfSubmitted"] =
        data.managerAssessment.blockedUntilSelfSubmitted;
    }

    // Development plan patch
    if (data.developmentPlan) {
      for (const [key, value] of Object.entries(data.developmentPlan)) {
        if (value !== undefined) {
          if (key === "nextReviewDate" && value) {
            updateOps["developmentPlan.nextReviewDate"] = new Date(value as string);
          } else {
            updateOps[`developmentPlan.${key}`] = value;
          }
        }
      }
    }

    // V2 auto-advance: derive overall status from subdocument statuses
    // (only applies when v2 assessment data is being updated)
    if (data.selfAssessment || data.managerAssessment) {
      const newSelfStatus =
        (data.selfAssessment?.status as "not_started" | "in_progress" | "submitted" | undefined) ??
        (review.selfAssessment?.status as "not_started" | "in_progress" | "submitted") ??
        "not_started";
      const newManagerStatus =
        (data.managerAssessment?.status as "not_started" | "in_progress" | "submitted" | undefined) ??
        (review.managerAssessment?.status as "not_started" | "in_progress" | "submitted") ??
        "not_started";
      const currentStatus = review.status as
        | "not_started"
        | "in_progress"
        | "self_in_progress"
        | "self_submitted"
        | "manager_in_progress"
        | "draft_complete"
        | "finalized"
        | "acknowledged"
        | "shared";

      const derived = deriveReviewStatus({
        currentStatus,
        selfAssessmentStatus: newSelfStatus,
        managerAssessmentStatus: newManagerStatus,
      });

      // Only override status if not explicitly set in the request
      if (!data.status) {
        updateOps.status = derived;
      }
    }

    await PerformanceReview.findByIdAndUpdate(id, { $set: updateOps });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 },
    );
  }
}
