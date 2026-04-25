# Focus Layer — Design Spec

**Date:** 2026-04-26
**Status:** Draft
**Module:** Plan / Organizational Design
**Source reqs:** `Plan Mark down.md` § 1A — Role Blueprint / Employee Focus Layer
**Position in chain:** Sub-project #2 of 6 in the Plan module roadmap.
**Builds on:** `2026-04-25-job-description-library-design.md`

---

## Context

The Job Description Library (sub-project #1) established a shared-template model: one `JobDescription` per role, referenced by many `Employee` records via `Employee.jobDescriptionId`. The Focus Layer is the per-employee mechanism that makes each person's expression of the role distinct without forking the JD itself.

Per the reqs: the employee drafts a Focus Layer using guided prompts; the manager reviews and confirms; both must agree before it's finalized. Edits later require re-confirmation. The Focus Layer becomes a load-bearing data source for the profile card (#3), the org chart hover (#4), and the My Organization PDF (#5).

---

## V1 Scope

In scope:

- New `FocusLayer` collection with one record per Employee (created lazily on first save)
- 4 structured response fields the employee answers using guided prompts
- Two-party confirmation state machine: `draft → submitted → confirmed → finalized`
- `/my-profile` page (new) where the employee drafts their Focus Layer
- Read-only display surface inside the existing `EmployeeSheet` drawer for HR/managers
- Manager-confirm action gated by `AuthUser.role === "manager"` and the target employee in `AuthUser.directReports`. HR (`AuthUser.role === "hr"`) can also confirm.
- Optional AI-assist: a "Suggest from my role" button that pre-fills draft responses based on the assigned JD's competencies and recent check-in summaries (single tool call, server-side)
- Seed data: backfill demo Focus Layers for ~5 employees in varied confirmation states for demo realism

Out of scope (explicit, deferred):

- Visibility configurability per HR settings
- Diff view / change history of past Focus Layer versions
- Direct integration into Performance Review or Leadership Library flows
- Email notifications when a manager has a Focus Layer pending confirmation
- A "request changes" loop separate from a hard re-submit
- Focus Layer for an employee with no assigned JD — UI shows "Assign a job description first"

---

## Architecture

### Approach: Separate collection, parallel-confirmation state machine

A new `focusLayers` collection. One document per Employee (unique index on `employeeId`). Created on first save; absence is the empty state. Confirmation mirrors the existing Goal pattern (`goal-schema.ts` `confirmationSchema`) — separate `employeeSubmitted` and `managerConfirmed` sub-objects each carrying `at: Date` plus optional comment.

Why a separate collection and not embedded on Employee: Focus Layer churns during drafting (multiple saves before submit). Embedding would inflate every Employee read in unrelated contexts (dashboard listings, employee picker). Independent reads also let the AI-assist tool fetch the Focus Layer without joining Employee.

Why parallel confirmation, not sequential gating like Performance Reviews: per the reqs, both parties must agree but there's no hard ordering — the employee submits first, the manager confirms; if either updates, the state resets to a re-confirm path. Mirrors the Goal pattern exactly.

### File layout

```
packages/db/src/
├── focus-layer-constants.ts          NEW — STATUS_OPTIONS, PROMPT_KEYS
├── focus-layer-schema.ts             NEW — Mongoose model
├── focus-layers.ts                   NEW — query helpers
└── index.ts                          MODIFIED — re-export

apps/platform/src/
├── app/api/focus-layers/
│   └── [employeeId]/
│       ├── route.ts                  NEW — GET, PATCH (draft), DELETE
│       ├── submit/route.ts           NEW — POST: employee submits
│       ├── confirm/route.ts          NEW — POST: manager/HR confirms
│       └── suggest/route.ts          NEW — POST: AI-assist draft
├── app/my-profile/
│   └── page.tsx                      NEW — employee self-edit page (Focus Layer + future Profile sections)
├── lib/validations/
│   └── focus-layer.ts                NEW — Zod schemas
├── lib/ai/
│   └── focus-layer-tool.ts           NEW — AI suggestion tool (mirrors grow-tools.ts pattern)
├── components/plan/focus-layer/
│   ├── focus-layer-section.tsx       NEW — top-level wrapper for /my-profile and EmployeeSheet
│   ├── focus-layer-form.tsx          NEW — draft editor (employee)
│   ├── focus-layer-read-view.tsx     NEW — read-only display
│   ├── focus-layer-status-pill.tsx   NEW — status badge
│   ├── focus-layer-confirm-bar.tsx   NEW — manager/HR confirm action
│   └── ai-suggest-button.tsx         NEW — invokes /suggest endpoint
└── components/dashboard/employee-sheet.tsx   MODIFIED — render <FocusLayerReadView />

scripts/
└── seed-focus-layers.ts              NEW — seed sample focus layers

apps/platform/src/tests/
├── focus-layers-queries.test.ts      NEW — query helpers
├── focus-layer-validation.test.ts    NEW — Zod
├── api-focus-layer-crud.test.ts      NEW — GET/PATCH/DELETE
├── api-focus-layer-state.test.ts     NEW — submit/confirm transitions
└── focus-layer-form.test.tsx         NEW — form component

package.json                          MODIFIED — add db:seed-focus-layers script
```

---

## Data Model

### New collection: `FocusLayer`

| Field | Type | Notes |
|-------|------|-------|
| `employeeId` | ObjectId | Required, unique index, ref to Employee |
| `jobDescriptionId` | ObjectId | Snapshot of JD at last submit. Preserved if employee is reassigned, surfaces "JD changed since last confirm" warning. |
| `responses.uniqueContribution` | string | "What I bring to this role that's uniquely mine" |
| `responses.highImpactArea` | string | "Where I create the most impact" |
| `responses.signatureResponsibility` | string | "Responsibilities I own that shape how the team operates" |
| `responses.workingStyle` | string | "How I prefer to work and collaborate" |
| `status` | enum | `draft \| submitted \| confirmed \| finalized` |
| `employeeSubmitted` | sub-doc | `{ at: Date \| null }` |
| `managerConfirmed` | sub-doc | `{ at: Date \| null, byUserId: ObjectId \| null, comment: string \| null }` |
| `createdAt`, `updatedAt` | Date | Auto-managed |

Indexes:

- Unique on `employeeId`
- Compound `{ jobDescriptionId: 1, status: 1 }` for "pending Focus Layers for this role" queries

State transitions:

- `(none) → draft` — employee saves any field for the first time. Lazy upsert.
- `draft → submitted` — employee clicks Submit. `employeeSubmitted.at` set.
- `submitted → confirmed` — manager/HR clicks Confirm. `managerConfirmed.at` and `byUserId` set.
- `confirmed → finalized` — automatic 24h after `confirmed` (or simply collapsed to "confirmed = finalized" — see Open Questions). For v1, treat `confirmed` as terminal until the employee edits again.
- `confirmed → submitted` — employee edits any response field after confirmation. Resets `managerConfirmed` to null and bumps `employeeSubmitted.at`.

The `finalized` state is documented but not used in v1 — keep `confirmed` as the terminal stable state; we can split it out if a workflow ever requires "finalized vs in-effect" semantics.

### Constants (client-safe)

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
```

---

## Zod Validation

`apps/platform/src/lib/validations/focus-layer.ts`:

```ts
const responseField = z.string().trim().min(0).max(2000);

export const focusLayerDraftSchema = z.object({
  responses: z.object({
    uniqueContribution: responseField,
    highImpactArea: responseField,
    signatureResponsibility: responseField,
    workingStyle: responseField,
  }).partial(),
});

export const focusLayerSubmitSchema = z.object({
  responses: z.object({
    uniqueContribution: responseField.min(20, "Add a few sentences before submitting"),
    highImpactArea: responseField.min(20),
    signatureResponsibility: responseField.min(20),
    workingStyle: responseField.min(20),
  }),
});

export const focusLayerConfirmSchema = z.object({
  comment: z.string().trim().max(1000).optional(),
});
```

Drafting accepts partial input (any field can be empty); submit requires all 4 ≥ 20 chars; confirmation accepts an optional comment.

---

## API Routes

All routes are scoped to a single employee and call `await connectDB()` first. Route base: `/api/focus-layers/[employeeId]`.

### `GET /api/focus-layers/[employeeId]`

Returns the Focus Layer document or `null` if none exists yet.

```ts
{ focusLayer: FocusLayer | null }
```

### `PATCH /api/focus-layers/[employeeId]`

Draft save. Body validated by `focusLayerDraftSchema`. Upserts the document, sets/keeps `status = "draft"`. If currently `confirmed`, demotes to `submitted` (employee edited a confirmed Focus Layer; manager re-confirms).

Auth gate (when auth context provides current user): only the employee themselves can draft. HR can override (administrative edit).

### `DELETE /api/focus-layers/[employeeId]`

Hard delete. Returns 204 on success. Used to start over.

### `POST /api/focus-layers/[employeeId]/submit`

Validate the full draft via `focusLayerSubmitSchema`, set `status = "submitted"` and `employeeSubmitted.at = now()`. 400 if any required field is empty / under threshold.

### `POST /api/focus-layers/[employeeId]/confirm`

Authorize: current user has `role === "manager"` AND the target `employeeId` is in `currentUser.directReports`, OR current user has `role === "hr"`. 403 otherwise.

Set `status = "confirmed"`, `managerConfirmed.at = now()`, `managerConfirmed.byUserId = currentUser.id`, `managerConfirmed.comment = body.comment ?? null`.

If status is not currently `submitted`, return 409.

### `POST /api/focus-layers/[employeeId]/suggest`

AI-assist endpoint. Loads the employee's assigned JD + last 3 check-ins + (optional) Strategy Studio foundation. Calls `streamObject` (Vercel AI SDK) with a structured-output schema matching `responses` and a prompt that asks for first-draft language. Returns `{ responses: { ... } }` for the form to merge into local state.

Provider: prefers OpenAI; falls back to Anthropic when only Anthropic key is set. Mirrors `apps/platform/src/lib/ai/providers.ts` patterns.

If no JD is assigned to the employee, returns 400 with a clear message ("Assign a job description before generating Focus Layer suggestions").

### Error envelope

`{ error: string, details?: unknown }`. Validation failures return `{ error: "Validation failed", details: parsed.error.flatten() }` at 400.

---

## Query Helpers

`packages/db/src/focus-layers.ts`:

```ts
getFocusLayerByEmployee(employeeId: string): Promise<FocusLayer | null>
upsertFocusLayerDraft(employeeId, jobDescriptionId, responses): Promise<FocusLayer>
submitFocusLayer(employeeId): Promise<FocusLayer>
confirmFocusLayer(employeeId, byUserId, comment?): Promise<FocusLayer>
listSubmittedAwaitingConfirmation(managerEmployeeIds: string[]): Promise<FocusLayer[]>
```

---

## UI / Components

### `/my-profile` page

A new top-level route at `apps/platform/src/app/my-profile/page.tsx`. Server component derives `currentUser` from the auth context; if no user, redirects to login (or shows a "Sign in to edit your profile" empty state — matches existing route handling).

Layout:

```
[Header]   My Profile
           [name] · [job title] · [department]

[Section]  Focus Layer                     [status pill]
           [<FocusLayerSection mode="edit" />]

[Section]  About Me (Get to Know)          ← stub for sub-project #3
           [Empty placeholder until #3 ships]
```

For v1, only the Focus Layer section is implemented. The "About Me" section is a placeholder card with copy that says "Profile fields coming soon" — sub-project #3 fills it in.

### `<FocusLayerSection mode="edit | view" employeeId>`

Top-level container that:

- Fetches the current Focus Layer (`GET /api/focus-layers/[employeeId]`)
- Fetches the assigned JD title for context display
- Renders either `<FocusLayerForm />` (edit) or `<FocusLayerReadView />` (view)
- Renders `<FocusLayerStatusPill />` and (in `view` mode for managers/HR) `<FocusLayerConfirmBar />`

If the employee has no assigned JD, shows a non-blocking notice: "Once a job description is assigned to you, you'll be able to draft your Focus Layer."

### `<FocusLayerForm />`

react-hook-form + Zod resolver. Fields driven by `FOCUS_LAYER_PROMPTS` (4 textareas).

Top-right: `<AiSuggestButton />` that calls `POST /api/focus-layers/[employeeId]/suggest` and merges responses into the form (`reset({...})` with confirm dialog if any field already has content).

Auto-saves on blur (debounced) via PATCH. Save state pill near the title: "Saving...", "Saved", "Saved · 2 min ago".

Submit button at the bottom enabled only when every field has ≥ 20 chars. Submit triggers `POST /submit`.

If the Focus Layer is `confirmed` and the user begins editing, an inline banner warns: "Editing this will require your manager to re-confirm."

### `<FocusLayerReadView />`

Reusable read-only component used in:
- The `view` mode of FocusLayerSection (HR/manager)
- The existing `EmployeeSheet` drawer (sub-project #1's surface)
- Sub-project #5's PDF data assembly (server-side render)

Renders the 4 responses with their prompt labels. Empty fields render as "Not yet shared". Above the responses: status pill + last update timestamp.

### `<FocusLayerConfirmBar />`

Shown only when:
- Current user has `role === "manager"` AND `employeeId IN currentUser.directReports`, OR `role === "hr"`
- Focus Layer status is `submitted`

Action: a "Confirm Focus Layer" button + optional comment textarea. Submits `POST /confirm`.

Below the bar, when status is `confirmed`: "Confirmed by [manager name] on [date]." If a `comment` is set, it's shown as a quote.

### `<FocusLayerStatusPill />`

Maps status → Badge variant:
- `draft` → muted
- `submitted` → blue (awaiting confirmation)
- `confirmed` → green

### `EmployeeSheet` modification

`apps/platform/src/components/dashboard/employee-sheet.tsx` adds a new section between the existing notes and documents:

```tsx
<FocusLayerSection mode="view" employeeId={employee.id} />
```

Read-only for everyone except managers/HR who see the confirm bar inline.

---

## AI Suggestion Tool

`apps/platform/src/lib/ai/focus-layer-tool.ts` exports a single function `generateFocusLayerSuggestion(employeeId, options)`:

1. Load Employee, JobDescription (if assigned), 3 most recent CheckIns, Strategy Studio Foundation.
2. Construct a structured prompt:

   > You're helping {firstName} {lastName}, a {jobTitle} in {department}, draft the Focus Layer for their role. The role description includes these competencies: {comp1, comp2, ...}. Recent check-in themes: {summary}. Generate first-draft responses to these four prompts. Each response should be 2-3 sentences in plain, first-person language. Ground responses in the role's actual responsibilities, not generic platitudes.

3. Use `generateObject` with a Zod schema mirroring `responses`.
4. Return `{ responses }`.

Provider selection mirrors `lib/ai/providers.ts`. If neither OpenAI nor Anthropic is configured, the endpoint returns 503 with a clear message and the UI hides the suggest button.

---

## Seed Data

`scripts/seed-focus-layers.ts` (`pnpm db:seed-focus-layers`):

- Picks up to 5 employees who have `jobDescriptionId` set (output of seed-job-descriptions backfill)
- Inserts Focus Layer documents in varied states: 1 draft, 2 submitted, 2 confirmed
- Confirmed records carry plausible `managerConfirmed.at` and `comment`
- Writes the realistic prose responses inline; not lorem ipsum

Idempotent (upsert keyed on employeeId).

---

## Testing

Real Mongo, Vitest, per-test `FOCUS_TEST_` prefix:

`focus-layers-queries.test.ts`:
- upsert creates draft, returns existing on second call
- submit fails when responses missing
- confirm fails when status not submitted
- confirm sets timestamp, byUserId, comment

`focus-layer-validation.test.ts`:
- draft schema accepts partial responses
- submit schema rejects empty / short responses

`api-focus-layer-crud.test.ts`:
- GET returns null when no record
- PATCH creates draft, demotes confirmed → submitted on edit

`api-focus-layer-state.test.ts`:
- POST /submit advances draft → submitted
- POST /confirm requires submitted state, sets confirmed + byUserId
- POST /confirm 403 when not manager-of-employee or HR

`focus-layer-form.test.tsx`:
- Renders 4 prompts from FOCUS_LAYER_PROMPTS
- Submit disabled when any field < 20 chars
- AI-suggest button absent when no JD assigned

AI suggest endpoint is **not** tested with real provider calls — too flaky for CI. Unit-test the prompt assembly and schema parsing only; the integration runs via a manual smoke check.

---

## Error Handling & Edge Cases

- **Employee has no JD assigned** → UI shows non-blocking notice; AI suggest disabled; manual draft still allowed (status `draft` only). Submit blocked with explanatory error.
- **JD changes after Focus Layer is confirmed** → On next employee load, UI banner: "Your job description changed since this Focus Layer was confirmed. Review and resubmit if needed." `jobDescriptionId` snapshot stays as-is until next save.
- **Manager changes (Employee.managerName updates)** → No data effect on existing Focus Layer; new manager can confirm next submit.
- **Auth context missing in dev** → Confirm endpoint allows the call when `NODE_ENV !== "production"` AND no user in session, with a console warning. Dev convenience.
- **Concurrent edit + submit** → Last write wins on `responses` (Mongoose default); status transitions are idempotent.
- **Manager unassigns their direct report mid-flow** → Confirmation endpoint will 403; HR can still confirm.
- **Deleting an employee** → Cascade: delete the corresponding Focus Layer record. Add this to the existing employee-delete path if one exists; otherwise, document as a future cleanup task (employee deletion isn't a v1 path).

---

## Open Questions

- **Finalized vs Confirmed split** — current spec collapses to `confirmed` as terminal. If a downstream feature ever needs "confirmed but not yet active" semantics, we'll add `finalized` then. No action now.
- **Manager comment surfacing** — confirm comment is stored but only shown in the read view. No notification/email until the workflow engine ships in #6b.
- **AI provider fallback** — if `OPENAI_API_KEY` is unset and only Anthropic is available, the suggest tool uses Anthropic. Document this in the AI tool's comment header but no UI surface.

---

## Out of Scope (Explicit)

- Profile / Get to Know fields (sub-project #3)
- Org chart integration (sub-project #4 — uses `<FocusLayerReadView />` in popovers)
- PDF rendering (sub-project #5 — calls `getFocusLayerByEmployee()` server-side)
- Notification/email when a Focus Layer is awaiting manager confirmation (becomes a workflow in #6)
- Visibility configurability (HR setting per organization)
- Diff view of changed responses
- Approval comment threads / discussion
- Performance Review integration
- Leadership Library guidance surfaced based on Focus Layer keywords
