import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { strategyGoalFormSchema } from "@/lib/validations/strategy-goal";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");
    const horizon = searchParams.get("horizon");
    const department = searchParams.get("department");

    const filter: Record<string, unknown> = {};
    if (scope) filter.scope = scope;
    if (horizon) filter.horizon = horizon;
    if (department) filter.department = department;

    if (!searchParams.has("includeArchived")) {
      filter.status = { $ne: "archived" };
    }

    const goals = await StrategyGoal.find(filter)
      .sort({ horizon: 1, createdAt: -1 })
      .lean();

    const transformed = goals.map((g: Record<string, unknown>) => ({
      ...g,
      id: String(g._id),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ success: true, goals: transformed });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy goals GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch strategy goals" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = strategyGoalFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const goal = await StrategyGoal.create({
      title: data.title,
      description: data.description,
      horizon: data.horizon,
      timePeriod: {
        start: new Date(data.startDate),
        end: new Date(data.endDate),
      },
      scope: data.scope,
      department: data.scope === "department" ? data.department : null,
      successMetrics: data.successMetrics,
      rationale: data.rationale || "",
      status: data.status,
    });

    return NextResponse.json({ success: true, goal: goal.toJSON() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy goals POST error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create strategy goal" },
      { status: 500 },
    );
  }
}
