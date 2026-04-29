# Job Description Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working Job Description Library for the Plan / Organizational Design tab — HR can create, search, edit, and assign role descriptions to employees, with seed data and a stubbed bulk-import button. First sub-project of the Plan module roadmap.

**Architecture:** Shared-template model — one `JobDescription` record per role, referenced by many `Employee` records via a new optional `jobDescriptionId`. Tab-based UI on `plan/org-design` (Job Descriptions tab now, Org Chart tab as empty placeholder for the next sub-project). Server-validated via Zod, persisted in Mongo via Mongoose.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Mongoose · MongoDB Atlas · Zod · react-hook-form · shadcn/ui · Vitest (real-DB integration tests).

**Spec:** `docs/superpowers/specs/2026-04-25-job-description-library-design.md`

**Branch:** `feat/job-description-library` — confirm with the user whether to use a branch or a worktree before starting (per global CLAUDE.md).

---

## Phase 1 — Data Foundation (Tasks 1–4)

### Task 1: Job Description constants

Client-safe enum source of truth. No mongoose import — must be importable from React components.

**Files:**
- Create: `packages/db/src/job-description-constants.ts`

- [ ] **Step 1: Create the constants file**

```ts
// packages/db/src/job-description-constants.ts

export const LEVEL_OPTIONS = [
  "entry",
  "mid",
  "senior",
  "lead",
  "manager",
  "director",
  "executive",
] as const;
export type Level = (typeof LEVEL_OPTIONS)[number];

export const EMPLOYMENT_TYPE_OPTIONS = [
  "full_time",
  "part_time",
  "contract",
  "intern",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPE_OPTIONS)[number];

export const STATUS_OPTIONS = ["draft", "published"] as const;
export type JdStatus = (typeof STATUS_OPTIONS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  entry: "Entry",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
  manager: "Manager",
  director: "Director",
  executive: "Executive",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export const STATUS_LABELS: Record<JdStatus, string> = {
  draft: "Draft",
  published: "Published",
};
```

- [ ] **Step 2: Add sub-path export to packages/db/package.json**

In `packages/db/package.json`, find the `"exports"` map and add:

```json
"./job-description-constants": "./src/job-description-constants.ts",
```

If there is a `"typesVersions"` block, add the same key under `"*"` so TypeScript can resolve `@ascenta/db/job-description-constants`.

- [ ] **Step 3: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS (no new errors).

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/job-description-constants.ts packages/db/package.json
git commit -m "feat(db): add Job Description constants and labels"
```

---

### Task 2: JobDescription Mongoose schema

**Files:**
- Create: `packages/db/src/job-description-schema.ts`

- [ ] **Step 1: Create the schema file**

```ts
// packages/db/src/job-description-schema.ts

import mongoose, { Schema } from "mongoose";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  type Level,
  type EmploymentType,
  type JdStatus,
} from "./job-description-constants";

export {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "./job-description-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const jobDescriptionSchema = new Schema(
  {
    title: { type: String, required: true, index: true, trim: true },
    department: { type: String, required: true, index: true, trim: true },
    level: { type: String, required: true, index: true, enum: LEVEL_OPTIONS },
    employmentType: {
      type: String,
      required: true,
      index: true,
      enum: EMPLOYMENT_TYPE_OPTIONS,
    },
    roleSummary: { type: String, required: true, trim: true },
    coreResponsibilities: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "coreResponsibilities must have at least 1 item",
      },
    },
    requiredQualifications: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "requiredQualifications must have at least 1 item",
      },
    },
    preferredQualifications: { type: [String], default: [] },
    competencies: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "competencies must have at least 1 item",
      },
    },
    status: {
      type: String,
      required: true,
      enum: STATUS_OPTIONS,
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

jobDescriptionSchema.index({ department: 1, level: 1 });

export const JobDescription =
  mongoose.models.JobDescription ||
  mongoose.model("JobDescription", jobDescriptionSchema);

export type JobDescription_Type = {
  id: string;
  title: string;
  department: string;
  level: Level;
  employmentType: EmploymentType;
  roleSummary: string;
  coreResponsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  competencies: string[];
  status: JdStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type NewJobDescription = Omit<
  JobDescription_Type,
  "id" | "createdAt" | "updatedAt"
>;
```

- [ ] **Step 2: Add sub-path export to packages/db/package.json**

In `packages/db/package.json` `"exports"` map, add:

```json
"./job-description-schema": "./src/job-description-schema.ts",
```

Same addition under `"typesVersions"` if present.

- [ ] **Step 3: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/job-description-schema.ts packages/db/package.json
git commit -m "feat(db): add JobDescription Mongoose schema"
```

---

### Task 3: Add `jobDescriptionId` to Employee schema

**Files:**
- Modify: `packages/db/src/employee-schema.ts`

- [ ] **Step 1: Add the ref field to the schema**

Open `packages/db/src/employee-schema.ts`. In `employeeSchema`, add this field after `notes`:

```ts
jobDescriptionId: {
  type: Schema.Types.ObjectId,
  ref: "JobDescription",
  index: true,
  default: null,
},
```

Add to the `Employee_Type` and `NewEmployee` type aliases:

```ts
jobDescriptionId?: string | null;
```

- [ ] **Step 2: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/employee-schema.ts
git commit -m "feat(db): add jobDescriptionId ref to Employee schema"
```

---

### Task 4: Job Description query helpers (with tests)

Real-DB integration tests using existing Vitest setup. Tests live under `apps/platform/src/tests/` to match the repo's existing test directory.

**Files:**
- Create: `packages/db/src/job-descriptions.ts`
- Create: `apps/platform/src/tests/job-descriptions-queries.test.ts`
- Modify: `packages/db/package.json` (add export)
- Modify: `packages/db/src/index.ts` (re-export)

- [ ] **Step 1: Write the failing tests**

```ts
// apps/platform/src/tests/job-descriptions-queries.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/job-descriptions-queries.test.ts`
Expected: FAIL — module `@ascenta/db/job-descriptions` not found.

- [ ] **Step 3: Implement query helpers**

```ts
// packages/db/src/job-descriptions.ts

import mongoose, { Types } from "mongoose";
import { JobDescription } from "./job-description-schema";
import { Employee } from "./employee-schema";
import type {
  Level,
  EmploymentType,
  JdStatus,
} from "./job-description-constants";

export interface ListFilters {
  q?: string;
  department?: string;
  level?: Level;
  employmentType?: EmploymentType;
  status?: JdStatus | "all";
  limit?: number;
  offset?: number;
}

export interface ListedJobDescription {
  id: string;
  title: string;
  department: string;
  level: Level;
  employmentType: EmploymentType;
  roleSummary: string;
  coreResponsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  competencies: string[];
  status: JdStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedCount: number;
}

export async function listJobDescriptions(
  filters: ListFilters,
): Promise<{ items: ListedJobDescription[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const offset = Math.max(filters.offset ?? 0, 0);

  const match: Record<string, unknown> = {};
  if (filters.status && filters.status !== "all") {
    match.status = filters.status;
  } else if (!filters.status) {
    match.status = "published";
  }
  if (filters.department) match.department = filters.department;
  if (filters.level) match.level = filters.level;
  if (filters.employmentType) match.employmentType = filters.employmentType;
  if (filters.q && filters.q.trim()) {
    const re = new RegExp(escapeRegex(filters.q.trim()), "i");
    match.$or = [{ title: re }, { roleSummary: re }];
  }

  const [items, total] = await Promise.all([
    JobDescription.aggregate([
      { $match: match },
      { $sort: { updatedAt: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: "employees",
          let: { jdId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$jobDescriptionId", "$$jdId"] } } },
            { $count: "n" },
          ],
          as: "_assigned",
        },
      },
      {
        $addFields: {
          id: { $toString: "$_id" },
          assignedCount: {
            $ifNull: [{ $arrayElemAt: ["$_assigned.n", 0] }, 0],
          },
        },
      },
      { $project: { _id: 0, __v: 0, _assigned: 0 } },
    ]),
    JobDescription.countDocuments(match),
  ]);

  return { items: items as ListedJobDescription[], total };
}

export async function getJobDescriptionById(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return JobDescription.findById(id).lean();
}

export async function listAssignedEmployees(jobDescriptionId: string) {
  if (!mongoose.isValidObjectId(jobDescriptionId)) return [];
  return Employee.find({
    jobDescriptionId: new Types.ObjectId(jobDescriptionId),
  })
    .sort({ lastName: 1, firstName: 1 })
    .lean();
}

export async function countAssignedEmployees(
  jobDescriptionIds: string[],
): Promise<Record<string, number>> {
  const valid = jobDescriptionIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new Types.ObjectId(id));
  if (!valid.length) return {};
  const rows = await Employee.aggregate([
    { $match: { jobDescriptionId: { $in: valid } } },
    { $group: { _id: "$jobDescriptionId", n: { $sum: 1 } } },
  ]);
  const result: Record<string, number> = {};
  for (const id of jobDescriptionIds) result[id] = 0;
  for (const row of rows) result[String(row._id)] = row.n;
  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

- [ ] **Step 4: Add sub-path export and re-export from index**

In `packages/db/package.json` `"exports"` map:

```json
"./job-descriptions": "./src/job-descriptions.ts",
```

Same under `"typesVersions"` if present.

In `packages/db/src/index.ts`, add at the bottom:

```ts
export * from "./job-descriptions";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/job-descriptions-queries.test.ts`
Expected: PASS — 8 tests passing.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/job-descriptions.ts packages/db/src/index.ts \
  packages/db/package.json apps/platform/src/tests/job-descriptions-queries.test.ts
git commit -m "feat(db): add Job Description query helpers with assignedCount aggregation"
```

---

## Phase 2 — Validation + API (Tasks 5–8)

### Task 5: Zod validation schemas

**Files:**
- Create: `apps/platform/src/lib/validations/job-description.ts`
- Create: `apps/platform/src/tests/job-description-validation.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/platform/src/tests/job-description-validation.test.ts
import { describe, it, expect } from "vitest";
import {
  jobDescriptionInputSchema,
  jobDescriptionPatchSchema,
  assignEmployeesSchema,
} from "@/lib/validations/job-description";

const valid = {
  title: "Software Engineer",
  department: "Engineering",
  level: "mid" as const,
  employmentType: "full_time" as const,
  roleSummary: "Builds high-quality software systems for the company.",
  coreResponsibilities: ["Write code", "Review pull requests"],
  requiredQualifications: ["3+ years experience"],
  preferredQualifications: [],
  competencies: ["Ownership", "Communication"],
  status: "published" as const,
};

describe("jobDescriptionInputSchema", () => {
  it("accepts valid payload", () => {
    expect(jobDescriptionInputSchema.parse(valid)).toMatchObject({
      title: "Software Engineer",
    });
  });

  it("defaults preferredQualifications to []", () => {
    const { preferredQualifications: _drop, ...withoutPref } = valid;
    const parsed = jobDescriptionInputSchema.parse(withoutPref);
    expect(parsed.preferredQualifications).toEqual([]);
  });

  it("defaults status to 'published'", () => {
    const { status: _drop, ...withoutStatus } = valid;
    const parsed = jobDescriptionInputSchema.parse(withoutStatus);
    expect(parsed.status).toBe("published");
  });

  it("rejects title shorter than 2 chars", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, title: "x" }),
    ).toThrow();
  });

  it("rejects empty coreResponsibilities", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, coreResponsibilities: [] }),
    ).toThrow();
  });

  it("rejects roleSummary shorter than 20 chars", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, roleSummary: "too short" }),
    ).toThrow();
  });

  it("rejects invalid level enum", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, level: "junior" }),
    ).toThrow();
  });
});

describe("jobDescriptionPatchSchema", () => {
  it("accepts a single-field update", () => {
    expect(jobDescriptionPatchSchema.parse({ title: "Updated" })).toEqual({
      title: "Updated",
    });
  });

  it("accepts an empty patch", () => {
    expect(jobDescriptionPatchSchema.parse({})).toEqual({});
  });
});

describe("assignEmployeesSchema", () => {
  it("requires at least one id", () => {
    expect(() => assignEmployeesSchema.parse({ employeeIds: [] })).toThrow();
  });

  it("accepts list of ids", () => {
    expect(assignEmployeesSchema.parse({ employeeIds: ["a", "b"] })).toEqual({
      employeeIds: ["a", "b"],
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/job-description-validation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the Zod schemas**

```ts
// apps/platform/src/lib/validations/job-description.ts
import { z } from "zod";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "@ascenta/db/job-description-constants";

const bullet = z.string().trim().min(1, "Required").max(500);

export const jobDescriptionInputSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(200),
  department: z.string().trim().min(1, "Department is required").max(100),
  level: z.enum(LEVEL_OPTIONS, { message: "Level is required" }),
  employmentType: z.enum(EMPLOYMENT_TYPE_OPTIONS, {
    message: "Employment type is required",
  }),
  roleSummary: z
    .string()
    .trim()
    .min(20, "Role summary must be at least 20 characters")
    .max(4000),
  coreResponsibilities: z.array(bullet).min(1, "At least 1 responsibility is required").max(20),
  requiredQualifications: z.array(bullet).min(1, "At least 1 required qualification is required").max(20),
  preferredQualifications: z.array(bullet).max(20).default([]),
  competencies: z.array(bullet).min(1, "At least 1 competency is required").max(20),
  status: z.enum(STATUS_OPTIONS).default("published"),
});

export type JobDescriptionInput = z.infer<typeof jobDescriptionInputSchema>;

export const jobDescriptionPatchSchema = jobDescriptionInputSchema.partial();
export type JobDescriptionPatch = z.infer<typeof jobDescriptionPatchSchema>;

export const assignEmployeesSchema = z.object({
  employeeIds: z.array(z.string().min(1)).min(1, "At least one employee is required").max(500),
});
export type AssignEmployeesInput = z.infer<typeof assignEmployeesSchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/job-description-validation.test.ts`
Expected: PASS — 11 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/validations/job-description.ts \
  apps/platform/src/tests/job-description-validation.test.ts
git commit -m "feat(platform): add Zod validation for Job Description input"
```

---

### Task 6: List + Create API routes

**Files:**
- Create: `apps/platform/src/app/api/job-descriptions/route.ts`
- Create: `apps/platform/src/tests/api-job-descriptions-list.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/platform/src/tests/api-job-descriptions-list.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-job-descriptions-list.test.ts`
Expected: FAIL — module `@/app/api/job-descriptions/route` not found.

- [ ] **Step 3: Implement the route**

```ts
// apps/platform/src/app/api/job-descriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { listJobDescriptions } from "@ascenta/db/job-descriptions";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "@ascenta/db/job-description-constants";
import { jobDescriptionInputSchema } from "@/lib/validations/job-description";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") ?? undefined;
    const department = searchParams.get("department") ?? undefined;
    const level = searchParams.get("level") as
      | (typeof LEVEL_OPTIONS)[number]
      | null;
    const employmentType = searchParams.get("employmentType") as
      | (typeof EMPLOYMENT_TYPE_OPTIONS)[number]
      | null;
    const statusRaw = searchParams.get("status");
    let status: (typeof STATUS_OPTIONS)[number] | "all" | undefined;
    if (statusRaw === "all") status = "all";
    else if (statusRaw && (STATUS_OPTIONS as readonly string[]).includes(statusRaw))
      status = statusRaw as (typeof STATUS_OPTIONS)[number];

    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    const result = await listJobDescriptions({
      q,
      department: department || undefined,
      level: level ?? undefined,
      employmentType: employmentType ?? undefined,
      status,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });
    return NextResponse.json({
      jobDescriptions: result.items,
      total: result.total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GET /api/job-descriptions error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = jobDescriptionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const created = await JobDescription.create(parsed.data);
    return NextResponse.json(
      { jobDescription: created.toJSON() },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("POST /api/job-descriptions error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-job-descriptions-list.test.ts`
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/api/job-descriptions/route.ts \
  apps/platform/src/tests/api-job-descriptions-list.test.ts
git commit -m "feat(api): add GET/POST /api/job-descriptions"
```

---

### Task 7: Single JD route (GET / PATCH / DELETE with cascade)

**Files:**
- Create: `apps/platform/src/app/api/job-descriptions/[id]/route.ts`
- Create: `apps/platform/src/tests/api-job-descriptions-crud.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/platform/src/tests/api-job-descriptions-crud.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { GET, PATCH, DELETE } from "@/app/api/job-descriptions/[id]/route";

const PREFIX = "JD_API_CRUD_";

function buildJd(over: Partial<Record<string, unknown>> = {}) {
  return {
    title: `${PREFIX}Engineer`,
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years"],
    competencies: ["Ownership"],
    status: "published",
    ...over,
  };
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) } as unknown as {
    params: Promise<{ id: string }>;
  };
}

async function get(id: string) {
  const res = await GET(new Request("http://t") as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function patch(id: string, body: Record<string, unknown>) {
  const req = new Request("http://t", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await PATCH(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function del(id: string) {
  const res = await DELETE(new Request("http://t", { method: "DELETE" }) as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}

describe("/api/job-descriptions/[id]", () => {
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

  it("GET returns the JD", async () => {
    const jd = await JobDescription.create(buildJd());
    const r = await get(String(jd._id));
    expect(r.status).toBe(200);
    expect(r.json.jobDescription.title).toBe(`${PREFIX}Engineer`);
  });

  it("GET returns 404 for unknown id", async () => {
    const r = await get(String(new mongoose.Types.ObjectId()));
    expect(r.status).toBe(404);
  });

  it("PATCH updates fields", async () => {
    const jd = await JobDescription.create(buildJd());
    const r = await patch(String(jd._id), { title: `${PREFIX}Updated` });
    expect(r.status).toBe(200);
    expect(r.json.jobDescription.title).toBe(`${PREFIX}Updated`);
  });

  it("PATCH returns 400 on invalid payload", async () => {
    const jd = await JobDescription.create(buildJd());
    const r = await patch(String(jd._id), { level: "bad" });
    expect(r.status).toBe(400);
  });

  it("DELETE clears jobDescriptionId on assigned employees", async () => {
    const jd = await JobDescription.create(buildJd());
    await Employee.create({
      employeeId: `${PREFIX}E1`,
      firstName: "A",
      lastName: "Z",
      email: `${PREFIX}e1@x.com`,
      department: "Engineering",
      jobTitle: "Eng",
      managerName: "M",
      hireDate: new Date(),
      jobDescriptionId: jd._id,
    });
    const r = await del(String(jd._id));
    expect(r.status).toBe(200);
    expect(r.json.unassignedEmployees).toBe(1);
    const refreshed = await Employee.findOne({ employeeId: `${PREFIX}E1` });
    expect(refreshed?.jobDescriptionId).toBeNull();
  });

  it("DELETE returns 404 for unknown id", async () => {
    const r = await del(String(new mongoose.Types.ObjectId()));
    expect(r.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-job-descriptions-crud.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the route**

```ts
// apps/platform/src/app/api/job-descriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { jobDescriptionPatchSchema } from "@/lib/validations/job-description";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id);
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ jobDescription: jd.toJSON() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = jobDescriptionPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const updated = await JobDescription.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ jobDescription: updated.toJSON() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id);
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await Employee.updateMany(
      { jobDescriptionId: id },
      { $set: { jobDescriptionId: null } },
    );
    await JobDescription.findByIdAndDelete(id);
    return NextResponse.json({
      unassignedEmployees: result.modifiedCount ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-job-descriptions-crud.test.ts`
Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/api/job-descriptions/\[id\]/route.ts \
  apps/platform/src/tests/api-job-descriptions-crud.test.ts
git commit -m "feat(api): add GET/PATCH/DELETE /api/job-descriptions/[id] with cascade unassign"
```

---

### Task 8: Employee assignment routes

**Files:**
- Create: `apps/platform/src/app/api/job-descriptions/[id]/employees/route.ts`
- Create: `apps/platform/src/tests/api-job-descriptions-employees.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/platform/src/tests/api-job-descriptions-employees.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import {
  GET,
  POST,
  DELETE,
} from "@/app/api/job-descriptions/[id]/employees/route";

const PREFIX = "JD_API_EMP_";

async function makeJd(title = `${PREFIX}Engineer`) {
  return JobDescription.create({
    title,
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years"],
    competencies: ["Ownership"],
    status: "published",
  });
}

async function makeEmp(suffix: string, jdId?: mongoose.Types.ObjectId) {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: suffix,
    lastName: "Test",
    email: `${PREFIX}${suffix}@x.com`,
    department: "Engineering",
    jobTitle: "Eng",
    managerName: "M",
    hireDate: new Date(),
    jobDescriptionId: jdId ?? null,
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) } as unknown as {
    params: Promise<{ id: string }>;
  };
}

async function get(id: string) {
  const res = await GET(new Request("http://t") as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function post(id: string, body: Record<string, unknown>) {
  const req = new Request("http://t", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await POST(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}
async function del(id: string, body: Record<string, unknown>) {
  const req = new Request("http://t", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await DELETE(req as unknown as import("next/server").NextRequest, ctx(id));
  return { status: res.status, json: await res.json() };
}

describe("/api/job-descriptions/[id]/employees", () => {
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

  it("GET returns assigned employees", async () => {
    const jd = await makeJd();
    await makeEmp("E1", jd._id);
    const r = await get(String(jd._id));
    expect(r.status).toBe(200);
    expect(r.json.employees.length).toBe(1);
  });

  it("POST assigns employees and is idempotent", async () => {
    const jd = await makeJd();
    const e1 = await makeEmp("E1");
    const e2 = await makeEmp("E2");
    const first = await post(String(jd._id), {
      employeeIds: [String(e1._id), String(e2._id)],
    });
    expect(first.status).toBe(200);
    expect(first.json.assignedCount).toBe(2);

    const second = await post(String(jd._id), {
      employeeIds: [String(e1._id)],
    });
    expect(second.status).toBe(200);
    expect(second.json.assignedCount).toBe(1);
    const e1Refreshed = await Employee.findById(e1._id);
    expect(String(e1Refreshed?.jobDescriptionId)).toBe(String(jd._id));
  });

  it("DELETE only unassigns employees currently assigned to this JD", async () => {
    const jd1 = await makeJd();
    const jd2 = await makeJd(`${PREFIX}Other`);
    const e1 = await makeEmp("E1", jd1._id);
    const e2 = await makeEmp("E2", jd2._id);
    const r = await del(String(jd1._id), {
      employeeIds: [String(e1._id), String(e2._id)],
    });
    expect(r.status).toBe(200);
    expect(r.json.unassignedCount).toBe(1);
    const e1r = await Employee.findById(e1._id);
    const e2r = await Employee.findById(e2._id);
    expect(e1r?.jobDescriptionId).toBeNull();
    expect(String(e2r?.jobDescriptionId)).toBe(String(jd2._id));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-job-descriptions-employees.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the route**

```ts
// apps/platform/src/app/api/job-descriptions/[id]/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { listAssignedEmployees } from "@ascenta/db/job-descriptions";
import { assignEmployeesSchema } from "@/lib/validations/job-description";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id).lean();
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const employees = await listAssignedEmployees(id);
    return NextResponse.json({
      employees: employees.map((e: Record<string, unknown>) => ({
        ...e,
        id: String(e._id),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const jd = await JobDescription.findById(id);
    if (!jd) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = assignEmployeesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const objectIds = parsed.data.employeeIds.filter((eid) =>
      mongoose.isValidObjectId(eid),
    );
    const result = await Employee.updateMany(
      { _id: { $in: objectIds } },
      { $set: { jobDescriptionId: id } },
    );
    return NextResponse.json({ assignedCount: result.modifiedCount ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = assignEmployeesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const objectIds = parsed.data.employeeIds.filter((eid) =>
      mongoose.isValidObjectId(eid),
    );
    const result = await Employee.updateMany(
      { _id: { $in: objectIds }, jobDescriptionId: id },
      { $set: { jobDescriptionId: null } },
    );
    return NextResponse.json({ unassignedCount: result.modifiedCount ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-job-descriptions-employees.test.ts`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/api/job-descriptions/\[id\]/employees/route.ts \
  apps/platform/src/tests/api-job-descriptions-employees.test.ts
git commit -m "feat(api): add employee assignment routes for Job Descriptions"
```

---

## Phase 3 — Seed Data (Task 9)

### Task 9: Seed script with backfill

**Files:**
- Create: `scripts/seed-job-descriptions.ts`
- Modify: `package.json` (root) — add `db:seed-jds` script

- [ ] **Step 1: Create the seed script**

```ts
// scripts/seed-job-descriptions.ts
import "dotenv/config";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { Employee } from "@ascenta/db/employee-schema";

interface Seed {
  title: string;
  department: string;
  level: "entry" | "mid" | "senior" | "lead" | "manager" | "director" | "executive";
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  roleSummary: string;
  coreResponsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  competencies: string[];
}

const SEEDS: Seed[] = [
  {
    title: "Software Engineer",
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Designs, builds, and maintains software systems that power core product capabilities. Collaborates with product, design, and other engineers to ship reliable features that move customer outcomes.",
    coreResponsibilities: [
      "Write, review, and maintain production-quality code across the stack",
      "Translate product requirements into technical designs and implementations",
      "Participate in code review, give and incorporate substantive feedback",
      "Contribute to incident response and on-call rotations as needed",
    ],
    requiredQualifications: [
      "3+ years of professional software engineering experience",
      "Proficiency in at least one modern backend or full-stack language",
      "Comfortable working across the stack with relational and NoSQL databases",
    ],
    preferredQualifications: [
      "Experience with TypeScript, React, and Next.js",
      "Familiarity with cloud-native deployment patterns",
    ],
    competencies: [
      "Technical depth",
      "Ownership",
      "Communication",
      "Pragmatism",
      "Customer focus",
    ],
  },
  {
    title: "Senior Software Engineer",
    department: "Engineering",
    level: "senior",
    employmentType: "full_time",
    roleSummary:
      "Leads complex initiatives that span multiple components or services. Sets technical direction for a team and mentors mid-level engineers while still contributing meaningful production code.",
    coreResponsibilities: [
      "Drive technical design for cross-cutting initiatives",
      "Mentor mid-level engineers and raise team-wide engineering quality",
      "Identify and resolve sources of architectural risk",
      "Partner with product to shape scope based on technical realities",
    ],
    requiredQualifications: [
      "5+ years of professional software engineering experience",
      "Proven track record shipping non-trivial production systems",
      "Experience leading multi-engineer projects end to end",
    ],
    preferredQualifications: [
      "Experience as a tech lead or staff engineer",
      "Background in distributed systems or data-intensive applications",
    ],
    competencies: [
      "Architectural judgment",
      "Mentorship",
      "Strategic thinking",
      "Communication",
      "Decision making",
    ],
  },
  {
    title: "Engineering Manager",
    department: "Engineering",
    level: "manager",
    employmentType: "full_time",
    roleSummary:
      "Owns the performance, growth, and delivery of an engineering team. Balances people leadership, technical direction, and cross-functional partnership to ship outcomes the business depends on.",
    coreResponsibilities: [
      "Manage and grow a team of 4–8 engineers across all career stages",
      "Set quarterly priorities and hold the team accountable for outcomes",
      "Run hiring, performance, and development conversations end to end",
      "Partner with product and design on roadmap and trade-off decisions",
    ],
    requiredQualifications: [
      "2+ years of engineering management experience",
      "Strong technical foundation built on prior IC experience",
      "Demonstrated success developing engineers and shipping product",
    ],
    preferredQualifications: [
      "Experience scaling a team through 2x+ growth",
      "Background managing both senior and early-career engineers",
    ],
    competencies: [
      "People leadership",
      "Strategic thinking",
      "Coaching",
      "Cross-functional partnership",
      "Decision making",
    ],
  },
  {
    title: "Product Manager",
    department: "Product",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Owns a product area end to end — from discovery through delivery and adoption. Translates customer needs and business strategy into prioritized roadmaps and shippable scope.",
    coreResponsibilities: [
      "Define and own the roadmap for a product area",
      "Run customer discovery and synthesize findings into actionable scope",
      "Partner with engineering and design through delivery",
      "Track adoption and outcome metrics; iterate accordingly",
    ],
    requiredQualifications: [
      "3+ years of product management experience",
      "Track record shipping software products with measurable outcomes",
      "Strong written and verbal communication",
    ],
    preferredQualifications: [
      "Experience in B2B SaaS",
      "Familiarity with HR or workflow-automation domains",
    ],
    competencies: [
      "Customer empathy",
      "Strategic thinking",
      "Prioritization",
      "Communication",
      "Cross-functional partnership",
    ],
  },
  {
    title: "Director of Product",
    department: "Product",
    level: "director",
    employmentType: "full_time",
    roleSummary:
      "Leads the product organization for a portfolio of areas. Sets strategy, develops PMs, and ensures the team ships outcomes that move the business.",
    coreResponsibilities: [
      "Set product strategy across multiple product areas",
      "Hire, manage, and develop a team of product managers",
      "Partner with engineering, design, and GTM leadership on company priorities",
      "Represent product at the executive level and shape company direction",
    ],
    requiredQualifications: [
      "8+ years of product experience including 3+ in product leadership",
      "Track record managing PMs and shaping multi-team strategy",
      "Strong executive communication",
    ],
    preferredQualifications: [
      "Experience scaling a product team in a growth-stage company",
    ],
    competencies: [
      "Strategic vision",
      "People leadership",
      "Executive communication",
      "Decision making",
      "Cross-functional partnership",
    ],
  },
  {
    title: "People Operations Specialist",
    department: "People",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Owns day-to-day operations across the employee lifecycle — onboarding, benefits, compliance, and HR systems. Acts as the first point of contact for employee questions.",
    coreResponsibilities: [
      "Run onboarding and offboarding processes end to end",
      "Administer benefits enrollment and act as employee point of contact",
      "Maintain employee records and HRIS data integrity",
      "Support compliance reporting and policy acknowledgment campaigns",
    ],
    requiredQualifications: [
      "2+ years in HR, People Ops, or similar role",
      "Strong attention to detail and discretion with sensitive data",
      "Comfortable working across HR systems",
    ],
    preferredQualifications: [
      "Experience administering a modern HRIS",
      "PHR or SHRM-CP certification",
    ],
    competencies: [
      "Discretion",
      "Attention to detail",
      "Service orientation",
      "Communication",
      "Process discipline",
    ],
  },
  {
    title: "People Operations Lead",
    department: "People",
    level: "lead",
    employmentType: "full_time",
    roleSummary:
      "Leads the People Operations function for the company. Shapes process, owns programs, and partners with leaders across the business on talent decisions.",
    coreResponsibilities: [
      "Own People Ops processes across the employee lifecycle",
      "Lead policy development and compliance posture",
      "Partner with leadership on org design, comp, and performance programs",
      "Manage People Ops vendors and HR tooling",
    ],
    requiredQualifications: [
      "5+ years of HR or People Operations experience",
      "Demonstrated program ownership across the employee lifecycle",
      "Strong judgment on sensitive employee matters",
    ],
    preferredQualifications: [
      "Experience leading People Ops at a growth-stage company",
    ],
    competencies: [
      "Program ownership",
      "Judgment",
      "People leadership",
      "Strategic thinking",
      "Communication",
    ],
  },
  {
    title: "Account Executive",
    department: "Sales",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Owns a quota and works inbound and outbound opportunities through to close. Builds trusted relationships with prospects and partners with SDRs, marketing, and customer success.",
    coreResponsibilities: [
      "Run full-cycle sales motions from qualification to close",
      "Maintain accurate forecasts and pipeline hygiene",
      "Run discovery, demos, and procurement conversations with senior buyers",
      "Partner with marketing and CS to grow accounts post-close",
    ],
    requiredQualifications: [
      "3+ years of full-cycle B2B SaaS sales experience",
      "Track record meeting or exceeding quota",
      "Strong written and verbal communication",
    ],
    preferredQualifications: ["Experience selling into HR or operations buyers"],
    competencies: [
      "Customer empathy",
      "Communication",
      "Resilience",
      "Discipline",
      "Strategic thinking",
    ],
  },
  {
    title: "Sales Director",
    department: "Sales",
    level: "director",
    employmentType: "full_time",
    roleSummary:
      "Leads a team of account executives toward revenue targets. Owns hiring, coaching, forecasting, and the deal-by-deal motion that drives company growth.",
    coreResponsibilities: [
      "Hire, coach, and develop a team of 5–10 AEs",
      "Own quarterly and annual revenue targets for the team",
      "Run forecast calls and partner with finance on planning",
      "Partner with marketing and CS to drive pipeline and retention",
    ],
    requiredQualifications: [
      "3+ years of sales management experience",
      "Track record of building and scaling sales teams",
      "Executive communication and forecasting discipline",
    ],
    preferredQualifications: [
      "Experience leading sales at a growth-stage SaaS company",
    ],
    competencies: [
      "People leadership",
      "Strategic thinking",
      "Coaching",
      "Forecast discipline",
      "Cross-functional partnership",
    ],
  },
  {
    title: "Operations Coordinator",
    department: "Operations",
    level: "entry",
    employmentType: "full_time",
    roleSummary:
      "Supports day-to-day operations across the company — from office logistics to internal events to vendor management. The kind of role that quietly keeps everything running.",
    coreResponsibilities: [
      "Coordinate internal events and offsites end to end",
      "Manage office logistics, supplies, and vendor relationships",
      "Support cross-functional projects with operational execution",
      "Maintain shared documentation and operational playbooks",
    ],
    requiredQualifications: [
      "1+ year of relevant operations or coordination experience",
      "Strong organization and follow-through",
      "Comfortable owning logistics under deadline pressure",
    ],
    preferredQualifications: ["Experience coordinating events for 100+ attendees"],
    competencies: [
      "Organization",
      "Follow-through",
      "Service orientation",
      "Communication",
      "Adaptability",
    ],
  },
];

async function main() {
  await connectDB();

  console.log(`Seeding ${SEEDS.length} job descriptions...`);
  const upserted: Array<{ id: string; title: string }> = [];
  for (const seed of SEEDS) {
    const result = await JobDescription.findOneAndUpdate(
      { title: seed.title },
      { ...seed, status: "published" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    upserted.push({ id: String(result._id), title: result.title });
  }
  console.log(`Upserted ${upserted.length} JDs.`);

  console.log("Backfilling Employee.jobDescriptionId by title match...");
  const employees = await Employee.find().lean();
  let attached = 0;
  const unmatched: string[] = [];
  for (const emp of employees) {
    const title = String(emp.jobTitle ?? "").toLowerCase().trim();
    if (!title) {
      unmatched.push(`${emp.firstName} ${emp.lastName} (no jobTitle)`);
      continue;
    }
    const exact = upserted.find((u) => u.title.toLowerCase() === title);
    const substring =
      exact ??
      upserted.find(
        (u) =>
          u.title.toLowerCase().includes(title) ||
          title.includes(u.title.toLowerCase()),
      );
    if (substring) {
      await Employee.updateOne(
        { _id: emp._id },
        { $set: { jobDescriptionId: substring.id } },
      );
      attached++;
    } else {
      unmatched.push(`${emp.firstName} ${emp.lastName} — '${emp.jobTitle}'`);
    }
  }
  console.log(
    `Attached ${attached}/${employees.length} employees. Unmatched: ${unmatched.length}`,
  );
  for (const u of unmatched.slice(0, 20)) console.log(`  - ${u}`);
  if (unmatched.length > 20) console.log(`  ... and ${unmatched.length - 20} more`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the script to root package.json**

In `package.json` `"scripts"` block, add after the existing seed scripts:

```json
"db:seed-jds": "npx tsx scripts/seed-job-descriptions.ts",
```

- [ ] **Step 3: Run the seed**

Run: `pnpm db:seed-jds`
Expected: Logs "Upserted 10 JDs" and an attachment summary. Idempotent — safe to re-run.

- [ ] **Step 4: Verify in DB**

Run a quick mongoose check or use the existing MongoDB MCP tooling to confirm 10 JD records exist and at least some employees have `jobDescriptionId` set.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-job-descriptions.ts package.json
git commit -m "feat(seed): add seed-job-descriptions script with employee backfill"
```

---

## Phase 4 — UI Foundation (Tasks 10–12)

### Task 10: Add tabs to plan/org-design PageConfig

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`

- [ ] **Step 1: Update the PageConfig and imports**

Open `apps/platform/src/lib/constants/dashboard-nav.ts`. The `FileText` and `Building2` icons are already imported — verify they are. Update the `plan/org-design` entry:

```ts
"plan/org-design": {
  title: "Organizational Design",
  description: "Design organizational structures and operating models for effectiveness.",
  tabs: [
    { key: "job-descriptions", label: "Job Descriptions", icon: FileText },
    { key: "org-chart", label: "Org Chart", icon: Building2 },
  ],
},
```

- [ ] **Step 2: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "feat(nav): add Job Descriptions and Org Chart tabs to plan/org-design"
```

---

### Task 11: BulletListField repeater component

Reusable add/remove repeater used in the JD form for responsibilities, qualifications, and competencies.

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/bullet-list-field.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/platform/src/components/plan/job-descriptions/bullet-list-field.tsx
"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@ascenta/ui/components/button";
import { Input } from "@ascenta/ui/components/input";
import { Plus, X } from "lucide-react";

interface BulletListFieldProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  placeholder?: string;
}

export function BulletListField({
  name,
  label,
  min = 0,
  max = 20,
  placeholder = "Add an item...",
}: BulletListFieldProps) {
  const { control, register, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const errors = (formState.errors as Record<string, unknown>)[name] as
    | { message?: string }
    | Array<{ message?: string }>
    | undefined;

  const rootError =
    errors && !Array.isArray(errors) && "message" in errors
      ? errors.message
      : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {min > 0 && <span className="text-destructive">*</span>}
        </label>
        <span className="text-xs text-muted-foreground">
          {fields.length}/{max}
        </span>
      </div>
      <div className="space-y-2">
        {fields.map((field, idx) => {
          const itemError = Array.isArray(errors) ? errors[idx] : undefined;
          return (
            <div key={field.id} className="flex items-start gap-2">
              <Input
                {...register(`${name}.${idx}` as const)}
                placeholder={placeholder}
                aria-label={`${label} ${idx + 1}`}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(idx)}
                disabled={fields.length <= min}
                aria-label={`Remove ${label} ${idx + 1}`}
              >
                <X className="size-4" />
              </Button>
              {itemError?.message && (
                <p className="text-xs text-destructive mt-2">{itemError.message}</p>
              )}
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append("")}
        disabled={fields.length >= max}
      >
        <Plus className="size-4 mr-1" />
        Add item
      </Button>
      {rootError && <p className="text-xs text-destructive">{String(rootError)}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/bullet-list-field.tsx
git commit -m "feat(plan): add BulletListField repeater component"
```

---

### Task 12: JdForm component (with form tests)

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/jd-form.tsx`
- Create: `apps/platform/src/tests/jd-form.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/platform/src/tests/jd-form.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { JdForm } from "@/components/plan/job-descriptions/jd-form";

describe("JdForm", () => {
  it("renders all required fields", () => {
    render(<JdForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Responsibilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Required Qualifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Competencies/i)).toBeInTheDocument();
  });

  it("shows validation errors when submit is clicked with empty form", async () => {
    render(<JdForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Install testing library if not present**

Check `apps/platform/package.json` devDependencies. If `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` are missing, install:

```bash
pnpm --filter @ascenta/platform add -D @testing-library/react @testing-library/jest-dom jsdom
```

Update `apps/platform/vitest.config.ts` to enable jsdom for component tests:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    passWithNoTests: true,
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

If switching to jsdom breaks the existing real-DB tests (mongoose needs node environment), use the per-file directive at the top of those tests instead:

```ts
// @vitest-environment node
```

Add that directive to all five existing `*-tests/*` files plus the four new API/query/validation test files written in Tasks 4–8.

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/jd-form.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the form**

```tsx
// apps/platform/src/components/plan/job-descriptions/jd-form.tsx
"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobDescriptionInputSchema,
  type JobDescriptionInput,
} from "@/lib/validations/job-description";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@ascenta/db/job-description-constants";
import { Button } from "@ascenta/ui/components/button";
import { Input } from "@ascenta/ui/components/input";
import { Textarea } from "@ascenta/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/components/select";
import { BulletListField } from "./bullet-list-field";

interface JdFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<JobDescriptionInput> & { id?: string };
  onSuccess: (jd: JobDescriptionInput & { id: string }) => void;
  onCancel: () => void;
}

const emptyDefaults: JobDescriptionInput = {
  title: "",
  department: "",
  level: "mid",
  employmentType: "full_time",
  roleSummary: "",
  coreResponsibilities: [""],
  requiredQualifications: [""],
  preferredQualifications: [],
  competencies: [""],
  status: "published",
};

export function JdForm({ mode, initialValues, onSuccess, onCancel }: JdFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<JobDescriptionInput>({
    resolver: zodResolver(jobDescriptionInputSchema),
    defaultValues: { ...emptyDefaults, ...initialValues },
    mode: "onSubmit",
  });

  async function onSubmit(values: JobDescriptionInput) {
    setSubmitting(true);
    setServerError(null);
    try {
      const url =
        mode === "create"
          ? "/api/job-descriptions"
          : `/api/job-descriptions/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed with ${res.status}`);
      }
      const json = await res.json();
      onSuccess(json.jobDescription);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  const { register, handleSubmit, formState, setValue, watch } = methods;
  const { errors } = formState;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 overflow-y-auto"
        aria-label={mode === "create" ? "Create Job Description" : "Edit Job Description"}
      >
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium" htmlFor="jd-title">
              Title <span className="text-destructive">*</span>
            </label>
            <Input id="jd-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="jd-department">
              Department <span className="text-destructive">*</span>
            </label>
            <Input id="jd-department" {...register("department")} />
            {errors.department && (
              <p className="text-xs text-destructive mt-1">{errors.department.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Level</label>
            <Select
              value={watch("level")}
              onValueChange={(v) => setValue("level", v as JobDescriptionInput["level"], { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Employment Type</label>
            <Select
              value={watch("employmentType")}
              onValueChange={(v) => setValue("employmentType", v as JobDescriptionInput["employmentType"], { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{EMPLOYMENT_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as JobDescriptionInput["status"], { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <label className="text-sm font-medium" htmlFor="jd-summary">
            Role Summary <span className="text-destructive">*</span>
          </label>
          <Textarea id="jd-summary" rows={5} {...register("roleSummary")} />
          {errors.roleSummary && (
            <p className="text-xs text-destructive mt-1">{errors.roleSummary.message}</p>
          )}
        </section>

        <BulletListField
          name="coreResponsibilities"
          label="Core Responsibilities"
          min={1}
          placeholder="e.g., Lead the design of cross-team initiatives"
        />
        <BulletListField
          name="requiredQualifications"
          label="Required Qualifications"
          min={1}
          placeholder="e.g., 5+ years of relevant experience"
        />
        <BulletListField
          name="preferredQualifications"
          label="Preferred Qualifications"
          min={0}
          placeholder="e.g., Experience with TypeScript"
        />
        <BulletListField
          name="competencies"
          label="Competencies"
          min={1}
          placeholder="e.g., Communication"
        />

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/jd-form.test.tsx`
Expected: PASS — 2 tests passing.

- [ ] **Step 6: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/jd-form.tsx \
  apps/platform/src/tests/jd-form.test.tsx \
  apps/platform/vitest.config.ts apps/platform/package.json
git commit -m "feat(plan): add JdForm with create/edit modes and validation"
```

---

## Phase 5 — UI Library Views (Tasks 13–14)

### Task 13: LibraryFilterBar component

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/library-filter-bar.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/platform/src/components/plan/job-descriptions/library-filter-bar.tsx
"use client";

import { Input } from "@ascenta/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/components/select";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@ascenta/db/job-description-constants";

export interface LibraryFilters {
  q: string;
  department: string;
  level: string; // "" = any
  employmentType: string;
  status: "published" | "all";
}

interface LibraryFilterBarProps {
  value: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  departments: string[];
}

export function LibraryFilterBar({
  value,
  onChange,
  departments,
}: LibraryFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search title or summary..."
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
        className="w-64"
        aria-label="Search job descriptions"
      />
      <Select
        value={value.department || "any"}
        onValueChange={(v) =>
          onChange({ ...value, department: v === "any" ? "" : v })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by department">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">All departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.level || "any"}
        onValueChange={(v) =>
          onChange({ ...value, level: v === "any" ? "" : v })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filter by level">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">All levels</SelectItem>
          {LEVEL_OPTIONS.map((l) => (
            <SelectItem key={l} value={l}>
              {LEVEL_LABELS[l]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.employmentType || "any"}
        onValueChange={(v) =>
          onChange({ ...value, employmentType: v === "any" ? "" : v })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by employment type">
          <SelectValue placeholder="Employment type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">All types</SelectItem>
          {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
            <SelectItem key={t} value={t}>
              {EMPLOYMENT_TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.status}
        onValueChange={(v) =>
          onChange({ ...value, status: v as LibraryFilters["status"] })
        }
      >
        <SelectTrigger className="w-32" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/library-filter-bar.tsx
git commit -m "feat(plan): add LibraryFilterBar"
```

---

### Task 14: LibraryTable component (with tests)

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/library-table.tsx`
- Create: `apps/platform/src/tests/library-table.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/platform/src/tests/library-table.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LibraryTable } from "@/components/plan/job-descriptions/library-table";

const item = {
  id: "1",
  title: "Software Engineer",
  department: "Engineering",
  level: "mid" as const,
  employmentType: "full_time" as const,
  roleSummary: "Builds software systems for the company.",
  coreResponsibilities: ["x"],
  requiredQualifications: ["y"],
  preferredQualifications: [],
  competencies: ["z"],
  status: "published" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedCount: 3,
};

describe("LibraryTable", () => {
  it("renders rows from items", () => {
    render(<LibraryTable items={[item]} onSelect={vi.fn()} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows empty state when items is empty", () => {
    render(<LibraryTable items={[]} onSelect={vi.fn()} />);
    expect(screen.getByText(/No job descriptions/i)).toBeInTheDocument();
  });

  it("calls onSelect when row clicked", () => {
    const onSelect = vi.fn();
    render(<LibraryTable items={[item]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Software Engineer"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/library-table.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the table**

```tsx
// apps/platform/src/components/plan/job-descriptions/library-table.tsx
"use client";

import { Badge } from "@ascenta/ui/components/badge";
import {
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@ascenta/db/job-description-constants";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";

interface LibraryTableProps {
  items: ListedJobDescription[];
  onSelect: (id: string) => void;
}

export function LibraryTable({ items, onSelect }: LibraryTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
        No job descriptions match your filters.
      </div>
    );
  }
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Department</th>
            <th className="text-left p-3 font-medium">Level</th>
            <th className="text-left p-3 font-medium">Employment</th>
            <th className="text-right p-3 font-medium">Assigned</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-t hover:bg-muted/20 cursor-pointer"
              onClick={() => onSelect(it.id)}
            >
              <td className="p-3 font-medium">{it.title}</td>
              <td className="p-3">{it.department}</td>
              <td className="p-3">{LEVEL_LABELS[it.level]}</td>
              <td className="p-3">{EMPLOYMENT_TYPE_LABELS[it.employmentType]}</td>
              <td className="p-3 text-right">
                <Badge variant="secondary">{it.assignedCount}</Badge>
              </td>
              <td className="p-3">
                {it.status === "draft" ? (
                  <Badge variant="outline">Draft</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Published</span>
                )}
              </td>
              <td className="p-3 text-xs text-muted-foreground">
                {new Date(it.updatedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/library-table.test.tsx`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/library-table.tsx \
  apps/platform/src/tests/library-table.test.tsx
git commit -m "feat(plan): add LibraryTable with assignedCount badge and click handler"
```

---

## Phase 6 — UI Detail + Dialogs (Tasks 15–17)

### Task 15: JdImportStubDialog (trivial)

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/jd-import-stub-dialog.tsx`

- [ ] **Step 1: Create the dialog**

```tsx
// apps/platform/src/components/plan/job-descriptions/jd-import-stub-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/components/dialog";
import { Button } from "@ascenta/ui/components/button";

interface JdImportStubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JdImportStubDialog({ open, onOpenChange }: JdImportStubDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import</DialogTitle>
          <DialogDescription>
            Coming soon. Upload Word, PDF, or CSV files to extract job descriptions
            automatically. Reach out to support to discuss your import needs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/jd-import-stub-dialog.tsx
git commit -m "feat(plan): add JdImportStubDialog placeholder"
```

---

### Task 16: JdAssignDialog (employee picker)

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/jd-assign-dialog.tsx`

- [ ] **Step 1: Create the dialog**

```tsx
// apps/platform/src/components/plan/job-descriptions/jd-assign-dialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/components/dialog";
import { Button } from "@ascenta/ui/components/button";
import { Input } from "@ascenta/ui/components/input";

interface EmployeeRow {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  jobDescriptionId: string | null;
  jobDescriptionTitle?: string | null;
}

interface JdAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescriptionId: string;
  onAssigned: () => void;
}

export function JdAssignDialog({
  open,
  onOpenChange,
  jobDescriptionId,
  onAssigned,
}: JdAssignDialogProps) {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setSearch("");
    fetch("/api/dashboard/employees?limit=500")
      .then((r) => r.json())
      .then((data) =>
        setEmployees(
          (data.employees ?? []).filter(
            (e: EmployeeRow) => e.jobDescriptionId !== jobDescriptionId,
          ),
        ),
      )
      .catch((err) => setError(err.message ?? "Failed to load employees"));
  }, [open, jobDescriptionId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q),
    );
  }, [employees, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/job-descriptions/${jobDescriptionId}/employees`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ employeeIds: Array.from(selected) }),
        },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed with ${res.status}`);
      }
      onAssigned();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Employees</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name, department, or current title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search employees"
        />
        <div className="max-h-96 overflow-y-auto border rounded">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No employees found.
            </p>
          ) : (
            <ul className="divide-y">
              {filtered.map((e) => (
                <li key={e.id} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(e.id)}
                    onChange={() => toggle(e.id)}
                    aria-label={`Select ${e.firstName} ${e.lastName}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {e.firstName} {e.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.jobTitle} · {e.department}
                      {e.jobDescriptionTitle &&
                        ` · Currently: ${e.jobDescriptionTitle}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || selected.size === 0}
          >
            {submitting ? "Assigning..." : `Assign ${selected.size} employee${selected.size === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

Note: this consumes `/api/dashboard/employees`. Check the existing endpoint shape — if it does not include `jobDescriptionTitle`, that field renders as undefined and the conditional simply omits it. No code change needed today.

- [ ] **Step 2: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/jd-assign-dialog.tsx
git commit -m "feat(plan): add JdAssignDialog employee picker"
```

---

### Task 17: JdDetail (read view + edit + assigned employees)

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/jd-detail.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/platform/src/components/plan/job-descriptions/jd-detail.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@ascenta/ui/components/button";
import { Badge } from "@ascenta/ui/components/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ascenta/ui/components/alert-dialog";
import {
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@ascenta/db/job-description-constants";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { JdForm } from "./jd-form";
import { JdAssignDialog } from "./jd-assign-dialog";

interface AssignedEmployee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
}

interface JdDetailProps {
  jobDescription: ListedJobDescription;
  onChanged: () => void;
  onDeleted: () => void;
}

export function JdDetail({ jobDescription, onChanged, onDeleted }: JdDetailProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadEmployees() {
    const res = await fetch(
      `/api/job-descriptions/${jobDescription.id}/employees`,
    );
    const json = await res.json();
    setEmployees(json.employees ?? []);
  }

  useEffect(() => {
    loadEmployees();
  }, [jobDescription.id]);

  async function unassign(employeeId: string) {
    await fetch(`/api/job-descriptions/${jobDescription.id}/employees`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ employeeIds: [employeeId] }),
    });
    await loadEmployees();
    onChanged();
  }

  async function performDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/job-descriptions/${jobDescription.id}`, {
        method: "DELETE",
      });
      onDeleted();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (mode === "edit") {
    return (
      <JdForm
        mode="edit"
        initialValues={{ ...jobDescription, id: jobDescription.id }}
        onSuccess={() => {
          onChanged();
          setMode("view");
        }}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">{jobDescription.title}</h2>
          <p className="text-sm text-muted-foreground">
            {jobDescription.department} · {LEVEL_LABELS[jobDescription.level]} ·{" "}
            {EMPLOYMENT_TYPE_LABELS[jobDescription.employmentType]}
          </p>
          {jobDescription.status === "draft" && (
            <Badge variant="outline" className="mt-2">Draft</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
            <Pencil className="size-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        </div>
      </header>

      <Section title="Role Summary">
        <p className="text-sm whitespace-pre-line">{jobDescription.roleSummary}</p>
      </Section>
      <BulletSection title="Core Responsibilities" items={jobDescription.coreResponsibilities} />
      <BulletSection title="Required Qualifications" items={jobDescription.requiredQualifications} />
      {jobDescription.preferredQualifications.length > 0 && (
        <BulletSection
          title="Preferred Qualifications"
          items={jobDescription.preferredQualifications}
        />
      )}
      <BulletSection title="Competencies" items={jobDescription.competencies} />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-display font-semibold">
            Assigned Employees{" "}
            <span className="text-sm text-muted-foreground">({employees.length})</span>
          </h3>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus className="size-4 mr-1" />
            Assign Employee
          </Button>
        </div>
        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded border border-dashed p-6 text-center">
            No employees assigned yet.
          </p>
        ) : (
          <ul className="rounded border divide-y">
            {employees.map((e) => (
              <li key={e.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-medium">
                    {e.firstName} {e.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.jobTitle} · {e.department}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unassign(e.id)}
                >
                  Unassign
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <JdAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        jobDescriptionId={jobDescription.id}
        onAssigned={() => {
          loadEmployees();
          onChanged();
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job description?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also unassign {employees.length} employee
              {employees.length === 1 ? "" : "s"} currently assigned to this role.
              Their <code>jobTitle</code> field will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
      {children}
    </section>
  );
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Section title={title}>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </Section>
  );
}
```

- [ ] **Step 2: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/jd-detail.tsx
git commit -m "feat(plan): add JdDetail with assigned employees panel and delete confirm"
```

---

## Phase 7 — Wire-Up (Tasks 18–20)

### Task 18: LibraryView (top-level Job Descriptions tab content)

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/library-view.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/platform/src/components/plan/job-descriptions/library-view.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@ascenta/ui/components/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@ascenta/ui/components/sheet";
import { Plus, Upload } from "lucide-react";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";
import { LibraryFilterBar, type LibraryFilters } from "./library-filter-bar";
import { LibraryTable } from "./library-table";
import { JdForm } from "./jd-form";
import { JdDetail } from "./jd-detail";
import { JdImportStubDialog } from "./jd-import-stub-dialog";

const initialFilters: LibraryFilters = {
  q: "",
  department: "",
  level: "",
  employmentType: "",
  status: "published",
};

export function LibraryView() {
  const [items, setItems] = useState<ListedJobDescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LibraryFilters>(initialFilters);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchList(current: LibraryFilters) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (current.q) params.set("q", current.q);
      if (current.department) params.set("department", current.department);
      if (current.level) params.set("level", current.level);
      if (current.employmentType) params.set("employmentType", current.employmentType);
      params.set("status", current.status);
      const res = await fetch(`/api/job-descriptions?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const json = await res.json();
      setItems(json.jobDescriptions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchList(filters), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.department);
    return Array.from(set).sort();
  }, [items]);

  const selected = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold">Job Descriptions</h2>
          <p className="text-xs text-muted-foreground">
            The authoritative library of role definitions across the organization.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="size-4 mr-1" />
            Import
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-1" />
            New Job Description
          </Button>
        </div>
      </header>

      <LibraryFilterBar
        value={filters}
        onChange={setFilters}
        departments={departments}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <LibraryTable items={items} onSelect={setSelectedId} />
      )}

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Job Description</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <JdForm
              mode="create"
              onSuccess={() => {
                setCreateOpen(false);
                fetchList(filters);
              }}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-[700px] sm:max-w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="sr-only">Job Description Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4">
              <JdDetail
                jobDescription={selected}
                onChanged={() => fetchList(filters)}
                onDeleted={() => {
                  setSelectedId(null);
                  fetchList(filters);
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <JdImportStubDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/library-view.tsx
git commit -m "feat(plan): add LibraryView combining filter bar, table, and detail sheet"
```

---

### Task 19: OrgDesignTabs container + Org Chart placeholder

**Files:**
- Create: `apps/platform/src/components/plan/org-design-tabs.tsx`
- Create: `apps/platform/src/components/plan/org-design-empty-tab.tsx`

- [ ] **Step 1: Create the empty placeholder**

```tsx
// apps/platform/src/components/plan/org-design-empty-tab.tsx
"use client";

import { Building2 } from "lucide-react";

export function OrgDesignEmptyTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
      <Building2 className="size-10 text-muted-foreground/40 mb-3" />
      <h3 className="font-display text-lg font-bold text-foreground mb-1">
        Org Chart
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Visual organization chart with employee profile cards is the next sub-project
        in the Plan module roadmap.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create the tab container**

```tsx
// apps/platform/src/components/plan/org-design-tabs.tsx
"use client";

import { LibraryView } from "./job-descriptions/library-view";
import { OrgDesignEmptyTab } from "./org-design-empty-tab";

interface OrgDesignTabsProps {
  activeTab: string;
}

export function OrgDesignTabs({ activeTab }: OrgDesignTabsProps) {
  if (activeTab === "job-descriptions") return <LibraryView />;
  if (activeTab === "org-chart") return <OrgDesignEmptyTab />;
  return null;
}
```

- [ ] **Step 3: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/plan/org-design-tabs.tsx \
  apps/platform/src/components/plan/org-design-empty-tab.tsx
git commit -m "feat(plan): add OrgDesignTabs container with Org Chart placeholder"
```

---

### Task 20: Wire OrgDesignTabs into the dashboard page

**Files:**
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx`

- [ ] **Step 1: Import the container**

Open `apps/platform/src/app/[category]/[sub]/page.tsx`. After the existing imports, add:

```ts
import { OrgDesignTabs } from "@/components/plan/org-design-tabs";
```

- [ ] **Step 2: Add a branch for plan/org-design rendering**

Locate the conditional render chain inside the JSX (the `activeTab === "do" ? ... : ...` block). Add a new clause **before** the final fallback:

```tsx
) : pageKey === "plan/org-design" &&
   (activeTab === "job-descriptions" || activeTab === "org-chart") ? (
  <OrgDesignTabs activeTab={activeTab} />
) : (
```

The full pattern looks like:

```tsx
) : activeTab === "reviews" ? (
  /* existing reviews block */
) : pageKey === "plan/org-design" &&
   (activeTab === "job-descriptions" || activeTab === "org-chart") ? (
  <OrgDesignTabs activeTab={activeTab} />
) : (
  /* existing fallback */
)
```

- [ ] **Step 3: Run lint, type check, tests, and start dev server**

```bash
pnpm --filter @ascenta/platform exec tsc --noEmit
pnpm lint
pnpm test
pnpm --filter @ascenta/platform dev
```

Expected: all three checks pass; dev server boots on port 3051.

- [ ] **Step 4: Manually verify in the browser**

Open `http://localhost:3051/plan/org-design`.

- The tab bar should show "Job Descriptions" (active by default) and "Org Chart"
- Job Descriptions tab shows the library populated with seeded JDs
- Click a row → Sheet opens with detail view
- Edit, save, and verify the row updates
- Click "Assign Employee" → multi-select, submit, see assigned employees update
- Click an "Unassign" button → list updates
- Click "Delete" → confirm dialog mentions assigned-employee count → confirm → row disappears
- Click "Import" button → "Coming soon" dialog
- Switch to Org Chart tab → placeholder shown

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/\[category\]/\[sub\]/page.tsx
git commit -m "feat(plan): wire OrgDesignTabs into plan/org-design page"
```

---

## Final verification

- [ ] Run the full test suite

```bash
pnpm test
```

Expected: all tests pass, including the new query, validation, API, form, and table tests.

- [ ] Run lint and type check

```bash
pnpm lint
pnpm --filter @ascenta/platform exec tsc --noEmit
```

Expected: no errors.

- [ ] Run build

```bash
pnpm build
```

Expected: PASS.

- [ ] Push branch and open PR

The branch `feat/job-description-library` is ready. Open a PR via the `gh-pr-main` skill with the spec link in the description.

---

## Definition of Done

- [ ] All 20 tasks committed
- [ ] `pnpm lint && pnpm test && pnpm build` all pass
- [ ] Manual smoke test of library, create, edit, delete, assign, unassign in the browser
- [ ] Spec compliance check: every in-scope item from the spec maps to a shipped task
- [ ] PR opened with link to spec

---

## Notes for the Implementer

- **No auth layer.** Routes are open. When auth ships globally, restrict mutations to HR roles per the spec.
- **Real Mongo for tests.** Tests rely on `MONGODB_URI` from `.env.local`. Each test cleans its own records by title or employeeId prefix.
- **Vitest environment switch.** Task 12 changes the default environment to `jsdom`. If the existing real-DB tests fail under jsdom (mongoose/Atlas connection issues), pin them to `node` via the `// @vitest-environment node` directive at the top of each file.
- **Sub-path exports.** New `@ascenta/db/*` sub-paths must be added to both `exports` and `typesVersions` in `packages/db/package.json` for TypeScript resolution.
- **Idempotency.** The seed script upserts on title; safe to re-run anytime.
- **Cascade delete.** Deleting a JD clears `Employee.jobDescriptionId` on every assigned employee but leaves `Employee.jobTitle` intact.
- **Tab URL state.** Active tab is React state, not URL. If you want it in the URL, use `useSearchParams` in `[category]/[sub]/page.tsx` — out of scope for v1.
