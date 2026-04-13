import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import {
  participateManagerSchema,
  participateEmployeeSchema,
} from "@/lib/validations/check-in";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id);
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  if (checkIn.status !== "ready" && checkIn.status !== "in_progress") {
    return NextResponse.json(
      { error: `Cannot participate during "${checkIn.status}" status` },
      { status: 409 },
    );
  }

  const managerId = checkIn.manager.toString();
  const employeeId = checkIn.employee.toString();
  const isManager = managerId === userId;
  const isEmployee = employeeId === userId;

  if (!isManager && !isEmployee) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Transition to in_progress if currently ready
  if (checkIn.status === "ready") {
    checkIn.status = "in_progress";
  }

  const body = await request.json();

  if (isManager) {
    const parsed = participateManagerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    checkIn.participate.stuckPointDiscussion =
      parsed.data.stuckPointDiscussion;
    checkIn.participate.recognition = parsed.data.recognition;
    checkIn.participate.development = parsed.data.development;
    checkIn.participate.performance = parsed.data.performance ?? null;
    checkIn.participate.managerCommitment = parsed.data.managerCommitment;
  }

  if (isEmployee) {
    const parsed = participateEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    checkIn.participate.employeeOpening = parsed.data.employeeOpening;
    checkIn.participate.employeeKeyTakeaways =
      parsed.data.employeeKeyTakeaways;
    checkIn.participate.employeeCommitment = parsed.data.employeeCommitment;
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
