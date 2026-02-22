import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getTrackedDocument } from "@ascenta/db/tracked-documents";
import { db } from "@ascenta/db";
import { trackedDocuments } from "@ascenta/db/workflow-schema";
import { eq } from "drizzle-orm";
import { resend } from "@ascenta/email";
import { documentDeliveryEmail } from "@ascenta/email/templates/document-delivery";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: docId } = await params;
    const body = await req.json();
    const { employeeEmail } = body as { employeeEmail?: string };

    const doc = await getTrackedDocument(docId);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const email = employeeEmail || doc.employeeEmail;
    if (!email) {
      return NextResponse.json(
        { error: "employeeEmail is required" },
        { status: 400 }
      );
    }

    // Generate HMAC-SHA256 ack token
    const ackToken = createHmac(
      "sha256",
      process.env.RESEND_API_KEY || "secret"
    )
      .update(docId)
      .digest("hex");

    const ackUrl = `${APP_URL}/ack/${docId}?token=${ackToken}`;

    // Send delivery email via Resend
    await resend.emails.send({
      from: "Paul <paul@zaymo.com>",
      to: email,
      subject: `Document for your review: ${doc.title}`,
      html: documentDeliveryEmail({
        employeeName: doc.employeeName || "Employee",
        documentTitle: doc.title,
        documentType: doc.documentType,
        ackUrl,
      }),
    });

    const sentAt = new Date();

    // Update document with sent info
    await db
      .update(trackedDocuments)
      .set({
        employeeEmail: email,
        sentAt,
        ackToken,
        stage: "sent",
        updatedAt: new Date(),
      })
      .where(eq(trackedDocuments.id, docId));

    return NextResponse.json({ sent: true, sentAt });
  } catch (error) {
    console.error("Send document error:", error);
    return NextResponse.json(
      { error: "Failed to send document" },
      { status: 500 }
    );
  }
}
