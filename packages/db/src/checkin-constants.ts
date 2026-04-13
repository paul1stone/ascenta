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
