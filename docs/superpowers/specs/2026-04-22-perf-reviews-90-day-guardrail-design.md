# 90-Day Performance Conversation Guardrail

**Source requirement:** `docs/reqs/perf-reviews.md` line 50 (Review Cadence: Three-Tier Model)

> Guardrail: no employee goes more than 90 days without a structured, documented conversation about their performance and development

## Goal

Surface a visible, actionable alert on the HR dashboard whenever an active employee has gone 90+ days without any structured performance conversation. This is a *soft guardrail* — a warning surface, not a hard block on other actions.

## What counts as a "structured, documented conversation"

Any one of the following, most recent `completedAt` / `createdAt` wins:

1. **Completed check-in** — `CheckIn.completedAt != null`
2. **Performance note** — any `PerformanceNote` for the employee (types: observation, coaching, recognition)
3. **Finalized performance review** — `PerformanceReview.finalizedAt != null` *or* `status in ("acknowledged", "finalized")`

We intentionally exclude corrective actions (verbal, written warning, PIP) — those are remediation, not the "performance and development" conversations the guardrail targets.

## Detection logic

For each **active** employee (status `active`, not terminated or on leave):

```
lastConversationAt = max(
  latestCompletedCheckInAt,
  latestPerformanceNoteCreatedAt,
  latestFinalizedReviewAt
)

daysSince = lastConversationAt ? (now - lastConversationAt) / 1day : (now - hireDate) / 1day

if daysSince >= 90 → alert "performance_conversation_overdue"
```

Employees with no prior conversation and hired <90 days ago are **not** flagged (grace period during onboarding).

## Where it surfaces

Add a new item type to `/api/dashboard/attention`:

```ts
{
  type: "performance_conversation_overdue",
  priority: "high",
  title: "No performance conversation in 90+ days",
  description: "<Employee name> — last conversation <N> days ago",
  href: "/dashboard/grow/check-ins?employee=<id>",
  metadata: { employeeId, daysSince, lastConversationAt }
}
```

`components/dashboard/needs-attention.tsx` already renders arbitrary alert types, so no UI changes are required.

## Severity rules

- 90–119 days since last conversation → `medium` priority
- 120+ days → `high` priority

## Scope — what's NOT in this PR

- No email notifications (would be a separate feature)
- No cron job (the alert is computed on-demand by the attention API)
- No manager-facing in-app notification (notification-center stays as-is)
- No hard enforcement (nothing blocks other workflows)

## Testing strategy

Unit tests against the new detection helper (`lib/perf-reviews/conversation-cadence.ts`):

1. Employee with recent completed check-in within 90d → not flagged
2. Employee with note within 90d but no check-in → not flagged
3. Employee with finalized review within 90d → not flagged
4. Employee with nothing in 91+ days → flagged, medium
5. Employee with nothing in 120+ days → flagged, high
6. Employee hired 30 days ago with nothing → not flagged (grace period)
7. Employee hired 100 days ago with nothing → flagged (no grace)
8. Inactive / terminated employee → not flagged regardless
9. Tie-break: check-in 95 days ago, note 30 days ago → not flagged (note wins)

Integration test: attention API returns the alert when fixtures match scenario #4.

## File plan

**New:**
- `apps/platform/src/lib/perf-reviews/conversation-cadence.ts` — pure detection helper
- `apps/platform/src/lib/perf-reviews/__tests__/conversation-cadence.test.ts` — unit tests

**Modified:**
- `apps/platform/src/app/api/dashboard/attention/route.ts` — aggregate latest conversation date per employee, emit alerts
- `docs/reqs/perf-reviews.md` — check off line 50

## Non-goals / YAGNI

- No new schema fields. We compute `lastConversationAt` on the fly. If performance becomes an issue later, we can denormalize, but the company has <1000 employees — aggregation is fine.
- No new endpoints. Piggybacks on existing attention API.
- No per-employee toggle. The guardrail applies to all active employees uniformly.
