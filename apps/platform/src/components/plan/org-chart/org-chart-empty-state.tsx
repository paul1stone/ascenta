"use client";
import { Building2 } from "lucide-react";

export function OrgChartEmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-12 text-center">
      <Building2 className="size-10 text-muted-foreground/40 mx-auto mb-3" />
      <h3 className="font-display text-lg font-bold mb-1">Org Chart</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Add at least two employees with reporting relationships to see the org chart.
      </p>
    </div>
  );
}
