import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";

interface GoalEvidence {
  id: string;
  kind: "goal";
  label: string;
  category: string;
  status: string;
}

interface CheckInEvidence {
  id: string;
  kind: "checkin";
  label: string;
}

interface NoteEvidence {
  id: string;
  kind: "note";
  label: string;
}

function formatCheckInLabel(checkin: {
  participate?: { completedAt?: Date | null };
}): string {
  const completedAt = checkin.participate?.completedAt;
  if (!completedAt) return "Check-in (not completed)";
  const date = new Date(completedAt);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `Check-in · ${month}/${day}/${year}`;
}

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

    const employeeObjectId = review.employee;
    const reviewPeriodStart = review.reviewPeriod?.start;
    const reviewPeriodEnd = review.reviewPeriod?.end;

    // Fetch goals, check-ins, and notes in parallel
    const [goals, checkIns, notes] = await Promise.all([
      Goal.find({
        owner: employeeObjectId,
        "timePeriod.end": { $gte: reviewPeriodStart },
        "timePeriod.start": { $lte: reviewPeriodEnd },
      })
        .select("_id objectiveStatement goalType status")
        .lean(),
      CheckIn.find({
        employee: employeeObjectId,
        scheduledAt: { $gte: reviewPeriodStart, $lte: reviewPeriodEnd },
      })
        .select("_id participate")
        .lean(),
      PerformanceNote.find({
        employee: employeeObjectId,
        createdAt: { $gte: reviewPeriodStart, $lte: reviewPeriodEnd },
      })
        .select("_id type observation createdAt")
        .lean(),
    ]);

    const goalsEvidence: GoalEvidence[] = goals.map((g: any) => ({
      id: String(g._id),
      kind: "goal" as const,
      label: g.objectiveStatement,
      category: g.goalType,
      status: g.status,
    }));

    const checkInsEvidence: CheckInEvidence[] = checkIns.map((c: any) => ({
      id: String(c._id),
      kind: "checkin" as const,
      label: formatCheckInLabel(c),
    }));

    const notesEvidence: NoteEvidence[] = notes.map((n: any) => ({
      id: String(n._id),
      kind: "note" as const,
      label: `${n.type}: ${n.observation.slice(0, 60)}${n.observation.length > 60 ? "…" : ""}`,
    }));

    return NextResponse.json({
      success: true,
      goals: goalsEvidence,
      checkIns: checkInsEvidence,
      notes: notesEvidence,
    });
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evidence" },
      { status: 500 },
    );
  }
}
