import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const goal = await Goal.findById(id);
    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    if (goal.status === "locked") {
      return NextResponse.json(
        { error: "Goal is already locked" },
        { status: 400 }
      );
    }

    const updated = await Goal.findByIdAndUpdate(
      id,
      { $set: { status: "locked" } },
      { new: true }
    ).populate("owner", "firstName lastName email department jobTitle");

    return NextResponse.json(updated!.toJSON());
  } catch (error) {
    console.error("Lock goal error:", error);
    return NextResponse.json(
      { error: "Failed to lock goal" },
      { status: 500 }
    );
  }
}
