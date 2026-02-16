import { NextResponse } from "next/server";
import { join } from "path";
import mammoth from "mammoth";
import {
  createDocument,
  addEmbeddings,
} from "@/lib/db/documents";
import { processDocument } from "@/lib/rag/embeddings";

export const maxDuration = 60;

async function extractPdfText(data: Uint8Array): Promise<string> {
  // Dynamically import pdfjs-dist so it's not loaded at build/module-init time.
  // pdfjs-dist's internal import() for the worker uses /* webpackIgnore: true */,
  // so it falls through to native Node.js import() at runtime.
  const { getDocument, GlobalWorkerOptions } = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );
  GlobalWorkerOptions.workerSrc = join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );

  const doc = await getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => typeof item.str === "string")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str as string)
      .join(" ");
    pages.push(pageText);
  }

  await doc.destroy();
  return pages.join("\n\n");
}

/**
 * POST - Upload a PDF or TXT file, extract text, create document + embeddings
 */
export async function POST(req: Request) {
  try {
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
      content = await extractPdfText(new Uint8Array(arrayBuffer));
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
