import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import {
  AuditEvent,
  TrackedDocument,
  WorkflowRun,
  WorkflowDefinition,
} from "@ascenta/db/workflow-schema";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: unknown;
}

export async function GET() {
  try {
    await connectDB();

    // --------------- Audit Events ---------------

    const auditRows = await AuditEvent.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    const auditActivities: ActivityItem[] = [];

    for (const row of auditRows) {
      let workflowName: string | null = null;
      if (row.workflowRunId) {
        const run = await WorkflowRun.findById(row.workflowRunId)
          .select("workflowDefinitionId")
          .lean() as Record<string, unknown> | null;
        if (run?.workflowDefinitionId) {
          const def = await WorkflowDefinition.findById(run.workflowDefinitionId)
            .select("name")
            .lean() as Record<string, unknown> | null;
          workflowName = (def?.name as string) ?? null;
        }
      }

      auditActivities.push({
        id: String(row._id),
        type: row.action as string,
        description:
          (row.description as string) ||
          `${row.action}${workflowName ? ` - ${workflowName}` : ""}`,
        actor: row.actorId as string,
        timestamp: (row.timestamp as Date).toISOString(),
        metadata: row.metadata ?? undefined,
      });
    }

    // --------------- Recent Document Events ---------------

    const documentRows = await TrackedDocument.find({
      $or: [
        { sentAt: { $ne: null } },
        { acknowledgedAt: { $ne: null } },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const documentActivities: ActivityItem[] = documentRows.map((row) => {
      const timestamp =
        (row.acknowledgedAt as Date) || (row.sentAt as Date) || (row.updatedAt as Date);

      return {
        id: String(row._id),
        type: "document_update",
        description: `Document '${row.title}' moved to ${row.stage}`,
        actor: (row.employeeName as string) || "System",
        timestamp: timestamp.toISOString(),
      };
    });

    // --------------- Combine and Sort ---------------

    const allActivities = [...auditActivities, ...documentActivities]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20);

    return NextResponse.json({ activity: allActivities });
  } catch (error) {
    console.error("Dashboard activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
