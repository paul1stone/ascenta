"use client";

import { cn } from "@ascenta/ui";
import type { CheckInStatus } from "@ascenta/db/checkin-constants";

const PHASES = [
  { key: "prepare", label: "Prepare", statuses: ["preparing"] },
  { key: "participate", label: "Participate", statuses: ["ready", "in_progress"] },
  { key: "reflect", label: "Reflect", statuses: ["reflecting", "completed"] },
] as const;

function getPhaseIndex(status: CheckInStatus): number {
  const idx = PHASES.findIndex((p) =>
    (p.statuses as readonly string[]).includes(status),
  );
  return idx === -1 ? 0 : idx;
}

export function PhaseStepper({ status }: { status: CheckInStatus }) {
  const activeIndex = getPhaseIndex(status);
  const isCompleted = status === "completed";

  return (
    <div className="flex items-center gap-0 mb-8">
      {PHASES.map((phase, i) => {
        const isActive = i === activeIndex && !isCompleted;
        const isDone = i < activeIndex || isCompleted;

        return (
          <div key={phase.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  isDone && "bg-[#44aa99] text-white",
                  isActive && "bg-[#44aa99] text-white",
                  !isDone && !isActive && "bg-muted border border-border text-muted-foreground",
                )}
              >
                {isDone ? "\u2713" : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 font-medium",
                  isDone || isActive
                    ? "text-[#44aa99]"
                    : "text-muted-foreground",
                )}
              >
                {phase.label}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-[0.5]",
                  isDone ? "bg-[#44aa99]" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
