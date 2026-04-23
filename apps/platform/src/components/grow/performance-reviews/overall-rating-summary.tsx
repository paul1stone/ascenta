"use client";

import type { OverallRating } from "@/lib/perf-reviews/overall-rating";

interface OverallRatingSummaryProps {
  label: string;
  rating: OverallRating;
  accentColor?: string;
}

const LEVEL_COLOR: Record<number, string> = {
  1: "bg-red-500/15 text-red-700 border-red-500/30",
  2: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  3: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  4: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  5: "bg-purple-500/15 text-purple-700 border-purple-500/30",
};

export function OverallRatingSummary({
  label,
  rating,
  accentColor,
}: OverallRatingSummaryProps) {
  const { average, level, label: levelLabel, ratedCount, totalCount, complete } =
    rating;

  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {average == null ? (
        <div className="mt-1 text-sm text-muted-foreground italic">
          No ratings yet ({ratedCount} of {totalCount})
        </div>
      ) : (
        <>
          <div className="mt-1 flex items-baseline gap-2">
            <div
              className="font-display text-2xl font-bold"
              style={{ color: accentColor }}
            >
              {average.toFixed(2)}
            </div>
            {level != null && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${LEVEL_COLOR[level] ?? ""}`}
              >
                Level {level} — {levelLabel}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {complete
              ? `All ${totalCount} categories rated`
              : `${ratedCount} of ${totalCount} rated — provisional`}
          </div>
        </>
      )}
    </div>
  );
}
