import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { goal, employee, scheduledDate, cadence } = body as {
      goal?: string;
      employee?: string;
      scheduledDate?: string;
      cadence?: string;
    };

    // Validate required fields
    if (!goal || !employee || !scheduledDate || !cadence) {
      return NextResponse.json(
        { error: "Missing required fields: goal, employee, scheduledDate, cadence" },
        { status: 400 }
      );
    }

    const checkIn = await CheckIn.create({
      goal,
      employee,
      scheduledDate: new Date(scheduledDate),
      cadence,
    });

    return NextResponse.json(checkIn.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Create check-in error:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employee = searchParams.get("employee");
    const goal = searchParams.get("goal");
    const status = searchParams.get("status");

    const filter: Record<string, string> = {};
    if (employee) filter.employee = employee;
    if (goal) filter.goal = goal;
    if (status) filter.status = status;

    const checkIns = await CheckIn.find(filter)
      .populate("goal", "statement measure status")
      .populate("employee", "firstName lastName email")
      .sort({ scheduledDate: -1 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(checkIns.map((c: any) => c.toJSON()));
  } catch (error) {
    console.error("List check-ins error:", error);
    return NextResponse.json(
      { error: "Failed to list check-ins" },
      { status: 500 }
    );
  }
}
