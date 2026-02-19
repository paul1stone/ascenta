"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { PieArcDatum } from "d3";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListChecks,
  Activity,
  MessageSquare,
  Plus,
  History,
  FileText,
  ClipboardList,
  BarChart3,
  BookOpen,
  Rocket,
  Workflow,
  Code2,
  ShieldCheck,
  Mountain,
  UserPlus,
  TrendingUp,
  Plug,
  GraduationCap,
  User,
  Wrench,
  Sparkles,
} from "lucide-react";

const SUMMIT = "#ff6b35";
const DEEP_BLUE = "#0c1e3d";
const GLACIER = "#f8fafc";
const CARD_BG = "#ffffff";
const MUTED_BG = "#f5f5f5";
const MUTED_FG = "#8a8a8a";
const BORDER = "#e5e5e5";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lighten(hex: string, amt = 0.2) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + (255 - r) * amt)}, ${Math.min(255, g + (255 - g) * amt)}, ${Math.min(255, b + (255 - b) * amt)})`;
}

interface SubItem {
  label: string;
  Icon: LucideIcon;
  href: string;
}

interface MenuItem {
  label: string;
  Icon: LucideIcon;
  color: string;
  href: string;
  subs: SubItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    Icon: LayoutDashboard,
    color: SUMMIT,
    href: "/dashboard",
    subs: [
      { label: "Overview", Icon: BarChart3, href: "/dashboard" },
      { label: "Tasks", Icon: ListChecks, href: "/dashboard" },
      { label: "Activity", Icon: Activity, href: "/dashboard" },
    ],
  },
  {
    label: "Chat",
    Icon: MessageSquare,
    color: "#1a73e8",
    href: "/chat",
    subs: [
      { label: "New Chat", Icon: Plus, href: "/chat" },
      { label: "History", Icon: History, href: "/chat" },
      { label: "Templates", Icon: Sparkles, href: "/chat" },
    ],
  },
  {
    label: "Tracker",
    Icon: ClipboardList,
    color: "#7c3aed",
    href: "/tracker",
    subs: [
      { label: "Pipeline", Icon: Workflow, href: "/tracker" },
      { label: "Documents", Icon: FileText, href: "/tracker" },
      { label: "Reports", Icon: BarChart3, href: "/tracker" },
    ],
  },
  {
    label: "Docs",
    Icon: BookOpen,
    color: "#059669",
    href: "/docs",
    subs: [
      { label: "Start", Icon: Rocket, href: "/docs" },
      { label: "Workflows", Icon: Workflow, href: "/docs" },
      { label: "API", Icon: Code2, href: "/docs" },
      { label: "Compliance", Icon: ShieldCheck, href: "/docs" },
    ],
  },
  {
    label: "Product",
    Icon: Mountain,
    color: "#0891b2",
    href: "/product",
    subs: [
      { label: "Onboarding", Icon: UserPlus, href: "/product" },
      { label: "Performance", Icon: TrendingUp, href: "/product" },
      { label: "Integrations", Icon: Plug, href: "/product" },
    ],
  },
  {
    label: "Learn AI",
    Icon: GraduationCap,
    color: "#dc2626",
    href: "/learn-ai",
    subs: [
      { label: "HR Leader", Icon: User, href: "/learn-ai" },
      { label: "HR Ops", Icon: Wrench, href: "/learn-ai" },
      { label: "IT Admin", Icon: ShieldCheck, href: "/learn-ai" },
    ],
  },
];

const BASE_INNER = 62;
const BASE_OUTER = 142;
const EXPAND_OUTER = 160;
const SUB_INNER = 168;
const SUB_OUTER = 240;
const SUB_HOVER_OUTER = 260;
const PAD_ANGLE = 0.04;
const SUB_PAD = 0.012;
const CORNER_RADIUS = 5;
const VIEWBOX = 580;
const SIZE = 1160;
const CENTER = VIEWBOX / 2;

function LucideInSvg({
  Icon,
  x,
  y,
  size = 18,
  color = "#fff",
  opacity = 1,
  transition = "all 0.3s ease",
}: {
  Icon: LucideIcon;
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
  transition?: string;
}) {
  return (
    <foreignObject
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      style={{ pointerEvents: "none", overflow: "visible" }}
    >
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition,
          opacity,
        }}
      >
        <Icon size={size * 0.85} color={color} strokeWidth={2} />
      </div>
    </foreignObject>
  );
}

interface SubHover {
  parent: number;
  sub: number;
}

export default function CircleMenuPage() {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredSub, setHoveredSub] = useState<SubHover | null>(null);
  const [activeSub, setActiveSub] = useState<SubHover | null>(null);
  const [needleAngle, setNeedleAngle] = useState(-90);
  const needleRef = useRef(-90);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Take shortest rotation path to avoid 360-degree spins
      const prev = needleRef.current;
      let delta = rawAngle - (prev % 360);
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      const next = prev + delta;
      needleRef.current = next;
      setNeedleAngle(next);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const pie = useMemo(
    () =>
      d3
        .pie<MenuItem>()
        .value(1)
        .sort(null)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .padAngle(PAD_ANGLE),
    []
  );

  const arcs = useMemo(() => pie(MENU_ITEMS), [pie]);

  const makeArc = useCallback(
    (inner: number, outer: number) =>
      d3.arc<PieArcDatum<MenuItem>>().innerRadius(inner).outerRadius(outer).cornerRadius(CORNER_RADIUS),
    []
  );

  const getSubArcs = useCallback(
    (parentArcData: PieArcDatum<MenuItem>, subCount: number) => {
      const start = parentArcData.startAngle;
      const end = parentArcData.endAngle;
      const totalPad = SUB_PAD * (subCount - 1);
      const available = end - start - PAD_ANGLE - totalPad;
      const each = available / subCount;
      return Array.from({ length: subCount }, (_, i) => ({
        startAngle: start + PAD_ANGLE / 2 + i * (each + SUB_PAD),
        endAngle: start + PAD_ANGLE / 2 + i * (each + SUB_PAD) + each,
        data: {} as MenuItem,
        index: i,
        value: 1,
        padAngle: SUB_PAD,
      }));
    },
    []
  );

  const handleSliceClick = (idx: number) => {
    if (selectedIndex === idx) {
      setSelectedIndex(null);
      setActiveSub(null);
    } else {
      setSelectedIndex(idx);
      setActiveSub(null);
    }
  };

  const handleSubClick = (parentIdx: number, subIdx: number) => {
    setActiveSub({ parent: parentIdx, sub: subIdx });
    const sub = MENU_ITEMS[parentIdx].subs[subIdx];
    router.push(sub.href);
  };

  const activeLabel =
    activeSub !== null
      ? `${MENU_ITEMS[activeSub.parent].label} \u2192 ${MENU_ITEMS[activeSub.parent].subs[activeSub.sub].label}`
      : hoveredSub !== null
        ? `${MENU_ITEMS[hoveredSub.parent].label} \u2192 ${MENU_ITEMS[hoveredSub.parent].subs[hoveredSub.sub].label}`
        : hoveredIndex !== null
          ? MENU_ITEMS[hoveredIndex].label
          : selectedIndex !== null
            ? MENU_ITEMS[selectedIndex].label
            : null;

  const activeColor =
    hoveredSub !== null
      ? MENU_ITEMS[hoveredSub.parent].color
      : hoveredIndex !== null
        ? MENU_ITEMS[hoveredIndex].color
        : selectedIndex !== null
          ? MENU_ITEMS[selectedIndex].color
          : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: GLACIER,
        fontFamily: "'Inter', -apple-system, sans-serif",
        userSelect: "none",
        gap: 20,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            color: DEEP_BLUE,
            fontSize: 13,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
            opacity: 0.45,
          }}
        >
          Ascenta Navigator
        </h1>
      </div>

      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {MENU_ITEMS.map((item, i) => (
            <filter key={`glow-${i}`} id={`glow-${i}`}>
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feFlood floodColor={item.color} floodOpacity="0.35" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="rgba(12,30,61,0.12)" />
          </filter>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CARD_BG} />
            <stop offset="100%" stopColor={MUTED_BG} />
          </radialGradient>
        </defs>

        <g transform={`translate(${CENTER},${CENTER})`}>
          {/* Decorative rings */}
          <circle
            r={SUB_OUTER + 22}
            fill="none"
            stroke={BORDER}
            strokeWidth="0.5"
            strokeDasharray="3 8"
            opacity="0.5"
          />
          <circle r={SUB_HOVER_OUTER + 32} fill="none" stroke={BORDER} strokeWidth="0.3" opacity="0.3" />

          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 5 * Math.PI) / 180;
            const r1 = SUB_OUTER + 10;
            const isMajor = i % 6 === 0;
            const r2 = r1 + (isMajor ? 10 : 4);
            return (
              <line
                key={`t-${i}`}
                x1={Math.cos(angle) * r1}
                y1={Math.sin(angle) * r1}
                x2={Math.cos(angle) * r2}
                y2={Math.sin(angle) * r2}
                stroke={DEEP_BLUE}
                opacity={isMajor ? 0.12 : 0.04}
                strokeWidth={isMajor ? 1 : 0.5}
              />
            );
          })}

          {/* Connector ring */}
          {selectedIndex !== null && (
            <circle
              r={(SUB_INNER + EXPAND_OUTER) / 2}
              fill="none"
              stroke={MENU_ITEMS[selectedIndex].color}
              opacity={0.1}
              strokeWidth="1"
              strokeDasharray="2 4"
              style={{ transition: "all 0.3s ease" }}
            />
          )}

          {/* Sub-menu arcs */}
          {selectedIndex !== null &&
            (() => {
              const parentItem = MENU_ITEMS[selectedIndex];
              const parentArc = arcs[selectedIndex];
              const subArcs = getSubArcs(parentArc, parentItem.subs.length);

              return subArcs.map((subArcData, si) => {
                const isSubHovered =
                  hoveredSub?.parent === selectedIndex && hoveredSub?.sub === si;
                const isSubActive =
                  activeSub?.parent === selectedIndex && activeSub?.sub === si;
                const isSubExpanded = isSubHovered || isSubActive;
                const isOtherSubHovered =
                  hoveredSub !== null &&
                  !(hoveredSub.parent === selectedIndex && hoveredSub.sub === si);

                const outerR = isSubExpanded ? SUB_HOVER_OUTER : SUB_OUTER;
                const subPath = makeArc(SUB_INNER, outerR)(subArcData)!;
                const centroid = makeArc(SUB_INNER, outerR).centroid(subArcData);
                const sub = parentItem.subs[si];

                return (
                  <g
                    key={`sub-${si}`}
                    onMouseEnter={() => setHoveredSub({ parent: selectedIndex, sub: si })}
                    onMouseLeave={() => setHoveredSub(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubClick(selectedIndex, si);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {isSubExpanded && (
                      <path
                        d={subPath}
                        fill={parentItem.color}
                        opacity={0.08}
                        filter={`url(#glow-${selectedIndex})`}
                        style={{
                          transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      />
                    )}

                    <path
                      d={subPath}
                      fill={isSubExpanded ? parentItem.color : CARD_BG}
                      stroke={isSubExpanded ? parentItem.color : BORDER}
                      strokeWidth={isSubExpanded ? 1.5 : 0.75}
                      opacity={isOtherSubHovered && !isSubActive ? 0.45 : 1}
                      style={{
                        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        filter: isSubExpanded
                          ? `url(#glow-${selectedIndex})`
                          : "url(#shadow)",
                      }}
                    />

                    <LucideInSvg
                      Icon={sub.Icon}
                      x={centroid[0]}
                      y={centroid[1] - 6}
                      size={isSubExpanded ? 18 : 15}
                      color={isSubExpanded ? "#fff" : parentItem.color}
                      opacity={isOtherSubHovered && !isSubActive ? 0.5 : 1}
                    />

                    <text
                      x={centroid[0]}
                      y={centroid[1] + 12}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={7}
                      fontFamily="'Montserrat', sans-serif"
                      fontWeight={700}
                      letterSpacing="0.05em"
                      fill={isSubExpanded ? "#fff" : MUTED_FG}
                      opacity={isOtherSubHovered && !isSubActive ? 0.4 : 1}
                      style={{
                        transition: "all 0.2s ease",
                        pointerEvents: "none",
                        textTransform: "uppercase",
                      }}
                    >
                      {sub.label}
                    </text>
                  </g>
                );
              });
            })()}

          {/* Main slices */}
          {arcs.map((arcData, i) => {
            const isHovered = hoveredIndex === i;
            const isSelected = selectedIndex === i;
            const isExpanded = isHovered || isSelected;
            const isOtherSelected = selectedIndex !== null && selectedIndex !== i;
            const isOtherHovered = hoveredIndex !== null && hoveredIndex !== i;

            const outerR = isExpanded ? EXPAND_OUTER : BASE_OUTER;
            const path = makeArc(BASE_INNER, outerR)(arcData)!;
            const centroid = makeArc(BASE_INNER, outerR).centroid(arcData);
            const item = MENU_ITEMS[i];

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleSliceClick(i)}
                style={{ cursor: "pointer" }}
              >
                {isExpanded && (
                  <path
                    d={path}
                    fill={item.color}
                    opacity={0.08}
                    filter={`url(#glow-${i})`}
                    style={{
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                )}

                <path
                  d={path}
                  fill={
                    isSelected
                      ? item.color
                      : isHovered
                        ? lighten(item.color, 0.85)
                        : CARD_BG
                  }
                  stroke={isExpanded ? item.color : BORDER}
                  strokeWidth={isExpanded ? 1.5 : 0.75}
                  opacity={
                    isOtherSelected && !isHovered
                      ? 0.3
                      : isOtherHovered && !isSelected
                        ? 0.55
                        : 1
                  }
                  style={{
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    filter: isSelected ? `url(#glow-${i})` : "url(#shadow)",
                  }}
                />

                {/* Sub-count dots — aligned to where sub-arcs would appear */}
                {isHovered &&
                  !isSelected &&
                  (() => {
                    const subArcs = getSubArcs(arcData, item.subs.length);
                    return subArcs.map((subArcData, si) => {
                      const midAngle = (subArcData.startAngle + subArcData.endAngle) / 2 - Math.PI / 2;
                      const dr = EXPAND_OUTER + 10;
                      return (
                        <circle
                          key={`dot-${si}`}
                          cx={Math.cos(midAngle) * dr}
                          cy={Math.sin(midAngle) * dr}
                          r={2.5}
                          fill={item.color}
                          opacity={0.5}
                          style={{
                            transition: "all 0.15s ease",
                            transitionDelay: `${si * 30}ms`,
                            pointerEvents: "none",
                          }}
                        />
                      );
                    });
                  })()}

                <LucideInSvg
                  Icon={item.Icon}
                  x={centroid[0] * 0.82}
                  y={centroid[1] * 0.82 + (isExpanded ? -2 : 0)}
                  size={isExpanded ? 22 : 19}
                  color={
                    isSelected
                      ? "#fff"
                      : isHovered
                        ? item.color
                        : isOtherSelected
                          ? MUTED_FG
                          : DEEP_BLUE
                  }
                  opacity={isOtherSelected && !isHovered ? 0.3 : 1}
                />

                <text
                  x={centroid[0] * 0.82}
                  y={centroid[1] * 0.82 + 16}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8}
                  fontFamily="'Montserrat', sans-serif"
                  fontWeight={700}
                  letterSpacing="0.07em"
                  fill={
                    isSelected ? "#ffffffcc" : isExpanded ? item.color : "transparent"
                  }
                  style={{
                    transition: "all 0.25s ease",
                    transitionDelay: isExpanded ? "0.05s" : "0s",
                    pointerEvents: "none",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Center circle */}
          <circle
            r={BASE_INNER - 5}
            fill="url(#centerGrad)"
            stroke={
              selectedIndex !== null ? MENU_ITEMS[selectedIndex].color : BORDER
            }
            strokeWidth={selectedIndex !== null ? 2 : 1}
            strokeOpacity={selectedIndex !== null ? 0.4 : 1}
            filter="url(#shadow)"
            style={{ transition: "all 0.3s ease", cursor: "pointer" }}
            onClick={() => {
              setSelectedIndex(null);
              setActiveSub(null);
            }}
          />

          {/* Compass needle — tracks mouse */}
          <g
            style={{
              transition: "transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: "0 0",
            }}
          >
            <polygon
              points="28,0 10,-4.5 10,4.5"
              fill={activeColor || SUMMIT}
              opacity={0.85}
              style={{ transition: "fill 0.3s ease" }}
            />
            <polygon points="-28,0 -10,-4.5 -10,4.5" fill={DEEP_BLUE} opacity={0.15} />
          </g>

          {/* Center dot */}
          <circle
            r="5"
            fill={activeColor || SUMMIT}
            opacity={0.75}
            style={{ transition: "fill 0.3s ease" }}
          />
          <circle r="2" fill={CARD_BG} />

          {/* Cardinal labels */}
          {[
            { l: "N", a: -90 },
            { l: "E", a: 0 },
            { l: "S", a: 90 },
            { l: "W", a: 180 },
          ].map(({ l, a }) => {
            const rad = (a * Math.PI) / 180;
            const r = BASE_INNER - 22;
            return (
              <text
                key={l}
                x={Math.cos(rad) * r}
                y={Math.sin(rad) * r + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={7}
                fontFamily="'Montserrat', sans-serif"
                fontWeight={800}
                fill={DEEP_BLUE}
                opacity={0.2}
                letterSpacing="0.05em"
              >
                {l}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Status bar */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: activeLabel ? 1 : 0.35,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: activeColor || BORDER,
            transition: "all 0.2s ease",
            boxShadow: activeColor ? `0 0 10px ${activeColor}50` : "none",
          }}
        />
        <span
          style={{
            color: activeColor ? DEEP_BLUE : MUTED_FG,
            fontSize: 11,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            transition: "color 0.2s ease",
          }}
        >
          {activeLabel || "click a section"}
        </span>
      </div>
    </div>
  );
}
