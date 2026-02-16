import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trackedDocuments } from "@/lib/db/workflow-schema";
import { eq, and, or, lt, isNull, sql } from "drizzle-orm";
import { resend } from "@/lib/email/resend";
import { documentReminderEmail } from "@/lib/email/templates/document-reminder";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function GET(req: Request) {
  // Verify authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Find documents that need reminders
    const docs = await db
      .select()
      .from(trackedDocuments)
      .where(
        and(
          or(
            eq(trackedDocuments.stage, "sent"),
            eq(trackedDocuments.stage, "in_review")
          ),
          lt(trackedDocuments.sentAt, threeDaysAgo),
          sql`${trackedDocuments.reminderCount} < 3`,
          or(
            isNull(trackedDocuments.reminderSentAt),
            lt(trackedDocuments.reminderSentAt, twoDaysAgo)
          )
        )
      );

    let sentCount = 0;

    for (const doc of docs) {
      if (!doc.employeeEmail || !doc.ackToken) continue;

      const ackUrl = `${APP_URL}/ack/${doc.id}?token=${doc.ackToken}`;

      try {
        await resend.emails.send({
          from: "Ascenta <noreply@ascenta.ai>",
          to: doc.employeeEmail,
          subject: `Reminder: Please review "${doc.title}"`,
          html: documentReminderEmail({
            employeeName: doc.employeeName || "Employee",
            documentTitle: doc.title,
            documentType: doc.documentType,
            ackUrl,
          }),
        });

        await db
          .update(trackedDocuments)
          .set({
            reminderSentAt: now,
            reminderCount: (doc.reminderCount || 0) + 1,
            updatedAt: now,
          })
          .where(eq(trackedDocuments.id, doc.id));

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send reminder for doc ${doc.id}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      remindersChecked: docs.length,
      remindersSent: sentCount,
    });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}
