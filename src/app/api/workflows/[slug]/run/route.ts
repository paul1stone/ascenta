/**
 * Workflow Run API Route
 * POST /api/workflows/[slug]/run - Start a new workflow run
 */

import { NextResponse } from "next/server";
import { startWorkflowRun, registerAllWorkflows } from "@/lib/workflows";
import type { WorkflowInputs } from "@/lib/workflows";

interface StartRunRequest {
  userId: string;
  initialInputs?: WorkflowInputs;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: StartRunRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Ensure workflows are registered
    registerAllWorkflows();

    const run = await startWorkflowRun(
      slug,
      body.userId,
      body.initialInputs || {}
    );

    return NextResponse.json({
      run,
      message: "Workflow run started successfully",
    });
  } catch (error) {
    console.error("Error starting workflow run:", error);
    
    if ((error as Error).message.includes("not found")) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to start workflow run" },
      { status: 500 }
    );
  }
}
