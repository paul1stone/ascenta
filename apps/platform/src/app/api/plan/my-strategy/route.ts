import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";
import { Goal } from "@ascenta/db/goal-schema";

function inferRoleLevel(
  jobTitle: string,
): "executive" | "manager" | "individual_contributor" {
  const lower = jobTitle.toLowerCase();
  const exec = ["director", "vp", "vice president", "chief", "head of", "cto", "ceo", "cfo", "coo", "svp", "evp"];
  const mgr = ["manager", "lead", "supervisor", "team lead", "principal"];
  if (exec.some((kw) => lower.includes(kw))) return "executive";
  if (mgr.some((kw) => lower.includes(kw))) return "manager";
  return "individual_contributor";
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId is required" },
        { status: 400 },
      );
    }

    // Look up employee
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(employeeId);
    const employee = isObjectId
      ? await Employee.findById(employeeId).lean()
      : await Employee.findOne({ employeeId }).lean();

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    const emp = employee as Record<string, unknown>;
    const department = emp.department as string;
    const jobTitle = emp.jobTitle as string;
    const empId = String(emp._id);
    const empName = `${emp.firstName} ${emp.lastName}`;

    // Find published translation for department
    const translation = await StrategyTranslation.findOne({
      department,
      status: "published",
    })
      .sort({ version: -1 })
      .lean();

    // Find the matching role entry
    let myRole = null;
    if (translation) {
      const t = translation as Record<string, unknown>;
      const roles = t.roles as { jobTitle: string; level: string; contributions: unknown[]; behaviors: unknown[]; decisionRights: unknown }[];

      // Exact title match first
      myRole = roles.find((r) => r.jobTitle.toLowerCase() === jobTitle.toLowerCase());

      // Fallback: match by inferred level
      if (!myRole) {
        const level = inferRoleLevel(jobTitle);
        myRole = roles.find((r) => r.level === level);
      }
    }

    // Load strategy goals for context
    const companyGoals = await StrategyGoal.find({
      scope: "company",
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1 })
      .lean();

    const departmentGoals = await StrategyGoal.find({
      scope: "department",
      department,
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1 })
      .lean();

    // Manager data: direct reports + their translations
    const directReports = await Employee.find({
      managerName: { $regex: new RegExp(empName, "i") },
      status: "active",
    }).lean();

    const teamData = [];
    for (const report of directReports) {
      const r = report as Record<string, unknown>;
      const rDept = r.department as string;
      const rTitle = r.jobTitle as string;
      const rId = String(r._id);

      // Find their translation
      let reportTranslation = null;
      if (rDept === department && translation) {
        const t = translation as Record<string, unknown>;
        const roles = t.roles as { jobTitle: string; level: string; contributions: { strategyGoalTitle: string; roleContribution: string }[] }[];
        reportTranslation = roles.find(
          (role) => role.jobTitle.toLowerCase() === rTitle.toLowerCase(),
        );
      } else {
        const otherTranslation = await StrategyTranslation.findOne({
          department: rDept,
          status: "published",
        }).lean();
        if (otherTranslation) {
          const ot = otherTranslation as Record<string, unknown>;
          const roles = ot.roles as { jobTitle: string; level: string; contributions: { strategyGoalTitle: string; roleContribution: string }[] }[];
          reportTranslation = roles.find(
            (role) => role.jobTitle.toLowerCase() === rTitle.toLowerCase(),
          );
        }
      }

      // Get active goal support agreements
      const activeGoals = await Goal.find({
        owner: rId,
        status: "active",
        supportAgreement: { $ne: "" },
      })
        .select("objectiveStatement supportAgreement")
        .lean();

      teamData.push({
        id: rId,
        name: `${r.firstName} ${r.lastName}`,
        jobTitle: rTitle,
        department: rDept,
        hasTranslation: !!reportTranslation,
        primaryContribution: reportTranslation?.contributions?.[0]?.roleContribution ?? null,
        supportAgreements: activeGoals.map((g) => ({
          goal: (g as Record<string, unknown>).objectiveStatement as string,
          support: (g as Record<string, unknown>).supportAgreement as string,
        })),
      });
    }

    // HR data: all departments' translation status
    const allDepartments = await Employee.distinct("department", { status: "active" });
    const allTranslations = await StrategyTranslation.find({ status: "published" })
      .select("department version updatedAt")
      .lean();

    const deptStatus = (allDepartments as string[]).filter(Boolean).map((d) => {
      const t = allTranslations.find(
        (tr) => (tr as Record<string, unknown>).department === d,
      );
      return {
        department: d,
        hasTranslation: !!t,
        version: t ? (t as Record<string, unknown>).version : null,
        updatedAt: t ? (t as Record<string, unknown>).updatedAt : null,
      };
    });

    return NextResponse.json({
      success: true,
      employee: {
        id: empId,
        name: empName,
        jobTitle,
        department,
        isManager: directReports.length > 0,
      },
      myRole,
      companyGoals: companyGoals.map((g) => {
        const goal = g as Record<string, unknown>;
        return {
          id: String(goal._id),
          title: goal.title,
          horizon: goal.horizon,
          status: goal.status,
        };
      }),
      departmentGoals: departmentGoals.map((g) => {
        const goal = g as Record<string, unknown>;
        return {
          id: String(goal._id),
          title: goal.title,
          horizon: goal.horizon,
          status: goal.status,
        };
      }),
      team: teamData,
      departmentTranslationStatus: deptStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("My strategy GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to load strategy" },
      { status: 500 },
    );
  }
}
