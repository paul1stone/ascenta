"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Loader2, Plus, Compass, ChevronRight, Check, Circle } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ascenta/ui/table";
import {
  GOAL_TYPE_LABELS,
  GOAL_STATUS_LABELS,
  KEY_RESULT_STATUS_LABELS,
  CHECKIN_CADENCE_LABELS,
} from "@ascenta/db/goal-constants";
import { PerformanceGoalForm } from "@/components/grow/performance-goal-form";
import {
  EmployeeCombobox,
  type EmployeeOption,
} from "@/components/grow/employee-combobox";
import { useRole } from "@/lib/role/role-context";
import Link from "next/link";

interface KeyResult {
  title: string;
  status: string;
}

interface GoalData {
  id: string;
  objectiveStatement: string;
  goalType: string;
  keyResults?: KeyResult[];
  timePeriod: { start: string; end: string };
  checkInCadence: string;
  status: string;
  lastCheckInDate: string | null;
  createdAt: string;
  strategyGoalId: string | null;
  notes: string;
  employeeConfirmed: boolean;
  managerConfirmed: boolean;
}

interface GoalsPanelProps {
  accentColor: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending_confirmation: "#8b5cf6",
  active: "#22c55e",
  needs_attention: "#f59e0b",
  blocked: "#ef4444",
  completed: "#6b7280",
};

const GOAL_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  performance: { bg: "rgba(68, 170, 153, 0.1)", text: "#44aa99" },
  development: { bg: "rgba(102, 136, 187, 0.1)", text: "#6688bb" },
};

function formatTimePeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString("en-US", { month: "short" });
  const eMonth = e.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return `${sMonth} – ${eMonth}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GoalsPanel({ accentColor }: GoalsPanelProps) {
  const { role, persona, loading: roleLoading } = useRole();
  const canViewOthers = role === "hr" || role === "manager";

  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);

  // The employee whose goals we're viewing
  const viewingEmployeeId = selectedEmployee?.id ?? persona?.id;
  const viewingEmployeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
    : persona
      ? `${persona.firstName} ${persona.lastName}`
      : "";
  const isViewingSelf = !selectedEmployee;

  const fetchGoals = useCallback(async () => {
    if (roleLoading) return;
    if (!viewingEmployeeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const goalsRes = await fetch(
        `/api/grow/goals?employeeId=${viewingEmployeeId}`,
      );
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
  }, [viewingEmployeeId, roleLoading]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

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

  const draftGoals = goals.filter((g) => g.status === "draft");
  const pendingGoals = goals.filter((g) => g.status === "pending_confirmation");
  const activeGoals = goals.filter((g) =>
    ["active", "needs_attention", "blocked"].includes(g.status),
  );
  const completedGoals = goals.filter((g) => g.status === "completed");

  function renderGoalTable(goalList: GoalData[]) {
    return (
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Goal</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Key Results</TableHead>
              <TableHead className="whitespace-nowrap">Timeline</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {goalList.map((goal) => {
              const isExpanded = expandedId === goal.id;
              const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";
              const typeColor = GOAL_TYPE_COLORS[goal.goalType] ?? {
                bg: "rgba(148,163,184,0.1)",
                text: "#94a3b8",
              };
              const typeLabel =
                GOAL_TYPE_LABELS[goal.goalType as keyof typeof GOAL_TYPE_LABELS] ??
                goal.goalType;

              const achievedKRs =
                goal.keyResults?.filter((kr) => kr.status === "achieved").length ?? 0;
              const totalKRs = goal.keyResults?.length ?? 0;

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
                      <span className="truncate">{goal.objectiveStatement}</span>
                      {/* Dual confirmation indicators */}
                      <div className="flex items-center gap-1 ml-1 shrink-0">
                        <span
                          title="Employee confirmed"
                          className={cn(
                            "flex items-center justify-center size-4 rounded-full",
                            goal.employeeConfirmed
                              ? "text-emerald-600"
                              : "text-muted-foreground/40",
                          )}
                        >
                          {goal.employeeConfirmed ? (
                            <Check className="size-3" />
                          ) : (
                            <Circle className="size-3" />
                          )}
                        </span>
                        <span
                          title="Manager confirmed"
                          className={cn(
                            "flex items-center justify-center size-4 rounded-full",
                            goal.managerConfirmed
                              ? "text-emerald-600"
                              : "text-muted-foreground/40",
                          )}
                        >
                          {goal.managerConfirmed ? (
                            <Check className="size-3" />
                          ) : (
                            <Circle className="size-3" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="pt-3 pb-1 pl-[18px] space-y-3">
                          {/* Key Results list */}
                          {goal.keyResults && goal.keyResults.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Key Results
                              </p>
                              <ul className="space-y-1">
                                {goal.keyResults.map((kr, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-2 text-sm font-normal text-foreground"
                                  >
                                    <span
                                      className={cn(
                                        "size-1.5 rounded-full shrink-0",
                                        kr.status === "achieved"
                                          ? "bg-emerald-500"
                                          : kr.status === "in_progress"
                                            ? "bg-amber-400"
                                            : kr.status === "missed"
                                              ? "bg-red-400"
                                              : "bg-slate-300",
                                      )}
                                    />
                                    <span>{kr.title}</span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {KEY_RESULT_STATUS_LABELS[
                                        kr.status as keyof typeof KEY_RESULT_STATUS_LABELS
                                      ] ?? kr.status}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Check-in Cadence
                              </p>
                              <p className="text-sm font-normal text-foreground">
                                {CHECKIN_CADENCE_LABELS[
                                  goal.checkInCadence as keyof typeof CHECKIN_CADENCE_LABELS
                                ] ?? goal.checkInCadence}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Last Check-in
                              </p>
                              <p className="text-sm font-normal text-foreground">
                                {goal.lastCheckInDate
                                  ? formatDate(goal.lastCheckInDate)
                                  : "None yet"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Confirmed By
                              </p>
                              <p className="text-sm font-normal text-foreground">
                                {goal.employeeConfirmed && goal.managerConfirmed
                                  ? "Both"
                                  : goal.employeeConfirmed
                                    ? "Employee"
                                    : goal.managerConfirmed
                                      ? "Manager"
                                      : "Neither"}
                              </p>
                            </div>
                          </div>
                          {goal.strategyGoalId && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Strategy Alignment
                              </p>
                              <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold bg-muted text-foreground">
                                Strategy linked
                              </span>
                            </div>
                          )}
                          {goal.notes && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Notes
                              </p>
                              <p className="text-sm font-normal text-foreground leading-relaxed">
                                {goal.notes}
                              </p>
                            </div>
                          )}
                          {/* Action buttons */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {/* Pending confirmation: show Confirm (for managers) */}
                            {goal.status === "pending_confirmation" &&
                              canViewOthers &&
                              !isViewingSelf && (
                                <>
                                  <button
                                    onClick={async () => {
                                      await fetch("/api/grow/goals", {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          goalId: goal.id,
                                          action: "confirm",
                                          role: "manager",
                                        }),
                                      });
                                      fetchGoals();
                                    }}
                                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                                    style={{ backgroundColor: "#22c55e" }}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await fetch("/api/grow/goals", {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          goalId: goal.id,
                                          action: "request_changes",
                                        }),
                                      });
                                      fetchGoals();
                                    }}
                                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    Request Changes
                                  </button>
                                  <a
                                    href={`/do?prompt=Review%20this%20goal%20for%20${encodeURIComponent(goal.objectiveStatement)}`}
                                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    Review with Compass
                                  </a>
                                </>
                              )}
                            {/* Active goals: status update dropdown */}
                            {["active", "needs_attention", "blocked"].includes(
                              goal.status,
                            ) &&
                              canViewOthers &&
                              !isViewingSelf && (
                                <select
                                  className="rounded-lg border px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-white cursor-pointer"
                                  defaultValue=""
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    if (!newStatus) return;
                                    await fetch("/api/grow/goals", {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        goalId: goal.id,
                                        action: "update_status",
                                        status: newStatus,
                                      }),
                                    });
                                    fetchGoals();
                                  }}
                                >
                                  <option value="" disabled>
                                    Update status…
                                  </option>
                                  <option value="needs_attention">
                                    Needs Attention
                                  </option>
                                  <option value="blocked">Blocked</option>
                                  <option value="completed">Completed</option>
                                </select>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className="text-xs font-medium"
                      style={{ color: statusColor }}
                    >
                      {GOAL_STATUS_LABELS[
                        goal.status as keyof typeof GOAL_STATUS_LABELS
                      ] ?? goal.status}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: typeColor.bg,
                        color: typeColor.text,
                      }}
                    >
                      {typeLabel}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {totalKRs > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {achievedKRs}/{totalKRs} achieved
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
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
          <Link
            href="/do?prompt=Help%20me%20create%20a%20performance%20goal&tool=startGoalWorkflow"
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
                Create Goal with Compass
              </p>
              <p className="text-xs text-muted-foreground truncate">
                AI-guided goal creation with metrics
              </p>
            </div>
          </Link>

          <Link
            href="/do?prompt=Run%20a%20check-in%20on%20my%20goals&tool=startCheckIn"
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
                Run a Check-in
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Review progress on your active goals
              </p>
            </div>
          </Link>
        </div>

        {/* Header row: title + employee selector + create */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-deep-blue">
              {isViewingSelf ? "My Goals" : `${viewingEmployeeName}'s Goals`}
            </h2>
            <span className="text-xs text-muted-foreground">
              {pendingGoals.length > 0 &&
                `${pendingGoals.length} pending, `}
              {activeGoals.length} active
              {completedGoals.length > 0 &&
                `, ${completedGoals.length} completed`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canViewOthers && (
              <EmployeeCombobox
                value={selectedEmployee?.id ?? null}
                onChange={setSelectedEmployee}
                department={role === "manager" ? persona?.department : undefined}
                selfLabel="My Goals"
              />
            )}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="size-3.5" />
              Create
            </button>
          </div>
        </div>

        {/* Development goal balance warning */}
        {goals.length > 0 && !goals.some((g) => g.goalType === "development") && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 mb-4">
            Consider adding a development goal for this period.
          </div>
        )}

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Goals Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Get started by creating your first goal with Compass.
            </p>
            <Link
              href="/do?prompt=Help%20me%20create%20a%20performance%20goal&tool=startGoalWorkflow"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "#ff6b35" }}
            >
              <Compass className="size-4" />
              Create with Compass
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {draftGoals.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Draft
                </p>
                {renderGoalTable(draftGoals)}
              </div>
            )}
            {pendingGoals.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Pending Confirmation
                </p>
                {renderGoalTable(pendingGoals)}
              </div>
            )}
            {activeGoals.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Active
                </p>
                {renderGoalTable(activeGoals)}
              </div>
            )}
            {completedGoals.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Completed
                </p>
                {renderGoalTable(completedGoals)}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <PerformanceGoalForm
          accentColor={accentColor}
          onClose={() => setShowForm(false)}
          onSaved={fetchGoals}
          defaultEmployeeId={viewingEmployeeId}
          defaultEmployeeName={viewingEmployeeName}
        />
      )}
    </div>
  );
}
