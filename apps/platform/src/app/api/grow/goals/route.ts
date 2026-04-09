import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import { WorkflowRun } from "@ascenta/db/workflow-schema";
import { logAuditEvent } from "@/lib/workflows";
import { parseTimePeriod } from "@/lib/ai/grow-tools";
import { goalFormSchema } from "@/lib/validations/goal";

// ============================================================================
// GET — Fetch goals for an employee
// ============================================================================

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

// ============================================================================
// POST — Create a new goal
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { runId, createdByRole, ...formData } = body;
    const effectiveRunId = runId || crypto.randomUUID();

    const parsed = goalFormSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Support both MongoDB ObjectId and EMP-style employee IDs
    let employee = await getEmployeeByEmployeeId(data.employeeId);
    if (!employee && data.employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      const doc = await Employee.findById(data.employeeId);
      if (doc) {
        employee = {
          id: String(doc._id),
          employeeId: doc.employeeId,
        } as unknown as typeof employee;
      }
    }
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

    // Key results: set initial status to not_started, parse deadline strings to Dates
    const keyResults = data.keyResults.map((kr) => ({
      description: kr.description,
      metric: kr.metric,
      deadline: new Date(kr.deadline),
      status: "not_started" as const,
    }));

    const isManagerOrHR =
      createdByRole === "hr" || createdByRole === "manager";

    const goal = await Goal.create({
      objectiveStatement: data.objectiveStatement,
      goalType: data.goalType,
      keyResults,
      strategyGoalId: data.strategyGoalId || null,
      teamGoalId: data.teamGoalId || null,
      supportAgreement: data.supportAgreement || "",
      checkInCadence: data.checkInCadence,
      timePeriod,
      notes: data.notes || "",
      status: isManagerOrHR ? "pending_confirmation" : "draft",
      managerConfirmed: isManagerOrHR
        ? { confirmed: true, at: new Date() }
        : { confirmed: false, at: null },
      employeeConfirmed: { confirmed: false, at: null },
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
      description: `Goal created. Record ID: ${goalId}`,
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

// ============================================================================
// PATCH — Goal actions (confirm, request_changes, update_status, recalibrate)
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { goalId, action } = body;

    if (!goalId || !action) {
      return NextResponse.json(
        { success: false, error: "goalId and action are required" },
        { status: 400 },
      );
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 },
      );
    }

    // --- Confirm ---
    if (action === "confirm") {
      const { role } = body as { role: "employee" | "manager" };
      if (!role || !["employee", "manager"].includes(role)) {
        return NextResponse.json(
          { success: false, error: "role must be 'employee' or 'manager'" },
          { status: 400 },
        );
      }

      const confirmField =
        role === "employee" ? "employeeConfirmed" : "managerConfirmed";
      goal[confirmField] = { confirmed: true, at: new Date() };

      // Auto-activate if both confirmed and strategy pillar is set
      const otherField =
        role === "employee" ? "managerConfirmed" : "employeeConfirmed";
      const bothConfirmed =
        goal[confirmField].confirmed && goal[otherField]?.confirmed;

      if (bothConfirmed && goal.strategyGoalId) {
        goal.status = "active";
      } else if (goal.status === "draft") {
        goal.status = "pending_confirmation";
      }

      await goal.save();

      return NextResponse.json({
        success: true,
        message:
          goal.status === "active"
            ? "Goal activated — both parties confirmed."
            : `${role === "employee" ? "Employee" : "Manager"} confirmation recorded.`,
        status: goal.status,
      });
    }

    // --- Request changes ---
    if (action === "request_changes") {
      goal.status = "draft";
      goal.employeeConfirmed = { confirmed: false, at: null };
      goal.managerConfirmed = { confirmed: false, at: null };
      await goal.save();

      return NextResponse.json({
        success: true,
        message: "Changes requested. Goal returned to draft.",
      });
    }

    // --- Update status ---
    if (action === "update_status") {
      const { status } = body as { status: string };
      const allowedStatuses = ["needs_attention", "blocked", "completed"];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `status must be one of: ${allowedStatuses.join(", ")}`,
          },
          { status: 400 },
        );
      }

      goal.status = status;
      await goal.save();

      return NextResponse.json({
        success: true,
        message: `Goal status updated to ${status}.`,
      });
    }

    // --- Recalibrate ---
    if (action === "recalibrate") {
      const { reason, revisedFields, revisedSupportAgreement } = body as {
        reason: string;
        revisedFields: Record<string, unknown>;
        revisedSupportAgreement?: string;
      };

      if (!reason || !revisedFields) {
        return NextResponse.json(
          { success: false, error: "reason and revisedFields are required" },
          { status: 400 },
        );
      }

      // Snapshot current state
      const snapshot: Record<string, unknown> = {
        objectiveStatement: goal.objectiveStatement,
        goalType: goal.goalType,
        keyResults: goal.keyResults?.map((kr: Record<string, unknown>) => ({
          description: kr.description,
          metric: kr.metric,
          deadline: kr.deadline,
          status: kr.status,
        })),
        supportAgreement: goal.supportAgreement,
        strategyGoalId: goal.strategyGoalId,
      };

      goal.recalibrations.push({
        recalibratedAt: new Date(),
        reason,
        previousSnapshot: snapshot,
        revisedFields,
        revisedSupportAgreement: revisedSupportAgreement || null,
      });

      // Apply revised fields
      for (const [key, value] of Object.entries(revisedFields)) {
        if (key in goal.schema.paths) {
          (goal as Record<string, unknown>)[key] = value;
        }
      }

      if (revisedSupportAgreement !== undefined) {
        goal.supportAgreement = revisedSupportAgreement;
      }

      // Reset confirmations
      goal.status = "pending_confirmation";
      goal.employeeConfirmed = { confirmed: false, at: null };
      goal.managerConfirmed = { confirmed: false, at: null };
      await goal.save();

      return NextResponse.json({
        success: true,
        message: "Goal recalibrated. Both parties must re-confirm.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Grow goals PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update goal" },
      { status: 500 },
    );
  }
}
