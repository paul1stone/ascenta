import type { UserRole } from "@/lib/auth/auth-context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterCheckInForRole(
  checkIn: any,
  role: UserRole,
  userId: string,
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
