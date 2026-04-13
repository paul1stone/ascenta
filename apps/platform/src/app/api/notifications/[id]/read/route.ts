import { connectDB } from "@ascenta/db";
import { Notification } from "@ascenta/db/notification-schema";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  // Only the notification's owner may mark it read.
  const updated = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { read: true },
    { new: true },
  );

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
