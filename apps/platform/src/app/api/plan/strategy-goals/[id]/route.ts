import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { strategyGoalFormSchema } from "@/lib/validations/strategy-goal";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = strategyGoalFormSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const update: Record<string, unknown> = {};

    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.horizon !== undefined) update.horizon = data.horizon;
    if (data.scope !== undefined) update.scope = data.scope;
    if (data.department !== undefined) update.department = data.scope === "department" ? data.department : null;
    if (data.successMetrics !== undefined) update.successMetrics = data.successMetrics;
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
