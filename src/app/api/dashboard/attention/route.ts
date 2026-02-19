import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees } from "@/lib/db/employee-schema";
import { trackedDocuments, workflowRuns } from "@/lib/db/workflow-schema";
import { eq, and, lt, isNotNull, isNull, sql, count } from "drizzle-orm";

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
  const items: AttentionItem[] = [];

  // 1. Documents stuck in "on_us_to_send"
  try {
    const stuckDocs = await db
      .select({
        id: trackedDocuments.id,
        title: trackedDocuments.title,
        employeeName: trackedDocuments.employeeName,
      })
      .from(trackedDocuments)
      .where(eq(trackedDocuments.stage, "on_us_to_send"));

    for (const doc of stuckDocs) {
      items.push({
        id: `doc-stuck-${doc.id}`,
        type: "document_stuck",
        title: `Ready to send: ${doc.title}`,
        description: `Document for ${doc.employeeName ?? "Unknown"} is waiting to be sent`,
        priority: "high",
        link: "/tracker",
      });
    }
  } catch (error) {
    console.error("Attention query failed (stuck docs):", error);
  }

  // 2. Documents sent but not acknowledged (>3 days)
  try {
    const unackedDocs = await db
      .select({
        id: trackedDocuments.id,
        title: trackedDocuments.title,
        employeeName: trackedDocuments.employeeName,
        sentAt: trackedDocuments.sentAt,
      })
      .from(trackedDocuments)
      .where(
        and(
          eq(trackedDocuments.stage, "sent"),
          isNotNull(trackedDocuments.sentAt),
          sql`${trackedDocuments.sentAt} < NOW() - INTERVAL '3 days'`,
          isNull(trackedDocuments.acknowledgedAt)
        )
      );

    for (const doc of unackedDocs) {
      const sentDate = doc.sentAt
        ? new Date(doc.sentAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "unknown date";

      items.push({
        id: `doc-unacked-${doc.id}`,
        type: "awaiting_ack",
        title: `Awaiting acknowledgment: ${doc.title}`,
        description: `${doc.employeeName ?? "Unknown"} hasn't acknowledged since ${sentDate}`,
        priority: "high",
        link: "/tracker",
      });
    }
  } catch (error) {
    console.error("Attention query failed (unacked docs):", error);
  }

  // 3. Employees on leave
  try {
    const onLeave = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        department: employees.department,
        jobTitle: employees.jobTitle,
      })
      .from(employees)
      .where(eq(employees.status, "on_leave"));

    for (const emp of onLeave) {
      items.push({
        id: `emp-leave-${emp.id}`,
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
    const stalled = await db
      .select({
        id: workflowRuns.id,
        status: workflowRuns.status,
      })
      .from(workflowRuns)
      .where(
        and(
          sql`${workflowRuns.status} IN ('intake', 'review')`,
          sql`${workflowRuns.updatedAt} < NOW() - INTERVAL '2 days'`
        )
      );

    for (const wf of stalled) {
      items.push({
        id: `wf-stalled-${wf.id}`,
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
