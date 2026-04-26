# Focus Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a per-employee Focus Layer with two-party confirmation, AI-assisted drafting, and a new `/my-profile` page. Sub-project #2 of the Plan module roadmap.

**Architecture:** New `FocusLayer` collection (one record per Employee). Parallel-confirmation state machine (`draft → submitted → confirmed`) modeled on the existing Goal `confirmationSchema`. Employee writes via `/my-profile`; HR/manager reads via `EmployeeSheet`. Optional AI-suggest endpoint mirrors `startGoalWorkflow`.

**Tech Stack:** Same as repo — Next.js 16 · Mongoose · Zod · react-hook-form · Vercel AI SDK · Vitest with real Mongo.

**Spec:** `docs/superpowers/specs/2026-04-26-focus-layer-design.md`
**Builds on:** `docs/superpowers/plans/2026-04-25-job-description-library.md` (JD foundation must be merged before starting)

**Branch:** `feat/focus-layer` — confirm with the user whether branch or worktree.

**Pattern reference:** `docs/superpowers/plans/2026-04-25-job-description-library.md` is the canonical reference for repo conventions (sub-path exports, real-Mongo test prefixes, route file structure, react-hook-form + Zod, sheet/dialog UI). Where this plan says "follow the JD plan's pattern for X", refer there for the exact code template.

---

## Phase 1 — Data Foundation (Tasks 1–4)

### Task 1: Constants

**Files:**
- Create: `packages/db/src/focus-layer-constants.ts`
- Modify: `packages/db/package.json` (add sub-path export)

- [ ] **Step 1: Create constants**

```ts
// packages/db/src/focus-layer-constants.ts
export const FOCUS_LAYER_STATUSES = ["draft", "submitted", "confirmed"] as const;
export type FocusLayerStatus = (typeof FOCUS_LAYER_STATUSES)[number];

export const FOCUS_LAYER_PROMPTS = [
  {
    key: "uniqueContribution",
    label: "What I bring uniquely",
    helper: "What do you bring to this role that no one else does in quite the same way?",
    placeholder: "e.g., I translate complex technical decisions into product narratives the GTM team can sell from.",
  },
  {
    key: "highImpactArea",
    label: "Where I create the most impact",
    helper: "Where does your work create the biggest result for the team or the company?",
    placeholder: "",
  },
  {
    key: "signatureResponsibility",
    label: "Responsibilities I own that shape the team",
    helper: "What responsibilities do you carry in a way that shapes how others on the team operate?",
    placeholder: "",
  },
  {
    key: "workingStyle",
    label: "How I prefer to work and collaborate",
    helper: "How do you do your best work? What working patterns help you and the team thrive?",
    placeholder: "",
  },
] as const;

export type FocusLayerPromptKey = (typeof FOCUS_LAYER_PROMPTS)[number]["key"];

export const FOCUS_LAYER_STATUS_LABELS: Record<FocusLayerStatus, string> = {
  draft: "Draft",
  submitted: "Awaiting confirmation",
  confirmed: "Confirmed",
};
```

- [ ] **Step 2: Add sub-path export**

In `packages/db/package.json`, `exports`:

```json
"./focus-layer-constants": "./src/focus-layer-constants.ts",
```

Same under `typesVersions` if present.

- [ ] **Step 3: Verify type check**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/focus-layer-constants.ts packages/db/package.json
git commit -m "feat(db): add Focus Layer constants and prompts"
```

---

### Task 2: Mongoose schema

**Files:**
- Create: `packages/db/src/focus-layer-schema.ts`
- Modify: `packages/db/package.json`

- [ ] **Step 1: Create schema**

```ts
// packages/db/src/focus-layer-schema.ts
import mongoose, { Schema } from "mongoose";
import { FOCUS_LAYER_STATUSES } from "./focus-layer-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const responsesSchema = new Schema(
  {
    uniqueContribution: { type: String, default: "", trim: true },
    highImpactArea: { type: String, default: "", trim: true },
    signatureResponsibility: { type: String, default: "", trim: true },
    workingStyle: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const employeeSubmittedSchema = new Schema(
  { at: { type: Date, default: null } },
  { _id: false },
);

const managerConfirmedSchema = new Schema(
  {
    at: { type: Date, default: null },
    byUserId: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    comment: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const focusLayerSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
      index: true,
    },
    jobDescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "JobDescription",
      default: null,
      index: true,
    },
    responses: { type: responsesSchema, default: () => ({}) },
    status: {
      type: String,
      required: true,
      enum: FOCUS_LAYER_STATUSES,
      default: "draft",
      index: true,
    },
    employeeSubmitted: { type: employeeSubmittedSchema, default: () => ({}) },
    managerConfirmed: { type: managerConfirmedSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: toJSONOptions, toObject: toJSONOptions },
);

focusLayerSchema.index({ jobDescriptionId: 1, status: 1 });

export const FocusLayer =
  mongoose.models.FocusLayer || mongoose.model("FocusLayer", focusLayerSchema);

export type FocusLayer_Type = {
  id: string;
  employeeId: string;
  jobDescriptionId: string | null;
  responses: {
    uniqueContribution: string;
    highImpactArea: string;
    signatureResponsibility: string;
    workingStyle: string;
  };
  status: "draft" | "submitted" | "confirmed";
  employeeSubmitted: { at: Date | null };
  managerConfirmed: {
    at: Date | null;
    byUserId: string | null;
    comment: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
};
```

- [ ] **Step 2: Add sub-path export and verify**

In `packages/db/package.json`, `exports`:

```json
"./focus-layer-schema": "./src/focus-layer-schema.ts",
```

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit` → PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/focus-layer-schema.ts packages/db/package.json
git commit -m "feat(db): add FocusLayer Mongoose schema"
```

---

### Task 3: Query helpers (with tests)

**Files:**
- Create: `packages/db/src/focus-layers.ts`
- Create: `apps/platform/src/tests/focus-layers-queries.test.ts`
- Modify: `packages/db/src/index.ts`, `packages/db/package.json`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/focus-layers-queries.test.ts
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

describe("focus-layers query helpers", () => {
  beforeAll(async () => connectDB());
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
      confirmFocusLayer(String(emp._id), String(confirmer._id), null),
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
      "Looks good",
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/focus-layers-queries.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement query helpers**

```ts
// packages/db/src/focus-layers.ts
import mongoose from "mongoose";
import { FocusLayer } from "./focus-layer-schema";

export async function getFocusLayerByEmployee(employeeId: string) {
  if (!mongoose.isValidObjectId(employeeId)) return null;
  return FocusLayer.findOne({ employeeId }).lean();
}

export async function upsertFocusLayerDraft(
  employeeId: string,
  jobDescriptionId: string | null,
  responses: Partial<{
    uniqueContribution: string;
    highImpactArea: string;
    signatureResponsibility: string;
    workingStyle: string;
  }>,
) {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new Error("Invalid employeeId");
  }
  const existing = await FocusLayer.findOne({ employeeId });
  const wasConfirmed = existing?.status === "confirmed";
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(responses)) {
    if (typeof v === "string") update[`responses.${k}`] = v;
  }
  if (jobDescriptionId !== undefined) {
    update.jobDescriptionId = jobDescriptionId;
  }
  if (wasConfirmed) {
    update.status = "submitted";
    update["managerConfirmed.at"] = null;
    update["managerConfirmed.byUserId"] = null;
    update["managerConfirmed.comment"] = null;
    update["employeeSubmitted.at"] = new Date();
  } else if (!existing) {
    update.status = "draft";
  }
  return FocusLayer.findOneAndUpdate(
    { employeeId },
    { $set: update, $setOnInsert: { employeeId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function submitFocusLayer(employeeId: string) {
  const fl = await FocusLayer.findOne({ employeeId });
  if (!fl) throw new Error("Focus Layer not found");
  const r = fl.responses ?? {};
  const fields = [
    "uniqueContribution",
    "highImpactArea",
    "signatureResponsibility",
    "workingStyle",
  ] as const;
  for (const f of fields) {
    if (!r[f] || r[f].trim().length < 20) {
      throw new Error(`Field ${f} requires at least 20 characters before submitting`);
    }
  }
  fl.status = "submitted";
  fl.employeeSubmitted = { at: new Date() };
  fl.managerConfirmed = { at: null, byUserId: null, comment: null };
  await fl.save();
  return fl.toJSON();
}

export async function confirmFocusLayer(
  employeeId: string,
  byUserId: string,
  comment: string | null,
) {
  const fl = await FocusLayer.findOne({ employeeId });
  if (!fl) throw new Error("Focus Layer not found");
  if (fl.status !== "submitted") {
    throw new Error(`Cannot confirm Focus Layer in status ${fl.status}`);
  }
  fl.status = "confirmed";
  fl.managerConfirmed = {
    at: new Date(),
    byUserId,
    comment: comment ?? null,
  };
  await fl.save();
  return fl.toJSON();
}

export async function listSubmittedAwaitingConfirmation(
  managerEmployeeIds: string[],
) {
  return FocusLayer.find({
    employeeId: { $in: managerEmployeeIds },
    status: "submitted",
  }).lean();
}
```

- [ ] **Step 4: Add export and re-export**

`packages/db/package.json` exports adds `"./focus-layers": "./src/focus-layers.ts"`.
`packages/db/src/index.ts` adds `export * from "./focus-layers";`.

- [ ] **Step 5: Run tests, expect pass**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/focus-layers-queries.test.ts`
Expected: PASS — 7 tests passing.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/focus-layers.ts packages/db/src/index.ts \
  packages/db/package.json apps/platform/src/tests/focus-layers-queries.test.ts
git commit -m "feat(db): add Focus Layer query helpers with state-machine logic"
```

---

### Task 4: Zod validation

**Files:**
- Create: `apps/platform/src/lib/validations/focus-layer.ts`
- Create: `apps/platform/src/tests/focus-layer-validation.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/focus-layer-validation.test.ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  focusLayerDraftSchema,
  focusLayerSubmitSchema,
  focusLayerConfirmSchema,
} from "@/lib/validations/focus-layer";

const fullResponses = {
  uniqueContribution: "I bring deep cross-team alignment experience to engineering.",
  highImpactArea: "I create the most impact when translating product strategy to backlog.",
  signatureResponsibility: "I own the architectural narrative across squads.",
  workingStyle: "I work best in focused 90-minute blocks and async pair sessions.",
};

describe("focus-layer validation", () => {
  it("draft schema accepts partial input", () => {
    expect(
      focusLayerDraftSchema.parse({ responses: { uniqueContribution: "x" } }),
    ).toBeDefined();
  });
  it("draft schema rejects field longer than 2000", () => {
    const long = "x".repeat(2001);
    expect(() =>
      focusLayerDraftSchema.parse({ responses: { uniqueContribution: long } }),
    ).toThrow();
  });
  it("submit schema accepts complete input", () => {
    expect(focusLayerSubmitSchema.parse({ responses: fullResponses })).toBeDefined();
  });
  it("submit schema rejects fields < 20 chars", () => {
    expect(() =>
      focusLayerSubmitSchema.parse({
        responses: { ...fullResponses, uniqueContribution: "too short" },
      }),
    ).toThrow();
  });
  it("confirm schema accepts optional comment", () => {
    expect(focusLayerConfirmSchema.parse({})).toEqual({});
    expect(
      focusLayerConfirmSchema.parse({ comment: "looks good" }),
    ).toEqual({ comment: "looks good" });
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/focus-layer-validation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement validation**

```ts
// apps/platform/src/lib/validations/focus-layer.ts
import { z } from "zod";

const responseField = z.string().trim().max(2000);

export const focusLayerDraftSchema = z.object({
  responses: z
    .object({
      uniqueContribution: responseField.optional(),
      highImpactArea: responseField.optional(),
      signatureResponsibility: responseField.optional(),
      workingStyle: responseField.optional(),
    })
    .partial(),
});
export type FocusLayerDraftInput = z.infer<typeof focusLayerDraftSchema>;

export const focusLayerSubmitSchema = z.object({
  responses: z.object({
    uniqueContribution: responseField.min(20, "Add at least 20 characters before submitting"),
    highImpactArea: responseField.min(20),
    signatureResponsibility: responseField.min(20),
    workingStyle: responseField.min(20),
  }),
});
export type FocusLayerSubmitInput = z.infer<typeof focusLayerSubmitSchema>;

export const focusLayerConfirmSchema = z.object({
  comment: z.string().trim().max(1000).optional(),
});
export type FocusLayerConfirmInput = z.infer<typeof focusLayerConfirmSchema>;
```

- [ ] **Step 4: Run tests, expect pass and commit**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/focus-layer-validation.test.ts`
Expected: PASS.

```bash
git add apps/platform/src/lib/validations/focus-layer.ts \
  apps/platform/src/tests/focus-layer-validation.test.ts
git commit -m "feat(platform): add Zod schemas for Focus Layer draft/submit/confirm"
```

---

## Phase 2 — API Routes (Tasks 5–7)

### Task 5: GET / PATCH / DELETE on `/api/focus-layers/[employeeId]`

**Files:**
- Create: `apps/platform/src/app/api/focus-layers/[employeeId]/route.ts`
- Create: `apps/platform/src/tests/api-focus-layer-crud.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/api-focus-layer-crud.test.ts
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
    firstName: suffix, lastName: "T",
    email: `${PREFIX}${suffix}@x.com`,
    department: "Engineering", jobTitle: "Eng", managerName: "M",
    hireDate: new Date(),
  });
}
function ctx(employeeId: string) {
  return { params: Promise.resolve({ employeeId }) };
}

describe("/api/focus-layers/[employeeId]", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await FocusLayer.deleteMany({});
  });
  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await FocusLayer.deleteMany({});
    await mongoose.disconnect();
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
    const res = await DELETE(new Request("http://t", { method: "DELETE" }) as never, ctx(String(emp._id)));
    expect(res.status).toBe(204);
    expect(await FocusLayer.countDocuments()).toBe(0);
  });
});
```

- [ ] **Step 2: Implement route**

```ts
// apps/platform/src/app/api/focus-layers/[employeeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { upsertFocusLayerDraft, getFocusLayerByEmployee } from "@ascenta/db/focus-layers";
import { focusLayerDraftSchema } from "@/lib/validations/focus-layer";

type Ctx = { params: Promise<{ employeeId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  const fl = await getFocusLayerByEmployee(employeeId);
  return NextResponse.json({
    focusLayer: fl ? { ...fl, id: String(fl._id) } : null,
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  const body = await req.json();
  const parsed = focusLayerDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const emp = await Employee.findById(employeeId).lean();
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  const fl = await upsertFocusLayerDraft(
    employeeId,
    emp.jobDescriptionId ? String(emp.jobDescriptionId) : null,
    parsed.data.responses,
  );
  return NextResponse.json({ focusLayer: fl.toJSON() });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  await FocusLayer.deleteOne({ employeeId });
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 3: Run tests, commit**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-focus-layer-crud.test.ts`
Expected: PASS — 3 tests passing.

```bash
git add apps/platform/src/app/api/focus-layers/\[employeeId\]/route.ts \
  apps/platform/src/tests/api-focus-layer-crud.test.ts
git commit -m "feat(api): GET/PATCH/DELETE /api/focus-layers/[employeeId]"
```

---

### Task 6: Submit + Confirm endpoints

**Files:**
- Create: `apps/platform/src/app/api/focus-layers/[employeeId]/submit/route.ts`
- Create: `apps/platform/src/app/api/focus-layers/[employeeId]/confirm/route.ts`
- Create: `apps/platform/src/tests/api-focus-layer-state.test.ts`

- [ ] **Step 1: Write failing tests**

Test the state transitions through both endpoints. Use the existing auth context's user-resolution pattern. Auth helper to mock current user is in `apps/platform/src/lib/auth/auth-context.tsx` — but server route reads from `cookies()` / `headers()`. For tests, pass the manager's user id via the `x-dev-user-id` header that auth-context already supports for dev impersonation.

```ts
// apps/platform/src/tests/api-focus-layer-state.test.ts
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
    firstName: "E", lastName: "Mp",
    email: `${PREFIX}e1@x.com`,
    department: "Engineering", jobTitle: "Eng",
    managerName: "Manny Manager", hireDate: new Date(),
  });
  const manager = await Employee.create({
    employeeId: `${PREFIX}M1`,
    firstName: "Manny", lastName: "Manager",
    email: `${PREFIX}m1@x.com`,
    department: "Engineering", jobTitle: "EM",
    managerName: "CEO", hireDate: new Date(),
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

describe("focus-layer state transitions", () => {
  beforeAll(async () => connectDB());
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
      ctx(String(employee._id)),
    );
    expect(res.status).toBe(200);
    const fl = await FocusLayer.findOne({ employeeId: employee._id });
    expect(fl?.status).toBe("submitted");
  });

  it("POST /confirm advances submitted to confirmed", async () => {
    const { employee, manager } = await setup();
    await SUBMIT(new Request("http://t", { method: "POST" }) as never, ctx(String(employee._id)));
    const req = new Request("http://t", {
      method: "POST",
      headers: { "content-type": "application/json", "x-dev-user-id": String(manager._id) },
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
      headers: { "content-type": "application/json", "x-dev-user-id": String(manager._id) },
      body: JSON.stringify({}),
    });
    const res = await CONFIRM(req as never, ctx(String(employee._id)));
    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 2: Implement submit endpoint**

```ts
// apps/platform/src/app/api/focus-layers/[employeeId]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { submitFocusLayer } from "@ascenta/db/focus-layers";

type Ctx = { params: Promise<{ employeeId: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  try {
    const fl = await submitFocusLayer(employeeId);
    return NextResponse.json({ focusLayer: fl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 3: Implement confirm endpoint**

```ts
// apps/platform/src/app/api/focus-layers/[employeeId]/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { confirmFocusLayer } from "@ascenta/db/focus-layers";
import { focusLayerConfirmSchema } from "@/lib/validations/focus-layer";

type Ctx = { params: Promise<{ employeeId: string }> };

async function resolveCurrentUser(req: NextRequest) {
  const devId = req.headers.get("x-dev-user-id");
  if (devId && mongoose.isValidObjectId(devId)) {
    return Employee.findById(devId).lean();
  }
  // Future: integrate with cookie-based auth here. v1 supports dev header.
  return null;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  const fl = await FocusLayer.findOne({ employeeId });
  if (!fl) return NextResponse.json({ error: "Focus Layer not found" }, { status: 404 });
  if (fl.status !== "submitted") {
    return NextResponse.json(
      { error: `Cannot confirm in status ${fl.status}` },
      { status: 409 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = focusLayerConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const currentUser = await resolveCurrentUser(req);
  // Authorization: current user must be HR, OR manager of employee.
  // For v1 with dev header, accept the call when a current user is provided.
  // When auth context fully gates this, replace the trust here with
  // a strict check on currentUser.role === "hr" || directReports includes employeeId.
  const byUserId =
    currentUser?._id ? String(currentUser._id) : (process.env.NODE_ENV !== "production" ? "00000000000000000000beef" : null);
  if (!byUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await confirmFocusLayer(
    employeeId,
    byUserId,
    parsed.data.comment ?? null,
  );
  return NextResponse.json({ focusLayer: updated });
}
```

(Note: the dev-stub `byUserId` lets local development proceed without a real auth session; production must wire a real `currentUser` resolver before this ships behind login.)

- [ ] **Step 4: Run tests, commit**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-focus-layer-state.test.ts`
Expected: PASS.

```bash
git add apps/platform/src/app/api/focus-layers/\[employeeId\]/submit/route.ts \
  apps/platform/src/app/api/focus-layers/\[employeeId\]/confirm/route.ts \
  apps/platform/src/tests/api-focus-layer-state.test.ts
git commit -m "feat(api): submit and confirm endpoints for Focus Layer state machine"
```

---

### Task 7: AI suggest endpoint

**Files:**
- Create: `apps/platform/src/lib/ai/focus-layer-tool.ts`
- Create: `apps/platform/src/app/api/focus-layers/[employeeId]/suggest/route.ts`

- [ ] **Step 1: Implement suggestion tool**

Mirrors the `startGoalWorkflow` pattern in `apps/platform/src/lib/ai/grow-tools.ts` but uses `generateObject` (one-shot) rather than tool-call orchestration.

```ts
// apps/platform/src/lib/ai/focus-layer-tool.ts
import { generateObject } from "ai";
import { z } from "zod";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Foundation } from "@ascenta/db/foundation-schema";
import { resolveModel } from "./providers";

const responseSchema = z.object({
  uniqueContribution: z.string().min(20).max(2000),
  highImpactArea: z.string().min(20).max(2000),
  signatureResponsibility: z.string().min(20).max(2000),
  workingStyle: z.string().min(20).max(2000),
});

export type FocusLayerSuggestion = z.infer<typeof responseSchema>;

export async function generateFocusLayerSuggestion(
  employeeId: string,
): Promise<FocusLayerSuggestion> {
  await connectDB();
  const employee = await Employee.findById(employeeId).lean();
  if (!employee) throw new Error("Employee not found");
  if (!employee.jobDescriptionId) {
    throw new Error("Assign a job description before generating suggestions");
  }
  const jd = await JobDescription.findById(employee.jobDescriptionId).lean();
  if (!jd) throw new Error("Job description not found");

  const recentCheckIns = await CheckIn.find({ employee: employee._id })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  const foundation = await Foundation.findOne({ orgId: "default" }).lean();

  const checkInSummary = recentCheckIns
    .map((c) => c.participate?.employeeKeyTakeaways || c.employeePrepare?.distilledPreview || "")
    .filter(Boolean)
    .join(" / ") || "(no recent check-ins)";

  const prompt = `You are helping ${employee.firstName} ${employee.lastName}, a ${jd.title} in ${employee.department}, draft the Focus Layer for their role.

Role responsibilities: ${jd.coreResponsibilities.slice(0, 5).join("; ")}.
Role competencies: ${jd.competencies.join(", ")}.
Recent check-in themes: ${checkInSummary}.
${foundation?.mission ? `Org mission: ${foundation.mission}.` : ""}

Generate first-draft responses to these four prompts. Each response should be 2-3 sentences in plain, first-person language. Ground each in the actual responsibilities and observed work, not generic platitudes:

1. What I bring uniquely — what does this person bring that no one else does in quite the same way?
2. Where I create the most impact — what work creates the biggest result for the team?
3. Responsibilities I own that shape the team — what do they own in a way that shapes how others work?
4. How I prefer to work and collaborate — what working patterns help them and the team thrive?`;

  const { object } = await generateObject({
    model: resolveModel(),
    schema: responseSchema,
    prompt,
  });
  return object;
}
```

(`resolveModel` is a small helper that returns the configured OpenAI/Anthropic model. If it doesn't exist yet, add it adjacent to `providers.ts` — single line picking `openai("gpt-4o")` or `anthropic("claude-sonnet-4")` based on env keys.)

- [ ] **Step 2: Implement endpoint**

```ts
// apps/platform/src/app/api/focus-layers/[employeeId]/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { generateFocusLayerSuggestion } from "@/lib/ai/focus-layer-tool";

type Ctx = { params: Promise<{ employeeId: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI suggestions require OPENAI_API_KEY or ANTHROPIC_API_KEY" },
      { status: 503 },
    );
  }
  try {
    const responses = await generateFocusLayerSuggestion(employeeId);
    return NextResponse.json({ responses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /Assign a job description/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 3: Manual smoke check**

Skip automated tests for the AI call. Manual: run `curl -X POST http://localhost:3051/api/focus-layers/<an-employee-id>/suggest` with a real key configured, verify a JSON response.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/ai/focus-layer-tool.ts \
  apps/platform/src/app/api/focus-layers/\[employeeId\]/suggest/route.ts
git commit -m "feat(api): AI-assisted Focus Layer suggestion endpoint"
```

---

## Phase 3 — UI Components (Tasks 8–11)

### Task 8: Status pill + read view

**Files:**
- Create: `apps/platform/src/components/plan/focus-layer/focus-layer-status-pill.tsx`
- Create: `apps/platform/src/components/plan/focus-layer/focus-layer-read-view.tsx`

- [ ] **Step 1: Status pill**

```tsx
// focus-layer-status-pill.tsx
"use client";
import { Badge } from "@ascenta/ui/components/badge";
import { FOCUS_LAYER_STATUS_LABELS, type FocusLayerStatus } from "@ascenta/db/focus-layer-constants";

const variants: Record<FocusLayerStatus, "secondary" | "outline" | "default"> = {
  draft: "outline",
  submitted: "secondary",
  confirmed: "default",
};

export function FocusLayerStatusPill({ status }: { status: FocusLayerStatus }) {
  return <Badge variant={variants[status]}>{FOCUS_LAYER_STATUS_LABELS[status]}</Badge>;
}
```

- [ ] **Step 2: Read view**

```tsx
// focus-layer-read-view.tsx
"use client";
import { FOCUS_LAYER_PROMPTS } from "@ascenta/db/focus-layer-constants";
import { FocusLayerStatusPill } from "./focus-layer-status-pill";

interface ReadViewProps {
  responses: Record<string, string>;
  status: "draft" | "submitted" | "confirmed";
  managerConfirmed?: { at: Date | null; byUserId: string | null; comment: string | null };
  managerName?: string | null;
}

export function FocusLayerReadView({ responses, status, managerConfirmed, managerName }: ReadViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-display font-semibold">Focus Layer</h3>
        <FocusLayerStatusPill status={status} />
      </div>
      {FOCUS_LAYER_PROMPTS.map((p) => {
        const value = responses[p.key] || "";
        return (
          <div key={p.key} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{p.label}</p>
            {value ? (
              <p className="text-sm whitespace-pre-line">{value}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Not yet shared</p>
            )}
          </div>
        );
      })}
      {status === "confirmed" && managerConfirmed?.at && (
        <div className="rounded border bg-muted/40 p-3 text-xs">
          Confirmed by {managerName ?? "manager"} on{" "}
          {new Date(managerConfirmed.at).toLocaleDateString()}.
          {managerConfirmed.comment && (
            <p className="mt-1 italic">"{managerConfirmed.comment}"</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type check, commit**

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit` → PASS.

```bash
git add apps/platform/src/components/plan/focus-layer/focus-layer-status-pill.tsx \
  apps/platform/src/components/plan/focus-layer/focus-layer-read-view.tsx
git commit -m "feat(plan): add Focus Layer status pill and read view"
```

---

### Task 9: AI suggest button + form

**Files:**
- Create: `apps/platform/src/components/plan/focus-layer/ai-suggest-button.tsx`
- Create: `apps/platform/src/components/plan/focus-layer/focus-layer-form.tsx`

- [ ] **Step 1: AI suggest button**

```tsx
// ai-suggest-button.tsx
"use client";
import { useState } from "react";
import { Button } from "@ascenta/ui/components/button";
import { Sparkles } from "lucide-react";

interface Props {
  employeeId: string;
  hasContent: boolean;
  onSuggested: (responses: Record<string, string>) => void;
}

export function AiSuggestButton({ employeeId, hasContent, onSuggested }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function suggest() {
    if (hasContent && !confirm("Replace existing draft with AI suggestion?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/focus-layers/${employeeId}/suggest`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed with ${res.status}`);
      }
      const json = await res.json();
      onSuggested(json.responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suggestion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={suggest} disabled={loading}>
        <Sparkles className="size-4 mr-1" />
        {loading ? "Generating..." : "Suggest from my role"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Form component**

```tsx
// focus-layer-form.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ascenta/ui/components/button";
import { Textarea } from "@ascenta/ui/components/textarea";
import { focusLayerDraftSchema } from "@/lib/validations/focus-layer";
import { FOCUS_LAYER_PROMPTS } from "@ascenta/db/focus-layer-constants";
import { AiSuggestButton } from "./ai-suggest-button";
import { FocusLayerStatusPill } from "./focus-layer-status-pill";

type Responses = {
  uniqueContribution: string;
  highImpactArea: string;
  signatureResponsibility: string;
  workingStyle: string;
};

interface Props {
  employeeId: string;
  initialResponses: Responses;
  initialStatus: "draft" | "submitted" | "confirmed";
  jobDescriptionAssigned: boolean;
  onChanged: () => void;
}

export function FocusLayerForm({
  employeeId, initialResponses, initialStatus, jobDescriptionAssigned, onChanged,
}: Props) {
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const methods = useForm<Responses>({
    resolver: zodResolver(focusLayerDraftSchema.shape.responses),
    defaultValues: initialResponses,
    mode: "onChange",
  });
  const { register, watch, reset, getValues, formState } = methods;

  // Auto-save on blur (debounced)
  useEffect(() => {
    const sub = watch(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(autoSave, 800);
    });
    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watch, employeeId]);

  async function autoSave() {
    setSavingState("saving");
    try {
      const values = getValues();
      const res = await fetch(`/api/focus-layers/${employeeId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responses: values }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const json = await res.json();
      setStatus(json.focusLayer.status);
      setSavingState("saved");
    } catch {
      setSavingState("idle");
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Force a final save first
      await autoSave();
      const res = await fetch(`/api/focus-layers/${employeeId}/submit`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Submit failed");
      }
      const json = await res.json();
      setStatus(json.focusLayer.status);
      onChanged();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  const values = watch();
  const allReady = (Object.values(values) as string[]).every((v) => v && v.trim().length >= 20);
  const showWarning = status === "confirmed" && formState.isDirty;

  return (
    <FormProvider {...methods}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FocusLayerStatusPill status={status} />
          <span className="text-xs text-muted-foreground">
            {savingState === "saving" ? "Saving..." : savingState === "saved" ? "Saved" : ""}
          </span>
        </div>
        {jobDescriptionAssigned && (
          <AiSuggestButton
            employeeId={employeeId}
            hasContent={Object.values(values).some((v) => (v ?? "").trim().length > 0)}
            onSuggested={(r) => {
              reset(r as Responses, { keepDirty: true });
              autoSave();
            }}
          />
        )}
      </div>

      {!jobDescriptionAssigned && (
        <p className="rounded border border-dashed p-4 text-sm text-muted-foreground mb-4">
          Once a job description is assigned to you, you'll be able to draft your Focus Layer.
        </p>
      )}

      {showWarning && (
        <p className="rounded border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm mb-4">
          Editing will require your manager to re-confirm this Focus Layer.
        </p>
      )}

      <div className="space-y-6">
        {FOCUS_LAYER_PROMPTS.map((p) => (
          <div key={p.key} className="space-y-1">
            <label className="text-sm font-medium">{p.label}</label>
            <p className="text-xs text-muted-foreground">{p.helper}</p>
            <Textarea
              rows={4}
              placeholder={p.placeholder || "Take a few sentences to share your perspective..."}
              {...register(p.key as keyof Responses)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        <Button onClick={submit} disabled={!allReady || submitting}>
          {submitting ? "Submitting..." : status === "confirmed" ? "Resubmit" : "Submit for confirmation"}
        </Button>
      </div>
    </FormProvider>
  );
}
```

- [ ] **Step 3: Component test**

```tsx
// apps/platform/src/tests/focus-layer-form.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FocusLayerForm } from "@/components/plan/focus-layer/focus-layer-form";

const initial = {
  uniqueContribution: "",
  highImpactArea: "",
  signatureResponsibility: "",
  workingStyle: "",
};

describe("FocusLayerForm", () => {
  it("renders all 4 prompt fields", () => {
    render(
      <FocusLayerForm
        employeeId="x"
        initialResponses={initial}
        initialStatus="draft"
        jobDescriptionAssigned={true}
        onChanged={() => {}}
      />,
    );
    expect(screen.getByText(/What I bring uniquely/)).toBeInTheDocument();
    expect(screen.getByText(/Where I create the most impact/)).toBeInTheDocument();
    expect(screen.getByText(/Responsibilities I own/)).toBeInTheDocument();
    expect(screen.getByText(/How I prefer to work/)).toBeInTheDocument();
  });

  it("hides AI button when no JD assigned", () => {
    render(
      <FocusLayerForm
        employeeId="x"
        initialResponses={initial}
        initialStatus="draft"
        jobDescriptionAssigned={false}
        onChanged={() => {}}
      />,
    );
    expect(screen.queryByText(/Suggest from my role/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests, commit**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/focus-layer-form.test.tsx`
Expected: PASS.

```bash
git add apps/platform/src/components/plan/focus-layer/ai-suggest-button.tsx \
  apps/platform/src/components/plan/focus-layer/focus-layer-form.tsx \
  apps/platform/src/tests/focus-layer-form.test.tsx
git commit -m "feat(plan): add Focus Layer form with auto-save and AI suggest"
```

---

### Task 10: Confirm bar + section wrapper

**Files:**
- Create: `apps/platform/src/components/plan/focus-layer/focus-layer-confirm-bar.tsx`
- Create: `apps/platform/src/components/plan/focus-layer/focus-layer-section.tsx`

- [ ] **Step 1: Confirm bar**

```tsx
// focus-layer-confirm-bar.tsx
"use client";
import { useState } from "react";
import { Button } from "@ascenta/ui/components/button";
import { Textarea } from "@ascenta/ui/components/textarea";

interface Props {
  employeeId: string;
  onConfirmed: () => void;
}

export function FocusLayerConfirmBar({ employeeId, onConfirmed }: Props) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/focus-layers/${employeeId}/confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Confirm failed");
      }
      onConfirmed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <h4 className="text-sm font-semibold">Confirm this Focus Layer</h4>
      <Textarea
        rows={2}
        placeholder="Optional comment for the employee..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={confirm} disabled={submitting}>
        {submitting ? "Confirming..." : "Confirm Focus Layer"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Section wrapper**

```tsx
// focus-layer-section.tsx
"use client";
import { useEffect, useState } from "react";
import { FocusLayerForm } from "./focus-layer-form";
import { FocusLayerReadView } from "./focus-layer-read-view";
import { FocusLayerConfirmBar } from "./focus-layer-confirm-bar";

const EMPTY = {
  uniqueContribution: "", highImpactArea: "",
  signatureResponsibility: "", workingStyle: "",
};

interface Props {
  employeeId: string;
  mode: "edit" | "view";
  /** When mode === "view" and viewer can confirm. */
  canConfirm?: boolean;
}

export function FocusLayerSection({ employeeId, mode, canConfirm }: Props) {
  const [data, setData] = useState<{
    responses: typeof EMPTY;
    status: "draft" | "submitted" | "confirmed";
    managerConfirmed?: { at: Date | null; byUserId: string | null; comment: string | null };
    jobDescriptionAssigned: boolean;
  } | null>(null);

  async function load() {
    const [flRes, empRes] = await Promise.all([
      fetch(`/api/focus-layers/${employeeId}`),
      fetch(`/api/dashboard/employees/${employeeId}`),
    ]);
    const fl = await flRes.json();
    const emp = await empRes.json().catch(() => ({}));
    setData({
      responses: fl.focusLayer?.responses ?? EMPTY,
      status: fl.focusLayer?.status ?? "draft",
      managerConfirmed: fl.focusLayer?.managerConfirmed,
      jobDescriptionAssigned: !!emp.employee?.jobDescriptionId,
    });
  }
  useEffect(() => { load(); }, [employeeId]);

  if (!data) return <p className="text-sm text-muted-foreground">Loading Focus Layer...</p>;

  if (mode === "edit") {
    return (
      <FocusLayerForm
        employeeId={employeeId}
        initialResponses={data.responses}
        initialStatus={data.status}
        jobDescriptionAssigned={data.jobDescriptionAssigned}
        onChanged={load}
      />
    );
  }

  return (
    <div className="space-y-3">
      <FocusLayerReadView
        responses={data.responses as unknown as Record<string, string>}
        status={data.status}
        managerConfirmed={data.managerConfirmed}
      />
      {canConfirm && data.status === "submitted" && (
        <FocusLayerConfirmBar employeeId={employeeId} onConfirmed={load} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type check, commit**

```bash
git add apps/platform/src/components/plan/focus-layer/focus-layer-confirm-bar.tsx \
  apps/platform/src/components/plan/focus-layer/focus-layer-section.tsx
git commit -m "feat(plan): add Focus Layer confirm bar and section wrapper"
```

---

### Task 11: `/my-profile` page

**Files:**
- Create: `apps/platform/src/app/my-profile/page.tsx`

- [ ] **Step 1: Implement page**

```tsx
// apps/platform/src/app/my-profile/page.tsx
"use client";
import { useAuth } from "@/lib/auth/auth-context";
import { FocusLayerSection } from "@/components/plan/focus-layer/focus-layer-section";

export default function MyProfilePage() {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-display">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to edit your profile.
        </p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">{user.name}</p>
      </header>

      <section className="rounded-lg border p-6">
        <FocusLayerSection employeeId={user.id} mode="edit" />
      </section>

      <section className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        About Me (Get to Know) — coming in the next sub-project.
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Type check, commit**

```bash
git add apps/platform/src/app/my-profile/page.tsx
git commit -m "feat(plan): add /my-profile page with Focus Layer section"
```

---

## Phase 4 — Integration + Seed (Tasks 12–13)

### Task 12: Render in `EmployeeSheet`

**Files:**
- Modify: `apps/platform/src/components/dashboard/employee-sheet.tsx`

- [ ] **Step 1: Wire FocusLayerSection into the existing drawer**

Read the existing employee-sheet.tsx (already reviewed during exploration). Add a new section between notes and documents:

```tsx
import { FocusLayerSection } from "@/components/plan/focus-layer/focus-layer-section";
import { useAuth } from "@/lib/auth/auth-context";
```

Inside the render, after the existing notes section, add:

```tsx
{employee.id && user && (
  <section className="px-4 pb-4">
    <FocusLayerSection
      employeeId={employee.id}
      mode="view"
      canConfirm={
        user.role === "hr" ||
        (user.role === "manager" && (user.directReports ?? []).includes(employee.id))
      }
    />
  </section>
)}
```

`user` comes from `useAuth()`.

- [ ] **Step 2: Manual smoke test**

Run dev server, open dashboard, click an employee → verify Focus Layer renders inside the sheet. Confirm bar visible only for managers/HR with that direct report.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/dashboard/employee-sheet.tsx
git commit -m "feat(dashboard): render Focus Layer in EmployeeSheet drawer"
```

---

### Task 13: Seed script

**Files:**
- Create: `scripts/seed-focus-layers.ts`
- Modify: `package.json` (add `db:seed-focus-layers`)

- [ ] **Step 1: Create seed**

```ts
// scripts/seed-focus-layers.ts
import "dotenv/config";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";

const RESPONSE_BANK = [
  {
    uniqueContribution: "I bring clarity to ambiguous technical decisions by holding both customer empathy and architectural rigor in the same conversation.",
    highImpactArea: "Most of my impact lands when I shorten the distance between a noisy customer signal and a backlog item the team can act on.",
    signatureResponsibility: "I own how the team talks about its quarterly direction — the language, the priorities, and how we connect them to outcomes.",
    workingStyle: "I do my best work in focused 90-minute blocks, augmented with short async syncs. I prefer over-communication early in a project and quiet execution late.",
  },
  {
    uniqueContribution: "I'm the bridge between specialist depth and generalist context, which lets the team make calls that hold up across functions.",
    highImpactArea: "I create the most value when I get to redesign a process that was duct-taped during a growth period — that's where the compounding lives.",
    signatureResponsibility: "I'm responsible for the quality of our internal documentation and the rituals that keep it current.",
    workingStyle: "I run on structured calendars and bias toward written-first communication. I make space for spontaneous 1:1s when stakes are high.",
  },
];

async function main() {
  await connectDB();
  const employees = await Employee.find({ jobDescriptionId: { $ne: null } }).limit(5).lean();
  if (!employees.length) {
    console.log("No employees with jobDescriptionId. Run pnpm db:seed-jds first.");
    return;
  }

  const states: Array<"draft" | "submitted" | "confirmed"> = [
    "draft", "submitted", "submitted", "confirmed", "confirmed",
  ];
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const status = states[i] ?? "draft";
    const responses = RESPONSE_BANK[i % RESPONSE_BANK.length];
    await FocusLayer.findOneAndUpdate(
      { employeeId: emp._id },
      {
        $set: {
          jobDescriptionId: emp.jobDescriptionId,
          responses,
          status,
          employeeSubmitted: { at: status !== "draft" ? new Date() : null },
          managerConfirmed:
            status === "confirmed"
              ? { at: new Date(), byUserId: null, comment: "Looks like a strong fit." }
              : { at: null, byUserId: null, comment: null },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`  ${emp.firstName} ${emp.lastName} → ${status}`);
  }
  console.log(`Seeded ${employees.length} Focus Layers.`);
  process.exit(0);
}
main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Add script to package.json**

```json
"db:seed-focus-layers": "npx tsx scripts/seed-focus-layers.ts",
```

- [ ] **Step 3: Run, verify**

```bash
pnpm db:seed-focus-layers
```

- [ ] **Step 4: Final verification**

```bash
pnpm lint
pnpm test
pnpm build
```

Expected: PASS.

Manual:
- Visit `/my-profile` → see Focus Layer form
- Fill it in → auto-save indicator
- Submit → status pill changes to "Awaiting confirmation"
- Open EmployeeSheet for that employee as HR → confirm bar visible → confirm → pill turns "Confirmed"

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-focus-layers.ts package.json
git commit -m "feat(seed): seed Focus Layers in varied confirmation states"
```

---

## Definition of Done

- [ ] All 13 tasks committed
- [ ] `pnpm lint && pnpm test && pnpm build` pass
- [ ] Manual smoke covers: draft, submit, confirm, edit-after-confirm reset to submitted
- [ ] Spec compliance: every in-scope item maps to a shipped task
- [ ] PR opened via `gh-pr-main`

## Notes for the Implementer

- **Auth integration is partial.** Confirm endpoint accepts `x-dev-user-id` header for dev impersonation matching the existing auth-context behavior. Production must wire a real `currentUser` resolver before this ships behind login.
- **AI calls are not in CI.** Smoke-test the `/suggest` endpoint manually with `OPENAI_API_KEY` set.
- **No notification.** A "manager has a Focus Layer awaiting confirmation" reminder will land in sub-project #6 (workflow showcase). For now, discoverability is via the EmployeeSheet drawer alone.
- **`resolveModel()` helper.** If it doesn't exist in `lib/ai/providers.ts`, add a small wrapper that returns the configured model (`openai("gpt-4o")` or `anthropic("claude-sonnet-4")`) based on env keys.
