/**
 * Check-in Constants
 * Shared between client and server — no mongoose dependency.
 */

export const CHECKIN_STATUSES = [
  "preparing",
  "ready",
  "in_progress",
  "reflecting",
  "completed",
  "missed",
  "cancelled",
] as const;

export type CheckInStatus = (typeof CHECKIN_STATUSES)[number];

export const CHECKIN_STATUS_LABELS: Record<CheckInStatus, string> = {
  preparing: "Preparing",
  ready: "Ready",
  in_progress: "In Progress",
  reflecting: "Reflecting",
  completed: "Completed",
  missed: "Missed",
  cancelled: "Cancelled",
};

export const CADENCE_SOURCES = ["auto", "manual"] as const;

export type CadenceSource = (typeof CADENCE_SOURCES)[number];

export const CADENCE_SOURCE_LABELS: Record<CadenceSource, string> = {
  auto: "Auto-scheduled",
  manual: "Manual",
};

/**
 * Populated reference to an Employee or Goal (from .populate() calls).
 * Optional fields cover both employee populations and goal populations.
 */
export interface PopulatedRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  objectiveStatement?: string;
  status?: string;
  category?: string;
}

export interface EmployeePrepareView {
  progressReflection: string | null;
  stuckPointReflection: string | null;
  conversationIntent: string | null;
  completedAt: string | null;
  /** Only populated for manager view. */
  distilledPreview: string | null;
}

export interface ManagerPrepareView {
  contextBriefingViewed: boolean;
  gapRecoveryViewed: boolean;
  openingMove: string | null;
  recognitionNote: string | null;
  developmentalFocus: string | null;
  completedAt: string | null;
}

export interface ParticipateView {
  employeeOpening: string | null;
  employeeKeyTakeaways: string | null;
  stuckPointDiscussion: string | null;
  recognition: string | null;
  development: string | null;
  performance: string | null;
  employeeCommitment: string | null;
  managerCommitment: string | null;
  employeeApprovedManagerCommitment: boolean | null;
  managerApprovedEmployeeCommitment: boolean | null;
  completedAt: string | null;
}

export interface EmployeeReflectView {
  heard: number | null;
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
  completedAt: string | null;
}

export interface ManagerReflectView {
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
  forwardAction: string | null;
  completedAt: string | null;
}

export interface GapSignalsView {
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
  generatedAt: string | null;
}

/**
 * Client-safe shape of a check-in as returned by GET /api/grow/check-ins/[id]
 * after `filterCheckInForRole()` applies role-based redaction. Fields that
 * the current role isn't authorized to see are omitted server-side.
 */
export interface CheckInDetailView {
  _id: string;
  id?: string;
  employee: PopulatedRef;
  manager: PopulatedRef;
  goals: PopulatedRef[];
  scheduledAt: string;
  cadenceSource: string;
  status: CheckInStatus;
  employeePrepare: EmployeePrepareView;
  managerPrepare: ManagerPrepareView;
  participate: ParticipateView;
  employeeReflect: EmployeeReflectView;
  managerReflect: ManagerReflectView;
  gapSignals: GapSignalsView;
  completedAt: string | null;
  previousCheckInId: string | null;
  createdAt: string;
  updatedAt: string;
}
