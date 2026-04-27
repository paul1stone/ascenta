import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "protected-feedback-open",
  label: "Protected Feedback open items",
  area: "protect",
  subcategory: "protected-feedback",
  display: "5 open",
  rawValue: 5,
  health: "yellow",
  topSignal: "1 approaching 14-day SLA · severity: 1 high, 3 medium, 1 low",
  groupBy: "category",
  groupByLabel: "Category",
  drilldownNotes: [
    "Awaiting `protected_feedback` table — demo data shown.",
  ],
});
