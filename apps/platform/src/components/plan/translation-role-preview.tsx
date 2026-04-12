"use client";

import { cn } from "@ascenta/ui";
import { ROLE_LEVEL_LABELS } from "@ascenta/db/strategy-translation-constants";

interface Contribution {
  strategyGoalTitle: string;
  roleContribution: string;
  outcomes: string[];
  alignmentDescriptors: { strong: string; acceptable: string; poor: string };
}

interface Behavior {
  valueName: string;
  expectation: string;
}

interface DecisionRights {
  canDecide: string[];
  canRecommend: string[];
  mustEscalate: string[];
}

interface TranslationRolePreviewProps {
  jobTitle: string;
  level: string;
  contributions: Contribution[];
  behaviors: Behavior[];
  decisionRights: DecisionRights;
  accentColor: string;
}

export function TranslationRolePreview({
  jobTitle,
  level,
  contributions,
  behaviors,
  decisionRights,
  accentColor,
}: TranslationRolePreviewProps) {
  const levelLabel = ROLE_LEVEL_LABELS[level as keyof typeof ROLE_LEVEL_LABELS] ?? level;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-bold text-deep-blue">
          {jobTitle}
        </h4>
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 10%, white)`,
            color: accentColor,
          }}
        >
          {levelLabel}
        </span>
      </div>

      {/* Contributions per priority */}
      {contributions.map((c, i) => (
        <div key={i} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {c.strategyGoalTitle}
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {c.roleContribution}
          </p>
          {c.outcomes.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                Success Outcomes
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {c.outcomes.map((o, j) => (
                  <li key={j} className="text-sm text-muted-foreground">{o}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["strong", "acceptable", "poor"] as const).map((lvl) => (
              <div
                key={lvl}
                className={cn(
                  "rounded-lg p-2.5 text-xs",
                  lvl === "strong" && "bg-emerald-50 text-emerald-800",
                  lvl === "acceptable" && "bg-amber-50 text-amber-800",
                  lvl === "poor" && "bg-rose-50 text-rose-800",
                )}
              >
                <p className="font-semibold capitalize mb-0.5">{lvl}</p>
                <p className="leading-relaxed">{c.alignmentDescriptors[lvl]}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Behaviors */}
      {behaviors.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Behavioral Expectations
          </p>
          <div className="space-y-2">
            {behaviors.map((b, i) => (
              <div key={i}>
                <span className="text-sm font-medium text-foreground">{b.valueName}:</span>{" "}
                <span className="text-sm text-muted-foreground">{b.expectation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Rights */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Decision Rights
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-700 mb-1">Can Decide</p>
            <ul className="space-y-0.5">
              {decisionRights.canDecide.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-1">Can Recommend</p>
            <ul className="space-y-0.5">
              {decisionRights.canRecommend.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700 mb-1">Must Escalate</p>
            <ul className="space-y-0.5">
              {decisionRights.mustEscalate.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
