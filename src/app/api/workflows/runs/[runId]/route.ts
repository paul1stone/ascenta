/**
 * Workflow Run Management API Route
 * GET /api/workflows/runs/[runId] - Get run details
 * PUT /api/workflows/runs/[runId] - Update run inputs
 * DELETE /api/workflows/runs/[runId] - Cancel run
 */

import { NextResponse } from "next/server";
import {
  getWorkflowRun,
  updateWorkflowRun,
  cancelWorkflowRun,
  registerAllWorkflows,
} from "@/lib/workflows";
import type { WorkflowInputs } from "@/lib/workflows";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    const run = await getWorkflowRun(runId);

    if (!run) {
      return NextResponse.json(
        { error: "Workflow run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ run });
  } catch (error) {
    console.error("Error getting workflow run:", error);
    return NextResponse.json(
      { error: "Failed to get workflow run" },
      { status: 500 }
    );
  }
}

interface UpdateRunRequest {
  userId: string;
  inputs?: Partial<WorkflowInputs>;
  rationales?: Record<string, string>;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body: UpdateRunRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Ensure workflows are registered
    registerAllWorkflows();

    const result = await updateWorkflowRun(runId, body.userId, {
      inputs: body.inputs,
      rationales: body.rationales,
    });

    return NextResponse.json({
      run: result.runState,
      guardrailResults: result.guardrailResults,
      canProceed: result.canProceed,
    });
  } catch (error) {
    console.error("Error updating workflow run:", error);

    if ((error as Error).message.includes("not found")) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update workflow run" },
      { status: 500 }
    );
  }
}

interface CancelRunRequest {
  userId: string;
  reason?: string;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body: CancelRunRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await cancelWorkflowRun(runId, body.userId, body.reason);

    return NextResponse.json({
      success: true,
      message: "Workflow run cancelled",
    });
  } catch (error) {
    console.error("Error cancelling workflow run:", error);

    if ((error as Error).message.includes("not found")) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to cancel workflow run" },
      { status: 500 }
    );
  }
}
