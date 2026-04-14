import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { ReviewCycle } from "@ascenta/db/review-cycle-schema";
import { createCycleSchema } from "@/lib/validations/review-cycle";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const filter: Record<string, unknown> = { orgId: "default" };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const cycles = await ReviewCycle.find(filter)
      .sort({ periodEnd: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      cycles: cycles.map((c) => ({ ...c, id: String(c._id) })),
    });
  } catch (error) {
    console.error("Error fetching review cycles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review cycles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = createCycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      periodStart,
      periodEnd,
      selfAssessmentDeadline,
      managerDeadline,
      participantEmployeeIds,
      ...rest
    } = parsed.data;

    const cycle = await ReviewCycle.create({
      ...rest,
      orgId: "default",
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      selfAssessmentDeadline: selfAssessmentDeadline
        ? new Date(selfAssessmentDeadline)
        : null,
      managerDeadline: managerDeadline ? new Date(managerDeadline) : null,
      participantEmployeeIds: participantEmployeeIds ?? [],
    });

    return NextResponse.json({ success: true, cycle }, { status: 201 });
  } catch (error) {
    console.error("Error creating review cycle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review cycle" },
      { status: 500 },
    );
  }
}
