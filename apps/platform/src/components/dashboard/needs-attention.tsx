"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@ascenta/ui/skeleton";
import Link from "next/link";

interface AttentionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  link?: string;
}

const PRIORITY_DOT_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

const VISIBLE_COUNT = 5;

export function NeedsAttention() {
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchAttention() {
      try {
        const res = await fetch("/api/dashboard/attention");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch attention items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAttention();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="ml-auto h-5 w-6 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Don't render if there are no items
  if (items.length === 0) {
    return null;
  }

  const visibleItems = expanded ? items : items.slice(0, VISIBLE_COUNT);
  const hasMore = items.length > VISIBLE_COUNT;

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h2 className="font-display text-base font-semibold text-deep-blue">
          Needs Your Attention
        </h2>
        <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-700">
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {visibleItems.map((item) => {
          const dotColor = PRIORITY_DOT_COLORS[item.priority] ?? "bg-slate-400";

          const content = (
            <div className="flex items-start gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-amber-50/60">
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-deep-blue leading-snug">
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          );

          if (item.link) {
            return (
              <Link key={item.id} href={item.link} className="block">
                {content}
              </Link>
            );
          }

          return <div key={item.id}>{content}</div>;
        })}
      </div>

      {/* View all toggle */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100/60"
        >
          {expanded ? (
            <>
              Show less
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              View all {items.length} items
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
