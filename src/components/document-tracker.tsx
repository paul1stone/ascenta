"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FileText,
  Loader2,
  PenLine,
  Send,
  Mail,
  Eye,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

/* ───────────────────── Stage config ───────────────────── */

type StageConfig = {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  dot: string;
};

const STAGES: StageConfig[] = [
  { value: "draft",         label: "Draft",         icon: PenLine,      color: "text-slate-600",   bg: "bg-slate-100",    border: "border-slate-200",  dot: "bg-slate-400" },
  { value: "on_us_to_send", label: "Ready to Send", icon: Send,         color: "text-amber-600",   bg: "bg-amber-50",     border: "border-amber-200",  dot: "bg-amber-400" },
  { value: "sent",          label: "Sent",          icon: Mail,         color: "text-blue-600",    bg: "bg-blue-50",      border: "border-blue-200",   dot: "bg-blue-400" },
  { value: "in_review",     label: "In Review",     icon: Eye,          color: "text-violet-600",  bg: "bg-violet-50",    border: "border-violet-200", dot: "bg-violet-400" },
  { value: "acknowledged",  label: "Acknowledged",  icon: UserCheck,    color: "text-emerald-600", bg: "bg-emerald-50",   border: "border-emerald-200", dot: "bg-emerald-400" },
  { value: "completed",     label: "Completed",     icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100",  border: "border-emerald-300", dot: "bg-emerald-500" },
];

/* ───────────────────── Types ───────────────────── */

type TrackedDoc = {
  id: string;
  workflowRunId: string;
  title: string;
  documentType: string;
  employeeName: string | null;
  stage: string;
  createdAt: string;
  updatedAt: string;
};

/* ───────────────────── Helpers ───────────────────── */

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ───────────────────── Component ───────────────────── */

export function DocumentTracker() {
  const [documents, setDocuments] = useState<TrackedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const res = await fetch("/api/tracked-documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStage(id: string, stage: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/tracked-documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, stage } : d))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  /* ───────── Derived data ───────── */

  const byStage = useMemo(
    () =>
      STAGES.map((s) => ({
        ...s,
        docs: documents.filter((d) => d.stage === s.value),
      })),
    [documents]
  );

  const stats = useMemo(() => {
    const total = documents.length;
    const completed = documents.filter((d) => d.stage === "completed").length;
    const needsAction = documents.filter(
      (d) => d.stage === "draft" || d.stage === "on_us_to_send"
    ).length;
    const inProgress = documents.filter(
      (d) => d.stage === "sent" || d.stage === "in_review" || d.stage === "acknowledged"
    ).length;

    const sorted = [...documents].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const lastUpdated = sorted[0] ?? null;

    return { total, completed, needsAction, inProgress, lastUpdated };
  }, [documents]);

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="size-8 animate-spin text-summit" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        /* ───────── Empty state ───────── */
        <Card className="border-0 shadow-md">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 mb-4">
              <FileText className="size-7 text-slate-400" />
            </div>
            <h2 className="font-display text-lg font-semibold text-deep-blue mb-2">
              No documents yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Documents generated from Chat will appear here for tracking through the delivery pipeline.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ───────── Stats row ───────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-deep-blue to-deep-blue/50" />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-deep-blue/5">
                    <BarChart3 className="size-4 text-deep-blue" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-deep-blue">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-0.5">documents tracked</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-amber-400 to-amber-300" />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Needs Action
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
                    <AlertCircle className="size-4 text-amber-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.needsAction}</p>
                <p className="text-xs text-muted-foreground mt-0.5">awaiting send</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-blue-400 to-violet-400" />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    In Progress
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
                    <TrendingUp className="size-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground mt-0.5">sent or in review</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-300" />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Completed
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                  <span className="text-sm font-medium text-emerald-600 mb-0.5">{completionPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ───────── Pipeline funnel ───────── */}
          <Card className="border-0 shadow-md mb-8">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold text-deep-blue">Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-5">
              <div className="flex items-center gap-1">
                {STAGES.map((stage) => {
                  const count = byStage.find((c) => c.value === stage.value)?.docs.length ?? 0;
                  const StageIcon = stage.icon;
                  return (
                    <div
                      key={stage.value}
                      className="group relative flex-1 min-w-0"
                    >
                      <div
                        className={cn(
                          "h-8 rounded-md flex items-center justify-center gap-1.5 transition-all",
                          stage.bg,
                          count > 0 ? "opacity-100" : "opacity-40"
                        )}
                      >
                        <StageIcon className={cn("size-3.5 shrink-0", stage.color)} />
                        {count > 0 && (
                          <span className={cn("text-xs font-semibold", stage.color)}>{count}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-center text-muted-foreground mt-1.5 truncate px-0.5">
                        {stage.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ───────── Kanban board ───────── */}
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[420px]">
            {byStage.map((column) => {
              const StageIcon = column.icon;
              return (
                <div
                  key={column.value}
                  className="flex-shrink-0 w-72 rounded-xl bg-white/80 border-0 shadow-md flex flex-col overflow-hidden"
                >
                  <div className={cn("px-4 py-3 border-b", column.border)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex size-6 items-center justify-center rounded-md", column.bg)}>
                          <StageIcon className={cn("size-3.5", column.color)} />
                        </div>
                        <h2 className="font-semibold text-deep-blue text-sm">
                          {column.label}
                        </h2>
                      </div>
                      <Badge className={cn("text-[10px] px-1.5 py-0 border-0", column.bg, column.color)}>
                        {column.docs.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 p-2 overflow-y-auto space-y-2">
                    {column.docs.length === 0 ? (
                      <div className="flex flex-col items-center py-8 px-2">
                        <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                          <StageIcon className="size-4 text-slate-300" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          No documents
                        </p>
                      </div>
                    ) : (
                      column.docs.map((doc) => (
                        <Card
                          key={doc.id}
                          className="border-0 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <CardContent className="p-3">
                            <Link
                              href={`/tracker/${doc.id}`}
                              className="flex items-start gap-2.5"
                            >
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-deep-blue/5 text-deep-blue text-xs font-semibold mt-0.5">
                                {(doc.employeeName ?? doc.title).charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-deep-blue text-sm leading-tight group-hover:text-summit transition-colors">
                                  {doc.title}
                                </p>
                                {doc.employeeName && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {doc.employeeName}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                    {doc.documentType}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    ·
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {timeAgo(doc.updatedAt)}
                                  </span>
                                </div>
                              </div>
                              <ArrowUpRight className="size-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                            </Link>

                            <Separator className="my-2" />

                            <div className="flex items-center gap-2">
                              <select
                                value={doc.stage}
                                onChange={(e) => updateStage(doc.id, e.target.value)}
                                disabled={updatingId === doc.id}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 h-7 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-summit/30 focus:border-summit disabled:opacity-50 transition-colors"
                              >
                                {STAGES.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                              {updatingId === doc.id && (
                                <Loader2 className="size-3.5 animate-spin text-summit shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
