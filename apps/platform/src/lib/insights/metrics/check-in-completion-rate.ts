import { connectDB, CheckIn } from "@ascenta/db";
import type { FilterState, MetricDefinition, MetricResult, DrilldownData, Health } from "../types";
import { rangeToDates, PRIVACY_THRESHOLD } from "../filters";
import { healthFromPercent, worstHealth } from "../thresholds";
import { mockBreakdowns } from "../mock-data";

const ID = "check-in-completion-rate";
const LABEL = "Check-in completion rate";

interface ManagerStats {
  managerId: string;
  total: number;
  completed: number;
}

const COMPLETED_STATUSES = ["completed", "reflecting"] as const;

async function loadStats(filters: FilterState): Promise<ManagerStats[] | null> {
  if (!process.env.MONGODB_URI) return null;
  await connectDB();
  const { start, end } = rangeToDates(filters);
  const rows = (await CheckIn.aggregate([
    { $match: { scheduledAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: "$manager",
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $in: ["$status", COMPLETED_STATUSES] }, 1, 0],
          },
        },
      },
    },
  ])) as Array<{ _id: unknown; total: number; completed: number }>;
  return rows.map((r) => ({ managerId: String(r._id), total: r.total, completed: r.completed }));
}

function pctSafe(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

function bestEffortMockResult(asOf: Date): MetricResult {
  return {
    id: ID,
    label: LABEL,
    area: "grow",
    subcategory: "performance-system",
    display: "71%",
    rawValue: 71,
    health: "yellow",
    topSignal: "3 managers below 80% — Katie Smith at 50%",
    delta: { value: 4, direction: "down", unit: "pts" },
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
  groupBy: "manager",
  groupByLabel: "Manager",
  async compute(filters: FilterState): Promise<MetricResult> {
    const asOf = new Date();
    let stats: ManagerStats[] | null;
    try {
      stats = await loadStats(filters);
    } catch {
      stats = null;
    }
    if (!stats || stats.length === 0) return bestEffortMockResult(asOf);

    const totalScheduled = stats.reduce((acc, s) => acc + s.total, 0);
    const totalCompleted = stats.reduce((acc, s) => acc + s.completed, 0);
    if (totalScheduled < PRIVACY_THRESHOLD) {
      return {
        id: ID,
        label: LABEL,
        area: "grow",
        subcategory: "performance-system",
        display: "—",
        rawValue: null,
        health: "insufficient",
        topSignal: `Cohort of ${totalScheduled} check-ins is below the 5-employee privacy threshold`,
        isMock: false,
        asOf,
      };
    }
    const orgPct = pctSafe(totalCompleted, totalScheduled) ?? 0;
    const managerPcts = stats
      .filter((s) => s.total >= 1)
      .map((s) => ({ id: s.managerId, pct: pctSafe(s.completed, s.total) ?? 0 }));
    const lowest = managerPcts.reduce(
      (acc, m) => (m.pct < acc.pct ? m : acc),
      managerPcts[0] ?? { id: "", pct: 100 },
    );
    const belowEighty = managerPcts.filter((m) => m.pct < 80).length;

    const orgHealth: Health = healthFromPercent(orgPct, { green: 80, yellow: 65 });
    const managerWorst: Health = managerPcts.some((m) => m.pct < 60)
      ? "red"
      : managerPcts.some((m) => m.pct < 80)
        ? "yellow"
        : "green";
    const finalHealth = worstHealth(orgHealth, managerWorst);

    return {
      id: ID,
      label: LABEL,
      area: "grow",
      subcategory: "performance-system",
      display: `${orgPct}%`,
      rawValue: orgPct,
      health: finalHealth,
      topSignal: belowEighty > 0
        ? `${belowEighty} ${belowEighty === 1 ? "manager" : "managers"} below 80% — lowest at ${lowest.pct}%`
        : "All managers above 80%",
      isMock: false,
      asOf,
    };
  },
  async drilldown(_filters: FilterState): Promise<DrilldownData> {
    return {
      metricId: ID,
      metricLabel: LABEL,
      area: "grow",
      subcategory: "performance-system",
      groupBy: "manager",
      groupByLabel: "Manager",
      rows: mockBreakdowns[ID],
      isMock: true,
      asOf: new Date(),
      notes: ["Per-manager breakdown will populate from CheckIn aggregation once seeded."],
    };
  },
};
