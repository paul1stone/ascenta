import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { jobDescriptionPatchSchema } from "@/lib/validations/job-description";
import { getServerUser, type ServerUser } from "@/lib/auth/server";

type Ctx = { params: Promise<{ id: string }> };

async function canSeeJd(
  user: ServerUser,
  jd: { department: string },
  jdId: string,
): Promise<boolean> {
  if (user.role === "hr") return true;
  if (user.role === "manager") return jd.department === user.department;
  const me = await Employee.findById(user.id).select("jobDescriptionId").lean<{
    jobDescriptionId: { toString(): string } | null;
  }>();
  return me?.jobDescriptionId?.toString() === jdId;
}

function canMutateJd(user: ServerUser, jd: { department: string }) {
  if (user.role === "hr") return true;
  if (user.role === "manager") return jd.department === user.department;
  return false;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id);
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!(await canSeeJd(user, jd, id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ jobDescription: jd.toJSON() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const existing = await JobDescription.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canMutateJd(user, existing)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = jobDescriptionPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (
      user.role === "manager" &&
      parsed.data.department &&
      parsed.data.department !== user.department
    ) {
      return NextResponse.json(
        { error: "Managers cannot move job descriptions out of their department" },
        { status: 403 },
      );
    }

    const updated = await JobDescription.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ jobDescription: updated.toJSON() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id);
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canMutateJd(user, jd)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await Employee.updateMany(
      { jobDescriptionId: id },
      { $set: { jobDescriptionId: null } },
    );
    await JobDescription.findByIdAndDelete(id);
    return NextResponse.json({
      unassignedEmployees: result.modifiedCount ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
