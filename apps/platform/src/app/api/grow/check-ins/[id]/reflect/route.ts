import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import {
  employeeReflectSchema,
  managerReflectSchema,
} from "@/lib/validations/check-in";
import { computeGapSignals } from "@/lib/check-in/gap-engine";

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

  if (checkIn.status !== "reflecting") {
    return NextResponse.json(
      { error: `Cannot reflect during "${checkIn.status}" status` },
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

  // Prevent a party from re-submitting their reflection and overwriting
  // their own scores while the other side hasn't completed yet. The status
  // guard above already blocks edits once the check-in is "completed", but
  // during the "reflecting" window only the first submission per side
  // should be honored.
  if (isEmployee && checkIn.employeeReflect?.completedAt) {
    return NextResponse.json(
      { error: "You have already submitted your reflection" },
      { status: 409 },
    );
  }
  if (isManager && checkIn.managerReflect?.completedAt) {
    return NextResponse.json(
      { error: "You have already submitted your reflection" },
      { status: 409 },
    );
  }

  const body = await request.json();

  if (isEmployee) {
    const parsed = employeeReflectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    checkIn.employeeReflect.heard = parsed.data.heard;
    checkIn.employeeReflect.clarity = parsed.data.clarity;
    checkIn.employeeReflect.recognition = parsed.data.recognition;
    checkIn.employeeReflect.development = parsed.data.development;
    checkIn.employeeReflect.safety = parsed.data.safety;
    checkIn.employeeReflect.completedAt = new Date();
  }

  if (isManager) {
    const parsed = managerReflectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    checkIn.managerReflect.clarity = parsed.data.clarity;
    checkIn.managerReflect.recognition = parsed.data.recognition;
    checkIn.managerReflect.development = parsed.data.development;
    checkIn.managerReflect.safety = parsed.data.safety;
    checkIn.managerReflect.forwardAction = parsed.data.forwardAction;
    checkIn.managerReflect.completedAt = new Date();
  }

  // If BOTH reflect phases complete: compute gap signals, complete check-in
  const bothReflected =
    checkIn.employeeReflect.completedAt && checkIn.managerReflect.completedAt;

  if (bothReflected) {
    const gaps = computeGapSignals(
      {
        clarity: checkIn.managerReflect.clarity,
        recognition: checkIn.managerReflect.recognition,
        development: checkIn.managerReflect.development,
        safety: checkIn.managerReflect.safety,
      },
      {
        heard: checkIn.employeeReflect.heard,
        clarity: checkIn.employeeReflect.clarity,
        recognition: checkIn.employeeReflect.recognition,
        development: checkIn.employeeReflect.development,
        safety: checkIn.employeeReflect.safety,
      },
    );

    checkIn.gapSignals.clarity = gaps.clarity;
    checkIn.gapSignals.recognition = gaps.recognition;
    checkIn.gapSignals.development = gaps.development;
    checkIn.gapSignals.safety = gaps.safety;
    checkIn.gapSignals.generatedAt = new Date();
    checkIn.status = "completed";
    checkIn.completedAt = new Date();
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
