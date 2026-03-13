"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ascenta/ui/card";
import { Skeleton } from "@ascenta/ui/skeleton";
import { cn } from "@ascenta/ui";
import { Users, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { CategoryStatusCard } from "@/components/overview/category-status-card";

interface StatusAggregates {
  directReportsCount: number;
  activeGoalsCount: number;
  checkInCompletion7d: number;
  overdueCheckIns: number;
}

interface GrowStatusResponse {
  aggregates: StatusAggregates;
}

const CATEGORIES = [
  { key: "grow", label: "Grow", subtitle: "Performance & Development", color: "#44aa99", hasData: true },
  { key: "plan", label: "Plan", subtitle: "Strategy & Workforce Planning", color: "#6688bb", hasData: false },
  { key: "attract", label: "Attract", subtitle: "Hiring Pipeline", color: "#aa8866", hasData: false },
  { key: "launch", label: "Launch", subtitle: "Onboarding & Enablement", color: "#bb6688", hasData: false },
  { key: "care", label: "Care", subtitle: "Total Rewards & Leave", color: "#cc6677", hasData: false },
  { key: "protect", label: "Protect", subtitle: "Feedback & Case Management", color: "#8888aa", hasData: false },
] as const;

function StatCard({
  title,
  value,
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: "red" | "green";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            highlight === "red" && "text-rose-600",
            highlight === "green" && "text-emerald-600",
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function GrowLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlaceholderContent() {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed py-6">
      <span className="text-xs text-muted-foreground">Status tracking coming soon</span>
    </div>
  );
}

export default function StatusOverviewPage() {
  const [aggregates, setAggregates] = useState<StatusAggregates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrowStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/grow/status");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
      }
      const json = (await res.json()) as GrowStatusResponse;
      setAggregates(json.aggregates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowStatus();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-foreground">Status Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Cross-functional health check across all HR domains
        </p>
      </div>

      <div className="space-y-4">
        <CategoryStatusCard
          label="Grow"
          subtitle="Performance & Development"
          color="#44aa99"
          detailHref="/status/grow"
        >
          {loading ? (
            <GrowLoadingSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center py-6">
              <p className="text-xs text-destructive mb-2">{error}</p>
              <button
                type="button"
                onClick={fetchGrowStatus}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : aggregates ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Direct Reports" value={aggregates.directReportsCount} icon={Users} />
              <StatCard title="Active Goals" value={aggregates.activeGoalsCount} icon={Target} />
              <StatCard
                title="Check-in Completion (7d)"
                value={`${Math.round(aggregates.checkInCompletion7d)}%`}
                icon={CheckCircle2}
                highlight={aggregates.checkInCompletion7d >= 80 ? "green" : undefined}
              />
              <StatCard
                title="Overdue Check-ins"
                value={aggregates.overdueCheckIns}
                icon={AlertTriangle}
                highlight={aggregates.overdueCheckIns > 0 ? "red" : undefined}
              />
            </div>
          ) : (
            <PlaceholderContent />
          )}
        </CategoryStatusCard>

        {CATEGORIES.filter((c) => !c.hasData && ["plan", "attract"].includes(c.key)).map((cat) => (
          <CategoryStatusCard
            key={cat.key}
            label={cat.label}
            subtitle={cat.subtitle}
            color={cat.color}
          >
            <PlaceholderContent />
          </CategoryStatusCard>
        ))}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORIES.filter((c) => !c.hasData && ["launch", "care", "protect"].includes(c.key)).map((cat) => (
            <CategoryStatusCard
              key={cat.key}
              label={cat.label}
              subtitle={cat.subtitle}
              color={cat.color}
            >
              <PlaceholderContent />
            </CategoryStatusCard>
          ))}
        </div>
      </div>
    </div>
  );
}
