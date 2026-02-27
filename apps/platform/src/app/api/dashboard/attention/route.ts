import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { TrackedDocument, WorkflowRun } from "@ascenta/db/workflow-schema";

interface AttentionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  link?: string;
}

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

  // Sort by priority (high first), then limit to 10
  items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const limited = items.slice(0, 10);

  return NextResponse.json({ items: limited });
}
