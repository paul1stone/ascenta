import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { submitFocusLayer } from "@ascenta/db/focus-layers";

type Ctx = { params: Promise<{ employeeId: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  try {
    const fl = await submitFocusLayer(employeeId);
    return NextResponse.json({ focusLayer: fl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
