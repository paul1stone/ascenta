"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { UnfilledRoleCluster as Cluster } from "@ascenta/db/employees";

interface Props {
  clusters: Cluster[];
}

export function UnfilledRoleCluster({ clusters }: Props) {
  const [open, setOpen] = useState(false);
  const total = clusters.reduce((acc, c) => acc + c.roles.length, 0);
  if (total === 0) return null;
  return (
    <div className="rounded border p-3 bg-muted/20">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 text-sm font-medium"
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        {total} Open Position{total === 1 ? "" : "s"}
      </button>
      {open && (
        <div className="mt-2 space-y-2 text-sm">
          {clusters.map((c) => (
            <div key={c.department}>
              <p className="text-xs font-semibold text-muted-foreground">{c.department}</p>
              <ul className="list-disc pl-5">
                {c.roles.map((r) => (
                  <li key={r.jobDescriptionId}>
                    {r.title}{" "}
                    <span className="text-xs text-muted-foreground">({r.level})</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
