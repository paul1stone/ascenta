import { connectDB } from "@ascenta/db";
import { Notification } from "@ascenta/db/notification-schema";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  await Notification.findByIdAndUpdate(id, { read: true });
  return NextResponse.json({ success: true });
}
