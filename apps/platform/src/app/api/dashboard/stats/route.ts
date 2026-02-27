import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { TrackedDocument, WorkflowRun } from "@ascenta/db/workflow-schema";

export async function GET() {
  try {
    await connectDB();

    // --------------- Employees ---------------

    const [totalEmployees, activeEmployees, onLeaveEmployees, terminatedEmployees] =
      await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ status: "active" }),
        Employee.countDocuments({ status: "on_leave" }),
        Employee.countDocuments({ status: "terminated" }),
      ]);

    const departmentRows = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    const byDepartment: Record<string, number> = {};
    for (const row of departmentRows) {
      byDepartment[row._id] = row.count;
    }

    // --------------- Tracked Documents ---------------

    const totalDocuments = await TrackedDocument.countDocuments();

    const documentStageRows = await TrackedDocument.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);

    const byStage: Record<string, number> = {};
    for (const row of documentStageRows) {
      byStage[row._id] = row.count;
    }

    // --------------- Workflow Runs ---------------

    const totalWorkflows = await WorkflowRun.countDocuments();

    const workflowStatusRows = await WorkflowRun.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byStatus: Record<string, number> = {};
    for (const row of workflowStatusRows) {
      byStatus[row._id] = row.count;
    }

    return NextResponse.json({
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        terminated: terminatedEmployees,
        byDepartment,
      },
      documents: {
        total: totalDocuments,
        byStage,
      },
      workflows: {
        total: totalWorkflows,
        byStatus,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
