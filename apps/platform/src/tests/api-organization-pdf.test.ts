// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { GET } from "@/app/api/employees/[id]/organization-pdf/route";

const SKIP_NO_DB = !process.env.MONGODB_URI;

const PREFIX = "PDF_API_";

async function makeEmp() {
  return Employee.create({
    employeeId: `${PREFIX}E1`,
    firstName: "Pdf",
    lastName: "User",
    email: `${PREFIX}p@x.com`,
    department: "PDF_API_TestDept",
    jobTitle: "Eng",
    managerName: "—",
    hireDate: new Date(),
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe.skipIf(SKIP_NO_DB)("GET /api/employees/[id]/organization-pdf", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await mongoose.disconnect();
  });

  it("returns a PDF binary with correct headers", async () => {
    const emp = await makeEmp();
    const res = await GET(
      new Request("http://t") as never,
      ctx(String(emp._id)),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toMatch(/attachment;.*\.pdf/);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("returns 404 for invalid id", async () => {
    const res = await GET(new Request("http://t") as never, ctx("not-an-id"));
    expect(res.status).toBe(404);
  });
});
