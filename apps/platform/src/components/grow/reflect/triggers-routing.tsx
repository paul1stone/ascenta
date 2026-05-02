"use client";

import {
  AlertTriangle,
  CalendarClock,
  Hand,
  Milestone,
  Repeat,
} from "lucide-react";

const TRIGGERS = [
  {
    icon: AlertTriangle,
    title: "Persistent Check-in Gap",
    description:
      "Same gap dimension across two consecutive Check-in cycles automatically suggests a Reflect.",
    color: "#cc6677",
  },
  {
    icon: Hand,
    title: "Manual Request",
    description:
      "Either party can request a Reflect at any time without explanation. The other is notified to confirm timing.",
    color: "#6688bb",
  },
  {
    icon: Milestone,
    title: "Lifecycle Milestone",
    description:
      "Auto-suggested at 90-day marks, mid-period, after coaching/corrective action, and at goal activation.",
    color: "#44aa99",
  },
  {
    icon: Repeat,
    title: "Quarterly Minimum",
    description:
      "Reflect occurs at minimum once every 90 days; soft prompt to both parties when overdue.",
    color: "#aa8866",
  },
];

export function TriggersRouting() {
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <header className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <CalendarClock className="size-4 text-muted-foreground" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Triggers & Routing
        </h3>
      </header>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRIGGERS.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.title}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="flex size-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${t.color}1a`, color: t.color }}
                >
                  <Icon className="size-4" />
                </div>
                <h4 className="font-display text-sm font-semibold text-foreground">
                  {t.title}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.description}
              </p>
            </div>
          );
        })}
      </div>
      <footer className="px-5 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground italic">
        Reflect data is development-only — never used in formal performance
        evaluations.
      </footer>
    </div>
  );
}
