import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";

export async function GET() {
  try {
    await connectDB();

    const [goalsByStatus, checkInStats, overdueCheckIns, goalsWithoutCheckIns, recentNotesCount] =
      await Promise.all([
        Goal.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        CheckIn.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        CheckIn.find({
          status: "scheduled",
          scheduledDate: { $lt: new Date() },
        })
          .populate("goal", "statement")
          .populate("employee", "firstName lastName managerName")
          .sort({ scheduledDate: 1 })
          .limit(20),
        Goal.aggregate([
          { $match: { status: { $in: ["active", "draft"] } } },
          {
            $lookup: {
              from: "checkins",
              localField: "_id",
              foreignField: "goal",
              as: "checkIns",
            },
          },
          { $match: { checkIns: { $size: 0 } } },
          { $project: { statement: 1, status: 1 } },
        ]),
        PerformanceNote.countDocuments({
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

    return NextResponse.json({
      goalsByStatus: goalsByStatus.map(
        (g: { _id: string; count: number }) => ({
          status: g._id,
          count: g.count,
        }),
      ),
      checkInStats: checkInStats.map(
        (c: { _id: string; count: number }) => ({
          status: c._id,
          count: c.count,
        }),
      ),
      overdueCheckIns: overdueCheckIns.map((c) => c.toJSON()),
      goalsWithoutCheckIns,
      recentNotesCount,
    });
  } catch (error) {
    console.error("Grow status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grow status" },
      { status: 500 },
    );
  }
}
