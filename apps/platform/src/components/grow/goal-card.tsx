"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@ascenta/ui";
import { GOAL_CATEGORY_GROUPS } from "@ascenta/db/goal-constants";

interface GoalCardProps {
  goal: {
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
  };
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

function getCategoryGroup(category: string): string {
  for (const [group, cats] of Object.entries(GOAL_CATEGORY_GROUPS)) {
    if ((cats as readonly string[]).includes(category)) {
      return group.replace(" Goals", "");
    }
  }
  return category;
}

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  Performance: { bg: "rgba(68, 170, 153, 0.1)", text: "#44aa99" },
  Leadership: { bg: "rgba(102, 136, 187, 0.1)", text: "#6688bb" },
  Development: { bg: "rgba(187, 102, 136, 0.1)", text: "#bb6688" },
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

  const group = getCategoryGroup(goal.category);
  const groupColor = GROUP_COLORS[group] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  const statusColor = STATUS_COLORS[goal.status] ?? "#6b7280";

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
          style={{ backgroundColor: groupColor.bg, color: groupColor.text }}
        >
          {group}
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {goal.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Success Metric
                </p>
                <p className="text-sm text-foreground">{goal.successMetric}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Measurement
                </p>
                <p className="text-sm text-foreground">{formatLabel(goal.measurementType)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Check-in Cadence
                </p>
                <p className="text-sm text-foreground">{formatLabel(goal.checkInCadence)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Alignment
                </p>
                <p className="text-sm text-foreground capitalize">{goal.alignment}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Category
                </p>
                <p className="text-sm text-foreground">{formatLabel(goal.category)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="text-xs font-medium" style={{ color: statusColor }}>
                  {STATUS_LABELS[goal.status] ?? goal.status}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Last check-in: {goal.lastCheckInDate ? formatDate(goal.lastCheckInDate) : "No check-ins yet"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
