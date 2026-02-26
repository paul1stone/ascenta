import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import {
  createDocument,
  getDocument,
  getAllDocuments,
  deleteDocument,
  addEmbeddings,
  deleteDocumentEmbeddings,
} from "@ascenta/db/documents";
import { processDocument } from "@/lib/rag/embeddings";

export const maxDuration = 60; // Allow longer for embedding generation

/**
 * GET - List all documents or get a specific document
 */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const document = await getDocument(id);
      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(document);
    }

    const documents = await getAllDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new document and generate embeddings
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, content, source, metadata } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Create the document
    const document = await createDocument({
      title,
      content,
      source,
      metadata,
    });

    // Process content into chunks and generate embeddings
    const chunks = await processDocument(content);

    // Store embeddings
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
    console.error("Create document error:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a document and its embeddings
 */
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const document = await getDocument(id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete embeddings first (cascade should handle this, but be explicit)
    await deleteDocumentEmbeddings(id);

    // Delete the document
    await deleteDocument(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
