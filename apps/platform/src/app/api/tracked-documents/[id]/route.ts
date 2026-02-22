import { NextResponse } from "next/server";
import {
  getTrackedDocument,
  getTrackedDocumentWithContent,
  updateTrackedDocumentStage,
  updateCompletedActions,
} from "@ascenta/db/tracked-documents";
import { getActionItemsForDocument } from "@/lib/tracker-actions";
import { TRACKED_DOCUMENT_STAGES } from "@ascenta/db/workflow-schema";
import type { TrackedDocumentStage } from "@ascenta/db/workflow-schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await getTrackedDocumentWithContent(id);
    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    const actionItems = getActionItemsForDocument(doc.documentType, doc.stage);
    return NextResponse.json({
      ...doc,
      actionItems,
    });
  } catch (error) {
    console.error("Get tracked document error:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { stage, completedActions } = body as {
      stage?: string;
      completedActions?: Record<string, boolean>;
    };

    const doc = await getTrackedDocument(id);
    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (stage !== undefined) {
      if (!TRACKED_DOCUMENT_STAGES.includes(stage as TrackedDocumentStage)) {
        return NextResponse.json(
          {
            error: "Invalid stage",
            validStages: TRACKED_DOCUMENT_STAGES,
          },
          { status: 400 }
        );
      }
      const updated = await updateTrackedDocumentStage(id, stage as TrackedDocumentStage);
      return NextResponse.json(updated);
    }

    if (completedActions !== undefined && typeof completedActions === "object") {
      const updated = await updateCompletedActions(id, completedActions);
      return NextResponse.json(updated ?? { id });
    }

    return NextResponse.json(
      { error: "Provide stage or completedActions" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update tracked document error:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
