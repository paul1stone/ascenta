"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Target, Plus, Compass, ChevronRight } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ascenta/ui/table";
import { STRATEGY_HORIZON_LABELS } from "@ascenta/db/strategy-goal-constants";
import { StrategyGoalForm } from "./strategy-goal-form";
import type { StrategyGoalData } from "./strategy-goal-card";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

interface StrategyPanelProps {
  accentColor: string;
}

type ViewMode = "company" | "department";

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  on_track: "#22c55e",
  needs_attention: "#f59e0b",
  off_track: "#ef4444",
  completed: "#6b7280",
  archived: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  on_track: "On Track",
  needs_attention: "Needs Attention",
  off_track: "Off Track",
  completed: "Completed",
  archived: "Archived",
};

const HORIZON_COLORS: Record<string, { bg: string; text: string }> = {
  long_term: { bg: "rgba(102, 136, 187, 0.1)", text: "#6688bb" },
  medium_term: { bg: "rgba(68, 170, 153, 0.1)", text: "#44aa99" },
  short_term: { bg: "rgba(187, 102, 136, 0.1)", text: "#bb6688" },
};

function formatTimePeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const eMonth = e.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return `${sMonth} – ${eMonth}`;
}

export function StrategyPanel({ accentColor }: StrategyPanelProps) {
  const { user } = useAuth();
  const canCreate = user?.role === "hr" || user?.role === "manager";
  const canEditAll = user?.role === "hr";

  const [goals, setGoals] = useState<StrategyGoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("company");
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<StrategyGoalData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const visibleGoals =
    user?.role === "employee"
      ? filteredGoals.filter(
          (g) =>
            g.scope === "company" || g.department === user?.department,
        )
      : filteredGoals;

  const horizonOrder = ["long_term", "medium_term", "short_term"] as const;
  const groupedByHorizon = horizonOrder.map((h) => ({
    horizon: h,
    label: STRATEGY_HORIZON_LABELS[h],
    goals: visibleGoals.filter((g) => g.horizon === h),
  }));

  const departments = [
    ...new Set(
      visibleGoals
        .filter((g) => g.scope === "department")
        .map((g) => g.department)
        .filter(Boolean),
    ),
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

  function canEditGoal(goal: StrategyGoalData) {
    return (
      canEditAll ||
      (user?.role === "manager" &&
        goal.scope === "department" &&
        goal.department === user?.department)
    );
  }

  function renderGoalTable(goalList: StrategyGoalData[], hideDepartment?: boolean) {
    const showDept = viewMode === "department" && !hideDepartment;
    return (
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Goal</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Horizon</TableHead>
              {showDept && <TableHead className="whitespace-nowrap">Department</TableHead>}
              <TableHead className="whitespace-nowrap">Timeline</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {goalList.map((goal) => {
              const isExpanded = expandedId === goal.id;
              const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";
              const horizonColor =
                HORIZON_COLORS[goal.horizon] ?? {
                  bg: "rgba(148,163,184,0.1)",
                  text: "#94a3b8",
                };
              const horizonLabel =
                STRATEGY_HORIZON_LABELS[
                  goal.horizon as keyof typeof STRATEGY_HORIZON_LABELS
                ] ?? goal.horizon;

              return (
                <TableRow
                  key={goal.id}
                  className="group cursor-pointer"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : goal.id)
                  }
                >
                  <TableCell className="pl-4 font-display text-sm font-semibold text-deep-blue">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      <span className="truncate">{goal.title}</span>
                    </div>

                    {/* Expanded detail */}
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="pt-3 pb-1 pl-[18px] space-y-3">
                          {goal.description && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Description
                              </p>
                              <p className="text-sm font-normal text-foreground leading-relaxed">
                                {goal.description}
                              </p>
                            </div>
                          )}
                          {goal.rationale && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Rationale
                              </p>
                              <p className="text-sm font-normal text-foreground leading-relaxed">
                                {goal.rationale}
                              </p>
                            </div>
                          )}
                          {goal.successMetrics && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Success Metrics
                              </p>
                              <p className="text-sm font-normal text-foreground leading-relaxed whitespace-pre-wrap">
                                {goal.successMetrics}
                              </p>
                            </div>
                          )}
                          {canEditGoal(goal) && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(goal)}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Edit
                              </button>
                              {goal.status !== "archived" && (
                                <button
                                  onClick={() => handleArchive(goal.id)}
                                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Archive
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className="text-xs font-medium"
                      style={{ color: statusColor }}
                    >
                      {STATUS_LABELS[goal.status] ?? goal.status}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: horizonColor.bg,
                        color: horizonColor.text,
                      }}
                    >
                      {horizonLabel}
                    </span>
                  </TableCell>
                  {showDept && (
                    <TableCell className="whitespace-nowrap">
                      <span className="text-xs text-muted-foreground">
                        {goal.department}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">
                      {formatTimePeriod(
                        goal.timePeriod.start,
                        goal.timePeriod.end,
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight
                      className={cn(
                        "size-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-90",
                      )}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Compass CTAs — primary actions in grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {canCreate && (
            <Link
              href="/do?prompt=Help%20me%20define%20a%20new%20strategy%20goal%20for%20our%20company"
              className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
              style={{
                borderColor: "rgba(255, 107, 53, 0.3)",
                background: "rgba(255, 107, 53, 0.03)",
              }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
              >
                <Compass
                  className="size-[18px]"
                  style={{ color: "#ff6b35" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-deep-blue">
                  Build Strategy with Compass
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  AI-guided goal creation
                </p>
              </div>
            </Link>
          )}

          <Link
            href="/do?prompt=Break%20down%20our%20company%20strategy%20for%20me&tool=getStrategyBreakdown"
            className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
            style={{
              borderColor: `${accentColor}4d`,
              background: `${accentColor}08`,
            }}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accentColor}1a` }}
            >
              <Target
                className="size-[18px]"
                style={{ color: accentColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-deep-blue">
                Strategy Breakdown
              </p>
              <p className="text-xs text-muted-foreground truncate">
                See how goals apply to you
              </p>
            </div>
          </Link>
        </div>

        {/* Header row: title + toggle + create */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-deep-blue">
              Strategy Goals
            </h2>
            <span className="text-xs text-muted-foreground">
              {visibleGoals.length} goal
              {visibleGoals.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5">
              {(["company", "department"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    viewMode === mode
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode === "company" ? "Company" : "Department"}
                </button>
              ))}
            </div>
            {canCreate && (
              <button
                onClick={() => {
                  setEditGoal(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="size-3.5" />
                Create
              </button>
            )}
          </div>
        </div>

        {/* Priority count warning */}
        {viewMode === "company" && (() => {
          const companyCount = goals.filter((g) => g.scope === "company").length;
          if (companyCount > 0 && (companyCount < 3 || companyCount > 5)) {
            return (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 mb-4">
                Strategy Studio recommends 3–5 enterprise priorities per planning cycle.
                You currently have {companyCount}.
              </div>
            );
          }
          return null;
        })()}

        {visibleGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No {viewMode === "company" ? "Company" : "Department"} Goals
              Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Get started by building your first strategy goal with Compass.
            </p>
            {canCreate && (
              <Link
                href="/do?prompt=Help%20me%20define%20a%20new%20strategy%20goal%20for%20our%20company"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#ff6b35" }}
              >
                <Compass className="size-4" />
                Build with Compass
              </Link>
            )}
          </div>
        ) : viewMode === "company" ? (
          renderGoalTable(visibleGoals)
        ) : (
          <div className="space-y-6">
            {departments.map((dept) => {
              const deptGoals = visibleGoals.filter(
                (g) => g.department === dept,
              );
              if (deptGoals.length === 0) return null;
              return (
                <div key={dept}>
                  <h3 className="font-display text-sm font-bold text-deep-blue mb-2">
                    {dept}
                  </h3>
                  {renderGoalTable(deptGoals, true)}
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
