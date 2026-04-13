"use client";

import { cn } from "@ascenta/ui";
import { getGapLevel, type GapLevel } from "@/lib/check-in/gap-engine";

type GapSignalsProps = {
  gaps: {
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
  };
};

const DIMENSION_LABELS: Record<string, string> = {
  clarity: "Clarity",
  recognition: "Recognition",
  development: "Development",
  safety: "Safety",
};

const LEVEL_CONFIG: Record<GapLevel, { color: string; bg: string; label: string }> = {
  aligned: { color: "#44aa99", bg: "#44aa99", label: "Aligned" },
  watch: { color: "#e8a735", bg: "#e8a735", label: "Watch" },
  gap: { color: "#cc6677", bg: "#cc6677", label: "Gap detected" },
};

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function GapSignals({ gaps }: GapSignalsProps) {
  const dimensions = ["clarity", "recognition", "development", "safety"] as const;

  return (
    <div className="grid grid-cols-2 gap-3">
      {dimensions.map((dim) => {
        const delta = gaps[dim];
        const level = getGapLevel(delta);

        if (level === null || delta === null) {
          return (
            <div
              key={dim}
              className="rounded-lg border border-border bg-muted/20 p-3 space-y-1"
            >
              <h4 className="text-xs font-medium text-muted-foreground">
                {DIMENSION_LABELS[dim]}
              </h4>
              <p className="text-lg font-semibold text-muted-foreground/50">
                &mdash;
              </p>
              <span className="text-xs text-muted-foreground">No data</span>
            </div>
          );
        }

        const config = LEVEL_CONFIG[level];

        return (
          <div
            key={dim}
            className={cn("rounded-lg border p-3 space-y-1")}
            style={{
              borderColor: `${config.color}40`,
              backgroundColor: `${config.bg}0d`,
            }}
          >
            <h4 className="text-xs font-medium text-muted-foreground">
              {DIMENSION_LABELS[dim]}
            </h4>
            <p
              className="text-lg font-semibold"
              style={{ color: config.color }}
            >
              {formatDelta(delta)}
            </p>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${config.bg}1a`,
                color: config.color,
              }}
            >
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
