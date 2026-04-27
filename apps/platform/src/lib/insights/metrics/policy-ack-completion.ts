import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "policy-ack-completion",
  label: "Policy acknowledgement completion",
  area: "protect",
  subcategory: "policy-governance",
  display: "88%",
  rawValue: 88,
  health: "yellow",
  topSignal: "17 employees overdue · Sales at 71% — lowest by function",
  groupBy: "department",
  groupByLabel: "Department",
  drilldownNotes: [
    "Awaiting `policy_acknowledgements` table — demo data shown.",
  ],
});
