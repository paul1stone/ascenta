export type ReflectStatus =
  | "scheduled"
  | "preparing"
  | "ready"
  | "completed"
  | "overdue";

export type ReflectTrigger =
  | "check_in_gap"
  | "manual_request"
  | "lifecycle_milestone"
  | "quarterly_minimum";

export type ReflectSession = {
  id: string;
  partner: { name: string; role: string; avatarColor: string };
  scheduledAt: string;
  status: ReflectStatus;
  trigger: ReflectTrigger;
  triggerDetail: string;
  myPrepCompleted: boolean;
  partnerPrepCompleted: boolean;
};

export const TRIGGER_LABELS: Record<ReflectTrigger, string> = {
  check_in_gap: "Persistent Check-in Gap",
  manual_request: "Manual Request",
  lifecycle_milestone: "Lifecycle Milestone",
  quarterly_minimum: "Quarterly Minimum",
};

export const STATUS_LABELS: Record<ReflectStatus, string> = {
  scheduled: "Scheduled",
  preparing: "Preparing",
  ready: "Ready to Begin",
  completed: "Completed",
  overdue: "Overdue",
};

export const STATUS_COLORS: Record<ReflectStatus, string> = {
  scheduled: "#6688bb",
  preparing: "#e8a735",
  ready: "#44aa99",
  completed: "#94a3b8",
  overdue: "#cc6677",
};

export const MOCK_NEXT_SESSION: ReflectSession = {
  id: "reflect-001",
  partner: { name: "Katie Smith", role: "Manager", avatarColor: "#6688bb" },
  scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  status: "preparing",
  trigger: "check_in_gap",
  triggerDetail:
    "Recognition gap signal detected across last 2 check-in cycles",
  myPrepCompleted: false,
  partnerPrepCompleted: true,
};

export const MOCK_HISTORY: ReflectSession[] = [
  {
    id: "reflect-h-1",
    partner: { name: "Katie Smith", role: "Manager", avatarColor: "#6688bb" },
    scheduledAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    trigger: "quarterly_minimum",
    triggerDetail: "Q1 quarterly relationship check-in",
    myPrepCompleted: true,
    partnerPrepCompleted: true,
  },
  {
    id: "reflect-h-2",
    partner: { name: "Katie Smith", role: "Manager", avatarColor: "#6688bb" },
    scheduledAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    trigger: "lifecycle_milestone",
    triggerDetail: "90 days into new role",
    myPrepCompleted: true,
    partnerPrepCompleted: true,
  },
];

export type ConversationDimension = {
  key: "relationship" | "support" | "request" | "alignment";
  label: string;
  myWord: string;
  partnerWord: string;
  alignment: "aligned" | "partial" | "diverged";
};

export const MOCK_CONVERSATION_MAP: ConversationDimension[] = [
  {
    key: "relationship",
    label: "Relationship Quality",
    myWord: "Trusting and direct",
    partnerWord: "Reliable, room to deepen",
    alignment: "partial",
  },
  {
    key: "support",
    label: "Support Effectiveness",
    myWord: "Strong on access, light on coaching",
    partnerWord: "Strong access; needs more coaching cadence",
    alignment: "aligned",
  },
  {
    key: "request",
    label: "Mutual Requests",
    myWord: "More direct feedback in the moment",
    partnerWord: "Earlier flags on blockers",
    alignment: "partial",
  },
  {
    key: "alignment",
    label: "Working Alignment",
    myWord: "Mostly clear on priorities",
    partnerWord: "Clear on priorities",
    alignment: "aligned",
  },
];

export const HR_AGGREGATE_SIGNALS = [
  {
    label: "Active Reflect Cycles",
    value: 23,
    delta: "+4 vs last 30 days",
    color: "#44aa99",
  },
  {
    label: "Completion Rate",
    value: "87%",
    delta: "+3 pts vs last quarter",
    color: "#6688bb",
  },
  {
    label: "Recurring Safety Signals",
    value: 2,
    delta: "Stable",
    color: "#cc6677",
  },
  {
    label: "Avg. Days to Completion",
    value: "5.2",
    delta: "-1.1 vs last quarter",
    color: "#aa8866",
  },
];

export const HR_LIBRARY_SURFACING = [
  {
    title: "Receiving Upward Feedback Without Defensiveness",
    surfacedTo: 12,
    triggeringPattern: "Recognition gap repeated 2+ cycles",
  },
  {
    title: "SBI Framework for Behavioral Feedback",
    surfacedTo: 8,
    triggeringPattern: "Development gap on direct reports",
  },
  {
    title: "Naming Specific Strengths",
    surfacedTo: 17,
    triggeringPattern: "Recognition gap (organization-wide trend)",
  },
];
