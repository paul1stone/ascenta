// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { Employee } from "@ascenta/db/employee-schema";
import {
  getFocusLayerByEmployee,
  upsertFocusLayerDraft,
  submitFocusLayer,
  confirmFocusLayer,
} from "@ascenta/db/focus-layers";

const PREFIX = "FOCUS_TEST_QUERIES_";

async function makeEmployee(suffix = "E1") {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: suffix,
    lastName: "Test",
    email: `${PREFIX}${suffix}@x.com`,
    department: "Engineering",
    jobTitle: "Engineer",
    managerName: "M",
    hireDate: new Date(),
  });
}

const RESPONSES_FULL = {
  uniqueContribution: "I bring deep cross-team alignment and translation experience.",
  highImpactArea: "I create the most impact when bridging product and engineering.",
  signatureResponsibility: "I own the technical narrative for our roadmap.",
  workingStyle: "I work best with focused blocks and async written collaboration.",
};

describe.skipIf(!process.env.MONGODB_URI)("focus-layers query helpers", () => {
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

  it("getFocusLayerByEmployee returns null when none exists", async () => {
    const emp = await makeEmployee();
    expect(await getFocusLayerByEmployee(String(emp._id))).toBeNull();
  });

  it("upsertFocusLayerDraft creates and updates", async () => {
    const emp = await makeEmployee();
    const a = await upsertFocusLayerDraft(String(emp._id), null, {
      uniqueContribution: "first",
    });
    expect(a.responses.uniqueContribution).toBe("first");
    const b = await upsertFocusLayerDraft(String(emp._id), null, {
      highImpactArea: "second",
    });
    expect(String(b.id)).toBe(String(a.id));
    expect(b.responses.uniqueContribution).toBe("first");
    expect(b.responses.highImpactArea).toBe("second");
  });

  it("submitFocusLayer requires all responses ≥ 20 chars", async () => {
    const emp = await makeEmployee();
    await upsertFocusLayerDraft(String(emp._id), null, { uniqueContribution: "too short" });
    await expect(submitFocusLayer(String(emp._id))).rejects.toThrow();
  });

  it("submitFocusLayer advances draft → submitted", async () => {
    const emp = await makeEmployee();
    await upsertFocusLayerDraft(String(emp._id), null, RESPONSES_FULL);
    const submitted = await submitFocusLayer(String(emp._id));
    expect(submitted.status).toBe("submitted");
    expect(submitted.employeeSubmitted?.at).toBeTruthy();
  });

  it("confirmFocusLayer requires submitted state", async () => {
    const emp = await makeEmployee();
    const confirmer = await makeEmployee("M1");
    await upsertFocusLayerDraft(String(emp._id), null, RESPONSES_FULL);
    await expect(
      confirmFocusLayer(String(emp._id), String(confirmer._id), null)
    ).rejects.toThrow();
  });

  it("confirmFocusLayer advances submitted → confirmed", async () => {
    const emp = await makeEmployee();
    const confirmer = await makeEmployee("M2");
    await upsertFocusLayerDraft(String(emp._id), null, RESPONSES_FULL);
    await submitFocusLayer(String(emp._id));
    const conf = await confirmFocusLayer(
      String(emp._id),
      String(confirmer._id),
      "Looks good"
    );
    expect(conf.status).toBe("confirmed");
    expect(conf.managerConfirmed?.at).toBeTruthy();
    expect(String(conf.managerConfirmed?.byUserId)).toBe(String(confirmer._id));
    expect(conf.managerConfirmed?.comment).toBe("Looks good");
  });

  it("editing a confirmed Focus Layer demotes to submitted", async () => {
    const emp = await makeEmployee();
    const confirmer = await makeEmployee("M3");
    await upsertFocusLayerDraft(String(emp._id), null, RESPONSES_FULL);
    await submitFocusLayer(String(emp._id));
    await confirmFocusLayer(String(emp._id), String(confirmer._id), null);
    const edited = await upsertFocusLayerDraft(String(emp._id), null, {
      uniqueContribution: "Updated answer about cross-team alignment.",
    });
    expect(edited.status).toBe("submitted");
    expect(edited.managerConfirmed?.at).toBeNull();
  });
});
