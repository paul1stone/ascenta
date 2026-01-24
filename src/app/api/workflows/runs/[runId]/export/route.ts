/**
 * Workflow Export API Route
 * POST /api/workflows/runs/[runId]/export - Export artifact to PDF/DOCX
 */

import { NextResponse } from "next/server";
import {
  exportWorkflowArtifact,
  registerAllWorkflows,
} from "@/lib/workflows";

interface ExportRequest {
  userId: string;
  format: "pdf" | "docx";
  confirmations: {
    accuracyReviewed: boolean;
    noPHI: boolean;
    policyReferencesCorrect: boolean;
  };
  reviewNotes?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body: ExportRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!body.format || !["pdf", "docx"].includes(body.format)) {
      return NextResponse.json(
        { error: "format must be 'pdf' or 'docx'" },
        { status: 400 }
      );
    }

    if (!body.confirmations) {
      return NextResponse.json(
        { error: "confirmations are required" },
        { status: 400 }
      );
    }

    // Ensure workflows are registered
    registerAllWorkflows();

    const result = await exportWorkflowArtifact(
      runId,
      body.userId,
      body.format,
      body.confirmations,
      body.reviewNotes
    );

    return NextResponse.json({
      ...result,
      message: "Artifact exported successfully",
    });
  } catch (error) {
    console.error("Error exporting artifact:", error);

    if ((error as Error).message.includes("not found")) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 404 }
      );
    }

    if ((error as Error).message.includes("confirmations")) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to export artifact" },
      { status: 500 }
    );
  }
}
