import { HealthDot } from "./health-dot";
import type { BreakdownRow } from "@/lib/insights/types";

interface BreakdownTableProps {
  rows: BreakdownRow[];
  groupByLabel: string;
}

export function BreakdownTable({ rows, groupByLabel }: BreakdownTableProps) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 text-muted-foreground">
          <tr>
            <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide">
              {groupByLabel}
            </th>
            <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide">
              Value
            </th>
            <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide">
              Cohort
            </th>
            <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-2.5 font-medium text-foreground">{row.label}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{row.display}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {row.cohortSize ?? "—"}
              </td>
              <td className="px-4 py-2.5">
                {row.health && <HealthDot health={row.health} showLabel size="sm" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
