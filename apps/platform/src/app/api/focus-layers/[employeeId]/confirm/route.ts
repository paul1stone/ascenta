import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { confirmFocusLayer } from "@ascenta/db/focus-layers";
import { focusLayerConfirmSchema } from "@/lib/validations/focus-layer";

type Ctx = { params: Promise<{ employeeId: string }> };

async function resolveCurrentUser(req: NextRequest) {
  const devId = req.headers.get("x-dev-user-id");
  if (devId && mongoose.isValidObjectId(devId)) {
    return Employee.findById(devId).lean<{ _id: unknown }>();
  }
  return null;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  const fl = await FocusLayer.findOne({ employeeId });
  if (!fl) return NextResponse.json({ error: "Focus Layer not found" }, { status: 404 });
  if (fl.status !== "submitted") {
    return NextResponse.json(
      { error: `Cannot confirm in status ${fl.status}` },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = focusLayerConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const currentUser = await resolveCurrentUser(req);
  // Authorization: current user must be HR, OR manager of employee.
  // For v1 with dev header, accept the call when a current user is provided.
  // Production must replace this with a strict check on currentUser.role and directReports.
  const byUserId = currentUser?._id
    ? String(currentUser._id)
    : process.env.NODE_ENV !== "production"
      ? "00000000000000000000beef"
      : null;
  if (!byUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await confirmFocusLayer(
    employeeId,
    byUserId,
    parsed.data.comment ?? null
  );
  return NextResponse.json({ focusLayer: updated });
}
