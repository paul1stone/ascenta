# Job Descriptions — Role-Based Access (HR / Manager / Employee)

**Date:** 2026-05-02
**Module:** Plan → Organizational Design → Job Descriptions

## Goal

Restrict who can see and edit job descriptions based on the unified role from `useAuth()`:

- **HR** — see and edit ALL job descriptions (current behavior)
- **Manager** — see and edit job descriptions for their own department
- **Employee** — see only their own assigned job description (read-only)

## Constraints

- Pattern must mirror the existing role-aware module (`apps/platform/src/components/plan/strategy-panel.tsx` + `apps/platform/src/app/api/plan/strategy-goals/route.ts`).
- Server-side enforcement is required — client-side hiding is not enough.
- The role comes from `getServerUser(req)` (header `x-dev-user-id`) on the API and `useAuth()` on the client.

## Tab Visibility (Org Design)

Modify `apps/platform/src/components/plan/org-design-tabs.tsx` to gate by role:

| Tab | HR | Manager | Employee |
|---|---|---|---|
| Job Descriptions | ✅ | ✅ (dept-scoped) | ❌ hidden |
| My Role | ✅ | ✅ | ✅ |
| Org Chart | ✅ | ✅ | ✅ |

If an employee navigates directly to the `job-descriptions` tab via URL, render an empty state pointing them to *My Role*.

`PAGE_CONFIG["plan/org-design"].tabs` stays static — visibility is enforced at render time inside `OrgDesignTabs` (so employees just see two tabs in the function-tabs strip).

## API Enforcement

All routes use `getServerUser(req)`. Routes that read return 401 if no user; mutating routes return 403 if the role/dept check fails.

| Route | HR | Manager | Employee |
|---|---|---|---|
| `GET /api/job-descriptions` | all | filter `department=user.department` | filter `_id=user.jobDescriptionId` |
| `GET /api/job-descriptions/[id]` | any | only if `jd.department === user.department` | only if `id === user.jobDescriptionId` |
| `POST /api/job-descriptions` | any | force `body.department = user.department` | 403 |
| `PATCH /api/job-descriptions/[id]` | any | only if existing `jd.department === user.department`, and patch may not change `department` away from it | 403 |
| `DELETE /api/job-descriptions/[id]` | any | only if `jd.department === user.department` | 403 |
| `GET /api/job-descriptions/[id]/employees` | any | only if `jd.department === user.department` | 403 |
| `POST /api/job-descriptions/[id]/employees` (assign) | any | JD dept must match user dept AND every target employee must be in user dept | 403 |
| `DELETE /api/job-descriptions/[id]/employees` (unassign) | any | JD dept must match user dept | 403 |

Looking up the user's `jobDescriptionId` for the employee read path: extend `getServerUser` to also return `jobDescriptionId` (it's already on the Employee select-set; just add it to the projection).

## Client-Side Changes

All client `fetch()` calls to `/api/job-descriptions/*` get the `x-dev-user-id` header. Files affected:

- `apps/platform/src/components/plan/job-descriptions/library-view.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-detail.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-form.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-assign-dialog.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-import-stub-dialog.tsx` (if it fetches)
- `apps/platform/src/components/plan/job-descriptions/jd-picker-dialog.tsx`

A small helper `lib/auth/with-user-header.ts` exporting `withUserHeader(userId?: string): HeadersInit` keeps the call sites tidy.

### `LibraryView`

- Pull `useAuth()` at the top.
- For managers, pre-set `filters.department = user.department` and pass a `lockedDepartment` prop down to `LibraryFilterBar` so the dept filter renders disabled with the locked value.
- "New Job Description" and "Import" buttons remain visible for HR + manager. Hidden for employee (the entire tab is hidden anyway, but the buttons are still gated as defense in depth).
- Pass `canEdit` / `canDelete` / `canAssign` derived booleans down to `JdDetail`.

### `JdForm`

- Accept an optional `lockedDepartment?: string` prop. When set, render the department field as disabled and force-submit that value (managers cannot change a JD's dept).

### `JdDetail`

- Accept `canEdit`, `canDelete`, `canAssign` props (all default `false`).
- Hide Edit / Delete / Assign / Unassign buttons accordingly.
- The component already renders read-only by default — no view changes needed for employees.

### `MyRoleTab` — employee read access to own JD

Add a "View Full Job Description" link below the existing Compass cards when `fl.jobDescriptionAssigned` is true. Clicking opens the existing `JdDetail` component inside a `Sheet` with all action props set to false. (The lookup of which JD the employee owns is already done by `/api/dashboard/employees/[id]` which returns `jobDescriptionId`.)

## Out of Scope (YAGNI)

- No per-JD ACL beyond department scoping
- No audit log entries for JD CRUD
- No "view as" toggle — role comes from the unified auth provider
- Employees do not get any kind of read-only library browse — just their own JD

## Testing

- Unit-test the API role checks (extend the existing `apps/platform/src/tests/api-job-descriptions-*.test.ts` suites with cases for each role × verb cell in the table above).
- DB-backed tests must be gated on `MONGODB_URI` per the existing pattern.

## Files to Touch

**API routes**
- `apps/platform/src/app/api/job-descriptions/route.ts`
- `apps/platform/src/app/api/job-descriptions/[id]/route.ts`
- `apps/platform/src/app/api/job-descriptions/[id]/employees/route.ts`

**DB helpers**
- `packages/db/src/job-descriptions.ts` — add an optional `assignedToEmployeeId` filter in `listJobDescriptions` so the employee read path can reuse it cleanly

**Auth helper**
- `apps/platform/src/lib/auth/server.ts` — add `jobDescriptionId` to `ServerUser`

**Client**
- `apps/platform/src/components/plan/org-design-tabs.tsx`
- `apps/platform/src/components/plan/job-descriptions/library-view.tsx`
- `apps/platform/src/components/plan/job-descriptions/library-filter-bar.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-form.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-detail.tsx`
- `apps/platform/src/components/plan/job-descriptions/jd-assign-dialog.tsx`
- `apps/platform/src/components/plan/my-role-tab.tsx`
- `apps/platform/src/lib/auth/with-user-header.ts` (new)

**Tests**
- `apps/platform/src/tests/api-job-descriptions-list.test.ts`
- `apps/platform/src/tests/api-job-descriptions-crud.test.ts`
- `apps/platform/src/tests/api-job-descriptions-employees.test.ts`
