import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import {
  GET,
  POST,
  DELETE,
} from "@/app/api/job-descriptions/[id]/employees/route";

const PREFIX = "JD_API_EMP_";

async function makeJd(title = `${PREFIX}Engineer`) {
  return JobDescription.create({
    title,
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years"],
    competencies: ["Ownership"],
    status: "published",
  });
}

async function makeEmp(suffix: string, jdId?: mongoose.Types.ObjectId) {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: suffix,
    lastName: "Test",
    email: `${PREFIX}${suffix}@x.com`,
    department: "Engineering",
    jobTitle: "Eng",
    managerName: "M",
    hireDate: new Date(),
    jobDescriptionId: jdId ?? null,
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) } as unknown as {
    params: Promise<{ id: string }>;
  };
}

async function get(id: string) {
  const res = await GET(new Request("http://t") as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function post(id: string, body: Record<string, unknown>) {
  const req = new Request("http://t", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await POST(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function del(id: string, body: Record<string, unknown>) {
  const req = new Request("http://t", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await DELETE(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}

describe("/api/job-descriptions/[id]/employees", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await mongoose.disconnect();
  });

  it("GET returns assigned employees", async () => {
    const jd = await makeJd();
    await makeEmp("E1", jd._id);
    const r = await get(String(jd._id));
    expect(r.status).toBe(200);
    expect(r.json.employees.length).toBe(1);
  });

  it("POST assigns employees and is idempotent", async () => {
    const jd = await makeJd();
    const e1 = await makeEmp("E1");
    const e2 = await makeEmp("E2");
    const first = await post(String(jd._id), {
      employeeIds: [String(e1._id), String(e2._id)],
    });
    expect(first.status).toBe(200);
    expect(first.json.assignedCount).toBe(2);

    const second = await post(String(jd._id), {
      employeeIds: [String(e1._id)],
    });
    expect(second.status).toBe(200);
    expect(second.json.assignedCount).toBe(1);
    const e1Refreshed = await Employee.findById(e1._id);
    expect(String(e1Refreshed?.jobDescriptionId)).toBe(String(jd._id));
  });

  it("DELETE only unassigns employees currently assigned to this JD", async () => {
    const jd1 = await makeJd();
    const jd2 = await makeJd(`${PREFIX}Other`);
    const e1 = await makeEmp("E1", jd1._id);
    const e2 = await makeEmp("E2", jd2._id);
    const r = await del(String(jd1._id), {
      employeeIds: [String(e1._id), String(e2._id)],
    });
    expect(r.status).toBe(200);
    expect(r.json.unassignedCount).toBe(1);
    const e1r = await Employee.findById(e1._id);
    const e2r = await Employee.findById(e2._id);
    expect(e1r?.jobDescriptionId).toBeNull();
    expect(String(e2r?.jobDescriptionId)).toBe(String(jd2._id));
  });
});
