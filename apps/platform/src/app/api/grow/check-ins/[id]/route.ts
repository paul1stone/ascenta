import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import { filterCheckInForRole } from "@/lib/check-in/privacy";
import type { UserRole } from "@/lib/auth/auth-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id)
    .populate("employee", "firstName lastName employeeId")
    .populate("manager", "firstName lastName employeeId")
    .populate("goals", "objectiveStatement status category")
    .populate("previousCheckInId")
    .lean();

  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  // Determine role from relationship
  const managerId =
    typeof checkIn.manager === "object" && checkIn.manager !== null
      ? (checkIn.manager as { _id: { toString(): string } })._id.toString()
      : String(checkIn.manager);
  const employeeId =
    typeof checkIn.employee === "object" && checkIn.employee !== null
      ? (checkIn.employee as { _id: { toString(): string } })._id.toString()
      : String(checkIn.employee);

  let role: UserRole;
  if (managerId === userId) {
    role = "manager";
  } else if (employeeId === userId) {
    role = "employee";
  } else {
    role = "hr";
  }

  const filtered = filterCheckInForRole(checkIn, role, userId);

  return NextResponse.json({ checkIn: filtered, role });
}
