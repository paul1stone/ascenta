"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { Skeleton } from "@ascenta/ui/skeleton";

interface CheckInGoal {
  id?: string;
  statement: string;
}

interface CheckInEmployee {
  id?: string;
  firstName: string;
  lastName: string;
}

interface CheckIn {
  id: string;
  goal: CheckInGoal | string;
  employee: CheckInEmployee | string;
  scheduledDate: string;
  completedDate: string | null;
  status: "scheduled" | "completed" | "missed" | "cancelled";
  progress: string | null;
  rating: "on_track" | "at_risk" | "off_track" | null;
  cadence: string;
}

interface CheckInListProps {
  onBack?: () => void;
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Missed", value: "missed" },
  { label: "Cancelled", value: "cancelled" },
];

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "missed":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getRatingBadgeClasses(rating: string): string {
  switch (rating) {
    case "on_track":
      return "bg-green-100 text-green-700";
    case "at_risk":
      return "bg-amber-100 text-amber-700";
    case "off_track":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatRating(rating: string): string {
  return rating
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGoalStatement(goal: CheckInGoal | string): string {
  if (typeof goal === "string") return "Unknown";
  return goal.statement;
}

function getEmployeeName(employee: CheckInEmployee | string): string {
  if (typeof employee === "string") return "Unknown";
  return `${employee.firstName} ${employee.lastName}`;
}

function formatCadence(cadence: string): string {
  return cadence.charAt(0).toUpperCase() + cadence.slice(1);
}

export function CheckInList({ onBack }: CheckInListProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCheckIns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/check-ins?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCheckIns(data);
      }
    } catch (error) {
      console.error("Failed to fetch check-ins:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          <h2 className="font-display text-lg font-semibold text-deep-blue">
            Check-ins
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
      ) : checkIns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 shadow-sm">
          <CheckCircle className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            No check-ins yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Schedule your first check-in to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="rounded-xl border bg-white p-5 shadow-sm transition-colors hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">
                  {getGoalStatement(checkIn.goal)}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(checkIn.status)}`}
                >
                  {formatStatus(checkIn.status)}
                </span>
              </div>

              <p className="mt-1.5 text-sm text-muted-foreground">
                {getEmployeeName(checkIn.employee)}
              </p>

              {checkIn.progress && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {checkIn.progress}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(checkIn.scheduledDate)}
                </span>
                <span className="rounded bg-slate-50 px-1.5 py-0.5 text-slate-600">
                  {formatCadence(checkIn.cadence)}
                </span>
                {checkIn.rating && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingBadgeClasses(checkIn.rating)}`}
                  >
                    {formatRating(checkIn.rating)}
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
