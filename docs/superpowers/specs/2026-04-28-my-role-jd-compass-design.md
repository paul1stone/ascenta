# My Role + Job Descriptions Compass — Design

**Date:** 2026-04-28
**Status:** Draft, awaiting user review
**Scope:** Plan → Organizational Design tabs (`my-profile`, `job-descriptions`)

## Goal

Replace the ad-hoc "generate" affordance on the My Profile tab with the same Compass interview pattern that drives goal creation, and apply the same treatment to Job Descriptions. Bring both pages' look-and-feel in line with the Goals page (Compass CTA cards on top + sectioned content below).

## Non-goals

- No changes to the Org Chart tab.
- No changes to JD assignment, JD edit-from-detail, JD delete, JD import — these stay as today.
- No new workflow-engine scaffolding (no `WorkflowDefinition`/`WorkflowRun` rows, no guardrails, no artifact templates). Mirrors the simpler `buildMVVTool` pattern.
- No URL backwards-compatibility shim for the renamed tab key.

## Information architecture

Rename the `my-profile` tab to `my-role`:

- `apps/platform/src/lib/constants/dashboard-nav.ts`: tab `key` and `label` change to `my-role` / "My Role".
- `apps/platform/src/components/plan/my-profile-tab.tsx` → renamed to `my-role-tab.tsx`. Component export `MyProfileTab` → `MyRoleTab`.
- Update callers: `org-design-tabs.tsx`, `org-design-empty-tab.tsx`.
- Page header text "My Profile" → "My Role". Sub-line unchanged.

## My Role page (`my-role-tab.tsx`)

**Layout (top to bottom):**

1. Header: "My Role" + name/title/department sub-line + `DownloadOrgSnapshotButton` (right-aligned, unchanged).
2. Two Compass CTA cards in a `grid-cols-2 gap-3` block, styled identically to the Goals page cards (`rounded-xl border p-4`, size-9 icon container).
   - **Left (orange `#ff6b35`):** "Build my Role with Compass" — sub "AI-guided interview to shape your role". Compass icon. Href: `/do?prompt=Help me build my role&tool=startMyRoleWorkflow`.
   - **Right (Plan blue `#6688bb`):** "Suggest from my JD" — sub "Draft your Focus Layer from your assigned JD". Sparkles icon. Href: `/do?prompt=Suggest my Focus Layer from my JD&tool=suggestFromJD`. Disabled (with tooltip) if the user has no JD assigned.
3. **About Me section** — header row "About Me" + secondary `[✏ Edit]` button on the right.
   - Read view by default — render via `EmployeeProfileCard` if it works generically, otherwise a thin new `AboutMeReadCard` component (photo, pronouns, contact, bio, hobbies, hometown, ask-me-about, currently consuming, fun facts, employee choice).
   - Click Edit → expands inline to the existing `ProfileEditForm` (no behavior change to that form). Save/cancel collapses back to read view.
4. **Focus Layer section** — header row "Focus Layer" + `FocusLayerStatusPill` + secondary `[✏ Edit]` button.
   - Read view via existing `FocusLayerReadView`.
   - Click Edit → existing `FocusLayerForm`, **with the in-form `AiSuggestButton` removed** (its functionality now lives in the top "Suggest from my JD" card).
5. **Empty state:** if both About Me and Focus Layer are empty, show one empty-state block under the cards: heading "Start with Compass", primary CTA routing to the same Compass URL.

**Component changes:**

- New: `<MyRoleTab>` (rename of `MyProfileTab`).
- New: `<AboutMeReadCard>` if `EmployeeProfileCard` is too org-chart-flavored to reuse cleanly. (The implementation step will determine reuse-vs-new.)
- New: `<MyRoleWorkingDocument>` (lives under `components/plan/profile/`) — wired through `chat-context.tsx`'s working-doc renderer so it opens in the side panel.
- Modified: `FocusLayerForm` — delete the `AiSuggestButton` import + render. The `/api/focus-layers/{id}/suggest` route stays; it's now driven by the new tool.
- Deleted: `AiSuggestButton` (`components/plan/focus-layer/ai-suggest-button.tsx`) — only consumer removed.

## Job Descriptions page (`library-view.tsx`)

**Layout (top to bottom):**

1. Header (unchanged): title + description + right-aligned `[Import]` and `[+ New Job Description]` buttons.
2. Two Compass CTA cards in `grid-cols-2 gap-3`, identical visual treatment to My Role.
   - **Left (orange `#ff6b35`):** "Build a JD with Compass" — sub "AI-guided JD creation". Compass icon. Href: `/do?prompt=Help me build a job description&tool=startJobDescriptionWorkflow`.
   - **Right (Plan blue `#6688bb`):** "Refine an existing JD" — sub "Polish or expand any JD in your library". Wrench icon. Click opens a `<JdPickerDialog>`; on select navigates to `/do?prompt=Refine "<title>"&tool=startJobDescriptionWorkflow&jdId=<id>`.
3. Filter bar (unchanged).
4. JD table (unchanged).
5. Sheets for create/detail (unchanged for now — the manual create Sheet stays as the "+ New" behavior).

**Component changes:**

- New: `<JdPickerDialog>` — small Dialog with a Combobox/typeahead over `/api/job-descriptions` results. Submit picks one and routes; Cancel closes.
- New: `<JdWorkingDocument>` — side-panel form rendered by chat-context when `workflowType === "create-job-description"`.
- Modified: `<JdForm>` — extract its body into a shared `<JdFormBody>` so the working-doc form can reuse the same field rendering without duplicating Zod wiring. The Sheet path keeps using `<JdForm>` as today.
- Modified: `library-view.tsx` — add the two cards above the filter bar; nothing else.

## AI tools

Five new tools across two files:

### `apps/platform/src/lib/ai/profile-tools.ts`

- **`startMyRoleWorkflowTool`** — input `{ employeeId, employeeName }`. Loads existing About Me + Focus Layer + assigned JD info. Returns context for the AI to begin the interview. Description instructs the AI to walk About Me first, then Focus Layer, one question at a time, restating each existing value with a "keep / refine / replace" prompt rendered as an `[ASCENTA_OPTIONS]` block. The tool description enumerates the question sequence (pronouns, preferred channel, bio, hobbies, hometown, ask-me-about, currently consuming, fun facts, employee choice → uniqueContribution, highImpactArea, signatureResponsibility, workingStyle). At the end, the AI calls `openMyRoleDocument` with all collected values.
- **`openMyRoleDocumentTool`** — input is the full About Me + Focus Layer payload. Execute returns a `[ASCENTA_WORKING_DOC]` block with `workflowType: "build-my-role"` and prefilled values. Mirrors `openGoalDocumentTool`.
- **`suggestFromJDTool`** — input `{ employeeId, employeeName }`. Calls a refactored helper extracted from the `/api/focus-layers/{id}/suggest` route (so the tool can invoke it without HTTP). Loads current About Me values verbatim. Emits a `[ASCENTA_WORKING_DOC]` block with About Me preserved + Focus Layer prefilled from suggestions. AI's text turn: "Here's what I drafted from your JD — review and submit when ready." On no JD assigned, returns `success: false` with a friendly message and the AI suggests Compass instead.

### `apps/platform/src/lib/ai/job-description-tools.ts`

- **`startJobDescriptionWorkflowTool`** — input `{ jdId?: string }`. If `jdId` present, loads that JD for refine; else fresh. Returns `{ existing, levelOptions, employmentTypeOptions, statusOptions, message }`. Description instructs the AI to walk: title → department → level (options block) → employment type (options block) → role summary → core responsibilities (one-by-one, "any more?") → required quals → preferred quals → competencies. In refine mode, the AI restates each existing field and asks keep/refine/replace per section. At the end, calls `openJobDescriptionDocument` (passing through `jdId` if refining).
- **`openJobDescriptionDocumentTool`** — input is the full JD field set + optional `jdId`. Returns a `[ASCENTA_WORKING_DOC]` block with `workflowType: "create-job-description"`, `mode: jdId ? "edit" : "create"`, and prefilled values.

### Registration & prompts

- `apps/platform/src/lib/ai/tools.ts`: register all 5 tools in the tool registry, both for OpenAI-full and workflow-only tool sets.
- `apps/platform/src/lib/ai/prompts.ts`: add brief usage guidance — when to call each tool, the section ordering for `startMyRoleWorkflow` (About Me first, then Focus Layer), and the JD refinement etiquette.

## Routing

- `apps/platform/src/app/do/page.tsx` — extend the URL-param seeding logic to parse `jobDescriptionId` (alongside the existing `outcomeText/strategyGoalId/...` set) and forward it into the initial tool call. Symmetric to the existing `outcomeCtx` pass-through.
- New URLs (summary):

| Card | URL |
|---|---|
| Build my Role with Compass | `/do?prompt=Help me build my role&tool=startMyRoleWorkflow` |
| Suggest from my JD | `/do?prompt=Suggest my Focus Layer from my JD&tool=suggestFromJD` |
| Build a JD with Compass | `/do?prompt=Help me build a job description&tool=startJobDescriptionWorkflow` |
| Refine an existing JD | `/do?prompt=Refine "<title>"&tool=startJobDescriptionWorkflow&jobDescriptionId=<id>` |

## Working-document forms

### `<MyRoleWorkingDocument>` (`components/plan/profile/my-role-working-document.tsx`)

- Two stacked sections: **About Me first**, then **Focus Layer**. Order matches the read view.
- About Me uses `profilePatchSchema` (existing, in `@/lib/validations/employee-profile`).
- Focus Layer uses a new `focusLayerFormSchema` (Zod) with the four prompts, each min-length 20 chars to match the existing manual-form gate.
- Field rendering reuses existing primitives: `ProfilePhotoInput`, `FunFactsField`, the `GET_TO_KNOW_FIELDS` map for the read/edit grid, and the `FOCUS_LAYER_PROMPTS` map for the focus-layer textareas.
- Header: "Build My Role" + sub "AI is filling this out for you". Cancel + Save buttons at the bottom (matches `goal-creation-form.tsx` chrome).
- Form is review-then-save (no auto-save in the working-doc; auto-save remains on the inline `ProfileEditForm`/`FocusLayerForm` paths).
- Submit (single click, sequential — not atomic):
  1. `PATCH /api/employees/{id}/profile` with About Me payload.
  2. `PATCH /api/focus-layers/{id}` with Focus Layer responses.
  3. `POST /api/focus-layers/{id}/submit` if Focus Layer values pass the length gate (mirrors current submit flow). If they don't, save as draft and surface a hint.
  4. Toast on success; close working doc; refresh read view.
- Partial failure: if step 1 succeeds but step 2 fails, surface the step-2 error inline and keep the working doc open. The user can retry — step 1's already-saved About Me is fine to re-PATCH idempotently. No rollback.
- Live `update_working_document` action support — patches form values when AI sends updates mid-conversation. Reuses chat-context's existing handler.

### `<JdWorkingDocument>` (`components/plan/job-descriptions/jd-working-document.tsx`)

- Single form, body reused from extracted `<JdFormBody>` (see Component changes above).
- Header: "Build a Job Description" or "Refine '<title>'" depending on mode.
- Submit:
  - `mode: "create"` → `POST /api/job-descriptions`.
  - `mode: "edit"` → `PATCH /api/job-descriptions/{jdId}`.
- On success, call `LibraryView`'s refetch via the existing `onSuccess` callback path; close the working doc; toast.

## Chat-context wiring (`apps/platform/src/lib/chat/chat-context.tsx`)

- The existing working-document infra branches on `workflowType`. Add two cases:
  - `"build-my-role"` → render `<MyRoleWorkingDocument>` with prefilled values.
  - `"create-job-description"` → render `<JdWorkingDocument>` with prefilled values + `mode`.
- Both new types support the existing `update_working_document` action without additional plumbing — the dispatcher already merges arbitrary patch payloads into the form's prefilled state.

## Persistence

No new endpoints. Existing endpoints used:

- `PATCH /api/employees/{id}/profile` (About Me — already exists, used by `ProfileEditForm`).
- `PATCH /api/focus-layers/{id}` (Focus Layer responses — already exists).
- `POST /api/focus-layers/{id}/submit` (status transition — already exists).
- `POST /api/focus-layers/{id}/suggest` route logic — extracted into a shared helper (e.g., `lib/focus-layer/suggest.ts`) so `suggestFromJDTool` can call it directly without HTTP. The route stays for any external callers.
- `POST /api/job-descriptions` (create) and `PATCH /api/job-descriptions/{id}` (edit) — already exist.

## Error handling

- Tool execution failures surface via the existing chat error rendering.
- Working-doc submit failures: inline `serverError` state per form (matches `JdForm` and `goal-creation-form.tsx`); user retries without losing form state.
- `suggestFromJDTool` when no JD assigned: returns `success: false` with a friendly message; the AI guides the user to Compass instead.
- `<JdPickerDialog>` empty-results: standard "no matches" state.
- The auto-save behaviour of the existing `FocusLayerForm` and `ProfileEditForm` (debounced PATCH) is unchanged.

## Testing

- **Unit (vitest):**
  - `profile-tools.test.ts` — `startMyRoleWorkflow` returns existing values + correct shape; `openMyRoleDocument` emits a valid `[ASCENTA_WORKING_DOC]` block; `suggestFromJD` calls the suggest helper and merges with current About Me; `suggestFromJD` handles the no-JD-assigned case.
  - `job-description-tools.test.ts` — `startJobDescriptionWorkflow` branches on `jdId` (fresh vs refine); `openJobDescriptionDocument` emits the correct payload with `mode`.
  - DB-touching tests gated behind `SKIP_NO_DB` per CLAUDE.md.
- **Manual QA:** dev server (`pnpm dev --filter=@ascenta/platform`), drive each entry point in the browser:
  1. Compass card on My Role → interview → working doc → save → read view refreshes with new values.
  2. Suggest from JD → working doc with Focus Layer prefilled, About Me preserved → save.
  3. Compass card on JD page → interview → working doc → list refreshes with new JD.
  4. Refine card → picker → interview → working doc in edit mode → JD updates in place.
  5. Edit secondary buttons still toggle inline edit; auto-save still works; Cancel collapses back.

## Files changed (summary)

**New:**
- `apps/platform/src/lib/ai/profile-tools.ts`
- `apps/platform/src/lib/ai/job-description-tools.ts`
- `apps/platform/src/lib/focus-layer/suggest.ts` (extracted helper)
- `apps/platform/src/components/plan/profile/my-role-working-document.tsx`
- `apps/platform/src/components/plan/profile/about-me-read-card.tsx` (if `EmployeeProfileCard` doesn't fit)
- `apps/platform/src/components/plan/job-descriptions/jd-working-document.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-form-body.tsx` (extracted from `jd-form.tsx`)
- `apps/platform/src/components/plan/job-descriptions/jd-picker-dialog.tsx`
- Tests: `profile-tools.test.ts`, `job-description-tools.test.ts`.

**Renamed:**
- `apps/platform/src/components/plan/my-profile-tab.tsx` → `my-role-tab.tsx` (component renamed too).

**Modified:**
- `apps/platform/src/lib/constants/dashboard-nav.ts` — tab key/label.
- `apps/platform/src/components/plan/org-design-tabs.tsx`, `org-design-empty-tab.tsx` — update imports/refs.
- `apps/platform/src/components/plan/focus-layer/focus-layer-form.tsx` — remove `AiSuggestButton` rendering.
- `apps/platform/src/components/plan/job-descriptions/library-view.tsx` — add Compass cards.
- `apps/platform/src/components/plan/job-descriptions/jd-form.tsx` — extract body to `JdFormBody`.
- `apps/platform/src/lib/ai/tools.ts` — register the 5 new tools.
- `apps/platform/src/lib/ai/prompts.ts` — add usage guidance.
- `apps/platform/src/lib/chat/chat-context.tsx` — handle the two new `workflowType` values.
- `apps/platform/src/app/api/focus-layers/[id]/suggest/route.ts` — call the extracted helper.
- `apps/platform/src/app/do/page.tsx` — parse `jobDescriptionId` URL param and forward.

**Deleted:**
- `apps/platform/src/components/plan/focus-layer/ai-suggest-button.tsx` — last consumer removed.
