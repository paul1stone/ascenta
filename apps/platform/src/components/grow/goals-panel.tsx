"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Loader2, Plus, Compass, ChevronRight } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ascenta/ui/table";
import { GOAL_CATEGORY_GROUPS } from "@ascenta/db/goal-constants";
import { PerformanceGoalForm } from "@/components/grow/performance-goal-form";
import {
  EmployeeCombobox,
  type EmployeeOption,
} from "@/components/grow/employee-combobox";
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

const STATUS_COLORS: Record<string, string> = {
  on_track: "#22c55e",
  needs_attention: "#f59e0b",
  off_track: "#ef4444",
  completed: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  on_track: "On Track",
  needs_attention: "Needs Attention",
  off_track: "Off Track",
  completed: "Completed",
};

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  Performance: { bg: "rgba(68, 170, 153, 0.1)", text: "#44aa99" },
  Leadership: { bg: "rgba(102, 136, 187, 0.1)", text: "#6688bb" },
  Development: { bg: "rgba(187, 102, 136, 0.1)", text: "#bb6688" },
};

function getCategoryGroup(category: string): string {
  for (const [group, cats] of Object.entries(GOAL_CATEGORY_GROUPS)) {
    if ((cats as readonly string[]).includes(category)) {
      return group.replace(" Goals", "");
    }
  }
  return category;
}

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

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  function renderGoalTable(goalList: GoalData[]) {
    return (
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Goal</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Timeline</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {goalList.map((goal) => {
              const isExpanded = expandedId === goal.id;
              const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";
              const group = getCategoryGroup(goal.category);
              const groupColor =
                GROUP_COLORS[group] ?? {
                  bg: "rgba(148,163,184,0.1)",
                  text: "#94a3b8",
                };

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
                      <div
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                          <div className="grid grid-cols-2 gap-4">
                            {goal.successMetric && (
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                  Success Metric
                                </p>
                                <p className="text-sm font-normal text-foreground">
                                  {goal.successMetric}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Measurement
                              </p>
                              <p className="text-sm font-normal text-foreground">
                                {formatLabel(goal.measurementType)}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Check-in Cadence
                              </p>
                              <p className="text-sm font-normal text-foreground">
                                {formatLabel(goal.checkInCadence)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Alignment
                              </p>
                              <p className="text-sm font-normal text-foreground capitalize">
                                {goal.alignment}
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
                      {STATUS_LABELS[goal.status] ?? goal.status}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: groupColor.bg,
                        color: groupColor.text,
                      }}
                    >
                      {group}
                    </span>
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
            {activeGoals.length > 0 && renderGoalTable(activeGoals)}
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
