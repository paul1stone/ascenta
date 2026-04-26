import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import {
  listJobDescriptions,
  getJobDescriptionById,
  listAssignedEmployees,
  countAssignedEmployees,
} from "@ascenta/db/job-descriptions";

const TEST_PREFIX = "JD_TEST_QUERIES_";

async function makeJd(overrides: Partial<Record<string, unknown>> = {}) {
  return JobDescription.create({
    title: `${TEST_PREFIX}Engineer`,
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code", "Review PRs"],
    requiredQualifications: ["3+ years experience"],
    competencies: ["Communication", "Ownership"],
    status: "published",
    ...overrides,
  });
}

describe("job-descriptions query helpers", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${TEST_PREFIX}` } });
    await Employee.deleteMany({ employeeId: { $regex: `^${TEST_PREFIX}` } });
  });

  afterAll(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${TEST_PREFIX}` } });
    await Employee.deleteMany({ employeeId: { $regex: `^${TEST_PREFIX}` } });
    await mongoose.disconnect();
  });

  it("listJobDescriptions returns published JDs by default with assignedCount", async () => {
    const jd = await makeJd();
    await Employee.create({
      employeeId: `${TEST_PREFIX}EMP1`,
      firstName: "A",
      lastName: "Z",
      email: `${TEST_PREFIX}emp1@x.com`,
      department: "Engineering",
      jobTitle: "Engineer",
      managerName: "Mgr",
      hireDate: new Date(),
      jobDescriptionId: jd._id,
    });
    const result = await listJobDescriptions({});
    const found = result.items.find((i) => String(i.id) === String(jd._id));
    expect(found?.assignedCount).toBe(1);
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it("listJobDescriptions excludes drafts by default", async () => {
    await makeJd({ title: `${TEST_PREFIX}Draft`, status: "draft" });
    const result = await listJobDescriptions({});
    expect(
      result.items.find((i) => i.title === `${TEST_PREFIX}Draft`),
    ).toBeUndefined();
  });

  it("listJobDescriptions includes drafts when status is 'all'", async () => {
    await makeJd({ title: `${TEST_PREFIX}Draft2`, status: "draft" });
    const result = await listJobDescriptions({ status: "all" });
    expect(
      result.items.find((i) => i.title === `${TEST_PREFIX}Draft2`),
    ).toBeDefined();
  });

  it("listJobDescriptions filters by department, level, employmentType", async () => {
    await makeJd({ title: `${TEST_PREFIX}A`, department: "Sales", level: "senior" });
    await makeJd({ title: `${TEST_PREFIX}B`, department: "Engineering", level: "lead" });
    const result = await listJobDescriptions({
      department: "Sales",
      level: "senior",
      employmentType: "full_time",
    });
    const titles = result.items.map((i) => i.title);
    expect(titles).toContain(`${TEST_PREFIX}A`);
    expect(titles).not.toContain(`${TEST_PREFIX}B`);
  });

  it("listJobDescriptions q matches title and roleSummary case-insensitively", async () => {
    await makeJd({
      title: `${TEST_PREFIX}Marketing Manager`,
      roleSummary: "Leads MARKETING strategy and campaigns.",
    });
    const a = await listJobDescriptions({ q: "marketing" });
    expect(
      a.items.find((i) => i.title === `${TEST_PREFIX}Marketing Manager`),
    ).toBeDefined();
  });

  it("listJobDescriptions paginates", async () => {
    await Promise.all([
      makeJd({ title: `${TEST_PREFIX}P1` }),
      makeJd({ title: `${TEST_PREFIX}P2` }),
      makeJd({ title: `${TEST_PREFIX}P3` }),
    ]);
    const page = await listJobDescriptions({ limit: 2, offset: 0 });
    expect(page.items.length).toBeLessThanOrEqual(2);
  });

  it("getJobDescriptionById returns the JD or null", async () => {
    const jd = await makeJd();
    const found = await getJobDescriptionById(String(jd._id));
    expect(found?.title).toBe(`${TEST_PREFIX}Engineer`);
    const missing = await getJobDescriptionById(String(new mongoose.Types.ObjectId()));
    expect(missing).toBeNull();
  });

  it("listAssignedEmployees returns employees with this jobDescriptionId, sorted by lastName", async () => {
    const jd = await makeJd();
    await Employee.create({
      employeeId: `${TEST_PREFIX}E2`,
      firstName: "Bob",
      lastName: "Zoe",
      email: `${TEST_PREFIX}e2@x.com`,
      department: "Engineering",
      jobTitle: "Eng",
      managerName: "M",
      hireDate: new Date(),
      jobDescriptionId: jd._id,
    });
    await Employee.create({
      employeeId: `${TEST_PREFIX}E3`,
      firstName: "Ann",
      lastName: "Aaron",
      email: `${TEST_PREFIX}e3@x.com`,
      department: "Engineering",
      jobTitle: "Eng",
      managerName: "M",
      hireDate: new Date(),
      jobDescriptionId: jd._id,
    });
    const employees = await listAssignedEmployees(String(jd._id));
    expect(employees.length).toBe(2);
    expect(employees[0].lastName).toBe("Aaron");
  });

  it("countAssignedEmployees returns counts keyed by JD id", async () => {
    const jd1 = await makeJd();
    const jd2 = await makeJd({ title: `${TEST_PREFIX}Other` });
    await Employee.create({
      employeeId: `${TEST_PREFIX}E4`,
      firstName: "X",
      lastName: "Y",
      email: `${TEST_PREFIX}e4@x.com`,
      department: "Engineering",
      jobTitle: "Eng",
      managerName: "M",
      hireDate: new Date(),
      jobDescriptionId: jd1._id,
    });
    const counts = await countAssignedEmployees([
      String(jd1._id),
      String(jd2._id),
    ]);
    expect(counts[String(jd1._id)]).toBe(1);
    expect(counts[String(jd2._id) ?? ""] ?? 0).toBe(0);
  });
});
