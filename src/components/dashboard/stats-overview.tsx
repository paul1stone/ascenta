"use client";

import { useEffect, useState } from "react";
import { Users, FileText, GitBranch, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend: number;
  trendLabel: string;
}

interface StatsData {
  totalEmployees: number;
  activeDocuments: number;
  workflowsRun: number;
  complianceRate: number;
  trends?: {
    employees: number;
    documents: number;
    workflows: number;
    compliance: number;
  };
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
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
          <div
            key={i}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
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

  const cards: StatCard[] = [
    {
      label: "Total Employees",
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      trend: stats?.trends?.employees ?? 0,
      trendLabel: "vs last month",
    },
    {
      label: "Active Documents",
      value: stats?.activeDocuments ?? 0,
      icon: FileText,
      trend: stats?.trends?.documents ?? 0,
      trendLabel: "vs last month",
    },
    {
      label: "Workflows Run",
      value: stats?.workflowsRun ?? 0,
      icon: GitBranch,
      trend: stats?.trends?.workflows ?? 0,
      trendLabel: "vs last month",
    },
    {
      label: "Compliance Rate",
      value: stats?.complianceRate != null ? `${stats.complianceRate}%` : "0%",
      icon: ShieldCheck,
      trend: stats?.trends?.compliance ?? 0,
      trendLabel: "vs last month",
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
            <div className="mt-3 flex items-center gap-1 text-xs">
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
          </div>
        );
      })}
    </div>
  );
}
