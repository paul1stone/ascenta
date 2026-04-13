import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import {
  TrackedDocument,
  WorkflowRun,
  WorkflowDefinition,
  AuditEvent,
} from "@ascenta/db/workflow-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { Notification as NotificationModel } from "@ascenta/db/notification-schema";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  checkInId?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const userId = request.headers.get("x-dev-user-id");

    const allNotifications: NotificationItem[] = [];

    // The first five buckets are workspace-wide activity (not scoped to
    // a specific user), so they are surfaced as `read: true` — they show
    // in the feed for context but must not inflate the per-user unread
    // count. Only the per-user Notification model (bucket 6) claims
    // unread state.

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
          read: true,
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
          read: true,
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
          read: true,
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
          read: true,
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
          read: true,
        });
      }
    } catch {
      // silent
    }

    // 6. Check-in lifecycle notifications (from Notification model)
    if (userId) {
      try {
        const NOTIFICATION_TITLES: Record<string, string> = {
          prepare_open: "Check-in Preparation Open",
          prepare_reminder: "Preparation Reminder",
          checkin_ready: "Check-in Ready",
          reflect_open: "Reflection Open",
          reflect_reminder: "Reflection Reminder",
          gap_signal: "Gap Signal Detected",
        };

        const checkInNotifications = await NotificationModel.find({
          userId,
          createdAt: { $gt: sevenDaysAgo },
        })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();

        for (const n of checkInNotifications) {
          allNotifications.push({
            id: `checkin-notif-${n._id}`,
            type: n.type,
            title: NOTIFICATION_TITLES[n.type] ?? n.type,
            message: n.message,
            timestamp: n.createdAt,
            read: n.read,
            link: `/grow/check-ins/${n.checkInId}`,
            checkInId: String(n.checkInId),
          });
        }
      } catch (error) {
        console.error("Error fetching check-in notifications:", error);
      }
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
