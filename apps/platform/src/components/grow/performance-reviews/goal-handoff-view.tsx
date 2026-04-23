"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Compass,
  Loader2,
  Target,
} from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { Label } from "@ascenta/ui/label";
import { Input } from "@ascenta/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";

interface AlignedGoal {
  goalId: string;
  title: string;
  category: string | null;
  status: string | null;
  alignment: string | null;
  successMetric: string | null;
}

interface StrategyGoalSummary {
  id: string;
  title: string;
  horizon: string | null;
  department: string | null;
  successMetrics: string | null;
}

interface GoalHandoffViewProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  accentColor: string;
  onBack: () => void;
  onCompleted: () => void;
}

type Period = "Q1" | "Q2" | "Q3" | "Q4" | "H1" | "H2" | "annual" | "custom";

const PERIOD_OPTIONS: Array<{ key: Period; label: string }> = [
  { key: "Q1", label: "Q1 (Jan–Mar)" },
  { key: "Q2", label: "Q2 (Apr–Jun)" },
  { key: "Q3", label: "Q3 (Jul–Sep)" },
  { key: "Q4", label: "Q4 (Oct–Dec)" },
  { key: "H1", label: "H1" },
  { key: "H2", label: "H2" },
  { key: "annual", label: "Annual" },
  { key: "custom", label: "Custom range" },
];

function nextQuarterDefault(): Period {
  const m = new Date().getMonth();
  if (m < 3) return "Q2";
  if (m < 6) return "Q3";
  if (m < 9) return "Q4";
  return "Q1";
}

export function GoalHandoffView({
  reviewId,
  employeeName,
  reviewPeriod,
  accentColor,
  onBack,
  onCompleted,
}: GoalHandoffViewProps) {
  const [alignedGoals, setAlignedGoals] = useState<AlignedGoal[]>([]);
  const [pillars, setPillars] = useState<StrategyGoalSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [nextPeriod, setNextPeriod] = useState<Period>(nextQuarterDefault());
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const [rRes, sRes] = await Promise.all([
          fetch(`/api/grow/reviews/${reviewId}`),
          fetch(`/api/grow/reviews/${reviewId}/strategy-context`),
        ]);
        if (!rRes.ok) throw new Error(`Review load failed (${rRes.status})`);

        const rData = await rRes.json();
        const review = rData?.review;
        const goals: AlignedGoal[] = Array.isArray(review?.alignedGoals)
          ? review.alignedGoals.map((g: Record<string, unknown>) => ({
              goalId: String(g.goalId ?? ""),
              title: (g.title as string | undefined) ?? "",
              category: (g.category as string | null | undefined) ?? null,
              status: (g.status as string | null | undefined) ?? null,
              alignment: (g.alignment as string | null | undefined) ?? null,
              successMetric:
                (g.successMetric as string | null | undefined) ?? null,
            }))
          : [];
        if (cancelled) return;
        setAlignedGoals(goals);
        // Default: carry forward every goal that isn't already "completed"
        // or "abandoned" — those are done, don't duplicate them.
        const seed = new Set(
          goals
            .filter((g) => !["completed", "abandoned"].includes(g.status ?? ""))
            .map((g) => g.goalId),
        );
        setSelected(seed);
        if (review?.goalHandoffCompleted) {
          setDone(true);
        }

        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.success) {
            setPillars((sData.strategyGoals ?? []) as StrategyGoalSummary[]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load");
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

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    if (nextPeriod === "custom" && (!customStart || !customEnd)) {
      setSubmitError("Pick a start and end date for the custom period.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/grow/reviews/${reviewId}/handoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carryForwardGoalIds: Array.from(selected),
          nextPeriod,
          customStartDate: nextPeriod === "custom" ? customStart : undefined,
          customEndDate: nextPeriod === "custom" ? customEnd : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setCreatedCount((data.created ?? []).length);
      setDone(true);
      onCompleted();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }, [reviewId, selected, nextPeriod, customStart, customEnd, onCompleted]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Plan next period goals
          </h2>
          <p className="text-sm text-muted-foreground">
            {employeeName} · prior period: {reviewPeriod}
          </p>
        </div>
      </div>

      {loadError && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {done ? (
        <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/30 p-5 flex items-start gap-3">
          <CheckCircle2
            className="size-5 mt-0.5 shrink-0"
            style={{ color: accentColor }}
          />
          <div>
            <div className="font-semibold text-foreground">Handoff complete</div>
            <p className="text-sm text-muted-foreground">
              {createdCount > 0
                ? `Created ${createdCount} goal${createdCount === 1 ? "" : "s"} in the new period. They are in draft — confirm with the employee to activate.`
                : "No goals were carried forward. The employee can still start new goals from the Goals tab or from strategic pillars."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Carry-forward */}
          <section className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="size-4" style={{ color: accentColor }} />
              <h3 className="font-display text-sm font-bold">
                Carry forward from this review
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Select goals to duplicate into the next period. Carried-forward
              goals start in draft, with fresh confirmations and a new period
              end date applied to each key result.
            </p>

            {alignedGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No goals were attached to this review.
              </p>
            ) : (
              <ul className="space-y-2">
                {alignedGoals.map((g) => {
                  const checked = selected.has(g.goalId);
                  const finished = ["completed", "abandoned"].includes(
                    g.status ?? "",
                  );
                  return (
                    <li
                      key={g.goalId}
                      className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(g.goalId)}
                        className="mt-1 size-4"
                        aria-label={`Carry forward ${g.title}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {g.title}
                        </div>
                        <div className="flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                          {g.category && <span>{g.category}</span>}
                          {g.status && (
                            <span>
                              • Status: {g.status}
                              {finished && " (prior period complete)"}
                            </span>
                          )}
                          {g.alignment && <span>• {g.alignment}</span>}
                        </div>
                        {g.successMetric && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {g.successMetric}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
              <div className="space-y-1.5">
                <Label htmlFor="handoff-period">Next period</Label>
                <Select
                  value={nextPeriod}
                  onValueChange={(v) => setNextPeriod(v as Period)}
                >
                  <SelectTrigger id="handoff-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {nextPeriod === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="handoff-start">Start</Label>
                    <Input
                      id="handoff-start"
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="handoff-end">End</Label>
                    <Input
                      id="handoff-end"
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* New goals from strategic pillars — links to the chat tool */}
          {pillars.length > 0 && (
            <section className="rounded-lg border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="size-4" style={{ color: accentColor }} />
                <h3 className="font-display text-sm font-bold">
                  Or start a new goal from a strategic pillar
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                For each pillar relevant to the next period, launch the
                goal-creation tool pre-seeded with that pillar's context.
              </p>
              <ul className="space-y-2">
                {pillars.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {p.title}
                      </div>
                      {p.successMetrics && (
                        <div className="text-[11px] text-muted-foreground">
                          {p.successMetrics}
                        </div>
                      )}
                    </div>
                    <a
                      href={`/grow/performance?tool=startGoalWorkflow&strategyGoalId=${p.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium hover:underline shrink-0"
                      style={{ color: accentColor }}
                    >
                      Start goal
                      <ArrowRight className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {submitError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                // Explicit "skip" — mark handoff complete without carrying
                // anything forward. The employee can still create goals later.
                setSelected(new Set());
                await handleSubmit();
              }}
              disabled={submitting}
            >
              Skip carry-forward
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ backgroundColor: accentColor }}
              className="text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Carry forward {selected.size} goal
                  {selected.size === 1 ? "" : "s"}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
