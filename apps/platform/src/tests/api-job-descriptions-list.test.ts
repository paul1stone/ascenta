// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { GET, POST } from "@/app/api/job-descriptions/route";

const PREFIX = "JD_API_LIST_";

function buildJd(over: Partial<Record<string, unknown>> = {}) {
  return {
    title: `${PREFIX}Software Engineer`,
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years experience"],
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

async function callList(qs: string, userId?: string) {
  const headers: Record<string, string> = {};
  if (userId) headers["x-dev-user-id"] = userId;
  const req = new Request(`http://t/api/job-descriptions?${qs}`, { headers });
  const res = await GET(req as unknown as import("next/server").NextRequest);
  return { status: res.status, json: await res.json() };
}

async function callCreate(body: Record<string, unknown>, userId?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (userId) headers["x-dev-user-id"] = userId;
  const req = new Request("http://t/api/job-descriptions", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const res = await POST(req as unknown as import("next/server").NextRequest);
  return { status: res.status, json: await res.json() };
}

// CI doesn't have MONGODB_URI; skip real-DB integration tests there.
const SKIP_NO_DB = !process.env.MONGODB_URI;

describe.skipIf(SKIP_NO_DB)("GET /api/job-descriptions", () => {
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

  it("returns 401 without an authenticated user", async () => {
    const r = await callList("");
    expect(r.status).toBe(401);
  });

  it("HR sees published JDs from any department", async () => {
    const hr = await makePersona("hr", "People Ops");
    await JobDescription.create(buildJd());
    const result = await callList("", hr._id.toString());
    expect(result.status).toBe(200);
    const found = result.json.jobDescriptions.find((j: { title: string }) =>
      j.title.startsWith(PREFIX),
    );
    expect(found).toBeDefined();
  });

  it("filters by q against title", async () => {
    const hr = await makePersona("hr", "People Ops");
    await JobDescription.create(buildJd({ title: `${PREFIX}Designer` }));
    const result = await callList(
      `q=${encodeURIComponent("designer")}`,
      hr._id.toString(),
    );
    expect(
      result.json.jobDescriptions.find((j: { title: string }) =>
        j.title.includes("Designer"),
      ),
    ).toBeDefined();
  });

  it("filters by department", async () => {
    const hr = await makePersona("hr", "People Ops");
    await JobDescription.create(buildJd({ title: `${PREFIX}Sales`, department: "Sales" }));
    await JobDescription.create(buildJd({ title: `${PREFIX}Eng`, department: "Engineering" }));
    const result = await callList("department=Sales", hr._id.toString());
    const titles = result.json.jobDescriptions.map((j: { title: string }) => j.title);
    expect(titles).toContain(`${PREFIX}Sales`);
    expect(titles).not.toContain(`${PREFIX}Eng`);
  });

  it("Manager sees only their department's JDs (filter forced)", async () => {
    const mgr = await makePersona("manager", "Sales");
    await JobDescription.create(buildJd({ title: `${PREFIX}Sales`, department: "Sales" }));
    await JobDescription.create(buildJd({ title: `${PREFIX}Eng`, department: "Engineering" }));
    // Even if they ask for Engineering, they should only get Sales.
    const result = await callList("department=Engineering", mgr._id.toString());
    const titles = result.json.jobDescriptions.map((j: { title: string }) => j.title);
    expect(titles).toContain(`${PREFIX}Sales`);
    expect(titles).not.toContain(`${PREFIX}Eng`);
  });

  it("Employee sees only their own assigned JD", async () => {
    const myJd = await JobDescription.create(
      buildJd({ title: `${PREFIX}Mine`, department: "Engineering" }),
    );
    await JobDescription.create(
      buildJd({ title: `${PREFIX}Other`, department: "Engineering" }),
    );
    const emp = await makePersona("employee", "Engineering", myJd._id);
    const result = await callList("", emp._id.toString());
    expect(result.status).toBe(200);
    const titles = result.json.jobDescriptions.map((j: { title: string }) => j.title);
    expect(titles).toEqual([`${PREFIX}Mine`]);
  });

  it("Employee with no assigned JD gets an empty list", async () => {
    await JobDescription.create(buildJd());
    const emp = await makePersona("employee", "Engineering", null);
    const result = await callList("", emp._id.toString());
    expect(result.status).toBe(200);
    expect(result.json.jobDescriptions).toEqual([]);
  });
});

describe.skipIf(SKIP_NO_DB)("POST /api/job-descriptions", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
  });

  it("HR creates a JD with valid payload", async () => {
    const hr = await makePersona("hr", "People Ops");
    const r = await callCreate(
      buildJd({ title: `${PREFIX}Created` }),
      hr._id.toString(),
    );
    expect(r.status).toBe(201);
    expect(r.json.jobDescription.title).toBe(`${PREFIX}Created`);
  });

  it("Manager can create a JD in their own department", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const r = await callCreate(
      buildJd({ title: `${PREFIX}MgrEng`, department: "Engineering" }),
      mgr._id.toString(),
    );
    expect(r.status).toBe(201);
  });

  it("Manager cannot create a JD in another department", async () => {
    const mgr = await makePersona("manager", "Engineering");
    const r = await callCreate(
      buildJd({ title: `${PREFIX}MgrSales`, department: "Sales" }),
      mgr._id.toString(),
    );
    expect(r.status).toBe(403);
  });

  it("Employee cannot create JDs", async () => {
    const emp = await makePersona("employee", "Engineering");
    const r = await callCreate(
      buildJd({ title: `${PREFIX}EmpAttempt` }),
      emp._id.toString(),
    );
    expect(r.status).toBe(403);
  });

  it("returns 400 on invalid payload", async () => {
    const hr = await makePersona("hr", "People Ops");
    const r = await callCreate(
      { title: "x", department: "", level: "bad" },
      hr._id.toString(),
    );
    expect(r.status).toBe(400);
  });
});
