import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    type ManagerDoc = { _id: unknown; firstName: string; lastName: string; employeeId: string };

    let manager: ManagerDoc | null = null;

    if (managerId) {
      // Support both MongoDB ObjectId and employeeId string
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(managerId);
      manager = isObjectId
        ? await Employee.findById(managerId).lean() as ManagerDoc | null
        : await Employee.findOne({ employeeId: managerId }).lean() as ManagerDoc | null;
    } else {
      // Auto-discover: find a manager who has goals assigned (most reliable for seeded data)
      const managerIds = await Goal.distinct("manager");
      if (managerIds.length > 0) {
        manager = await Employee.findById(managerIds[0]).lean() as ManagerDoc | null;
      }
      // Fallback: find an employee who appears as managerName on other employees
      if (!manager) {
        const allEmployees = await Employee.find({ status: "active" }).lean() as (ManagerDoc & { managerName: string })[];
        const managerNames = new Set(allEmployees.map((e) => e.managerName).filter(Boolean));
        for (const name of managerNames) {
          const found = allEmployees.find((e) => `${e.firstName} ${e.lastName}` === name);
          if (found) {
            manager = found;
            break;
          }
        }
      }
    }

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    // Find direct reports via two strategies:
    // 1. Employees whose managerName matches this manager's name
    // 2. Employees who are goal owners where this manager is the goal's manager
    const managerName = `${manager.firstName} ${manager.lastName}`;
    const managedGoals = await Goal.find({ manager: manager._id }).distinct("owner");
    const directReports = await Employee.find({
      status: "active",
      $or: [
        { managerName: { $regex: new RegExp(managerName, "i") } },
        { _id: { $in: managedGoals } },
      ],
    }).lean();

    const reportIds = directReports.map((e) => e._id);

    // Goals for direct reports (active only — exclude completed)
    const goals = await Goal.find({
      owner: { $in: reportIds },
      status: { $ne: "completed" },
    }).lean();

    // Check-ins for direct reports
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const checkInsLast30 = await CheckIn.find({
      employee: { $in: reportIds },
      dueDate: { $gte: thirtyDaysAgo },
    }).lean();

    const checkInsLast7 = checkInsLast30.filter(
      (c) => new Date(c.dueDate as string | number | Date) >= sevenDaysAgo,
    );

    const overdueCheckIns = await CheckIn.find({
      employee: { $in: reportIds },
      status: "scheduled",
      dueDate: { $lt: now },
    }).lean();

    // Build per-employee summary
    const employeeSummaries = directReports.map((emp) => {
      const empId = String(emp._id);
      const empGoals = goals.filter((g) => String(g.owner) === empId);
      const empCheckIns7 = checkInsLast7.filter((c) => String(c.employee) === empId);
      const empCheckIns30 = checkInsLast30.filter((c) => String(c.employee) === empId);
      const empOverdue = overdueCheckIns.filter((c) => String(c.employee) === empId);

      const completedLast7 = empCheckIns7.filter((c) => c.status === "completed").length;
      const totalLast7 = empCheckIns7.length;
      const completedLast30 = empCheckIns30.filter((c) => c.status === "completed").length;
      const totalLast30 = empCheckIns30.length;

      // Determine overall status from goals
      const hasOffTrack = empGoals.some((g) => g.status === "off_track");
      const hasNeedsAttention = empGoals.some((g) => g.status === "needs_attention");
      const overallStatus = hasOffTrack
        ? "off_track"
        : hasNeedsAttention
          ? "needs_attention"
          : "on_track";

      return {
        id: empId,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        jobTitle: emp.jobTitle,
        goalCount: empGoals.length,
        goalsByStatus: {
          on_track: empGoals.filter((g) => g.status === "on_track").length,
          needs_attention: empGoals.filter((g) => g.status === "needs_attention").length,
          off_track: empGoals.filter((g) => g.status === "off_track").length,
          completed: 0,
        },
        overallStatus,
        checkInCompletion7d: totalLast7 > 0 ? completedLast7 / totalLast7 : null,
        checkInCompletion30d: totalLast30 > 0 ? completedLast30 / totalLast30 : null,
        overdueCheckIns: empOverdue.length,
      };
    });

    // Aggregate stats
    const totalGoals = goals.length;
    const totalCompleted7 = checkInsLast7.filter((c) => c.status === "completed").length;
    const totalCheckIns7 = checkInsLast7.length;
    const totalCompleted30 = checkInsLast30.filter((c) => c.status === "completed").length;
    const totalCheckIns30 = checkInsLast30.length;

    return NextResponse.json({
      manager: { id: String(manager._id), name: managerName },
      aggregates: {
        directReportsCount: directReports.length,
        activeGoalsCount: totalGoals,
        checkInCompletion7d: totalCheckIns7 > 0 ? totalCompleted7 / totalCheckIns7 : 0,
        overdueCheckIns: overdueCheckIns.length,
      },
      directReports: employeeSummaries.map((e) => ({
        employeeId: e.id,
        name: e.name,
        department: e.department,
        jobTitle: e.jobTitle,
        goalCount: e.goalCount,
        goalStatus: e.goalsByStatus,
        checkInCompletion7d: e.checkInCompletion7d ?? 0,
        checkInCompletion30d: e.checkInCompletion30d ?? 0,
        overdueCheckIns: e.overdueCheckIns,
      })),
    });
  } catch (error) {
    console.error("Grow status API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grow status" },
      { status: 500 },
    );
  }
}
