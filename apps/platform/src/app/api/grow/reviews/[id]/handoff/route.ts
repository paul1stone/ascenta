/**
 * POST /api/grow/reviews/[id]/handoff
 *
 * Carries goals forward from a just-finalized review into a new review
 * period. Required by docs/reqs/perf-reviews.md Step 8 — Development Plan
 * and Next Period Goals.
 *
 * Body:
 *   {
 *     carryForwardGoalIds: string[],  // IDs of prior Goal docs to duplicate
 *     nextPeriod: "Q1"|"Q2"|"Q3"|"Q4"|"H1"|"H2"|"annual"|"custom",
 *     customStartDate?: string,       // if nextPeriod === "custom"
 *     customEndDate?: string
 *   }
 *
 * Behavior:
 *   - For each goal being carried forward: creates a new Goal with the
 *     same objective/keyResults/category but a fresh timePeriod, draft
 *     status, reset confirmations, and traceability fields
 *     (carriedFromGoalId, sourceReviewId) pointing back to the source.
 *   - Sets review.goalHandoffCompleted = true.
 *
 * Returns: { success, created: [{id, objectiveStatement}] }
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { parseTimePeriod } from "@/lib/ai/grow-tools";

interface HandoffBody {
  carryForwardGoalIds?: unknown;
  nextPeriod?: unknown;
  customStartDate?: unknown;
  customEndDate?: unknown;
}

const VALID_PERIODS = new Set([
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "H1",
  "H2",
  "annual",
  "custom",
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const review = (await PerformanceReview.findById(id).lean()) as Record<
      string,
      unknown
    > | null;
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const body = (await req.json()) as HandoffBody;
    const rawIds = Array.isArray(body.carryForwardGoalIds)
      ? body.carryForwardGoalIds
      : [];
    const ids = rawIds
      .filter((v): v is string => typeof v === "string" && v.length > 0);
    const nextPeriod = typeof body.nextPeriod === "string" ? body.nextPeriod : "";
    if (!VALID_PERIODS.has(nextPeriod)) {
      return NextResponse.json(
        { success: false, error: "Invalid nextPeriod" },
        { status: 400 },
      );
    }
    const customStart =
      typeof body.customStartDate === "string" ? body.customStartDate : undefined;
    const customEnd =
      typeof body.customEndDate === "string" ? body.customEndDate : undefined;
    if (nextPeriod === "custom" && (!customStart || !customEnd)) {
      return NextResponse.json(
        {
          success: false,
          error: "customStartDate and customEndDate are required when nextPeriod is custom",
        },
        { status: 400 },
      );
    }

    const timePeriod = parseTimePeriod(nextPeriod, customStart, customEnd);

    const created: Array<{ id: string; objectiveStatement: string }> = [];
    if (ids.length > 0) {
      const sources = (await Goal.find({
        _id: { $in: ids },
        owner: review.employee,
      }).lean()) as Array<Record<string, unknown>>;

      for (const src of sources) {
        const keyResults = Array.isArray(src.keyResults)
          ? (src.keyResults as Array<Record<string, unknown>>).map((kr) => ({
              description: kr.description,
              metric: kr.metric,
              deadline: timePeriod.end,
            }))
          : [];

        const next = await Goal.create({
          objectiveStatement: src.objectiveStatement,
          goalType: src.goalType,
          keyResults,
          strategyGoalId: src.strategyGoalId ?? null,
          teamGoalId: src.teamGoalId ?? null,
          supportAgreement: src.supportAgreement ?? "",
          checkInCadence: src.checkInCadence,
          timePeriod,
          status: "draft",
          owner: src.owner,
          manager: src.manager,
          notes: src.notes ?? "",
          contributionRef: src.contributionRef ?? null,
          carriedFromGoalId: src._id,
          sourceReviewId: id,
        });

        created.push({
          id: String(next._id),
          objectiveStatement: next.objectiveStatement as string,
        });
      }
    }

    await PerformanceReview.findByIdAndUpdate(id, {
      goalHandoffCompleted: true,
    });

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error("Error handing off goals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to hand off goals" },
      { status: 500 },
    );
  }
}
