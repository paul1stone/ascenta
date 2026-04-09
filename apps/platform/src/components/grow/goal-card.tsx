"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@ascenta/ui";
import { GOAL_TYPE_LABELS, GOAL_STATUS_LABELS } from "@ascenta/db/goal-constants";

interface KeyResult {
  description: string;
  metric?: string;
  status: string;
}

interface EmployeeConfirmation {
  confirmed: boolean;
  confirmedAt?: string;
}

interface ManagerConfirmation {
  confirmed: boolean;
  confirmedAt?: string;
}

interface GoalCardProps {
  goal: {
    id: string;
    objectiveStatement: string;
    goalType: string;
    timePeriod: { start: string; end: string };
    checkInCadence: string;
    status: string;
    lastCheckInDate: string | null;
    createdAt: string;
    keyResults?: KeyResult[];
    strategyGoalId?: string;
    employeeConfirmed?: EmployeeConfirmation;
    managerConfirmed?: ManagerConfirmation;
  };
  accentColor: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending_confirmation: "#f59e0b",
  active: "#22c55e",
  on_track: "#22c55e",
  needs_attention: "#f59e0b",
  off_track: "#ef4444",
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
  const eMonth = e.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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

export function GoalCard({ goal, accentColor }: GoalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const goalTypeColor = GOAL_TYPE_COLORS[goal.goalType] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  const goalTypeLabel = GOAL_TYPE_LABELS[goal.goalType as keyof typeof GOAL_TYPE_LABELS] ?? formatLabel(goal.goalType);
  const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";
  const statusLabel = GOAL_STATUS_LABELS[goal.status as keyof typeof GOAL_STATUS_LABELS] ?? goal.status;

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: statusColor }}
          title={statusLabel}
        />
        <span className="flex-1 font-display text-sm font-semibold text-deep-blue truncate">
          {goal.objectiveStatement}
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: goalTypeColor.bg, color: goalTypeColor.text }}
        >
          {goalTypeLabel}
        </span>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {formatTimePeriod(goal.timePeriod.start, goal.timePeriod.end)}
        </span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t px-5 py-4 space-y-4">
            {goal.keyResults && goal.keyResults.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Key Results
                </p>
                <div className="space-y-1.5">
                  {goal.keyResults.map((kr, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span
                        className={`mt-0.5 text-xs ${
                          kr.status === "achieved"
                            ? "text-emerald-500"
                            : kr.status === "in_progress"
                              ? "text-blue-500"
                              : kr.status === "missed"
                                ? "text-red-500"
                                : "text-muted-foreground"
                        }`}
                      >
                        {kr.status === "achieved"
                          ? "✓"
                          : kr.status === "in_progress"
                            ? "●"
                            : kr.status === "missed"
                              ? "✗"
                              : "○"}
                      </span>
                      <div>
                        <span>{kr.description}</span>
                        {kr.metric && (
                          <span className="ml-2 text-xs text-muted-foreground">{kr.metric}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Check-in Cadence
                </p>
                <p className="text-sm text-foreground">{formatLabel(goal.checkInCadence)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="text-sm font-medium" style={{ color: statusColor }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={goal.employeeConfirmed?.confirmed ? "text-emerald-500" : ""}>
                    {goal.employeeConfirmed?.confirmed ? "✓" : "○"} Employee
                  </span>
                  <span className={goal.managerConfirmed?.confirmed ? "text-emerald-500" : ""}>
                    {goal.managerConfirmed?.confirmed ? "✓" : "○"} Manager
                  </span>
                </div>
                {goal.strategyGoalId && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    Strategy linked
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Last check-in:{" "}
                {goal.lastCheckInDate ? formatDate(goal.lastCheckInDate) : "No check-ins yet"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
