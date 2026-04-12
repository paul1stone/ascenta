"use client";

import { cn } from "@ascenta/ui";

interface StrategyContributionCardProps {
  strategyGoalTitle: string;
  horizon?: string;
  roleContribution: string;
  outcomes: string[];
  behaviors?: { valueName: string; expectation: string }[];
  alignmentDescriptors?: { strong: string; acceptable: string; poor: string };
  showAlignment?: boolean;
  accentColor: string;
}

const HORIZON_LABELS: Record<string, string> = {
  long_term: "Long-term",
  medium_term: "Mid-range",
  short_term: "Short-term",
};

export function StrategyContributionCard({
  strategyGoalTitle,
  horizon,
  roleContribution,
  outcomes,
  behaviors,
  alignmentDescriptors,
  showAlignment = false,
  accentColor,
}: StrategyContributionCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
      {/* Priority header */}
      <div className="flex items-center gap-2">
        <div
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h4 className="font-display text-sm font-bold text-deep-blue flex-1">
          {strategyGoalTitle}
        </h4>
        {horizon && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {HORIZON_LABELS[horizon] ?? horizon}
          </span>
        )}
      </div>

      {/* Role contribution */}
      <p className="text-sm text-foreground leading-relaxed">
        {roleContribution}
      </p>

      {/* What success looks like */}
      {outcomes.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            What Success Looks Like
          </p>
          <ul className="space-y-1">
            {outcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Behaviors */}
      {behaviors && behaviors.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Behaviors Expected
          </p>
          <div className="space-y-1.5">
            {behaviors.map((b, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-foreground">{b.valueName}:</span>{" "}
                <span className="text-muted-foreground">{b.expectation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alignment descriptors (manager/HR only) */}
      {showAlignment && alignmentDescriptors && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {(["strong", "acceptable", "poor"] as const).map((level) => (
            <div
              key={level}
              className={cn(
                "rounded-lg p-2.5 text-xs leading-relaxed",
                level === "strong" && "bg-emerald-50 text-emerald-800",
                level === "acceptable" && "bg-amber-50 text-amber-800",
                level === "poor" && "bg-rose-50 text-rose-800",
              )}
            >
              <p className="font-semibold capitalize mb-0.5">{level}</p>
              <p>{alignmentDescriptors[level]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
