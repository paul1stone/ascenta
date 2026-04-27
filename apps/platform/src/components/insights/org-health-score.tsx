import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@ascenta/ui";
import type { OrgHealthScore as OrgHealthScoreType } from "@/lib/insights/org-health";
import { HEALTH_LABELS } from "@/lib/insights/thresholds";
import { HealthDot } from "./health-dot";

interface OrgHealthScoreProps {
  score: OrgHealthScoreType;
}

const COMPONENT_LABELS: Record<keyof OrgHealthScoreType["components"], string> = {
  compliance: "Compliance",
  talent_velocity: "Talent Velocity",
  performance: "Performance",
  operational: "Operational",
};

export function OrgHealthScore({ score }: OrgHealthScoreProps) {
  const direction = score.delta > 0 ? "up" : score.delta < 0 ? "down" : "flat";
  const tone = scoreTone(score.score);

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5 border-b">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Organization Health Score
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span
              className={cn(
                "font-display text-5xl font-bold tracking-tight",
                tone.text,
              )}
            >
              {score.score}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            <DeltaIcon direction={direction} />
            <span
              className={cn(
                "font-medium",
                direction === "up" && "text-emerald-700",
                direction === "down" && "text-rose-700",
                direction === "flat" && "text-muted-foreground",
              )}
            >
              {Math.abs(score.delta)} pts
            </span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        </div>
        <div className={cn("rounded-md px-3 py-1.5 text-[11px] font-medium", tone.bg)}>
          {tone.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        {(Object.entries(score.components) as Array<[keyof OrgHealthScoreType["components"], typeof score.components[keyof OrgHealthScoreType["components"]]]>).map(
          ([key, h]) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {COMPONENT_LABELS[key]}
              </span>
              <div className="flex items-center gap-1.5">
                <HealthDot health={h} size="sm" />
                <span className="text-[11px] text-foreground">{HEALTH_LABELS[h]}</span>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function scoreTone(score: number): { text: string; bg: string; label: string } {
  if (score >= 85) return { text: "text-emerald-700", bg: "bg-emerald-50 text-emerald-800", label: "Healthy" };
  if (score >= 70) return { text: "text-amber-700", bg: "bg-amber-50 text-amber-800", label: "Watch" };
  return { text: "text-rose-700", bg: "bg-rose-50 text-rose-800", label: "Action required" };
}

function DeltaIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up") return <ArrowUp className="size-3 text-emerald-700" />;
  if (direction === "down") return <ArrowDown className="size-3 text-rose-700" />;
  return <Minus className="size-3 text-muted-foreground" />;
}
