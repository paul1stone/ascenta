"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  STRATEGY_HORIZON_LABELS,
} from "@ascenta/db/strategy-goal-constants";

export interface StrategyGoalData {
  id: string;
  title: string;
  description: string;
  horizon: string;
  timePeriod: { start: string; end: string };
  scope: string;
  department: string | null;
  successMetrics: string;
  status: string;
  createdAt: string;
}

interface StrategyGoalCardProps {
  goal: StrategyGoalData;
  accentColor: string;
  onEdit?: (goal: StrategyGoalData) => void;
  onArchive?: (goalId: string) => void;
}

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
  const sMonth = s.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const eMonth = e.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${sMonth} – ${eMonth}`;
}

export function StrategyGoalCard({ goal, accentColor, onEdit, onArchive }: StrategyGoalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";
  const horizonColor = HORIZON_COLORS[goal.horizon] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  const horizonLabel = STRATEGY_HORIZON_LABELS[goal.horizon as keyof typeof STRATEGY_HORIZON_LABELS] ?? goal.horizon;

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: statusColor }}
          title={STATUS_LABELS[goal.status]}
        />
        <span className="flex-1 font-display text-sm font-semibold text-deep-blue truncate">
          {goal.title}
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: horizonColor.bg, color: horizonColor.text }}
        >
          {horizonLabel}
        </span>
        {goal.scope === "department" && goal.department && (
          <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
            {goal.department}
          </span>
        )}
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {goal.description}
              </p>
            </div>

            {goal.successMetrics && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Success Metrics
                </p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {goal.successMetrics}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Horizon
                </p>
                <p className="text-sm text-foreground">{horizonLabel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Scope
                </p>
                <p className="text-sm text-foreground capitalize">
                  {goal.scope === "department" ? goal.department : "Company-wide"}
                </p>
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
                  <span className="text-sm" style={{ color: statusColor }}>
                    {STATUS_LABELS[goal.status] ?? goal.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(goal);
                  }}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
              )}
              {onArchive && goal.status !== "archived" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(goal.id);
                  }}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
