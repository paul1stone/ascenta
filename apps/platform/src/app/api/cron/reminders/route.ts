import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { TrackedDocument } from "@ascenta/db/workflow-schema";
import { resend } from "@ascenta/email";
import { documentReminderEmail } from "@ascenta/email/templates/document-reminder";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function GET(req: Request) {
  // Verify authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Find documents that need reminders
    const docs = await TrackedDocument.find({
      stage: { $in: ["sent", "in_review"] },
      sentAt: { $lt: threeDaysAgo },
      reminderCount: { $lt: 3 },
      $or: [
        { reminderSentAt: null },
        { reminderSentAt: { $lt: twoDaysAgo } },
      ],
    });

    let sentCount = 0;

    for (const doc of docs) {
      const obj = doc.toJSON() as Record<string, unknown>;
      const employeeEmail = obj.employeeEmail as string | null;
      const ackToken = obj.ackToken as string | null;
      if (!employeeEmail || !ackToken) continue;

      const ackUrl = `${APP_URL}/ack/${obj.id}?token=${ackToken}`;

      try {
        await resend.emails.send({
          from: "Ascenta <noreply@ascenta.ai>",
          to: employeeEmail,
          subject: `Reminder: Please review "${obj.title}"`,
          html: documentReminderEmail({
            employeeName: (obj.employeeName as string) || "Employee",
            documentTitle: obj.title as string,
            documentType: obj.documentType as string,
            ackUrl,
          }),
        });

        await TrackedDocument.findByIdAndUpdate(obj.id, {
          $set: { reminderSentAt: now },
          $inc: { reminderCount: 1 },
        });

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send reminder for doc ${obj.id}:`, emailError);
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
