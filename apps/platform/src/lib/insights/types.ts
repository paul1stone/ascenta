export type Health = "green" | "yellow" | "red" | "insufficient";

export const AREA_KEYS = ["protect", "plan", "attract", "launch", "grow", "care"] as const;
export type AreaKey = (typeof AREA_KEYS)[number];

export type DateRange = "30d" | "90d" | "6m" | "12m" | "custom";

export interface FilterState {
  range: DateRange;
  customStart?: Date;
  customEnd?: Date;
  location: string;
  department: string;
  manager: string;
}

export interface MetricDelta {
  value: number;
  direction: "up" | "down" | "flat";
  unit?: string;
}

export interface MetricResult {
  id: string;
  label: string;
  area: AreaKey;
  subcategory: string;
  display: string;
  rawValue: number | null;
  health: Health;
  topSignal?: string;
  delta?: MetricDelta;
  isMock: boolean;
  asOf: Date;
}

export interface BreakdownRow {
  key: string;
  label: string;
  value: number;
  display: string;
  health?: Health;
  cohortSize?: number;
}

export interface DrilldownData {
  metricId: string;
  metricLabel: string;
  area: AreaKey;
  subcategory: string;
  groupBy: "manager" | "department" | "location" | "owner_type" | "stage" | "category" | "case_type";
  groupByLabel: string;
  rows: BreakdownRow[];
  isMock: boolean;
  asOf: Date;
  notes?: string[];
}

export interface SubcategoryDef {
  key: string;
  label: string;
  description: string;
  statusItems: string[];
  insightItems: string[];
  metricIds: string[];
}

export interface AreaDef {
  key: AreaKey;
  label: string;
  subtitle: string;
  color: string;
  subcategories: SubcategoryDef[];
}

export interface MetricDefinition {
  id: string;
  area: AreaKey;
  subcategory: string;
  label: string;
  isMock: boolean;
  /** Identifier for how breakdown is grouped in the drill-down. */
  groupBy: DrilldownData["groupBy"];
  groupByLabel: string;
  compute(filters: FilterState): Promise<MetricResult>;
  drilldown(filters: FilterState): Promise<DrilldownData>;
}
