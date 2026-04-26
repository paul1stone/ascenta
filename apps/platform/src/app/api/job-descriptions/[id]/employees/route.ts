import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { listAssignedEmployees } from "@ascenta/db/job-descriptions";
import { assignEmployeesSchema } from "@/lib/validations/job-description";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id).lean();
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const employees = await listAssignedEmployees(id);
    return NextResponse.json({
      employees: employees.map((e: Record<string, unknown>) => ({
        ...e,
        id: String(e._id),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id);
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = assignEmployeesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const objectIds = parsed.data.employeeIds.filter((eid) =>
      mongoose.isValidObjectId(eid),
    );
    const result = await Employee.updateMany(
      { _id: { $in: objectIds } },
      { $set: { jobDescriptionId: id } },
    );
    return NextResponse.json({ assignedCount: result.modifiedCount ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = assignEmployeesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const objectIds = parsed.data.employeeIds.filter((eid) =>
      mongoose.isValidObjectId(eid),
    );
    const result = await Employee.updateMany(
      { _id: { $in: objectIds }, jobDescriptionId: id },
      { $set: { jobDescriptionId: null } },
    );
    return NextResponse.json({ unassignedCount: result.modifiedCount ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
