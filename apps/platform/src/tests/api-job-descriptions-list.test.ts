import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
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

async function callList(qs: string) {
  const req = new Request(`http://t/api/job-descriptions?${qs}`);
  const res = await GET(req as unknown as import("next/server").NextRequest);
  return res.json();
}

async function callCreate(body: Record<string, unknown>) {
  const req = new Request("http://t/api/job-descriptions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await POST(req as unknown as import("next/server").NextRequest);
  return { status: res.status, json: await res.json() };
}

describe("GET /api/job-descriptions", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
    await mongoose.disconnect();
  });

  it("returns published JDs by default", async () => {
    await JobDescription.create(buildJd());
    const result = await callList("");
    const found = result.jobDescriptions.find((j: { title: string }) =>
      j.title.startsWith(PREFIX),
    );
    expect(found).toBeDefined();
    expect(typeof result.total).toBe("number");
  });

  it("filters by q against title", async () => {
    await JobDescription.create(buildJd({ title: `${PREFIX}Designer` }));
    const result = await callList(`q=${encodeURIComponent("designer")}`);
    expect(
      result.jobDescriptions.find((j: { title: string }) =>
        j.title.includes("Designer"),
      ),
    ).toBeDefined();
  });

  it("filters by department", async () => {
    await JobDescription.create(buildJd({ title: `${PREFIX}Sales`, department: "Sales" }));
    await JobDescription.create(buildJd({ title: `${PREFIX}Eng`, department: "Engineering" }));
    const result = await callList("department=Sales");
    const titles = result.jobDescriptions.map((j: { title: string }) => j.title);
    expect(titles).toContain(`${PREFIX}Sales`);
    expect(titles).not.toContain(`${PREFIX}Eng`);
  });
});

describe("POST /api/job-descriptions", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
  });

  it("creates a JD with valid payload", async () => {
    const { status, json } = await callCreate(buildJd({ title: `${PREFIX}Created` }));
    expect(status).toBe(201);
    expect(json.jobDescription.title).toBe(`${PREFIX}Created`);
    expect(json.jobDescription.id).toBeDefined();
  });

  it("returns 400 on invalid payload", async () => {
    const { status, json } = await callCreate({
      title: "x",
      department: "",
      level: "bad",
    });
    expect(status).toBe(400);
    expect(json.error).toBeDefined();
  });
});
