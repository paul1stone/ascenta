import { NextResponse } from "next/server";
import { db } from "@ascenta/db";
import {
  trackedDocuments,
  workflowRuns,
  workflowDefinitions,
  auditEvents,
} from "@ascenta/db/workflow-schema";
import { eq, desc, sql, and, isNotNull } from "drizzle-orm";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export async function GET() {
  try {
    const allNotifications: Notification[] = [];

    // 1. Documents acknowledged recently (last 7 days)
    try {
      const acknowledgedDocs = await db
        .select()
        .from(trackedDocuments)
        .where(
          and(
            isNotNull(trackedDocuments.acknowledgedAt),
            sql`${trackedDocuments.acknowledgedAt} > NOW() - INTERVAL '7 days'`
          )
        );

      for (const doc of acknowledgedDocs) {
        allNotifications.push({
          id: `doc-ack-${doc.id}`,
          type: "document_acknowledged",
          title: "Document Acknowledged",
          message: `${doc.employeeName} acknowledged '${doc.title}'`,
          link: "/tracker",
          timestamp: doc.acknowledgedAt!,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching acknowledged documents:", error);
    }

    // 2. Documents sent recently (last 7 days)
    try {
      const sentDocs = await db
        .select()
        .from(trackedDocuments)
        .where(
          and(
            isNotNull(trackedDocuments.sentAt),
            sql`${trackedDocuments.sentAt} > NOW() - INTERVAL '7 days'`
          )
        );

      for (const doc of sentDocs) {
        allNotifications.push({
          id: `doc-sent-${doc.id}`,
          type: "document_sent",
          title: "Document Sent",
          message: `'${doc.title}' was sent to ${doc.employeeName}`,
          link: "/tracker",
          timestamp: doc.sentAt!,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching sent documents:", error);
    }

    // 3. Workflows completed recently (last 7 days)
    try {
      const completedWorkflows = await db
        .select({
          id: workflowRuns.id,
          completedAt: workflowRuns.completedAt,
          workflowName: workflowDefinitions.name,
        })
        .from(workflowRuns)
        .leftJoin(
          workflowDefinitions,
          eq(workflowRuns.workflowDefinitionId, workflowDefinitions.id)
        )
        .where(
          and(
            eq(workflowRuns.status, "completed"),
            isNotNull(workflowRuns.completedAt),
            sql`${workflowRuns.completedAt} > NOW() - INTERVAL '7 days'`
          )
        );

      for (const run of completedWorkflows) {
        allNotifications.push({
          id: `wf-complete-${run.id}`,
          type: "workflow_completed",
          title: "Workflow Completed",
          message: `${run.workflowName || "Workflow"} completed successfully`,
          timestamp: run.completedAt!,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching completed workflows:", error);
    }

    // 4. Recent audit events (last 3 days, limit 10)
    try {
      const recentAudits = await db
        .select()
        .from(auditEvents)
        .where(sql`${auditEvents.timestamp} > NOW() - INTERVAL '3 days'`)
        .orderBy(desc(auditEvents.timestamp))
        .limit(10);

      for (const event of recentAudits) {
        const capitalize = (s: string) =>
          s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

        allNotifications.push({
          id: `audit-${event.id}`,
          type: "audit_event",
          title: capitalize(event.action),
          message: event.description || `Action: ${event.action}`,
          timestamp: event.timestamp,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching audit events:", error);
    }

    // Combine all, sort by timestamp desc, limit 20
    const notifications = allNotifications
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { notifications: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}
