import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "coaching-case-volume",
  label: "Coaching case volume by stage",
  area: "grow",
  subcategory: "coaching",
  display: "9 active",
  rawValue: 9,
  health: "yellow",
  topSignal: "5 verbal · 2 written · 2 PIP · 1 follow-up overdue",
  groupBy: "stage",
  groupByLabel: "Stage",
  drilldownNotes: [
    "Awaiting `corrective_action_cases` table — values shown are demo data from the Brandon White scenario.",
  ],
});
