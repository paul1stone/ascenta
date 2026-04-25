# My Organization Download — Design Spec

**Date:** 2026-05-01
**Status:** Draft
**Module:** Plan / Organizational Design
**Source reqs:** `Plan Mark down.md` § 1C — My Organization Download
**Position in chain:** Sub-project #5 of 6 in the Plan module roadmap.
**Builds on:** sub-projects #1–#4

---

## Context

The reqs describe a personalized PDF for each employee that contextualizes their role within the larger org: role context summary (from JD), reporting line visual, team map, Focus Layer, and an organizational mission anchor pulled from Strategy Studio. The intended outcome is "employees who understand where they fit are more engaged" — a short, polished one-pager-ish artifact, not a generic org chart printout.

This sub-project ships the data assembly + PDF rendering. It depends on data from every preceding sub-project (JD Library, Focus Layer, Profile Card) plus existing Strategy Studio Foundation data.

---

## V1 Scope

In scope:

- Server-rendered PDF via `@react-pdf/renderer` (greenfield; no PDF lib in repo today)
- A `GET /api/employees/[id]/organization-pdf` endpoint that streams the binary PDF
- "Download My Organization Snapshot" button on `/my-profile` and on the `<EmployeeProfileCard />`
- Six PDF sections per reqs: cover, role context summary, reporting line visual, team map, Focus Layer, organizational mission anchor
- Sync generation (typical render time <2s)
- Ascenta-branded styling (Deep Blue + Summit Orange) matching the design tokens
- Empty/missing-data resilience: each section degrades gracefully if its source data is absent (no JD assigned → cover still works; no Focus Layer → that section omitted; no Strategy Studio Foundation → mission section omitted)
- Manual smoke testing only (no automated PDF byte testing)

Out of scope:

- Async PDF job queue (sync is fine at v1 sizes)
- Print-CSS / browser-rendered HTML version
- White-labeled per-organization branding
- PDF-side hyperlinks back to Ascenta
- Photo embedding from `profile.photoBase64` in the PDF (not because it's hard — because Base64 photos already work as data URLs in `@react-pdf/renderer` `<Image src=""/>` — but the v1 keeps style minimal until users ask for photos in the PDF)
- Attempt to embed a vector-perfect copy of the live d3 org chart; the PDF gets a simplified text-based reporting visual instead

Wait — photos are easy to include and the demo benefits visually. **Reverse**: include `profile.photoBase64` on the cover page when present. Mention this explicitly in the PDF rendering task.

---

## Architecture

### Approach: `@react-pdf/renderer` server-side, sync streaming response

`@react-pdf/renderer` is a React tree → PDF renderer that runs in Node (no Chromium). Output is a Buffer streamed in the API response with `Content-Type: application/pdf` and `Content-Disposition: attachment`.

Why this over Puppeteer/Chromium:

- No native binary; deploys cleanly on Vercel without serverless tweaks
- React component model matches the rest of the codebase
- Bundle adds ~6MB to the platform server build, which is acceptable
- Sufficient for a 1–2 page structured document

Why sync over async job:

- Typical org sizes (≤500 employees) render in well under 2s
- Async would require a queue + status polling we'd need to build from scratch
- If real-world sizes prove this wrong, swap in a job queue later — the API contract (single endpoint returning a PDF) doesn't have to change

### File layout

```
apps/platform/src/
├── app/api/employees/[id]/organization-pdf/
│   └── route.ts                            NEW — GET, returns PDF stream
├── lib/pdf/
│   ├── assemble-org-snapshot.ts            NEW — gathers data for the PDF
│   ├── render-org-snapshot.ts              NEW — top-level renderer
│   ├── pdf-styles.ts                       NEW — shared brand styles
│   └── components/
│       ├── cover-section.tsx               NEW
│       ├── role-context-section.tsx        NEW
│       ├── reporting-line-section.tsx      NEW
│       ├── team-map-section.tsx            NEW
│       ├── focus-layer-section-pdf.tsx     NEW
│       └── mission-anchor-section.tsx      NEW
├── components/plan/profile/
│   ├── employee-profile-card.tsx           MODIFIED — add download button
│   └── download-org-snapshot-button.tsx    NEW — reusable button (used on /my-profile too)
└── app/my-profile/page.tsx                 MODIFIED — add download button to header

apps/platform/src/tests/
├── assemble-org-snapshot.test.ts           NEW — pure data-assembly test
└── api-organization-pdf.test.ts            NEW — endpoint smoke test (verifies PDF magic bytes)

apps/platform/package.json                  MODIFIED — add @react-pdf/renderer
```

---

## Data Assembly

`apps/platform/src/lib/pdf/assemble-org-snapshot.ts` exports `assembleOrgSnapshot(employeeId): Promise<OrgSnapshotData>`:

```ts
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
    skipLevelName: string | null;   // manager's manager
    managerName: string | null;
    directReportNames: string[];
  };
  team: Array<{
    id: string;
    name: string;
    jobTitle: string;
    isSelf: boolean;
  }>;
  focusLayer: {
    status: "draft" | "submitted" | "confirmed";
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
```

Implementation:

1. Load the employee. 404 → throw.
2. If `jobDescriptionId` set, load the JD; otherwise null.
3. Resolve manager via name match (same fuzzy approach as auth context).
4. Resolve skip-level: load that manager's manager (one more hop).
5. Direct reports: query Employees where `managerName` matches this employee's full name.
6. Team: query Employees where `department === employee.department`, exclude self, cap to 8 names; if more, append "and N others" via the renderer.
7. Focus Layer: `getFocusLayerByEmployee(employeeId)`. Include only if status is `confirmed` (PDF shouldn't surface in-progress drafts).
8. Foundation: `Foundation.findOne({ orgId: "default" })`.

Each step is wrapped in try/catch — a single missing piece doesn't kill the whole render.

---

## API Route

### `GET /api/employees/[id]/organization-pdf`

Auth: future-gated to "self or manager or HR"; v1 ships open.

Flow:

1. Validate id → 404 if invalid.
2. Call `assembleOrgSnapshot(id)`.
3. Call `renderOrgSnapshot(data)` → `Buffer`.
4. Return:

```ts
new Response(buffer, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${slugify(employee.name)}-organization-snapshot.pdf"`,
    "Cache-Control": "no-store",
  },
});
```

Errors → 500 with JSON body. (PDF errors return JSON, not a corrupt PDF.)

---

## PDF Renderer

`apps/platform/src/lib/pdf/render-org-snapshot.ts`:

```ts
import { renderToBuffer, Document } from "@react-pdf/renderer";

export async function renderOrgSnapshot(data: OrgSnapshotData): Promise<Buffer> {
  const tree = (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <CoverSection data={data} />
        <RoleContextSection data={data} />
        <ReportingLineSection data={data} />
        <TeamMapSection data={data} />
        <FocusLayerSectionPdf data={data} />
        <MissionAnchorSection data={data} />
      </Page>
    </Document>
  );
  return renderToBuffer(tree);
}
```

Each section component returns null when its source data is missing, so the document gracefully condenses.

### Brand styles (`pdf-styles.ts`)

```ts
import { StyleSheet, Font } from "@react-pdf/renderer";

// Use system fonts. @react-pdf supports Font.register if we want custom fonts, but skip in v1.

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#0c1e3d", // Deep Blue
  },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  h2: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 4, color: "#0c1e3d" },
  meta: { fontSize: 10, color: "#64748b" },
  accentBar: { height: 4, backgroundColor: "#ff6b35", marginBottom: 12 }, // Summit Orange
  bullet: { fontSize: 10, marginLeft: 8, marginBottom: 2 },
  paragraph: { fontSize: 10, lineHeight: 1.4 },
  section: { marginTop: 12 },
});
```

### Section components

Each section is a small React-PDF component with a heading and body. Highlights:

**CoverSection** — Centered or left-aligned employee name, pronouns, job title. Optional `<Image src={photoBase64} />` to the left. Generated date in `meta`.

**RoleContextSection** — Hides if `jobDescription` is null. Renders role title, summary paragraph, top 5 responsibilities as bullets, top 5 competencies as a compact comma-joined list.

**ReportingLineSection** — Text-based ASCII-style visual:

```
Skip-level: Adam Manager
        ↓
Manager:    Jane Director
        ↓
You:        Casey Engineer
        ↓
Reports:    Pat Junior, Sam Sloan
```

If any layer is missing, the row is skipped.

**TeamMapSection** — Lists team members in the same department. Self bolded. Truncate at 8; append "+ N others" if more.

**FocusLayerSectionPdf** — Hides if `focusLayer` is null. Otherwise renders the 4 prompt labels with their responses.

**MissionAnchorSection** — Hides if `foundation` is null. Renders mission paragraph + vision (if set) + core values as a compact comma-joined list. Section heading: "How this connects to {Org Name}". Org name comes from foundation if present (otherwise "the organization").

---

## UI

### `<DownloadOrgSnapshotButton employeeId>`

Reusable button. Clicks → calls `window.open("/api/employees/${employeeId}/organization-pdf")` (browser handles the download via Content-Disposition).

```tsx
"use client";
import { Button } from "@ascenta/ui/components/button";
import { FileDown } from "lucide-react";

export function DownloadOrgSnapshotButton({ employeeId }: { employeeId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.open(`/api/employees/${employeeId}/organization-pdf`)}
    >
      <FileDown className="size-4 mr-1" />
      Download My Organization Snapshot
    </Button>
  );
}
```

Surface in two places:

- **`/my-profile` page**: header row, top-right.
- **`<EmployeeProfileCard />`**: top-right corner of the card header.

For HR viewing another employee's card, the button is also visible (HR can pull a snapshot for any employee). v1 has no role gate.

---

## Testing

`assemble-org-snapshot.test.ts` (real Mongo):
- builds a snapshot for an employee with full data (JD, manager, reports, focus layer, foundation)
- builds a snapshot for an employee missing JD → `jobDescription = null`
- skip-level resolves through two manager-name hops
- team excludes self and caps at 8

`api-organization-pdf.test.ts`:
- smoke: GET returns 200 with `Content-Type: application/pdf` and the body starts with `%PDF-` magic bytes
- 404 on invalid id

No detailed PDF visual regression. Manual smoke validates output via `pnpm dev` + `curl > out.pdf` + opening in Preview.

---

## Performance

`@react-pdf/renderer` reasonably fast for a ~1-page document. Expect p95 < 1.5s on Vercel. Cold-start adds ~500ms when the renderer module first loads in a new function instance.

If we hit Vercel's 10s function timeout for any specific employee (unlikely), the right next step is async generation with a job queue — out of scope.

---

## Edge Cases

- **Employee with no JD assigned** → role context section hidden; cover and reporting line still render.
- **Employee with no Focus Layer or status not confirmed** → Focus Layer section hidden.
- **Foundation not set** → mission anchor section hidden (with a brief inline note: "Organizational mission not yet defined").
- **Photo over rendering size** → already capped at 200KB in sub-project #3, fits in PDF without issue.
- **Manager name unresolvable** → reporting line renders only the resolvable layers.
- **Generated PDF body**: if assembly throws, return JSON 500 — don't return malformed PDF bytes.

---

## Out of Scope (Explicit)

- Async PDF generation
- Print-CSS / browser HTML download
- White-labeled per-org branding
- Embedded org chart visualization (PDF uses text-based reporting line)
- Hyperlinks back to Ascenta inside the PDF
- Multi-language support
- PDF/A archival format
- Custom font embedding (uses Helvetica)
- Re-render on schedule / cache (PDF is generated fresh each time)
