import { Lightbulb } from "lucide-react";

interface InsightsPanelProps {
  items: string[];
  color: string;
}

export function InsightsPanel({ items, color }: InsightsPanelProps) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <Lightbulb className="size-3.5" style={{ color }} />
        <span className="text-xs font-semibold uppercase tracking-wide text-deep-blue">
          Canopy Insights
        </span>
      </div>
      <ul className="divide-y">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 px-4 py-2.5 text-xs text-foreground"
          >
            <span
              className="mt-1.5 inline-block size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
