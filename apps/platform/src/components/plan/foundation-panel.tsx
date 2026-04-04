"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Pencil, Eye, Compass, Download } from "lucide-react";
import Link from "next/link";
import { useRole } from "@/lib/role/role-context";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";

interface FoundationData {
  id: string;
  mission: string;
  vision: string;
  values: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
}

type SectionKey = "mission" | "vision" | "values";

const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
  {
    key: "mission",
    label: "Mission",
    description: "What does your company do, who does it serve, and why does it exist?",
  },
  {
    key: "vision",
    label: "Vision",
    description: "What future is your company working to create?",
  },
  {
    key: "values",
    label: "Values",
    description: "What principles guide how your company operates and makes decisions?",
  },
];

interface FoundationPanelProps {
  accentColor: string;
}

export function FoundationPanel({ accentColor }: FoundationPanelProps) {
  const { role } = useRole();
  const isAdmin = role === "hr";
  const [foundation, setFoundation] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ mission: "", vision: "", values: "" });

  const fetchFoundation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/plan/foundation");
      const data = await res.json();
      if (data.success) {
        setFoundation(data.foundation);
        if (data.foundation) {
          setForm({
            mission: data.foundation.mission,
            vision: data.foundation.vision,
            values: data.foundation.values,
          });
          setEditMode(data.foundation.status === "draft");
        } else {
          setEditMode(true);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoundation();
  }, [fetchFoundation]);

  // Gate edit mode based on role — runs after foundation loads and when role changes
  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      setEditMode(false);
    } else if (!foundation || foundation.status === "draft") {
      setEditMode(true);
    }
  }, [loading, isAdmin, foundation?.status]);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/plan/foundation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setFoundation(data.foundation);
      }
    } catch {
      // silent — user sees the form still
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    const res = await fetch("/api/plan/foundation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    const data = await res.json();
    if (data.success) {
      setFoundation(data.foundation);
      setEditMode(false);
    }
  }

  async function handleUnpublish() {
    const res = await fetch("/api/plan/foundation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unpublish" }),
    });
    const data = await res.json();
    if (data.success) {
      setFoundation(data.foundation);
      setEditMode(true);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  function handleExportPdf() {
    const cardEl = document.getElementById("foundation-card");
    if (!cardEl) return;
    const clone = cardEl.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-no-print]").forEach((el) => el.remove());
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(
      `<!DOCTYPE html><html><head><title>Company Foundation</title>` +
      `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Geist:wght@400;500&display=swap" rel="stylesheet">` +
      `<style>body{font-family:'Geist',system-ui,sans-serif;margin:40px;color:#0c1e3d}` +
      `@media print{body{margin:20px}}` +
      `h1,h2,h3,h4{font-family:'Plus Jakarta Sans',sans-serif}` +
      `ul,ol{padding-left:18px}li{margin-bottom:4px}` +
      `strong{color:#0c1e3d}p{line-height:1.7;color:#475569;margin:0 0 8px}` +
      `</style></head><body>${clone.innerHTML}</body></html>`,
    );
    printWindow.document.close();
    printWindow.print();
  }

  // Published read-only view
  if (foundation?.status === "published" && !editMode) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Editorial single-card layout */}
          <div id="foundation-card" className="rounded-2xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Hero header */}
            <div
              className="relative px-8 pt-7 pb-5"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${accentColor} 8%, white) 0%, white 70%)`,
                borderBottom: `1px solid color-mix(in srgb, ${accentColor} 12%, #e2e8f0)`,
              }}
            >
              <div
                className="absolute left-0 top-0 h-full w-1 rounded-r"
                style={{
                  background: `linear-gradient(180deg, ${accentColor}, color-mix(in srgb, ${accentColor} 30%, transparent))`,
                }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="font-display text-[11px] font-semibold uppercase tracking-[0.08em] mb-1"
                    style={{ color: accentColor }}
                  >
                    Company Foundation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Published{" "}
                    {foundation.publishedAt
                      ? new Date(foundation.publishedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2" data-no-print>
                  <button
                    onClick={handleExportPdf}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-white/60"
                  >
                    <Download className="size-3.5" />
                    Export PDF
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-white/60"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sections */}
            <div>
              {SECTIONS.map((section, i) => (
                <div
                  key={section.key}
                  className={`px-8 py-6 ${i > 0 ? "border-t border-border/50" : ""}`}
                >
                  <h4 className="font-display text-sm font-bold text-deep-blue mb-2.5">
                    {section.label}
                  </h4>
                  {foundation[section.key] ? (
                    <MarkdownRenderer
                      content={foundation[section.key]}
                      className="text-sm text-muted-foreground leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:text-muted-foreground [&_strong]:text-foreground"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Not yet defined.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode (HR only)
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-deep-blue">
              Company Foundation
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Define your company&apos;s mission, vision, and values.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {foundation?.status === "published" && (
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="size-4" />
                View
              </button>
            )}
          </div>
        </div>

        {/* Compass CTA — primary action */}
        <Link
          href="/do?tool=buildMVV&prompt=Help%20me%20build%20our%20company%27s%20mission%2C%20vision%2C%20and%20values"
          className="flex items-center gap-3 rounded-xl border p-4 mb-6 transition-colors hover:border-[--accent] hover:bg-[--accent-bg]"
          style={{
            "--accent": "#ff6b35",
            "--accent-bg": "rgba(255, 107, 53, 0.04)",
          } as React.CSSProperties}
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
          >
            <Compass className="size-5" style={{ color: "#ff6b35" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-deep-blue">
              Brainstorm with Compass
            </p>
            <p className="text-xs text-muted-foreground">
              Use AI to help craft your mission, vision, and values through guided conversation.
            </p>
          </div>
        </Link>

        {/* Manual editing — secondary action */}
        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-3">
                <h3
                  className="font-display text-base font-bold"
                  style={{ color: accentColor }}
                >
                  {section.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {section.description}
                </p>
              </div>
              <textarea
                value={form[section.key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [section.key]: e.target.value }))
                }
                onBlur={handleSave}
                placeholder={`Enter your company's ${section.label.toLowerCase()}...`}
                rows={4}
                className="w-full rounded-lg border px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[--accent] resize-y"
                style={{
                  "--accent": accentColor,
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {saving ? "Saving..." : foundation ? "Auto-saved" : ""}
          </p>
          <div className="flex items-center gap-2">
            {foundation?.status === "published" ? (
              <button
                onClick={handleUnpublish}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Unpublish
              </button>
            ) : null}
            <button
              onClick={handlePublish}
              disabled={!form.mission && !form.vision && !form.values}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              {foundation?.status === "published" ? "Re-publish" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
