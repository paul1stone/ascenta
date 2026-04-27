import type { Health } from "./types";

export const HEALTH_LABELS: Record<Health, string> = {
  green: "On track",
  yellow: "Needs review",
  red: "Action required",
  insufficient: "Not enough data",
};

export const HEALTH_COLORS: Record<Health, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  insufficient: "#94a3b8",
};

export const HEALTH_BG: Record<Health, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  red: "bg-red-100 text-red-800 border-red-200",
  insufficient: "bg-slate-100 text-slate-700 border-slate-200",
};

export interface PercentBands {
  green: number;
  yellow: number;
}

/**
 * Higher-is-better metric thresholding.
 * value >= bands.green → green
 * value >= bands.yellow → yellow
 * else → red
 */
export function healthFromPercent(
  value: number | null,
  bands: PercentBands,
): Health {
  if (value === null) return "insufficient";
  if (value >= bands.green) return "green";
  if (value >= bands.yellow) return "yellow";
  return "red";
}

/**
 * Lower-is-better metric thresholding (e.g. days, count of overdue).
 * value <= bands.green → green
 * value <= bands.yellow → yellow
 * else → red
 */
export function healthFromCount(
  value: number | null,
  bands: PercentBands,
): Health {
  if (value === null) return "insufficient";
  if (value <= bands.green) return "green";
  if (value <= bands.yellow) return "yellow";
  return "red";
}

/** Worst-of-many: when an aggregate has multiple inputs, return the worst. */
export function worstHealth(...healths: Health[]): Health {
  const order: Health[] = ["red", "yellow", "insufficient", "green"];
  for (const h of order) {
    if (healths.includes(h)) return h;
  }
  return "green";
}
