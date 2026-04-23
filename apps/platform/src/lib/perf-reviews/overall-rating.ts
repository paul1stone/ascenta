/**
 * Overall rating aggregation.
 *
 * Required by docs/reqs/perf-reviews.md Rating Scale:
 *   "Overall rating calculated from category averages — maps to the five-point scale"
 *
 * Policy:
 *   - Overall = arithmetic mean of all present (non-null) category ratings
 *   - `level` rounds the average to the nearest integer 1..5 (ties round up:
 *     2.5 → 3), which keeps the scale interpretation consistent with how
 *     people read a five-point scale.
 *   - `complete` is true only when every expected section has a rating;
 *     the UI uses this to mark a provisional average as "partial".
 */

import { RATING_SCALE } from "@ascenta/db/performance-review-categories";

export type RatingLevel = 1 | 2 | 3 | 4 | 5;

export interface OverallRating {
  average: number | null;
  level: RatingLevel | null;
  label: string | null;
  ratedCount: number;
  totalCount: number;
  complete: boolean;
}

interface RatingSection {
  rating: number | null;
}

function roundHalfUp(x: number): number {
  return Math.floor(x + 0.5);
}

function clampLevel(n: number): RatingLevel {
  if (n <= 1) return 1;
  if (n >= 5) return 5;
  return n as RatingLevel;
}

export function computeOverallRating(
  sections: readonly RatingSection[],
  expectedCount: number = sections.length,
): OverallRating {
  const rated = sections.filter(
    (s): s is { rating: number } =>
      typeof s.rating === "number" && Number.isFinite(s.rating),
  );
  const ratedCount = rated.length;
  const totalCount = Math.max(expectedCount, sections.length);

  if (ratedCount === 0) {
    return {
      average: null,
      level: null,
      label: null,
      ratedCount: 0,
      totalCount,
      complete: false,
    };
  }

  const sum = rated.reduce((acc, s) => acc + s.rating, 0);
  const average = sum / ratedCount;
  const rounded = clampLevel(roundHalfUp(average));
  const label = RATING_SCALE[rounded]?.label ?? null;

  return {
    average,
    level: rounded,
    label,
    ratedCount,
    totalCount,
    complete: totalCount > 0 && ratedCount === totalCount,
  };
}
