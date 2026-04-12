"use client";

import { memo } from "react";
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
  editing?: boolean;
  onFieldChange?: (field: string, value: unknown) => void;
}

export const TranslationRolePreview = memo(function TranslationRolePreview({
  jobTitle,
  level,
  contributions,
  behaviors,
  decisionRights,
  accentColor,
  editing,
  onFieldChange,
}: TranslationRolePreviewProps) {
  const levelLabel = ROLE_LEVEL_LABELS[level as keyof typeof ROLE_LEVEL_LABELS] ?? level;

  const inputCls = "w-full rounded-lg border px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[--accent] resize-y";
  const inputStyle = { "--accent": accentColor } as React.CSSProperties;

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

          {editing ? (
            <textarea
              value={c.roleContribution}
              onChange={(e) => onFieldChange?.(`contributions.${i}.roleContribution`, e.target.value)}
              rows={3}
              className={inputCls}
              style={inputStyle}
            />
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              {c.roleContribution}
            </p>
          )}

          {/* Outcomes */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground mb-1">
              Success Outcomes
            </p>
            {editing ? (
              <div className="space-y-1.5">
                {c.outcomes.map((o, j) => (
                  <div key={j} className="flex gap-1.5">
                    <input
                      value={o}
                      onChange={(e) => {
                        const updated = [...c.outcomes];
                        updated[j] = e.target.value;
                        onFieldChange?.(`contributions.${i}.outcomes`, updated);
                      }}
                      className="flex-1 rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent]"
                      style={inputStyle}
                    />
                    {c.outcomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = c.outcomes.filter((_, k) => k !== j);
                          onFieldChange?.(`contributions.${i}.outcomes`, updated);
                        }}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors px-1"
                      >
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...c.outcomes, ""];
                    onFieldChange?.(`contributions.${i}.outcomes`, updated);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  + Add outcome
                </button>
              </div>
            ) : c.outcomes.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5">
                {c.outcomes.map((o, j) => (
                  <li key={j} className="text-sm text-muted-foreground">{o}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Alignment Descriptors */}
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
                {editing ? (
                  <textarea
                    value={c.alignmentDescriptors[lvl]}
                    onChange={(e) => onFieldChange?.(`contributions.${i}.alignmentDescriptors.${lvl}`, e.target.value)}
                    rows={3}
                    className="w-full rounded border px-2 py-1 text-xs leading-relaxed resize-y bg-white/50 focus:outline-none"
                  />
                ) : (
                  <p className="leading-relaxed">{c.alignmentDescriptors[lvl]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Behaviors */}
      {(behaviors.length > 0 || editing) && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Behavioral Expectations
          </p>
          <div className="space-y-2">
            {behaviors.map((b, i) => (
              <div key={i}>
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      value={b.valueName}
                      onChange={(e) => onFieldChange?.(`behaviors.${i}.valueName`, e.target.value)}
                      className="w-40 shrink-0 rounded-lg border px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[--accent]"
                      style={inputStyle}
                      placeholder="Value name"
                    />
                    <input
                      value={b.expectation}
                      onChange={(e) => onFieldChange?.(`behaviors.${i}.expectation`, e.target.value)}
                      className="flex-1 rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent]"
                      style={inputStyle}
                      placeholder="Behavioral expectation"
                    />
                    {behaviors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = behaviors.filter((_, k) => k !== i);
                          onFieldChange?.("behaviors", updated);
                        }}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors px-1"
                      >
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-foreground">{b.valueName}:</span>{" "}
                    <span className="text-sm text-muted-foreground">{b.expectation}</span>
                  </>
                )}
              </div>
            ))}
            {editing && (
              <button
                type="button"
                onClick={() => {
                  const updated = [...behaviors, { valueName: "", expectation: "" }];
                  onFieldChange?.("behaviors", updated);
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + Add behavior
              </button>
            )}
          </div>
        </div>
      )}

      {/* Decision Rights */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Decision Rights
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(["canDecide", "canRecommend", "mustEscalate"] as const).map((key) => {
            const label = key === "canDecide" ? "Can Decide" : key === "canRecommend" ? "Can Recommend" : "Must Escalate";
            const colorCls = key === "canDecide" ? "text-emerald-700" : key === "canRecommend" ? "text-amber-700" : "text-rose-700";
            const items = decisionRights[key];

            return (
              <div key={key}>
                <p className={cn("text-xs font-semibold mb-1", colorCls)}>{label}</p>
                {editing ? (
                  <div className="space-y-1">
                    {items.map((d, i) => (
                      <div key={i} className="flex gap-1">
                        <input
                          value={d}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[i] = e.target.value;
                            onFieldChange?.(`decisionRights.${key}`, updated);
                          }}
                          className="flex-1 rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[--accent]"
                          style={inputStyle}
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = items.filter((_, k) => k !== i);
                              onFieldChange?.(`decisionRights.${key}`, updated);
                            }}
                            className="text-muted-foreground hover:text-destructive text-[10px]"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...items, ""];
                        onFieldChange?.(`decisionRights.${key}`, updated);
                      }}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {items.map((d, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {d}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
