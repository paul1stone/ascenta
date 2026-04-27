/**
 * Seeded mock breakdowns used by drill-down pages and any metric whose
 * underlying tables don't exist yet.
 *
 * Values come straight from the Brandon White MVP scenario in the Canopy spec
 * so the demo reads consistently. When a real data source comes online, the
 * corresponding metric module swaps from `mockBreakdowns.<id>` to a query.
 */

import type { BreakdownRow } from "./types";

export const MOCK_LOCATIONS = ["Austin HQ", "Denver", "Remote — US", "Remote — EMEA"];
export const MOCK_DEPARTMENTS = ["Engineering", "Sales", "Customer Success", "Operations", "People"];

export const mockBreakdowns: Record<string, BreakdownRow[]> = {
  "check-in-completion-rate": [
    { key: "katie-smith", label: "Katie Smith", value: 50, display: "50%", health: "red", cohortSize: 8 },
    { key: "darius-okafor", label: "Darius Okafor", value: 67, display: "67%", health: "yellow", cohortSize: 6 },
    { key: "lauren-park", label: "Lauren Park", value: 75, display: "75%", health: "yellow", cohortSize: 7 },
    { key: "miguel-torres", label: "Miguel Torres", value: 89, display: "89%", health: "green", cohortSize: 9 },
    { key: "sasha-ng", label: "Sasha Ng", value: 92, display: "92%", health: "green", cohortSize: 5 },
  ],
  "coaching-case-volume": [
    { key: "verbal", label: "Verbal Coaching", value: 5, display: "5 cases", health: "green" },
    { key: "written", label: "Written Warning", value: 2, display: "2 cases", health: "yellow" },
    { key: "pip", label: "Performance Improvement Plan", value: 2, display: "2 cases", health: "yellow" },
  ],
  "pip-success-rate": [
    { key: "engineering", label: "Engineering", value: 75, display: "75%", health: "green", cohortSize: 8 },
    { key: "sales", label: "Sales", value: 50, display: "50%", health: "yellow", cohortSize: 12 },
    { key: "operations", label: "Operations", value: 67, display: "67%", health: "green", cohortSize: 6 },
  ],
  "culture-gym-streaks": [
    { key: "30plus", label: "30+ days", value: 23, display: "23 employees", health: "green" },
    { key: "8-29", label: "8 – 29 days", value: 41, display: "41 employees", health: "green" },
    { key: "1-7", label: "1 – 7 days", value: 28, display: "28 employees", health: "yellow" },
    { key: "inactive", label: "Inactive", value: 67, display: "67 employees", health: "red" },
  ],
  "goal-progress-rollup": [
    { key: "on_track", label: "On Track", value: 61, display: "61%", health: "green" },
    { key: "at_risk", label: "At Risk", value: 18, display: "18%", health: "yellow" },
    { key: "stalled", label: "Stalled", value: 8, display: "8%", health: "yellow" },
    { key: "complete", label: "Complete", value: 13, display: "13%", health: "green" },
  ],
  "day-one-readiness": [
    { key: "brandon-white", label: "Brandon White (Sales)", value: 92, display: "92%", health: "green" },
    { key: "rae-johnson", label: "Rae Johnson (Engineering)", value: 88, display: "88%", health: "green" },
    { key: "tom-howell", label: "Tom Howell (Operations)", value: 81, display: "81%", health: "yellow" },
    { key: "ana-fields", label: "Ana Fields (People)", value: 64, display: "64%", health: "red" },
  ],
  "arrival-cycle-time": [
    { key: "it", label: "IT Provisioning", value: 6, display: "6 days", health: "red" },
    { key: "facilities", label: "Facilities", value: 4, display: "4 days", health: "yellow" },
    { key: "manager", label: "Manager Tasks", value: 3, display: "3 days", health: "green" },
    { key: "hr", label: "HR Onboarding", value: 3, display: "3 days", health: "green" },
    { key: "new_hire", label: "New Hire Forms", value: 2, display: "2 days", health: "green" },
  ],
  "overdue-tasks-by-owner": [
    { key: "it", label: "IT", value: 4, display: "4 overdue", health: "red" },
    { key: "facilities", label: "Facilities", value: 2, display: "2 overdue", health: "yellow" },
    { key: "manager", label: "Manager", value: 1, display: "1 overdue", health: "yellow" },
    { key: "hr", label: "HR", value: 0, display: "0 overdue", health: "green" },
    { key: "new_hire", label: "New Hire", value: 0, display: "0 overdue", health: "green" },
  ],
  "protected-feedback-open": [
    { key: "harassment", label: "Harassment", value: 1, display: "1 high-severity", health: "red" },
    { key: "conduct", label: "Conduct", value: 2, display: "2 medium", health: "yellow" },
    { key: "safety", label: "Safety", value: 1, display: "1 medium", health: "yellow" },
    { key: "retaliation", label: "Retaliation", value: 1, display: "1 low", health: "green" },
  ],
  "policy-ack-completion": [
    { key: "engineering", label: "Engineering", value: 96, display: "96%", health: "green", cohortSize: 48 },
    { key: "operations", label: "Operations", value: 91, display: "91%", health: "green", cohortSize: 22 },
    { key: "people", label: "People", value: 100, display: "100%", health: "green", cohortSize: 6 },
    { key: "customer-success", label: "Customer Success", value: 84, display: "84%", health: "yellow", cohortSize: 19 },
    { key: "sales", label: "Sales", value: 71, display: "71%", health: "red", cohortSize: 31 },
  ],
  "benefits-cases-open": [
    { key: "enrollment", label: "Enrollment", value: 3, display: "3 open", health: "green" },
    { key: "accommodation", label: "Accommodation", value: 2, display: "2 open", health: "yellow" },
    { key: "ada", label: "ADA", value: 1, display: "1 open", health: "yellow" },
    { key: "life_event", label: "Life Event", value: 2, display: "2 open", health: "green" },
    { key: "pwfa", label: "PWFA", value: 0, display: "0 open", health: "green" },
  ],
};
