import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { logAuditEvent } from "@/lib/workflows";
import { checkInFormSchema } from "@/lib/validations/check-in";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { runId, ...formData } = body;
    const effectiveRunId = runId || crypto.randomUUID();

    const parsed = checkInFormSchema.safeParse(formData);
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

    const checkIn = await CheckIn.create({
      goals: data.linkedGoals,
      employee: employee.id,
      manager: employee.id,
      dueDate: new Date(),
      completedAt: new Date(),
      managerProgressObserved: data.managerProgressObserved,
      managerCoachingNeeded: data.managerCoachingNeeded,
      managerRecognition: data.managerRecognition ?? null,
      employeeProgress: data.employeeProgress,
      employeeObstacles: data.employeeObstacles,
      employeeSupportNeeded: data.employeeSupportNeeded ?? null,
      status: "completed",
      workflowRunId: effectiveRunId,
    });

    const checkInObj = checkIn.toJSON() as Record<string, unknown>;
    const checkInId = checkInObj.id as string;

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
      description: `Completed check-in workflow. Record ID: ${checkInId}`,
      workflowVersion: 1,
      metadata: { recordId: checkInId, recordType: "check-in" },
    });

    return NextResponse.json({
      success: true,
      message: `Check-in saved successfully for ${data.employeeName}.`,
      checkInId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow check-ins API error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create check-in" },
      { status: 500 },
    );
  }
}
