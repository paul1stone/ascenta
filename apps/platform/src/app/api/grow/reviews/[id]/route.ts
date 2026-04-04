import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { updateReviewSchema } from "@/lib/validations/performance-review";

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

    // Apply updates using $set for nested fields
    const updateOps: Record<string, unknown> = {};

    if (data.status) updateOps.status = data.status;
    if (data.currentStep) updateOps.currentStep = data.currentStep;
    if (data.goalHandoffCompleted !== undefined) {
      updateOps.goalHandoffCompleted = data.goalHandoffCompleted;
    }

    if (data.contributions) {
      for (const [key, value] of Object.entries(data.contributions)) {
        if (value !== undefined) {
          updateOps[`contributions.${key}`] = value;
        }
      }
    }

    if (data.draft) {
      for (const [key, value] of Object.entries(data.draft)) {
        if (value !== undefined) {
          updateOps[`draft.${key}`] = value;
        }
      }
    }

    if (data.finalDocument) {
      for (const [key, value] of Object.entries(data.finalDocument)) {
        if (value !== undefined) {
          if (key === "managerSignoff" && typeof value === "object") {
            for (const [sk, sv] of Object.entries(value as Record<string, unknown>)) {
              if (sv !== undefined) {
                updateOps[`finalDocument.managerSignoff.${sk}`] = sv;
              }
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
