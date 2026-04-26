// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { GET, PATCH, DELETE } from "@/app/api/job-descriptions/[id]/route";

const PREFIX = "JD_API_CRUD_";

function buildJd(over: Partial<Record<string, unknown>> = {}) {
  return {
    title: `${PREFIX}Engineer`,
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years"],
    competencies: ["Ownership"],
    status: "published",
    ...over,
  };
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
async function patch(id: string, body: Record<string, unknown>) {
  const req = new Request("http://t", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await PATCH(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function del(id: string) {
  const res = await DELETE(new Request("http://t", { method: "DELETE" }) as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}

// CI doesn't have MONGODB_URI; skip real-DB integration tests there.
describe.skipIf(!process.env.MONGODB_URI)("/api/job-descriptions/[id]", () => {
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

  it("GET returns the JD", async () => {
    const jd = await JobDescription.create(buildJd());
    const r = await get(String(jd._id));
    expect(r.status).toBe(200);
    expect(r.json.jobDescription.title).toBe(`${PREFIX}Engineer`);
  });

  it("GET returns 404 for unknown id", async () => {
    const r = await get(String(new mongoose.Types.ObjectId()));
    expect(r.status).toBe(404);
  });

  it("PATCH updates fields", async () => {
    const jd = await JobDescription.create(buildJd());
    const r = await patch(String(jd._id), { title: `${PREFIX}Updated` });
    expect(r.status).toBe(200);
    expect(r.json.jobDescription.title).toBe(`${PREFIX}Updated`);
  });

  it("PATCH returns 400 on invalid payload", async () => {
    const jd = await JobDescription.create(buildJd());
    const r = await patch(String(jd._id), { level: "bad" });
    expect(r.status).toBe(400);
  });

  it("DELETE clears jobDescriptionId on assigned employees", async () => {
    const jd = await JobDescription.create(buildJd());
    await Employee.create({
      employeeId: `${PREFIX}E1`,
      firstName: "A",
      lastName: "Z",
      email: `${PREFIX}e1@x.com`,
      department: "Engineering",
      jobTitle: "Eng",
      managerName: "M",
      hireDate: new Date(),
      jobDescriptionId: jd._id,
    });
    const r = await del(String(jd._id));
    expect(r.status).toBe(200);
    expect(r.json.unassignedEmployees).toBe(1);
    const refreshed = await Employee.findOne({ employeeId: `${PREFIX}E1` });
    expect(refreshed?.jobDescriptionId).toBeNull();
  });

  it("DELETE returns 404 for unknown id", async () => {
    const r = await del(String(new mongoose.Types.ObjectId()));
    expect(r.status).toBe(404);
  });
});
