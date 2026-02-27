import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Only allow updating content, context, and visibility
    const updateFields: Record<string, unknown> = {};
    if (body.content !== undefined) updateFields.content = body.content;
    if (body.context !== undefined) updateFields.context = body.context;
    if (body.visibility !== undefined) updateFields.visibility = body.visibility;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No updateable fields provided. Allowed: content, context, visibility" },
        { status: 400 }
      );
    }

    const note = await PerformanceNote.findByIdAndUpdate(id, updateFields, { new: true })
      .populate("employee", "firstName lastName email")
      .populate("author", "firstName lastName");

    if (!note) {
      return NextResponse.json(
        { error: "Performance note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(note.toJSON());
  } catch (error) {
    console.error("Update performance note error:", error);
    return NextResponse.json(
      { error: "Failed to update performance note" },
      { status: 500 }
    );
  }
}
