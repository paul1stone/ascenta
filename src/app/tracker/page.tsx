"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, Loader2, ChevronRight } from "lucide-react";

const STAGES = [
  { value: "draft", label: "Draft" },
  { value: "on_us_to_send", label: "On us to send" },
  { value: "sent", label: "Sent" },
  { value: "in_review", label: "In review" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "completed", label: "Completed" },
] as const;

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

export default function TrackerPage() {
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

  const byStage = STAGES.map((s) => ({
    ...s,
    docs: documents.filter((d) => d.stage === s.value),
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-glacier pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-deep-blue">
              Document tracker
            </h1>
            <p className="mt-1 text-muted-foreground">
              Move documents through delivery stages. Generated from Chat appear here.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="size-8 animate-spin text-summit" />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[420px]">
              {byStage.map((column) => (
                <div
                  key={column.value}
                  className="flex-shrink-0 w-72 rounded-xl bg-white/80 border border-border shadow-sm flex flex-col"
                >
                  <div className="p-3 border-b border-border">
                    <h2 className="font-semibold text-deep-blue">
                      {column.label}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {column.docs.length} document{column.docs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex-1 p-2 overflow-y-auto space-y-2">
                    {column.docs.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 px-2 text-center">
                        No documents
                      </p>
                    ) : (
                      column.docs.map((doc) => (
                        <Card
                          key={doc.id}
                          className="bg-white border-border shadow-sm"
                        >
                          <CardHeader className="p-3 pb-1">
                            <Link
                              href={`/tracker/${doc.id}`}
                              className="flex items-start gap-2 group"
                            >
                              <FileText className="size-4 text-summit shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-deep-blue text-sm leading-tight group-hover:text-summit">
                                  {doc.title}
                                </p>
                                {doc.employeeName && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {doc.employeeName}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:text-summit" />
                            </Link>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <select
                              value={doc.stage}
                              onChange={(e) => updateStage(doc.id, e.target.value)}
                              disabled={updatingId === doc.id}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            >
                              {STAGES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            {updatingId === doc.id && (
                              <Loader2 className="size-3 animate-spin mt-1 text-muted-foreground" />
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
