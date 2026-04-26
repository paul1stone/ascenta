# My Organization Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a personalized PDF download per employee combining role context, reporting line, team, Focus Layer, and Strategy Studio mission. Sub-project #5 of the Plan module roadmap.

**Architecture:** `@react-pdf/renderer` (server-side, no Chromium). `GET /api/employees/[id]/organization-pdf` streams the binary. Six section components compose into a single Document. Sync generation. Each section gracefully omits when its source data is missing.

**Spec:** `docs/superpowers/specs/2026-05-01-my-organization-download-design.md`
**Builds on:** sub-projects #1 (JD library), #2 (Focus Layer), #3 (`profile.photoBase64`)

**Branch:** `feat/my-organization-download`. Confirm branch vs worktree.

---

## Phase 1 — Dependency + Data Assembly (Tasks 1–2)

### Task 1: Install `@react-pdf/renderer` and scaffold

**Files:**
- Modify: `apps/platform/package.json`

- [ ] **Step 1: Install**

```bash
pnpm --filter @ascenta/platform add @react-pdf/renderer
```

- [ ] **Step 2: Verify installation**

Open `apps/platform/package.json`, confirm `"@react-pdf/renderer"` is listed under `dependencies`. Verify `pnpm install` ran clean.

- [ ] **Step 3: Type check, commit**

```bash
pnpm --filter @ascenta/platform exec tsc --noEmit
git add apps/platform/package.json pnpm-lock.yaml
git commit -m "chore(platform): install @react-pdf/renderer for PDF generation"
```

---

### Task 2: `assembleOrgSnapshot` data helper

**Files:**
- Create: `apps/platform/src/lib/pdf/assemble-org-snapshot.ts`
- Create: `apps/platform/src/tests/assemble-org-snapshot.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/assemble-org-snapshot.test.ts
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { Foundation } from "@ascenta/db/foundation-schema";
import { assembleOrgSnapshot } from "@/lib/pdf/assemble-org-snapshot";

const PREFIX = "PDF_ASM_";

async function setup() {
  const skip = await Employee.create({
    employeeId: `${PREFIX}SKIP`, firstName: "Skip", lastName: "Level",
    email: `${PREFIX}skip@x.com`, department: "Engineering",
    jobTitle: "VP", managerName: "", hireDate: new Date(),
  });
  const mgr = await Employee.create({
    employeeId: `${PREFIX}MGR`, firstName: "Manny", lastName: "Manager",
    email: `${PREFIX}mgr@x.com`, department: "Engineering",
    jobTitle: "EM", managerName: "Skip Level", hireDate: new Date(),
  });
  const jd = await JobDescription.create({
    title: "Software Engineer", department: "Engineering", level: "mid",
    employmentType: "full_time",
    roleSummary: "Builds and maintains software systems for the company.",
    coreResponsibilities: ["Write code"],
    requiredQualifications: ["3+ years"], competencies: ["Ownership"],
    status: "published",
  });
  const me = await Employee.create({
    employeeId: `${PREFIX}ME`, firstName: "Maya", lastName: "Engineer",
    email: `${PREFIX}me@x.com`, department: "Engineering",
    jobTitle: "Engineer", managerName: "Manny Manager",
    hireDate: new Date(), jobDescriptionId: jd._id,
  });
  const peer = await Employee.create({
    employeeId: `${PREFIX}PEER`, firstName: "Pat", lastName: "Peer",
    email: `${PREFIX}peer@x.com`, department: "Engineering",
    jobTitle: "Engineer", managerName: "Manny Manager", hireDate: new Date(),
  });
  await FocusLayer.create({
    employeeId: me._id, jobDescriptionId: jd._id, status: "confirmed",
    responses: {
      uniqueContribution: "I bring deep cross-team alignment expertise.",
      highImpactArea: "Most impact when bridging product and engineering.",
      signatureResponsibility: "I own the architectural narrative.",
      workingStyle: "Focused 90-min blocks plus async pair sessions.",
    },
    employeeSubmitted: { at: new Date() },
    managerConfirmed: { at: new Date(), byUserId: mgr._id, comment: null },
  });
  await Foundation.create({
    orgId: "default", mission: "Help orgs grow people.",
    vision: "Every workplace runs on intent.",
    coreValues: ["Care", "Clarity"], status: "published", version: 1,
  });
  return { skip, mgr, me, peer };
}

describe("assembleOrgSnapshot", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await JobDescription.deleteMany({ title: "Software Engineer" });
    await FocusLayer.deleteMany({});
    await Foundation.deleteMany({ orgId: "default" });
  });
  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await JobDescription.deleteMany({ title: "Software Engineer" });
    await FocusLayer.deleteMany({});
    await Foundation.deleteMany({ orgId: "default" });
    await mongoose.disconnect();
  });

  it("builds a full snapshot when all data present", async () => {
    const { me } = await setup();
    const snap = await assembleOrgSnapshot(String(me._id));
    expect(snap.employee.name).toBe("Maya Engineer");
    expect(snap.jobDescription?.title).toBe("Software Engineer");
    expect(snap.reportingLine.managerName).toBe("Manny Manager");
    expect(snap.reportingLine.skipLevelName).toBe("Skip Level");
    expect(snap.team.find((m) => m.name === "Pat Peer")).toBeDefined();
    expect(snap.team.find((m) => m.isSelf && m.name === "Maya Engineer")).toBeDefined();
    expect(snap.focusLayer?.responses.uniqueContribution).toContain("cross-team");
    expect(snap.foundation?.mission).toContain("grow people");
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
});
```

- [ ] **Step 2: Run, expect failure**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/assemble-org-snapshot.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// apps/platform/src/lib/pdf/assemble-org-snapshot.ts
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { Foundation } from "@ascenta/db/foundation-schema";

export interface OrgSnapshotData {
  generatedAt: Date;
  employee: {
    id: string;
    name: string;
    pronouns: string | null;
    jobTitle: string;
    department: string;
    hireDate: Date;
    photoBase64: string | null;
  };
  jobDescription: {
    title: string;
    roleSummary: string;
    coreResponsibilities: string[];
    competencies: string[];
  } | null;
  reportingLine: {
    skipLevelName: string | null;
    managerName: string | null;
    directReportNames: string[];
  };
  team: Array<{ id: string; name: string; jobTitle: string; isSelf: boolean }>;
  focusLayer: {
    status: "confirmed";
    responses: {
      uniqueContribution: string;
      highImpactArea: string;
      signatureResponsibility: string;
      workingStyle: string;
    };
  } | null;
  foundation: {
    mission: string | null;
    vision: string | null;
    coreValues: string[];
  } | null;
}

const fullName = (e: { firstName: string; lastName: string }) => `${e.firstName} ${e.lastName}`;
const norm = (s: string) => s.trim().toLowerCase();

export async function assembleOrgSnapshot(employeeId: string): Promise<OrgSnapshotData> {
  await connectDB();
  if (!mongoose.isValidObjectId(employeeId)) throw new Error("Invalid employee id");
  const me = await Employee.findById(employeeId).lean();
  if (!me) throw new Error("Employee not found");

  const [allEmployees, foundationDoc] = await Promise.all([
    Employee.find({ status: "active" }).lean(),
    Foundation.findOne({ orgId: "default" }).lean().catch(() => null),
  ]);
  const byName = new Map(
    allEmployees.map((e: Record<string, unknown>) => [
      norm(`${e.firstName} ${e.lastName}`),
      e,
    ]),
  );
  const manager = me.managerName ? (byName.get(norm(me.managerName)) ?? null) : null;
  const skip =
    manager && (manager as { managerName?: string }).managerName
      ? byName.get(norm((manager as { managerName: string }).managerName)) ?? null
      : null;

  const directReports = allEmployees
    .filter((e: Record<string, unknown>) => norm(String(e.managerName ?? "")) === norm(fullName(me as never)))
    .map((e: Record<string, unknown>) => fullName(e as never));

  const teamRaw = allEmployees
    .filter((e: Record<string, unknown>) => e.department === me.department)
    .slice(0, 24)
    .map((e: Record<string, unknown>) => ({
      id: String(e._id),
      name: fullName(e as never),
      jobTitle: String(e.jobTitle ?? ""),
      isSelf: String(e._id) === String(me._id),
    }));
  const team = teamRaw.slice(0, 8);

  let jd: OrgSnapshotData["jobDescription"] = null;
  if (me.jobDescriptionId) {
    const found = await JobDescription.findById(me.jobDescriptionId).lean();
    if (found) {
      jd = {
        title: found.title,
        roleSummary: found.roleSummary,
        coreResponsibilities: found.coreResponsibilities ?? [],
        competencies: found.competencies ?? [],
      };
    }
  }

  let focusLayer: OrgSnapshotData["focusLayer"] = null;
  const fl = await FocusLayer.findOne({ employeeId: me._id }).lean();
  if (fl && fl.status === "confirmed") {
    focusLayer = { status: "confirmed", responses: fl.responses as never };
  }

  const foundation = foundationDoc
    ? {
        mission: (foundationDoc as { mission?: string | null }).mission ?? null,
        vision: (foundationDoc as { vision?: string | null }).vision ?? null,
        coreValues: ((foundationDoc as { coreValues?: string[] }).coreValues ?? []) as string[],
      }
    : null;

  return {
    generatedAt: new Date(),
    employee: {
      id: String(me._id),
      name: fullName(me as never),
      pronouns: ((me as { profile?: { pronouns?: string | null } }).profile?.pronouns) ?? null,
      jobTitle: me.jobTitle,
      department: me.department,
      hireDate: me.hireDate,
      photoBase64: ((me as { profile?: { photoBase64?: string | null } }).profile?.photoBase64) ?? null,
    },
    jobDescription: jd,
    reportingLine: {
      skipLevelName: skip ? fullName(skip as never) : null,
      managerName: manager ? fullName(manager as never) : null,
      directReportNames: directReports,
    },
    team,
    focusLayer,
    foundation,
  };
}
```

- [ ] **Step 4: Run tests, commit**

```bash
git add apps/platform/src/lib/pdf/assemble-org-snapshot.ts \
  apps/platform/src/tests/assemble-org-snapshot.test.ts
git commit -m "feat(pdf): assembleOrgSnapshot gathers data for the personalized PDF"
```

---

## Phase 2 — PDF Renderer (Tasks 3–5)

### Task 3: Brand styles + cover + role context sections

**Files:**
- Create: `apps/platform/src/lib/pdf/pdf-styles.ts`
- Create: `apps/platform/src/lib/pdf/components/cover-section.tsx`
- Create: `apps/platform/src/lib/pdf/components/role-context-section.tsx`

- [ ] **Step 1: Styles**

```ts
// apps/platform/src/lib/pdf/pdf-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11, color: "#0c1e3d" },
  accentBar: { height: 4, backgroundColor: "#ff6b35", marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  h2: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 4, color: "#0c1e3d" },
  meta: { fontSize: 9, color: "#64748b" },
  paragraph: { fontSize: 10, lineHeight: 1.4 },
  bullet: { fontSize: 10, marginLeft: 8, marginBottom: 2 },
  section: { marginTop: 12 },
  reportLine: { fontSize: 11, marginBottom: 2 },
  arrow: { fontSize: 9, color: "#94a3b8", marginLeft: 8, marginBottom: 2 },
  coverRow: { flexDirection: "row", alignItems: "center" },
  photo: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 10 },
});
```

- [ ] **Step 2: CoverSection**

```tsx
// apps/platform/src/lib/pdf/components/cover-section.tsx
import { View, Text, Image } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function CoverSection({ data }: { data: OrgSnapshotData }) {
  const { employee, generatedAt } = data;
  return (
    <View>
      <View style={styles.accentBar} />
      <View style={styles.coverRow}>
        {employee.photoBase64 && (
          <Image src={employee.photoBase64} style={styles.photo} />
        )}
        <View>
          <Text style={styles.h1}>
            {employee.name}
            {employee.pronouns ? ` · ${employee.pronouns}` : ""}
          </Text>
          <Text style={styles.paragraph}>
            {employee.jobTitle} · {employee.department}
          </Text>
          <Text style={styles.meta}>
            Generated {generatedAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}
```

- [ ] **Step 3: RoleContextSection**

```tsx
// apps/platform/src/lib/pdf/components/role-context-section.tsx
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function RoleContextSection({ data }: { data: OrgSnapshotData }) {
  const jd = data.jobDescription;
  if (!jd) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Your role in context</Text>
      <Text style={styles.paragraph}>{jd.roleSummary}</Text>
      {jd.coreResponsibilities.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[styles.paragraph, { fontWeight: 700 }]}>Core responsibilities</Text>
          {jd.coreResponsibilities.slice(0, 5).map((r, i) => (
            <Text key={i} style={styles.bullet}>• {r}</Text>
          ))}
        </View>
      )}
      {jd.competencies.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[styles.paragraph, { fontWeight: 700 }]}>Competencies</Text>
          <Text style={styles.paragraph}>{jd.competencies.join(", ")}</Text>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 4: Type check, commit**

```bash
git add apps/platform/src/lib/pdf/pdf-styles.ts \
  apps/platform/src/lib/pdf/components/cover-section.tsx \
  apps/platform/src/lib/pdf/components/role-context-section.tsx
git commit -m "feat(pdf): brand styles, CoverSection, RoleContextSection"
```

---

### Task 4: Reporting + team + focus + mission sections

**Files:**
- Create: `apps/platform/src/lib/pdf/components/reporting-line-section.tsx`
- Create: `apps/platform/src/lib/pdf/components/team-map-section.tsx`
- Create: `apps/platform/src/lib/pdf/components/focus-layer-section-pdf.tsx`
- Create: `apps/platform/src/lib/pdf/components/mission-anchor-section.tsx`

- [ ] **Step 1: ReportingLineSection**

```tsx
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function ReportingLineSection({ data }: { data: OrgSnapshotData }) {
  const { reportingLine, employee } = data;
  const layers: Array<{ label: string; value: string }> = [];
  if (reportingLine.skipLevelName) layers.push({ label: "Skip-level", value: reportingLine.skipLevelName });
  if (reportingLine.managerName) layers.push({ label: "Manager", value: reportingLine.managerName });
  layers.push({ label: "You", value: employee.name });
  if (reportingLine.directReportNames.length > 0) {
    layers.push({ label: "Reports", value: reportingLine.directReportNames.join(", ") });
  }
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Reporting line</Text>
      {layers.map((row, i) => (
        <View key={i}>
          <Text style={styles.reportLine}>
            <Text style={{ fontWeight: 700 }}>{row.label}: </Text>
            {row.value}
          </Text>
          {i < layers.length - 1 && <Text style={styles.arrow}>↓</Text>}
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 2: TeamMapSection**

```tsx
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function TeamMapSection({ data }: { data: OrgSnapshotData }) {
  if (!data.team.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Your team in {data.employee.department}</Text>
      {data.team.map((m) => (
        <Text key={m.id} style={[styles.bullet, m.isSelf ? { fontWeight: 700 } : {}]}>
          • {m.name} — {m.jobTitle}{m.isSelf ? " (you)" : ""}
        </Text>
      ))}
    </View>
  );
}
```

- [ ] **Step 3: FocusLayerSectionPdf**

```tsx
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

const PROMPT_LABELS: Array<[keyof OrgSnapshotData["focusLayer"]["responses"], string]> = [
  ["uniqueContribution", "What you bring uniquely"],
  ["highImpactArea", "Where you create the most impact"],
  ["signatureResponsibility", "Responsibilities that shape the team"],
  ["workingStyle", "How you prefer to work"],
];

export function FocusLayerSectionPdf({ data }: { data: OrgSnapshotData }) {
  if (!data.focusLayer) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Your Focus Layer</Text>
      {PROMPT_LABELS.map(([key, label]) => (
        <View key={key} style={{ marginBottom: 6 }}>
          <Text style={[styles.paragraph, { fontWeight: 700 }]}>{label}</Text>
          <Text style={styles.paragraph}>{data.focusLayer!.responses[key]}</Text>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 4: MissionAnchorSection**

```tsx
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function MissionAnchorSection({ data }: { data: OrgSnapshotData }) {
  if (!data.foundation) return null;
  const { mission, vision, coreValues } = data.foundation;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>How this connects to the organization</Text>
      {mission && <Text style={styles.paragraph}><Text style={{ fontWeight: 700 }}>Mission. </Text>{mission}</Text>}
      {vision && <Text style={[styles.paragraph, { marginTop: 4 }]}><Text style={{ fontWeight: 700 }}>Vision. </Text>{vision}</Text>}
      {coreValues.length > 0 && (
        <Text style={[styles.paragraph, { marginTop: 4 }]}>
          <Text style={{ fontWeight: 700 }}>Core values. </Text>
          {coreValues.join(", ")}
        </Text>
      )}
    </View>
  );
}
```

- [ ] **Step 5: Type check, commit**

```bash
git add apps/platform/src/lib/pdf/components/
git commit -m "feat(pdf): reporting line, team, focus, mission section components"
```

---

### Task 5: Top-level renderer

**Files:**
- Create: `apps/platform/src/lib/pdf/render-org-snapshot.ts`

- [ ] **Step 1: Implement**

```tsx
// apps/platform/src/lib/pdf/render-org-snapshot.tsx
import { Document, Page, renderToBuffer } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";
import type { OrgSnapshotData } from "./assemble-org-snapshot";
import { CoverSection } from "./components/cover-section";
import { RoleContextSection } from "./components/role-context-section";
import { ReportingLineSection } from "./components/reporting-line-section";
import { TeamMapSection } from "./components/team-map-section";
import { FocusLayerSectionPdf } from "./components/focus-layer-section-pdf";
import { MissionAnchorSection } from "./components/mission-anchor-section";

export async function renderOrgSnapshot(data: OrgSnapshotData): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <Page size="LETTER" style={styles.page}>
        <CoverSection data={data} />
        <RoleContextSection data={data} />
        <ReportingLineSection data={data} />
        <TeamMapSection data={data} />
        <FocusLayerSectionPdf data={data} />
        <MissionAnchorSection data={data} />
      </Page>
    </Document>,
  );
}
```

(Save as `.tsx` since it returns JSX. Update the spec's `.ts` filename to `.tsx` accordingly.)

- [ ] **Step 2: Type check, commit**

```bash
git add apps/platform/src/lib/pdf/render-org-snapshot.tsx
git commit -m "feat(pdf): renderOrgSnapshot composes all sections into a Document"
```

---

## Phase 3 — API Endpoint (Task 6)

### Task 6: `GET /api/employees/[id]/organization-pdf`

**Files:**
- Create: `apps/platform/src/app/api/employees/[id]/organization-pdf/route.ts`
- Create: `apps/platform/src/tests/api-organization-pdf.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/api-organization-pdf.test.ts
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { GET } from "@/app/api/employees/[id]/organization-pdf/route";

const PREFIX = "PDF_API_";

async function makeEmp() {
  return Employee.create({
    employeeId: `${PREFIX}E1`,
    firstName: "P", lastName: "Df",
    email: `${PREFIX}p@x.com`,
    department: "Engineering", jobTitle: "Eng",
    managerName: "", hireDate: new Date(),
  });
}

function ctx(id: string) { return { params: Promise.resolve({ id }) }; }

describe("GET /api/employees/[id]/organization-pdf", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await mongoose.disconnect();
  });

  it("returns a PDF binary with correct headers", async () => {
    const emp = await makeEmp();
    const res = await GET(new Request("http://t") as never, ctx(String(emp._id)));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toMatch(/attachment;.*\.pdf/);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("returns 404 for invalid id", async () => {
    const res = await GET(new Request("http://t") as never, ctx("not-an-id"));
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Implement endpoint**

```ts
// apps/platform/src/app/api/employees/[id]/organization-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { assembleOrgSnapshot } from "@/lib/pdf/assemble-org-snapshot";
import { renderOrgSnapshot } from "@/lib/pdf/render-org-snapshot";

type Ctx = { params: Promise<{ id: string }> };

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 404 });
    }
    const snapshot = await assembleOrgSnapshot(id);
    const buffer = await renderOrgSnapshot(snapshot);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slugify(snapshot.employee.name)}-organization-snapshot.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Run tests, commit**

```bash
git add apps/platform/src/app/api/employees/\[id\]/organization-pdf/route.ts \
  apps/platform/src/tests/api-organization-pdf.test.ts
git commit -m "feat(api): GET /api/employees/[id]/organization-pdf streams personalized PDF"
```

---

## Phase 4 — UI Wiring (Task 7)

### Task 7: Download button + integration

**Files:**
- Create: `apps/platform/src/components/plan/profile/download-org-snapshot-button.tsx`
- Modify: `apps/platform/src/components/plan/profile/employee-profile-card.tsx`
- Modify: `apps/platform/src/app/my-profile/page.tsx`

- [ ] **Step 1: Button component**

```tsx
// download-org-snapshot-button.tsx
"use client";
import { Button } from "@ascenta/ui/components/button";
import { FileDown } from "lucide-react";

interface Props { employeeId: string; size?: "sm" | "default"; }

export function DownloadOrgSnapshotButton({ employeeId, size = "sm" }: Props) {
  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => window.open(`/api/employees/${employeeId}/organization-pdf`)}
    >
      <FileDown className="size-4 mr-1" />
      Download My Organization Snapshot
    </Button>
  );
}
```

- [ ] **Step 2: Render in EmployeeProfileCard**

In `employee-profile-card.tsx`, in the `Body` component header row (next to the completion badge), add:

```tsx
<DownloadOrgSnapshotButton employeeId={employee.id} />
```

Place it before the `<ProfileCompletionBadge />` in the same flex container.

- [ ] **Step 3: Render in /my-profile**

```tsx
// my-profile/page.tsx — header
<header className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-display font-bold">My Profile</h1>
    <p className="text-sm text-muted-foreground">{user.name}</p>
  </div>
  <DownloadOrgSnapshotButton employeeId={user.id} />
</header>
```

- [ ] **Step 4: Manual smoke**

Run dev server. Visit `/my-profile` → click button → verify a PDF downloads. Open the PDF; confirm sections render.

Visit dashboard → click employee → click "Download My Organization Snapshot" on the card → another PDF downloads for that employee.

- [ ] **Step 5: Commit**

```bash
git add apps/platform/src/components/plan/profile/download-org-snapshot-button.tsx \
  apps/platform/src/components/plan/profile/employee-profile-card.tsx \
  apps/platform/src/app/my-profile/page.tsx
git commit -m "feat(plan): wire DownloadOrgSnapshotButton into EmployeeProfileCard and /my-profile"
```

---

## Definition of Done

- [ ] All 7 tasks committed
- [ ] `pnpm lint && pnpm test && pnpm build` pass
- [ ] Manual smoke produces a valid PDF for at least 3 employees with varying data completeness (full / no JD / no Focus Layer)
- [ ] PDF magic-bytes test passes in CI
- [ ] PR opened via `gh-pr-main`

## Notes for the Implementer

- **`@react-pdf/renderer` is the only new dep.** No Chromium, no Puppeteer.
- **Sync render is fine.** If a real-world deployment shows >5s render times, consider moving to a job queue — out of scope for v1.
- **Photo data URL handling.** The `<Image src={dataUrl} />` API in `@react-pdf/renderer` accepts data URLs directly. Keep the size-cap from sub-project #3 to avoid bloated PDFs.
- **Vercel runtime.** This route uses Node runtime by default in Next.js 16. If you see runtime issues, add `export const runtime = "nodejs"` at the top of the route file.
- **Dev workflow.** When iterating on PDF rendering, use a tiny script (`tsx scripts/inspect-pdf.ts`) that calls `assembleOrgSnapshot` + `renderOrgSnapshot` and writes to `/tmp/out.pdf` — quicker than the full Next.js dev cycle.
