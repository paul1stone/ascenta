import type { MetricDefinition } from "../types";
import { metric as checkInCompletion } from "./check-in-completion-rate";
import { metric as goalProgress } from "./goal-progress-rollup";
import { metric as coachingVolume } from "./coaching-case-volume";
import { metric as pipSuccess } from "./pip-success-rate";
import { metric as cultureGymStreaks } from "./culture-gym-streaks";
import { metric as dayOneReadiness } from "./day-one-readiness";
import { metric as arrivalCycleTime } from "./arrival-cycle-time";
import { metric as overdueTasks } from "./overdue-tasks-by-owner";
import { metric as protectedFeedbackOpen } from "./protected-feedback-open";
import { metric as policyAck } from "./policy-ack-completion";
import { metric as benefitsCases } from "./benefits-cases-open";

export const METRIC_REGISTRY: Record<string, MetricDefinition> = {
  [checkInCompletion.id]: checkInCompletion,
  [goalProgress.id]: goalProgress,
  [coachingVolume.id]: coachingVolume,
  [pipSuccess.id]: pipSuccess,
  [cultureGymStreaks.id]: cultureGymStreaks,
  [dayOneReadiness.id]: dayOneReadiness,
  [arrivalCycleTime.id]: arrivalCycleTime,
  [overdueTasks.id]: overdueTasks,
  [protectedFeedbackOpen.id]: protectedFeedbackOpen,
  [policyAck.id]: policyAck,
  [benefitsCases.id]: benefitsCases,
};

export function getMetric(id: string): MetricDefinition | undefined {
  return METRIC_REGISTRY[id];
}

export function getMetricsForArea(areaKey: string): MetricDefinition[] {
  return Object.values(METRIC_REGISTRY).filter((m) => m.area === areaKey);
}
