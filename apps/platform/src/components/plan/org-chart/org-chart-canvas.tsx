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

const CARD_W = 160;
const CARD_H = 44;
const FIT_PADDING = 48;
const MAX_FIT_SCALE = 1.1;

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
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [t, setT] = useState({ x: 0, y: 0, k: 1 });

  const layout = useMemo(() => {
    if (!roots.length) return { nodes: [], links: [] };
    const root = d3.hierarchy(withVirtualRoot(roots));
    d3.tree<OrgNode>().nodeSize([180, 130])(root);
    const nodes = root
      .descendants()
      .filter((n) => n.data.id !== "__virtual_root__");
    const links = root
      .links()
      .filter((l) => l.source.data.id !== "__virtual_root__");
    return { nodes, links };
  }, [roots]);

  const bbox = useMemo(() => {
    if (!layout.nodes.length) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of layout.nodes) {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      if (x - CARD_W / 2 < minX) minX = x - CARD_W / 2;
      if (x + CARD_W / 2 > maxX) maxX = x + CARD_W / 2;
      if (y - CARD_H / 2 < minY) minY = y - CARD_H / 2;
      if (y + CARD_H / 2 > maxY) maxY = y + CARD_H / 2;
    }
    return { minX, maxX, minY, maxY };
  }, [layout.nodes]);

  // Mount: create zoom behaviour once, store in ref so all transform
  // updates compose with it (and pan/zoom continues to work afterwards).
  useEffect(() => {
    if (!svgRef.current) return;
    const sel = d3.select(svgRef.current);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2.5])
      .on("zoom", (e) =>
        setT({ x: e.transform.x, y: e.transform.y, k: e.transform.k }),
      );
    sel.call(zoom);
    zoomRef.current = zoom;
  }, []);

  // Fit-to-view whenever the laid-out tree changes (mode swap, focal
  // pivot in neighborhood mode, data load).
  useEffect(() => {
    const svg = svgRef.current;
    const zoom = zoomRef.current;
    if (!svg || !zoom || !bbox) return;
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    if (w === 0 || h === 0) return; // jsdom / hidden
    const treeW = Math.max(1, bbox.maxX - bbox.minX);
    const treeH = Math.max(1, bbox.maxY - bbox.minY);
    const scale = Math.min(
      (w - FIT_PADDING * 2) / treeW,
      (h - FIT_PADDING * 2) / treeH,
      MAX_FIT_SCALE,
    );
    const cx = (bbox.minX + bbox.maxX) / 2;
    const cy = (bbox.minY + bbox.maxY) / 2;
    const next = d3.zoomIdentity
      .translate(w / 2 - cx * scale, h / 2 - cy * scale)
      .scale(scale);
    d3.select(svg).transition().duration(400).call(zoom.transform, next);
  }, [bbox]);

  // Within the same layout, animate to center the highlighted node at
  // scale 1 (used when full-org mode and focal changes; in neighborhood
  // mode the layout already changed and fit-to-view handled it).
  useEffect(() => {
    const svg = svgRef.current;
    const zoom = zoomRef.current;
    if (!svg || !zoom || !highlightedNodeId) return;
    const target = layout.nodes.find((n) => n.data.id === highlightedNodeId);
    if (!target) return;
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    if (w === 0 || h === 0) return;
    // Skip when the bbox-fit already centered the target (small trees).
    if (layout.nodes.length <= 12) return;
    const tx = target.x ?? 0;
    const ty = target.y ?? 0;
    const scale = 1;
    const next = d3.zoomIdentity
      .translate(w / 2 - tx * scale, h / 2 - ty * scale)
      .scale(scale);
    d3.select(svg).transition().duration(500).call(zoom.transform, next);
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
      <g transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
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
            x={(n.x ?? 0) - CARD_W / 2}
            y={(n.y ?? 0) - CARD_H / 2}
            width={CARD_W}
            height={CARD_H}
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
