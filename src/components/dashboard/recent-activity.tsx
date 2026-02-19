"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle,
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "created" | "generated" | "exported" | "reviewed" | "document_update" | string;
  description: string;
  timestamp: string;
}

interface ActivityResponse {
  activities: ActivityItem[];
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  created: PlusCircle,
  generated: FileText,
  exported: Download,
  reviewed: CheckCircle,
  document_update: ArrowRight,
};

const ACTIVITY_ICON_COLORS: Record<string, string> = {
  created: "text-emerald-500 bg-emerald-50",
  generated: "text-blue-500 bg-blue-50",
  exported: "text-indigo-500 bg-indigo-50",
  reviewed: "text-amber-500 bg-amber-50",
  document_update: "text-summit bg-summit/10",
};

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 0) return "just now";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/dashboard/activity");
        if (res.ok) {
          const data: ActivityResponse = await res.json();
          setActivities(data.activities?.slice(0, 10) ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-display text-base font-semibold text-deep-blue">
          Recent Activity
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-1">
          {activities.map((item, index) => {
            const Icon = ACTIVITY_ICONS[item.type] ?? Activity;
            const colorClasses =
              ACTIVITY_ICON_COLORS[item.type] ?? "text-slate-500 bg-slate-50";

            return (
              <div key={item.id ?? index}>
                <div className="flex items-start gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-slate-50/80">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${colorClasses}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-deep-blue leading-snug">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
                {index < activities.length - 1 && (
                  <div className="ml-[18px] h-2 w-px bg-border" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      )}

      {/* Footer link */}
      <div className="mt-4 border-t pt-3">
        <Link
          href="/dashboard/activity"
          className="text-xs font-medium text-summit hover:text-summit-hover transition-colors"
        >
          View all activity &rarr;
        </Link>
      </div>
    </div>
  );
}
