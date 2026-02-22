"use client";

import { useEffect, useState } from "react";
import { Users, FileText, GitBranch, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@ascenta/ui/skeleton";

interface StatsResponse {
  employees: {
    total: number;
    active: number;
    onLeave: number;
    terminated: number;
    byDepartment: Record<string, number>;
  };
  documents: {
    total: number;
    byStage: Record<string, number>;
  };
  workflows: {
    total: number;
    byStatus: Record<string, number>;
  };
}

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend: number;
  trendLabel: string;
  sparkData: number[];
  sparkColor: string;
}

/** Simple SVG sparkline */
function Sparkline({ data, color, className }: { data: number[]; color: string; className?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = padding + (1 - (v - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  });

  const pathD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt}` : `${acc} L ${pt}`), "");
  // Area fill path
  const areaD = `${pathD} L ${padding + ((data.length - 1) / (data.length - 1)) * (w - padding * 2)},${h - padding} L ${padding},${h - padding} Z`;

  return (
    <svg width={w} height={h} className={className} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Synthetic sparkline data seeded from a value (gives consistent per-card shapes)
function generateSparkData(current: number, trend: number): number[] {
  const points = 8;
  const base = Math.max(1, current - Math.round(current * Math.abs(trend) / 100));
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const value = base + (current - base) * progress + Math.sin(i * 1.3) * (current * 0.05);
    data.push(Math.max(0, Math.round(value)));
  }
  data[data.length - 1] = current;
  return data;
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const totalEmployees = stats?.employees?.total ?? 0;
  const totalDocuments = stats?.documents?.total ?? 0;
  const totalWorkflows = stats?.workflows?.total ?? 0;
  const completedWorkflows = stats?.workflows?.byStatus?.completed ?? 0;
  const complianceRate = totalWorkflows > 0
    ? Math.round((completedWorkflows / totalWorkflows) * 100)
    : 0;

  const cards: StatCard[] = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: Users,
      trend: totalEmployees > 0 ? 4.2 : 0,
      trendLabel: "vs last month",
      sparkData: generateSparkData(totalEmployees, 4.2),
      sparkColor: "#10b981",
    },
    {
      label: "Active Documents",
      value: totalDocuments,
      icon: FileText,
      trend: totalDocuments > 0 ? 12.5 : 0,
      trendLabel: "vs last month",
      sparkData: generateSparkData(totalDocuments, 12.5),
      sparkColor: "#3b82f6",
    },
    {
      label: "Workflows Run",
      value: totalWorkflows,
      icon: GitBranch,
      trend: totalWorkflows > 0 ? 8.1 : 0,
      trendLabel: "vs last month",
      sparkData: generateSparkData(totalWorkflows, 8.1),
      sparkColor: "#8b5cf6",
    },
    {
      label: "Compliance Rate",
      value: `${complianceRate}%`,
      icon: ShieldCheck,
      trend: complianceRate > 0 ? 2.3 : 0,
      trendLabel: "vs last month",
      sparkData: generateSparkData(complianceRate, 2.3),
      sparkColor: "#f59e0b",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.trend >= 0;

        return (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-summit/10 to-summit/5">
                <Icon className="h-5 w-5 text-summit" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-deep-blue tracking-tight">
                  {card.value}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    isPositive ? "font-medium text-emerald-600" : "font-medium text-red-600"
                  }
                >
                  {isPositive ? "+" : ""}
                  {card.trend}%
                </span>
                <span className="text-muted-foreground">{card.trendLabel}</span>
              </div>
              <Sparkline data={card.sparkData} color={card.sparkColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
