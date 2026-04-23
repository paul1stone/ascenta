import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { TrackedDocument, WorkflowRun } from "@ascenta/db/workflow-schema";
import { computeConversationCadence } from "@/lib/perf-reviews/conversation-cadence";

interface AttentionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  link?: string;
}

const FINAL_REVIEW_STATUSES = ["finalized", "acknowledged", "shared"];

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export async function GET() {
  await connectDB();
  const items: AttentionItem[] = [];

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // 1. Documents stuck in "on_us_to_send"
  try {
    const stuckDocs = await TrackedDocument.find({ stage: "on_us_to_send" })
      .select("title employeeName")
      .lean();

    for (const doc of stuckDocs) {
      items.push({
        id: `doc-stuck-${doc._id}`,
        type: "document_stuck",
        title: `Ready to send: ${doc.title}`,
        description: `Document for ${(doc.employeeName as string) ?? "Unknown"} is waiting to be sent`,
        priority: "high",
        link: "/tracker",
      });
    }
  } catch (error) {
    console.error("Attention query failed (stuck docs):", error);
  }

  // 2. Documents sent but not acknowledged (>3 days)
  try {
    const unackedDocs = await TrackedDocument.find({
      stage: "sent",
      sentAt: { $ne: null, $lt: threeDaysAgo },
      acknowledgedAt: null,
    })
      .select("title employeeName sentAt")
      .lean();

    for (const doc of unackedDocs) {
      const sentDate = doc.sentAt
        ? new Date(doc.sentAt as Date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "unknown date";

      items.push({
        id: `doc-unacked-${doc._id}`,
        type: "awaiting_ack",
        title: `Awaiting acknowledgment: ${doc.title}`,
        description: `${(doc.employeeName as string) ?? "Unknown"} hasn't acknowledged since ${sentDate}`,
        priority: "high",
        link: "/tracker",
      });
    }
  } catch (error) {
    console.error("Attention query failed (unacked docs):", error);
  }

  // 3. Employees on leave
  try {
    const onLeave = await Employee.find({ status: "on_leave" })
      .select("firstName lastName department jobTitle")
      .lean();

    for (const emp of onLeave) {
      items.push({
        id: `emp-leave-${emp._id}`,
        type: "on_leave",
        title: `${emp.firstName} ${emp.lastName} is on leave`,
        description: `${emp.department} - ${emp.jobTitle}`,
        priority: "medium",
      });
    }
  } catch (error) {
    console.error("Attention query failed (on leave):", error);
  }

  // 4. Stalled workflows (intake or review for >2 days)
  try {
    const stalled = await WorkflowRun.find({
      status: { $in: ["intake", "review"] },
      updatedAt: { $lt: twoDaysAgo },
    })
      .select("status")
      .lean();

    for (const wf of stalled) {
      items.push({
        id: `wf-stalled-${wf._id}`,
        type: "stalled_workflow",
        title: "Stalled workflow",
        description: `Workflow has been in ${wf.status} for over 2 days`,
        priority: "medium",
      });
    }
  } catch (error) {
    console.error("Attention query failed (stalled workflows):", error);
  }

  // 5. 90-day performance conversation guardrail
  //    Flags active employees with no completed check-in, performance note,
  //    or finalized performance review in the last 90+ days.
  try {
    const active = await Employee.find({ status: "active" })
      .select("firstName lastName hireDate status")
      .lean();

    if (active.length) {
      const employeeIds = active.map((e) => e._id);

      const [checkInAgg, noteAgg, reviewAgg] = await Promise.all([
        CheckIn.aggregate([
          {
            $match: {
              employee: { $in: employeeIds },
              completedAt: { $ne: null },
            },
          },
          { $group: { _id: "$employee", lastAt: { $max: "$completedAt" } } },
        ]),
        PerformanceNote.aggregate([
          { $match: { employee: { $in: employeeIds } } },
          { $group: { _id: "$employee", lastAt: { $max: "$createdAt" } } },
        ]),
        PerformanceReview.aggregate([
          {
            $match: {
              employee: { $in: employeeIds },
              status: { $in: FINAL_REVIEW_STATUSES },
            },
          },
          { $group: { _id: "$employee", lastAt: { $max: "$updatedAt" } } },
        ]),
      ]);

      const checkInMap = new Map<string, Date>();
      for (const r of checkInAgg) checkInMap.set(String(r._id), r.lastAt);
      const noteMap = new Map<string, Date>();
      for (const r of noteAgg) noteMap.set(String(r._id), r.lastAt);
      const reviewMap = new Map<string, Date>();
      for (const r of reviewAgg) reviewMap.set(String(r._id), r.lastAt);

      for (const emp of active) {
        const id = String(emp._id);
        const cadence = computeConversationCadence({
          now,
          hireDate: emp.hireDate as Date,
          employeeStatus: (emp.status as string) ?? "active",
          lastCheckInAt: checkInMap.get(id) ?? null,
          lastNoteAt: noteMap.get(id) ?? null,
          lastReviewAt: reviewMap.get(id) ?? null,
        });

        if (cadence.severity === "none") continue;

        items.push({
          id: `perf-overdue-${id}`,
          type: "performance_conversation_overdue",
          title: `No performance conversation in ${cadence.daysSince} days`,
          description: `${emp.firstName} ${emp.lastName} — last documented conversation ${
            cadence.lastConversationAt
              ? `on ${new Date(cadence.lastConversationAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : "never recorded"
          }`,
          priority: cadence.severity,
          link: `/dashboard/grow/check-ins?employee=${id}`,
        });
      }
    }
  } catch (error) {
    console.error("Attention query failed (perf conversation guardrail):", error);
  }

  // Sort by priority (high first), then limit to 10
  items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const limited = items.slice(0, 10);

  return NextResponse.json({ items: limited });
}
