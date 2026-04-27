import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "benefits-cases-open",
  label: "Open benefits cases by type",
  area: "care",
  subcategory: "benefits-hub",
  display: "8 open",
  rawValue: 8,
  health: "yellow",
  topSignal: "2 accommodation requests · 1 ADA case · avg age 6 days",
  groupBy: "case_type",
  groupByLabel: "Case type",
  drilldownNotes: [
    "Awaiting `benefits_cases` table — demo data shown.",
  ],
});
