// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { assembleOrgSnapshot } from "@/lib/pdf/assemble-org-snapshot";

// CI doesn't have MONGODB_URI; skip real-DB integration tests there.
const SKIP_NO_DB = !process.env.MONGODB_URI;

const PREFIX = "PDF_ASM_";
const TEST_DEPT = "PDF_ASM_TestDept";

async function setup() {
  const skip = await Employee.create({
    employeeId: `${PREFIX}SKIP`,
    firstName: "Skip",
    lastName: "Level",
    email: `${PREFIX}skip@x.com`,
    department: TEST_DEPT,
    jobTitle: "VP",
    managerName: "—",
    hireDate: new Date(),
  });
  const mgr = await Employee.create({
    employeeId: `${PREFIX}MGR`,
    firstName: "Manny",
    lastName: "Manager",
    email: `${PREFIX}mgr@x.com`,
    department: TEST_DEPT,
    jobTitle: "EM",
    managerName: "Skip Level",
    hireDate: new Date(),
  });
  const jd = await JobDescription.create({
    title: "Software Engineer",
    department: TEST_DEPT,
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years"],
    competencies: ["Ownership"],
    status: "published",
  });
  const me = await Employee.create({
    employeeId: `${PREFIX}ME`,
    firstName: "Maya",
    lastName: "Engineer",
    email: `${PREFIX}me@x.com`,
    department: TEST_DEPT,
    jobTitle: "Engineer",
    managerName: "Manny Manager",
    hireDate: new Date(),
    jobDescriptionId: jd._id,
    profile: { pronouns: "she/her" },
  });
  const peer = await Employee.create({
    employeeId: `${PREFIX}PEER`,
    firstName: "Pat",
    lastName: "Peer",
    email: `${PREFIX}peer@x.com`,
    department: TEST_DEPT,
    jobTitle: "Engineer",
    managerName: "Manny Manager",
    hireDate: new Date(),
  });
  await FocusLayer.create({
    employeeId: me._id,
    jobDescriptionId: jd._id,
    status: "confirmed",
    responses: {
      uniqueContribution: "I bring deep cross-team alignment expertise.",
      highImpactArea: "Most impact when bridging product and engineering.",
      signatureResponsibility: "I own the architectural narrative.",
      workingStyle: "Focused 90-min blocks plus async pair sessions.",
    },
    employeeSubmitted: { at: new Date() },
    managerConfirmed: { at: new Date(), byUserId: mgr._id, comment: null },
  });
  await CompanyFoundation.create({
    mission: "Help orgs grow people.",
    vision: "Every workplace runs on intent.",
    values: "Care, Clarity",
    status: "published",
  });
  return { skip, mgr, me, peer };
}

async function cleanup() {
  const emps = await Employee.find(
    { employeeId: { $regex: `^${PREFIX}` } },
    { _id: 1 },
  ).lean();
  const empIds = (emps as Array<{ _id: unknown }>).map((e) => e._id);
  await FocusLayer.deleteMany({ employeeId: { $in: empIds } });
  await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
  await JobDescription.deleteMany({ department: TEST_DEPT });
  await CompanyFoundation.deleteMany({ values: "Care, Clarity" });
}

describe.skipIf(SKIP_NO_DB)("assembleOrgSnapshot", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => cleanup());
  afterAll(async () => {
    await cleanup();
    await mongoose.disconnect();
  });

  it("builds a full snapshot when all data present", async () => {
    const { me } = await setup();
    const snap = await assembleOrgSnapshot(String(me._id));
    expect(snap.employee.name).toBe("Maya Engineer");
    expect(snap.employee.pronouns).toBe("she/her");
    expect(snap.jobDescription?.title).toBe("Software Engineer");
    expect(snap.reportingLine.managerName).toBe("Manny Manager");
    expect(snap.reportingLine.skipLevelName).toBe("Skip Level");
    expect(snap.team.find((m) => m.name === "Pat Peer")).toBeDefined();
    expect(
      snap.team.find((m) => m.isSelf && m.name === "Maya Engineer"),
    ).toBeDefined();
    expect(snap.focusLayer?.responses.uniqueContribution).toContain(
      "cross-team",
    );
    expect(snap.foundation?.mission).toContain("grow people");
    expect(snap.foundation?.coreValues).toEqual(["Care", "Clarity"]);
  });

  it("omits unconfirmed Focus Layers", async () => {
    const { me } = await setup();
    await FocusLayer.updateOne(
      { employeeId: me._id },
      { $set: { status: "submitted" } },
    );
    const snap = await assembleOrgSnapshot(String(me._id));
    expect(snap.focusLayer).toBeNull();
  });

  it("omits jobDescription when employee has none assigned", async () => {
    await setup();
    const noJd = await Employee.create({
      employeeId: `${PREFIX}NOJD`,
      firstName: "No",
      lastName: "Jd",
      email: `${PREFIX}nojd@x.com`,
      department: TEST_DEPT,
      jobTitle: "Eng",
      managerName: "Manny Manager",
      hireDate: new Date(),
    });
    const snap = await assembleOrgSnapshot(String(noJd._id));
    expect(snap.jobDescription).toBeNull();
  });
});
