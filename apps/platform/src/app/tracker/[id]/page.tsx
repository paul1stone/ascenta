"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarInset } from "@ascenta/ui/sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@ascenta/ui/card";
import { Button } from "@ascenta/ui/button";
import { Badge } from "@ascenta/ui/badge";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import { Separator } from "@ascenta/ui/separator";
import { ScrollArea } from "@ascenta/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent } from "@ascenta/ui/tooltip";
import { cn } from "@ascenta/ui";
import {
  FileText,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  Download,
  Check,
  Send,
  Clock,
  Eye,
  CheckCircle2,
  PenLine,
  UserCheck,
  Calendar,
  Bell,
  Mountain,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";

type ActionItem = {
  id: string;
  label: string;
  mailto?: { subject: string; body: string };
};

type DocDetail = {
  id: string;
  title: string;
  documentType: string;
  employeeName: string | null;
  employeeEmail: string | null;
  stage: string;
  renderedContent: string | null;
  completedActions: Record<string, boolean>;
  actionItems: ActionItem[];
  sentAt: string | null;
  acknowledgedAt: string | null;
  reminderCount: number;
};

/* ───────────────────── Stage pipeline config ───────────────────── */

type StageConfig = {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;      // text / border accent
  bg: string;         // badge background
};

const STAGES: StageConfig[] = [
  { key: "draft",          label: "Draft",        icon: PenLine,      color: "text-slate-600",   bg: "bg-slate-100" },
  { key: "on_us_to_send",  label: "Ready to Send", icon: Send,        color: "text-amber-600",   bg: "bg-amber-50" },
  { key: "sent",           label: "Sent",         icon: Mail,         color: "text-blue-600",    bg: "bg-blue-50" },
  { key: "in_review",      label: "In Review",    icon: Eye,          color: "text-violet-600",  bg: "bg-violet-50" },
  { key: "acknowledged",   label: "Acknowledged", icon: UserCheck,    color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "completed",      label: "Completed",    icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100" },
];

function getStageIndex(stage: string): number {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return idx === -1 ? 0 : idx;
}

function getStageConfig(stage: string): StageConfig {
  return STAGES.find((s) => s.key === stage) ?? STAGES[0];
}

export default function TrackerDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [advancingStage, setAdvancingStage] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/tracked-documents/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDoc(data);
          if (data.employeeEmail) setEmployeeEmail(data.employeeEmail);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function toggleAction(actionId: string, completed: boolean) {
    if (!doc) return;
    setSavingAction(actionId);
    const next = { ...doc.completedActions, [actionId]: completed };
    try {
      const res = await fetch(`/api/tracked-documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedActions: next }),
      });
      if (res.ok) setDoc((d) => (d ? { ...d, completedActions: next } : d));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAction(null);
    }
  }

  async function sendDocument() {
    if (!doc || !employeeEmail) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/tracked-documents/${doc.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setDoc((d) =>
          d
            ? { ...d, stage: "sent", sentAt: data.sentAt, employeeEmail }
            : d
        );
      } else {
        const data = await res.json();
        setSendError(data.error || "Failed to send");
      }
    } catch {
      setSendError("Network error");
    } finally {
      setSending(false);
    }
  }

  function openMailto(action: ActionItem) {
    if (!action.mailto || !doc) return;
    const subject = action.mailto.subject
      .replace(/\{\{title\}\}/g, doc.title)
      .replace(/\{\{employeeName\}\}/g, doc.employeeName ?? "");
    const body = action.mailto.body
      .replace(/\{\{title\}\}/g, doc.title)
      .replace(/\{\{employeeName\}\}/g, doc.employeeName ?? "");
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }

  async function advanceStage() {
    if (!doc) return;
    const currentIdx = getStageIndex(doc.stage);
    if (currentIdx >= STAGES.length - 1) return;
    const nextStage = STAGES[currentIdx + 1].key;
    setAdvancingStage(true);
    try {
      const res = await fetch(`/api/tracked-documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });
      if (res.ok) {
        // Re-fetch to get new stage's action items and reset completedActions
        const freshRes = await fetch(`/api/tracked-documents/${doc.id}`);
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setDoc(freshData);
        } else {
          setDoc((d) => (d ? { ...d, stage: nextStage } : d));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdvancingStage(false);
    }
  }

  /* ───────── Loading state ───────── */
  if (loading || !id) {
    return (
      <SidebarInset className="bg-glacier">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
          <h1 className="font-display text-lg font-semibold text-deep-blue">Document</h1>
          <div className="flex-1" />
          <AppNavbar />
        </header>
        <main className="min-h-screen bg-glacier flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-summit" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading document...</p>
        </main>
      </SidebarInset>
    );
  }

  /* ───────── Not found state ───────── */
  if (!doc) {
    return (
      <SidebarInset className="bg-glacier">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
          <h1 className="font-display text-lg font-semibold text-deep-blue">Document</h1>
          <div className="flex-1" />
          <AppNavbar />
        </header>
        <main className="min-h-screen bg-glacier">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <p className="text-muted-foreground">Document not found.</p>
            <Link href="/tracker" className="text-summit hover:underline mt-2 inline-block">
              Back to tracker
            </Link>
          </div>
        </main>
      </SidebarInset>
    );
  }

  const currentStageIdx = getStageIndex(doc.stage);
  const stageConfig = getStageConfig(doc.stage);

  const completedCount = doc.actionItems.filter((a) => doc.completedActions[a.id]).length;
  const totalActions = doc.actionItems.length;
  const progressPct = totalActions > 0 ? (completedCount / totalActions) * 100 : 0;

  return (
    <SidebarInset className="bg-glacier">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
        <h1 className="font-display text-lg font-semibold text-deep-blue">Document</h1>
        <div className="flex-1" />
        <AppNavbar />
      </header>
      <main className="min-h-screen bg-glacier pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link href="/tracker">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-deep-blue mb-6 -ml-2">
              <ArrowLeft className="size-4" />
              Back to tracker
            </Button>
          </Link>

          {/* ───────── 2. Header card ───────── */}
          <Card className="border-0 shadow-md mb-6 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-summit via-summit/70 to-deep-blue" />
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Employee avatar */}
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-deep-blue/10 text-deep-blue font-semibold text-lg">
                    {(doc.employeeName ?? doc.title).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {doc.documentType}
                    </p>
                    <CardTitle className="text-xl font-bold text-deep-blue">
                      {doc.title}
                    </CardTitle>
                    {doc.employeeName && (
                      <CardDescription className="mt-1">{doc.employeeName}</CardDescription>
                    )}
                  </div>
                </div>
                {/* Stage badge */}
                <Badge className={cn("shrink-0", stageConfig.bg, stageConfig.color, "border-0")}>
                  {stageConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Separator className="my-4" />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {doc.sentAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Sent {new Date(doc.sentAt).toLocaleDateString()}
                  </span>
                )}
                {doc.acknowledgedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <UserCheck className="size-3.5" />
                    Acknowledged {new Date(doc.acknowledgedAt).toLocaleDateString()}
                  </span>
                )}
                {doc.reminderCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Bell className="size-3.5" />
                    {doc.reminderCount} reminder{doc.reminderCount !== 1 ? "s" : ""} sent
                  </span>
                )}
                {!doc.sentAt && !doc.acknowledgedAt && doc.reminderCount === 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Awaiting action
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ───────── 3. Horizontal stage stepper ───────── */}
          <Card className="border-0 shadow-md mb-6">
            <CardContent className="py-6">
              <div className="flex items-start justify-between">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const isUpcoming = idx > currentStageIdx;
                  const StageIcon = stage.icon;

                  return (
                    <div key={stage.key} className="flex items-start flex-1 last:flex-none">
                      {/* Step circle + label */}
                      <div className="flex flex-col items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "relative flex size-9 items-center justify-center rounded-full transition-all",
                                isCompleted && "bg-emerald-500 text-white",
                                isCurrent && "bg-white border-2 border-summit shadow-lg ring-4 ring-summit/10",
                                isUpcoming && "bg-slate-100 text-slate-400"
                              )}
                            >
                              {isCompleted ? (
                                <Check className="size-4" />
                              ) : isCurrent ? (
                                <StageIcon className="size-4 text-summit animate-pulse" />
                              ) : (
                                <StageIcon className="size-4" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{stage.label}</TooltipContent>
                        </Tooltip>
                        <span
                          className={cn(
                            "text-[11px] mt-2 text-center max-w-[70px] leading-tight",
                            isCompleted && "text-emerald-600 font-medium",
                            isCurrent && "text-summit font-semibold",
                            isUpcoming && "text-slate-400"
                          )}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {/* Connector line */}
                      {idx < STAGES.length - 1 && (
                        <div className="flex-1 flex items-center pt-[18px] px-2">
                          <div
                            className={cn(
                              "h-0.5 w-full rounded-full",
                              idx < currentStageIdx - 1 && "bg-emerald-500",
                              idx === currentStageIdx - 1 && "bg-gradient-to-r from-emerald-500 to-summit",
                              idx === currentStageIdx && "bg-gradient-to-r from-summit to-slate-200",
                              idx > currentStageIdx && "bg-slate-200"
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ───────── 4a. Document preview ───────── */}
          {doc.renderedContent && (
            <Card className="border-0 shadow-md mb-6 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50/80 px-6 py-3 border-b border-slate-200">
                <h2 className="font-semibold text-deep-blue flex items-center gap-2 text-sm">
                  <FileText className="size-4" />
                  Document Preview
                </h2>
                <a
                  href={`/api/tracked-documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </a>
              </div>
              <CardContent className="p-4">
                <div className="border border-slate-200 rounded-lg bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
                  <ScrollArea className="h-[500px]">
                    <div className="px-8 py-6">
                      <div className="text-sm text-deep-blue/90 prose prose-sm max-w-none">
                        <MarkdownRenderer content={doc.renderedContent} />
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ───────── 4b. Send email ───────── */}
          {(doc.stage === "draft" || doc.stage === "on_us_to_send") && (
            <Card className="border-0 shadow-md mb-6 border-l-4 border-l-summit overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-deep-blue flex items-center gap-2 text-base">
                  <Send className="size-4" />
                  Send Document via Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="employee-email">Employee email address</Label>
                    <Input
                      id="employee-email"
                      type="email"
                      placeholder="name@company.com"
                      value={employeeEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={sendDocument}
                      disabled={sending || !employeeEmail}
                      className="gap-1.5 bg-summit text-white hover:bg-summit/90"
                    >
                      {sending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Mail className="size-4" />
                      )}
                      {sending ? "Sending..." : "Send Email"}
                    </Button>
                  </div>
                </div>
                {sendError && (
                  <p className="mt-2 text-sm text-red-600">{sendError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* ───────── 4c. Action items ───────── */}
          {doc.actionItems.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-deep-blue text-base">
                    Action items
                  </CardTitle>
                  <span className="text-sm font-medium text-muted-foreground">
                    {completedCount} / {totalActions} completed
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-summit to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <ul className="space-y-2">
                  {doc.actionItems.map((action) => {
                    const done = !!doc.completedActions[action.id];
                    const saving = savingAction === action.id;
                    return (
                      <li
                        key={action.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg transition-colors",
                          done
                            ? "bg-emerald-50/60"
                            : "bg-muted/20 hover:bg-muted/40"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleAction(action.id, !done)}
                          disabled={saving}
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
                            done
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 bg-white hover:border-summit"
                          )}
                        >
                          {saving ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : done ? (
                            <Check className="size-3" />
                          ) : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "text-sm",
                              done
                                ? "text-muted-foreground line-through"
                                : "text-deep-blue"
                            )}
                          >
                            {action.label}
                          </span>
                          {action.mailto && !done && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                className="gap-1.5 bg-summit text-white hover:bg-summit/90"
                                onClick={() => openMailto(action)}
                              >
                                <Mail className="size-3.5" />
                                Open email (subject & message ready)
                              </Button>
                              <a
                                href={`/api/tracked-documents/${doc.id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="outline" className="gap-1.5">
                                  <Download className="size-3.5" />
                                  Download to attach
                                </Button>
                              </a>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Move to next stage button */}
                {completedCount === totalActions && totalActions > 0 && currentStageIdx < STAGES.length - 1 && (
                  <>
                    <Separator className="mt-4 mb-4" />
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2 className="size-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">All actions complete!</p>
                          <p className="text-xs text-emerald-600">
                            Ready to move to {STAGES[currentStageIdx + 1].label}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={advanceStage}
                        disabled={advancingStage}
                        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {advancingStage ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ArrowRight className="size-4" />
                        )}
                        {advancingStage ? "Moving..." : "Move to Next Stage"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ───────── 5. Completed celebration ───────── */}
          {doc.actionItems.length === 0 && doc.stage === "completed" && (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
              <CardContent className="py-10 flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <Mountain className="size-8 text-emerald-600" />
                </div>
                <h2 className="font-display text-xl font-bold text-deep-blue mb-2">
                  Summit Reached
                </h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  This document has been completed successfully. All stages have been cleared and no further actions are required.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </SidebarInset>
  );
}
