# My Role + Job Descriptions Compass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Plan → Organizational Design tabs: rename "My Profile" → "My Role", introduce Compass interview-style AI tools for both My Role and Job Descriptions, and bring both pages' look-and-feel in line with the Goals page (two CTA cards on top, sectioned read view, secondary "Edit"/"+ New" header buttons).

**Architecture:** Mirrors the existing Goals page pattern — Compass cards link to `/do?prompt=...&tool=...`, AI tools run interview flows that emit `[ASCENTA_WORKING_DOC]` blocks parsed by the existing `chat-context` side-panel. Five new AI tools (3 profile, 2 JD), two new working-document forms wired through the existing dispatcher, and tactical UI changes on `my-role-tab.tsx` (renamed) and `library-view.tsx`. No new workflow-engine scaffolding — mirrors the simpler `buildMVVTool` pattern.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, react-hook-form + Zod, Vercel AI SDK (`ai` package), Mongoose, Vitest.

**Spec:** `docs/superpowers/specs/2026-04-28-my-role-jd-compass-design.md`.

---

## Task 1: Rename `my-profile` tab → `my-role` (config + callers)

**Files:**
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts:194`
- Rename: `apps/platform/src/components/plan/my-profile-tab.tsx` → `apps/platform/src/components/plan/my-role-tab.tsx`
- Modify: `apps/platform/src/components/plan/org-design-tabs.tsx`
- Modify: `apps/platform/src/app/[category]/[sub]/page.tsx:95`

**Note:** No tests for this task — pure rename. Visual smoke-test happens at Task 13 (manual QA gate).

- [ ] **Step 1: Update tab key + label in `dashboard-nav.ts`**

In `apps/platform/src/lib/constants/dashboard-nav.ts`, change line 194 from:

```ts
{ key: "my-profile", label: "My Profile", icon: UserCircle },
```

to:

```ts
{ key: "my-role", label: "My Role", icon: UserCircle },
```

- [ ] **Step 2: Rename the file**

```bash
git mv apps/platform/src/components/plan/my-profile-tab.tsx apps/platform/src/components/plan/my-role-tab.tsx
```

- [ ] **Step 3: Rename the exported component**

In `apps/platform/src/components/plan/my-role-tab.tsx`, change:

```tsx
export function MyProfileTab() {
```

to:

```tsx
export function MyRoleTab() {
```

Also update the page header text inside the component:

```tsx
<h2 className="text-xl font-display font-bold">My Profile</h2>
```

to:

```tsx
<h2 className="text-xl font-display font-bold">My Role</h2>
```

- [ ] **Step 4: Update the tab dispatcher**

In `apps/platform/src/components/plan/org-design-tabs.tsx`, replace the entire file with:

```tsx
"use client";

import { LibraryView } from "./job-descriptions/library-view";
import { MyRoleTab } from "./my-role-tab";
import { OrgChartView } from "./org-chart/org-chart-view";

interface OrgDesignTabsProps {
  activeTab: string;
}

export function OrgDesignTabs({ activeTab }: OrgDesignTabsProps) {
  if (activeTab === "job-descriptions") return <LibraryView />;
  if (activeTab === "my-role") return <MyRoleTab />;
  if (activeTab === "org-chart") return <OrgChartView />;
  return null;
}
```

- [ ] **Step 5: Update the dynamic route page guard**

In `apps/platform/src/app/[category]/[sub]/page.tsx` line 95, replace `activeTab === "my-profile"` with `activeTab === "my-role"`. Use Edit:

old:
```tsx
          activeTab === "my-profile" ||
```
new:
```tsx
          activeTab === "my-role" ||
```

- [ ] **Step 6: Type-check & commit**

Run:

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no `MyProfileTab` errors. If anything else breaks, fix before committing.

```bash
git add -A
git commit -m "refactor: rename my-profile tab to my-role"
```

---

## Task 2: Extract `JdFormBody` so it can be reused by the working-doc form

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/jd-form-body.tsx`
- Modify: `apps/platform/src/components/plan/job-descriptions/jd-form.tsx`

**Why:** The working-doc form (built in Task 8) reuses the same field layout but provides its own header/submit chrome. Extracting the body now avoids copy-paste later.

- [ ] **Step 1: Create `jd-form-body.tsx`**

Create `apps/platform/src/components/plan/job-descriptions/jd-form-body.tsx`:

```tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@ascenta/db/job-description-constants";
import type { JobDescriptionInput } from "@/lib/validations/job-description";
import { BulletListField } from "./bullet-list-field";

export function JdFormBody() {
  const { register, watch, setValue, formState } =
    useFormContext<JobDescriptionInput>();
  const { errors } = formState;

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium" htmlFor="jd-title">
            Title <span className="text-destructive">*</span>
          </label>
          <Input id="jd-title" {...register("title")} />
          {errors.title && (
            <p className="text-xs text-destructive mt-1">
              {errors.title.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="jd-department">
            Department <span className="text-destructive">*</span>
          </label>
          <Input id="jd-department" {...register("department")} />
          {errors.department && (
            <p className="text-xs text-destructive mt-1">
              {errors.department.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Level</label>
          <Select
            value={watch("level")}
            onValueChange={(v) =>
              setValue("level", v as JobDescriptionInput["level"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {LEVEL_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Employment Type</label>
          <Select
            value={watch("employmentType")}
            onValueChange={(v) =>
              setValue(
                "employmentType",
                v as JobDescriptionInput["employmentType"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {EMPLOYMENT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={watch("status")}
            onValueChange={(v) =>
              setValue("status", v as JobDescriptionInput["status"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
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
          <p className="text-xs text-destructive mt-1">
            {errors.roleSummary.message}
          </p>
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
    </>
  );
}
```

- [ ] **Step 2: Replace `JdForm`'s body with the extracted component**

Edit `apps/platform/src/components/plan/job-descriptions/jd-form.tsx`. Replace the `<form>...</form>` body so it imports `JdFormBody` and renders it instead of the inline `<section>`/`<BulletListField>` blocks.

old:
```tsx
import { BulletListField } from "./bullet-list-field";
```
new:
```tsx
import { JdFormBody } from "./jd-form-body";
```

old (the entire run from `<section className="grid grid-cols-1 md:grid-cols-2 gap-4">` through the last `<BulletListField name="competencies" .../>`, exclusive of the surrounding form/serverError/buttons):
```tsx
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
              onValueChange={(v) =>
                setValue("level", v as JobDescriptionInput["level"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Employment Type</label>
            <Select
              value={watch("employmentType")}
              onValueChange={(v) =>
                setValue("employmentType", v as JobDescriptionInput["employmentType"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {EMPLOYMENT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={watch("status")}
              onValueChange={(v) =>
                setValue("status", v as JobDescriptionInput["status"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
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
```
new:
```tsx
        <JdFormBody />
```

After this edit, `jd-form.tsx` no longer needs `LEVEL_OPTIONS`, `EMPLOYMENT_TYPE_OPTIONS`, `STATUS_OPTIONS`, `LEVEL_LABELS`, `EMPLOYMENT_TYPE_LABELS`, `STATUS_LABELS`, `Input`, `Textarea`, `Select*`, or `BulletListField` imports. Remove them.

The remaining imports in `jd-form.tsx` should be:

```tsx
import { useState } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobDescriptionInputSchema,
  type JobDescriptionInput,
} from "@/lib/validations/job-description";
import { Button } from "@ascenta/ui/button";
import { JdFormBody } from "./jd-form-body";
```

- [ ] **Step 3: Type-check & commit**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors.

```bash
git add apps/platform/src/components/plan/job-descriptions/jd-form-body.tsx apps/platform/src/components/plan/job-descriptions/jd-form.tsx
git commit -m "refactor: extract JdFormBody for reuse in working doc"
```

---

## Task 3: Add `WorkflowType` values + dispatcher cases (chat-context)

**Files:**
- Modify: `apps/platform/src/lib/chat/chat-context.tsx:28` (WorkflowType union)
- Modify: `apps/platform/src/lib/chat/chat-context.tsx:164-169` (routeMap — but we will NOT route My Role through routeMap; we set up a per-workflow handler instead)

**Why:** New workflow types `build-my-role` and `create-job-description` need to flow through the existing dispatcher. My Role uses three sequential PATCH/POST endpoints, so it needs a custom branch in `submitWorkingDocument` (not a single POST). JD uses one endpoint but the URL depends on `mode` (create vs edit), so it also needs a small branch.

- [ ] **Step 1: Extend the `WorkflowType` union**

In `apps/platform/src/lib/chat/chat-context.tsx`, line 28, change:

```ts
export type WorkflowType = "create-goal" | "run-check-in" | "add-performance-note" | "build-mvv" | "strategy-breakdown" | "performance-review";
```

to:

```ts
export type WorkflowType = "create-goal" | "run-check-in" | "add-performance-note" | "build-mvv" | "strategy-breakdown" | "performance-review" | "build-my-role" | "create-job-description";
```

- [ ] **Step 2: Add custom submit branches**

In `apps/platform/src/lib/chat/chat-context.tsx`, replace the existing `submitWorkingDocument` body's `routeMap`/`route` block (the section starting around line 164 with `const routeMap` and going through the `fetch(route, ...)` call) so it dispatches new workflow types before the generic fetch. Find the block:

old:
```ts
      const routeMap: Partial<Record<WorkflowType, string>> = {
        "create-goal": "/api/grow/goals",
        "run-check-in": "/api/grow/check-ins",
        "add-performance-note": "/api/grow/performance-notes",
        "build-mvv": "/api/plan/foundation",
      };

      const route = routeMap[workflowType];
      if (!route) {
        throw new Error(`Workflow type "${workflowType}" is read-only and cannot be submitted`);
      }

      // Prefer form-level employeeId/employeeName (set by EmployeePicker) over
      // the working-document-level values, which may be empty for direct-open.
      const effectiveEmployeeId =
        (fields.employeeId as string) || employeeId;
      const effectiveEmployeeName =
        (fields.employeeName as string) || employeeName;

      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          employeeId: effectiveEmployeeId,
          employeeName: effectiveEmployeeName,
          ...(runId ? { runId } : {}),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error ?? "Failed to submit working document",
        );
      }
```
new:
```ts
      const routeMap: Partial<Record<WorkflowType, string>> = {
        "create-goal": "/api/grow/goals",
        "run-check-in": "/api/grow/check-ins",
        "add-performance-note": "/api/grow/performance-notes",
        "build-mvv": "/api/plan/foundation",
      };

      // Prefer form-level employeeId/employeeName (set by EmployeePicker) over
      // the working-document-level values, which may be empty for direct-open.
      const effectiveEmployeeId =
        (fields.employeeId as string) || employeeId;
      const effectiveEmployeeName =
        (fields.employeeName as string) || employeeName;

      if (workflowType === "build-my-role") {
        const aboutMe = (fields.aboutMe as Record<string, unknown>) ?? {};
        const focusLayer =
          (fields.focusLayer as Record<string, string>) ?? {};

        const profileRes = await fetch(
          `/api/employees/${effectiveEmployeeId}/profile`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aboutMe),
          },
        );
        if (!profileRes.ok) {
          const err = await profileRes.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ?? "Failed to save About Me",
          );
        }

        const flRes = await fetch(
          `/api/focus-layers/${effectiveEmployeeId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responses: focusLayer }),
          },
        );
        if (!flRes.ok) {
          const err = await flRes.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ?? "Failed to save Focus Layer",
          );
        }

        const allReady = Object.values(focusLayer).every(
          (v) => typeof v === "string" && v.trim().length >= 20,
        );
        if (allReady) {
          const submitRes = await fetch(
            `/api/focus-layers/${effectiveEmployeeId}/submit`,
            { method: "POST" },
          );
          if (!submitRes.ok) {
            const err = await submitRes.json().catch(() => ({}));
            throw new Error(
              (err as { error?: string }).error ??
                "Failed to submit Focus Layer",
            );
          }
        }
      } else if (workflowType === "create-job-description") {
        const mode = (fields.mode as string) ?? "create";
        const jdId = fields.jdId as string | undefined;
        const url =
          mode === "edit" && jdId
            ? `/api/job-descriptions/${jdId}`
            : "/api/job-descriptions";
        const method = mode === "edit" && jdId ? "PATCH" : "POST";
        // Strip working-doc-only metadata before sending to the API.
        const { mode: _m, jdId: _j, ...jdFields } = fields as Record<
          string,
          unknown
        >;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jdFields),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ??
              "Failed to save job description",
          );
        }
      } else {
        const route = routeMap[workflowType];
        if (!route) {
          throw new Error(
            `Workflow type "${workflowType}" is read-only and cannot be submitted`,
          );
        }

        const res = await fetch(route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...fields,
            employeeId: effectiveEmployeeId,
            employeeName: effectiveEmployeeName,
            ...(runId ? { runId } : {}),
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            (errorData as { error?: string }).error ??
              "Failed to submit working document",
          );
        }
      }
```

- [ ] **Step 3: Update the confirmation message branches**

Find:

old:
```ts
      let confirmText = `Successfully submitted ${workflowType.replace(/-/g, " ")}`;
      if (workflowType === "build-mvv") {
        confirmText = "Mission, Vision & Values saved and published! You can view them on the Foundation page.";
      } else {
        confirmText += ` for ${employeeName ?? "employee"}.`;
      }
```
new:
```ts
      let confirmText = `Successfully submitted ${workflowType.replace(/-/g, " ")}`;
      if (workflowType === "build-mvv") {
        confirmText = "Mission, Vision & Values saved and published! You can view them on the Foundation page.";
      } else if (workflowType === "build-my-role") {
        confirmText = "Your role has been saved.";
      } else if (workflowType === "create-job-description") {
        confirmText =
          (fields.mode as string) === "edit"
            ? "Job description updated."
            : "Job description created.";
      } else {
        confirmText += ` for ${employeeName ?? "employee"}.`;
      }
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors. (The new workflow types may produce "missing case" warnings in `working-document.tsx`'s switch — those are addressed in Tasks 7 and 9. For now the dispatcher should still type-check.)

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/chat/chat-context.tsx
git commit -m "feat: add build-my-role and create-job-description workflow types"
```

---

## Task 4: Profile-tools — `startMyRoleWorkflowTool` (interview)

**Files:**
- Create: `apps/platform/src/lib/ai/profile-tools.ts`
- Test: `apps/platform/src/lib/ai/profile-tools.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/platform/src/lib/ai/profile-tools.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { connectDB } from "@ascenta/db";
import mongoose from "mongoose";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import {
  startMyRoleWorkflowTool,
  openMyRoleDocumentTool,
} from "./profile-tools";

const SKIP_NO_DB = !process.env.MONGODB_URI;

describe.skipIf(SKIP_NO_DB)("startMyRoleWorkflowTool", () => {
  let employeeId: string;

  beforeAll(async () => {
    await connectDB();
    const jd = await JobDescription.create({
      title: "Engineer",
      department: "Eng",
      level: "mid",
      employmentType: "full_time",
      roleSummary: "Builds things.",
      coreResponsibilities: ["Ship code"],
      requiredQualifications: ["3+ yrs"],
      preferredQualifications: [],
      competencies: ["Communication"],
      status: "published",
    });
    const employee = await Employee.create({
      employeeId: `TEST-${Date.now()}`,
      firstName: "Test",
      lastName: "User",
      email: `test-${Date.now()}@example.com`,
      department: "Eng",
      jobTitle: "Engineer",
      jobDescriptionId: jd._id,
      profile: {
        pronouns: "they/them",
        getToKnow: { hometown: "Brooklyn" },
      },
    });
    employeeId = String(employee._id);
    await FocusLayer.create({
      employeeId: employee._id,
      responses: {
        uniqueContribution: "I bridge product and engineering on hard problems.",
        highImpactArea: "",
        signatureResponsibility: "",
        workingStyle: "",
      },
      status: "draft",
    });
  });

  it("loads existing About Me + Focus Layer + JD info", async () => {
    const result = await (startMyRoleWorkflowTool.execute as unknown as (
      args: { employeeId: string; employeeName: string },
    ) => Promise<{
      success: boolean;
      existing: {
        aboutMe: { pronouns?: string | null; getToKnow?: { hometown?: string } };
        focusLayer: Record<string, string>;
      };
      jdSnippet: { title: string; coreResponsibilities: string[] } | null;
    }>)({ employeeId, employeeName: "Test User" });

    expect(result.success).toBe(true);
    expect(result.existing.aboutMe.pronouns).toBe("they/them");
    expect(result.existing.aboutMe.getToKnow?.hometown).toBe("Brooklyn");
    expect(result.existing.focusLayer.uniqueContribution).toContain(
      "bridge product",
    );
    expect(result.jdSnippet?.title).toBe("Engineer");
  });

  it("returns null jdSnippet when employee has no JD assigned", async () => {
    const employee = await Employee.create({
      employeeId: `NOJD-${Date.now()}`,
      firstName: "No",
      lastName: "JD",
      email: `nojd-${Date.now()}@example.com`,
      department: "Eng",
      jobTitle: "Mystery",
    });
    const result = await (startMyRoleWorkflowTool.execute as unknown as (
      args: { employeeId: string; employeeName: string },
    ) => Promise<{ success: boolean; jdSnippet: unknown }>)({
      employeeId: String(employee._id),
      employeeName: "No JD",
    });
    expect(result.success).toBe(true);
    expect(result.jdSnippet).toBeNull();
  });
});

describe("openMyRoleDocumentTool", () => {
  it("emits a [ASCENTA_WORKING_DOC] block with build-my-role workflowType", async () => {
    const result = await (openMyRoleDocumentTool.execute as unknown as (
      args: {
        employeeId: string;
        employeeName: string;
        aboutMe: Record<string, unknown>;
        focusLayer: Record<string, string>;
      },
    ) => Promise<{ workingDocBlock: string }>)({
      employeeId: "abc123",
      employeeName: "Test User",
      aboutMe: { pronouns: "they/them" },
      focusLayer: {
        uniqueContribution: "x".repeat(25),
        highImpactArea: "x".repeat(25),
        signatureResponsibility: "x".repeat(25),
        workingStyle: "x".repeat(25),
      },
    });

    expect(result.workingDocBlock).toContain("[ASCENTA_WORKING_DOC]");
    expect(result.workingDocBlock).toContain("build-my-role");
    const json = result.workingDocBlock.match(
      /\[ASCENTA_WORKING_DOC\]([\s\S]+?)\[\/ASCENTA_WORKING_DOC\]/,
    )?.[1];
    const parsed = JSON.parse(json ?? "{}");
    expect(parsed.workflowType).toBe("build-my-role");
    expect(parsed.action).toBe("open_working_document");
    expect(parsed.prefilled.aboutMe.pronouns).toBe("they/them");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm test apps/platform/src/lib/ai/profile-tools.test.ts 2>&1 | tail -20
```

Expected: FAIL — module not found / cannot import `./profile-tools`.

- [ ] **Step 3: Create `profile-tools.ts` with `startMyRoleWorkflowTool` and `openMyRoleDocumentTool`**

Create `apps/platform/src/lib/ai/profile-tools.ts`:

```ts
/**
 * My Role AI tools — build About Me + Focus Layer through a Compass interview.
 */

import { z } from "zod";
import { tool } from "ai";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { generateFocusLayerSuggestion } from "./focus-layer-tool";
import { WORKING_DOC_PREFIX, WORKING_DOC_SUFFIX } from "./workflow-constants";

const aboutMeShape = z.object({
  photoBase64: z.string().nullable().optional(),
  pronouns: z.string().nullable().optional(),
  preferredChannel: z.string().nullable().optional(),
  getToKnow: z
    .object({
      personalBio: z.string().optional(),
      hobbies: z.string().optional(),
      funFacts: z.array(z.string()).optional(),
      askMeAbout: z.string().optional(),
      hometown: z.string().optional(),
      currentlyConsuming: z.string().optional(),
      employeeChoice: z
        .object({
          label: z.string().optional(),
          value: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

const focusLayerShape = z.object({
  uniqueContribution: z.string().min(20),
  highImpactArea: z.string().min(20),
  signatureResponsibility: z.string().min(20),
  workingStyle: z.string().min(20),
});

// ---------------------------------------------------------------------------
// startMyRoleWorkflowTool — load context, walk About Me first then Focus Layer
// ---------------------------------------------------------------------------

export const startMyRoleWorkflowTool = tool({
  description: `Start a My Role compass session for the current employee. Loads existing About Me + Focus Layer values + assigned JD info.

After calling this tool, walk the user through TWO SECTIONS in order, ONE QUESTION AT A TIME:

**Part 1 — About Me (always first):**
1. Pronouns
2. Preferred contact channel
3. Personal bio (a few sentences)
4. Hobbies
5. Hometown
6. "Ask me about" topics
7. What they're currently consuming (book/show/podcast)
8. Up to 5 fun facts
9. Employee choice (a custom field — label + value)

**Part 2 — Focus Layer (after About Me is complete):**
10. What I uniquely contribute (uniqueContribution)
11. Where I have highest impact (highImpactArea)
12. My signature responsibility (signatureResponsibility)
13. How I work best (workingStyle)

For EACH question:
- If the field has an existing value, restate it: "You currently have: '<value>'." Then present an [ASCENTA_OPTIONS] block with options ["Keep it", "Refine it", "Replace it"]. Use the user's response to decide whether to ask follow-ups or accept the current value.
- If the field is empty, ask the question directly (and reference the JD's responsibilities/competencies as inspiration when the question is in the Focus Layer section).
- Accept open text answers; don't gate on length except for Focus Layer fields, which need 2-3 sentences (≥ 20 chars).

When BOTH sections are fully covered, call openMyRoleDocument with the full payload.

RULES:
- One question at a time. Wait for the response before moving on.
- Use [ASCENTA_OPTIONS] blocks ONLY for keep/refine/replace prompts and any other multiple-choice (e.g., picking from suggested fun facts). Do NOT include the options as a numbered list in the same message.
- Empathetic but concise tone.
- The JD context (jdSnippet) is for inspiration during Focus Layer questions; surface it as "Your JD lists X — does that resonate?" rather than dumping the JD verbatim.`,
  inputSchema: z.object({
    employeeId: z.string().describe("The ObjectId of the current employee"),
    employeeName: z.string().describe("Full name of the current employee"),
  }),
  execute: async ({ employeeId, employeeName }) => {
    if (!mongoose.isValidObjectId(employeeId)) {
      return {
        success: false,
        message: "Invalid employee ID.",
        existing: null,
        jdSnippet: null,
        employeeId,
        employeeName,
      };
    }

    await connectDB();

    const employee = await Employee.findById(employeeId).lean<{
      _id: unknown;
      profile?: Record<string, unknown>;
      jobDescriptionId?: unknown;
    }>();
    if (!employee) {
      return {
        success: false,
        message: "Employee not found.",
        existing: null,
        jdSnippet: null,
        employeeId,
        employeeName,
      };
    }

    const profile = (employee.profile ?? {}) as Record<string, unknown>;
    const gtk = (profile.getToKnow ?? {}) as Record<string, unknown>;
    const aboutMe = {
      photoBase64: (profile.photoBase64 as string | null | undefined) ?? null,
      pronouns: (profile.pronouns as string | null | undefined) ?? "",
      preferredChannel:
        (profile.preferredChannel as string | null | undefined) ?? "",
      getToKnow: {
        personalBio: (gtk.personalBio as string | undefined) ?? "",
        hobbies: (gtk.hobbies as string | undefined) ?? "",
        funFacts: Array.isArray(gtk.funFacts) ? (gtk.funFacts as string[]) : [],
        askMeAbout: (gtk.askMeAbout as string | undefined) ?? "",
        hometown: (gtk.hometown as string | undefined) ?? "",
        currentlyConsuming:
          (gtk.currentlyConsuming as string | undefined) ?? "",
        employeeChoice: {
          label:
            ((gtk.employeeChoice as Record<string, string> | undefined)
              ?.label) ?? "",
          value:
            ((gtk.employeeChoice as Record<string, string> | undefined)
              ?.value) ?? "",
        },
      },
    };

    const fl = await FocusLayer.findOne({ employeeId: employee._id }).lean<{
      responses?: Record<string, string>;
    }>();
    const focusLayer = {
      uniqueContribution: fl?.responses?.uniqueContribution ?? "",
      highImpactArea: fl?.responses?.highImpactArea ?? "",
      signatureResponsibility: fl?.responses?.signatureResponsibility ?? "",
      workingStyle: fl?.responses?.workingStyle ?? "",
    };

    let jdSnippet: {
      title: string;
      coreResponsibilities: string[];
      competencies: string[];
    } | null = null;
    if (employee.jobDescriptionId) {
      const jd = await JobDescription.findById(employee.jobDescriptionId).lean<{
        title: string;
        coreResponsibilities: string[];
        competencies: string[];
      }>();
      if (jd) {
        jdSnippet = {
          title: jd.title,
          coreResponsibilities: jd.coreResponsibilities ?? [],
          competencies: jd.competencies ?? [],
        };
      }
    }

    return {
      success: true,
      existing: { aboutMe, focusLayer },
      jdSnippet,
      employeeId,
      employeeName,
      message: `Loaded ${employeeName}'s current role. Starting with About Me.`,
    };
  },
});

// ---------------------------------------------------------------------------
// openMyRoleDocumentTool — emits the [ASCENTA_WORKING_DOC] block
// ---------------------------------------------------------------------------

export const openMyRoleDocumentTool = tool({
  description:
    "Open the My Role working document with About Me + Focus Layer prefilled. Call this at the END of the interview, not at the beginning. The user reviews and submits.",
  inputSchema: z.object({
    employeeId: z.string(),
    employeeName: z.string(),
    aboutMe: aboutMeShape,
    focusLayer: focusLayerShape,
  }),
  execute: async ({ employeeId, employeeName, aboutMe, focusLayer }) => {
    const payload = {
      action: "open_working_document" as const,
      workflowType: "build-my-role" as const,
      runId: "",
      employeeId,
      employeeName,
      prefilled: { aboutMe, focusLayer },
    };
    return {
      success: true,
      message: `Opened your role for review.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(payload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm test apps/platform/src/lib/ai/profile-tools.test.ts 2>&1 | tail -30
```

Expected: PASS for `openMyRoleDocumentTool` always; PASS for `startMyRoleWorkflowTool` if `MONGODB_URI` is set, otherwise SKIPPED.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/ai/profile-tools.ts apps/platform/src/lib/ai/profile-tools.test.ts
git commit -m "feat: add startMyRoleWorkflow + openMyRoleDocument tools"
```

---

## Task 5: Profile-tools — `suggestFromJDTool` (one-shot fast-path)

**Files:**
- Modify: `apps/platform/src/lib/ai/profile-tools.ts`
- Modify: `apps/platform/src/lib/ai/profile-tools.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `apps/platform/src/lib/ai/profile-tools.test.ts` after the existing `describe` blocks:

```ts
import { suggestFromJDTool } from "./profile-tools";

describe.skipIf(SKIP_NO_DB)("suggestFromJDTool", () => {
  it("returns success: false with a friendly message when the employee has no JD", async () => {
    await connectDB();
    const employee = await Employee.create({
      employeeId: `SUG-${Date.now()}`,
      firstName: "Sug",
      lastName: "Gest",
      email: `sug-${Date.now()}@example.com`,
      department: "Eng",
      jobTitle: "Engineer",
    });

    const result = await (suggestFromJDTool.execute as unknown as (
      args: { employeeId: string; employeeName: string },
    ) => Promise<{ success: boolean; message: string }>)({
      employeeId: String(employee._id),
      employeeName: "Sug Gest",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no job description/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm test apps/platform/src/lib/ai/profile-tools.test.ts 2>&1 | tail -20
```

Expected: FAIL — `suggestFromJDTool` not exported.

- [ ] **Step 3: Add `suggestFromJDTool` to `profile-tools.ts`**

Append to `apps/platform/src/lib/ai/profile-tools.ts` (below the existing exports):

```ts
// ---------------------------------------------------------------------------
// suggestFromJDTool — one-shot draft of Focus Layer from the assigned JD.
// Skips the interview; preserves current About Me values verbatim.
// ---------------------------------------------------------------------------

export const suggestFromJDTool = tool({
  description: `Skip the interview and draft the user's Focus Layer values directly from their assigned Job Description. Preserves current About Me. Opens the working document for review.

Call this when the user wants a quick, JD-grounded draft of their Focus Layer rather than a full interview. After this returns successfully, your text turn should say something like: "Here's what I drafted from your JD — review and submit when ready."

If the user has no JD assigned, the tool returns success: false. In that case, recommend the full Compass interview instead.`,
  inputSchema: z.object({
    employeeId: z.string(),
    employeeName: z.string(),
  }),
  execute: async ({ employeeId, employeeName }) => {
    if (!mongoose.isValidObjectId(employeeId)) {
      return {
        success: false,
        message: "Invalid employee ID.",
        workingDocBlock: null,
      };
    }

    await connectDB();
    const employee = await Employee.findById(employeeId).lean<{
      _id: unknown;
      profile?: Record<string, unknown>;
      jobDescriptionId?: unknown;
    }>();
    if (!employee) {
      return {
        success: false,
        message: "Employee not found.",
        workingDocBlock: null,
      };
    }
    if (!employee.jobDescriptionId) {
      return {
        success: false,
        message:
          "You don't have a job description assigned yet, so I can't draft your Focus Layer from it. Try Build my Role with Compass instead.",
        workingDocBlock: null,
      };
    }

    let suggestion;
    try {
      suggestion = await generateFocusLayerSuggestion(employeeId);
    } catch (err) {
      return {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Could not generate suggestions from your JD.",
        workingDocBlock: null,
      };
    }

    const profile = (employee.profile ?? {}) as Record<string, unknown>;
    const gtk = (profile.getToKnow ?? {}) as Record<string, unknown>;
    const aboutMe = {
      photoBase64: (profile.photoBase64 as string | null | undefined) ?? null,
      pronouns: (profile.pronouns as string | null | undefined) ?? "",
      preferredChannel:
        (profile.preferredChannel as string | null | undefined) ?? "",
      getToKnow: {
        personalBio: (gtk.personalBio as string | undefined) ?? "",
        hobbies: (gtk.hobbies as string | undefined) ?? "",
        funFacts: Array.isArray(gtk.funFacts) ? (gtk.funFacts as string[]) : [],
        askMeAbout: (gtk.askMeAbout as string | undefined) ?? "",
        hometown: (gtk.hometown as string | undefined) ?? "",
        currentlyConsuming:
          (gtk.currentlyConsuming as string | undefined) ?? "",
        employeeChoice: {
          label:
            ((gtk.employeeChoice as Record<string, string> | undefined)
              ?.label) ?? "",
          value:
            ((gtk.employeeChoice as Record<string, string> | undefined)
              ?.value) ?? "",
        },
      },
    };

    const payload = {
      action: "open_working_document" as const,
      workflowType: "build-my-role" as const,
      runId: "",
      employeeId,
      employeeName,
      prefilled: { aboutMe, focusLayer: suggestion },
    };

    return {
      success: true,
      message: `Drafted your Focus Layer from your JD. Review and submit when ready.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(payload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm test apps/platform/src/lib/ai/profile-tools.test.ts 2>&1 | tail -20
```

Expected: PASS or SKIPPED (when `MONGODB_URI` not set).

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/ai/profile-tools.ts apps/platform/src/lib/ai/profile-tools.test.ts
git commit -m "feat: add suggestFromJD compass tool"
```

---

## Task 6: JD-tools — `startJobDescriptionWorkflowTool` + `openJobDescriptionDocumentTool`

**Files:**
- Create: `apps/platform/src/lib/ai/job-description-tools.ts`
- Test: `apps/platform/src/lib/ai/job-description-tools.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/platform/src/lib/ai/job-description-tools.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import {
  startJobDescriptionWorkflowTool,
  openJobDescriptionDocumentTool,
} from "./job-description-tools";

const SKIP_NO_DB = !process.env.MONGODB_URI;

describe.skipIf(SKIP_NO_DB)("startJobDescriptionWorkflowTool", () => {
  let jdId: string;

  beforeAll(async () => {
    await connectDB();
    const jd = await JobDescription.create({
      title: "Staff Engineer",
      department: "Platform",
      level: "senior",
      employmentType: "full_time",
      roleSummary: "Owns platform reliability.",
      coreResponsibilities: ["Drive incident response"],
      requiredQualifications: ["8+ yrs"],
      preferredQualifications: ["Distributed systems"],
      competencies: ["Mentorship"],
      status: "published",
    });
    jdId = String(jd._id);
  });

  it("returns null existing + option lists when called without jdId", async () => {
    const result = await (
      startJobDescriptionWorkflowTool.execute as unknown as (args: {
        jdId?: string;
      }) => Promise<{
        success: boolean;
        existing: unknown;
        levelOptions: string[];
        employmentTypeOptions: string[];
      }>
    )({});
    expect(result.success).toBe(true);
    expect(result.existing).toBeNull();
    expect(result.levelOptions.length).toBeGreaterThan(0);
    expect(result.employmentTypeOptions.length).toBeGreaterThan(0);
  });

  it("loads existing JD when jdId is provided", async () => {
    const result = await (
      startJobDescriptionWorkflowTool.execute as unknown as (args: {
        jdId?: string;
      }) => Promise<{
        success: boolean;
        existing: { title: string } | null;
      }>
    )({ jdId });
    expect(result.success).toBe(true);
    expect(result.existing?.title).toBe("Staff Engineer");
  });
});

describe("openJobDescriptionDocumentTool", () => {
  it("emits a [ASCENTA_WORKING_DOC] with mode=create when no jdId", async () => {
    const result = await (
      openJobDescriptionDocumentTool.execute as unknown as (args: {
        title: string;
        department: string;
        level: string;
        employmentType: string;
        roleSummary: string;
        coreResponsibilities: string[];
        requiredQualifications: string[];
        preferredQualifications: string[];
        competencies: string[];
        status: string;
      }) => Promise<{ workingDocBlock: string }>
    )({
      title: "New Role",
      department: "Eng",
      level: "mid",
      employmentType: "full_time",
      roleSummary: "Builds things.",
      coreResponsibilities: ["Ship code"],
      requiredQualifications: ["3+ yrs"],
      preferredQualifications: [],
      competencies: ["Communication"],
      status: "published",
    });

    const json = result.workingDocBlock.match(
      /\[ASCENTA_WORKING_DOC\]([\s\S]+?)\[\/ASCENTA_WORKING_DOC\]/,
    )?.[1];
    const parsed = JSON.parse(json ?? "{}");
    expect(parsed.workflowType).toBe("create-job-description");
    expect(parsed.prefilled.mode).toBe("create");
    expect(parsed.prefilled.title).toBe("New Role");
  });

  it("emits mode=edit with jdId when jdId is provided", async () => {
    const result = await (
      openJobDescriptionDocumentTool.execute as unknown as (args: {
        jdId?: string;
        title: string;
        department: string;
        level: string;
        employmentType: string;
        roleSummary: string;
        coreResponsibilities: string[];
        requiredQualifications: string[];
        preferredQualifications: string[];
        competencies: string[];
        status: string;
      }) => Promise<{ workingDocBlock: string }>
    )({
      jdId: "abc123",
      title: "Existing Role",
      department: "Eng",
      level: "senior",
      employmentType: "full_time",
      roleSummary: "Refined.",
      coreResponsibilities: ["Ship code"],
      requiredQualifications: ["5+ yrs"],
      preferredQualifications: [],
      competencies: ["Mentorship"],
      status: "published",
    });

    const json = result.workingDocBlock.match(
      /\[ASCENTA_WORKING_DOC\]([\s\S]+?)\[\/ASCENTA_WORKING_DOC\]/,
    )?.[1];
    const parsed = JSON.parse(json ?? "{}");
    expect(parsed.prefilled.mode).toBe("edit");
    expect(parsed.prefilled.jdId).toBe("abc123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm test apps/platform/src/lib/ai/job-description-tools.test.ts 2>&1 | tail -20
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `job-description-tools.ts`**

Create `apps/platform/src/lib/ai/job-description-tools.ts`:

```ts
/**
 * Job Description AI tools — Compass interview to build or refine a JD.
 */

import { z } from "zod";
import { tool } from "ai";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@ascenta/db/job-description-constants";
import { WORKING_DOC_PREFIX, WORKING_DOC_SUFFIX } from "./workflow-constants";

const jdInputShape = z.object({
  jdId: z.string().optional(),
  title: z.string().min(2),
  department: z.string().min(1),
  level: z.enum(LEVEL_OPTIONS),
  employmentType: z.enum(EMPLOYMENT_TYPE_OPTIONS),
  roleSummary: z.string().min(20),
  coreResponsibilities: z.array(z.string()).min(1),
  requiredQualifications: z.array(z.string()).min(1),
  preferredQualifications: z.array(z.string()),
  competencies: z.array(z.string()).min(1),
  status: z.enum(STATUS_OPTIONS).default("published"),
});

// ---------------------------------------------------------------------------
// startJobDescriptionWorkflowTool — interview, handles new + refine
// ---------------------------------------------------------------------------

export const startJobDescriptionWorkflowTool = tool({
  description: `Start a Job Description compass session. If jdId is provided, this is REFINE mode (load existing JD); otherwise NEW mode (start fresh).

After calling this tool, walk the user through the JD section-by-section, ONE QUESTION AT A TIME:

1. Title (e.g., "Staff Software Engineer")
2. Department
3. Level — present an [ASCENTA_OPTIONS] block with the level options from the tool response
4. Employment type — [ASCENTA_OPTIONS] with the employment type options
5. Role summary (3-5 sentences — the "what this role exists to do")
6. Core responsibilities — collect bullets one at a time. After each, ask "Any more?" Stop when the user says no.
7. Required qualifications — same one-at-a-time bullet pattern
8. Preferred qualifications — same pattern; user can skip with "none"
9. Competencies — same one-at-a-time bullet pattern (≥1)

In REFINE mode, for EACH section:
- Restate the existing value or list.
- Present [ASCENTA_OPTIONS] with ["Keep it", "Refine it", "Replace it"].
- "Refine" → ask follow-ups; "Replace" → ask the question fresh; "Keep" → move on.

When all sections are covered, call openJobDescriptionDocument with the full payload (including jdId if refining).

RULES:
- One question at a time.
- Use [ASCENTA_OPTIONS] for level, employment type, and keep/refine/replace prompts.
- Don't enumerate the option list as text in the same message.`,
  inputSchema: z.object({
    jdId: z.string().optional().describe(
      "ObjectId of an existing job description to refine. Omit for a new JD.",
    ),
  }),
  execute: async ({ jdId }) => {
    const levelOptions = [...LEVEL_OPTIONS];
    const employmentTypeOptions = [...EMPLOYMENT_TYPE_OPTIONS];
    const statusOptions = [...STATUS_OPTIONS];

    if (!jdId) {
      return {
        success: true,
        existing: null,
        levelOptions,
        employmentTypeOptions,
        statusOptions,
        levelLabels: LEVEL_LABELS,
        employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
        statusLabels: STATUS_LABELS,
        message: "Starting a new job description.",
      };
    }

    if (!mongoose.isValidObjectId(jdId)) {
      return {
        success: false,
        existing: null,
        levelOptions,
        employmentTypeOptions,
        statusOptions,
        levelLabels: LEVEL_LABELS,
        employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
        statusLabels: STATUS_LABELS,
        message: "Invalid job description ID.",
      };
    }

    await connectDB();
    const jd = await JobDescription.findById(jdId).lean<{
      _id: unknown;
      title: string;
      department: string;
      level: string;
      employmentType: string;
      roleSummary: string;
      coreResponsibilities: string[];
      requiredQualifications: string[];
      preferredQualifications: string[];
      competencies: string[];
      status: string;
    }>();
    if (!jd) {
      return {
        success: false,
        existing: null,
        levelOptions,
        employmentTypeOptions,
        statusOptions,
        levelLabels: LEVEL_LABELS,
        employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
        statusLabels: STATUS_LABELS,
        message: "Job description not found.",
      };
    }

    return {
      success: true,
      existing: {
        jdId: String(jd._id),
        title: jd.title,
        department: jd.department,
        level: jd.level,
        employmentType: jd.employmentType,
        roleSummary: jd.roleSummary,
        coreResponsibilities: jd.coreResponsibilities ?? [],
        requiredQualifications: jd.requiredQualifications ?? [],
        preferredQualifications: jd.preferredQualifications ?? [],
        competencies: jd.competencies ?? [],
        status: jd.status,
      },
      levelOptions,
      employmentTypeOptions,
      statusOptions,
      levelLabels: LEVEL_LABELS,
      employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
      statusLabels: STATUS_LABELS,
      message: `Refining "${jd.title}".`,
    };
  },
});

// ---------------------------------------------------------------------------
// openJobDescriptionDocumentTool — emits the [ASCENTA_WORKING_DOC] block
// ---------------------------------------------------------------------------

export const openJobDescriptionDocumentTool = tool({
  description:
    "Open the Job Description working document with all fields prefilled. Call at the END of the interview. Pass jdId iff refining an existing JD.",
  inputSchema: jdInputShape,
  execute: async (params) => {
    const mode = params.jdId ? "edit" : "create";
    const { jdId, ...rest } = params;
    const payload = {
      action: "open_working_document" as const,
      workflowType: "create-job-description" as const,
      runId: "",
      employeeId: "",
      employeeName: "",
      prefilled: {
        ...rest,
        mode,
        ...(jdId ? { jdId } : {}),
      },
    };

    return {
      success: true,
      message:
        mode === "edit"
          ? `Opened "${params.title}" for review.`
          : `Opened the new job description for review.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(payload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm test apps/platform/src/lib/ai/job-description-tools.test.ts 2>&1 | tail -20
```

Expected: PASS (or SKIPPED for the DB-gated cases without `MONGODB_URI`).

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/lib/ai/job-description-tools.ts apps/platform/src/lib/ai/job-description-tools.test.ts
git commit -m "feat: add job description compass tools"
```

---

## Task 7: Register tools + update prompts

**Files:**
- Modify: `apps/platform/src/lib/ai/tools.ts`
- Modify: `apps/platform/src/lib/ai/prompts.ts`

- [ ] **Step 1: Add imports + register the 5 new tools**

In `apps/platform/src/lib/ai/tools.ts`, after the existing grow-tools import (around line 17), add:

```ts
import {
  startMyRoleWorkflowTool,
  openMyRoleDocumentTool,
  suggestFromJDTool,
} from "./profile-tools";
import {
  startJobDescriptionWorkflowTool,
  openJobDescriptionDocumentTool,
} from "./job-description-tools";
```

Then, in the `defaultChatTools` object (around line 234), add the new entries:

old:
```ts
export const defaultChatTools = {
  searchKnowledgeBase: searchKnowledgeBaseTool,
  createTask: createTaskTool,
  getEmployeeInfo: getEmployeeInfoTool,
  startCorrectiveAction: startCorrectiveActionTool,
  updateWorkflowField: updateWorkflowFieldTool,
  generateCorrectiveActionDocument: generateCorrectiveActionDocumentTool,
  generateWorkflowFollowUp: generateWorkflowFollowUpTool,
  startGoalWorkflow: startGoalWorkflowTool,
  openGoalDocument: openGoalDocumentTool,
  startCheckIn: startCheckInTool,
  startPerformanceNote: startPerformanceNoteTool,
  completeGrowWorkflow: completeGrowWorkflowTool,
};
```
new:
```ts
export const defaultChatTools = {
  searchKnowledgeBase: searchKnowledgeBaseTool,
  createTask: createTaskTool,
  getEmployeeInfo: getEmployeeInfoTool,
  startCorrectiveAction: startCorrectiveActionTool,
  updateWorkflowField: updateWorkflowFieldTool,
  generateCorrectiveActionDocument: generateCorrectiveActionDocumentTool,
  generateWorkflowFollowUp: generateWorkflowFollowUpTool,
  startGoalWorkflow: startGoalWorkflowTool,
  openGoalDocument: openGoalDocumentTool,
  startCheckIn: startCheckInTool,
  startPerformanceNote: startPerformanceNoteTool,
  completeGrowWorkflow: completeGrowWorkflowTool,
  startMyRoleWorkflow: startMyRoleWorkflowTool,
  openMyRoleDocument: openMyRoleDocumentTool,
  suggestFromJD: suggestFromJDTool,
  startJobDescriptionWorkflow: startJobDescriptionWorkflowTool,
  openJobDescriptionDocument: openJobDescriptionDocumentTool,
};
```

- [ ] **Step 2: Add prompt guidance**

Read `apps/platform/src/lib/ai/prompts.ts` to find a good insertion point (search for the existing tool guidance block, e.g., the "5. For goal creation" line). Append the following bullets after the existing tool guidance, in the same numbered list or as a new section:

```ts
// (in the system prompt template)
6. For "build my role" / "shape my role" / similar requests: call startMyRoleWorkflow with the current employee's id + name. Walk About Me FIRST, then Focus Layer. At the end, call openMyRoleDocument.
7. For "suggest my role from my JD" / "draft Focus Layer from JD": call suggestFromJD with the current employee. It opens the working document directly.
8. For "create a job description" / "build a JD": call startJobDescriptionWorkflow (no jdId for new). For "refine this JD": call startJobDescriptionWorkflow with the jdId. At the end, call openJobDescriptionDocument with all fields (and jdId if refining).
```

If `prompts.ts` uses a different format (e.g., a single template literal), interleave the bullets in the same style as the existing entries 1–5. The key is that the AI knows when to call each tool. Be sure to mention:
- About Me first, Focus Layer second for `startMyRoleWorkflow`.
- Don't restate option lists as text when emitting `[ASCENTA_OPTIONS]` blocks.

- [ ] **Step 3: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/lib/ai/tools.ts apps/platform/src/lib/ai/prompts.ts
git commit -m "feat: register My Role + JD compass tools"
```

---

## Task 8: My Role working-document form (`<MyRoleWorkingDocument>`)

**Files:**
- Create: `apps/platform/src/components/plan/profile/my-role-working-document.tsx`

- [ ] **Step 1: Create the component**

Create `apps/platform/src/components/plan/profile/my-role-working-document.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import {
  profilePatchSchema,
  type ProfilePatchInput,
} from "@/lib/validations/employee-profile";
import { GET_TO_KNOW_FIELDS } from "@ascenta/db/employee-profile-constants";
import { FOCUS_LAYER_PROMPTS } from "@ascenta/db/focus-layer-constants";
import { ProfilePhotoInput } from "./profile-photo-input";
import { FunFactsField } from "./fun-facts-field";

const focusLayerSchema = z.object({
  uniqueContribution: z.string().trim().max(2000).default(""),
  highImpactArea: z.string().trim().max(2000).default(""),
  signatureResponsibility: z.string().trim().max(2000).default(""),
  workingStyle: z.string().trim().max(2000).default(""),
});

const formSchema = z.object({
  aboutMe: profilePatchSchema,
  focusLayer: focusLayerSchema,
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  initialValues: Record<string, unknown>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: FormValues = {
  aboutMe: {
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
  },
  focusLayer: {
    uniqueContribution: "",
    highImpactArea: "",
    signatureResponsibility: "",
    workingStyle: "",
  },
};

function withDefaults(initial: Record<string, unknown>): FormValues {
  const merged = { ...EMPTY_VALUES };
  if (initial.aboutMe) {
    merged.aboutMe = {
      ...EMPTY_VALUES.aboutMe,
      ...(initial.aboutMe as Partial<ProfilePatchInput>),
      getToKnow: {
        ...EMPTY_VALUES.aboutMe.getToKnow,
        ...((initial.aboutMe as { getToKnow?: Record<string, unknown> })
          .getToKnow ?? {}),
      } as ProfilePatchInput["getToKnow"],
    };
  }
  if (initial.focusLayer) {
    merged.focusLayer = {
      ...EMPTY_VALUES.focusLayer,
      ...(initial.focusLayer as Record<string, string>),
    };
  }
  return merged;
}

export function MyRoleWorkingDocument({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: Props) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: withDefaults(initialValues),
    mode: "onChange",
  });
  const { register, watch, setValue, handleSubmit, reset, formState } = methods;

  // Sync incoming AI-driven updates (chat-context's update_working_document
  // patches `aboutMe` / `focusLayer` keys directly).
  useEffect(() => {
    reset(withDefaults(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  // Bubble field changes back up so the working-doc state stays in sync (used
  // by chat-context for the [ASCENTA_WORKING_DOC] update path).
  useEffect(() => {
    const sub = watch((values) => {
      onFieldChange("aboutMe", values.aboutMe);
      onFieldChange("focusLayer", values.focusLayer);
    });
    return () => sub.unsubscribe();
  }, [watch, onFieldChange]);

  const photo = watch("aboutMe.photoBase64") ?? null;

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-8"
        onSubmit={handleSubmit(async () => {
          await onSubmit();
        })}
      >
        <section className="space-y-4">
          <h3 className="font-display text-base font-semibold">About Me</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profile photo</label>
            <ProfilePhotoInput
              value={photo}
              onChange={(v) =>
                setValue("aboutMe.photoBase64", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Pronouns</label>
              <Input
                {...register("aboutMe.pronouns")}
                placeholder="she/her, they/them, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Preferred contact</label>
              <Input
                {...register("aboutMe.preferredChannel")}
                placeholder="Slack: @jane"
              />
            </div>
            {GET_TO_KNOW_FIELDS.map((f) => (
              <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
                <label className="text-sm font-medium">{f.label}</label>
                <p className="text-xs text-muted-foreground">{f.helper}</p>
                {f.multiline ? (
                  <Textarea
                    rows={3}
                    placeholder={f.placeholder}
                    {...register(`aboutMe.getToKnow.${f.key}` as never)}
                  />
                ) : (
                  <Input
                    placeholder={f.placeholder}
                    {...register(`aboutMe.getToKnow.${f.key}` as never)}
                  />
                )}
              </div>
            ))}
          </div>

          <FunFactsField name="aboutMe.getToKnow.funFacts" />

          <div className="rounded-lg border border-dashed p-4 space-y-2">
            <label className="text-sm font-medium">Employee choice field</label>
            <p className="text-xs text-muted-foreground">
              Pick a label and tell us about it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                {...register("aboutMe.getToKnow.employeeChoice.label")}
                placeholder="Field name"
              />
              <div className="md:col-span-2">
                <Input
                  {...register("aboutMe.getToKnow.employeeChoice.value")}
                  placeholder="Field content"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-base font-semibold">Focus Layer</h3>
          {FOCUS_LAYER_PROMPTS.map((p) => (
            <div key={p.key} className="space-y-1">
              <label className="text-sm font-medium">{p.label}</label>
              <p className="text-xs text-muted-foreground">{p.helper}</p>
              <Textarea
                rows={4}
                placeholder={
                  p.placeholder || "Take a few sentences to share your perspective..."
                }
                {...register(`focusLayer.${p.key}` as never)}
              />
            </div>
          ))}
        </section>

        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors. (The component isn't yet wired in `working-document.tsx`; that happens in Task 10.)

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/profile/my-role-working-document.tsx
git commit -m "feat: add MyRoleWorkingDocument form component"
```

---

## Task 9: JD working-document form (`<JdWorkingDocument>`)

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/jd-working-document.tsx`

- [ ] **Step 1: Create the component**

Create `apps/platform/src/components/plan/job-descriptions/jd-working-document.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobDescriptionInputSchema,
  type JobDescriptionInput,
} from "@/lib/validations/job-description";
import { Button } from "@ascenta/ui/button";
import { JdFormBody } from "./jd-form-body";

interface Props {
  initialValues: Record<string, unknown>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const EMPTY: JobDescriptionInput = {
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

function withDefaults(initial: Record<string, unknown>): JobDescriptionInput {
  return {
    ...EMPTY,
    ...(initial as Partial<JobDescriptionInput>),
  };
}

export function JdWorkingDocument({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: Props) {
  const mode = ((initialValues.mode as string) ?? "create") === "edit"
    ? "edit"
    : "create";

  const methods = useForm<JobDescriptionInput>({
    resolver: zodResolver(jobDescriptionInputSchema) as unknown as Resolver<JobDescriptionInput>,
    defaultValues: withDefaults(initialValues),
    mode: "onSubmit",
  });
  const { handleSubmit, watch, reset, formState } = methods;

  useEffect(() => {
    reset(withDefaults(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  useEffect(() => {
    const sub = watch((values) => {
      // Bubble each top-level field up so AI updates can be reapplied.
      for (const [k, v] of Object.entries(values)) {
        onFieldChange(k, v);
      }
    });
    return () => sub.unsubscribe();
  }, [watch, onFieldChange]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(async () => {
          await onSubmit();
        })}
        className="flex flex-col gap-6"
        aria-label={
          mode === "create"
            ? "Create Job Description"
            : "Refine Job Description"
        }
      >
        <JdFormBody />

        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Create"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/jd-working-document.tsx
git commit -m "feat: add JdWorkingDocument form component"
```

---

## Task 10: Wire new working-doc forms into the side-panel renderer

**Files:**
- Modify: `apps/platform/src/components/grow/working-document.tsx`

- [ ] **Step 1: Add the title entries**

Edit `apps/platform/src/components/grow/working-document.tsx`. In the `WORKFLOW_TITLES` map (around line 18), add:

old:
```ts
const WORKFLOW_TITLES: Record<WorkflowType, string> = {
  "create-goal": "Create Goal",
  "run-check-in": "Run Check-in",
  "add-performance-note": "Performance Note",
  "build-mvv": "Mission, Vision & Values",
  "strategy-breakdown": "Strategy Brief",
  "performance-review": "Performance Review",
};
```
new:
```ts
const WORKFLOW_TITLES: Record<WorkflowType, string> = {
  "create-goal": "Create Goal",
  "run-check-in": "Run Check-in",
  "add-performance-note": "Performance Note",
  "build-mvv": "Mission, Vision & Values",
  "strategy-breakdown": "Strategy Brief",
  "performance-review": "Performance Review",
  "build-my-role": "My Role",
  "create-job-description": "Job Description",
};
```

- [ ] **Step 2: Add the imports**

Add to the import block at the top of the file:

```tsx
import { MyRoleWorkingDocument } from "@/components/plan/profile/my-role-working-document";
import { JdWorkingDocument } from "@/components/plan/job-descriptions/jd-working-document";
```

- [ ] **Step 3: Add the render branches**

Inside the `{/* Scrollable form content */}` div, after the `performance-review` branch and before the closing `</div>`, add:

```tsx
          {workingDocument.workflowType === "build-my-role" && (
            <MyRoleWorkingDocument
              initialValues={workingDocument.fields}
              onFieldChange={updateWorkingDocumentField}
              onSubmit={handleSubmit}
              onCancel={closeWorkingDocument}
            />
          )}

          {workingDocument.workflowType === "create-job-description" && (
            <JdWorkingDocument
              initialValues={workingDocument.fields}
              onFieldChange={updateWorkingDocumentField}
              onSubmit={handleSubmit}
              onCancel={closeWorkingDocument}
            />
          )}
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/grow/working-document.tsx
git commit -m "feat: render MyRole and JD working documents in side panel"
```

---

## Task 11: My Role page — Compass cards + read view + Edit toggle

**Files:**
- Modify: `apps/platform/src/components/plan/my-role-tab.tsx`
- Modify: `apps/platform/src/components/plan/focus-layer/focus-layer-form.tsx` (remove `AiSuggestButton`)
- Delete: `apps/platform/src/components/plan/focus-layer/ai-suggest-button.tsx`
- Modify: `apps/platform/src/components/plan/focus-layer/focus-layer-section.tsx` (no longer needs the JD-assigned check; the new card in `my-role-tab.tsx` handles that)
- Modify: `apps/platform/src/components/plan/profile/profile-edit-section.tsx` (no public API change; just a sanity pass)

**Note:** This is the largest task. It restructures `my-role-tab.tsx`. The existing edit forms (`ProfileEditForm`, `FocusLayerForm`) are reused via toggle.

- [ ] **Step 1: Remove the in-form `AiSuggestButton`**

Edit `apps/platform/src/components/plan/focus-layer/focus-layer-form.tsx`:

old (the import line near the top):
```tsx
import { AiSuggestButton } from "./ai-suggest-button";
```
new: (remove the line)

old (the entire `<div className="flex items-center justify-between mb-4">` block, currently around lines 102–121, which renders the status pill + saving indicator + AiSuggestButton):
```tsx
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
```
new:
```tsx
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FocusLayerStatusPill status={status} />
          <span className="text-xs text-muted-foreground">
            {savingState === "saving" ? "Saving..." : savingState === "saved" ? "Saved" : ""}
          </span>
        </div>
      </div>
```

The `reset` import from react-hook-form is still used by other call sites — check. If `reset` is now unused in this file, remove it from the destructuring on line 42.

- [ ] **Step 2: Delete the orphan file**

```bash
git rm apps/platform/src/components/plan/focus-layer/ai-suggest-button.tsx
```

- [ ] **Step 3: Replace `my-role-tab.tsx` with the new layout**

Replace the entire contents of `apps/platform/src/components/plan/my-role-tab.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { FocusLayerSection } from "@/components/plan/focus-layer/focus-layer-section";
import { FocusLayerReadView } from "@/components/plan/focus-layer/focus-layer-read-view";
import { FocusLayerStatusPill } from "@/components/plan/focus-layer/focus-layer-status-pill";
import { ProfileEditSection } from "@/components/plan/profile/profile-edit-section";
import { DownloadOrgSnapshotButton } from "@/components/plan/profile/download-org-snapshot-button";
import { GET_TO_KNOW_FIELDS } from "@ascenta/db/employee-profile-constants";

interface ProfileSnapshot {
  photoBase64?: string | null;
  pronouns?: string | null;
  preferredChannel?: string | null;
  getToKnow?: Record<string, unknown>;
}

interface FocusLayerSnapshot {
  responses: Record<string, string>;
  status: "draft" | "submitted" | "confirmed";
  jobDescriptionAssigned: boolean;
}

const PLAN_ACCENT = "#6688bb";
const COMPASS_ORANGE = "#ff6b35";

export function MyRoleTab() {
  const { user, loading } = useAuth();
  const [editAboutMe, setEditAboutMe] = useState(false);
  const [editFocusLayer, setEditFocusLayer] = useState(false);
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [fl, setFl] = useState<FocusLayerSnapshot | null>(null);

  async function load(employeeId: string) {
    const [profileRes, flRes, empRes] = await Promise.all([
      fetch(`/api/employees/${employeeId}/profile`),
      fetch(`/api/focus-layers/${employeeId}`),
      fetch(`/api/dashboard/employees/${employeeId}`).catch(() => null),
    ]);
    const profileJson = await profileRes.json();
    const flJson = await flRes.json();
    const empJson = empRes ? await empRes.json().catch(() => ({})) : {};
    setProfile(profileJson.profile ?? {});
    setFl({
      responses: flJson.focusLayer?.responses ?? {
        uniqueContribution: "",
        highImpactArea: "",
        signatureResponsibility: "",
        workingStyle: "",
      },
      status: flJson.focusLayer?.status ?? "draft",
      jobDescriptionAssigned: !!empJson?.employee?.jobDescriptionId,
    });
  }

  useEffect(() => {
    if (user?.id) load(user.id);
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading your role...</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Sign in to edit your role.
        </p>
      </div>
    );
  }

  const compassHref = `/do?prompt=${encodeURIComponent("Help me build my role")}&tool=startMyRoleWorkflow`;
  const suggestHref = `/do?prompt=${encodeURIComponent("Suggest my Focus Layer from my JD")}&tool=suggestFromJD`;
  const aboutMeHasContent =
    !!profile &&
    [
      profile.pronouns,
      profile.preferredChannel,
      ...Object.values((profile.getToKnow ?? {}) as Record<string, unknown>),
    ].some(
      (v) =>
        (typeof v === "string" && v.trim().length > 0) ||
        (Array.isArray(v) && v.some((s) => typeof s === "string" && s.trim())),
    );
  const flHasContent =
    !!fl && Object.values(fl.responses).some((v) => v && v.trim().length > 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold">My Role</h2>
          <p className="text-sm text-muted-foreground">
            {user.name} · {user.title} · {user.department}
          </p>
        </div>
        <DownloadOrgSnapshotButton employeeId={user.id} />
      </header>

      {/* Compass cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={compassHref}
          className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
          style={{
            borderColor: "rgba(255, 107, 53, 0.3)",
            background: "rgba(255, 107, 53, 0.03)",
          }}
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
          >
            <Compass className="size-[18px]" style={{ color: COMPASS_ORANGE }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-deep-blue">
              Build my Role with Compass
            </p>
            <p className="text-xs text-muted-foreground truncate">
              AI-guided interview to shape your role
            </p>
          </div>
        </Link>

        {fl?.jobDescriptionAssigned ? (
          <Link
            href={suggestHref}
            className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
            style={{
              borderColor: `${PLAN_ACCENT}4d`,
              background: `${PLAN_ACCENT}08`,
            }}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${PLAN_ACCENT}1a` }}
            >
              <Sparkles className="size-[18px]" style={{ color: PLAN_ACCENT }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-deep-blue">
                Suggest from my JD
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Draft your Focus Layer from your assigned JD
              </p>
            </div>
          </Link>
        ) : (
          <div
            className="flex items-center gap-3 rounded-xl border p-4 opacity-60 cursor-not-allowed"
            title="No job description is assigned to you yet"
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${PLAN_ACCENT}1a` }}
            >
              <Sparkles className="size-[18px]" style={{ color: PLAN_ACCENT }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-deep-blue">
                Suggest from my JD
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Available once a JD is assigned to you
              </p>
            </div>
          </div>
        )}
      </div>

      {/* About Me */}
      <section className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">About Me</h3>
          <button
            onClick={() => setEditAboutMe((v) => !v)}
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-3.5" />
            {editAboutMe ? "Done" : "Edit"}
          </button>
        </div>

        {editAboutMe ? (
          <ProfileEditSection employeeId={user.id} />
        ) : aboutMeHasContent ? (
          <AboutMeReadView profile={profile ?? {}} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No About Me yet — start with Compass or click Edit.
          </p>
        )}
      </section>

      {/* Focus Layer */}
      <section className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold">Focus Layer</h3>
            {fl && <FocusLayerStatusPill status={fl.status} />}
          </div>
          <button
            onClick={() => setEditFocusLayer((v) => !v)}
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-3.5" />
            {editFocusLayer ? "Done" : "Edit"}
          </button>
        </div>

        {editFocusLayer ? (
          <FocusLayerSection employeeId={user.id} mode="edit" />
        ) : flHasContent && fl ? (
          <FocusLayerReadView responses={fl.responses} status={fl.status} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No Focus Layer yet — start with Compass or click Edit.
          </p>
        )}
      </section>
    </div>
  );
}

function AboutMeReadView({ profile }: { profile: ProfileSnapshot }) {
  const gtk = (profile.getToKnow ?? {}) as Record<string, unknown>;
  const funFacts = Array.isArray(gtk.funFacts)
    ? (gtk.funFacts as string[]).filter((s) => s && s.trim().length > 0)
    : [];
  const choice = gtk.employeeChoice as
    | { label?: string; value?: string }
    | undefined;
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {profile.pronouns && (
          <Row label="Pronouns" value={profile.pronouns} />
        )}
        {profile.preferredChannel && (
          <Row label="Preferred contact" value={profile.preferredChannel} />
        )}
        {GET_TO_KNOW_FIELDS.map((f) => {
          const v = gtk[f.key];
          if (typeof v !== "string" || !v.trim()) return null;
          return (
            <Row
              key={f.key}
              label={f.label}
              value={v}
              full={!!f.multiline}
            />
          );
        })}
      </div>
      {funFacts.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Fun facts
          </p>
          <ul className="list-disc pl-5 text-sm space-y-0.5">
            {funFacts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {choice?.label && choice?.value && (
        <Row label={choice.label} value={choice.value} full />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: My Role page — Compass cards + read view + Edit toggle"
```

---

## Task 12: JD library page — Compass cards + JD picker dialog

**Files:**
- Create: `apps/platform/src/components/plan/job-descriptions/jd-picker-dialog.tsx`
- Modify: `apps/platform/src/components/plan/job-descriptions/library-view.tsx`

- [ ] **Step 1: Create the JD picker dialog**

Create `apps/platform/src/components/plan/job-descriptions/jd-picker-dialog.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/dialog";
import { Input } from "@ascenta/ui/input";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JdPickerDialog({ open, onOpenChange }: Props) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ListedJobDescription[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  async function fetchList(query: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("status", "published");
      const res = await fetch(`/api/job-descriptions?${params.toString()}`);
      const json = await res.json();
      setItems(json.jobDescriptions ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchList(q), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, open]);

  function pick(item: ListedJobDescription) {
    const params = new URLSearchParams({
      prompt: `Refine "${item.title}"`,
      tool: "startJobDescriptionWorkflow",
      jobDescriptionId: item.id,
    });
    onOpenChange(false);
    router.push(`/do?${params.toString()}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Refine an existing JD</DialogTitle>
          <DialogDescription>
            Pick a job description to refine with Compass.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search by title or department..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-[320px] overflow-y-auto -mx-2 mt-2">
          {loading && (
            <p className="text-sm text-muted-foreground px-2 py-1">
              Loading...
            </p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-1">
              No matches.
            </p>
          )}
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => pick(it)}
              className="w-full text-left rounded-md px-2 py-2 hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm font-medium">{it.title}</p>
              <p className="text-xs text-muted-foreground">{it.department}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Add Compass cards to `library-view.tsx`**

Edit `apps/platform/src/components/plan/job-descriptions/library-view.tsx`:

old (the imports block — append two new imports):
```tsx
import { Plus, Upload } from "lucide-react";
```
new:
```tsx
import { Plus, Upload, Compass, Wrench } from "lucide-react";
import Link from "next/link";
import { JdPickerDialog } from "./jd-picker-dialog";
```

old (the `[importOpen, setImportOpen]` line — add a new `pickerOpen` state below it):
```tsx
  const [importOpen, setImportOpen] = useState(false);
```
new:
```tsx
  const [importOpen, setImportOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
```

old (the `<header>` block + filter bar — add the Compass cards between them):
```tsx
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
```
new:
```tsx
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

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/do?prompt=${encodeURIComponent("Help me build a job description")}&tool=startJobDescriptionWorkflow`}
          className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
          style={{
            borderColor: "rgba(255, 107, 53, 0.3)",
            background: "rgba(255, 107, 53, 0.03)",
          }}
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
          >
            <Compass className="size-[18px]" style={{ color: "#ff6b35" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-deep-blue">
              Build a JD with Compass
            </p>
            <p className="text-xs text-muted-foreground truncate">
              AI-guided JD creation
            </p>
          </div>
        </Link>

        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md text-left"
          style={{
            borderColor: "rgba(102, 136, 187, 0.3)",
            background: "rgba(102, 136, 187, 0.03)",
          }}
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(102, 136, 187, 0.1)" }}
          >
            <Wrench className="size-[18px]" style={{ color: "#6688bb" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-deep-blue">
              Refine an existing JD
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Polish or expand any JD in your library
            </p>
          </div>
        </button>
      </div>

      <LibraryFilterBar
```

old (right before the closing `</div>` of the outer container — `<JdImportStubDialog .../>`):
```tsx
      <JdImportStubDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
```
new:
```tsx
      <JdImportStubDialog open={importOpen} onOpenChange={setImportOpen} />
      <JdPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/plan/job-descriptions/jd-picker-dialog.tsx apps/platform/src/components/plan/job-descriptions/library-view.tsx
git commit -m "feat: JD library — Compass cards + refine picker"
```

---

## Task 13: `/do` page seeding — pass `jobDescriptionId` through

**Files:**
- Modify: `apps/platform/src/app/do/page.tsx`

**Why:** The "Refine an existing JD" card adds `?jobDescriptionId=...`. The `/do` page seeds the chat input but currently only forwards `outcomeText/strategyGoalId/...`. We need to forward the new param into the initial tool call so the AI sees the right `jdId`.

- [ ] **Step 1: Read current `/do/page.tsx` to find the right insertion points**

Read the file to confirm the existing seeding code shape — `searchParams.get(...)` for `prompt/tool/outcomeText/...` and `sendMessage("do", prompt, toolKey, employeeInfo, outcomeCtx)`.

- [ ] **Step 2: Forward `jobDescriptionId` into the initial message**

Edit `apps/platform/src/app/do/page.tsx`. After the existing `const contributionRef = searchParams.get("contributionRef");` line, add:

```tsx
    const jobDescriptionId = searchParams.get("jobDescriptionId");
```

The `chat-context.sendMessage` signature does not currently accept a JD-id context object. We pass it via the prompt: when the URL has `tool=startJobDescriptionWorkflow` and `jobDescriptionId`, augment the prompt itself so the AI calls the tool with that arg.

Replace the existing setTimeout block with:

old:
```tsx
      hasSeededRef.current = true;
      setPageInput("do", prompt);
      // Auto-send after a brief delay to let the component mount
      setTimeout(() => {
        const employeeInfo = user
          ? {
              id: user.id,
              employeeId: user.employeeId,
              firstName: user.firstName,
              lastName: user.lastName,
              department: user.department,
              title: user.title,
            }
          : undefined;
        const outcomeCtx =
          outcomeText && strategyGoalId && strategyGoalTitle && contributionRef
            ? { outcomeText, strategyGoalId, strategyGoalTitle, contributionRef }
            : undefined;
        sendMessage("do", prompt, toolKey ?? undefined, employeeInfo, outcomeCtx);
      }, 100);
```
new:
```tsx
      hasSeededRef.current = true;
      // If a jobDescriptionId is supplied (refine flow), bake it into the
      // prompt so the tool call carries the jdId arg without expanding the
      // sendMessage signature.
      const augmentedPrompt = jobDescriptionId
        ? `${prompt} (jdId=${jobDescriptionId})`
        : prompt;
      setPageInput("do", augmentedPrompt);
      // Auto-send after a brief delay to let the component mount
      setTimeout(() => {
        const employeeInfo = user
          ? {
              id: user.id,
              employeeId: user.employeeId,
              firstName: user.firstName,
              lastName: user.lastName,
              department: user.department,
              title: user.title,
            }
          : undefined;
        const outcomeCtx =
          outcomeText && strategyGoalId && strategyGoalTitle && contributionRef
            ? { outcomeText, strategyGoalId, strategyGoalTitle, contributionRef }
            : undefined;
        sendMessage(
          "do",
          augmentedPrompt,
          toolKey ?? undefined,
          employeeInfo,
          outcomeCtx,
        );
      }, 100);
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 4: Update prompt guidance to read jdId from prompt**

Edit `apps/platform/src/lib/ai/prompts.ts` to ensure the JD refine guidance mentions:

```
When the user's message includes "(jdId=<id>)", call startJobDescriptionWorkflow with that jdId. Strip the suffix from the rest of the conversation when summarizing.
```

Add this as a one-line addendum to the JD bullet you wrote in Task 7.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/app/do/page.tsx apps/platform/src/lib/ai/prompts.ts
git commit -m "feat: forward jobDescriptionId from /do URL into JD compass"
```

---

## Task 14: Manual QA + final type-check

**Files:** none

- [ ] **Step 1: Run the full TypeScript check**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm tsc -b --noEmit 2>&1 | tail -30
```

Expected: zero errors.

- [ ] **Step 2: Run the test suite**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm test 2>&1 | tail -20
```

Expected: all tests pass (DB-gated tests skipped if `MONGODB_URI` not set).

- [ ] **Step 3: Lint**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm lint 2>&1 | tail -20
```

Expected: zero new errors.

- [ ] **Step 4: Start the dev server**

```bash
cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform
```

Wait for "Ready" output. Default URL: `http://localhost:3051`.

- [ ] **Step 5: Drive each entry point in the browser**

Navigate to **Plan → Organizational Design**. Verify:

  1. Tab labeled "My Role" (not "My Profile").
  2. URL `?tab=my-role`.
  3. Two Compass cards visible. "Suggest from my JD" disabled if no JD assigned.
  4. About Me read view shows current values; Focus Layer read view + status pill below it.
  5. Click **Edit** on About Me → existing edit form appears; edit a field → "Saved" indicator appears (existing auto-save). Click **Done** → read view refreshes.
  6. Click **Edit** on Focus Layer → existing form appears (no Sparkles button inside). Submit flow unchanged.
  7. Click **Build my Role with Compass** → routes to `/do?...`. AI runs the interview: About Me first (pronouns → preferred contact → bio → ...), then Focus Layer. AI restates existing values + offers Keep/Refine/Replace (`[ASCENTA_OPTIONS]`).
  8. At the end of the interview, the working-document side panel opens with both sections prefilled. Edit a field → "Save" submits. Toast: "Your role has been saved." Read view reflects the new values.
  9. Click **Suggest from my JD** → routes to `/do?...`. AI says "Here's what I drafted from your JD..." and the working document opens with About Me preserved + Focus Layer prefilled from the suggestion. Save → values land in DB.
  10. If user has no JD: card is visibly disabled with tooltip "No job description is assigned to you yet".

Navigate to **Plan → Organizational Design → Job Descriptions** tab. Verify:

  11. Two Compass cards above the filter bar.
  12. Click **Build a JD with Compass** → routes to `/do?...`. Interview walks title → department → level (options block) → employment type (options block) → role summary → core responsibilities (one-by-one bullets) → qualifications → competencies. Working document opens prefilled. Save → new JD appears in the table.
  13. Click **Refine an existing JD** → picker dialog opens, search/filter works. Click a JD → routes to `/do?...&jobDescriptionId=...`. AI loads existing JD, walks each section with Keep/Refine/Replace. Working document opens with mode=edit. Save → JD updates in place; table refreshes.
  14. **+ New Job Description** button still opens the manual sheet. Edit/assign/delete flows from the JD detail Sheet still work.

- [ ] **Step 6: Final commit (only if any QA-discovered fixes were made)**

If you needed to make any tactical fixes during QA (typos, color issues, copy tweaks), commit them:

```bash
git add -A
git commit -m "fix: My Role + JD Compass QA polish"
```

If QA passes clean, no commit needed.

---

## Self-Review Notes

- **Spec coverage:** Each section of the spec is covered — IA rename (Task 1), My Role page UI (Task 11), JD page UI (Task 12), 5 AI tools (Tasks 4–6), tool registration + prompts (Task 7), working-doc forms (Tasks 8–9), chat-context wiring (Tasks 3, 10), routing (Task 13), persistence + error handling (Task 3 dispatcher branches), testing (unit in Tasks 4/5/6, manual in Task 14).
- **No placeholders:** Every step has either exact code or exact diff snippets.
- **Type consistency:** `WorkflowType` strings (`"build-my-role"`, `"create-job-description"`) match between Tasks 3, 4, 6, 8, 9, 10. Tool names (`startMyRoleWorkflow`, `openMyRoleDocument`, `suggestFromJD`, `startJobDescriptionWorkflow`, `openJobDescriptionDocument`) consistent across registration (Task 7), card hrefs (Tasks 11, 12), and tests (Tasks 4–6).
- **Spec deviations:**
  - The plan does NOT extract a separate `lib/focus-layer/suggest.ts` helper — the existing `lib/ai/focus-layer-tool.ts:generateFocusLayerSuggestion` is already a clean helper used by the route, so we reuse it directly.
  - The plan does NOT introduce the `EmployeeProfileCard`-vs-new question — the read view is implemented inline in `my-role-tab.tsx` as a small `AboutMeReadView` component, since `EmployeeProfileCard` is dialog/inline-org-chart-flavored and adding props to it would be churn.
  - `jobDescriptionId` URL plumbing into the AI tool is via prompt augmentation (`(jdId=...)` suffix) rather than expanding `sendMessage`'s signature — keeps the change narrow and reuses the existing seed-then-send flow.
  - The plan keeps the existing **Import** button on the JD page intact and does NOT replace it with a Compass card (per spec — only Compass + Refine cards, manual buttons unchanged).
