// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { GET, PATCH } from "@/app/api/employees/[id]/profile/route";

const PREFIX = "PROFILE_API_";

async function makeEmployee() {
  return Employee.create({
    employeeId: `${PREFIX}E1`,
    firstName: "P",
    lastName: "Roe",
    email: `${PREFIX}p@x.com`,
    department: "Engineering",
    jobTitle: "Eng",
    managerName: "M",
    hireDate: new Date(),
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

// CI doesn't have MONGODB_URI; skip real-DB integration tests there.
describe.skipIf(!process.env.MONGODB_URI)("/api/employees/[id]/profile", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await mongoose.disconnect();
  });

  it("GET returns empty profile and completion 0/7", async () => {
    const emp = await makeEmployee();
    const res = await GET(new Request("http://t") as never, ctx(String(emp._id)));
    const json = await res.json();
    expect(json.profile).toBeDefined();
    expect(json.completion.complete).toBe(0);
    expect(json.completion.total).toBe(7);
  });

  it("GET returns 404 for invalid id", async () => {
    const res = await GET(new Request("http://t") as never, ctx("not-an-id"));
    expect(res.status).toBe(404);
  });

  it("PATCH partial save preserves siblings", async () => {
    const emp = await makeEmployee();
    const a = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ getToKnow: { personalBio: "first" } }),
    });
    await PATCH(a as never, ctx(String(emp._id)));
    const b = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ getToKnow: { hobbies: "trail running" } }),
    });
    const res = await PATCH(b as never, ctx(String(emp._id)));
    const json = await res.json();
    expect(json.profile.getToKnow.personalBio).toBe("first");
    expect(json.profile.getToKnow.hobbies).toBe("trail running");
    expect(json.completion.complete).toBe(2);
  });

  it("PATCH preserves employeeChoice label when only value is updated", async () => {
    const emp = await makeEmployee();
    const a = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        getToKnow: { employeeChoice: { label: "First job" } },
      }),
    });
    await PATCH(a as never, ctx(String(emp._id)));
    const b = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        getToKnow: { employeeChoice: { value: "Bakery" } },
      }),
    });
    const res = await PATCH(b as never, ctx(String(emp._id)));
    const json = await res.json();
    expect(json.profile.getToKnow.employeeChoice.label).toBe("First job");
    expect(json.profile.getToKnow.employeeChoice.value).toBe("Bakery");
  });

  it("PATCH sets profileUpdatedAt", async () => {
    const emp = await makeEmployee();
    const before = Date.now();
    const req = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pronouns: "they/them" }),
    });
    const res = await PATCH(req as never, ctx(String(emp._id)));
    const json = await res.json();
    expect(new Date(json.profile.profileUpdatedAt).getTime()).toBeGreaterThanOrEqual(
      before
    );
  });

  it("PATCH 400 on invalid payload (funFacts > 3)", async () => {
    const emp = await makeEmployee();
    const req = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        getToKnow: { funFacts: ["a", "b", "c", "d"] },
      }),
    });
    const res = await PATCH(req as never, ctx(String(emp._id)));
    expect(res.status).toBe(400);
  });

  it("PATCH 404 for unknown employee id", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const req = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pronouns: "she/her" }),
    });
    const res = await PATCH(req as never, ctx(fakeId));
    expect(res.status).toBe(404);
  });
});
