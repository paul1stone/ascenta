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

  if (checkIn.status !== "in_progress") {
    return NextResponse.json(
      { error: `Cannot approve commitments during "${checkIn.status}" status` },
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

  // Employee approves manager's commitment
  if (isEmployee) {
    checkIn.participate.employeeApprovedManagerCommitment = true;
  }

  // Manager approves employee's commitment
  if (isManager) {
    checkIn.participate.managerApprovedEmployeeCommitment = true;
  }

  // If BOTH approved: set completedAt on participate, transition to reflecting
  const bothApproved =
    checkIn.participate.employeeApprovedManagerCommitment &&
    checkIn.participate.managerApprovedEmployeeCommitment;

  if (bothApproved) {
    checkIn.participate.completedAt = new Date();
    checkIn.status = "reflecting";
  }

  await checkIn.save();

  return NextResponse.json({ success: true, status: checkIn.status });
}
