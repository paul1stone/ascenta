import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "arrival-cycle-time",
  label: "Arrival Orchestration cycle time",
  area: "launch",
  subcategory: "arrival-orchestration",
  display: "18 days",
  rawValue: 18,
  health: "yellow",
  topSignal: "Target 14 days · IT provisioning accounts for 6 of 18 days",
  groupBy: "owner_type",
  groupByLabel: "Owner type",
  drilldownNotes: [
    "Awaiting `onboarding_tasks` table — demo data shown.",
  ],
});
