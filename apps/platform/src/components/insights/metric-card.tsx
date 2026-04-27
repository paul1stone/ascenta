import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@ascenta/ui";
import { Badge } from "@ascenta/ui/badge";
import { HealthDot } from "./health-dot";
import type { MetricResult } from "@/lib/insights/types";

interface MetricCardProps {
  result: MetricResult;
  drilldownHref: string;
  className?: string;
}

export function MetricCard({ result, drilldownHref, className }: MetricCardProps) {
  return (
    <Link
      href={drilldownHref}
      className={cn(
        "group flex flex-col rounded-lg border bg-white p-4 transition-all hover:border-foreground/20 hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {result.label}
          </span>
          {result.health === "insufficient" ? (
            <span className="text-base font-medium tracking-tight text-slate-400 italic">
              Not enough data
            </span>
          ) : (
            <span className="text-2xl font-bold tracking-tight text-deep-blue">
              {result.display}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <HealthDot health={result.health} />
          {result.isMock && (
            <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200">
              demo data
            </Badge>
          )}
        </div>
      </div>

      {result.delta && (
        <div className="mt-2 flex items-center gap-1 text-[11px]">
          <DeltaIcon direction={result.delta.direction} />
          <span
            className={cn(
              "font-medium",
              result.delta.direction === "up" && "text-emerald-700",
              result.delta.direction === "down" && "text-rose-700",
              result.delta.direction === "flat" && "text-muted-foreground",
            )}
          >
            {result.delta.value} {result.delta.unit ?? ""}
          </span>
          <span className="text-muted-foreground">vs prior period</span>
        </div>
      )}

      {result.topSignal && (
        <div className="mt-2 text-[11px] text-slate-700 leading-snug">
          {result.topSignal}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end text-[11px] font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
        Drill down
        <ArrowRight className="ml-1 size-3" />
      </div>
    </Link>
  );
}

function DeltaIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up") return <ArrowUp className="size-3 text-emerald-700" />;
  if (direction === "down") return <ArrowDown className="size-3 text-rose-700" />;
  return <Minus className="size-3 text-muted-foreground" />;
}
