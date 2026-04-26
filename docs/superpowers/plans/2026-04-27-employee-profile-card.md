# Employee Profile Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the embedded `Employee.profile` sub-doc, the `/my-profile` editor (Get to Know section), and a reusable `<EmployeeProfileCard />` component that renders inline (in EmployeeSheet) and in a dialog (for future org chart). Sub-project #3 of the Plan module roadmap.

**Architecture:** `profile` sub-doc embedded on Employee (one-to-one, never queried separately). Save-partial PATCH endpoint with a computed `completion` payload. Photo stored as Base64 (no asset pipeline). Reusable read card; the `<FocusLayerReadView />` from sub-project #2 nests inside it when status is `confirmed`.

**Spec:** `docs/superpowers/specs/2026-04-27-employee-profile-card-design.md`
**Builds on:** sub-projects #1 (`Employee.jobDescriptionId`) and #2 (Focus Layer read view component, `/my-profile` page scaffold)

**Branch:** `feat/employee-profile-card`. Confirm branch vs worktree with the user.

**Pattern reference:** Repeat the pattern from sub-projects #1 and #2 for sub-path exports, real-Mongo test prefixes, react-hook-form forms, and Zod-driven API gates. Skip restating those conventions in each task.

---

## Phase 1 — Schema + Validation (Tasks 1–2)

### Task 1: Add `profile` sub-document to Employee schema

**Files:**
- Modify: `packages/db/src/employee-schema.ts`
- Create: `packages/db/src/employee-profile-constants.ts`
- Modify: `packages/db/package.json` (export constants)

- [ ] **Step 1: Create constants**

```ts
// packages/db/src/employee-profile-constants.ts
export const GET_TO_KNOW_FIELDS = [
  { key: "personalBio", label: "Personal bio", helper: "A short bit about you in your own voice.", multiline: true },
  { key: "hobbies", label: "Hobbies and interests", helper: "What do you enjoy outside of work?", multiline: true },
  { key: "askMeAbout", label: "Ask me about", helper: "Topics you enjoy chatting about.", multiline: false },
  { key: "hometown", label: "Hometown or background", helper: "Where you're from or a meaningful place in your story.", multiline: false },
  { key: "currentlyConsuming", label: "Currently reading or listening to", helper: "Something you'd recommend right now.", multiline: false },
] as const;
export type GetToKnowKey = (typeof GET_TO_KNOW_FIELDS)[number]["key"];

export const FUN_FACTS_MIN = 1;
export const FUN_FACTS_MAX = 3;

export const PHOTO_MAX_BASE64_BYTES = 280_000; // ~200KB encoded
```

- [ ] **Step 2: Modify Employee schema**

Add the schemas as described in the spec; key change is adding:

```ts
profile: { type: profileSchema, default: () => ({}) },
```

Plus the new sub-schemas (`profileSchema`, `getToKnowSchema`, `employeeChoiceSchema`). Place them above `employeeSchema`. Update `Employee_Type` to include the new shape.

- [ ] **Step 3: Add sub-path export, type check**

Add `"./employee-profile-constants": "./src/employee-profile-constants.ts"` to `packages/db/package.json` exports (and typesVersions if present).

Run: `pnpm --filter @ascenta/platform exec tsc --noEmit` → PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/employee-schema.ts packages/db/src/employee-profile-constants.ts \
  packages/db/package.json
git commit -m "feat(db): add embedded profile sub-doc to Employee schema"
```

---

### Task 2: `computeProfileCompletion` helper + Zod validation

**Files:**
- Modify: `packages/db/src/employees.ts`
- Create: `apps/platform/src/lib/validations/employee-profile.ts`
- Create: `apps/platform/src/tests/employee-profile-validation.test.ts`

- [ ] **Step 1: Write failing tests**

Two test files: one for `computeProfileCompletion` (pure function), one for the Zod schema. Combine into `employee-profile-validation.test.ts`:

```ts
// apps/platform/src/tests/employee-profile-validation.test.ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { profilePatchSchema } from "@/lib/validations/employee-profile";
import { computeProfileCompletion } from "@ascenta/db/employees";

describe("profilePatchSchema", () => {
  it("accepts partial input", () => {
    expect(profilePatchSchema.parse({})).toEqual({});
    expect(
      profilePatchSchema.parse({ getToKnow: { personalBio: "x" } }),
    ).toBeDefined();
  });
  it("rejects funFacts > 3", () => {
    expect(() =>
      profilePatchSchema.parse({ getToKnow: { funFacts: ["a", "b", "c", "d"] } }),
    ).toThrow();
  });
  it("rejects non-data-URL photo", () => {
    expect(() =>
      profilePatchSchema.parse({ photoBase64: "not a data url" }),
    ).toThrow();
  });
  it("rejects photo over 280KB", () => {
    expect(() =>
      profilePatchSchema.parse({ photoBase64: "data:image/png;base64," + "A".repeat(280_001) }),
    ).toThrow();
  });
});

describe("computeProfileCompletion", () => {
  it("returns 0 of 7 when profile is empty", () => {
    const c = computeProfileCompletion({ getToKnow: {} } as never);
    expect(c.complete).toBe(0);
    expect(c.total).toBe(7);
  });
  it("counts each field as it fills in", () => {
    const c = computeProfileCompletion({
      getToKnow: {
        personalBio: "x",
        hobbies: "y",
        funFacts: ["a"],
        askMeAbout: "",
        hometown: "z",
        currentlyConsuming: "",
        employeeChoice: { label: "L", value: "" },
      },
    } as never);
    expect(c.complete).toBe(4); // bio, hobbies, funFacts, hometown
    expect(c.missingKeys).toEqual(["askMeAbout", "currentlyConsuming", "employeeChoice"]);
  });
  it("returns 7 of 7 when fully populated", () => {
    const c = computeProfileCompletion({
      getToKnow: {
        personalBio: "x",
        hobbies: "y",
        funFacts: ["a"],
        askMeAbout: "z",
        hometown: "w",
        currentlyConsuming: "v",
        employeeChoice: { label: "L", value: "V" },
      },
    } as never);
    expect(c.complete).toBe(7);
    expect(c.percent).toBe(100);
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/employee-profile-validation.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Zod schema**

```ts
// apps/platform/src/lib/validations/employee-profile.ts
import { z } from "zod";
import { FUN_FACTS_MAX, PHOTO_MAX_BASE64_BYTES } from "@ascenta/db/employee-profile-constants";

const safeText = z.string().trim().max(2000);
const shortText = z.string().trim().max(200);

export const profilePatchSchema = z.object({
  photoBase64: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) =>
        v == null ||
        (v.startsWith("data:image/") && v.length <= PHOTO_MAX_BASE64_BYTES),
      { message: "Photo must be a data URL under ~200KB after compression" },
    ),
  pronouns: shortText.nullable().optional(),
  preferredChannel: shortText.nullable().optional(),
  getToKnow: z
    .object({
      personalBio: safeText.optional(),
      hobbies: safeText.optional(),
      funFacts: z.array(z.string().trim().max(200)).max(FUN_FACTS_MAX).optional(),
      askMeAbout: shortText.optional(),
      hometown: shortText.optional(),
      currentlyConsuming: shortText.optional(),
      employeeChoice: z
        .object({
          label: shortText.optional(),
          value: safeText.optional(),
        })
        .optional(),
    })
    .partial()
    .optional(),
});
export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;
```

- [ ] **Step 4: Implement `computeProfileCompletion`**

In `packages/db/src/employees.ts`, add:

```ts
type GetToKnow = {
  personalBio?: string;
  hobbies?: string;
  funFacts?: string[];
  askMeAbout?: string;
  hometown?: string;
  currentlyConsuming?: string;
  employeeChoice?: { label?: string; value?: string };
};

const COMPLETION_KEYS = [
  "personalBio",
  "hobbies",
  "funFacts",
  "askMeAbout",
  "hometown",
  "currentlyConsuming",
  "employeeChoice",
] as const;
type CompletionKey = (typeof COMPLETION_KEYS)[number];

function isComplete(key: CompletionKey, gtk: GetToKnow): boolean {
  if (key === "funFacts") {
    return Array.isArray(gtk.funFacts) && gtk.funFacts.some((s) => s && s.trim().length > 0);
  }
  if (key === "employeeChoice") {
    return !!(gtk.employeeChoice?.label?.trim() && gtk.employeeChoice?.value?.trim());
  }
  const v = gtk[key];
  return typeof v === "string" && v.trim().length > 0;
}

export function computeProfileCompletion(profile: { getToKnow?: GetToKnow }): {
  complete: number;
  total: number;
  percent: number;
  missingKeys: CompletionKey[];
} {
  const gtk = profile.getToKnow ?? {};
  const missing: CompletionKey[] = [];
  let complete = 0;
  for (const k of COMPLETION_KEYS) {
    if (isComplete(k, gtk)) complete++;
    else missing.push(k);
  }
  const total = COMPLETION_KEYS.length;
  return {
    complete,
    total,
    percent: Math.round((complete / total) * 100),
    missingKeys: missing,
  };
}
```

- [ ] **Step 5: Run tests, commit**

```bash
git add packages/db/src/employees.ts apps/platform/src/lib/validations/employee-profile.ts \
  apps/platform/src/tests/employee-profile-validation.test.ts
git commit -m "feat(platform): add profile completion helper and Zod patch schema"
```

---

## Phase 2 — API (Task 3)

### Task 3: GET / PATCH `/api/employees/[id]/profile`

**Files:**
- Create: `apps/platform/src/app/api/employees/[id]/profile/route.ts`
- Create: `apps/platform/src/tests/api-employee-profile.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/api-employee-profile.test.ts
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
    firstName: "P", lastName: "Roe",
    email: `${PREFIX}p@x.com`,
    department: "Engineering", jobTitle: "Eng",
    managerName: "M", hireDate: new Date(),
  });
}
function ctx(id: string) { return { params: Promise.resolve({ id }) }; }

describe("/api/employees/[id]/profile", () => {
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
    expect(new Date(json.profile.profileUpdatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("PATCH 400 on invalid payload", async () => {
    const emp = await makeEmployee();
    const req = new Request("http://t", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ getToKnow: { funFacts: ["a", "b", "c", "d"] } }),
    });
    const res = await PATCH(req as never, ctx(String(emp._id)));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Implement route**

```ts
// apps/platform/src/app/api/employees/[id]/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { computeProfileCompletion } from "@ascenta/db/employees";
import { profilePatchSchema } from "@/lib/validations/employee-profile";

type Ctx = { params: Promise<{ id: string }> };

function flatten(obj: Record<string, unknown>, prefix = "profile"): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const path = `${prefix}.${k}`;
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      // employeeChoice is a single object, but its sub-fields are leafs we can flatten
      k !== "funFacts"
    ) {
      Object.assign(out, flatten(v as Record<string, unknown>, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 404 });
  }
  const emp = await Employee.findById(id).lean();
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const profile = emp.profile ?? {};
  const completion = computeProfileCompletion(profile);
  return NextResponse.json({ profile, completion });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await connectDB();
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 404 });
  }
  const body = await req.json();
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const $set = flatten(parsed.data as Record<string, unknown>);
  $set["profile.profileUpdatedAt"] = new Date();
  const emp = await Employee.findByIdAndUpdate(id, { $set }, { new: true });
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const profile = emp.toJSON().profile;
  const completion = computeProfileCompletion(profile);
  return NextResponse.json({ profile, completion });
}
```

- [ ] **Step 3: Run tests, commit**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/api-employee-profile.test.ts`
Expected: PASS.

```bash
git add apps/platform/src/app/api/employees/\[id\]/profile/route.ts \
  apps/platform/src/tests/api-employee-profile.test.ts
git commit -m "feat(api): GET/PATCH /api/employees/[id]/profile with completion payload"
```

---

## Phase 3 — UI Components (Tasks 4–7)

### Task 4: Completion badge + photo input

**Files:**
- Create: `apps/platform/src/components/plan/profile/profile-completion-badge.tsx`
- Create: `apps/platform/src/components/plan/profile/profile-photo-input.tsx`
- Create: `apps/platform/src/components/plan/profile/fun-facts-field.tsx`

- [ ] **Step 1: ProfileCompletionBadge**

```tsx
"use client";
import { Badge } from "@ascenta/ui/components/badge";

interface Props { complete: number; total: number; }

export function ProfileCompletionBadge({ complete, total }: Props) {
  if (total === 0) return null;
  if (complete === total) {
    return <Badge variant="default">Profile complete</Badge>;
  }
  return <Badge variant="secondary">{complete} of {total} complete</Badge>;
}
```

- [ ] **Step 2: ProfilePhotoInput**

Reads a file via `<input type="file" accept="image/*">`, draws to a hidden `<canvas>` with max dimension 256px, exports as JPEG quality 0.85 → Base64 data URL. If still over `PHOTO_MAX_BASE64_BYTES`, surfaces an error instead of saving.

```tsx
"use client";
import { useRef, useState } from "react";
import { Button } from "@ascenta/ui/components/button";
import { PHOTO_MAX_BASE64_BYTES } from "@ascenta/db/employee-profile-constants";
import { Camera, X } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (next: string | null) => void;
}

export function ProfilePhotoInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setError(null);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    const max = 256;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    const compressed = canvas.toDataURL("image/jpeg", 0.85);
    if (compressed.length > PHOTO_MAX_BASE64_BYTES) {
      setError("Photo too large after compression — try a smaller source image.");
      return;
    }
    onChange(compressed);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="size-20 rounded-full overflow-hidden bg-muted/40 grid place-items-center">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Profile" className="size-full object-cover" />
        ) : (
          <Camera className="size-6 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            {value ? "Replace" : "Add photo"}
          </Button>
          {value && (
            <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
              <X className="size-4" /> Remove
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: FunFactsField**

```tsx
"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@ascenta/ui/components/button";
import { Input } from "@ascenta/ui/components/input";
import { FUN_FACTS_MAX, FUN_FACTS_MIN } from "@ascenta/db/employee-profile-constants";
import { Plus, X } from "lucide-react";

export function FunFactsField({ name }: { name: string }) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Fun facts</label>
      <p className="text-xs text-muted-foreground">1–3 things that make you, you.</p>
      <div className="space-y-2">
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-start gap-2">
            <Input {...register(`${name}.${idx}` as const)} placeholder="e.g., Once held a state record for sand-castle building" />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => remove(idx)}
              disabled={fields.length <= FUN_FACTS_MIN}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => append("")}
        disabled={fields.length >= FUN_FACTS_MAX}
      >
        <Plus className="size-4 mr-1" /> Add fact
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Type check, commit**

```bash
git add apps/platform/src/components/plan/profile/profile-completion-badge.tsx \
  apps/platform/src/components/plan/profile/profile-photo-input.tsx \
  apps/platform/src/components/plan/profile/fun-facts-field.tsx
git commit -m "feat(plan): add profile completion badge, photo input, and fun-facts field"
```

---

### Task 5: ProfileEditForm

**Files:**
- Create: `apps/platform/src/components/plan/profile/profile-edit-form.tsx`
- Create: `apps/platform/src/tests/profile-edit-form.test.tsx`

- [ ] **Step 1: Write failing component test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ProfileEditForm } from "@/components/plan/profile/profile-edit-form";

const initial = {
  photoBase64: null,
  pronouns: "",
  preferredChannel: "",
  getToKnow: {
    personalBio: "",
    hobbies: "",
    funFacts: [""],
    askMeAbout: "",
    hometown: "",
    currentlyConsuming: "",
    employeeChoice: { label: "", value: "" },
  },
};

describe("ProfileEditForm", () => {
  it("renders all GET_TO_KNOW_FIELDS", () => {
    render(<ProfileEditForm employeeId="x" initialProfile={initial as never} onChanged={() => {}} />);
    expect(screen.getByText(/Personal bio/)).toBeInTheDocument();
    expect(screen.getByText(/Hobbies and interests/)).toBeInTheDocument();
    expect(screen.getByText(/Ask me about/)).toBeInTheDocument();
    expect(screen.getByText(/Hometown/)).toBeInTheDocument();
    expect(screen.getByText(/Currently reading/)).toBeInTheDocument();
  });

  it("can add and remove fun facts within bounds", () => {
    render(<ProfileEditForm employeeId="x" initialProfile={initial as never} onChanged={() => {}} />);
    const addButtons = screen.getAllByText(/Add fact/);
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[0]);
    // 3 inputs (max), so the add button is disabled
    expect(addButtons[0]).toBeDisabled();
  });

  it("renders separate label and value for employee choice", () => {
    render(<ProfileEditForm employeeId="x" initialProfile={initial as never} onChanged={() => {}} />);
    expect(screen.getByPlaceholderText(/Field name/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Field content/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement form**

```tsx
// apps/platform/src/components/plan/profile/profile-edit-form.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@ascenta/ui/components/input";
import { Textarea } from "@ascenta/ui/components/textarea";
import { profilePatchSchema, type ProfilePatchInput } from "@/lib/validations/employee-profile";
import { GET_TO_KNOW_FIELDS } from "@ascenta/db/employee-profile-constants";
import { ProfilePhotoInput } from "./profile-photo-input";
import { FunFactsField } from "./fun-facts-field";

type Initial = NonNullable<ProfilePatchInput> & {
  getToKnow: NonNullable<NonNullable<ProfilePatchInput["getToKnow"]>>;
};

interface Props {
  employeeId: string;
  initialProfile: Initial;
  onChanged: () => void;
}

export function ProfileEditForm({ employeeId, initialProfile, onChanged }: Props) {
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const methods = useForm<Initial>({
    resolver: zodResolver(profilePatchSchema as never),
    defaultValues: initialProfile,
    mode: "onChange",
  });

  useEffect(() => {
    const sub = methods.watch(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(save, 800);
    });
    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [methods, employeeId]);

  async function save() {
    setSavingState("saving");
    const values = methods.getValues();
    const res = await fetch(`/api/employees/${employeeId}/profile`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      setSavingState("saved");
      onChanged();
    } else {
      setSavingState("idle");
    }
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">About Me</h3>
          <span className="text-xs text-muted-foreground">
            {savingState === "saving" ? "Saving..." : savingState === "saved" ? "Saved" : ""}
          </span>
        </div>

        <PhotoSection />
        <RowsSection />

        <FunFactsField name="getToKnow.funFacts" />

        <EmployeeChoiceSection />
      </form>
    </FormProvider>
  );
}

function PhotoSection() {
  const { setValue, watch } = useFormContext<Initial>();
  const photo = watch("photoBase64") ?? null;
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Profile photo</label>
      <ProfilePhotoInput value={photo} onChange={(v) => setValue("photoBase64", v)} />
    </div>
  );
}

function RowsSection() {
  const { register } = useFormContext<Initial>();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Pronouns</label>
        <Input {...register("pronouns")} placeholder="she/her, they/them, etc." />
      </div>
      <div>
        <label className="text-sm font-medium">Preferred contact</label>
        <Input {...register("preferredChannel")} placeholder="Slack: @jane" />
      </div>
      {GET_TO_KNOW_FIELDS.map((f) => (
        <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
          <label className="text-sm font-medium">{f.label}</label>
          <p className="text-xs text-muted-foreground">{f.helper}</p>
          {f.multiline ? (
            <Textarea rows={3} {...register(`getToKnow.${f.key}` as never)} />
          ) : (
            <Input {...register(`getToKnow.${f.key}` as never)} />
          )}
        </div>
      ))}
    </div>
  );
}

function EmployeeChoiceSection() {
  const { register } = useFormContext<Initial>();
  return (
    <div className="rounded-lg border border-dashed p-4 space-y-2">
      <label className="text-sm font-medium">Employee choice field</label>
      <p className="text-xs text-muted-foreground">
        Pick a label and tell us about it. Examples: "First job", "Hidden talent", "Best concert."
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          {...register("getToKnow.employeeChoice.label")}
          placeholder="Field name"
        />
        <div className="md:col-span-2">
          <Input
            {...register("getToKnow.employeeChoice.value")}
            placeholder="Field content"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests, commit**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/profile-edit-form.test.tsx`
Expected: PASS.

```bash
git add apps/platform/src/components/plan/profile/profile-edit-form.tsx \
  apps/platform/src/tests/profile-edit-form.test.tsx
git commit -m "feat(plan): add profile edit form with auto-save"
```

---

### Task 6: EmployeeProfileCard (read-only) + edit section wrapper

**Files:**
- Create: `apps/platform/src/components/plan/profile/employee-profile-card.tsx`
- Create: `apps/platform/src/components/plan/profile/profile-edit-section.tsx`
- Create: `apps/platform/src/tests/employee-profile-card.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// mock fetch globally
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      employee: { id: "x", firstName: "Jane", lastName: "Doe", jobTitle: "Engineer", department: "Engineering", managerName: "Mgr" },
      profile: { getToKnow: { personalBio: "Hi.", hobbies: "Running" } },
      completion: { complete: 2, total: 7, percent: 28, missingKeys: [] },
      focusLayer: null,
    }),
  } as never));
});

import { EmployeeProfileCard } from "@/components/plan/profile/employee-profile-card";

describe("EmployeeProfileCard inline mode", () => {
  it("renders employee header and completion badge", async () => {
    render(<EmployeeProfileCard employeeId="x" mode="inline" />);
    expect(await screen.findByText(/Jane Doe/)).toBeInTheDocument();
    expect(await screen.findByText(/2 of 7 complete/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement EmployeeProfileCard**

```tsx
// apps/platform/src/components/plan/profile/employee-profile-card.tsx
"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@ascenta/ui/components/dialog";
import { ProfileCompletionBadge } from "./profile-completion-badge";
import { FocusLayerReadView } from "@/components/plan/focus-layer/focus-layer-read-view";

interface Props {
  employeeId: string;
  mode: "inline" | "dialog";
  trigger?: React.ReactNode;
}

interface Snapshot {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    department: string;
    managerName: string;
    hireDate?: string;
  };
  profile: {
    photoBase64?: string | null;
    pronouns?: string | null;
    preferredChannel?: string | null;
    getToKnow?: Record<string, unknown>;
    profileUpdatedAt?: string | null;
  };
  completion: { complete: number; total: number; percent: number; missingKeys: string[] };
  focusLayer: {
    status: "draft" | "submitted" | "confirmed";
    responses: Record<string, string>;
    managerConfirmed?: { at: string | null; comment: string | null };
  } | null;
}

function Body({ data }: { data: Snapshot }) {
  const { employee, profile, completion, focusLayer } = data;
  const initials = `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`;
  return (
    <div className="space-y-5">
      <header className="flex items-start gap-4">
        <div className="size-16 rounded-full bg-muted grid place-items-center text-lg font-semibold overflow-hidden">
          {profile.photoBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photoBase64} alt="" className="size-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-display font-bold">
                {employee.firstName} {employee.lastName}
                {profile.pronouns && (
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    · {profile.pronouns}
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {employee.jobTitle} · {employee.department}
              </p>
              <p className="text-xs text-muted-foreground">Reports to: {employee.managerName}</p>
            </div>
            <ProfileCompletionBadge complete={completion.complete} total={completion.total} />
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">About Me</h4>
        <Field label="Personal bio" value={(profile.getToKnow?.personalBio as string) ?? ""} />
        <Field label="Hobbies & interests" value={(profile.getToKnow?.hobbies as string) ?? ""} />
        <ListField label="Fun facts" items={(profile.getToKnow?.funFacts as string[]) ?? []} />
        <Field label="Ask me about" value={(profile.getToKnow?.askMeAbout as string) ?? ""} />
        <Field label="Hometown" value={(profile.getToKnow?.hometown as string) ?? ""} />
        <Field label="Currently reading / listening" value={(profile.getToKnow?.currentlyConsuming as string) ?? ""} />
        <ChoiceField choice={(profile.getToKnow?.employeeChoice as { label: string; value: string }) ?? { label: "", value: "" }} />
      </section>

      {focusLayer && focusLayer.status === "confirmed" && (
        <section>
          <FocusLayerReadView
            responses={focusLayer.responses}
            status={focusLayer.status}
            managerConfirmed={focusLayer.managerConfirmed as never}
          />
        </section>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-line">{value}</p>
    </div>
  );
}
function ListField({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <ul className="list-disc pl-4 text-sm">
        {items.filter(Boolean).map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}
function ChoiceField({ choice }: { choice: { label: string; value: string } }) {
  if (!choice?.label || !choice?.value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{choice.label}</p>
      <p className="text-sm">{choice.value}</p>
    </div>
  );
}

export function EmployeeProfileCard({ employeeId, mode, trigger }: Props) {
  const [data, setData] = useState<Snapshot | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [empRes, profileRes, focusRes] = await Promise.all([
        fetch(`/api/dashboard/employees/${employeeId}`),
        fetch(`/api/employees/${employeeId}/profile`),
        fetch(`/api/focus-layers/${employeeId}`),
      ]);
      const empJson = await empRes.json();
      const profileJson = await profileRes.json();
      const focusJson = await focusRes.json();
      if (cancelled) return;
      setData({
        employee: empJson.employee,
        profile: profileJson.profile,
        completion: profileJson.completion,
        focusLayer: focusJson.focusLayer,
      });
    }
    load();
    return () => { cancelled = true; };
  }, [employeeId]);

  if (!data) return <p className="text-sm text-muted-foreground">Loading profile...</p>;
  if (mode === "inline") return <Body data={data} />;
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger ?? <button className="underline">View profile</button>}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <Body data={data} />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Implement ProfileEditSection**

```tsx
// profile-edit-section.tsx
"use client";
import { useEffect, useState } from "react";
import { ProfileEditForm } from "./profile-edit-form";

interface Props {
  employeeId: string;
}

export function ProfileEditSection({ employeeId }: Props) {
  const [initial, setInitial] = useState<unknown | null>(null);
  async function load() {
    const res = await fetch(`/api/employees/${employeeId}/profile`);
    const json = await res.json();
    setInitial({
      photoBase64: json.profile.photoBase64 ?? null,
      pronouns: json.profile.pronouns ?? "",
      preferredChannel: json.profile.preferredChannel ?? "",
      getToKnow: {
        personalBio: json.profile.getToKnow?.personalBio ?? "",
        hobbies: json.profile.getToKnow?.hobbies ?? "",
        funFacts: json.profile.getToKnow?.funFacts ?? [""],
        askMeAbout: json.profile.getToKnow?.askMeAbout ?? "",
        hometown: json.profile.getToKnow?.hometown ?? "",
        currentlyConsuming: json.profile.getToKnow?.currentlyConsuming ?? "",
        employeeChoice: {
          label: json.profile.getToKnow?.employeeChoice?.label ?? "",
          value: json.profile.getToKnow?.employeeChoice?.value ?? "",
        },
      },
    });
  }
  useEffect(() => { load(); }, [employeeId]);
  if (!initial) return <p className="text-sm text-muted-foreground">Loading...</p>;
  return (
    <ProfileEditForm
      employeeId={employeeId}
      initialProfile={initial as never}
      onChanged={() => {}}
    />
  );
}
```

- [ ] **Step 4: Run tests, commit**

```bash
git add apps/platform/src/components/plan/profile/employee-profile-card.tsx \
  apps/platform/src/components/plan/profile/profile-edit-section.tsx \
  apps/platform/src/tests/employee-profile-card.test.tsx
git commit -m "feat(plan): EmployeeProfileCard (read) and ProfileEditSection (edit)"
```

---

## Phase 4 — Integration + Seed (Tasks 7–9)

### Task 7: Wire `/my-profile` page

**Files:**
- Modify: `apps/platform/src/app/my-profile/page.tsx`

- [ ] **Step 1: Replace placeholder with ProfileEditSection**

```tsx
"use client";
import { useAuth } from "@/lib/auth/auth-context";
import { FocusLayerSection } from "@/components/plan/focus-layer/focus-layer-section";
import { ProfileEditSection } from "@/components/plan/profile/profile-edit-section";

export default function MyProfilePage() {
  const { user } = useAuth();
  if (!user) return <div className="p-8"><p>Sign in to edit your profile.</p></div>;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">{user.name}</p>
      </header>

      <section className="rounded-lg border p-6">
        <FocusLayerSection employeeId={user.id} mode="edit" />
      </section>

      <section className="rounded-lg border p-6">
        <ProfileEditSection employeeId={user.id} />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Type check, commit**

```bash
git add apps/platform/src/app/my-profile/page.tsx
git commit -m "feat(my-profile): wire ProfileEditSection alongside FocusLayerSection"
```

---

### Task 8: Render in EmployeeSheet

**Files:**
- Modify: `apps/platform/src/components/dashboard/employee-sheet.tsx`

- [ ] **Step 1: Add EmployeeProfileCard inline + HR-only edit dialog**

Below the existing header section in EmployeeSheet, render:

```tsx
import { EmployeeProfileCard } from "@/components/plan/profile/employee-profile-card";
import { ProfileEditSection } from "@/components/plan/profile/profile-edit-section";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@ascenta/ui/components/sheet";
import { Button } from "@ascenta/ui/components/button";
```

```tsx
<section className="px-4 pb-4">
  <EmployeeProfileCard employeeId={employee.id} mode="inline" />
  {user?.role === "hr" && (
    <div className="mt-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">Edit profile (HR)</Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader><SheetTitle>Edit Profile</SheetTitle></SheetHeader>
          <div className="mt-4">
            <ProfileEditSection employeeId={employee.id} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )}
</section>
```

(Place this section above where Focus Layer was rendered in sub-project #2 — they coexist.)

- [ ] **Step 2: Manual smoke**

Visit dashboard → click employee → sheet opens with profile card + Focus Layer. As HR, the "Edit profile (HR)" button opens a sub-Sheet with the edit form.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/dashboard/employee-sheet.tsx
git commit -m "feat(dashboard): render EmployeeProfileCard in EmployeeSheet with HR edit affordance"
```

---

### Task 9: Seed profile data

**Files:**
- Create: `scripts/seed-employee-profiles.ts`
- Modify: `package.json` (add `db:seed-profiles`)

- [ ] **Step 1: Create seed**

Walk all employees, set `profile` to a content-pack from a small bank (rotate so the demo doesn't feel templated). Photos skipped; relies on initials. Idempotent (always overwrite).

```ts
// scripts/seed-employee-profiles.ts
import "dotenv/config";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";

const PACKS = [
  {
    pronouns: "she/her",
    preferredChannel: "Slack: @jane",
    getToKnow: {
      personalBio: "Born and raised in Pittsburgh. Started in mechanical engineering, moved into software when I realized I liked debugging more than CAD.",
      hobbies: "Long-distance running (slow), bread baking, and stubbornly trying to learn Japanese.",
      funFacts: ["Once made it onto a local news segment about backyard chickens.", "Used to be a part-time DJ in college."],
      askMeAbout: "Sourdough, ultramarathons, monorepo tooling",
      hometown: "Pittsburgh, PA",
      currentlyConsuming: "Re-reading 'The Goal' by Goldratt; latest Lex Fridman ep.",
      employeeChoice: { label: "First job", value: "Pretzel rolling at a hometown bakery, age 16" },
    },
  },
  {
    pronouns: "he/him",
    preferredChannel: "Slack: @marc",
    getToKnow: {
      personalBio: "Grew up between Madrid and Lima. Career started in technical writing, then field engineering, then product.",
      hobbies: "Mountain biking, backyard astronomy, learning chord progressions on a guitar that's still mostly out of tune.",
      funFacts: ["Speak four languages, badly.", "Once carried a kayak two miles to a lake that turned out to be drained."],
      askMeAbout: "Distributed teams, cooking with one pot, bike packing routes in the southwest",
      hometown: "Lima, Peru → Madrid, Spain",
      currentlyConsuming: "'How to Take Smart Notes' and the Acquired podcast",
      employeeChoice: { label: "Hidden talent", value: "Decent at restoring vintage espresso machines" },
    },
  },
  {
    pronouns: "they/them",
    preferredChannel: "Slack: @sam",
    getToKnow: {
      personalBio: "From a small town in upstate New York. Studied philosophy, accidentally became a developer, never looked back.",
      hobbies: "Backpacking, board games (heavy euros), and the slow patient art of growing chili peppers.",
      funFacts: ["I have hiked the entire Long Trail in Vermont.", "I once won a regional Settlers of Catan tournament."],
      askMeAbout: "Game design, philosophy of mind, fermenting hot sauce",
      hometown: "Saranac Lake, NY",
      currentlyConsuming: "Le Guin's 'The Dispossessed'; 'Decoder Ring' podcast",
      employeeChoice: { label: "Worst job", value: "Door-to-door magazine sales (one summer was enough)" },
    },
  },
];

async function main() {
  await connectDB();
  const employees = await Employee.find().lean();
  for (let i = 0; i < employees.length; i++) {
    const pack = PACKS[i % PACKS.length];
    await Employee.updateOne(
      { _id: employees[i]._id },
      {
        $set: {
          "profile.pronouns": pack.pronouns,
          "profile.preferredChannel": pack.preferredChannel,
          "profile.getToKnow": pack.getToKnow,
          "profile.profileUpdatedAt": new Date(),
        },
      },
    );
  }
  console.log(`Seeded profiles for ${employees.length} employees.`);
  process.exit(0);
}
main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Add script to package.json**

```json
"db:seed-profiles": "npx tsx scripts/seed-employee-profiles.ts",
```

- [ ] **Step 3: Run seed, smoke test, commit**

```bash
pnpm db:seed-profiles
pnpm lint && pnpm test && pnpm build
```

Manual: visit `/my-profile` (logged in as a seeded employee) → see Get to Know fields populated; visit dashboard → click employee → see profile card with content; HR edit button opens sub-sheet.

```bash
git add scripts/seed-employee-profiles.ts package.json
git commit -m "feat(seed): backfill realistic Get to Know profile data for demo employees"
```

---

## Definition of Done

- [ ] All 9 tasks committed
- [ ] `pnpm lint && pnpm test && pnpm build` pass
- [ ] Manual smoke covers: edit on `/my-profile`, view in EmployeeSheet, HR edit affordance, completion badge updates as fields fill in
- [ ] Spec compliance: all 7 Get to Know fields present and tracked in completion
- [ ] PR opened via `gh-pr-main`

## Notes for the Implementer

- **Photo storage is intentionally Base64.** When auth ships, swap `profilePhotoInput` to upload to a real asset service. The Base64 column can become an upload reference (URL) without UI changes.
- **Completion logic lives in `@ascenta/db`** — keeps the same calculation usable from API and seed scripts.
- **Save-partial.** No "Save" button — auto-save on blur. Match the Focus Layer pattern.
- **Reused FocusLayerReadView.** EmployeeProfileCard nests it when status is `confirmed`. If sub-project #2 hasn't merged, the import will fail; merge order matters.
