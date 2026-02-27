import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";

export async function GET() {
  try {
    await connectDB();

    const overdueCheckIns = await CheckIn.find({
      status: "scheduled",
      scheduledDate: { $lt: new Date() },
    })
      .populate("goal", "statement measure")
      .populate("employee", "firstName lastName email managerName")
      .sort({ scheduledDate: 1 });

    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overdueCheckIns.map((c: any) => c.toJSON())
    );
  } catch (error) {
    console.error("List overdue check-ins error:", error);
    return NextResponse.json(
      { error: "Failed to list overdue check-ins" },
      { status: 500 }
    );
  }
}
