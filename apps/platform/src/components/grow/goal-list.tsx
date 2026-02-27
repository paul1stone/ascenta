"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { Skeleton } from "@ascenta/ui/skeleton";

interface GoalOwner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
}

interface Goal {
  id: string;
  statement: string;
  measure: string;
  type: "team" | "role" | "individual";
  owner: GoalOwner | string;
  timeperiod: { start: string | null; end: string | null };
  dependencies: string[];
  status: "draft" | "active" | "locked" | "completed" | "cancelled";
  createdAt: string;
}

interface GoalListProps {
  onBack?: () => void;
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Locked", value: "locked" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "active":
      return "bg-green-100 text-green-700";
    case "locked":
      return "bg-amber-100 text-amber-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getOwnerName(owner: GoalOwner | string): string {
  if (typeof owner === "string") return "Unknown";
  return `${owner.firstName} ${owner.lastName}`;
}

export function GoalList({ onBack }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/goals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          <h2 className="font-display text-lg font-semibold text-deep-blue">
            Goals
          </h2>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Goal Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 shadow-sm">
          <Target className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            No goals yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Create your first goal to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-xl border bg-white p-5 shadow-sm transition-colors hover:border-slate-300"
            >
              {/* Statement & Status */}
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">
                  {goal.statement}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(goal.status)}`}
                >
                  {formatStatus(goal.status)}
                </span>
              </div>

              {/* Measure */}
              <p className="mt-1.5 text-sm text-muted-foreground">
                {goal.measure}
              </p>

              {/* Meta Row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{getOwnerName(goal.owner)}</span>
                <span className="rounded bg-slate-50 px-1.5 py-0.5 text-slate-600">
                  {formatType(goal.type)}
                </span>
                {goal.timeperiod?.end && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {formatDate(goal.timeperiod.end)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
