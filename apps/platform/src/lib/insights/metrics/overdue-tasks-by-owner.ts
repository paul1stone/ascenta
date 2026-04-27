import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "overdue-tasks-by-owner",
  label: "Overdue task volume by owner type",
  area: "launch",
  subcategory: "arrival-orchestration",
  display: "7 overdue",
  rawValue: 7,
  health: "red",
  topSignal: "IT accounts for 4 of 7 overdue tasks (57%) · no HR tasks overdue",
  groupBy: "owner_type",
  groupByLabel: "Owner type",
  drilldownNotes: [
    "Awaiting `onboarding_tasks` table — demo data shown.",
  ],
});
