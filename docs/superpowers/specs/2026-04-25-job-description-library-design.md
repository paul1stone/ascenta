# Job Description Library — Design Spec

**Date:** 2026-04-25
**Status:** Draft
**Module:** Plan / Organizational Design
**Source reqs:** `Plan Mark down.md` § 1A — Role Blueprint
**Position in chain:** Sub-project #1 of 6 in the Plan module roadmap (Job Description Library → Focus Layer → Profile Card → Org Chart → My Organization Download → HR Operations workflows).

---

## Context

The Plan module is currently a stub. Two sub-pages exist in nav (`plan/org-design`, `plan/operations`) with empty page configs. The full Plan reqs describe 6 distinct subsystems; this spec covers the first one: **Job Description Library**, which is the foundation for everything else in Section 1 (Focus Layer attaches to a JD; profile cards pull role title from a JD; the org chart visualizes JD relationships; My Organization Download embeds the JD).

V1 ships a working library that HR can use to define and assign role descriptions. Bulk import, version control, and approval workflows are deferred — they're governance features that matter once a populated library exists.

---

## V1 Scope

In scope:

- Library CRUD: create, edit, list, search, filter, view, delete
- Template builder: structured form with required content sections
- Role assignment: attach a JD to one or more `Employee` records
- Seed data: ~10 realistic example JDs auto-attached to existing demo employees by title match
- Bulk import button visible in the UI but stubbed (opens "Coming soon" modal)
- Tab integration on `plan/org-design` with a stub `Org Chart` tab placeholder for the next sub-project

Out of scope (deferred):

- AI-powered bulk import from Word/PDF/CSV (button only — extraction logic comes in a future iteration)
- Version control / change history
- Configurable approval workflow
- Focus Layer (sub-project #2)
- Profile card integration (sub-project #3)
- Authentication / role-based access — the app has no auth layer; v1 ships open like the rest of the platform

---

## Architecture

### Approach: Shared template, per-employee reference

A `JobDescription` is a shared template. Many employees can reference one JD (e.g., 12 software engineers all reference the same "Software Engineer" record). The Focus Layer (future sub-project) is the per-employee mechanism for capturing how an individual fills the role; JDs themselves stay canonical and reusable.

Alternative considered: per-employee JD copies (each assignment clones the template). Rejected because the Focus Layer is the explicit mechanism for individual variation per the reqs, and per-employee copies create a maintenance burden and duplicate data without unique benefit.

### File layout

```
packages/db/src/
├── job-description-schema.ts          NEW — Mongoose model
├── job-description-constants.ts       NEW — LEVEL_OPTIONS, EMPLOYMENT_TYPE_OPTIONS (client-safe)
├── job-descriptions.ts                NEW — query helpers
├── employee-schema.ts                 MODIFIED — add jobDescriptionId ref
└── index.ts                           MODIFIED — export new helpers

apps/platform/src/
├── app/api/job-descriptions/
│   ├── route.ts                       NEW — GET list, POST create
│   └── [id]/
│       ├── route.ts                   NEW — GET, PATCH, DELETE
│       └── employees/route.ts         NEW — GET assigned, POST assign, DELETE unassign
├── lib/validations/
│   └── job-description.ts             NEW — Zod schemas
├── lib/constants/dashboard-nav.ts     MODIFIED — add tabs to plan/org-design PageConfig
├── components/plan/                   NEW directory
│   ├── org-design-tabs.tsx
│   ├── org-design-empty-tab.tsx
│   └── job-descriptions/
│       ├── library-view.tsx
│       ├── library-table.tsx
│       ├── library-filter-bar.tsx
│       ├── jd-form.tsx
│       ├── jd-detail.tsx
│       ├── jd-assign-dialog.tsx
│       ├── jd-import-stub-dialog.tsx
│       └── bullet-list-field.tsx
└── app/[category]/[sub]/page.tsx      MODIFIED — render OrgDesignTabs for plan/org-design

scripts/
└── seed-job-descriptions.ts           NEW — seed JDs + backfill employees

apps/platform/src/__tests__/
├── api/job-descriptions/
│   ├── list.test.ts
│   ├── crud.test.ts
│   └── employees.test.ts
└── components/plan/
    ├── jd-form.test.tsx
    └── library-table.test.tsx

package.json                            MODIFIED — add db:seed-jds script
```

---

## Data Model

### New collection: `JobDescription`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required, indexed. Display name (e.g., "Senior Software Engineer"). |
| `department` | string | Required, indexed. Free-text for v1; can become enum later if needed. |
| `level` | enum | Required, indexed. One of `LEVEL_OPTIONS`. |
| `employmentType` | enum | Required, indexed. One of `EMPLOYMENT_TYPE_OPTIONS`. |
| `roleSummary` | string | Required, multi-line. 1–3 paragraphs describing the role's purpose. |
| `coreResponsibilities` | string[] | Required, min length 1. Array of bullet items. |
| `requiredQualifications` | string[] | Required, min length 1. Array of bullet items. |
| `preferredQualifications` | string[] | Optional. Array of bullet items. |
| `competencies` | string[] | Required, min length 1. Array of bullet items. |
| `status` | enum | `draft \| published`. Default `published`. |
| `createdAt`, `updatedAt` | Date | Auto via mongoose timestamps. |

Indexes:

- Single-field on `title`, `department`, `level`, `employmentType`, `status`
- Compound on `{ department: 1, level: 1 }` for filtered list views

`toJSON` / `toObject` virtuals expose `id` as `_id.toString()` matching the existing pattern.

### Constants (client-safe — no mongoose import)

```ts
// packages/db/src/job-description-constants.ts
export const LEVEL_OPTIONS = [
  "entry", "mid", "senior", "lead", "manager", "director", "executive",
] as const;
export type Level = typeof LEVEL_OPTIONS[number];

export const EMPLOYMENT_TYPE_OPTIONS = [
  "full_time", "part_time", "contract", "intern",
] as const;
export type EmploymentType = typeof EMPLOYMENT_TYPE_OPTIONS[number];

export const STATUS_OPTIONS = ["draft", "published"] as const;
export type JdStatus = typeof STATUS_OPTIONS[number];

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
```

### Employee schema delta

Add to `employee-schema.ts`:

```ts
jobDescriptionId: {
  type: Schema.Types.ObjectId,
  ref: "JobDescription",
  index: true,
  default: null,
}
```

`Employee.jobTitle` (the existing string field) stays. When a JD is assigned, the UI prefers the JD's title; `jobTitle` remains as the underlying record value and as a fallback for unassigned employees. No migration needed.

---

## Zod Validation

`apps/platform/src/lib/validations/job-description.ts`:

```ts
export const jobDescriptionInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  department: z.string().trim().min(1).max(100),
  level: z.enum(LEVEL_OPTIONS),
  employmentType: z.enum(EMPLOYMENT_TYPE_OPTIONS),
  roleSummary: z.string().trim().min(20).max(4000),
  coreResponsibilities: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  requiredQualifications: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  preferredQualifications: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
  competencies: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  status: z.enum(STATUS_OPTIONS).default("published"),
});

export const jobDescriptionPatchSchema = jobDescriptionInputSchema.partial();

export const assignEmployeesSchema = z.object({
  employeeIds: z.array(z.string()).min(1).max(500),
});
```

The Zod schemas are imported by both API routes and the React form (single source of truth for client + server validation).

---

## API Routes

All routes call `await connectDB()` first. No auth gate (matches existing app pattern). Errors return `{ error: string, details?: unknown }`.

### `GET /api/job-descriptions`

List with search/filter/pagination.

Query params:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `q` | string | — | Case-insensitive regex match against `title` and `roleSummary`. |
| `department` | string | — | Exact match. |
| `level` | enum | — | Exact match. |
| `employmentType` | enum | — | Exact match. |
| `status` | enum \| `"all"` | `published` | Pass `all` to include drafts. |
| `limit` | number | 50 | Cap 200. |
| `offset` | number | 0 | |

Response:

```ts
{
  jobDescriptions: Array<JobDescription & { assignedCount: number }>,
  total: number,
}
```

`assignedCount` is computed via a `$lookup` aggregation against `employees` so the table can show counts without N+1 queries.

### `POST /api/job-descriptions`

Create. Body validated by `jobDescriptionInputSchema`. Returns 201 with the created record.

### `GET /api/job-descriptions/[id]`

Returns single JD. 404 if not found.

### `PATCH /api/job-descriptions/[id]`

Update. Body validated by `jobDescriptionPatchSchema`. Returns updated record. 404 if not found.

### `DELETE /api/job-descriptions/[id]`

Hard delete. Side effect: clears `jobDescriptionId` on every employee referencing this JD.

```ts
await Employee.updateMany({ jobDescriptionId: id }, { $set: { jobDescriptionId: null } });
await JobDescription.findByIdAndDelete(id);
```

Returns `{ unassignedEmployees: number }`. 404 if not found.

### `GET /api/job-descriptions/[id]/employees`

Returns employees with `jobDescriptionId === id`, sorted by lastName. Same fields as the existing employee listing endpoint.

### `POST /api/job-descriptions/[id]/employees`

Assign one or more employees. Body: `{ employeeIds: string[] }`. Sets `Employee.jobDescriptionId` on each. Idempotent — assigning an already-assigned employee is a no-op. Returns `{ assignedCount: number }`.

### `DELETE /api/job-descriptions/[id]/employees`

Unassign. Body: `{ employeeIds: string[] }`. Clears `Employee.jobDescriptionId` only when it currently equals this JD's id (prevents accidental unassign cross-JD). Returns `{ unassignedCount: number }`.

---

## Query Helpers

`packages/db/src/job-descriptions.ts` exports:

```ts
listJobDescriptions(filters: ListFilters): Promise<{ items: JobDescriptionDoc[]; total: number }>
getJobDescriptionById(id: string): Promise<JobDescriptionDoc | null>
listAssignedEmployees(jobDescriptionId: string): Promise<EmployeeDoc[]>
countAssignedEmployees(jobDescriptionIds: string[]): Promise<Record<string, number>>
```

`listJobDescriptions` returns items already enriched with `assignedCount` via aggregation pipeline.

---

## UI / Components

### Tab integration

`apps/platform/src/lib/constants/dashboard-nav.ts` — update `plan/org-design` PageConfig:

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

The existing `[category]/[sub]/page.tsx` already reads `tabs` from the PageConfig. Active tab is held in the URL (`?tab=job-descriptions`) so refresh preserves position. Default tab is `job-descriptions`.

`<OrgDesignTabs />` is a client component that renders the appropriate panel based on the active tab. The Org Chart tab shows `<OrgDesignEmptyTab />` — a centered illustration + "Org Chart coming soon" copy.

### `library-view.tsx`

Top-level Job Descriptions tab content.

Layout:

```
[ Header bar                                                            ]
[ Title: "Job Descriptions"   [Import] [+ New Job Description]          ]

[ Filter bar                                                             ]
[ [search input "q"] [Department▼] [Level▼] [Employment Type▼] [Status▼]]

[ <LibraryTable />                                                       ]

[ (Empty state if no results match)                                      ]
```

- Data fetched client-side via `fetch("/api/job-descriptions?...")` debounced 300ms on filter changes
- "Import" button → opens `<JdImportStubDialog />`
- "New Job Description" button → opens a `Sheet` (slide-in panel) containing `<JdForm mode="create" />`
- Empty state CTA: "Create your first job description" or "Import existing descriptions"

### `library-table.tsx`

Sortable table.

| Title | Department | Level | Employment Type | Assigned | Status | Updated |

- Click row → opens `<JdDetail />` in a Sheet
- "Assigned" column: `<Badge>` showing the `assignedCount`
- "Status" column: shows `Draft` badge in muted color when `status === "draft"`, hidden otherwise
- Sort: title, department, updatedAt (default desc)

### `jd-form.tsx`

react-hook-form + Zod resolver (matches existing `components/grow/forms/` pattern).

Sections:

1. **Basics** — Title, Department, Level, Employment Type, Status
2. **Role Summary** — textarea, 5 rows
3. **Core Responsibilities** — `<BulletListField />` repeater, min 1
4. **Required Qualifications** — `<BulletListField />` repeater, min 1
5. **Preferred Qualifications** — `<BulletListField />` repeater, optional
6. **Competencies** — `<BulletListField />` repeater, min 1

Submit / Cancel at the bottom. On submit:

- Create → `POST /api/job-descriptions`, on success close sheet and refresh list
- Edit → `PATCH /api/job-descriptions/[id]`, on success switch from edit mode to detail view

Validation errors displayed inline per field. Server errors surfaced via toast.

### `bullet-list-field.tsx`

Reusable repeater component. Each row is a single-line `<Input>` with a remove button. Footer has "Add item" button. Drag-reorder is YAGNI for v1.

Props: `name`, `label`, `min?`, `max?`, `placeholder?`.

### `jd-detail.tsx`

Read view rendered in a Sheet. Sections:

- Header: Title (h2), Department · Level · Employment Type meta line, Status badge
- Edit / Delete actions (top right)
- Role Summary block
- Core Responsibilities, Required Qualifications, Preferred Qualifications, Competencies — bulleted lists
- "Assigned Employees" panel at bottom:
  - Count + "Assign Employee" button
  - List of assigned employees (name, jobTitle, department) with Unassign action per row
  - Empty state: "No employees assigned yet."

Edit button swaps detail view in-place with `<JdForm mode="edit" initialValues={jd} />`. Delete shows a confirm dialog warning about unassign cascade ("This will also unassign N employees currently assigned to this role.").

### `jd-assign-dialog.tsx`

Multi-select employee picker, modal dialog.

- Search input (filters by name or department, client-side over a fetched list of unassigned-or-other-JD employees)
- Checkbox list with name, jobTitle, department, and "Currently: <other JD title>" when applicable
- Submit button: "Assign N employees" → `POST /api/job-descriptions/[id]/employees`
- Closes on success, parent refreshes assigned list

Employees already assigned to the current JD are excluded from the list.

### `jd-import-stub-dialog.tsx`

Static informational modal:

- Title: "Bulk Import"
- Body: "Coming soon. Upload Word, PDF, or CSV files to extract job descriptions automatically. Reach out to support to discuss your import needs."
- Single "Got it" button to dismiss

---

## Seed Data

`scripts/seed-job-descriptions.ts` — invoked via `pnpm db:seed-jds`. Idempotent (uses `findOneAndUpdate` upsert keyed on title).

Seeds ~10 realistic JDs spanning departments and levels, e.g.:

- Software Engineer (Engineering, mid, full_time)
- Senior Software Engineer (Engineering, senior, full_time)
- Engineering Manager (Engineering, manager, full_time)
- Product Manager (Product, mid, full_time)
- Director of Product (Product, director, full_time)
- People Operations Specialist (People, mid, full_time)
- People Operations Lead (People, lead, full_time)
- Account Executive (Sales, mid, full_time)
- Sales Director (Sales, director, full_time)
- Operations Coordinator (Operations, entry, full_time)

Each seeded JD has 4–6 responsibilities, 3–5 required qualifications, 2–3 preferred qualifications, 4–6 competencies. Realistic copy, not lorem ipsum.

After upserting JDs, the script runs a backfill pass:

1. For each existing `Employee`, attempt case-insensitive substring match between `Employee.jobTitle` and `JobDescription.title`. Prefer exact matches; fall back to substring.
2. On match → set `Employee.jobDescriptionId`.
3. Log a summary: "Seeded N JDs, attached X/Y employees, Z unmatched: <list>".

It's acceptable to update the existing `db:seed` employee data so titles align cleanly with the seeded JDs — this is all demo data.

---

## Testing

Vitest, real Mongo per existing repo convention. `MONGODB_URI` from `.env.local`. Each test cleans up its own records by tagging titles with a per-test prefix.

### API tests (`apps/platform/src/__tests__/api/job-descriptions/`)

`list.test.ts`:

- returns published JDs by default, excludes drafts
- `status=all` includes drafts
- `q` matches title and roleSummary case-insensitively
- `department`, `level`, `employmentType` filters
- `limit`/`offset` pagination, `total` accurate
- `assignedCount` aggregation returns correct counts when employees exist

`crud.test.ts`:

- POST creates with valid payload, defaults `status` to `published`
- POST 400s on missing required fields, missing min-1 array entries, invalid enum values
- GET by id returns 404 for unknown id
- PATCH updates partial fields, leaves others intact
- DELETE returns 404 for unknown id
- DELETE clears `jobDescriptionId` on all assigned employees and returns `unassignedEmployees` count

`employees.test.ts`:

- GET returns assigned employees sorted by lastName
- POST assigns multiple employees, idempotent on re-assign
- DELETE unassigns only employees whose current `jobDescriptionId` matches this JD (does not unassign employees assigned to other JDs)

### Component tests (`apps/platform/src/__tests__/components/plan/`)

`jd-form.test.tsx`:

- Renders all required fields
- Submit disabled / shows errors when required fields missing
- BulletListField add/remove rows; cannot remove below min
- Submits expected payload shape on valid input

`library-table.test.tsx`:

- Renders rows from data prop
- Empty state when `items` is empty
- Sort by title and updatedAt

### Out of scope for v1 tests

- E2E browser tests (no Playwright in repo today)
- Visual regression
- The bulk import stub dialog (trivial static content)

---

## Error Handling & Edge Cases

- **Deleting a JD with assigned employees** — confirmed via dialog; cascade clears refs; no orphaned `jobDescriptionId` values.
- **Two JDs with the same title** — allowed; the seed script keys upserts on title to stay idempotent, but humans can create duplicates if they choose. No uniqueness constraint.
- **Assigning an employee already assigned to another JD** — overwrites the previous reference. The assign dialog surfaces the prior JD title in the row so HR sees the move explicitly.
- **Empty preferred qualifications array** — accepted (defaults to `[]`).
- **Status `draft`** — JDs hidden from default library list. Visible when `status=all`. Drafts cannot be assigned to employees (assign dialog filters to published JDs only).
- **Missing `MONGODB_URI` in tests** — Vitest tests skip with a clear error message rather than failing silently.

---

## Open Questions / Risks

- **Department free-text vs enum**: shipping as free-text for v1. If JDs proliferate with inconsistent department names ("Eng" vs "Engineering"), we'll add a `departments` collection + dropdown later. Tracked as a follow-up if it becomes friction.
- **Drag-reorder for bullet list items**: deferred. If users complain about reordering responsibilities, add later.
- **Permissions**: app has no auth layer. When auth ships globally, restrict mutations to HR/People Ops role; reads stay open per the reqs ("All employees can view... HR and leadership can see expanded administrative data").
- **Bulk import implementation**: tracked as a future sub-project. Existing PDF/DOCX parsing in `/api/documents/upload` provides reusable infrastructure for the eventual AI-powered extraction flow.

---

## Out of Scope (Explicit)

The following are part of the broader Plan reqs but **not in this spec**:

- Focus Layer (sub-project #2)
- People Org Chart visualization (sub-project #4)
- Employee Profile Card with Get to Know fields (sub-project #3)
- My Organization Download PDF (sub-project #5)
- HR Operations workflow showcase and engine (Section 2 of Plan reqs — separate track)
- Version control / revision history on JDs
- Approval workflow on JD publish
- AI-powered bulk import (Word/PDF/CSV → structured JD extraction)
- Cross-module integrations (Interview Kits, Performance Reviews, Leadership Library)
