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

export function OrgChartCanvas({
  roots,
  selectedDepartments,
  highlightedNodeId,
  onNodeClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const [t, setT] = useState({ x: 0, y: 0, k: 1 });

  const layout = useMemo(() => {
    if (!roots.length) return { nodes: [], links: [] };
    const root = d3.hierarchy(withVirtualRoot(roots));
    d3.tree<OrgNode>().nodeSize([180, 110])(root);
    const nodes = root
      .descendants()
      .filter((n) => n.data.id !== "__virtual_root__");
    const links = root
      .links()
      .filter((l) => l.source.data.id !== "__virtual_root__");
    return { nodes, links };
  }, [roots]);

  useEffect(() => {
    if (!svgRef.current) return;
    const sel = d3.select(svgRef.current);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (e) =>
        setT({ x: e.transform.x, y: e.transform.y, k: e.transform.k }),
      );
    sel.call(zoom);
    // jsdom returns 0 for clientWidth and chokes on SVG transform mutation.
    const width = svgRef.current.clientWidth;
    if (width > 0) {
      sel.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 60).scale(0.9));
    }
  }, []);

  useEffect(() => {
    if (!highlightedNodeId || !svgRef.current) return;
    const target = layout.nodes.find((n) => n.data.id === highlightedNodeId);
    if (!target) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const tx = target.x ?? 0;
    const ty = target.y ?? 0;
    const next = d3.zoomIdentity
      .translate(width / 2 - tx, height / 2 - ty)
      .scale(1);
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as never,
        next,
      );
    setT({ x: next.x, y: next.y, k: next.k });
  }, [highlightedNodeId, layout.nodes]);

  type Pt = { x: number; y: number };
  const linkGen = d3
    .linkVertical<d3.HierarchyPointLink<OrgNode>, Pt>()
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
            d={linkGen(l as d3.HierarchyPointLink<OrgNode>) ?? ""}
            stroke="#cbd5e1"
            fill="none"
          />
        ))}
        {layout.nodes.map((n) => (
          <foreignObject
            key={n.data.id}
            x={(n.x ?? 0) - 80}
            y={(n.y ?? 0) - 22}
            width={160}
            height={44}
          >
            <OrgChartNode
              node={n.data}
              dimmed={
                selectedDepartments.size > 0 &&
                !selectedDepartments.has(n.data.department)
              }
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
