import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { logAuditEvent } from "@/lib/workflows";
import { performanceNoteFormSchema } from "@/lib/validations/performance-note";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { runId, ...formData } = body;
    const effectiveRunId = runId || crypto.randomUUID();

    const parsed = performanceNoteFormSchema.safeParse(formData);
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

    const note = await PerformanceNote.create({
      employee: employee.id,
      author: employee.id,
      type: data.noteType,
      observation: data.observation,
      expectation: data.expectation ?? null,
      workflowRunId: effectiveRunId,
    });

    const noteObj = note.toJSON() as Record<string, unknown>;
    const noteId = noteObj.id as string;

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
      description: `Completed performance-note workflow. Record ID: ${noteId}`,
      workflowVersion: 1,
      metadata: { recordId: noteId, recordType: "performance-note" },
    });

    return NextResponse.json({
      success: true,
      message: `Performance note saved successfully for ${data.employeeName}.`,
      noteId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow performance-notes API error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create performance note" },
      { status: 500 },
    );
  }
}
