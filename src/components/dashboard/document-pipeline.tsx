"use client";

import { useEffect, useState } from "react";
import { KanbanSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface StageData {
  draft: number;
  on_us_to_send: number;
  sent: number;
  in_review: number;
  acknowledged: number;
  completed: number;
}

interface StatsResponse {
  documents?: {
    byStage?: StageData;
  };
}

const STAGES: {
  key: keyof StageData;
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}[] = [
  {
    key: "draft",
    label: "Draft",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    dotColor: "bg-slate-400",
  },
  {
    key: "on_us_to_send",
    label: "On Us to Send",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    dotColor: "bg-blue-400",
  },
  {
    key: "sent",
    label: "Sent",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    dotColor: "bg-indigo-400",
  },
  {
    key: "in_review",
    label: "In Review",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    dotColor: "bg-amber-400",
  },
  {
    key: "acknowledged",
    label: "Acknowledged",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-400",
  },
  {
    key: "completed",
    label: "Completed",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    dotColor: "bg-green-500",
  },
];

export function DocumentPipeline() {
  const [stageData, setStageData] = useState<StageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data: StatsResponse = await res.json();
          if (data.documents?.byStage) {
            setStageData(data.documents.byStage);
          }
        }
      } catch (error) {
        console.error("Failed to fetch document pipeline:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const total = stageData
    ? Object.values(stageData).reduce((sum, val) => sum + val, 0)
    : 0;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <KanbanSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-display text-base font-semibold text-deep-blue">
          Document Pipeline
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ) : stageData && total > 0 ? (
        <>
          {/* Horizontal pipeline bar */}
          <div className="mb-4 flex h-7 w-full overflow-hidden rounded-full">
            {STAGES.map((stage) => {
              const count = stageData[stage.key] ?? 0;
              if (count === 0) return null;
              const widthPercent = (count / total) * 100;
              return (
                <div
                  key={stage.key}
                  className={`${stage.bgColor} flex items-center justify-center text-xs font-medium ${stage.textColor} transition-all`}
                  style={{ width: `${widthPercent}%`, minWidth: count > 0 ? "24px" : 0 }}
                  title={`${stage.label}: ${count}`}
                >
                  {widthPercent > 8 ? count : ""}
                </div>
              );
            })}
          </div>

          {/* Stage legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {STAGES.map((stage) => {
              const count = stageData[stage.key] ?? 0;
              return (
                <div key={stage.key} className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${stage.dotColor}`}
                  />
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span className="ml-auto font-medium text-deep-blue">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No document data available.</p>
      )}

      {/* Footer link */}
      <div className="mt-4 border-t pt-3">
        <Link
          href="/tracker"
          className="text-xs font-medium text-summit hover:text-summit-hover transition-colors"
        >
          View full tracker &rarr;
        </Link>
      </div>
    </div>
  );
}
