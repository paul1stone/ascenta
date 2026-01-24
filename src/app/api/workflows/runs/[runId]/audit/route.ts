/**
 * Workflow Audit Trail API Route
 * GET /api/workflows/runs/[runId]/audit - Get audit trail for a run
 */

import { NextResponse } from "next/server";
import {
  getAuditTrail,
  verifyAuditTrailIntegrity,
  formatAuditTrailReport,
  exportAuditTrailAsJson,
} from "@/lib/workflows";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const verify = searchParams.get("verify") === "true";

    const events = await getAuditTrail(runId);

    if (events.length === 0) {
      return NextResponse.json(
        { error: "No audit events found for this run" },
        { status: 404 }
      );
    }

    // Verify integrity if requested
    let integrity = null;
    if (verify) {
      integrity = await verifyAuditTrailIntegrity(runId);
    }

    // Return in requested format
    if (format === "text") {
      const report = formatAuditTrailReport(events);
      return new Response(report, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="audit-trail-${runId}.txt"`,
        },
      });
    }

    if (format === "json-export") {
      const jsonExport = exportAuditTrailAsJson(events);
      return new Response(jsonExport, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="audit-trail-${runId}.json"`,
        },
      });
    }

    return NextResponse.json({
      events,
      total: events.length,
      integrity,
    });
  } catch (error) {
    console.error("Error getting audit trail:", error);
    return NextResponse.json(
      { error: "Failed to get audit trail" },
      { status: 500 }
    );
  }
}
