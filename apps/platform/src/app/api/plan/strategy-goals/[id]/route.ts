import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { strategyGoalPatchSchema } from "@/lib/validations/strategy-goal";
import { getServerUser } from "@/lib/auth/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getServerUser(req);
    if (!user || user.role === "employee") {
      return NextResponse.json(
        { success: false, error: "Not authorized to edit strategy goals" },
        { status: 403 },
      );
    }
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = strategyGoalPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await StrategyGoal.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Strategy goal not found" },
        { status: 404 },
      );
    }

    const data = parsed.data;

    if (user.role === "manager") {
      const existingDept = (existing as { department?: string | null }).department;
      const existingScope = (existing as { scope?: string }).scope;
      if (existingScope !== "department" || existingDept !== user.department) {
        return NextResponse.json(
          { success: false, error: "Managers can only edit goals in their own department" },
          { status: 403 },
        );
      }
      if (data.scope !== undefined && data.scope !== "department") {
        return NextResponse.json(
          { success: false, error: "Managers cannot change scope to company-wide" },
          { status: 403 },
        );
      }
      if (data.department !== undefined && data.department !== user.department) {
        return NextResponse.json(
          { success: false, error: "Managers cannot reassign goals to another department" },
          { status: 403 },
        );
      }
    }

    const update: Record<string, unknown> = {};

    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.horizon !== undefined) update.horizon = data.horizon;
    if (data.scope !== undefined) update.scope = data.scope;
    if (data.department !== undefined) update.department = data.scope === "department" ? data.department : null;
    if (data.successMetrics !== undefined) update.successMetrics = data.successMetrics;
    if (data.rationale !== undefined) update.rationale = data.rationale;
    if (data.status !== undefined) update.status = data.status;
    if (data.startDate && data.endDate) {
      update.timePeriod = { start: new Date(data.startDate), end: new Date(data.endDate) };
    }

    const goal = await StrategyGoal.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Strategy goal not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, goal: goal.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy goal PATCH error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update strategy goal" },
      { status: 500 },
    );
  }
}
