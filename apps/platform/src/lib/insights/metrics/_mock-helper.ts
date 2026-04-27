import type {
  AreaKey,
  DrilldownData,
  FilterState,
  Health,
  MetricDefinition,
  MetricResult,
} from "../types";
import { mockBreakdowns } from "../mock-data";

export interface MockMetricSpec {
  id: string;
  label: string;
  area: AreaKey;
  subcategory: string;
  display: string;
  rawValue: number | null;
  health: Health;
  topSignal?: string;
  delta?: MetricResult["delta"];
  groupBy: MetricDefinition["groupBy"];
  groupByLabel: string;
  drilldownNotes?: string[];
}

export function defineMockMetric(spec: MockMetricSpec): MetricDefinition {
  return {
    id: spec.id,
    area: spec.area,
    subcategory: spec.subcategory,
    label: spec.label,
    isMock: true,
    groupBy: spec.groupBy,
    groupByLabel: spec.groupByLabel,
    async compute(_filters: FilterState): Promise<MetricResult> {
      return {
        id: spec.id,
        label: spec.label,
        area: spec.area,
        subcategory: spec.subcategory,
        display: spec.display,
        rawValue: spec.rawValue,
        health: spec.health,
        topSignal: spec.topSignal,
        delta: spec.delta,
        isMock: true,
        asOf: new Date(),
      };
    },
    async drilldown(_filters: FilterState): Promise<DrilldownData> {
      return {
        metricId: spec.id,
        metricLabel: spec.label,
        area: spec.area,
        subcategory: spec.subcategory,
        groupBy: spec.groupBy,
        groupByLabel: spec.groupByLabel,
        rows: mockBreakdowns[spec.id] ?? [],
        isMock: true,
        asOf: new Date(),
        notes: spec.drilldownNotes,
      };
    },
  };
}
