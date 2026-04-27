import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HealthDot } from "./health-dot";
import type { AreaDef, MetricResult } from "@/lib/insights/types";
import type { Health } from "@/lib/insights/types";
import { HEALTH_LABELS } from "@/lib/insights/thresholds";

interface AreaCardProps {
  area: AreaDef;
  health: Health;
  headlineMetric: MetricResult | null;
  topSignal: string;
  href: string;
}

export function AreaCard({ area, health, headlineMetric, topSignal, href }: AreaCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border bg-white overflow-hidden transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div
        className="h-1 w-full"
        style={{ backgroundColor: area.color }}
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-sm font-bold text-deep-blue">
              {area.label}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {area.subtitle}
            </div>
          </div>
          <HealthDot health={health} />
        </div>

        {headlineMetric ? (
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {headlineMetric.label}
            </div>
            <div className="text-2xl font-bold text-deep-blue tracking-tight">
              {headlineMetric.display}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">
            No metrics defined yet
          </div>
        )}

        <div className="mt-auto flex items-start gap-2 rounded-md bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700">
          <span
            className="mt-0.5 inline-block size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: area.color }}
            aria-hidden="true"
          />
          <span className="leading-snug">{topSignal}</span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">{HEALTH_LABELS[health]}</span>
          <span className="inline-flex items-center gap-1 font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
            View details
            <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
