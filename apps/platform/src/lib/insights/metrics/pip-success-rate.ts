import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "pip-success-rate",
  label: "PIP success rate (rolling 12 months)",
  area: "grow",
  subcategory: "coaching",
  display: "67%",
  rawValue: 67,
  health: "green",
  topSignal: "4 of 6 PIPs resolved without separation — trending up from 50%",
  delta: { value: 17, direction: "up", unit: "pts" },
  groupBy: "department",
  groupByLabel: "Department",
  drilldownNotes: [
    "Awaiting `corrective_action_cases` table — values shown are demo data.",
  ],
});
