"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@ascenta/ui/dialog";
import { EmployeeProfileCard } from "@/components/plan/profile/employee-profile-card";
import type { OrgTreeResponse } from "@ascenta/db/employees";
import { OrgChartCanvas } from "./org-chart-canvas";
import { OrgChartSearch } from "./org-chart-search";
import { OrgChartFilters } from "./org-chart-filters";
import { UnfilledRoleCluster } from "./unfilled-role-cluster";
import { OrgChartEmptyState } from "./org-chart-empty-state";

export function OrgChartView() {
  const [data, setData] = useState<OrgTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [profileEmployeeId, setProfileEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/org-tree")
      .then((r) => r.json())
      .then((j) => setData(j))
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(() => {
    if (!data) return [];
    const tree = data;
    const set = new Set<string>();
    function walk(ns: typeof tree.roots) {
      for (const n of ns) {
        if (n.department) set.add(n.department);
        walk(n.children);
      }
    }
    walk(tree.roots);
    for (const c of tree.unfilledRoles) set.add(c.department);
    return Array.from(set).sort();
  }, [data]);

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Loading org chart...</p>;
  if (!data || data.totalEmployees < 2) return <OrgChartEmptyState />;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-display font-bold">Org Chart</h2>
        <OrgChartSearch roots={data.roots} onSelect={setHighlighted} />
      </header>
      <OrgChartFilters
        departments={departments}
        selected={selected}
        onToggle={(d) =>
          setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(d)) next.delete(d);
            else next.add(d);
            return next;
          })
        }
        onClear={() => setSelected(new Set())}
      />
      {data.unresolvedEmployees.length > 0 && (
        <p className="rounded border border-amber-300 bg-amber-50 text-amber-900 p-3 text-xs">
          {data.unresolvedEmployees.length} employee
          {data.unresolvedEmployees.length === 1 ? "" : "s"} have a manager name we
          couldn&apos;t match — shown as roots.
        </p>
      )}
      <UnfilledRoleCluster clusters={data.unfilledRoles} />
      <OrgChartCanvas
        roots={data.roots}
        selectedDepartments={selected}
        highlightedNodeId={highlighted}
        onNodeClick={setProfileEmployeeId}
      />
      <Dialog
        open={!!profileEmployeeId}
        onOpenChange={(open) => !open && setProfileEmployeeId(null)}
      >
        <DialogContent className="max-w-2xl">
          {profileEmployeeId && (
            <EmployeeProfileCard employeeId={profileEmployeeId} mode="inline" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
