import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // If completing, require progress field
    if (body.status === "completed") {
      if (!body.progress) {
        return NextResponse.json(
          { error: "progress is required when completing a check-in" },
          { status: 400 }
        );
      }
      body.completedDate = new Date();
    }

    const checkIn = await CheckIn.findByIdAndUpdate(id, body, { new: true })
      .populate("goal", "statement measure status")
      .populate("employee", "firstName lastName email");

    if (!checkIn) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(checkIn.toJSON());
  } catch (error) {
    console.error("Update check-in error:", error);
    return NextResponse.json(
      { error: "Failed to update check-in" },
      { status: 500 }
    );
  }
}
