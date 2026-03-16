import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { logAuditEvent } from "@/lib/workflows";
import { parseTimePeriod } from "@/lib/ai/grow-tools";
import { goalFormSchema } from "@/lib/validations/goal";

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
