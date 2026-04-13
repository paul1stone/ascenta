import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { Notification } from "@ascenta/db/notification-schema";
import { NextResponse } from "next/server";
import { getStaleTransitions } from "@/lib/check-in/transitions";
import { computeGapSignals } from "@/lib/check-in/gap-engine";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const results = {
      generated: 0,
      transitioned: 0,
      gapsComputed: 0,
      notifications: 0,
    };

    // 1. Generate upcoming check-ins from goal cadence
    const twoWeeksOut = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const activeGoals = await Goal.find({
      status: { $in: ["active", "needs_attention"] },
      checkInCadence: { $exists: true },
    })
      .select("_id owner manager checkInCadence")
      .lean();

    // Group by owner+manager pair
    const pairGoals = new Map<string, typeof activeGoals>();
    for (const goal of activeGoals) {
      const ownerId =
        (goal.owner as any)?._id?.toString() || goal.owner?.toString();
      const mgrId =
        (goal.manager as any)?._id?.toString() || goal.manager?.toString();
      if (!ownerId || !mgrId) continue;
      const key = `${ownerId}-${mgrId}`;
      if (!pairGoals.has(key)) pairGoals.set(key, []);
      pairGoals.get(key)!.push(goal);
    }

    for (const [key, goals] of pairGoals) {
      const [employeeId, managerId] = key.split("-");

      // Skip if there's already an active check-in for this pair
      const existing = await CheckIn.findOne({
        employee: employeeId,
        manager: managerId,
        status: {
          $in: ["preparing", "ready", "in_progress", "reflecting"],
        },
      }).lean();

      if (existing) continue;

      const lastCompleted = await CheckIn.findOne({
        employee: employeeId,
        manager: managerId,
        status: "completed",
      })
        .sort({ scheduledAt: -1 })
        .lean();

      const cadenceDays = Math.min(
        ...goals.map((g: any) => {
          switch (g.checkInCadence) {
            case "every_check_in":
              return 14;
            case "monthly":
              return 30;
            case "quarterly":
              return 90;
            default:
              return 14;
          }
        }),
      );

      const lastDate = lastCompleted?.scheduledAt || new Date();
      const nextDate = new Date(
        lastDate.getTime() + cadenceDays * 24 * 60 * 60 * 1000,
      );

      if (nextDate <= twoWeeksOut) {
        const newCheckIn = await CheckIn.create({
          employee: employeeId,
          manager: managerId,
          goals: goals.map((g: any) => g._id),
          scheduledAt: nextDate,
          cadenceSource: "auto",
          status: "preparing",
          previousCheckInId: lastCompleted?._id || null,
        });

        await Notification.create([
          {
            userId: employeeId,
            type: "prepare_open",
            checkInId: newCheckIn._id,
            message:
              "You have an upcoming check-in. Complete your preparation.",
          },
          {
            userId: managerId,
            type: "prepare_open",
            checkInId: newCheckIn._id,
            message:
              "An upcoming check-in is ready for your preparation.",
          },
        ]);

        results.generated++;
        results.notifications += 2;
      }
    }

    // 2. Transition stale check-ins
    const staleCheckIns = await CheckIn.find({
      status: { $in: ["ready", "in_progress", "reflecting"] },
    });

    for (const checkIn of staleCheckIns) {
      const newStatus = getStaleTransitions(checkIn);
      if (newStatus) {
        checkIn.status = newStatus;
        if (newStatus === "completed") checkIn.completedAt = new Date();
        await checkIn.save();
        results.transitioned++;
      }
    }

    // 3. Compute gap signals for completed check-ins missing them
    const needsGaps = await CheckIn.find({
      status: "completed",
      "employeeReflect.completedAt": { $ne: null },
      "managerReflect.completedAt": { $ne: null },
      "gapSignals.generatedAt": null,
    });

    for (const checkIn of needsGaps) {
      const gaps = computeGapSignals(
        {
          clarity: checkIn.managerReflect.clarity,
          recognition: checkIn.managerReflect.recognition,
          development: checkIn.managerReflect.development,
          safety: checkIn.managerReflect.safety,
        },
        {
          heard: checkIn.employeeReflect.heard,
          clarity: checkIn.employeeReflect.clarity,
          recognition: checkIn.employeeReflect.recognition,
          development: checkIn.employeeReflect.development,
          safety: checkIn.employeeReflect.safety,
        },
      );

      checkIn.gapSignals.clarity = gaps.clarity;
      checkIn.gapSignals.recognition = gaps.recognition;
      checkIn.gapSignals.development = gaps.development;
      checkIn.gapSignals.safety = gaps.safety;
      checkIn.gapSignals.generatedAt = new Date();
      await checkIn.save();
      results.gapsComputed++;
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("Check-in cron error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in cron" },
      { status: 500 },
    );
  }
}
