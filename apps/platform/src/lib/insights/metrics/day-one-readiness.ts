import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "day-one-readiness",
  label: "Day-one readiness average",
  area: "launch",
  subcategory: "arrival-orchestration",
  display: "84%",
  rawValue: 84,
  health: "yellow",
  topSignal: "4 new hires this quarter · 1 below 70% · IT provisioning is the top blocker",
  groupBy: "owner_type",
  groupByLabel: "New hire",
  drilldownNotes: [
    "Awaiting `onboarding_tasks` and `launch_cases` tables — demo data shown.",
  ],
});
