import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { Employee } from "@ascenta/db/employee-schema";
import {
  upsertFocusLayerDraft,
  getFocusLayerByEmployee,
} from "@ascenta/db/focus-layers";
import { focusLayerDraftSchema } from "@/lib/validations/focus-layer";

type Ctx = { params: Promise<{ employeeId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  const fl = await getFocusLayerByEmployee(employeeId);
  if (!fl) return NextResponse.json({ focusLayer: null });
  const { _id, __v: _v, ...rest } = fl as Record<string, unknown> & {
    _id: unknown;
    __v?: unknown;
  };
  return NextResponse.json({ focusLayer: { ...rest, id: String(_id) } });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  const body = await req.json();
  const parsed = focusLayerDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const emp = await Employee.findById(employeeId).lean<{
    _id: unknown;
    jobDescriptionId?: unknown;
  }>();
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  const fl = await upsertFocusLayerDraft(
    employeeId,
    emp.jobDescriptionId ? String(emp.jobDescriptionId) : null,
    parsed.data.responses
  );
  return NextResponse.json({ focusLayer: fl?.toJSON() });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  await FocusLayer.deleteOne({ employeeId });
  return new Response(null, { status: 204 });
}
