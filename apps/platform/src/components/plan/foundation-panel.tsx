"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Sparkles, Pencil, Eye, ExternalLink } from "lucide-react";
import { cn } from "@ascenta/ui";
import Link from "next/link";
import { useRole } from "@/lib/role/role-context";

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
  const [aiLoading, setAiLoading] = useState<SectionKey | null>(null);

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

  async function handleAiAssist(section: SectionKey) {
    setAiLoading(section);
    try {
      const otherSections = SECTIONS.filter((s) => s.key !== section)
        .map((s) => `${s.label}: ${form[s.key]}`)
        .filter((s) => s.split(": ")[1])
        .join("\n");

      const res = await fetch("/api/plan/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          currentValue: form[section] || undefined,
          context: otherSections || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, [section]: data.text }));
      }
    } catch {
      // silent
    } finally {
      setAiLoading(null);
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

  // Published read-only view
  if (foundation?.status === "published" && !editMode) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-deep-blue">
                Our Foundation
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
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
            {isAdmin && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="size-4" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-5">
            {SECTIONS.map((section) => (
              <div
                key={section.key}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <h3
                  className="font-display text-base font-bold mb-2"
                  style={{ color: accentColor }}
                >
                  {section.label}
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {foundation[section.key] || "Not yet defined."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
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
            <Link
              href="/do"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-4" />
              Use Do
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
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
                <button
                  onClick={() => handleAiAssist(section.key)}
                  disabled={aiLoading !== null}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    "border hover:bg-accent/5",
                  )}
                  style={{
                    color: accentColor,
                    borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                  }}
                >
                  {aiLoading === section.key ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  AI Assist
                </button>
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
