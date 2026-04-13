import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

  // Only manager can cancel
  const managerId = checkIn.manager.toString();
  if (managerId !== userId) {
    return NextResponse.json(
      { error: "Only the manager can cancel a check-in" },
      { status: 403 },
    );
  }

  // Only during preparing or ready
  if (checkIn.status !== "preparing" && checkIn.status !== "ready") {
    return NextResponse.json(
      {
        error: `Cannot cancel during "${checkIn.status}" status. Only "preparing" or "ready" check-ins can be cancelled.`,
      },
      { status: 409 },
    );
  }

  checkIn.status = "cancelled";
  await checkIn.save();

  return NextResponse.json({ success: true, status: "cancelled" });
}
