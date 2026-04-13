import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import {
  employeePrepareSchema,
  managerPrepareSchema,
} from "@/lib/validations/check-in";
import { getNextStatus } from "@/lib/check-in/transitions";

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

  if (checkIn.status !== "preparing") {
    return NextResponse.json(
      { error: `Cannot prepare during "${checkIn.status}" status` },
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

  const body = await request.json();

  if (isEmployee) {
    const parsed = employeePrepareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // TODO(check-ins): replace stub with an LLM-generated summary that
    // preserves the employee's intent without exposing their raw reflections
    // to the manager. Current stub returns the first 200 characters of the
    // concatenated reflections, which may leak verbatim content.
    const combined = [
      parsed.data.progressReflection,
      parsed.data.stuckPointReflection,
      parsed.data.conversationIntent,
    ].join(" ");
    const distilledPreview =
      combined.length > 200 ? combined.slice(0, 200) + "..." : combined;

    checkIn.employeePrepare.progressReflection =
      parsed.data.progressReflection;
    checkIn.employeePrepare.stuckPointReflection =
      parsed.data.stuckPointReflection;
    checkIn.employeePrepare.conversationIntent =
      parsed.data.conversationIntent;
    checkIn.employeePrepare.completedAt = new Date();
    checkIn.employeePrepare.distilledPreview = distilledPreview;
  }

  if (isManager) {
    const parsed = managerPrepareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    checkIn.managerPrepare.openingMove = parsed.data.openingMove ?? null;
    checkIn.managerPrepare.recognitionNote =
      parsed.data.recognitionNote ?? null;
    checkIn.managerPrepare.developmentalFocus =
      parsed.data.developmentalFocus ?? null;
    checkIn.managerPrepare.completedAt = new Date();
  }

  // Check if status should advance to "ready"
  const nextStatus = getNextStatus({
    status: checkIn.status,
    scheduledAt: checkIn.scheduledAt,
    employeePrepare: { completedAt: checkIn.employeePrepare.completedAt },
    managerPrepare: { completedAt: checkIn.managerPrepare.completedAt },
    participate: { completedAt: checkIn.participate.completedAt },
  });

  if (nextStatus) {
    checkIn.status = nextStatus;
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
