import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { getTrackedDocumentWithContent } from "@ascenta/db/tracked-documents";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await getTrackedDocumentWithContent(id);
    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    const content = doc.renderedContent ?? `# ${doc.title}\n\nNo content available.`;
    const filename = `${doc.title.replace(/[^a-z0-9-]/gi, "_")}.md`;
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Download tracked document error:", error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}
