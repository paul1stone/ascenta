import type { CheckInStatus } from "@ascenta/db/checkin-schema";

const VALID_TRANSITIONS: Record<string, CheckInStatus[]> = {
  preparing: ["ready", "cancelled"],
  ready: ["in_progress", "missed"],
  in_progress: ["reflecting", "missed"],
  reflecting: ["completed"],
  completed: [],
  missed: [],
  cancelled: [],
};

export function canTransition(
  from: CheckInStatus,
  to: CheckInStatus,
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

type CheckInForTransition = {
  status: CheckInStatus;
  scheduledAt: Date;
  employeePrepare: { completedAt: Date | null };
  managerPrepare: { completedAt: Date | null };
  participate: { completedAt: Date | null };
};

export function getNextStatus(
  checkIn: CheckInForTransition,
): CheckInStatus | null {
  const now = new Date();

  if (checkIn.status === "preparing") {
    const bothPrepared =
      checkIn.employeePrepare.completedAt && checkIn.managerPrepare.completedAt;
    const timeReached = checkIn.scheduledAt <= now;
    if (bothPrepared || timeReached) return "ready";
  }

  if (checkIn.status === "in_progress") {
    if (checkIn.participate.completedAt) return "reflecting";
  }

  return null;
}

export function getStaleTransitions(
  checkIn: CheckInForTransition & {
    employeeReflect: { completedAt: Date | null };
    managerReflect: { completedAt: Date | null };
  },
): CheckInStatus | null {
  const now = new Date();
  const scheduledMs = checkIn.scheduledAt.getTime();

  if (checkIn.status === "ready") {
    const missedThreshold = scheduledMs + 24 * 60 * 60 * 1000;
    if (now.getTime() > missedThreshold) return "missed";
  }

  if (checkIn.status === "in_progress") {
    const missedThreshold = scheduledMs + 48 * 60 * 60 * 1000;
    if (now.getTime() > missedThreshold) return "missed";
  }

  if (checkIn.status === "reflecting") {
    const participateCompleted = checkIn.participate.completedAt;
    if (participateCompleted) {
      const reflectDeadline =
        participateCompleted.getTime() + 24 * 60 * 60 * 1000;
      const bothReflected =
        checkIn.employeeReflect.completedAt &&
        checkIn.managerReflect.completedAt;
      if (bothReflected || now.getTime() > reflectDeadline) return "completed";
    }
  }

  return null;
}
