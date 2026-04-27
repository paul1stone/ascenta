import { cn } from "@ascenta/ui";
import type { Health } from "@/lib/insights/types";
import { HEALTH_COLORS, HEALTH_LABELS } from "@/lib/insights/thresholds";

interface HealthDotProps {
  health: Health;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function HealthDot({ health, showLabel = false, size = "md", className }: HealthDotProps) {
  const dotSize = size === "sm" ? "size-1.5" : "size-2";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn("inline-block rounded-full shrink-0", dotSize)}
        style={{ backgroundColor: HEALTH_COLORS[health] }}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-[11px] font-medium text-muted-foreground">
          {HEALTH_LABELS[health]}
        </span>
      )}
    </span>
  );
}
