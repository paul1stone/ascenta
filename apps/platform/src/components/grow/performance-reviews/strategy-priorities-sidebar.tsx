"use client";

import { useEffect, useState } from "react";
import { Compass, Flag, Target, User, Loader2 } from "lucide-react";

export interface StrategyContext {
  foundation: {
    mission: string;
    vision: string;
    values: string;
  } | null;
  employee: {
    id: string;
    department: string;
    jobTitle: string;
  } | null;
  strategyGoals: Array<{
    id: string;
    title: string;
    horizon: string | null;
    department: string | null;
    successMetrics: string | null;
  }>;
  roleTranslation: {
    jobTitle: string;
    level: string;
    contributions: Array<{
      strategyGoalId: string;
      strategyGoalTitle: string;
      roleContribution: string;
      outcomes: string[];
      alignmentDescriptors: {
        strong: string;
        acceptable: string;
        poor: string;
      };
    }>;
    behaviors: Array<{ valueName: string; expectation: string }>;
    decisionRights: {
      canDecide: string[];
      canRecommend: string[];
      mustEscalate: string[];
    };
  } | null;
}

const HORIZON_LABEL: Record<string, string> = {
  short_term: "Short-term (0–12 mo)",
  mid_range: "Mid-range (1–3 yr)",
  long_term: "Long-term (3–5 yr)",
};

interface StrategyPrioritiesSidebarProps {
  reviewId: string;
  accentColor: string;
}

export function StrategyPrioritiesSidebar({
  reviewId,
  accentColor,
}: StrategyPrioritiesSidebarProps) {
  const [ctx, setCtx] = useState<StrategyContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/grow/reviews/${reviewId}/strategy-context`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error ?? "Failed");
        if (!cancelled) {
          setCtx({
            foundation: data.foundation ?? null,
            employee: data.employee ?? null,
            strategyGoals: data.strategyGoals ?? [],
            roleTranslation: data.roleTranslation ?? null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  if (loading) {
    return (
      <aside className="rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Loading strategy context…
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground">
        Strategy context unavailable ({error}).
      </aside>
    );
  }

  if (!ctx) return null;

  const hasAnything =
    ctx.foundation ||
    ctx.strategyGoals.length > 0 ||
    (ctx.roleTranslation && ctx.roleTranslation.contributions.length > 0);

  if (!hasAnything) {
    return (
      <aside className="rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="size-4" style={{ color: accentColor }} />
          <h3 className="font-display text-sm font-bold">Strategic priorities</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          No strategic priorities have been published yet for this employee's role.
          Set up Foundation and Strategy Goals in Strategy Studio to see ladder-up
          context here.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border bg-muted/20 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="size-4" style={{ color: accentColor }} />
        <h3 className="font-display text-sm font-bold">Strategic priorities</h3>
      </div>

      {ctx.employee && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <User className="size-3 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-foreground">
              {ctx.employee.jobTitle || "—"}
            </div>
            <div>{ctx.employee.department || "—"}</div>
          </div>
        </div>
      )}

      {ctx.foundation && (ctx.foundation.mission || ctx.foundation.values) && (
        <section className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Flag className="size-3" />
            Foundation
          </div>
          {ctx.foundation.mission && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Mission
              </div>
              <p className="text-xs text-foreground">{ctx.foundation.mission}</p>
            </div>
          )}
          {ctx.foundation.values && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Values
              </div>
              <p className="text-xs text-foreground whitespace-pre-line">
                {ctx.foundation.values}
              </p>
            </div>
          )}
        </section>
      )}

      {ctx.strategyGoals.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Target className="size-3" />
            Priorities employee ladders to
          </div>
          <ul className="space-y-2">
            {ctx.strategyGoals.map((g) => (
              <li
                key={g.id}
                className="rounded-md border bg-card px-2.5 py-2 text-xs"
              >
                <div className="font-medium text-foreground">{g.title}</div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground mt-0.5">
                  {g.horizon && (
                    <span>{HORIZON_LABEL[g.horizon] ?? g.horizon}</span>
                  )}
                  {g.department && <span>• {g.department}</span>}
                </div>
                {g.successMetrics && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {g.successMetrics}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ctx.roleTranslation && ctx.roleTranslation.contributions.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Role contributions
          </div>
          <ul className="space-y-2">
            {ctx.roleTranslation.contributions.map((c) => (
              <li
                key={c.strategyGoalId}
                className="rounded-md border bg-card px-2.5 py-2 text-xs space-y-1"
              >
                <div className="font-medium text-foreground">
                  {c.strategyGoalTitle}
                </div>
                {c.roleContribution && (
                  <p className="text-[11px] text-muted-foreground">
                    {c.roleContribution}
                  </p>
                )}
                {c.alignmentDescriptors?.strong && (
                  <div className="pt-1 space-y-0.5">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Strong alignment looks like
                    </div>
                    <p className="text-[11px] text-foreground">
                      {c.alignmentDescriptors.strong}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
