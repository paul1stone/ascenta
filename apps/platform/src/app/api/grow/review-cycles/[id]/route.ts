import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { ReviewCycle } from "@ascenta/db/review-cycle-schema";
import { updateCycleSchema } from "@/lib/validations/review-cycle";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cycle = await ReviewCycle.findById(id).lean() as any;
    if (!cycle) {
      return NextResponse.json(
        { success: false, error: "Review cycle not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      cycle: { ...cycle, id: String(cycle._id) },
    });
  } catch (error) {
    console.error("Error fetching review cycle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review cycle" },
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

    const parsed = updateCycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const cycle = await ReviewCycle.findById(id);
    if (!cycle) {
      return NextResponse.json(
        { success: false, error: "Review cycle not found" },
        { status: 404 },
      );
    }

    const data = parsed.data;
    const updateOps: Record<string, unknown> = {};

    if (data.label !== undefined) updateOps.label = data.label;
    if (data.type !== undefined) updateOps.type = data.type;
    if (data.status !== undefined) updateOps.status = data.status;
    if (data.periodStart !== undefined)
      updateOps.periodStart = new Date(data.periodStart);
    if (data.periodEnd !== undefined)
      updateOps.periodEnd = new Date(data.periodEnd);
    if (data.selfAssessmentDeadline !== undefined)
      updateOps.selfAssessmentDeadline = data.selfAssessmentDeadline
        ? new Date(data.selfAssessmentDeadline)
        : null;
    if (data.managerDeadline !== undefined)
      updateOps.managerDeadline = data.managerDeadline
        ? new Date(data.managerDeadline)
        : null;
    if (data.participantEmployeeIds !== undefined)
      updateOps.participantEmployeeIds = data.participantEmployeeIds;

    await ReviewCycle.findByIdAndUpdate(id, { $set: updateOps });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating review cycle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review cycle" },
      { status: 500 },
    );
  }
}
