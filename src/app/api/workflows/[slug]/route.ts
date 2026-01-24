/**
 * Single Workflow API Route
 * GET /api/workflows/[slug] - Get workflow details by slug
 */

import { NextResponse } from "next/server";
import { getWorkflowBySlug, registerAllWorkflows } from "@/lib/workflows";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Ensure workflows are registered
    registerAllWorkflows();

    const workflow = await getWorkflowBySlug(slug);

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error("Error getting workflow:", error);
    return NextResponse.json(
      { error: "Failed to get workflow" },
      { status: 500 }
    );
  }
}
