"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Target,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { Skeleton } from "@ascenta/ui/skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatusCount {
  status: string;
  count: number;
}

interface OverdueCheckIn {
  id: string;
  scheduledDate: string;
  goal: { id: string; statement: string } | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    managerName: string;
  } | null;
}

interface GoalWithoutCheckIn {
  _id: string;
  statement: string;
  status: string;
}

interface GrowStatusResponse {
  goalsByStatus: StatusCount[];
  checkInStats: StatusCount[];
  overdueCheckIns: OverdueCheckIn[];
  goalsWithoutCheckIns: GoalWithoutCheckIn[];
  recentNotesCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countByStatus(items: StatusCount[], status: string): number {
  return items.find((i) => i.status === status)?.count ?? 0;
}

function sumCounts(items: StatusCount[]): number {
  return items.reduce((acc, i) => acc + i.count, 0);
}

function daysOverdue(scheduledDate: string): number {
  const diff = Date.now() - new Date(scheduledDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GrowStatus() {
  const [data, setData] = useState<GrowStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/grow/status");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch grow status:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-5 shadow-sm">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-7 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ---- Empty state ----
  const totalGoals = data ? sumCounts(data.goalsByStatus) : 0;
  const totalCheckIns = data ? sumCounts(data.checkInStats) : 0;
  const recentNotes = data?.recentNotesCount ?? 0;

  if (!data || (totalGoals === 0 && totalCheckIns === 0 && recentNotes === 0)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 shadow-sm">
        <Target className="h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          No data yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Create goals and schedule check-ins to see status here.
        </p>
      </div>
    );
  }

  // ---- Derived metrics ----
  const activeGoals = countByStatus(data.goalsByStatus, "active");
  const completedCheckIns = countByStatus(data.checkInStats, "completed");
  const completionRate =
    totalCheckIns > 0
      ? Math.round((completedCheckIns / totalCheckIns) * 100)
      : 0;
  const overdueCount = data.overdueCheckIns.length;

  // ---- Render ----
  return (
    <div className="space-y-6">
      {/* ---- Summary stat cards ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Goals */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            Total Goals
          </div>
          <p className="mt-1 text-2xl font-bold text-deep-blue">
            {totalGoals}
          </p>
        </div>

        {/* Active Goals */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4 text-green-600" />
            Active Goals
          </div>
          <p className="mt-1 text-2xl font-bold text-deep-blue">
            {activeGoals}
          </p>
        </div>

        {/* Check-In Completion Rate */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            Check-In Completion
          </div>
          <p className="mt-1 text-2xl font-bold text-deep-blue">
            {completionRate}%
          </p>
        </div>

        {/* Overdue Check-Ins */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-red-500" />
            Overdue Check-Ins
          </div>
          <p className="mt-1 text-2xl font-bold text-deep-blue">
            {overdueCount}
          </p>
        </div>

        {/* Notes (Last 30 Days) */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-amber-600" />
            Notes (Last 30 Days)
          </div>
          <p className="mt-1 text-2xl font-bold text-deep-blue">
            {recentNotes}
          </p>
        </div>
      </div>

      {/* ---- Overdue Check-Ins section ---- */}
      {data.overdueCheckIns.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-deep-blue">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Overdue Check-Ins
          </h3>
          <div className="space-y-2">
            {data.overdueCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="rounded-lg border-l-4 border-l-red-400 bg-red-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {checkIn.employee
                        ? `${checkIn.employee.firstName} ${checkIn.employee.lastName}`
                        : "Unknown employee"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {checkIn.goal?.statement ?? "No goal linked"}
                    </p>
                    {checkIn.employee?.managerName && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Manager: {checkIn.employee.managerName}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    {daysOverdue(checkIn.scheduledDate)}d overdue
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Goals Without Check-Ins section ---- */}
      {data.goalsWithoutCheckIns.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-deep-blue">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Goals Missing Check-Ins
          </h3>
          <div className="space-y-2">
            {data.goalsWithoutCheckIns.map((goal) => (
              <div
                key={goal._id}
                className="rounded-lg border-l-4 border-l-amber-400 bg-amber-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
                    {goal.statement}
                  </p>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(goal.status)}`}
                  >
                    {formatStatus(goal.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Goal Status Distribution ---- */}
      {data.goalsByStatus.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-sm font-semibold text-deep-blue">
            Goal Status Distribution
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.goalsByStatus.map((item) => (
              <span
                key={item.status}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(item.status)}`}
              >
                {formatStatus(item.status)}
                <span className="font-bold">{item.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
