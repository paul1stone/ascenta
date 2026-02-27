"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PieArcDatum } from "d3";
import type { LucideIcon } from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";

const SUMMIT = "#ff6b35";
const DEEP_BLUE = "#0c1e3d";
const CARD_BG = "#ffffff";
const MUTED_BG = "#f5f5f5";
const MUTED_FG = "#8a8a8a";
const BORDER = "#e5e5e5";

const CATEGORY_COLORS: Record<string, string> = {
  plan: "#1a73e8",
  attract: "#7c3aed",
  launch: "#ff6b35",
  grow: "#059669",
  care: "#dc2626",
  protect: "#0891b2",
};

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

interface NavItem {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
}

const NAV_ITEMS: NavItem[] = DASHBOARD_NAV.map((cat) => ({
  key: cat.key,
  label: cat.label,
  Icon: cat.icon,
  color: CATEGORY_COLORS[cat.key] ?? SUMMIT,
}));

const BASE_INNER = 62;
const BASE_OUTER = 142;
const EXPAND_OUTER = 160;
const PAD_ANGLE = 0.04;
const CORNER_RADIUS = 5;
const VIEWBOX = 580;
const OUTER_RING = 182;

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

interface CompassNavProps {
  size?: number;
  selected?: string | null;
  onSelect?: (categoryKey: string) => void;
}

export function CompassNav({ size = 420, selected = null, onSelect }: CompassNavProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [needleAngle, setNeedleAngle] = useState(-90);
  const needleRef = useRef(-90);
  const svgRef = useRef<SVGSVGElement>(null);
  const CENTER = VIEWBOX / 2;

  const selectedIndex = selected
    ? NAV_ITEMS.findIndex((item) => item.key === selected)
    : null;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);

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
        .pie<NavItem>()
        .value(1)
        .sort(null)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .padAngle(PAD_ANGLE),
    []
  );

  const arcs = useMemo(() => pie(NAV_ITEMS), [pie]);

  const makeArc = useCallback(
    (inner: number, outer: number) =>
      d3.arc<PieArcDatum<NavItem>>().innerRadius(inner).outerRadius(outer).cornerRadius(CORNER_RADIUS),
    []
  );

  const handleSliceClick = (idx: number) => {
    const item = NAV_ITEMS[idx];
    onSelect?.(item.key);
  };

  const activeColor =
    hoveredIndex !== null
      ? NAV_ITEMS[hoveredIndex].color
      : selectedIndex !== null && selectedIndex >= 0
        ? NAV_ITEMS[selectedIndex].color
        : null;

  const activeLabel =
    hoveredIndex !== null
      ? NAV_ITEMS[hoveredIndex].label
      : selectedIndex !== null && selectedIndex >= 0
        ? NAV_ITEMS[selectedIndex].label
        : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        gap: 12,
      }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {NAV_ITEMS.map((item, i) => (
            <filter key={`glow-${i}`} id={`compass-glow-${i}`}>
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feFlood floodColor={item.color} floodOpacity="0.35" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="compass-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="rgba(12,30,61,0.12)" />
          </filter>
          <radialGradient id="compass-centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CARD_BG} />
            <stop offset="100%" stopColor={MUTED_BG} />
          </radialGradient>
        </defs>

        <g transform={`translate(${CENTER},${CENTER})`}>
          {/* Decorative rings */}
          <circle
            r={OUTER_RING + 22}
            fill="none"
            stroke={BORDER}
            strokeWidth="0.5"
            strokeDasharray="3 8"
            opacity="0.5"
          />
          <circle r={OUTER_RING + 52} fill="none" stroke={BORDER} strokeWidth="0.3" opacity="0.3" />

          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 5 * Math.PI) / 180;
            const r1 = OUTER_RING + 10;
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

          {/* Main slices */}
          {arcs.map((arcData, i) => {
            const isHovered = hoveredIndex === i;
            const isSelected = selectedIndex === i;
            const isExpanded = isHovered || isSelected;
            const isOtherSelected = selectedIndex !== null && selectedIndex >= 0 && selectedIndex !== i;
            const isOtherHovered = hoveredIndex !== null && hoveredIndex !== i;

            const outerR = isExpanded ? EXPAND_OUTER : BASE_OUTER;
            const path = makeArc(BASE_INNER, outerR)(arcData)!;
            const centroid = makeArc(BASE_INNER, outerR).centroid(arcData);
            const item = NAV_ITEMS[i];

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
                    filter={`url(#compass-glow-${i})`}
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
                    filter: isSelected ? `url(#compass-glow-${i})` : "url(#compass-shadow)",
                  }}
                />

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
            fill="url(#compass-centerGrad)"
            stroke={
              selectedIndex !== null && selectedIndex >= 0
                ? NAV_ITEMS[selectedIndex].color
                : BORDER
            }
            strokeWidth={selectedIndex !== null && selectedIndex >= 0 ? 2 : 1}
            strokeOpacity={selectedIndex !== null && selectedIndex >= 0 ? 0.4 : 1}
            filter="url(#compass-shadow)"
            style={{ transition: "all 0.3s ease" }}
          />

          {/* Compass needle */}
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

      {/* Status label */}
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
          {activeLabel || "select a section"}
        </span>
      </div>
    </div>
  );
}
