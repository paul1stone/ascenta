import { NextResponse } from "next/server";
import { listTrackedDocuments } from "@/lib/db/tracked-documents";

export async function GET() {
  try {
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
