import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { trackedDocuments } from "@/lib/db/workflow-schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: docId } = await params;
    const body = await req.json();
    const { token } = body as { token?: string };

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate HMAC token
    const expectedToken = createHmac(
      "sha256",
      process.env.RESEND_API_KEY || "secret"
    )
      .update(docId)
      .digest("hex");

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      );
    }

    // Set acknowledgedAt and advance stage
    await db
      .update(trackedDocuments)
      .set({
        acknowledgedAt: new Date(),
        stage: "acknowledged",
        updatedAt: new Date(),
      })
      .where(eq(trackedDocuments.id, docId));

    return NextResponse.json({ acknowledged: true });
  } catch (error) {
    console.error("Acknowledge document error:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge document" },
      { status: 500 }
    );
  }
}
