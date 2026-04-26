"use client";
import { useEffect, useMemo, useState } from "react";
import { Crosshair, Locate } from "lucide-react";
import { Dialog, DialogContent } from "@ascenta/ui/dialog";
import { Button } from "@ascenta/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { EmployeeProfileCard } from "@/components/plan/profile/employee-profile-card";
import {
  buildOrgNeighborhood,
  type OrgNode,
  type OrgTreeResponse,
} from "@ascenta/db/employees";
import { OrgChartCanvas } from "./org-chart-canvas";
import { OrgChartSearch } from "./org-chart-search";
import { OrgChartFilters } from "./org-chart-filters";
import { UnfilledRoleCluster } from "./unfilled-role-cluster";
import { OrgChartEmptyState } from "./org-chart-empty-state";

type ViewMode = "neighborhood" | "full";

function findNode(roots: OrgNode[], id: string): OrgNode | null {
  for (const n of roots) {
    if (n.id === id) return n;
    const hit = findNode(n.children, id);
    if (hit) return hit;
  }
  return null;
}

export function OrgChartView() {
  const { user } = useAuth();
  const [data, setData] = useState<OrgTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focalId, setFocalId] = useState<string | null>(null);
  const [profileEmployeeId, setProfileEmployeeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("neighborhood");

  useEffect(() => {
    fetch("/api/dashboard/org-tree")
      .then((r) => r.json())
      .then((j) => setData(j))
      .finally(() => setLoading(false));
  }, []);

  // Default focal = current user once both load; fall back to the first
  // root when no persona is picked, so Neighborhood mode always has a
  // target instead of silently rendering the full tree.
  useEffect(() => {
    if (!data || focalId) return;
    if (user) {
      const inTree = findNode(data.roots, user.id);
      if (inTree) {
        setFocalId(user.id);
        return;
      }
    }
    if (data.roots[0]) setFocalId(data.roots[0].id);
  }, [user, data, focalId]);

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

  const focalNode = useMemo(
    () => (data && focalId ? findNode(data.roots, focalId) : null),
    [data, focalId],
  );

  const visibleRoots = useMemo(() => {
    if (!data) return [];
    if (viewMode === "full" || !focalId) return data.roots;
    return buildOrgNeighborhood(data.roots, focalId);
  }, [data, focalId, viewMode]);

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Loading org chart...</p>;
  if (!data || data.totalEmployees < 2) return <OrgChartEmptyState />;

  const isViewingSelf = user && focalId === user.id;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-display font-bold">Org Chart</h2>
          {focalNode && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs">
              <Crosshair className="size-3" />
              Viewing: <strong className="font-semibold">{focalNode.name}</strong>
              {isViewingSelf && <span className="text-muted-foreground">(you)</span>}
            </span>
          )}
          {user && !isViewingSelf && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setFocalId(user.id)}
            >
              <Locate className="size-3" />
              Center on me
            </Button>
          )}
          <div className="ml-2 inline-flex rounded-md border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("neighborhood")}
              className={
                "rounded px-2 py-0.5 " +
                (viewMode === "neighborhood"
                  ? "bg-white shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              Neighborhood
            </button>
            <button
              type="button"
              onClick={() => setViewMode("full")}
              className={
                "rounded px-2 py-0.5 " +
                (viewMode === "full"
                  ? "bg-white shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              Full org
            </button>
          </div>
        </div>
        <OrgChartSearch roots={data.roots} onSelect={setFocalId} />
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
        roots={visibleRoots}
        selectedDepartments={selected}
        highlightedNodeId={focalId}
        onNodeClick={setProfileEmployeeId}
      />
      <Dialog
        open={!!profileEmployeeId}
        onOpenChange={(open) => !open && setProfileEmployeeId(null)}
      >
        <DialogContent className="max-w-2xl">
          {profileEmployeeId && (
            <>
              <EmployeeProfileCard employeeId={profileEmployeeId} mode="inline" />
              <div className="mt-4 flex justify-end border-t pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setFocalId(profileEmployeeId);
                    setProfileEmployeeId(null);
                  }}
                >
                  <Crosshair className="size-4" />
                  Show in org chart
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
