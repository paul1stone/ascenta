"use client";
import { useMemo, useState } from "react";
import { Input } from "@ascenta/ui/input";
import type { OrgNode } from "@ascenta/db/employees";

interface Props {
  roots: OrgNode[];
  onSelect: (id: string) => void;
}

function flatten(nodes: OrgNode[], out: OrgNode[] = []): OrgNode[] {
  for (const n of nodes) {
    out.push(n);
    flatten(n.children, out);
  }
  return out;
}

export function OrgChartSearch({ roots, onSelect }: Props) {
  const [q, setQ] = useState("");
  const all = useMemo(() => flatten(roots), [roots]);
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return all
      .filter(
        (n) =>
          n.name.toLowerCase().includes(t) ||
          n.jobTitle.toLowerCase().includes(t) ||
          n.department.toLowerCase().includes(t),
      )
      .slice(0, 10);
  }, [q, all]);

  return (
    <div className="relative w-72">
      <Input
        placeholder="Search by name, title, or dept..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {matches.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded shadow w-full mt-1">
          {matches.map((m) => (
            <li
              key={m.id}
              className="px-3 py-2 text-sm hover:bg-muted/40 cursor-pointer"
              onClick={() => {
                onSelect(m.id);
                setQ("");
              }}
            >
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-muted-foreground">
                {m.jobTitle} · {m.department}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
