/**
 * 90-day performance conversation guardrail.
 *
 * Pure detection logic for `docs/reqs/perf-reviews.md`:
 *   "no employee goes more than 90 days without a structured, documented
 *    conversation about their performance and development"
 *
 * A "structured, documented conversation" is any of:
 *   - completed check-in        (CheckIn.completedAt)
 *   - performance note           (PerformanceNote.createdAt)
 *   - finalized perf review      (PerformanceReview with status in
 *                                 {finalized, acknowledged, shared})
 *
 * New hires have a grace period equal to the threshold, so a 30-day-old
 * employee with no conversations is not flagged.
 */

export const MEDIUM_THRESHOLD_DAYS = 90;
export const HIGH_THRESHOLD_DAYS = 120;
export const CONVERSATION_GRACE_PERIOD_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

export type CadenceSeverity = "none" | "medium" | "high";

export interface CadenceInput {
  now: Date;
  hireDate: Date;
  employeeStatus: string;
  lastCheckInAt: Date | null;
  lastNoteAt: Date | null;
  lastReviewAt: Date | null;
}

export interface CadenceResult {
  severity: CadenceSeverity;
  daysSince: number;
  lastConversationAt: Date | null;
}

function maxDate(dates: Array<Date | null>): Date | null {
  let latest: Date | null = null;
  for (const d of dates) {
    if (!d) continue;
    if (!latest || d.getTime() > latest.getTime()) latest = d;
  }
  return latest;
}

function daysBetween(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / DAY_MS);
}

export function computeConversationCadence(input: CadenceInput): CadenceResult {
  if (input.employeeStatus !== "active") {
    return { severity: "none", daysSince: 0, lastConversationAt: null };
  }

  const lastConversationAt = maxDate([
    input.lastCheckInAt,
    input.lastNoteAt,
    input.lastReviewAt,
  ]);

  const referenceDate = lastConversationAt ?? input.hireDate;
  const daysSince = daysBetween(input.now, referenceDate);

  // Grace period: new hires with no conversations yet get a free window
  // equal to the threshold. After that, they start accruing like anyone else.
  if (!lastConversationAt && daysSince < CONVERSATION_GRACE_PERIOD_DAYS) {
    return { severity: "none", daysSince, lastConversationAt: null };
  }

  let severity: CadenceSeverity = "none";
  if (daysSince >= HIGH_THRESHOLD_DAYS) severity = "high";
  else if (daysSince >= MEDIUM_THRESHOLD_DAYS) severity = "medium";

  return { severity, daysSince, lastConversationAt };
}
