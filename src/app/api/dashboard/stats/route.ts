import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees } from "@/lib/db/employee-schema";
import {
  trackedDocuments,
  workflowRuns,
} from "@/lib/db/workflow-schema";
import { eq, sql, count } from "drizzle-orm";

export async function GET() {
  try {
    // --------------- Employees ---------------

    const [totalEmployees] = await db
      .select({ count: count() })
      .from(employees);

    const [activeEmployees] = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.status, "active"));

    const [onLeaveEmployees] = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.status, "on_leave"));

    const [terminatedEmployees] = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.status, "terminated"));

    const departmentRows = await db
      .select({
        department: employees.department,
        count: count(),
      })
      .from(employees)
      .groupBy(employees.department);

    const byDepartment: Record<string, number> = {};
    for (const row of departmentRows) {
      byDepartment[row.department] = row.count;
    }

    // --------------- Tracked Documents ---------------

    const [totalDocuments] = await db
      .select({ count: count() })
      .from(trackedDocuments);

    const documentStageRows = await db
      .select({
        stage: trackedDocuments.stage,
        count: count(),
      })
      .from(trackedDocuments)
      .groupBy(trackedDocuments.stage);

    const byStage: Record<string, number> = {};
    for (const row of documentStageRows) {
      byStage[row.stage] = row.count;
    }

    // --------------- Workflow Runs ---------------

    const [totalWorkflows] = await db
      .select({ count: count() })
      .from(workflowRuns);

    const workflowStatusRows = await db
      .select({
        status: workflowRuns.status,
        count: count(),
      })
      .from(workflowRuns)
      .groupBy(workflowRuns.status);

    const byStatus: Record<string, number> = {};
    for (const row of workflowStatusRows) {
      byStatus[row.status] = row.count;
    }

    return NextResponse.json({
      employees: {
        total: totalEmployees.count,
        active: activeEmployees.count,
        onLeave: onLeaveEmployees.count,
        terminated: terminatedEmployees.count,
        byDepartment,
      },
      documents: {
        total: totalDocuments.count,
        byStage,
      },
      workflows: {
        total: totalWorkflows.count,
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
