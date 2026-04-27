import type { DateRange, FilterState } from "./types";

const VALID_RANGES: DateRange[] = ["30d", "90d", "6m", "12m", "custom"];

type RawSearchParams = Record<string, string | string[] | undefined>;

function pick(params: RawSearchParams, key: string): string | undefined {
  const v = params[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export function parseFilters(searchParams: RawSearchParams = {}): FilterState {
  const rawRange = pick(searchParams, "range");
  const range: DateRange = (VALID_RANGES as string[]).includes(rawRange ?? "")
    ? (rawRange as DateRange)
    : "30d";

  const customStartRaw = pick(searchParams, "start");
  const customEndRaw = pick(searchParams, "end");

  return {
    range,
    customStart: range === "custom" && customStartRaw ? new Date(customStartRaw) : undefined,
    customEnd: range === "custom" && customEndRaw ? new Date(customEndRaw) : undefined,
    location: pick(searchParams, "loc") ?? "all",
    department: pick(searchParams, "dept") ?? "all",
    manager: pick(searchParams, "mgr") ?? "all",
  };
}

export function rangeToDates(filters: FilterState): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (filters.range) {
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "6m":
      start.setMonth(end.getMonth() - 6);
      break;
    case "12m":
      start.setMonth(end.getMonth() - 12);
      break;
    case "custom":
      return {
        start: filters.customStart ?? new Date(end.getFullYear(), 0, 1),
        end: filters.customEnd ?? end,
      };
  }
  return { start, end };
}

export function rangeLabel(range: DateRange): string {
  switch (range) {
    case "30d":
      return "Last 30 days";
    case "90d":
      return "Last 90 days";
    case "6m":
      return "Last 6 months";
    case "12m":
      return "Last 12 months";
    case "custom":
      return "Custom range";
  }
}

export function filtersToSearchString(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.range !== "30d") params.set("range", filters.range);
  if (filters.range === "custom") {
    if (filters.customStart) params.set("start", filters.customStart.toISOString().slice(0, 10));
    if (filters.customEnd) params.set("end", filters.customEnd.toISOString().slice(0, 10));
  }
  if (filters.location !== "all") params.set("loc", filters.location);
  if (filters.department !== "all") params.set("dept", filters.department);
  if (filters.manager !== "all") params.set("mgr", filters.manager);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const PRIVACY_THRESHOLD = 5;
