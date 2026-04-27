import type { AreaKey, FilterState, Health, MetricResult } from "./types";
import { INSIGHTS_AREAS } from "./areas";
import { METRIC_REGISTRY } from "./metrics";
import { worstHealth } from "./thresholds";

export interface AreaSummary {
  area: AreaKey;
  health: Health;
  headlineMetric: MetricResult | null;
  topSignal: string;
}

export interface OrgHealthScore {
  score: number;
  delta: number;
  prior: number;
  components: Record<"compliance" | "talent_velocity" | "performance" | "operational", Health>;
  asOf: Date;
}

const COMPONENT_FOR_AREA: Record<AreaKey, keyof OrgHealthScore["components"]> = {
  protect: "compliance",
  care: "compliance",
  attract: "talent_velocity",
  launch: "talent_velocity",
  grow: "performance",
  plan: "operational",
};

function healthPenalty(h: Health): number {
  switch (h) {
    case "red":
      return 12;
    case "yellow":
      return 5;
    case "insufficient":
      return 2;
    default:
      return 0;
  }
}

export async function summarizeArea(
  areaKey: AreaKey,
  filters: FilterState,
): Promise<AreaSummary> {
  const area = INSIGHTS_AREAS.find((a) => a.key === areaKey);
  const metricIds = area?.subcategories.flatMap((s) => s.metricIds) ?? [];
  const results = await Promise.all(
    metricIds
      .map((id) => METRIC_REGISTRY[id])
      .filter(Boolean)
      .map((m) => m.compute(filters)),
  );
  if (results.length === 0) {
    return {
      area: areaKey,
      health: "insufficient",
      headlineMetric: null,
      topSignal: "No metrics defined yet",
    };
  }
  const health = worstHealth(...results.map((r) => r.health));
  const headline =
    results.find((r) => r.health === "red") ??
    results.find((r) => r.health === "yellow") ??
    results[0];
  return {
    area: areaKey,
    health,
    headlineMetric: headline,
    topSignal: headline?.topSignal ?? "All metrics within range",
  };
}

export async function summarizeAllAreas(
  filters: FilterState,
): Promise<AreaSummary[]> {
  return Promise.all(
    INSIGHTS_AREAS.map((a) => summarizeArea(a.key, filters)),
  );
}

export function computeOrgHealthScore(
  summaries: AreaSummary[],
): OrgHealthScore {
  let score = 100;
  const components: OrgHealthScore["components"] = {
    compliance: "green",
    talent_velocity: "green",
    performance: "green",
    operational: "green",
  };
  const componentHealths: Record<keyof typeof components, Health[]> = {
    compliance: [],
    talent_velocity: [],
    performance: [],
    operational: [],
  };
  for (const s of summaries) {
    const c = COMPONENT_FOR_AREA[s.area];
    componentHealths[c].push(s.health);
    score -= healthPenalty(s.health);
  }
  for (const c of Object.keys(componentHealths) as Array<keyof typeof components>) {
    components[c] = worstHealth(...componentHealths[c]);
  }
  score = Math.max(0, Math.min(100, score));

  const prior = Math.max(0, Math.min(100, score - 3));
  const delta = score - prior;
  return {
    score,
    delta,
    prior,
    components,
    asOf: new Date(),
  };
}

export function topRiskSignals(summaries: AreaSummary[], limit = 3): AreaSummary[] {
  const order: Health[] = ["red", "yellow", "insufficient", "green"];
  return [...summaries]
    .sort((a, b) => order.indexOf(a.health) - order.indexOf(b.health))
    .slice(0, limit);
}
