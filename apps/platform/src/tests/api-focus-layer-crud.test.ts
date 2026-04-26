// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { GET, PATCH, DELETE } from "@/app/api/focus-layers/[employeeId]/route";

const PREFIX = "FOCUS_API_CRUD_";

async function makeEmployee(suffix = "E1") {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: suffix,
    lastName: "T",
    email: `${PREFIX}${suffix}@x.com`,
    department: "Engineering",
    jobTitle: "Eng",
    managerName: "M",
    hireDate: new Date(),
  });
}

function ctx(employeeId: string) {
  return { params: Promise.resolve({ employeeId }) };
}

async function cleanup() {
  const emps = await Employee.find(
    { employeeId: { $regex: `^${PREFIX}` } },
    { _id: 1 }
  ).lean<{ _id: unknown }[]>();
  if (emps.length) {
    await FocusLayer.deleteMany({ employeeId: { $in: emps.map((e) => e._id) } });
  }
  await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
}

describe.skipIf(!process.env.MONGODB_URI)("/api/focus-layers/[employeeId]", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(cleanup);

  afterAll(async () => {
    await cleanup();
  });

  it("GET returns null when none", async () => {
    const emp = await makeEmployee();
    const res = await GET(new Request("http://t") as never, ctx(String(emp._id)));
    const json = await res.json();
    expect(json.focusLayer).toBeNull();
  });

  it("PATCH creates a draft", async () => {
    const emp = await makeEmployee();
    const req = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ responses: { uniqueContribution: "hello" } }),
    });
    const res = await PATCH(req as never, ctx(String(emp._id)));
    const json = await res.json();
    expect(json.focusLayer.status).toBe("draft");
    expect(json.focusLayer.responses.uniqueContribution).toBe("hello");
  });

  it("DELETE removes the record", async () => {
    const emp = await makeEmployee();
    await FocusLayer.create({ employeeId: emp._id, responses: {}, status: "draft" });
    const res = await DELETE(
      new Request("http://t", { method: "DELETE" }) as never,
      ctx(String(emp._id))
    );
    expect(res.status).toBe(204);
    expect(await FocusLayer.countDocuments({ employeeId: emp._id })).toBe(0);
  });
});
