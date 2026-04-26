// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { GET } from "@/app/api/dashboard/org-tree/route";

const PREFIX = "ORG_TREE_API_";

// CI doesn't have MONGODB_URI; skip real-DB integration tests there.
const SKIP_NO_DB = !process.env.MONGODB_URI;

async function makeEmp(suffix: string, managerName = "External") {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: suffix,
    lastName: "Test",
    email: `${PREFIX}${suffix}@x.com`,
    department: "Engineering",
    jobTitle: "Eng",
    managerName,
    hireDate: new Date(),
  });
}

describe.skipIf(SKIP_NO_DB)("GET /api/dashboard/org-tree", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
    await mongoose.disconnect();
  });

  it("returns expected shape", async () => {
    await makeEmp("CEO");
    await makeEmp("IC", "CEO Test");
    const res = await GET(new Request("http://t") as never);
    const json = await res.json();
    expect(json).toHaveProperty("roots");
    expect(json).toHaveProperty("unfilledRoles");
    expect(json).toHaveProperty("totalEmployees");
    expect(json.totalEmployees).toBeGreaterThanOrEqual(2);
  });

  it("includes unfilled JDs", async () => {
    await JobDescription.create({
      title: `${PREFIX}Unfilled`,
      department: "Engineering",
      level: "senior",
      employmentType: "full_time",
      roleSummary: "Designs and builds production-grade systems for the company.",
      coreResponsibilities: ["Write code"],
      requiredQualifications: ["3+ years"],
      competencies: ["Ownership"],
      status: "published",
    });
    const res = await GET(new Request("http://t") as never);
    const json = await res.json();
    const eng = json.unfilledRoles.find((c: { department: string }) => c.department === "Engineering");
    expect(eng?.roles?.find((r: { title: string }) => r.title === `${PREFIX}Unfilled`)).toBeDefined();
  });
});
