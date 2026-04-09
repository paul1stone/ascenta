"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ascenta/ui/card";
import { Badge } from "@ascenta/ui/badge";
import { Skeleton } from "@ascenta/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ascenta/ui/table";
import { cn } from "@ascenta/ui";
import { Users, Target, AlertTriangle, Clock, BarChart2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types — mirrors expected API response from /api/grow/status
// ---------------------------------------------------------------------------

interface GoalsByStatus {
  active: number;
  needs_attention: number;
  blocked: number;
  draft: number;
  pending_confirmation: number;
}

interface GoalTypeBalance {
  performance: number;
  development: number;
}

interface DirectReportRow {
  employeeId: string;
  name: string;
  department: string;
  jobTitle: string;
  goalCount: number;
  goalsByStatus: GoalsByStatus;
  overallStatus: string;
  goalTypeBalance: GoalTypeBalance;
  hasDevelopmentGoal: boolean;
  pendingConfirmation: number;
  checkInCompletion7d: number;
  checkInCompletion30d: number;
  overdueCheckIns: number;
}

interface StatusAggregates {
  directReportsCount: number;
  activeGoalsCount: number;
  checkInCompletion7d: number;
  overdueCheckIns: number;
  pendingConfirmationCount: number;
  blockedCount: number;
  goalTypeBalance: GoalTypeBalance;
}

interface StatusResponse {
  aggregates: StatusAggregates;
  directReports: DirectReportRow[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  needs_attention: "bg-amber-500",
  blocked: "bg-rose-500",
  draft: "bg-slate-400",
  pending_confirmation: "bg-sky-400",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusDot({ status, count }: { status: string; count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1" title={`${status.replace(/_/g, " ")}: ${count}`}>
      <span className={cn("inline-block size-2 rounded-full", STATUS_COLORS[status])} />
      <span className="text-xs text-muted-foreground">{count}</span>
    </span>
  );
}

function GoalStatusDots({ goalsByStatus }: { goalsByStatus: GoalsByStatus }) {
  const entries: [string, number][] = [
    ["active", goalsByStatus.active],
    ["needs_attention", goalsByStatus.needs_attention],
    ["blocked", goalsByStatus.blocked],
    ["pending_confirmation", goalsByStatus.pending_confirmation],
  ];
  const hasAny = entries.some(([, count]) => count > 0);

  if (!hasAny) {
    return <span className="text-xs text-muted-foreground">No goals</span>;
  }

  return (
    <span className="inline-flex items-center gap-2">
      {entries.map(([key, count]) => (
        <StatusDot key={key} status={key} count={count} />
      ))}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  highlight,
  sub,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: "red" | "green" | "amber";
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            highlight === "red" && "text-rose-600",
            highlight === "green" && "text-emerald-600",
            highlight === "amber" && "text-amber-600",
          )}
        >
          {value}
        </div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
      <Users className="mb-3 size-10 text-muted-foreground/50" />
      <h3 className="text-sm font-medium text-foreground">No direct reports found</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Performance status data will appear here once employees are assigned.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 py-12">
      <AlertTriangle className="mb-3 size-8 text-destructive" />
      <h3 className="text-sm font-medium text-foreground">Failed to load status</h3>
      <p className="mt-1 max-w-sm text-center text-xs text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface StatusDashboardProps {
  managerId?: string;
}

export function StatusDashboard({ managerId }: StatusDashboardProps) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = managerId ? `?managerId=${encodeURIComponent(managerId)}` : "";
      const res = await fetch(`/api/grow/status${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error || `Request failed (${res.status})`,
        );
      }
      const json = (await res.json()) as StatusResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchStatus} />;
  if (!data || data.directReports.length === 0) return <EmptyState />;

  const { aggregates, directReports } = data;
  const { goalTypeBalance } = aggregates;

  return (
    <div className="space-y-6">
      {/* Aggregate stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Goals"
          value={aggregates.activeGoalsCount}
          icon={Target}
        />
        <StatCard
          title="Pending Confirmation"
          value={aggregates.pendingConfirmationCount}
          icon={Clock}
          highlight={aggregates.pendingConfirmationCount > 0 ? "amber" : undefined}
        />
        <StatCard
          title="Goal Type Balance"
          value={`${goalTypeBalance.performance}P / ${goalTypeBalance.development}D`}
          icon={BarChart2}
          sub="Performance / Development"
        />
        <StatCard
          title="Blocked Goals"
          value={aggregates.blockedCount}
          icon={AlertTriangle}
          highlight={aggregates.blockedCount > 0 ? "red" : undefined}
        />
      </div>

      {/* Direct reports table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead className="text-center">Pending</TableHead>
              <TableHead className="text-center">Dev Goal</TableHead>
              <TableHead className="text-center">Overdue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directReports.map((report) => (
              <TableRow key={report.employeeId}>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {report.department}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {report.jobTitle}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{report.goalCount}</span>
                    <GoalStatusDots goalsByStatus={report.goalsByStatus} />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {report.pendingConfirmation > 0 ? (
                    <Badge
                      variant="secondary"
                      className="bg-sky-100 text-sky-700 text-xs"
                    >
                      {report.pendingConfirmation}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {report.hasDevelopmentGoal ? (
                    <span className="text-sm text-emerald-600">Yes</span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-xs text-amber-600"
                      title="No development goal set"
                    >
                      <AlertTriangle className="size-3" />
                      None
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {report.overdueCheckIns > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      {report.overdueCheckIns}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">0</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
