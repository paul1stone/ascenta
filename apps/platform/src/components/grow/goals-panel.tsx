"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Loader2, Plus, Compass } from "lucide-react";
import { GoalCard } from "@/components/grow/goal-card";
import { PerformanceGoalForm } from "@/components/grow/performance-goal-form";
import { useRole } from "@/lib/role/role-context";
import Link from "next/link";

interface GoalData {
  id: string;
  title: string;
  description: string;
  category: string;
  measurementType: string;
  successMetric: string;
  timePeriod: { start: string; end: string };
  checkInCadence: string;
  alignment: string;
  status: string;
  lastCheckInDate: string | null;
  createdAt: string;
}

interface GoalsPanelProps {
  accentColor: string;
}

export function GoalsPanel({ accentColor }: GoalsPanelProps) {
  const { persona, loading: roleLoading } = useRole();
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (roleLoading) return;
    if (!persona?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const goalsRes = await fetch(`/api/grow/goals?employeeId=${persona.id}`);
      const goalsData = await goalsRes.json();

      if (goalsData.success) {
        setGoals(goalsData.goals ?? []);
      } else {
        setError(goalsData.error ?? "Failed to fetch goals");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, [persona?.id, roleLoading]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const employeeName = persona
    ? `${persona.firstName} ${persona.lastName}`
    : "";

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
          Unable to Load Goals
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header with Create button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-deep-blue">
              My Goals
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {employeeName ? `${employeeName} — ` : ""}
              {activeGoals.length} active goal
              {activeGoals.length !== 1 ? "s" : ""}
              {completedGoals.length > 0 &&
                `, ${completedGoals.length} completed`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="size-4" />
            Create Goal
          </button>
        </div>

        {/* Compass CTA */}
        <Link
          href="/do?prompt=Help%20me%20create%20a%20performance%20goal&tool=startGoalCreation"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-[--accent] hover:bg-[--accent-bg] mb-6"
          style={
            {
              "--accent": "#ff6b35",
              "--accent-bg": "rgba(255, 107, 53, 0.04)",
            } as React.CSSProperties
          }
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
          >
            <Compass className="size-5" style={{ color: "#ff6b35" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-deep-blue">
              Create Goal with Compass
            </p>
            <p className="text-xs text-muted-foreground">
              Use AI to help define goals, suggest metrics, and align to
              company strategy.
            </p>
          </div>
        </Link>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Goals Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first goal using the button above, or use Compass
              for AI-assisted goal creation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />
            ))}
            {completedGoals.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4 pb-1">
                  Completed
                </p>
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    accentColor={accentColor}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <PerformanceGoalForm
          accentColor={accentColor}
          onClose={() => setShowForm(false)}
          onSaved={fetchGoals}
          defaultEmployeeId={persona?.id}
          defaultEmployeeName={employeeName}
        />
      )}
    </div>
  );
}
