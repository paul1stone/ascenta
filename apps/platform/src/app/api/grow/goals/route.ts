import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { logAuditEvent } from "@/lib/workflows";
import { parseTimePeriod } from "@/lib/ai/grow-tools";
import { goalFormSchema } from "@/lib/validations/goal";

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

    const goals = await Goal.find({ owner: employeeId })
      .sort({ createdAt: -1 })
      .lean();

    // Look up the most recent check-in date for each goal
    const goalIds = goals.map((g) => g._id);
    const latestCheckIns = await CheckIn.aggregate([
      { $match: { goalIds: { $in: goalIds } } },
      { $unwind: "$goalIds" },
      { $match: { goalIds: { $in: goalIds } } },
      { $group: { _id: "$goalIds", lastCheckInDate: { $max: "$createdAt" } } },
    ]);
    const checkInMap = new Map(
      latestCheckIns.map((c: { _id: unknown; lastCheckInDate: Date }) => [
        String(c._id),
        c.lastCheckInDate,
      ]),
    );

    // Transform _id to id for frontend
    const transformed = goals.map((g: Record<string, unknown>) => ({
      ...g,
      id: String(g._id),
      lastCheckInDate: checkInMap.get(String(g._id)) ?? null,
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, goals: transformed });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow goals GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch goals" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { runId, ...formData } = body;
    const effectiveRunId = runId || crypto.randomUUID();

    const parsed = goalFormSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const employee = await getEmployeeByEmployeeId(data.employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    const timePeriod = parseTimePeriod(
      data.timePeriod,
      data.customStartDate,
      data.customEndDate,
    );

    const goal = await Goal.create({
      title: data.title,
      description: data.description,
      category: data.category,
      measurementType: data.measurementType,
      successMetric: data.successMetric,
      timePeriod,
      checkInCadence: data.checkInCadence,
      alignment: data.alignment,
      status: "on_track",
      owner: employee.id,
      manager: employee.id,
      workflowRunId: effectiveRunId,
    });

    const goalObj = goal.toJSON() as Record<string, unknown>;
    const goalId = goalObj.id as string;

    if (runId) {
      await WorkflowRun.findByIdAndUpdate(runId, {
        $set: {
          status: "completed",
          currentStep: "completed",
          completedAt: new Date(),
        },
      });
    }

    await logAuditEvent({
      workflowRunId: effectiveRunId,
      actorId: "system",
      actorType: "system",
      action: "approved",
      description: `Completed goal workflow. Record ID: ${goalId}`,
      workflowVersion: 1,
      metadata: { recordId: goalId, recordType: "goal" },
    });

    return NextResponse.json({
      success: true,
      message: `Goal saved successfully for ${data.employeeName}.`,
      goalId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow goals API error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create goal" },
      { status: 500 },
    );
  }
}
