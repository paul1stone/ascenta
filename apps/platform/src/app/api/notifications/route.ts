import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import {
  TrackedDocument,
  WorkflowRun,
  WorkflowDefinition,
  AuditEvent,
} from "@ascenta/db/workflow-schema";
import { Goal } from "@ascenta/db/goal-schema";

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
    await connectDB();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const allNotifications: Notification[] = [];

    // 1. Documents acknowledged recently (last 7 days)
    try {
      const acknowledgedDocs = await TrackedDocument.find({
        acknowledgedAt: { $ne: null, $gt: sevenDaysAgo },
      }).lean();

      for (const doc of acknowledgedDocs) {
        allNotifications.push({
          id: `doc-ack-${doc._id}`,
          type: "document_acknowledged",
          title: "Document Acknowledged",
          message: `${doc.employeeName} acknowledged '${doc.title}'`,
          link: "/tracker",
          timestamp: doc.acknowledgedAt as Date,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching acknowledged documents:", error);
    }

    // 2. Documents sent recently (last 7 days)
    try {
      const sentDocs = await TrackedDocument.find({
        sentAt: { $ne: null, $gt: sevenDaysAgo },
      }).lean();

      for (const doc of sentDocs) {
        allNotifications.push({
          id: `doc-sent-${doc._id}`,
          type: "document_sent",
          title: "Document Sent",
          message: `'${doc.title}' was sent to ${doc.employeeName}`,
          link: "/tracker",
          timestamp: doc.sentAt as Date,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching sent documents:", error);
    }

    // 3. Workflows completed recently (last 7 days)
    try {
      const completedWorkflows = await WorkflowRun.find({
        status: "completed",
        completedAt: { $ne: null, $gt: sevenDaysAgo },
      }).lean();

      for (const run of completedWorkflows) {
        let workflowName = "Workflow";
        if (run.workflowDefinitionId) {
          const def = await WorkflowDefinition.findById(run.workflowDefinitionId)
            .select("name")
            .lean() as Record<string, unknown> | null;
          workflowName = (def?.name as string) ?? "Workflow";
        }

        allNotifications.push({
          id: `wf-complete-${run._id}`,
          type: "workflow_completed",
          title: "Workflow Completed",
          message: `${workflowName} completed successfully`,
          timestamp: run.completedAt as Date,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching completed workflows:", error);
    }

    // 4. Recent audit events (last 3 days, limit 10)
    try {
      const recentAudits = await AuditEvent.find({
        timestamp: { $gt: threeDaysAgo },
      })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

      for (const event of recentAudits) {
        const capitalize = (s: string) =>
          s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

        allNotifications.push({
          id: `audit-${event._id}`,
          type: "audit_event",
          title: capitalize(event.action as string),
          message: (event.description as string) || `Action: ${event.action}`,
          timestamp: event.timestamp as Date,
          read: false,
        });
      }
    } catch (error) {
      console.error("Error fetching audit events:", error);
    }

    // 5. Goals pending review (last 7 days)
    try {
      const pendingGoals = await Goal.find({
        status: "pending_review",
        createdAt: { $gt: sevenDaysAgo },
      })
        .populate("owner", "firstName lastName")
        .lean();

      for (const goal of pendingGoals) {
        const g = goal as Record<string, unknown>;
        const owner = g.owner as Record<string, unknown> | null;
        const ownerName = owner
          ? `${owner.firstName} ${owner.lastName}`
          : "An employee";
        allNotifications.push({
          id: `goal-pending-${g._id}`,
          type: "goal_pending_review",
          title: "Goal Pending Review",
          message: `${ownerName} submitted a goal for review: ${g.title}`,
          timestamp: g.createdAt as Date,
          read: false,
        });
      }
    } catch {
      // silent
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
