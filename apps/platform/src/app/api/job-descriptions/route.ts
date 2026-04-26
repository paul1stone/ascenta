import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { listJobDescriptions } from "@ascenta/db/job-descriptions";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "@ascenta/db/job-description-constants";
import { jobDescriptionInputSchema } from "@/lib/validations/job-description";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? undefined;
    const department = searchParams.get("department") ?? undefined;

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

    const result = await listJobDescriptions({
      q,
      department: department || undefined,
      level,
      employmentType,
      status,
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
    await connectDB();
    const body = await req.json();
    const parsed = jobDescriptionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const created = await JobDescription.create(parsed.data);
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
