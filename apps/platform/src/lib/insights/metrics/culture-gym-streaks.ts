import { defineMockMetric } from "./_mock-helper";

export const metric = defineMockMetric({
  id: "culture-gym-streaks",
  label: "Culture Gym streak distribution",
  area: "grow",
  subcategory: "performance-system",
  display: "58% active",
  rawValue: 58,
  health: "yellow",
  topSignal: "Median streak 14 days · 23 employees at 30+ days",
  groupBy: "stage",
  groupByLabel: "Streak bucket",
  drilldownNotes: [
    "Awaiting `culture_gym_sessions` table — values shown are demo data.",
  ],
});
