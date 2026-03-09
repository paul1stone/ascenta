import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import mammoth from "mammoth";
import {
  createDocument,
  addEmbeddings,
} from "@ascenta/db/documents";
import { processDocument } from "@/lib/rag/embeddings";

export const maxDuration = 60;

/**
 * POST - Upload a PDF or TXT file, extract text, create document + embeddings
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (!extension || !["pdf", "txt", "docx"].includes(extension)) {
      return NextResponse.json(
        { error: "Only PDF, DOCX, and TXT files are supported" },
        { status: 400 }
      );
    }

    let content: string;

    if (extension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdfParse = (await import("pdf-parse")).default;
      const pdfResult = await pdfParse(Buffer.from(arrayBuffer));
      content = pdfResult.text;
    } else if (extension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      content = result.value;
    } else {
      content = await file.text();
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "File contains no extractable text" },
        { status: 400 }
      );
    }

    // Create the document
    const title = fileName.replace(/\.[^/.]+$/, "");
    const document = await createDocument({
      title,
      content,
      source: fileName,
    });

    // Process content into chunks and generate embeddings
    const chunks = await processDocument(content);

    if (chunks.length > 0) {
      await addEmbeddings(
        chunks.map((chunk, index) => ({
          documentId: document.id,
          chunkIndex: String(index),
          content: chunk.content,
          embedding: chunk.embedding,
        }))
      );
    }

    return NextResponse.json({
      document,
      chunksCreated: chunks.length,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json(
      { error: "Failed to process uploaded file" },
      { status: 500 }
    );
  }
}
