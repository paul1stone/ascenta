"use client";

import { Building2 } from "lucide-react";

export function OrgDesignEmptyTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
      <Building2 className="size-10 text-muted-foreground/40 mb-3" />
      <h3 className="font-display text-lg font-bold text-foreground mb-1">
        Org Chart
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Visual organization chart with employee profile cards is the next sub-project
        in the Plan module roadmap.
      </p>
    </div>
  );
}
