"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, ArrowLeft, Mail, Download, Check, Send } from "lucide-react";

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

const STAGE_LABELS: Record<string, string> = {
  draft: "Draft",
  on_us_to_send: "On us to send",
  sent: "Sent",
  in_review: "In review",
  acknowledged: "Acknowledged",
  completed: "Completed",
};

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

  if (loading || !id) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-glacier pt-16 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-summit" />
        </main>
      </>
    );
  }

  if (!doc) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-glacier pt-16">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <p className="text-muted-foreground">Document not found.</p>
            <Link href="/tracker" className="text-summit hover:underline mt-2 inline-block">
              Back to tracker
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-glacier pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/tracker"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-deep-blue mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to tracker
          </Link>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-deep-blue">
              {doc.title}
            </h1>
            {doc.employeeName && (
              <p className="text-muted-foreground mt-1">{doc.employeeName}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-block text-xs font-medium text-summit bg-summit/10 px-2 py-1 rounded">
                {STAGE_LABELS[doc.stage] ?? doc.stage}
              </span>
              {doc.sentAt && (
                <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                  Sent at {new Date(doc.sentAt).toLocaleDateString()}
                </span>
              )}
              {doc.acknowledgedAt && (
                <span className="inline-block text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                  Acknowledged at {new Date(doc.acknowledgedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {doc.renderedContent && (
            <Card className="mb-8 bg-white border-border">
              <CardHeader className="py-3">
                <h2 className="font-semibold text-deep-blue flex items-center gap-2">
                  <FileText className="size-4" />
                  Document
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="whitespace-pre-wrap font-sans text-sm text-deep-blue/90 bg-muted/30 p-4 rounded-lg max-h-80 overflow-y-auto">
                  {doc.renderedContent}
                </pre>
                <a
                  href={`/api/tracked-documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-summit hover:underline"
                >
                  <Download className="size-4" />
                  Download document (.md)
                </a>
              </CardContent>
            </Card>
          )}

          {(doc.stage === "draft" || doc.stage === "on_us_to_send") && (
            <Card className="mb-8 bg-white border-border">
              <CardHeader className="py-3">
                <h2 className="font-semibold text-deep-blue flex items-center gap-2">
                  <Send className="size-4" />
                  Send Document via Email
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Employee email address"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
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
                    {sending ? "Sending..." : "Send Document via Email"}
                  </Button>
                </div>
                {sendError && (
                  <p className="mt-2 text-sm text-red-600">{sendError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {doc.actionItems.length > 0 && (
            <Card className="bg-white border-border">
              <CardHeader className="py-3">
                <h2 className="font-semibold text-deep-blue">
                  Action items to complete
                </h2>
                <p className="text-sm text-muted-foreground">
                  Complete these to move this document out of &quot;{STAGE_LABELS[doc.stage] ?? doc.stage}&quot;.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {doc.actionItems.map((action) => {
                    const done = !!doc.completedActions[action.id];
                    const saving = savingAction === action.id;
                    return (
                      <li
                        key={action.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20"
                      >
                        <button
                          type="button"
                          onClick={() => toggleAction(action.id, !done)}
                          disabled={saving}
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-input bg-background text-summit focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : done ? (
                            <Check className="size-3" />
                          ) : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <span
                            className={
                              done
                                ? "text-muted-foreground line-through"
                                : "text-deep-blue"
                            }
                          >
                            {action.label}
                          </span>
                          {action.mailto && (
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
              </CardContent>
            </Card>
          )}

          {doc.actionItems.length === 0 && doc.stage === "completed" && (
            <Card className="bg-white border-border">
              <CardContent className="py-6 text-center text-muted-foreground">
                This document is completed. No further actions.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
