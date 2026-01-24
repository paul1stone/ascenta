/**
 * Workflows API Route
 * GET /api/workflows - List all available workflows
 * POST /api/workflows/sync - Sync code-defined workflows to database
 */

import { NextResponse } from "next/server";
import {
  listWorkflows,
  syncAllWorkflowsToDatabase,
  registerAllWorkflows,
} from "@/lib/workflows";

export async function GET() {
  try {
    // Ensure workflows are registered
    registerAllWorkflows();

    const workflows = await listWorkflows();

    return NextResponse.json({
      workflows,
      total: workflows.length,
    });
  } catch (error) {
    console.error("Error listing workflows:", error);
    return NextResponse.json(
      { error: "Failed to list workflows" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action === "sync") {
      // Register and sync all workflows to database
      registerAllWorkflows();
      await syncAllWorkflowsToDatabase();

      return NextResponse.json({
        success: true,
        message: "Workflows synced to database",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in workflows action:", error);
    return NextResponse.json(
      { error: "Failed to perform workflow action" },
      { status: 500 }
    );
  }
}
