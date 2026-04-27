import { cn } from "@ascenta/ui";
import { HealthDot } from "./health-dot";
import { HEALTH_COLORS } from "@/lib/insights/thresholds";
import type { BreakdownRow } from "@/lib/insights/types";

interface BreakdownChartProps {
  rows: BreakdownRow[];
  unit?: string;
  groupByLabel: string;
  valueLabel?: string;
}

export function BreakdownChart({ rows, groupByLabel, valueLabel = "Value" }: BreakdownChartProps) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="grid grid-cols-[160px_1fr_80px] items-center gap-3 border-b bg-slate-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{groupByLabel}</span>
        <span>Distribution</span>
        <span className="text-right">{valueLabel}</span>
      </div>
      <ul className="divide-y">
        {rows.map((row) => {
          const pct = (row.value / max) * 100;
          const color = row.health ? HEALTH_COLORS[row.health] : "#6366f1";
          return (
            <li
              key={row.key}
              className="grid grid-cols-[160px_1fr_80px] items-center gap-3 px-4 py-2.5 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {row.health && <HealthDot health={row.health} size="sm" />}
                <span className="truncate font-medium text-foreground">{row.label}</span>
              </div>
              <div className={cn("h-2 w-full rounded-full bg-slate-100 overflow-hidden")}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-right tabular-nums font-medium text-foreground">
                {row.display}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
