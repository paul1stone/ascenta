import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { NextRequest, NextResponse } from "next/server";
import { scheduleCheckInSchema } from "@/lib/validations/check-in";
import { filterCheckInForRole } from "@/lib/check-in/privacy";
import type { UserRole } from "@/lib/auth/auth-context";

// Escape regex metacharacters so employee names can't inject regex syntax
// (mirrors the helper in apps/platform/src/app/api/auth/me/route.ts).
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (await Employee.findById(userId).lean()) as any;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Determine role — escape user names so regex metacharacters in a name
  // can't create malformed or catastrophically-backtracking patterns.
  const directReports = await Employee.find({
    managerName: {
      $regex: new RegExp(
        `${escapeRegex(user.firstName)}.*${escapeRegex(user.lastName)}`,
        "i",
      ),
    },
    status: "active",
  })
    .select("_id")
    .lean();

  const isManager = directReports.length > 0;
  const role: UserRole = isManager ? "manager" : "employee";

  let checkIns;
  if (role === "manager") {
    checkIns = await CheckIn.find({ manager: userId })
      .populate("employee", "firstName lastName employeeId")
      .populate("goals", "objectiveStatement")
      .sort({ scheduledAt: -1 })
      .lean();
  } else {
    checkIns = await CheckIn.find({ employee: userId })
      .populate("manager", "firstName lastName employeeId")
      .populate("goals", "objectiveStatement")
      .sort({ scheduledAt: -1 })
      .lean();
  }

  const filtered = checkIns.map((ci) => filterCheckInForRole(ci, role, userId));

  return NextResponse.json({ checkIns: filtered, role });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();
  const parsed = scheduleCheckInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { employeeId, goalIds, scheduledAt } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employee = (await Employee.findById(employeeId).lean()) as any;
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Authorization: the caller must be the employee's manager. We verify via
  // managerName substring match (the same mechanism used in GET), scoped to
  // this specific employee. Names are regex-escaped to prevent injection.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caller = (await Employee.findById(userId).lean()) as any;
  if (!caller) {
    return NextResponse.json({ error: "Caller not found" }, { status: 404 });
  }
  const callerNamePattern = new RegExp(
    `${escapeRegex(caller.firstName)}.*${escapeRegex(caller.lastName)}`,
    "i",
  );
  if (!employee.managerName || !callerNamePattern.test(employee.managerName)) {
    return NextResponse.json(
      { error: "Only the employee's manager may schedule check-ins" },
      { status: 403 },
    );
  }

  const goals = await Goal.find({
    _id: { $in: goalIds },
    owner: employeeId,
    status: { $in: ["active", "needs_attention"] },
  }).lean();

  if (goals.length === 0) {
    return NextResponse.json(
      { error: "No valid active goals found for this employee" },
      { status: 400 },
    );
  }

  const previousCheckIn = await CheckIn.findOne({
    employee: employeeId,
    manager: userId,
    status: "completed",
  })
    .sort({ completedAt: -1 })
    .select("_id")
    .lean();

  const checkIn = await CheckIn.create({
    employee: employeeId,
    manager: userId,
    goals: goals.map((g) => g._id),
    scheduledAt: new Date(scheduledAt),
    cadenceSource: "manual",
    status: "preparing",
    previousCheckInId: previousCheckIn?._id || null,
  });

  return NextResponse.json(
    {
      success: true,
      checkInId: checkIn._id.toString(),
      message: "Check-in scheduled",
    },
    { status: 201 },
  );
}
