// @vitest-environment node
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

async function makeJd(
  title = `${PREFIX}Engineer`,
  department = "Engineering",
) {
  return JobDescription.create({
    title,
    department,
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years"],
    competencies: ["Ownership"],
    status: "published",
  });
}

async function makeEmp(
  suffix: string,
  jdId?: mongoose.Types.ObjectId,
  department = "Engineering",
) {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: suffix,
    lastName: "Test",
    email: `${PREFIX}${suffix}@x.com`,
    department,
    jobTitle: "Eng",
    managerName: "M",
    hireDate: new Date(),
    jobDescriptionId: jdId ?? null,
  });
}

async function makePersona(
  role: "hr" | "manager" | "employee",
  department: string,
  jdId: mongoose.Types.ObjectId | null = null,
) {
  return Employee.create({
    employeeId: `${PREFIX}p_${role}`,
    firstName: role,
    lastName: "Persona",
    email: `${PREFIX}p_${role}@x.com`,
    department,
    jobTitle: role,
    managerName: "M",
    hireDate: new Date(),
    demoPersona: role,
    jobDescriptionId: jdId,
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
async function post(id: string, body: Record<string, unknown>, userId?: string) {
  const req = new Request("http://t", {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(userId) },
    body: JSON.stringify(body),
  });
  const res = await POST(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function del(id: string, body: Record<string, unknown>, userId?: string) {
  const req = new Request("http://t", {
    method: "DELETE",
    headers: { "content-type": "application/json", ...authHeaders(userId) },
    body: JSON.stringify(body),
  });
  const res = await DELETE(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}

// CI doesn't have MONGODB_URI; skip real-DB integration tests there.
describe.skipIf(!process.env.MONGODB_URI)("/api/job-descriptions/[id]/employees", () => {
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
    const jd = await makeJd();
    const r = await get(String(jd._id));
    expect(r.status).toBe(401);
  });

  it("HR GET returns assigned employees", async () => {
    const hr = await makePersona("hr", "People Ops");
    const jd = await makeJd();
    await makeEmp("E1", jd._id);
    const r = await get(String(jd._id), hr._id.toString());
    expect(r.status).toBe(200);
    expect(r.json.employees.length).toBe(1);
  });

  it("Manager GET 200 within own dept, 403 otherwise", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const sameDept = await makeJd();
    const otherDept = await makeJd(`${PREFIX}SalesJd`, "Sales");
    expect((await get(String(sameDept._id), mgr._id.toString())).status).toBe(200);
    expect((await get(String(otherDept._id), mgr._id.toString())).status).toBe(403);
  });

  it("Employee GET always 403", async () => {
    const jd = await makeJd();
    const emp = await makePersona("employee", "Engineering", jd._id);
    const r = await get(String(jd._id), emp._id.toString());
    expect(r.status).toBe(403);
  });

  it("HR POST assigns employees and is idempotent", async () => {
    const hr = await makePersona("hr", "People Ops");
    const jd = await makeJd();
    const e1 = await makeEmp("E1");
    const e2 = await makeEmp("E2");
    const first = await post(
      String(jd._id),
      { employeeIds: [String(e1._id), String(e2._id)] },
      hr._id.toString(),
    );
    expect(first.status).toBe(200);
    expect(first.json.assignedCount).toBe(2);

    const second = await post(
      String(jd._id),
      { employeeIds: [String(e1._id)] },
      hr._id.toString(),
    );
    expect(second.status).toBe(200);
    expect(second.json.assignedCount).toBe(1);
    const e1Refreshed = await Employee.findById(e1._id);
    expect(String(e1Refreshed?.jobDescriptionId)).toBe(String(jd._id));
  });

  it("Manager POST 403 when assigning out-of-dept employees", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const jd = await makeJd();
    const eng = await makeEmp("Eng1", undefined, "Engineering");
    const sales = await makeEmp("Sales1", undefined, "Sales");
    const r = await post(
      String(jd._id),
      { employeeIds: [String(eng._id), String(sales._id)] },
      mgr._id.toString(),
    );
    expect(r.status).toBe(403);
  });

  it("Manager POST OK within own dept", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const jd = await makeJd();
    const eng = await makeEmp("Eng1", undefined, "Engineering");
    const r = await post(
      String(jd._id),
      { employeeIds: [String(eng._id)] },
      mgr._id.toString(),
    );
    expect(r.status).toBe(200);
  });

  it("Employee POST always 403", async () => {
    const jd = await makeJd();
    const emp = await makePersona("employee", "Engineering");
    const r = await post(
      String(jd._id),
      { employeeIds: [emp._id.toString()] },
      emp._id.toString(),
    );
    expect(r.status).toBe(403);
  });

  it("HR DELETE only unassigns employees currently assigned to this JD", async () => {
    const hr = await makePersona("hr", "People Ops");
    const jd1 = await makeJd();
    const jd2 = await makeJd(`${PREFIX}Other`);
    const e1 = await makeEmp("E1", jd1._id);
    const e2 = await makeEmp("E2", jd2._id);
    const r = await del(
      String(jd1._id),
      { employeeIds: [String(e1._id), String(e2._id)] },
      hr._id.toString(),
    );
    expect(r.status).toBe(200);
    expect(r.json.unassignedCount).toBe(1);
    const e1r = await Employee.findById(e1._id);
    const e2r = await Employee.findById(e2._id);
    expect(e1r?.jobDescriptionId).toBeNull();
    expect(String(e2r?.jobDescriptionId)).toBe(String(jd2._id));
  });
});
