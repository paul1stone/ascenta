import type { UserRole } from "@/lib/auth/auth-context";

/**
 * Shape of a check-in document as it comes out of Mongoose `.lean()` —
 * all phase sub-documents are optional because they may not have been
 * populated yet at the current lifecycle stage. `_id` / `employee` /
 * `manager` / `goals` are typed as `unknown` because they may be either
 * raw ObjectIds or populated sub-documents depending on the caller's
 * `.populate()` chain.
 */
interface CheckInLean {
  _id: unknown;
  employee: unknown;
  manager: unknown;
  goals: unknown;
  scheduledAt: Date | string;
  status: string;
  cadenceSource: string;
  completedAt: Date | string | null;
  previousCheckInId: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  employeePrepare?: {
    progressReflection?: string | null;
    stuckPointReflection?: string | null;
    conversationIntent?: string | null;
    distilledPreview?: string | null;
    completedAt?: Date | string | null;
  };
  managerPrepare?: {
    contextBriefingViewed?: boolean;
    gapRecoveryViewed?: boolean;
    openingMove?: string | null;
    recognitionNote?: string | null;
    developmentalFocus?: string | null;
    completedAt?: Date | string | null;
  };
  participate?: {
    employeeOpening?: string | null;
    employeeKeyTakeaways?: string | null;
    stuckPointDiscussion?: string | null;
    recognition?: string | null;
    development?: string | null;
    performance?: string | null;
    employeeCommitment?: string | null;
    managerCommitment?: string | null;
    employeeApprovedManagerCommitment?: boolean | null;
    managerApprovedEmployeeCommitment?: boolean | null;
    completedAt?: Date | string | null;
  };
  employeeReflect?: {
    heard?: number | null;
    clarity?: number | null;
    recognition?: number | null;
    development?: number | null;
    safety?: number | null;
    completedAt?: Date | string | null;
  };
  managerReflect?: {
    clarity?: number | null;
    recognition?: number | null;
    development?: number | null;
    safety?: number | null;
    forwardAction?: string | null;
    completedAt?: Date | string | null;
  };
  gapSignals?: {
    clarity?: number | null;
    recognition?: number | null;
    development?: number | null;
    safety?: number | null;
    generatedAt?: Date | string | null;
  };
}

// Return type is intentionally `Record<string, any>` rather than a stricter
// discriminated union: the returned shape differs by role, and the primary
// goal of this function is to enforce redaction at the input boundary.
// Consumers (client components, tests) use local interfaces like
// CheckInDetailView in @ascenta/db/checkin-constants to describe the shape
// they consume.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterCheckInForRole(
  checkIn: CheckInLean,
  role: UserRole,
  _userId: string,
): Record<string, any> {
  const base = {
    _id: checkIn._id,
    employee: checkIn.employee,
    manager: checkIn.manager,
    goals: checkIn.goals,
    scheduledAt: checkIn.scheduledAt,
    status: checkIn.status,
    cadenceSource: checkIn.cadenceSource,
    completedAt: checkIn.completedAt,
    previousCheckInId: checkIn.previousCheckInId,
    createdAt: checkIn.createdAt,
    updatedAt: checkIn.updatedAt,
  };

  if (role === "employee") {
    return {
      ...base,
      employeePrepare: {
        progressReflection: checkIn.employeePrepare?.progressReflection,
        stuckPointReflection: checkIn.employeePrepare?.stuckPointReflection,
        conversationIntent: checkIn.employeePrepare?.conversationIntent,
        completedAt: checkIn.employeePrepare?.completedAt,
        // NO distilledPreview — that's for manager only
      },
      participate: checkIn.participate
        ? {
            employeeOpening: checkIn.participate.employeeOpening,
            employeeKeyTakeaways: checkIn.participate.employeeKeyTakeaways,
            stuckPointDiscussion: checkIn.participate.stuckPointDiscussion,
            recognition: checkIn.participate.recognition,
            development: checkIn.participate.development,
            performance: checkIn.participate.performance,
            employeeCommitment: checkIn.participate.employeeCommitment,
            managerCommitment: checkIn.participate.managerCommitment,
            employeeApprovedManagerCommitment:
              checkIn.participate.employeeApprovedManagerCommitment,
            managerApprovedEmployeeCommitment:
              checkIn.participate.managerApprovedEmployeeCommitment,
            completedAt: checkIn.participate.completedAt,
          }
        : undefined,
      employeeReflect: checkIn.employeeReflect?.completedAt
        ? {
            heard: checkIn.employeeReflect.heard,
            clarity: checkIn.employeeReflect.clarity,
            recognition: checkIn.employeeReflect.recognition,
            development: checkIn.employeeReflect.development,
            safety: checkIn.employeeReflect.safety,
            completedAt: checkIn.employeeReflect.completedAt,
          }
        : undefined,
      // NO managerPrepare, NO managerReflect, NO gapSignals
    };
  }

  if (role === "manager") {
    return {
      ...base,
      employeePrepare: {
        distilledPreview: checkIn.employeePrepare?.distilledPreview,
        completedAt: checkIn.employeePrepare?.completedAt,
        // NO raw employee reflections
      },
      managerPrepare: checkIn.managerPrepare
        ? { ...checkIn.managerPrepare }
        : undefined,
      participate: checkIn.participate
        ? { ...checkIn.participate }
        : undefined,
      managerReflect: checkIn.managerReflect?.completedAt
        ? { ...checkIn.managerReflect }
        : undefined,
      gapSignals: checkIn.gapSignals?.generatedAt
        ? { ...checkIn.gapSignals }
        : undefined,
      // NO employeeReflect
    };
  }

  if (role === "hr") {
    return {
      ...base,
      gapSignals: checkIn.gapSignals?.generatedAt
        ? { ...checkIn.gapSignals }
        : undefined,
      // NOTHING else
    };
  }

  return base;
}
