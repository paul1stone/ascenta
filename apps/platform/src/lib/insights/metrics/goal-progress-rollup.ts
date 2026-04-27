import { connectDB, Goal } from "@ascenta/db";
import type { FilterState, MetricDefinition, MetricResult, DrilldownData, BreakdownRow, Health } from "../types";
import { rangeToDates, PRIVACY_THRESHOLD } from "../filters";
import { healthFromPercent, worstHealth } from "../thresholds";
import { mockBreakdowns } from "../mock-data";

const ID = "goal-progress-rollup";
const LABEL = "Goal progress rollup";

interface StatusCounts {
  on_track: number;
  at_risk: number;
  stalled: number;
  complete: number;
  total: number;
  aligned: number;
}

async function loadStatusCounts(filters: FilterState): Promise<StatusCounts | null> {
  if (!process.env.MONGODB_URI) return null;
  await connectDB();
  const { end } = rangeToDates(filters);
  const STALLED_DAYS = 21;
  const stalledCutoff = new Date(end.getTime() - STALLED_DAYS * 24 * 60 * 60 * 1000);

  const rows = (await Goal.aggregate([
    { $match: { status: { $in: ["active", "needs_attention", "blocked", "completed"] } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        aligned: {
          $sum: { $cond: [{ $ne: ["$strategyGoalId", null] }, 1, 0] },
        },
        on_track: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
        at_risk: { $sum: { $cond: [{ $eq: ["$status", "needs_attention"] }, 1, 0] } },
        blocked_count: { $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] } },
        complete: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        stalled_active: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "active"] },
                  { $lt: ["$updatedAt", stalledCutoff] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ])) as Array<{
    total: number;
    aligned: number;
    on_track: number;
    at_risk: number;
    blocked_count: number;
    complete: number;
    stalled_active: number;
  }>;

  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    on_track: Math.max(0, r.on_track - r.stalled_active),
    at_risk: r.at_risk,
    stalled: r.blocked_count + r.stalled_active,
    complete: r.complete,
    total: r.total,
    aligned: r.aligned,
  };
}

function bestEffortMockResult(asOf: Date): MetricResult {
  return {
    id: ID,
    label: LABEL,
    area: "grow",
    subcategory: "performance-system",
    display: "61% on track",
    rawValue: 61,
    health: "yellow",
    topSignal: "18% at risk · 8% stalled · 11 goals with no update in 21+ days",
    delta: { value: 2, direction: "up", unit: "pts" },
    isMock: true,
    asOf,
  };
}

export const metric: MetricDefinition = {
  id: ID,
  area: "grow",
  subcategory: "performance-system",
  label: LABEL,
  isMock: false,
  groupBy: "stage",
  groupByLabel: "Status bucket",
  async compute(filters: FilterState): Promise<MetricResult> {
    const asOf = new Date();
    let counts: StatusCounts | null;
    try {
      counts = await loadStatusCounts(filters);
    } catch {
      counts = null;
    }
    if (!counts || counts.total === 0) return bestEffortMockResult(asOf);

    if (counts.total < PRIVACY_THRESHOLD) {
      return {
        id: ID,
        label: LABEL,
        area: "grow",
        subcategory: "performance-system",
        display: "—",
        rawValue: null,
        health: "insufficient",
        isMock: false,
        asOf,
      };
    }

    const onTrackPct = Math.round((counts.on_track / counts.total) * 100);
    const stalledPct = Math.round((counts.stalled / counts.total) * 100);
    const atRiskPct = Math.round((counts.at_risk / counts.total) * 100);
    const alignmentPct = Math.round((counts.aligned / counts.total) * 100);

    const onTrackHealth: Health = healthFromPercent(onTrackPct, { green: 70, yellow: 50 });
    const stalledHealth: Health =
      stalledPct < 5 ? "green" : stalledPct <= 10 ? "yellow" : "red";
    const alignmentHealth: Health = alignmentPct >= 60 ? "green" : "red";

    const finalHealth = worstHealth(onTrackHealth, stalledHealth, alignmentHealth);

    return {
      id: ID,
      label: LABEL,
      area: "grow",
      subcategory: "performance-system",
      display: `${onTrackPct}% on track`,
      rawValue: onTrackPct,
      health: finalHealth,
      topSignal: `${atRiskPct}% at risk · ${stalledPct}% stalled · alignment ${alignmentPct}%`,
      isMock: false,
      asOf,
    };
  },
  async drilldown(filters: FilterState): Promise<DrilldownData> {
    let counts: StatusCounts | null = null;
    try {
      counts = await loadStatusCounts(filters);
    } catch {
      counts = null;
    }
    let rows: BreakdownRow[];
    let isMock = false;
    if (counts && counts.total > 0) {
      rows = [
        { key: "on_track", label: "On Track", value: counts.on_track, display: `${counts.on_track}`, health: "green" },
        { key: "at_risk", label: "At Risk", value: counts.at_risk, display: `${counts.at_risk}`, health: "yellow" },
        { key: "stalled", label: "Stalled / Blocked", value: counts.stalled, display: `${counts.stalled}`, health: "red" },
        { key: "complete", label: "Complete", value: counts.complete, display: `${counts.complete}`, health: "green" },
      ];
    } else {
      rows = mockBreakdowns[ID];
      isMock = true;
    }
    return {
      metricId: ID,
      metricLabel: LABEL,
      area: "grow",
      subcategory: "performance-system",
      groupBy: "stage",
      groupByLabel: "Status bucket",
      rows,
      isMock,
      asOf: new Date(),
    };
  },
};
