# People Org Chart — Design Spec

**Date:** 2026-04-29
**Status:** Draft
**Module:** Plan / Organizational Design
**Source reqs:** `Plan Mark down.md` § 1B — People Org Chart
**Position in chain:** Sub-project #4 of 6 in the Plan module roadmap.
**Builds on:** sub-projects #1 (JD library + `Employee.jobDescriptionId`), #2 (Focus Layer), #3 (`<EmployeeProfileCard />`)

---

## Context

The Plan reqs frame the org chart as "a living representation of the people inside the organization" — each node a person, not just a position. The visual is the entry point; clicking a node opens the full profile card from sub-project #3, which already nests Focus Layer summary and Get to Know fields. This sub-project ships the visualization layer.

The `Org Chart` tab on `plan/org-design` already exists (placeholder shipped in sub-project #1). This spec replaces the placeholder with a real interactive chart.

---

## V1 Scope

In scope:

- Top-down tree visualization derived from `Employee.managerName` strings
- d3-hierarchy + d3-tree layout, plain SVG render (d3 7.9.0 already installed)
- Each node shows: photo (or initials), name, title, department accent
- Clicking a node opens `<EmployeeProfileCard mode="dialog" />` (already built in sub-project #3)
- Search bar that highlights and centers a matching node
- Department filter (chips) — selected departments stay full opacity, others dim to 30%
- Zoom + pan via d3 zoom behavior
- Open positions: unfilled JDs (those with `assignedCount === 0`) render as ghost nodes attached to their department cluster (NOT inserted in the reporting tree)
- Empty-state when fewer than 2 employees exist
- Replaces the placeholder in the existing `plan/org-design` Org Chart tab

Out of scope:

- Editing reporting structure from the chart
- Multi-org / matrix structures
- Exporting the chart as an image
- Real-time updates (chart fetches once on tab activation)
- Detail-level photos in chart at low zoom (photos render only when zoom ≥ 1.0; below that, initials only)

---

## Architecture

### Approach: Server-built tree + d3 client render

A new `GET /api/dashboard/org-tree` endpoint walks employees server-side and returns:
- A `roots: TreeNode[]` array (multiple roots possible — anyone whose `managerName` doesn't match an existing employee becomes a root)
- An `unfilledRoles` array — JDs with `assignedCount === 0`, grouped by department

Client renders with d3-hierarchy + d3.tree(), plain SVG. No React-flow / vis lib. Layout recomputed on data change; pan/zoom via d3.zoom transform composed with the SVG `<g>`.

Why server-built: the manager-name resolution is fuzzy (string matching). Building once on the server avoids re-running it in every browser. The client gets a pre-resolved tree.

Why d3 raw vs a wrapper library: the reqs don't demand fancy interactions; d3 hierarchy + zoom is ~50 lines and fits the codebase's "minimal dependencies" posture. We can swap to ReactFlow later if interactions get heavier.

### File layout

```
packages/db/src/
└── employees.ts                       MODIFIED — add buildOrgTree() helper

apps/platform/src/
├── app/api/dashboard/org-tree/
│   └── route.ts                       NEW — GET org tree
├── components/plan/org-chart/
│   ├── org-chart-view.tsx             NEW — top-level: filter bar, search, chart
│   ├── org-chart-canvas.tsx           NEW — d3 SVG render
│   ├── org-chart-node.tsx             NEW — renders a single node
│   ├── org-chart-search.tsx           NEW — search input
│   ├── org-chart-filters.tsx          NEW — department chips
│   ├── unfilled-role-cluster.tsx      NEW — ghost-node section
│   └── org-chart-empty-state.tsx      NEW — < 2 employees state
└── components/plan/org-design-tabs.tsx MODIFIED — replace OrgDesignEmptyTab → <OrgChartView />

apps/platform/src/tests/
├── build-org-tree.test.ts             NEW — tree builder unit tests
├── api-org-tree.test.ts               NEW — endpoint tests
└── org-chart-canvas.test.tsx          NEW — render smoke tests (no d3 layout assertions)
```

---

## Data Model

No new persisted schema. The org tree is computed at request time.

### Tree node shape (returned from API)

```ts
interface OrgNode {
  id: string;                 // employee id
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerId: string | null;   // resolved
  photoBase64: string | null; // from profile.photoBase64
  jobDescriptionTitle: string | null; // from JobDescription.title (preferred over jobTitle)
  children: OrgNode[];
}

interface UnfilledRoleCluster {
  department: string;
  roles: Array<{
    jobDescriptionId: string;
    title: string;
    level: string;
  }>;
}

interface OrgTreeResponse {
  roots: OrgNode[];
  unfilledRoles: UnfilledRoleCluster[];
  totalEmployees: number;
  resolvedEdges: number;          // # employees with managerName matched to a real employee
  unresolvedEmployees: string[];  // names of employees whose managerName didn't match
}
```

### Tree building algorithm

`packages/db/src/employees.ts` adds `buildOrgTree(employees, jobDescriptions)`:

1. Build a map of `managerName.toLowerCase().trim()` → `employee` (use full name "First Last" as key; fall back to last-name match for ambiguous cases).
2. For each employee, resolve `managerId` by lookup. If unresolved or empty managerName → root.
3. Build adjacency list `parentId → children[]`. Sort children by lastName.
4. Roots are the employees with `managerId === null`. Sort roots by department then lastName.
5. Walk roots into nested OrgNode trees.
6. Unfilled roles: from `jobDescriptions`, filter where `assignedCount === 0`, group by department.
7. Return the response object.

This is a pure function (no DB), tested in unit isolation.

---

## API

### `GET /api/dashboard/org-tree`

No query params for v1. Always returns the full tree.

```ts
{ roots, unfilledRoles, totalEmployees, resolvedEdges, unresolvedEmployees }
```

500 on Mongo error. Otherwise always 200 (even empty tree returns `{ roots: [] }`).

Caching: Next.js `route.ts` returns `Cache-Control: no-store` since employees change frequently and the tree is computed fast enough to skip caching for v1.

---

## UI / Components

### `<OrgChartView />`

Layout:

```
[Header bar: Search input | Department filter chips]
[Open Positions row (collapsed by default if any)]
[Chart canvas (zoom/pan SVG)]
[Empty state if totalEmployees < 2]
```

Loads `/api/dashboard/org-tree` on mount. Renders:

- `<OrgChartSearch />` calls a callback that focuses (centers + highlights) a node
- `<OrgChartFilters />` — chip per department, click toggles
- `<UnfilledRoleCluster />` — collapsible row above the chart
- `<OrgChartCanvas />` — the SVG/d3 visualization
- `<OrgChartEmptyState />` if no employees

### `<OrgChartCanvas />`

Props: `roots: OrgNode[]`, `selectedDepartments: Set<string>`, `highlightedNodeId: string | null`, `onNodeClick: (id: string) => void`.

Implementation:

- A wrapping `<svg>` with `<g class="zoom">` inside that gets the d3.zoom transform applied.
- d3.hierarchy(synthetic root containing all roots) → d3.tree().nodeSize([180, 120]).
- Each laid-out node is rendered as a `<foreignObject>` so the React `<OrgChartNode>` component can use HTML/CSS (cleaner than pure SVG text wrap).
- Edges rendered as `<path>` with d3.linkVertical().
- d3.zoom attached to the outer `<svg>`; transform held in React state and applied to `<g>`.

```tsx
function OrgChartCanvas({ roots, selectedDepartments, highlightedNodeId, onNodeClick }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 1 });
  const layout = useMemo(() => buildLayout(roots), [roots]);

  useEffect(() => {
    if (!svgRef.current) return;
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (e) => setTransform({ x: e.transform.x, y: e.transform.y, k: e.transform.k }));
    d3.select(svgRef.current).call(zoom);
  }, []);

  // Highlight: when highlightedNodeId changes, animate transform to center it (handled in a separate effect).

  return (
    <svg ref={svgRef} className="w-full h-[600px]">
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
        {layout.links.map((l) => <path key={`${l.source.data.id}-${l.target.data.id}`} d={linkPath(l)} stroke="#cbd5e1" fill="none" />)}
        {layout.nodes.map((n) => (
          <foreignObject
            key={n.data.id}
            x={n.x - 80} y={n.y - 32}
            width={160} height={64}
          >
            <OrgChartNode
              node={n.data}
              dimmed={selectedDepartments.size > 0 && !selectedDepartments.has(n.data.department)}
              highlighted={n.data.id === highlightedNodeId}
              showPhoto={transform.k >= 1.0}
              onClick={() => onNodeClick(n.data.id)}
            />
          </foreignObject>
        ))}
      </g>
    </svg>
  );
}
```

`buildLayout` synthesizes a virtual root if multiple roots exist (for d3.hierarchy), then strips it back out before mapping.

### `<OrgChartNode />`

Compact card:

```
[avatar] Jane Doe
         Senior Engineer · Engineering
```

Photo from `node.photoBase64` (rendered when `showPhoto` is true; otherwise initials). Department-color border-left: looks up `dashboard-nav.ts` accent colors. On click, calls `onClick(node.id)` which the parent uses to set state that opens `<EmployeeProfileCard mode="dialog" />` keyed on the chosen employee.

Dim styling when `dimmed`: opacity 30%, no hover. Highlight: 2px ring in the accent color, slight scale.

### `<OrgChartSearch />`

Input box with autocomplete (datalist or shadcn Combobox). Matches against `name`, `jobTitle`, `department`. Selecting an entry calls `onSelect(employeeId)`. The parent updates `highlightedNodeId` and `<OrgChartCanvas />` animates the transform to center on it.

### `<OrgChartFilters />`

Chips for each unique department. Click toggles selection. "Clear filters" link when any are active.

### `<UnfilledRoleCluster />`

Collapsible row above the chart:

```
[▶] 3 Open Positions
    └─ Engineering: Staff Software Engineer (senior)
    └─ Product: Product Manager (mid)
    └─ Sales: Account Executive (mid)
```

Each row clickable to open the JD detail (links to `plan/org-design?tab=job-descriptions&id=<jdId>` — but since the JD library uses the dialog/sheet, link to the library and let HR navigate manually for v1).

### `<OrgChartEmptyState />`

When `totalEmployees < 2`: centered message "Add at least two employees with reporting relationships to see the org chart."

When `unresolvedEmployees.length > 0`: warning banner above the chart: "{N} employees have a manager name we couldn't match — they're shown as roots." Clicking expands to the list.

---

## Layout decisions

- Top-down tree, sibling separation via `nodeSize([180, 120])` (180px between sibling x, 120px depth).
- Initial transform centers the largest root cluster.
- Chart container has fixed height (e.g., `h-[600px]`); horizontal pan handles wide trees.
- Chart-level scrollbars disabled — pan/zoom only.

---

## Tests

`build-org-tree.test.ts`:
- empty input → empty roots
- linear chain (CEO → Manager → IC) builds 1 root with 1 child with 1 child
- unresolved managerName → that employee becomes a root, included in unresolvedEmployees
- unfilled JDs grouped by department

`api-org-tree.test.ts`:
- GET returns expected shape
- totalEmployees and resolvedEdges are accurate
- unfilled roles filtered to those with no assignment

`org-chart-canvas.test.tsx`:
- Smoke: renders the right number of `<foreignObject>` for given input
- Skip d3 layout math assertions; trust d3's correctness, test the integration shape only

---

## Performance

For the demo seed (~50 employees), layout runs in <50ms. If a real org has ~500 employees, layout is still <200ms. Above 500, consider switching to virtualization or paginated tree rendering — out of scope for v1.

---

## Edge Cases

- **Cycle in managerName mapping** (employee A reports to B, B reports to A) → BFS-based resolution: when assigning children, skip an employee if it would create a cycle. Log to unresolvedEmployees.
- **Employee with empty managerName** → root.
- **Multiple employees match the same managerName string** → first match wins (alphabetical by id). Document as known limitation; auth context's name-resolution has the same quirk.
- **Zero employees** → empty state.
- **One employee** → empty state ("at least 2"). Could relax to show one node, but without edges it's not meaningful.
- **Photo render with very tall SVGs** → `<foreignObject>` clipping handled by `width`/`height` attrs; overflow hidden.

---

## Out of Scope (Explicit)

- Drag-to-reassign reporting structure
- Custom org units / matrix structures
- Export to PNG / PDF (sub-project #5 handles personalized PDFs only)
- Animated transitions on data change
- Multi-tenant org scoping (single-org assumption holds)
- WebGL / canvas rendering for very large orgs
