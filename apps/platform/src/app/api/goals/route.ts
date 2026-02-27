import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal, GOAL_TYPES, GOAL_STATUSES } from "@ascenta/db/goal-schema";
import { Employee } from "@ascenta/db/employee-schema";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { statement, measure, type, owner, timeperiod, dependencies } = body as {
      statement?: string;
      measure?: string;
      type?: string;
      owner?: string;
      timeperiod?: { start?: string; end?: string };
      dependencies?: string[];
    };

    // Validate required fields
    if (!statement || !statement.trim()) {
      return NextResponse.json(
        { error: "statement is required" },
        { status: 400 }
      );
    }
    if (!measure || !measure.trim()) {
      return NextResponse.json(
        { error: "measure is required" },
        { status: 400 }
      );
    }

    // Validate type if provided
    const goalType = type || "individual";
    if (!GOAL_TYPES.includes(goalType as (typeof GOAL_TYPES)[number])) {
      return NextResponse.json(
        { error: "Invalid goal type", validTypes: GOAL_TYPES },
        { status: 400 }
      );
    }

    // Resolve owner — use provided or fall back to first active employee
    let ownerId = owner;
    if (!ownerId) {
      const firstEmployee = await Employee.findOne({ status: "active" })
        .sort({ createdAt: 1 })
        .lean();
      if (!firstEmployee) {
        return NextResponse.json(
          { error: "No active employees found to assign as owner" },
          { status: 400 }
        );
      }
      ownerId = String(firstEmployee._id);
    }

    const goal = await Goal.create({
      statement: statement.trim(),
      measure: measure.trim(),
      type: goalType,
      owner: ownerId,
      createdBy: ownerId,
      timeperiod: timeperiod
        ? {
            start: timeperiod.start ? new Date(timeperiod.start) : undefined,
            end: timeperiod.end ? new Date(timeperiod.end) : undefined,
          }
        : undefined,
      dependencies: dependencies ?? [],
    });

    return NextResponse.json(goal.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const owner = searchParams.get("owner");

    // Build filter
    const filter: Record<string, unknown> = {};
    if (status && GOAL_STATUSES.includes(status as (typeof GOAL_STATUSES)[number])) {
      filter.status = status;
    }
    if (type && GOAL_TYPES.includes(type as (typeof GOAL_TYPES)[number])) {
      filter.type = type;
    }
    if (owner) {
      filter.owner = owner;
    }

    const goals = await Goal.find(filter)
      .populate("owner", "firstName lastName email department jobTitle")
      .sort({ createdAt: -1 })
      .lean();

    // Normalize _id → id for lean docs
    const normalized = goals.map((g) => ({
      ...g,
      id: String(g._id),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("List goals error:", error);
    return NextResponse.json(
      { error: "Failed to list goals" },
      { status: 500 }
    );
  }
}
