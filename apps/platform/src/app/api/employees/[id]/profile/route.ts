import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { computeProfileCompletion } from "@ascenta/db/employees";
import { profilePatchSchema } from "@/lib/validations/employee-profile";

type Ctx = { params: Promise<{ id: string }> };

function flatten(
  obj: Record<string, unknown>,
  prefix = "profile"
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const path = `${prefix}.${k}`;
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      k !== "funFacts"
    ) {
      Object.assign(out, flatten(v as Record<string, unknown>, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 404 });
  }
  const emp = await Employee.findById(id).lean();
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const profile = (emp as Record<string, unknown>).profile ?? {};
  const completion = computeProfileCompletion(
    profile as { getToKnow?: Record<string, unknown> }
  );
  return NextResponse.json({ profile, completion });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 404 });
  }
  const body = await req.json();
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const $set = flatten(parsed.data as Record<string, unknown>);
  $set["profile.profileUpdatedAt"] = new Date();
  const emp = await Employee.findByIdAndUpdate(id, { $set }, { new: true });
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const profile = emp.toJSON().profile;
  const completion = computeProfileCompletion(profile);
  return NextResponse.json({ profile, completion });
}
