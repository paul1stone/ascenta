import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { HealthDot } from "./health-dot";
import { INSIGHTS_AREAS } from "@/lib/insights/areas";
import type { AreaSummary } from "@/lib/insights/org-health";

interface RiskSignalsProps {
  signals: AreaSummary[];
}

export function RiskSignals({ signals }: RiskSignalsProps) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <AlertTriangle className="size-3.5 text-amber-600" />
        <span className="text-xs font-semibold uppercase tracking-wide text-deep-blue">
          Top Open Risk Signals
        </span>
      </div>
      <ul className="divide-y">
        {signals.map((s) => {
          const area = INSIGHTS_AREAS.find((a) => a.key === s.area);
          if (!area) return null;
          return (
            <li key={s.area}>
              <Link
                href={`/insights/${s.area}`}
                className="group flex items-center justify-between gap-3 px-4 py-3 text-xs hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HealthDot health={s.health} />
                  <span className="font-medium text-deep-blue shrink-0" style={{ color: area.color }}>
                    {area.label}
                  </span>
                  <span className="text-foreground truncate">{s.topSignal}</span>
                </div>
                <ArrowRight className="size-3 text-muted-foreground group-hover:text-indigo-600 transition-colors shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
