# Employee Profile Card + Get to Know — Design Spec

**Date:** 2026-04-27
**Status:** Draft
**Module:** Plan / Organizational Design
**Source reqs:** `Plan Mark down.md` § 1B — People Org Chart / Employee Profile Card
**Position in chain:** Sub-project #3 of 6 in the Plan module roadmap.
**Builds on:** `2026-04-25-job-description-library-design.md`, `2026-04-26-focus-layer-design.md`

---

## Context

The reqs define the Profile Card as a two-section artifact: Professional Summary (role data — title, department, reporting structure, contact) and Get to Know (employee-authored personal context — bio, hobbies, "ask me about", etc.). The Get to Know section is the human layer that makes the org chart feel like people instead of org-units; the reqs require all 7 fields for active employees.

This sub-project ships the data model, the editor, and a reusable read-only card component that becomes the visual primitive for sub-project #4 (org chart node click) and sub-project #5 (PDF rendering).

---

## V1 Scope

In scope:

- New `profile` embedded sub-document on `Employee` (one-to-one, never queried separately)
- 7 required Get to Know fields per reqs: personal bio, hobbies/interests, fun facts (1–3 entries), ask-me-about, hometown/background, currently reading/listening, employee choice (custom-labeled)
- Optional photo via Base64 inline storage on `profile.photoBase64` (data URL). Documented limit: 200KB after compression.
- Optional fields: pronouns, contact preference (Slack handle, etc.), start date (derived from `Employee.hireDate`)
- "About Me" section on `/my-profile` page (page already exists from sub-project #2)
- HR-edit path: profile edit form rendered inline in `EmployeeSheet`
- Reusable `<EmployeeProfileCard />` read-only component:
  - `mode="dialog"` — opens in a Dialog (used elsewhere in the app)
  - `mode="inline"` — inline render (used inside EmployeeSheet, future PDF, future org chart popover)
- Completion pill rendered everywhere the card appears (e.g., "5 of 7 complete"). Hidden when 100% complete.
- Seed update: backfill realistic demo profile data on existing employees so the demo looks populated

Out of scope:

- Real photo upload pipeline (S3/R2/UploadThing) — tracked as a future sub-project once auth ships
- Per-field visibility configurability for HR
- 14-day post-hire reminder automation (becomes a workflow in sub-project #6)
- Profile change-history / audit
- Employee directory redesign (uses the existing dashboard component as-is)

---

## Architecture

### Approach: Embed `profile` on Employee

A single embedded sub-document on `Employee`. Rationale:

- One-to-one cardinality — every employee has at most one profile.
- Edited as one unit (the form patches the entire `profile` sub-doc).
- Always read alongside the employee (employee detail, profile card, org chart click).
- No separate query patterns demand a standalone collection.

This matches the pattern already established by `Employee.notes[]` (embedded sub-doc array) and is the simplest fit.

### File layout

```
packages/db/src/
├── employee-profile-constants.ts     NEW — GET_TO_KNOW_FIELDS, REQUIRED_KEYS
├── employee-schema.ts                MODIFIED — add `profile` sub-doc
└── employees.ts                      MODIFIED — getProfileCompletion helper

apps/platform/src/
├── app/api/employees/[id]/profile/
│   └── route.ts                      NEW — GET (returns profile only), PATCH
├── app/my-profile/page.tsx           MODIFIED — replace placeholder with <ProfileEditSection />
├── lib/validations/
│   └── employee-profile.ts           NEW — Zod schemas
├── components/plan/profile/
│   ├── employee-profile-card.tsx     NEW — read-only, dialog | inline modes
│   ├── profile-edit-form.tsx         NEW — form (Get to Know section)
│   ├── profile-completion-badge.tsx  NEW — "5 of 7 complete"
│   ├── profile-photo-input.tsx       NEW — file → Base64 with size cap
│   ├── profile-edit-section.tsx      NEW — wrapper for /my-profile and EmployeeSheet
│   └── fun-facts-field.tsx           NEW — repeater for 1-3 fun facts
└── components/dashboard/employee-sheet.tsx   MODIFIED — render <EmployeeProfileCard mode="inline" />

scripts/
└── seed-employee-profiles.ts         NEW — seed Get to Know data

apps/platform/src/tests/
├── employee-profile-validation.test.ts NEW — Zod
├── api-employee-profile.test.ts       NEW — GET / PATCH
├── employee-profile-card.test.tsx     NEW — read-only render
└── profile-edit-form.test.tsx         NEW — form behavior

package.json                          MODIFIED — add db:seed-profiles
```

---

## Data Model

### `Employee.profile` sub-document

```ts
profile: {
  photoBase64: string | null      // data URL, max 200KB encoded
  pronouns: string | null
  preferredChannel: string | null  // e.g., "Slack: @jane"
  getToKnow: {
    personalBio: string            // required for completion
    hobbies: string                 // required
    funFacts: string[]              // required, min 1, max 3
    askMeAbout: string              // required
    hometown: string                // required
    currentlyConsuming: string      // required ("currently reading/listening")
    employeeChoice: {
      label: string                 // employee-authored field name
      value: string                 // the content
    }                               // required (label + value)
  }
  profileUpdatedAt: Date | null
}
```

Required-for-completion keys (used by the completion badge):

```ts
const COMPLETION_KEYS = [
  "personalBio",
  "hobbies",
  "funFacts",
  "askMeAbout",
  "hometown",
  "currentlyConsuming",
  "employeeChoice",
] as const;
```

Field is "complete" when:
- string fields have ≥ 1 trimmed character
- `funFacts` has ≥ 1 entry with non-empty text
- `employeeChoice` has both `label` and `value` non-empty

Photo and pronouns are nice-to-have, not counted toward completion.

### Schema delta on Employee

```ts
// packages/db/src/employee-schema.ts (modification)

const employeeChoiceSchema = new Schema(
  { label: { type: String, default: "", trim: true }, value: { type: String, default: "", trim: true } },
  { _id: false },
);

const getToKnowSchema = new Schema(
  {
    personalBio: { type: String, default: "", trim: true },
    hobbies: { type: String, default: "", trim: true },
    funFacts: { type: [String], default: [] },
    askMeAbout: { type: String, default: "", trim: true },
    hometown: { type: String, default: "", trim: true },
    currentlyConsuming: { type: String, default: "", trim: true },
    employeeChoice: { type: employeeChoiceSchema, default: () => ({}) },
  },
  { _id: false },
);

const profileSchema = new Schema(
  {
    photoBase64: { type: String, default: null },
    pronouns: { type: String, default: null, trim: true },
    preferredChannel: { type: String, default: null, trim: true },
    getToKnow: { type: getToKnowSchema, default: () => ({}) },
    profileUpdatedAt: { type: Date, default: null },
  },
  { _id: false },
);

// In employeeSchema:
profile: { type: profileSchema, default: () => ({}) },
```

### Constants

```ts
// packages/db/src/employee-profile-constants.ts

export const GET_TO_KNOW_FIELDS = [
  { key: "personalBio", label: "Personal bio", helper: "A short bit about you in your own voice.", multiline: true, placeholder: "I grew up in three cities and learned to write code on a hand-me-down ThinkPad..." },
  { key: "hobbies", label: "Hobbies and interests", helper: "What do you enjoy outside of work?", multiline: true, placeholder: "Long-distance trail running, vinyl collecting, learning languages slowly." },
  { key: "askMeAbout", label: "Ask me about", helper: "Topics you enjoy chatting about.", multiline: false, placeholder: "Soundtrack analysis, regenerative agriculture, board games" },
  { key: "hometown", label: "Hometown or background", helper: "Where you're from or a meaningful place in your story.", multiline: false, placeholder: "Born in Lima, raised in Madrid" },
  { key: "currentlyConsuming", label: "Currently reading or listening to", helper: "Something you'd recommend right now.", multiline: false, placeholder: "Re-reading 'The Goal' and the Acquired podcast" },
] as const;

export const FUN_FACTS_MIN = 1;
export const FUN_FACTS_MAX = 3;
```

---

## Zod Validation

`apps/platform/src/lib/validations/employee-profile.ts`:

```ts
const safeText = z.string().trim().max(2000);
const shortText = z.string().trim().max(200);

export const profilePatchSchema = z.object({
  photoBase64: z.string().nullable().optional()
    .refine((v) => v == null || (v.startsWith("data:image/") && v.length <= 280_000),
      { message: "Photo must be a data URL under ~200KB" }),
  pronouns: shortText.nullable().optional(),
  preferredChannel: shortText.nullable().optional(),
  getToKnow: z.object({
    personalBio: safeText.optional(),
    hobbies: safeText.optional(),
    funFacts: z.array(z.string().trim().max(200)).max(3).optional(),
    askMeAbout: shortText.optional(),
    hometown: shortText.optional(),
    currentlyConsuming: shortText.optional(),
    employeeChoice: z.object({
      label: shortText.optional(),
      value: safeText.optional(),
    }).optional(),
  }).partial().optional(),
});
```

Save-partial: every field is optional, including the photo. Completion is computed at read time, not enforced on save.

---

## API Routes

### `GET /api/employees/[id]/profile`

Returns the `profile` sub-doc plus a computed `completion: { complete: number, total: 7, percent: number, missingKeys: string[] }`.

```ts
{
  profile: { ... },
  completion: { complete: 4, total: 7, percent: 57, missingKeys: ["funFacts","employeeChoice","hometown"] }
}
```

404 if employee not found.

### `PATCH /api/employees/[id]/profile`

Body validated by `profilePatchSchema`. Uses `$set` with dot-paths so partial updates don't clobber sibling fields. Sets `profile.profileUpdatedAt = now()`. Returns the updated profile + recomputed completion.

403 reserved for future auth gate (employee can edit only their own profile; HR can edit any). For v1 with the existing dev-header auth pattern, the route accepts the call.

---

## Query Helpers

`packages/db/src/employees.ts` — additions:

```ts
export function computeProfileCompletion(profile: ProfileDoc): {
  complete: number;
  total: number;
  percent: number;
  missingKeys: string[];
};

export async function getEmployeeProfile(id: string): Promise<{
  profile: ProfileDoc;
  completion: ReturnType<typeof computeProfileCompletion>;
} | null>;
```

`computeProfileCompletion` is pure (no DB), tested as a unit.

---

## UI / Components

### `<EmployeeProfileCard mode="dialog" | "inline" employeeId>`

The reusable read-only primitive. Fetches employee + profile + completion. Renders:

```
┌────────────────────────────────────────────────────┐
│  [Photo]  Jane Doe  · she/her    [completion pill] │
│           Senior Engineer · Engineering             │
│           Reports to: Adam Manager                  │
│                                                     │
│  About Me                                           │
│   Bio paragraph...                                  │
│   Hobbies & interests: ...                          │
│   Fun facts: ...                                    │
│   Ask me about: ...                                 │
│   Hometown: ...                                     │
│   Currently reading: ...                            │
│   "<custom label>": <custom value>                  │
│                                                     │
│  Focus Layer  [link or inline summary if confirmed] │
└────────────────────────────────────────────────────┘
```

The card pulls the Focus Layer summary at the bottom — when status is `confirmed`, the card calls `<FocusLayerReadView />` from sub-project #2 and renders a condensed version. When not confirmed, the section is hidden (or shows "Focus Layer not yet shared" depending on viewer).

`mode="dialog"` wraps the content in `<Dialog>`/`<DialogContent>` with a trigger; `mode="inline"` renders the same body without the dialog wrapper.

### `<ProfileEditSection mode="self" | "hr" employeeId>`

Used on `/my-profile` (`mode="self"`) and inside `EmployeeSheet` for HR users (`mode="hr"`). Renders:

- `<ProfilePhotoInput />` at top (Base64 conversion + size cap)
- `<Input>` for pronouns and preferred channel
- The 6 simple Get to Know fields (textarea/input pairs from `GET_TO_KNOW_FIELDS`)
- `<FunFactsField />` repeater, min 1 max 3
- Two inputs for `employeeChoice` (label + value)
- Auto-save on blur (debounced PATCH); save state pill matches Focus Layer

### `<ProfilePhotoInput />`

File input → reads as Base64 → resizes to ≤ 200KB encoded using `<canvas>` (max 256x256, JPEG quality 0.85). On accept, calls a callback with the data URL. No upload to a separate service.

If the resulting Base64 is still > 200KB after compression, surfaces an error: "Photo too large after compression — try a smaller source image."

### `<FunFactsField />`

Reuses the same idea as `BulletListField` from sub-project #1 but specialized: 1–3 entries, each a single-line input.

### `<ProfileCompletionBadge />`

Renders a pill: "5 of 7 complete". Variant `default` when 100%, `secondary` otherwise. Hidden when total = 0 (data not loaded yet).

### EmployeeSheet integration

Existing `EmployeeSheet` adds two pieces:

1. `<EmployeeProfileCard mode="inline" employeeId={employee.id} />` near the top — the primary read view.
2. For HR users, a "Edit profile" button opens `<ProfileEditSection mode="hr" />` in a sub-Sheet or accordion.

---

## Seed Data

`scripts/seed-employee-profiles.ts` (`pnpm db:seed-profiles`):

- Walks all existing employees, sets a realistic `profile` sub-doc on each
- Photos: skipped (no Base64 in v1 seed; documented as a known gap — the demo runs with placeholder initials)
- Get to Know fields: rotates through ~10 realistic content packs so the demo doesn't feel templated
- Idempotent (overwrite on each run)

Pseudo-content example:

```ts
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
}
```

---

## Testing

Real Mongo for API tests, jsdom for component tests (already configured by sub-project #1).

`employee-profile-validation.test.ts` (Zod):
- accepts partial input
- rejects funFacts > 3
- rejects photo > 280KB or non-data-URL prefix

`api-employee-profile.test.ts`:
- GET returns profile + completion
- PATCH partial saves only the provided keys (siblings preserved)
- PATCH sets profileUpdatedAt
- completion correctly increments as fields fill in

`computeProfileCompletion` unit test:
- 0 of 7 when empty
- counts each field correctly
- 7 of 7 when fully populated

`employee-profile-card.test.tsx`:
- renders inline mode without dialog wrapper
- shows completion badge with correct count
- hides Focus Layer summary when not confirmed

`profile-edit-form.test.tsx`:
- renders all GET_TO_KNOW_FIELDS
- can add and remove fun facts (min 1, max 3 enforced)
- employeeChoice label and value are independent inputs

---

## Error Handling & Edge Cases

- **Existing employees without profile field** — Mongoose default initializes `profile = {}` on next read; `getToKnow` defaults to `{}`. UI handles missing fields as empty.
- **Photo over the size cap** — surface inline error, do not save.
- **Concurrent edits** — last write wins; partial-update with dot-paths means a save of "personalBio only" doesn't blow away a parallel save of "hobbies only".
- **Employee deletion** — profile is embedded; deletes with the parent record.
- **Render Focus Layer summary on card** — only when `focusLayer.status === "confirmed"`. Otherwise hide or show a single-line "Focus Layer in progress" depending on viewer role.
- **Older API route consumers** — none affected; this is purely additive.

---

## Out of Scope (Explicit)

- Photo upload to S3/R2/external image service
- Per-field privacy / visibility settings
- Profile completeness reminder automation (becomes a workflow in #6)
- Profile change history / audit
- Employee directory redesign — existing dashboard component reused
- Org chart integration (sub-project #4 — uses `<EmployeeProfileCard />` in node click)
- PDF rendering of profile (sub-project #5 — calls `getEmployeeProfile()` server-side)
