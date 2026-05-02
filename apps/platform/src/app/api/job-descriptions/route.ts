import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { listJobDescriptions } from "@ascenta/db/job-descriptions";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "@ascenta/db/job-description-constants";
import { Employee } from "@ascenta/db/employee-schema";
import { jobDescriptionInputSchema } from "@/lib/validations/job-description";
import { getServerUser } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? undefined;
    const requestedDepartment = searchParams.get("department") ?? undefined;

    const levelRaw = searchParams.get("level");
    const level =
      levelRaw && (LEVEL_OPTIONS as readonly string[]).includes(levelRaw)
        ? (levelRaw as (typeof LEVEL_OPTIONS)[number])
        : undefined;

    const employmentTypeRaw = searchParams.get("employmentType");
    const employmentType =
      employmentTypeRaw &&
      (EMPLOYMENT_TYPE_OPTIONS as readonly string[]).includes(employmentTypeRaw)
        ? (employmentTypeRaw as (typeof EMPLOYMENT_TYPE_OPTIONS)[number])
        : undefined;

    const statusRaw = searchParams.get("status");
    let status: (typeof STATUS_OPTIONS)[number] | "all" | undefined;
    if (statusRaw === "all") status = "all";
    else if (statusRaw && (STATUS_OPTIONS as readonly string[]).includes(statusRaw))
      status = statusRaw as (typeof STATUS_OPTIONS)[number];

    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    // Role-based scoping. Department/id filters override the requested filter.
    let department = requestedDepartment || undefined;
    let id: string | undefined;
    if (user.role === "manager") {
      department = user.department;
    } else if (user.role === "employee") {
      const me = await Employee.findById(user.id).select("jobDescriptionId").lean<{
        jobDescriptionId: { toString(): string } | null;
      }>();
      if (!me?.jobDescriptionId) {
        return NextResponse.json({ jobDescriptions: [], total: 0 });
      }
      id = me.jobDescriptionId.toString();
      department = undefined;
    }

    const result = await listJobDescriptions({
      q,
      department,
      level,
      employmentType,
      status,
      id,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });
    return NextResponse.json({
      jobDescriptions: result.items,
      total: result.total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GET /api/job-descriptions error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "employee") {
      return NextResponse.json(
        { error: "Employees cannot create job descriptions" },
        { status: 403 },
      );
    }

    await connectDB();
    const body = await req.json();
    const parsed = jobDescriptionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    if (user.role === "manager" && data.department !== user.department) {
      return NextResponse.json(
        { error: "Managers can only create job descriptions for their own department" },
        { status: 403 },
      );
    }

    const created = await JobDescription.create(data);
    return NextResponse.json(
      { jobDescription: created.toJSON() },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("POST /api/job-descriptions error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
