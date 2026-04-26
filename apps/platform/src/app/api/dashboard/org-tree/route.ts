import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { listJobDescriptions } from "@ascenta/db/job-descriptions";
import { buildOrgTree } from "@ascenta/db/employees";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    const [employees, jdList] = await Promise.all([
      Employee.find({ status: "active" }).lean(),
      listJobDescriptions({ status: "all", limit: 200 }),
    ]);

    const empInputs = employees.map((e: Record<string, unknown>) => ({
      id: String(e._id),
      employeeId: String(e.employeeId ?? e._id),
      firstName: String(e.firstName ?? ""),
      lastName: String(e.lastName ?? ""),
      jobTitle: String(e.jobTitle ?? ""),
      department: String(e.department ?? ""),
      managerName: String(e.managerName ?? ""),
      jobDescriptionId: e.jobDescriptionId ? String(e.jobDescriptionId) : null,
      profile: {
        photoBase64:
          (e as { profile?: { photoBase64?: string | null } })?.profile?.photoBase64 ?? null,
      },
    }));

    const jdInputs = jdList.items.map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department,
      level: j.level,
      assignedCount: j.assignedCount,
    }));

    const tree = buildOrgTree(empInputs, jdInputs);
    const res = NextResponse.json(tree);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
