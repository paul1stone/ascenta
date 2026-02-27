"use client";

import { useEffect, useState } from "react";
import {
  Target,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Skeleton } from "@ascenta/ui/skeleton";

// ============================================================================
// TYPES
// ============================================================================

interface GoalOwner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
}

interface GoalItem {
  id: string;
  statement: string;
  measure: string;
  type: string;
  owner: GoalOwner | string;
  status: string;
  createdAt: string;
}

interface CheckInGoal {
  _id?: string;
  id?: string;
  statement: string;
  measure?: string;
  status?: string;
}

interface CheckInEmployee {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  managerName?: string;
}

interface CheckInItem {
  id: string;
  goal: CheckInGoal | string;
  employee: CheckInEmployee | string;
  scheduledDate: string;
  completedDate: string | null;
  status: string;
  createdAt: string;
}

interface StatusGoalEntry {
  status: string;
  count: number;
}

interface StatusCheckInEntry {
  status: string;
  count: number;
}

interface StatusResponse {
  goalsByStatus: StatusGoalEntry[];
  checkInStats: StatusCheckInEntry[];
  overdueCheckIns: CheckInItem[];
  goalsWithoutCheckIns: { _id: string; statement: string; status: string }[];
  recentNotesCount: number;
}

interface ActivityEntry {
  id: string;
  type: "goal_created" | "checkin_completed";
  description: string;
  timestamp: string;
}

interface DashboardData {
  activeGoals: number;
  checkInsThisMonth: number;
  notesLogged: number;
  overdueCount: number;
  recentActivity: ActivityEntry[];
  overdueItems: CheckInItem[];
}

// ============================================================================
// HELPERS
// ============================================================================

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 0) return "just now";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

function getDaysOverdue(scheduledDate: string): number {
  const now = new Date();
  const scheduled = new Date(scheduledDate);
  const diffMs = now.getTime() - scheduled.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getGoalStatement(goal: CheckInGoal | string): string {
  if (typeof goal === "string") return "Unknown goal";
  return goal.statement;
}

function getEmployeeName(employee: CheckInEmployee | string): string {
  if (typeof employee === "string") return "Unknown";
  return `${employee.firstName} ${employee.lastName}`;
}

// ============================================================================
// SKELETON LOADERS
// ============================================================================

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttentionSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GrowDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [goalsRes, checkInsRes, overdueRes, statusRes] =
          await Promise.all([
            fetch("/api/goals?status=active"),
            fetch("/api/check-ins?status=completed"),
            fetch("/api/check-ins/overdue"),
            fetch("/api/grow/status"),
          ]);

        const [goals, completedCheckIns, overdueItems, status] =
          await Promise.all([
            goalsRes.ok ? (goalsRes.json() as Promise<GoalItem[]>) : Promise.resolve([]),
            checkInsRes.ok ? (checkInsRes.json() as Promise<CheckInItem[]>) : Promise.resolve([]),
            overdueRes.ok ? (overdueRes.json() as Promise<CheckInItem[]>) : Promise.resolve([]),
            statusRes.ok ? (statusRes.json() as Promise<StatusResponse>) : Promise.resolve(null),
          ]);

        // --- Stat cards ---
        const activeGoals =
          status?.goalsByStatus?.find((g) => g.status === "active")?.count ?? 0;

        // Check-ins this month: filter completed check-ins by scheduledDate in current month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const checkInsThisMonth = completedCheckIns.filter((c) => {
          const scheduled = new Date(c.scheduledDate);
          return scheduled >= monthStart && scheduled <= monthEnd;
        }).length;

        const notesLogged = status?.recentNotesCount ?? 0;
        const overdueCount = overdueItems.length;

        // --- Recent activity ---
        const goalActivities: ActivityEntry[] = (goals as GoalItem[])
          .slice(0, 5)
          .map((g) => ({
            id: g.id,
            type: "goal_created" as const,
            description: `New goal: ${g.statement}`,
            timestamp: g.createdAt,
          }));

        const checkInActivities: ActivityEntry[] = (completedCheckIns as CheckInItem[])
          .slice(0, 5)
          .map((c) => ({
            id: c.id,
            type: "checkin_completed" as const,
            description: `Check-in completed for ${getGoalStatement(c.goal)}`,
            timestamp: c.completedDate ?? c.createdAt,
          }));

        const recentActivity = [...goalActivities, ...checkInActivities]
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, 8);

        setData({
          activeGoals,
          checkInsThisMonth,
          notesLogged,
          overdueCount,
          recentActivity,
          overdueItems: overdueItems.slice(0, 5),
        });
      } catch (error) {
        console.error("Failed to load Grow dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActivitySkeleton />
          <AttentionSkeleton />
        </div>
      </div>
    );
  }

  const {
    activeGoals = 0,
    checkInsThisMonth = 0,
    notesLogged = 0,
    overdueCount = 0,
    recentActivity = [],
    overdueItems = [],
  } = data ?? {};

  // --- Stat card definitions ---
  const statCards = [
    {
      label: "Active Goals",
      value: activeGoals,
      icon: Target,
      iconColor: "text-summit bg-summit/10",
    },
    {
      label: "Check-Ins This Month",
      value: checkInsThisMonth,
      icon: Calendar,
      iconColor: "text-blue-500 bg-blue-50",
    },
    {
      label: "Notes Logged",
      value: notesLogged,
      icon: FileText,
      iconColor: "text-indigo-500 bg-indigo-50",
    },
    {
      label: "Overdue Items",
      value: overdueCount,
      icon: AlertTriangle,
      iconColor: "text-amber-500 bg-amber-50",
      valueColor: overdueCount > 0 ? "text-red-500" : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* SUMMARY STAT CARDS                                                 */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconColor}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p
                    className={`text-2xl font-bold ${card.valueColor ?? "text-deep-blue"}`}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/* TWO-COLUMN LAYOUT                                                  */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* -------------------------------------------------------------- */}
        {/* RECENT ACTIVITY                                                 */}
        {/* -------------------------------------------------------------- */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-deep-blue">Recent Activity</h3>

          {recentActivity.length > 0 ? (
            <div className="mt-4 space-y-1">
              {recentActivity.map((item, index) => {
                const Icon =
                  item.type === "goal_created" ? Target : CheckCircle;
                const iconColor =
                  item.type === "goal_created"
                    ? "text-summit bg-summit/10"
                    : "text-emerald-500 bg-emerald-50";

                return (
                  <div key={item.id ?? index}>
                    <div className="flex items-start gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-slate-50/80">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconColor}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-deep-blue">
                          {item.description}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(item.timestamp)}
                        </p>
                      </div>
                    </div>
                    {index < recentActivity.length - 1 && (
                      <div className="ml-[18px] h-2 w-px bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No recent activity
            </p>
          )}
        </div>

        {/* -------------------------------------------------------------- */}
        {/* ATTENTION QUEUE                                                 */}
        {/* -------------------------------------------------------------- */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-deep-blue">Needs Attention</h3>

          {overdueItems.length > 0 ? (
            <div className="mt-4 space-y-2">
              {overdueItems.map((item) => {
                const days = getDaysOverdue(item.scheduledDate);
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border-l-4 border-l-red-400 py-2.5 pl-3 pr-1 transition-colors hover:bg-red-50/40"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-deep-blue">
                        Overdue: {getEmployeeName(item.employee)} &mdash;{" "}
                        {getGoalStatement(item.goal)}
                      </p>
                      <p className="mt-0.5 text-xs text-red-500">
                        {days} {days === 1 ? "day" : "days"} overdue
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center py-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-3 text-sm font-medium text-emerald-700">
                All caught up!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
