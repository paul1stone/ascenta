import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { getEmployeeById } from "@ascenta/db/employees";
import { getTranslationForEmployee } from "@/lib/ai/translation-lookup";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId query parameter is required" },
        { status: 400 },
      );
    }

    let employee;
    try {
      employee = await getEmployeeById(employeeId);
    } catch {
      // Invalid ObjectId format
      return NextResponse.json({ outcomes: [] });
    }
    if (!employee) {
      return NextResponse.json({ outcomes: [] });
    }

    const translation = await getTranslationForEmployee(
      employee.department,
      employee.jobTitle,
    );

    if (!translation) {
      return NextResponse.json({ outcomes: [] });
    }

    const outcomes: {
      text: string;
      strategyGoalId: string;
      strategyGoalTitle: string;
      roleContribution: string;
    }[] = [];

    for (const contribution of translation.contributions) {
      for (const outcomeText of contribution.outcomes) {
        outcomes.push({
          text: outcomeText,
          strategyGoalId: contribution.strategyGoalId,
          strategyGoalTitle: contribution.strategyGoalTitle,
          roleContribution: contribution.roleContribution,
        });
      }
    }

    return NextResponse.json({ outcomes });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Suggested outcomes GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suggested outcomes" },
      { status: 500 },
    );
  }
}
