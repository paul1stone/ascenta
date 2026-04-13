"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageCircle,
  Loader2,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@ascenta/ui";
import { Button } from "@ascenta/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ascenta/ui/dialog";
import {
  CHECKIN_STATUS_LABELS,
  type CheckInStatus,
} from "@ascenta/db/checkin-constants";
import { useAuth } from "@/lib/auth/auth-context";
import {
  EmployeeCombobox,
  type EmployeeOption,
} from "@/components/grow/employee-combobox";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PopulatedRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  objectiveStatement?: string;
  status?: string;
}

interface CheckInData {
  _id: string;
  id?: string;
  employee: PopulatedRef;
  manager: PopulatedRef;
  goals: PopulatedRef[];
  scheduledAt: string;
  cadenceSource: string;
  status: CheckInStatus;
  gapSignals?: {
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
    generatedAt: string | null;
  };
  completedAt: string | null;
  createdAt: string;
}

interface CheckinsPanelProps {
  accentColor: string;
}

// ---------------------------------------------------------------------------
// Status dot colors
// ---------------------------------------------------------------------------

const STATUS_DOT_COLORS: Record<CheckInStatus, string> = {
  preparing: "#44aa99",
  ready: "#6688bb",
  in_progress: "#6688bb",
  reflecting: "#cc6677",
  completed: "#555",
  missed: "#e8a735",
  cancelled: "#888",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays}d`;
  return formatDate(dateStr);
}

function getPersonName(ref: PopulatedRef): string {
  if (ref.firstName && ref.lastName) return `${ref.firstName} ${ref.lastName}`;
  return ref.employeeId ?? "Unknown";
}

function getGoalsSummary(goals: PopulatedRef[]): string {
  if (goals.length === 0) return "No linked goals";
  if (goals.length === 1)
    return goals[0].objectiveStatement ?? "1 goal";
  return `${goals.length} goals`;
}

function hasGapSignal(gapSignals?: CheckInData["gapSignals"]): boolean {
  if (!gapSignals || !gapSignals.generatedAt) return false;
  const dims = [
    gapSignals.clarity,
    gapSignals.recognition,
    gapSignals.development,
    gapSignals.safety,
  ];
  return dims.some((d) => d !== null && d >= 2);
}

// ---------------------------------------------------------------------------
// Schedule Dialog
// ---------------------------------------------------------------------------

interface GoalOption {
  id: string;
  objectiveStatement: string;
}

function ScheduleDialog({
  accentColor,
  onScheduled,
}: {
  accentColor: string;
  onScheduled: () => void;
}) {
  const { user } = useAuth();
  const canSelectEmployee = user?.role === "hr" || user?.role === "manager";

  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const employeeId = selectedEmployee?.id ?? null;

  // Fetch goals when employee changes
  useEffect(() => {
    if (!employeeId) {
      setGoals([]);
      setSelectedGoalIds([]);
      return;
    }

    let cancelled = false;
    const fetchGoals = async () => {
      setLoadingGoals(true);
      try {
        const res = await fetch(`/api/grow/goals?employeeId=${employeeId}`);
        const data = await res.json();
        if (!cancelled && data.goals) {
          const active = data.goals.filter(
            (g: { status: string }) =>
              g.status === "active" || g.status === "needs_attention",
          );
          setGoals(
            active.map((g: { id: string; objectiveStatement: string }) => ({
              id: g.id,
              objectiveStatement: g.objectiveStatement,
            })),
          );
          setSelectedGoalIds(active.map((g: { id: string }) => g.id));
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingGoals(false);
      }
    };
    fetchGoals();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const toggleGoal = (id: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!user || !employeeId || selectedGoalIds.length === 0 || !scheduledAt) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/grow/check-ins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": user.id,
        },
        body: JSON.stringify({
          employeeId,
          goalIds: selectedGoalIds,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOpen(false);
        setSelectedEmployee(null);
        setGoals([]);
        setSelectedGoalIds([]);
        setScheduledAt("");
        onScheduled();
      } else {
        setError(data.error ?? "Failed to schedule check-in");
      }
    } catch {
      setError("Failed to schedule check-in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="size-3.5" />
          Schedule Check-in
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display">Schedule Check-in</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Employee picker */}
          {canSelectEmployee && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Employee
              </label>
              <EmployeeCombobox
                value={selectedEmployee?.id ?? null}
                onChange={setSelectedEmployee}
                department={
                  user?.role === "manager" ? user?.department : undefined
                }
                selfLabel="Select employee..."
                className="w-full justify-between"
              />
            </div>
          )}

          {/* Goals selector */}
          {employeeId && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Goals
              </label>
              {loadingGoals ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="size-3 animate-spin" />
                  Loading goals...
                </div>
              ) : goals.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No active goals found for this employee.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {goals.map((goal) => (
                    <label
                      key={goal.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors",
                        selectedGoalIds.includes(goal.id)
                          ? "border-[#44aa99] bg-[#44aa99]/5"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGoalIds.includes(goal.id)}
                        onChange={() => toggleGoal(goal.id)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "size-4 rounded border flex items-center justify-center shrink-0",
                          selectedGoalIds.includes(goal.id)
                            ? "bg-[#44aa99] border-[#44aa99]"
                            : "border-border",
                        )}
                      >
                        {selectedGoalIds.includes(goal.id) && (
                          <CheckCircle className="size-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm truncate">
                        {goal.objectiveStatement}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date picker */}
          {employeeId && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Scheduled Date
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !employeeId ||
              selectedGoalIds.length === 0 ||
              !scheduledAt
            }
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Calendar className="size-4 mr-2" />
            )}
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export function CheckinsPanel({ accentColor }: CheckinsPanelProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [apiRole, setApiRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckIns = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/grow/check-ins", {
        headers: { "x-dev-user-id": user.id },
      });
      const data = await res.json();
      if (data.checkIns) {
        setCheckIns(data.checkIns);
        setApiRole(data.role ?? null);
      } else {
        setError(data.error ?? "Failed to fetch check-ins");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load check-ins",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  if (!user || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <MessageCircle className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Unable to Load Check-ins
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const isManager = apiRole === "manager";

  if (isManager) {
    return (
      <ManagerView
        checkIns={checkIns}
        accentColor={accentColor}
        onRefresh={fetchCheckIns}
        router={router}
      />
    );
  }

  return (
    <EmployeeView
      checkIns={checkIns}
      accentColor={accentColor}
      router={router}
    />
  );
}

// ---------------------------------------------------------------------------
// Manager View
// ---------------------------------------------------------------------------

function ManagerView({
  checkIns,
  accentColor,
  onRefresh,
  router,
}: {
  checkIns: CheckInData[];
  accentColor: string;
  onRefresh: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const now = new Date();

  // Stats
  const upcoming = checkIns.filter(
    (ci) =>
      ["preparing", "ready"].includes(ci.status) &&
      new Date(ci.scheduledAt) >= now,
  );

  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentCompleted = checkIns.filter(
    (ci) =>
      ci.status === "completed" &&
      ci.completedAt &&
      new Date(ci.completedAt) >= last30Days,
  );
  const recentScheduled = checkIns.filter(
    (ci) =>
      new Date(ci.scheduledAt) >= last30Days &&
      new Date(ci.scheduledAt) <= now,
  );
  const completionRate =
    recentScheduled.length > 0
      ? Math.round((recentCompleted.length / recentScheduled.length) * 100)
      : 0;

  const withGaps = checkIns.filter(
    (ci) => ci.status === "completed" && hasGapSignal(ci.gapSignals),
  );

  const overdue = checkIns.filter(
    (ci) =>
      ["preparing", "ready"].includes(ci.status) &&
      new Date(ci.scheduledAt) < now,
  );

  const active = checkIns.filter((ci) =>
    ["preparing", "ready", "in_progress", "reflecting"].includes(ci.status),
  );

  const completed = checkIns.filter((ci) => ci.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Calendar}
            label="Upcoming"
            value={upcoming.length}
            accentColor={accentColor}
          />
          <StatCard
            icon={CheckCircle}
            label="30-day Completion"
            value={`${completionRate}%`}
            accentColor={accentColor}
          />
          <StatCard
            icon={AlertTriangle}
            label="Active Gaps"
            value={withGaps.length}
            accentColor="#cc6677"
          />
          <StatCard
            icon={Clock}
            label="Overdue"
            value={overdue.length}
            accentColor="#e8a735"
          />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-deep-blue">
            Check-ins
          </h2>
          <ScheduleDialog
            accentColor={accentColor}
            onScheduled={onRefresh}
          />
        </div>

        {checkIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Check-ins Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Schedule a check-in with a direct report to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active / Upcoming */}
            {active.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Active & Upcoming
                </p>
                <div className="space-y-1.5">
                  {active.map((ci) => (
                    <CheckInRow
                      key={ci._id}
                      checkIn={ci}
                      showEmployee
                      onClick={() =>
                        router.push(`/grow/check-ins/${ci._id}`)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recently completed */}
            {completed.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Completed
                </p>
                <div className="space-y-1.5">
                  {completed.slice(0, 10).map((ci) => (
                    <CheckInRow
                      key={ci._id}
                      checkIn={ci}
                      showEmployee
                      showGapIndicator
                      onClick={() =>
                        router.push(`/grow/check-ins/${ci._id}`)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Employee View
// ---------------------------------------------------------------------------

function EmployeeView({
  checkIns,
  accentColor,
  router,
}: {
  checkIns: CheckInData[];
  accentColor: string;
  router: ReturnType<typeof useRouter>;
}) {
  const now = new Date();

  const nextCheckIn = checkIns.find(
    (ci) =>
      ["preparing", "ready"].includes(ci.status) &&
      new Date(ci.scheduledAt) >= now,
  );

  const history = checkIns.filter(
    (ci) => ci.status === "completed" || ci.status === "cancelled" || ci.status === "missed",
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-lg font-bold text-deep-blue mb-4">
          My Check-ins
        </h2>

        {/* Next check-in card */}
        {nextCheckIn ? (
          <div
            className="rounded-xl border p-5 mb-6"
            style={{
              borderColor: `${accentColor}4d`,
              background: `${accentColor}08`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Next Check-in
                </p>
                <p className="font-display text-base font-bold text-deep-blue">
                  {formatDate(nextCheckIn.scheduledAt)}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  with{" "}
                  {getPersonName(nextCheckIn.manager)} —{" "}
                  {getGoalsSummary(nextCheckIn.goals)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={nextCheckIn.status} />
                {nextCheckIn.status === "preparing" && (
                  <Button
                    size="sm"
                    style={{ backgroundColor: accentColor }}
                    onClick={() =>
                      router.push(`/grow/check-ins/${nextCheckIn._id}`)
                    }
                  >
                    Prepare Now
                  </Button>
                )}
                {nextCheckIn.status === "ready" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/grow/check-ins/${nextCheckIn._id}`)
                    }
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-5 mb-6 text-center">
            <MessageCircle className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No upcoming check-ins scheduled.
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              History
            </p>
            <div className="space-y-1.5">
              {history.map((ci) => (
                <CheckInRow
                  key={ci._id}
                  checkIn={ci}
                  showManager
                  onClick={() =>
                    router.push(`/grow/check-ins/${ci._id}`)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  accentColor,
}: {
  icon: typeof Calendar;
  label: string;
  value: string | number;
  accentColor: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4" style={{ color: accentColor }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="font-display text-2xl font-bold text-deep-blue">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: CheckInStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${STATUS_DOT_COLORS[status]}1a`,
        color: STATUS_DOT_COLORS[status],
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: STATUS_DOT_COLORS[status] }}
      />
      {CHECKIN_STATUS_LABELS[status]}
    </span>
  );
}

function CheckInRow({
  checkIn,
  showEmployee,
  showManager,
  showGapIndicator,
  onClick,
}: {
  checkIn: CheckInData;
  showEmployee?: boolean;
  showManager?: boolean;
  showGapIndicator?: boolean;
  onClick: () => void;
}) {
  const personName = showEmployee
    ? getPersonName(checkIn.employee)
    : showManager
      ? getPersonName(checkIn.manager)
      : getPersonName(checkIn.employee);

  const goalText = getGoalsSummary(checkIn.goals);
  const hasGap = showGapIndicator && hasGapSignal(checkIn.gapSignals);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow group"
    >
      {/* Status dot */}
      <span
        className="size-2.5 rounded-full shrink-0"
        style={{ backgroundColor: STATUS_DOT_COLORS[checkIn.status] }}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-deep-blue truncate">
            {personName}
          </span>
          {hasGap && (
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: "#cc6677" }}
              title="Gap signal detected"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {goalText}
        </p>
      </div>

      {/* Cadence */}
      <span className="text-xs text-muted-foreground capitalize shrink-0">
        {checkIn.cadenceSource}
      </span>

      {/* Status label */}
      <StatusBadge status={checkIn.status} />

      {/* Date */}
      <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
        {checkIn.status === "completed" && checkIn.completedAt
          ? formatDate(checkIn.completedAt)
          : formatRelativeDate(checkIn.scheduledAt)}
      </span>

      <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
    </div>
  );
}
