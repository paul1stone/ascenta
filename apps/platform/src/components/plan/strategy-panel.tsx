"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Target, Plus, ExternalLink } from "lucide-react";
import { cn } from "@ascenta/ui";
import { STRATEGY_HORIZON_LABELS } from "@ascenta/db/strategy-goal-constants";
import { StrategyGoalCard } from "./strategy-goal-card";
import { StrategyGoalForm } from "./strategy-goal-form";
import type { StrategyGoalData } from "./strategy-goal-card";
import Link from "next/link";

interface StrategyPanelProps {
  accentColor: string;
}

type ViewMode = "company" | "department";

export function StrategyPanel({ accentColor }: StrategyPanelProps) {
  const [goals, setGoals] = useState<StrategyGoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("company");
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<StrategyGoalData | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/plan/strategy-goals");
      const data = await res.json();
      if (data.success) {
        setGoals(data.goals ?? []);
      } else {
        setError(data.error ?? "Failed to fetch goals");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function handleArchive(goalId: string) {
    await fetch(`/api/plan/strategy-goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    fetchGoals();
  }

  function handleEdit(goal: StrategyGoalData) {
    setEditGoal(goal);
    setShowForm(true);
  }

  const filteredGoals =
    viewMode === "company"
      ? goals.filter((g) => g.scope === "company")
      : goals.filter((g) => g.scope === "department");

  const horizonOrder = ["long_term", "medium_term", "short_term"] as const;
  const groupedByHorizon = horizonOrder.map((h) => ({
    horizon: h,
    label: STRATEGY_HORIZON_LABELS[h],
    goals: filteredGoals.filter((g) => g.horizon === h),
  }));

  const departments = [
    ...new Set(goals.filter((g) => g.scope === "department").map((g) => g.department).filter(Boolean)),
  ] as string[];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <Target className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Unable to Load Strategy Goals
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-deep-blue">
              Strategy Goals
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {goals.length} goal{goals.length !== 1 ? "s" : ""} across all horizons
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/do"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-4" />
              Use Do
            </Link>
            <button
              onClick={() => {
                setEditGoal(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="size-4" />
              Create Goal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1 mb-6 w-fit">
          {(["company", "department"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                viewMode === mode
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode === "company" ? "Company-wide" : "By Department"}
            </button>
          ))}
        </div>

        {filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No {viewMode === "company" ? "Company" : "Department"} Goals Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first strategy goal to get started.
            </p>
          </div>
        ) : viewMode === "company" ? (
          <div className="space-y-6">
            {groupedByHorizon.map(
              (group) =>
                group.goals.length > 0 && (
                  <div key={group.horizon}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-3">
                      {group.goals.map((goal) => (
                        <StrategyGoalCard
                          key={goal.id}
                          goal={goal}
                          accentColor={accentColor}
                          onEdit={handleEdit}
                          onArchive={handleArchive}
                        />
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {departments.map((dept) => {
              const deptGoals = filteredGoals.filter((g) => g.department === dept);
              if (deptGoals.length === 0) return null;
              return (
                <div key={dept}>
                  <h3 className="font-display text-base font-bold text-deep-blue mb-3">
                    {dept}
                  </h3>
                  <div className="space-y-6">
                    {horizonOrder.map((h) => {
                      const hGoals = deptGoals.filter((g) => g.horizon === h);
                      if (hGoals.length === 0) return null;
                      return (
                        <div key={h}>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            {STRATEGY_HORIZON_LABELS[h]}
                          </p>
                          <div className="space-y-3">
                            {hGoals.map((goal) => (
                              <StrategyGoalCard
                                key={goal.id}
                                goal={goal}
                                accentColor={accentColor}
                                onEdit={handleEdit}
                                onArchive={handleArchive}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <StrategyGoalForm
          accentColor={accentColor}
          onClose={() => {
            setShowForm(false);
            setEditGoal(null);
          }}
          onSaved={fetchGoals}
          editGoal={editGoal}
        />
      )}
    </div>
  );
}
