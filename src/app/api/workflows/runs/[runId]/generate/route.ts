/**
 * Workflow Artifact Generation API Route
 * POST /api/workflows/runs/[runId]/generate - Generate artifact for a run
 */

import { NextResponse } from "next/server";
import {
  generateWorkflowArtifact,
  registerAllWorkflows,
} from "@/lib/workflows";

interface GenerateRequest {
  userId: string;
  templateId?: string;
  customPrompts?: Record<string, string>;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body: GenerateRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Ensure workflows are registered
    registerAllWorkflows();

    const artifact = await generateWorkflowArtifact(
      runId,
      body.userId,
      body.templateId,
      body.customPrompts
    );

    return NextResponse.json({
      artifact,
      message: "Artifact generated successfully",
    });
  } catch (error) {
    console.error("Error generating artifact:", error);

    if ((error as Error).message.includes("not found")) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate artifact" },
      { status: 500 }
    );
  }
}
