import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const goal = await Goal.findById(id)
      .populate("owner", "firstName lastName email department jobTitle");

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(goal.toJSON());
  } catch (error) {
    console.error("Get goal error:", error);
    return NextResponse.json(
      { error: "Failed to get goal" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const role = req.headers.get("X-Ascenta-Role") || "employee";

    const goal = await Goal.findById(id);
    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    // Block updates to locked goals unless role is HR
    if (goal.status === "locked" && role !== "hr") {
      return NextResponse.json(
        { error: "Cannot update a locked goal. HR role required." },
        { status: 403 }
      );
    }

    // Apply allowed updates
    const allowedFields = [
      "statement",
      "measure",
      "type",
      "owner",
      "timeperiod",
      "dependencies",
      "status",
      "visibility",
      "parentGoal",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    const updated = await Goal.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate("owner", "firstName lastName email department jobTitle");

    return NextResponse.json(updated!.toJSON());
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}
