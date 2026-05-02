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

async function makePersona(
  role: "hr" | "manager" | "employee",
  department: string,
  jobDescriptionId: mongoose.Types.ObjectId | null = null,
  suffix = role,
) {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: role,
    lastName: "Persona",
    email: `${PREFIX}${suffix}@x.com`,
    department,
    jobTitle: role,
    managerName: "M",
    hireDate: new Date(),
    demoPersona: role,
    jobDescriptionId,
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) } as unknown as {
    params: Promise<{ id: string }>;
  };
}

function authHeaders(userId?: string): Record<string, string> {
  return userId ? { "x-dev-user-id": userId } : {};
}

async function get(id: string, userId?: string) {
  const req = new Request("http://t", { headers: authHeaders(userId) });
  const res = await GET(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function patch(id: string, body: Record<string, unknown>, userId?: string) {
  const req = new Request("http://t", {
    method: "PATCH",
    headers: { "content-type": "application/json", ...authHeaders(userId) },
    body: JSON.stringify(body),
  });
  const res = await PATCH(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function del(id: string, userId?: string) {
  const req = new Request("http://t", {
    method: "DELETE",
    headers: authHeaders(userId),
  });
  const res = await DELETE(req as unknown as import("next/server").NextRequest, ctx(id));
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

  it("returns 401 without auth", async () => {
    const jd = await JobDescription.create(buildJd());
    const r = await get(String(jd._id));
    expect(r.status).toBe(401);
  });

  it("HR GET returns the JD", async () => {
    const hr = await makePersona("hr", "People Ops");
    const jd = await JobDescription.create(buildJd());
    const r = await get(String(jd._id), hr._id.toString());
    expect(r.status).toBe(200);
    expect(r.json.jobDescription.title).toBe(`${PREFIX}Engineer`);
  });

  it("Manager GET succeeds within own department, 403 otherwise", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const sameDept = await JobDescription.create(buildJd());
    const otherDept = await JobDescription.create(
      buildJd({ title: `${PREFIX}Sales`, department: "Sales" }),
    );
    expect((await get(String(sameDept._id), mgr._id.toString())).status).toBe(200);
    expect((await get(String(otherDept._id), mgr._id.toString())).status).toBe(403);
  });

  it("Employee GET succeeds only on own assigned JD", async () => {
    const myJd = await JobDescription.create(buildJd({ title: `${PREFIX}Mine` }));
    const other = await JobDescription.create(buildJd({ title: `${PREFIX}Other` }));
    const emp = await makePersona("employee", "Engineering", myJd._id);
    expect((await get(String(myJd._id), emp._id.toString())).status).toBe(200);
    expect((await get(String(other._id), emp._id.toString())).status).toBe(403);
  });

  it("GET returns 404 for unknown id (HR)", async () => {
    const hr = await makePersona("hr", "People Ops");
    const r = await get(String(new mongoose.Types.ObjectId()), hr._id.toString());
    expect(r.status).toBe(404);
  });

  it("HR PATCH updates fields", async () => {
    const hr = await makePersona("hr", "People Ops");
    const jd = await JobDescription.create(buildJd());
    const r = await patch(
      String(jd._id),
      { title: `${PREFIX}Updated` },
      hr._id.toString(),
    );
    expect(r.status).toBe(200);
    expect(r.json.jobDescription.title).toBe(`${PREFIX}Updated`);
  });

  it("Manager PATCH succeeds within own dept, 403 otherwise", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const sameDept = await JobDescription.create(buildJd());
    const otherDept = await JobDescription.create(
      buildJd({ title: `${PREFIX}Sales`, department: "Sales" }),
    );
    expect(
      (await patch(String(sameDept._id), { title: `${PREFIX}Edit` }, mgr._id.toString())).status,
    ).toBe(200);
    expect(
      (await patch(String(otherDept._id), { title: `${PREFIX}Edit` }, mgr._id.toString())).status,
    ).toBe(403);
  });

  it("Manager cannot move a JD to another department via PATCH", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const jd = await JobDescription.create(buildJd());
    const r = await patch(
      String(jd._id),
      { department: "Sales" },
      mgr._id.toString(),
    );
    expect(r.status).toBe(403);
  });

  it("Employee PATCH always 403", async () => {
    const myJd = await JobDescription.create(buildJd({ title: `${PREFIX}Mine` }));
    const emp = await makePersona("employee", "Engineering", myJd._id);
    const r = await patch(
      String(myJd._id),
      { title: `${PREFIX}EmpEdit` },
      emp._id.toString(),
    );
    expect(r.status).toBe(403);
  });

  it("HR DELETE clears jobDescriptionId on assigned employees", async () => {
    const hr = await makePersona("hr", "People Ops");
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
    const r = await del(String(jd._id), hr._id.toString());
    expect(r.status).toBe(200);
    expect(r.json.unassignedEmployees).toBe(1);
    const refreshed = await Employee.findOne({ employeeId: `${PREFIX}E1` });
    expect(refreshed?.jobDescriptionId).toBeNull();
  });

  it("Manager DELETE 403 for other-dept JDs", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const otherDept = await JobDescription.create(
      buildJd({ title: `${PREFIX}Sales`, department: "Sales" }),
    );
    const r = await del(String(otherDept._id), mgr._id.toString());
    expect(r.status).toBe(403);
  });

  it("Employee DELETE 403", async () => {
    const myJd = await JobDescription.create(buildJd({ title: `${PREFIX}Mine` }));
    const emp = await makePersona("employee", "Engineering", myJd._id);
    const r = await del(String(myJd._id), emp._id.toString());
    expect(r.status).toBe(403);
  });

  it("DELETE returns 404 for unknown id (HR)", async () => {
    const hr = await makePersona("hr", "People Ops");
    const r = await del(String(new mongoose.Types.ObjectId()), hr._id.toString());
    expect(r.status).toBe(404);
  });
});
