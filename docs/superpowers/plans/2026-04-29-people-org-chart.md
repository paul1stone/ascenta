# People Org Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Org Chart tab placeholder on `plan/org-design` with an interactive d3 tree visualization. Click any node to open the existing `<EmployeeProfileCard mode="dialog" />`. Sub-project #4 of the Plan module roadmap.

**Architecture:** Server-built tree (`buildOrgTree`) returned via `GET /api/dashboard/org-tree`. Client renders d3-hierarchy + d3.tree() into SVG with `<foreignObject>` nodes that host React components for cleaner styling. Department filter dims; search centers on match.

**Spec:** `docs/superpowers/specs/2026-04-29-people-org-chart-design.md`
**Builds on:** sub-projects #1 (JD library + tabs), #2 (Focus Layer integrated into card), #3 (`<EmployeeProfileCard />`)

**Branch:** `feat/people-org-chart`. Confirm branch vs worktree.

**Pattern reference:** Same conventions as prior plans. d3 is new; this plan introduces minimal d3 code with comments explaining the API.

---

## Phase 1 — Tree Builder + API (Tasks 1–2)

### Task 1: `buildOrgTree` helper

**Files:**
- Modify: `packages/db/src/employees.ts`
- Create: `apps/platform/src/tests/build-org-tree.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/build-org-tree.test.ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { buildOrgTree } from "@ascenta/db/employees";

const baseEmp = (over: Partial<Record<string, unknown>>) => ({
  _id: { toString: () => over.id ?? "x" },
  id: over.id,
  employeeId: over.id,
  firstName: "F", lastName: "L",
  jobTitle: "T", department: "D",
  managerName: "",
  ...over,
});

describe("buildOrgTree", () => {
  it("returns empty roots for empty input", () => {
    const r = buildOrgTree([], []);
    expect(r.roots).toEqual([]);
    expect(r.totalEmployees).toBe(0);
  });

  it("builds linear chain CEO → Manager → IC", () => {
    const ceo = baseEmp({ id: "1", firstName: "Cee", lastName: "Eo", managerName: "" });
    const mgr = baseEmp({ id: "2", firstName: "Mary", lastName: "Manager", managerName: "Cee Eo" });
    const ic = baseEmp({ id: "3", firstName: "Ian", lastName: "Cee", managerName: "Mary Manager" });
    const r = buildOrgTree([ceo, mgr, ic], []);
    expect(r.roots).toHaveLength(1);
    expect(r.roots[0].name).toBe("Cee Eo");
    expect(r.roots[0].children).toHaveLength(1);
    expect(r.roots[0].children[0].children).toHaveLength(1);
    expect(r.resolvedEdges).toBe(2);
  });

  it("makes unresolved employees roots and lists them in unresolvedEmployees", () => {
    const a = baseEmp({ id: "1", firstName: "A", lastName: "One", managerName: "" });
    const orphan = baseEmp({ id: "2", firstName: "Or", lastName: "Phan", managerName: "Nobody Real" });
    const r = buildOrgTree([a, orphan], []);
    expect(r.roots.map((n) => n.name).sort()).toEqual(["A One", "Or Phan"]);
    expect(r.unresolvedEmployees).toContain("Or Phan");
  });

  it("groups unfilled JDs by department", () => {
    const r = buildOrgTree(
      [],
      [
        { id: "j1", title: "Eng", department: "Engineering", level: "senior", assignedCount: 0 },
        { id: "j2", title: "AE", department: "Sales", level: "mid", assignedCount: 0 },
        { id: "j3", title: "Filled", department: "Sales", level: "lead", assignedCount: 5 },
      ],
    );
    expect(r.unfilledRoles).toHaveLength(2);
    expect(r.unfilledRoles.find((c) => c.department === "Sales")?.roles).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/build-org-tree.test.ts`
Expected: FAIL — function not found.

- [ ] **Step 3: Implement**

Add to `packages/db/src/employees.ts`:

```ts
type EmpInput = {
  id?: string;
  _id?: { toString: () => string };
  employeeId?: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerName: string;
  jobDescriptionId?: string | null;
  profile?: { photoBase64?: string | null };
};

type JdInput = {
  id: string;
  title: string;
  department: string;
  level: string;
  assignedCount: number;
};

export interface OrgNode {
  id: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerId: string | null;
  photoBase64: string | null;
  jobDescriptionTitle: string | null;
  children: OrgNode[];
}

export interface UnfilledRoleCluster {
  department: string;
  roles: Array<{ jobDescriptionId: string; title: string; level: string }>;
}

export interface OrgTreeResponse {
  roots: OrgNode[];
  unfilledRoles: UnfilledRoleCluster[];
  totalEmployees: number;
  resolvedEdges: number;
  unresolvedEmployees: string[];
}

const idOf = (e: EmpInput) => e.id ?? (e._id ? e._id.toString() : "");
const fullName = (e: EmpInput) => `${e.firstName} ${e.lastName}`;
const norm = (s: string) => s.trim().toLowerCase();

export function buildOrgTree(
  employees: EmpInput[],
  jobDescriptions: JdInput[],
  jdTitleById: Map<string, string> = new Map(jobDescriptions.map((j) => [j.id, j.title])),
): OrgTreeResponse {
  const byName = new Map<string, EmpInput>();
  for (const e of employees) byName.set(norm(fullName(e)), e);

  const nodes = new Map<string, OrgNode>();
  for (const e of employees) {
    const id = idOf(e);
    nodes.set(id, {
      id,
      employeeId: e.employeeId ?? id,
      name: fullName(e),
      firstName: e.firstName,
      lastName: e.lastName,
      jobTitle: e.jobTitle,
      department: e.department,
      managerId: null,
      photoBase64: e.profile?.photoBase64 ?? null,
      jobDescriptionTitle: e.jobDescriptionId ? jdTitleById.get(String(e.jobDescriptionId)) ?? null : null,
      children: [],
    });
  }

  const unresolved: string[] = [];
  let resolvedEdges = 0;
  for (const e of employees) {
    const id = idOf(e);
    const mgrName = (e.managerName ?? "").trim();
    if (!mgrName) continue;
    const mgr = byName.get(norm(mgrName));
    if (!mgr) {
      unresolved.push(fullName(e));
      continue;
    }
    const mgrId = idOf(mgr);
    if (mgrId === id) continue; // self-reference; skip
    const node = nodes.get(id)!;
    node.managerId = mgrId;
    resolvedEdges++;
  }

  // Cycle detection: ensure following managerId chains terminates.
  for (const node of nodes.values()) {
    const seen = new Set<string>([node.id]);
    let cur = node.managerId ? nodes.get(node.managerId) : null;
    while (cur) {
      if (seen.has(cur.id)) {
        node.managerId = null;
        if (!unresolved.includes(node.name)) unresolved.push(node.name);
        break;
      }
      seen.add(cur.id);
      cur = cur.managerId ? nodes.get(cur.managerId) : null;
    }
  }

  for (const node of nodes.values()) {
    if (node.managerId) {
      const parent = nodes.get(node.managerId);
      if (parent) parent.children.push(node);
    }
  }
  for (const node of nodes.values()) {
    node.children.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }
  const roots = Array.from(nodes.values())
    .filter((n) => !n.managerId)
    .sort((a, b) => a.department.localeCompare(b.department) || a.lastName.localeCompare(b.lastName));

  const unfilledByDept = new Map<string, UnfilledRoleCluster>();
  for (const j of jobDescriptions) {
    if (j.assignedCount > 0) continue;
    if (!unfilledByDept.has(j.department)) {
      unfilledByDept.set(j.department, { department: j.department, roles: [] });
    }
    unfilledByDept.get(j.department)!.roles.push({
      jobDescriptionId: j.id,
      title: j.title,
      level: j.level,
    });
  }

  return {
    roots,
    unfilledRoles: Array.from(unfilledByDept.values()),
    totalEmployees: employees.length,
    resolvedEdges,
    unresolvedEmployees: unresolved,
  };
}
```

- [ ] **Step 4: Run tests, commit**

Run: `pnpm --filter @ascenta/platform exec vitest run src/tests/build-org-tree.test.ts`
Expected: PASS — 4 tests passing.

```bash
git add packages/db/src/employees.ts apps/platform/src/tests/build-org-tree.test.ts
git commit -m "feat(db): add buildOrgTree pure helper for org chart visualization"
```

---

### Task 2: `GET /api/dashboard/org-tree` endpoint

**Files:**
- Create: `apps/platform/src/app/api/dashboard/org-tree/route.ts`
- Create: `apps/platform/src/tests/api-org-tree.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// apps/platform/src/tests/api-org-tree.test.ts
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { GET } from "@/app/api/dashboard/org-tree/route";

const PREFIX = "ORG_TREE_API_";

async function makeEmp(suffix: string, managerName = "") {
  return Employee.create({
    employeeId: `${PREFIX}${suffix}`,
    firstName: suffix,
    lastName: "Test",
    email: `${PREFIX}${suffix}@x.com`,
    department: "Engineering",
    jobTitle: "Eng",
    managerName,
    hireDate: new Date(),
  });
}

describe("GET /api/dashboard/org-tree", () => {
  beforeAll(async () => connectDB());
  beforeEach(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
  });
  afterAll(async () => {
    await Employee.deleteMany({ employeeId: { $regex: `^${PREFIX}` } });
    await JobDescription.deleteMany({ title: { $regex: `^${PREFIX}` } });
    await mongoose.disconnect();
  });

  it("returns expected shape", async () => {
    await makeEmp("CEO");
    await makeEmp("IC", "CEO Test");
    const res = await GET(new Request("http://t") as never);
    const json = await res.json();
    expect(json).toHaveProperty("roots");
    expect(json).toHaveProperty("unfilledRoles");
    expect(json).toHaveProperty("totalEmployees");
    expect(json.totalEmployees).toBeGreaterThanOrEqual(2);
  });

  it("includes unfilled JDs", async () => {
    await JobDescription.create({
      title: `${PREFIX}Unfilled`,
      department: "Engineering",
      level: "senior",
      employmentType: "full_time",
      roleSummary: "Designs and builds production-grade systems for the company.",
      coreResponsibilities: ["Write code"],
      requiredQualifications: ["3+ years"],
      competencies: ["Ownership"],
      status: "published",
    });
    const res = await GET(new Request("http://t") as never);
    const json = await res.json();
    const eng = json.unfilledRoles.find((c: { department: string }) => c.department === "Engineering");
    expect(eng?.roles?.find((r: { title: string }) => r.title === `${PREFIX}Unfilled`)).toBeDefined();
  });
});
```

- [ ] **Step 2: Implement endpoint**

```ts
// apps/platform/src/app/api/dashboard/org-tree/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { listJobDescriptions } from "@ascenta/db/job-descriptions";
import { buildOrgTree } from "@ascenta/db/employees";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    const [employees, jdList] = await Promise.all([
      Employee.find({ status: "active" }).lean(),
      listJobDescriptions({ status: "all", limit: 200 }),
    ]);

    const empInputs = employees.map((e: Record<string, unknown>) => ({
      id: String(e._id),
      employeeId: String(e.employeeId ?? e._id),
      firstName: String(e.firstName ?? ""),
      lastName: String(e.lastName ?? ""),
      jobTitle: String(e.jobTitle ?? ""),
      department: String(e.department ?? ""),
      managerName: String(e.managerName ?? ""),
      jobDescriptionId: e.jobDescriptionId ? String(e.jobDescriptionId) : null,
      profile: { photoBase64: (e as { profile?: { photoBase64?: string | null } })?.profile?.photoBase64 ?? null },
    }));

    const jdInputs = jdList.items.map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department,
      level: j.level,
      assignedCount: j.assignedCount,
    }));

    const tree = buildOrgTree(empInputs, jdInputs);
    const res = NextResponse.json(tree);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Run tests, commit**

```bash
git add apps/platform/src/app/api/dashboard/org-tree/route.ts \
  apps/platform/src/tests/api-org-tree.test.ts
git commit -m "feat(api): GET /api/dashboard/org-tree returning resolved tree + unfilled JD clusters"
```

---

## Phase 2 — Chart Components (Tasks 3–6)

### Task 3: OrgChartNode (single-node renderer)

**Files:**
- Create: `apps/platform/src/components/plan/org-chart/org-chart-node.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";

interface NodeProps {
  node: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    jobDescriptionTitle: string | null;
    department: string;
    photoBase64: string | null;
  };
  dimmed: boolean;
  highlighted: boolean;
  showPhoto: boolean;
  onClick: () => void;
}

function deptColor(department: string): string {
  // Match the closest existing nav category. Fall back to muted.
  const known: Record<string, string> = {
    Engineering: "#6688bb",
    Product: "#6688bb",
    People: "#44aa99",
    Sales: "#aa8866",
    Operations: "#bb6688",
  };
  return known[department] ?? "#94a3b8";
}

export function OrgChartNode({ node, dimmed, highlighted, showPhoto, onClick }: NodeProps) {
  const initials = `${node.firstName[0] ?? ""}${node.lastName[0] ?? ""}`;
  const color = deptColor(node.department);
  return (
    <div
      onClick={onClick}
      style={{
        opacity: dimmed ? 0.3 : 1,
        boxShadow: highlighted ? `0 0 0 2px ${color}` : "0 1px 2px rgba(0,0,0,0.06)",
        borderLeft: `3px solid ${color}`,
      }}
      className="cursor-pointer bg-white rounded-md border h-full px-2 py-1 flex items-center gap-2"
    >
      <div className="size-7 rounded-full bg-muted/40 grid place-items-center text-[10px] font-semibold overflow-hidden flex-shrink-0">
        {showPhoto && node.photoBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.photoBase64} alt="" className="size-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{node.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {node.jobDescriptionTitle ?? node.jobTitle}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type check, commit**

```bash
git add apps/platform/src/components/plan/org-chart/org-chart-node.tsx
git commit -m "feat(plan): OrgChartNode card component"
```

---

### Task 4: OrgChartCanvas (d3 layout + SVG render)

**Files:**
- Create: `apps/platform/src/components/plan/org-chart/org-chart-canvas.tsx`
- Create: `apps/platform/src/tests/org-chart-canvas.test.tsx`

- [ ] **Step 1: Write failing render smoke test**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OrgChartCanvas } from "@/components/plan/org-chart/org-chart-canvas";

const sample = {
  roots: [
    {
      id: "1", employeeId: "E1", name: "A One", firstName: "A", lastName: "One",
      jobTitle: "CEO", jobDescriptionTitle: null, department: "Operations",
      managerId: null, photoBase64: null, children: [
        { id: "2", employeeId: "E2", name: "B Two", firstName: "B", lastName: "Two",
          jobTitle: "Eng", jobDescriptionTitle: null, department: "Engineering",
          managerId: "1", photoBase64: null, children: [] },
      ],
    },
  ],
};

describe("OrgChartCanvas", () => {
  it("renders one foreignObject per node", () => {
    const { container } = render(
      <OrgChartCanvas
        roots={sample.roots as never}
        selectedDepartments={new Set()}
        highlightedNodeId={null}
        onNodeClick={() => {}}
      />,
    );
    const fos = container.querySelectorAll("foreignObject");
    expect(fos.length).toBe(2);
  });
});
```

- [ ] **Step 2: Implement**

```tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { OrgChartNode } from "./org-chart-node";
import type { OrgNode } from "@ascenta/db/employees";

interface Props {
  roots: OrgNode[];
  selectedDepartments: Set<string>;
  highlightedNodeId: string | null;
  onNodeClick: (id: string) => void;
}

function withVirtualRoot(roots: OrgNode[]): OrgNode {
  return {
    id: "__virtual_root__",
    employeeId: "",
    name: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    department: "",
    managerId: null,
    photoBase64: null,
    jobDescriptionTitle: null,
    children: roots,
  };
}

export function OrgChartCanvas({ roots, selectedDepartments, highlightedNodeId, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const [t, setT] = useState({ x: 0, y: 0, k: 1 });

  const layout = useMemo(() => {
    if (!roots.length) return { nodes: [], links: [] };
    const root = d3.hierarchy(withVirtualRoot(roots));
    d3.tree<OrgNode>().nodeSize([180, 110])(root);
    const nodes = root.descendants().filter((n) => n.data.id !== "__virtual_root__");
    const links = root.links().filter((l) => l.source.data.id !== "__virtual_root__");
    return { nodes, links };
  }, [roots]);

  useEffect(() => {
    if (!svgRef.current) return;
    const sel = d3.select(svgRef.current);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (e) => setT({ x: e.transform.x, y: e.transform.y, k: e.transform.k }));
    sel.call(zoom);
    // Set initial centering: shift so the tree is roughly centered horizontally.
    const width = svgRef.current.clientWidth;
    sel.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 60).scale(0.9));
  }, []);

  // Highlight: animate transform to center the highlighted node.
  useEffect(() => {
    if (!highlightedNodeId || !svgRef.current) return;
    const target = layout.nodes.find((n) => n.data.id === highlightedNodeId);
    if (!target) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const next = d3.zoomIdentity.translate(width / 2 - target.x, height / 2 - target.y).scale(1);
    d3.select(svgRef.current).transition().duration(500).call(
      d3.zoom<SVGSVGElement, unknown>().transform as never,
      next,
    );
    setT({ x: next.x, y: next.y, k: next.k });
  }, [highlightedNodeId, layout.nodes]);

  const linkGen = d3
    .linkVertical<unknown, { source: { x: number; y: number }; target: { x: number; y: number } }>()
    .source((d) => ({ x: d.source.x, y: d.source.y }))
    .target((d) => ({ x: d.target.x, y: d.target.y }))
    .x((p) => p.x)
    .y((p) => p.y);

  return (
    <svg ref={svgRef} className="w-full h-[600px] bg-muted/10 rounded-lg">
      <g ref={gRef} transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
        {layout.links.map((l) => (
          <path
            key={`${l.source.data.id}-${l.target.data.id}`}
            d={linkGen(l as never) ?? ""}
            stroke="#cbd5e1"
            fill="none"
          />
        ))}
        {layout.nodes.map((n) => (
          <foreignObject key={n.data.id} x={n.x - 80} y={n.y - 22} width={160} height={44}>
            <OrgChartNode
              node={n.data}
              dimmed={selectedDepartments.size > 0 && !selectedDepartments.has(n.data.department)}
              highlighted={n.data.id === highlightedNodeId}
              showPhoto={t.k >= 1.0}
              onClick={() => onNodeClick(n.data.id)}
            />
          </foreignObject>
        ))}
      </g>
    </svg>
  );
}
```

- [ ] **Step 3: Run tests, commit**

```bash
git add apps/platform/src/components/plan/org-chart/org-chart-canvas.tsx \
  apps/platform/src/tests/org-chart-canvas.test.tsx
git commit -m "feat(plan): OrgChartCanvas with d3 tree layout and zoom/pan"
```

---

### Task 5: Search + filters + unfilled cluster + empty state

**Files:**
- Create: `apps/platform/src/components/plan/org-chart/org-chart-search.tsx`
- Create: `apps/platform/src/components/plan/org-chart/org-chart-filters.tsx`
- Create: `apps/platform/src/components/plan/org-chart/unfilled-role-cluster.tsx`
- Create: `apps/platform/src/components/plan/org-chart/org-chart-empty-state.tsx`

- [ ] **Step 1: OrgChartSearch**

```tsx
"use client";
import { useMemo, useState } from "react";
import { Input } from "@ascenta/ui/components/input";
import type { OrgNode } from "@ascenta/db/employees";

interface Props {
  roots: OrgNode[];
  onSelect: (id: string) => void;
}

function flatten(nodes: OrgNode[], out: OrgNode[] = []): OrgNode[] {
  for (const n of nodes) { out.push(n); flatten(n.children, out); }
  return out;
}

export function OrgChartSearch({ roots, onSelect }: Props) {
  const [q, setQ] = useState("");
  const all = useMemo(() => flatten(roots), [roots]);
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return all
      .filter((n) =>
        n.name.toLowerCase().includes(t) ||
        n.jobTitle.toLowerCase().includes(t) ||
        n.department.toLowerCase().includes(t),
      )
      .slice(0, 10);
  }, [q, all]);

  return (
    <div className="relative w-72">
      <Input placeholder="Search by name, title, or dept..." value={q} onChange={(e) => setQ(e.target.value)} />
      {matches.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded shadow w-full mt-1">
          {matches.map((m) => (
            <li
              key={m.id}
              className="px-3 py-2 text-sm hover:bg-muted/40 cursor-pointer"
              onClick={() => { onSelect(m.id); setQ(""); }}
            >
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.jobTitle} · {m.department}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: OrgChartFilters**

```tsx
"use client";
import { Badge } from "@ascenta/ui/components/badge";

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
        <button className="text-xs text-muted-foreground underline" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: UnfilledRoleCluster**

```tsx
"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { UnfilledRoleCluster as Cluster } from "@ascenta/db/employees";

interface Props { clusters: Cluster[]; }

export function UnfilledRoleCluster({ clusters }: Props) {
  const [open, setOpen] = useState(false);
  const total = clusters.reduce((acc, c) => acc + c.roles.length, 0);
  if (total === 0) return null;
  return (
    <div className="rounded border p-3 bg-muted/20">
      <button onClick={() => setOpen((s) => !s)} className="flex items-center gap-2 text-sm font-medium">
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
                  <li key={r.jobDescriptionId}>{r.title} <span className="text-xs text-muted-foreground">({r.level})</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: OrgChartEmptyState**

```tsx
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
```

- [ ] **Step 5: Type check, commit**

```bash
git add apps/platform/src/components/plan/org-chart/org-chart-search.tsx \
  apps/platform/src/components/plan/org-chart/org-chart-filters.tsx \
  apps/platform/src/components/plan/org-chart/unfilled-role-cluster.tsx \
  apps/platform/src/components/plan/org-chart/org-chart-empty-state.tsx
git commit -m "feat(plan): org chart search, department filters, unfilled cluster, empty state"
```

---

### Task 6: OrgChartView (top-level wrapper)

**Files:**
- Create: `apps/platform/src/components/plan/org-chart/org-chart-view.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@ascenta/ui/components/dialog";
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
    const set = new Set<string>();
    function walk(ns: typeof data.roots) {
      for (const n of ns) {
        if (n.department) set.add(n.department);
        walk(n.children);
      }
    }
    walk(data.roots);
    for (const c of data.unfilledRoles) set.add(c.department);
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
          {data.unresolvedEmployees.length} employee{data.unresolvedEmployees.length === 1 ? "" : "s"} have a manager name we couldn't match — shown as roots.
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
```

- [ ] **Step 2: Type check, commit**

```bash
git add apps/platform/src/components/plan/org-chart/org-chart-view.tsx
git commit -m "feat(plan): OrgChartView combining filter, search, canvas, and profile dialog"
```

---

## Phase 3 — Wire into the existing tab (Task 7)

### Task 7: Replace the placeholder

**Files:**
- Modify: `apps/platform/src/components/plan/org-design-tabs.tsx`

- [ ] **Step 1: Swap the placeholder for the real chart**

```tsx
"use client";
import { LibraryView } from "./job-descriptions/library-view";
import { OrgChartView } from "./org-chart/org-chart-view";

interface OrgDesignTabsProps { activeTab: string; }

export function OrgDesignTabs({ activeTab }: OrgDesignTabsProps) {
  if (activeTab === "job-descriptions") return <LibraryView />;
  if (activeTab === "org-chart") return <OrgChartView />;
  return null;
}
```

The previously-shipped `<OrgDesignEmptyTab />` becomes unused — leave it in the file system for now but unreferenced. (Optional cleanup task: delete the file once the new chart ships.)

- [ ] **Step 2: Run lint, type check, tests, smoke test**

```bash
pnpm lint
pnpm --filter @ascenta/platform exec tsc --noEmit
pnpm test
pnpm --filter @ascenta/platform dev
```

Open `http://localhost:3051/plan/org-design`, click `Org Chart` tab. Expected: tree renders with seeded employees. Click any node → profile dialog opens with the existing `<EmployeeProfileCard />`. Pan/zoom works. Search highlights and centers a node. Department filter dims non-selected.

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/plan/org-design-tabs.tsx
git commit -m "feat(plan): wire OrgChartView into the Org Chart tab on plan/org-design"
```

---

## Definition of Done

- [ ] All 7 tasks committed
- [ ] `pnpm lint && pnpm test && pnpm build` pass
- [ ] Manual smoke covers: render, pan/zoom, search highlight, filter dim, click → profile card, unfilled-roles cluster, empty state
- [ ] Spec compliance check
- [ ] PR opened via `gh-pr-main`

## Notes for the Implementer

- **d3 imports**: Use `import * as d3 from "d3"` (already a dependency). The package exports zoom, hierarchy, tree, and linkVertical we use here.
- **`<foreignObject>` quirks**: nodes may render slightly off in some browsers due to width/height attributes — pinned in this spec at 160×44 to match the OrgChartNode's expected size.
- **Performance ceiling**: builds clean for ≤500 employees. If we hit slowness, switch to canvas rendering (out of scope).
- **Cycle handling**: `buildOrgTree` already breaks cycles; chart renders affected employees as roots with a warning banner.
- **`profile.photoBase64` field**: depends on sub-project #3 having shipped. If not, photos render as initials only — the chart still works.
