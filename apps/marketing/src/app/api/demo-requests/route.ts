import { NextResponse } from "next/server";
import { db } from "@ascenta/db";
import { demoRequests } from "@ascenta/db/demo-requests-schema";
import { demoRequestSchema } from "@/lib/validations/demo-request";
import { resend } from "@ascenta/email";
import { demoConfirmationEmail } from "@ascenta/email/templates/demo-confirmation";
import { demoNotificationEmail } from "@ascenta/email/templates/demo-notification";

const INTERNAL_DEMO_EMAIL =
  process.env.INTERNAL_DEMO_EMAIL || "demos@ascenta.ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = demoRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await db.insert(demoRequests).values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      company: data.company,
      role: data.role,
      employeeCount: data.employeeCount,
      phone: data.phone || null,
    });

    // Send confirmation email to the requester
    try {
      await resend.emails.send({
        from: "Ascenta <noreply@ascenta.ai>",
        to: data.email,
        subject: "Your Ascenta Demo Request",
        html: demoConfirmationEmail(data.firstName),
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Send notification email to internal team
    try {
      await resend.emails.send({
        from: "Ascenta <noreply@ascenta.ai>",
        to: INTERNAL_DEMO_EMAIL,
        subject: `New Demo Request: ${data.firstName} ${data.lastName} - ${data.company}`,
        html: demoNotificationEmail(data),
      });
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Demo request error:", error);
    return NextResponse.json(
      { error: "Failed to submit demo request" },
      { status: 500 }
    );
  }
}
