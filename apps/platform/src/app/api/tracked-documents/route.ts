import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { listTrackedDocuments } from "@ascenta/db/tracked-documents";

export async function GET() {
  try {
    await connectDB();
    const documents = await listTrackedDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error("List tracked documents error:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    );
  }
}
