import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  auditEvents,
  workflowRuns,
  workflowDefinitions,
  trackedDocuments,
} from "@/lib/db/workflow-schema";
import { eq, desc, or, isNotNull } from "drizzle-orm";

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
    // --------------- Audit Events ---------------

    const auditRows = await db
      .select({
        id: auditEvents.id,
        action: auditEvents.action,
        description: auditEvents.description,
        actorId: auditEvents.actorId,
        actorType: auditEvents.actorType,
        metadata: auditEvents.metadata,
        timestamp: auditEvents.timestamp,
        workflowName: workflowDefinitions.name,
      })
      .from(auditEvents)
      .leftJoin(workflowRuns, eq(auditEvents.workflowRunId, workflowRuns.id))
      .leftJoin(
        workflowDefinitions,
        eq(workflowRuns.workflowDefinitionId, workflowDefinitions.id)
      )
      .orderBy(desc(auditEvents.timestamp))
      .limit(20);

    const auditActivities: ActivityItem[] = auditRows.map((row) => ({
      id: row.id,
      type: row.action,
      description:
        row.description ||
        `${row.action}${row.workflowName ? ` - ${row.workflowName}` : ""}`,
      actor: row.actorId,
      timestamp: row.timestamp.toISOString(),
      metadata: row.metadata ?? undefined,
    }));

    // --------------- Recent Document Events ---------------

    const documentRows = await db
      .select({
        id: trackedDocuments.id,
        title: trackedDocuments.title,
        stage: trackedDocuments.stage,
        employeeName: trackedDocuments.employeeName,
        sentAt: trackedDocuments.sentAt,
        acknowledgedAt: trackedDocuments.acknowledgedAt,
        updatedAt: trackedDocuments.updatedAt,
      })
      .from(trackedDocuments)
      .where(
        or(
          isNotNull(trackedDocuments.sentAt),
          isNotNull(trackedDocuments.acknowledgedAt)
        )
      )
      .orderBy(desc(trackedDocuments.updatedAt))
      .limit(20);

    const documentActivities: ActivityItem[] = documentRows.map((row) => {
      // Use the most recent meaningful timestamp
      const timestamp = row.acknowledgedAt || row.sentAt || row.updatedAt;

      return {
        id: row.id,
        type: "document_update",
        description: `Document '${row.title}' moved to ${row.stage}`,
        actor: row.employeeName || "System",
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
