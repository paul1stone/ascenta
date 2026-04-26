"use client";
import { Badge } from "@ascenta/ui/badge";

interface Props {
  departments: string[];
  selected: Set<string>;
  onToggle: (dept: string) => void;
  onClear: () => void;
}

export function OrgChartFilters({ departments, selected, onToggle, onClear }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {departments.map((d) => (
        <Badge
          key={d}
          variant={selected.has(d) ? "default" : "outline"}
          onClick={() => onToggle(d)}
          className="cursor-pointer"
        >
          {d}
        </Badge>
      ))}
      {selected.size > 0 && (
        <button
          className="text-xs text-muted-foreground underline"
          onClick={onClear}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
