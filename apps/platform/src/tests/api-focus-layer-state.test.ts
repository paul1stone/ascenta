// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { POST as SUBMIT } from "@/app/api/focus-layers/[employeeId]/submit/route";
import { POST as CONFIRM } from "@/app/api/focus-layers/[employeeId]/confirm/route";

const PREFIX = "FOCUS_API_STATE_";
const FULL = {
  uniqueContribution: "Cross-team narrative translation across product and engineering.",
  highImpactArea: "Most impact when bridging product strategy into engineering execution.",
  signatureResponsibility: "I own the architectural roadmap narrative across squads.",
  workingStyle: "Focused 90-minute blocks plus async pair sessions for tough problems.",
};

async function setup() {
  const employee = await Employee.create({
    employeeId: `${PREFIX}E1`,
    firstName: "E",
    lastName: "Mp",
    email: `${PREFIX}e1@x.com`,
    department: "Engineering",
    jobTitle: "Eng",
    managerName: "Manny Manager",
    hireDate: new Date(),
  });
  const manager = await Employee.create({
    employeeId: `${PREFIX}M1`,
    firstName: "Manny",
    lastName: "Manager",
    email: `${PREFIX}m1@x.com`,
    department: "Engineering",
    jobTitle: "EM",
    managerName: "CEO",
    hireDate: new Date(),
  });
  await FocusLayer.create({
    employeeId: employee._id,
    responses: FULL,
    status: "draft",
  });
  return { employee, manager };
}

function ctx(employeeId: string) {
  return { params: Promise.resolve({ employeeId }) };
}

describe.skipIf(!process.env.MONGODB_URI)("focus-layer state transitions", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await FocusLayer.deleteMany({});
  });

  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await FocusLayer.deleteMany({});
    await mongoose.disconnect();
  });

  it("POST /submit advances to submitted when complete", async () => {
    const { employee } = await setup();
    const res = await SUBMIT(
      new Request("http://t", { method: "POST" }) as never,
      ctx(String(employee._id))
    );
    expect(res.status).toBe(200);
    const fl = await FocusLayer.findOne({ employeeId: employee._id });
    expect(fl?.status).toBe("submitted");
  });

  it("POST /confirm advances submitted to confirmed", async () => {
    const { employee, manager } = await setup();
    await SUBMIT(
      new Request("http://t", { method: "POST" }) as never,
      ctx(String(employee._id))
    );
    const req = new Request("http://t", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dev-user-id": String(manager._id),
      },
      body: JSON.stringify({ comment: "Confirmed" }),
    });
    const res = await CONFIRM(req as never, ctx(String(employee._id)));
    expect(res.status).toBe(200);
    const fl = await FocusLayer.findOne({ employeeId: employee._id });
    expect(fl?.status).toBe("confirmed");
    expect(fl?.managerConfirmed?.comment).toBe("Confirmed");
  });

  it("POST /confirm 409 when not submitted", async () => {
    const { employee, manager } = await setup();
    const req = new Request("http://t", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dev-user-id": String(manager._id),
      },
      body: JSON.stringify({}),
    });
    const res = await CONFIRM(req as never, ctx(String(employee._id)));
    expect(res.status).toBe(409);
  });
});
