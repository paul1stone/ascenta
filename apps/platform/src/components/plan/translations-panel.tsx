"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Languages, RefreshCw, ChevronRight, AlertTriangle, Pencil, Check } from "lucide-react";
import { cn } from "@ascenta/ui";
import { TRANSLATION_STATUS_LABELS } from "@ascenta/db/strategy-translation-constants";
import { TranslationRolePreview } from "./translation-role-preview";

interface Role {
  jobTitle: string;
  level: string;
  contributions: {
    strategyGoalTitle: string;
    roleContribution: string;
    outcomes: string[];
    alignmentDescriptors: { strong: string; acceptable: string; poor: string };
  }[];
  behaviors: { valueName: string; expectation: string }[];
  decisionRights: { canDecide: string[]; canRecommend: string[]; mustEscalate: string[] };
}

interface TranslationData {
  id: string;
  department: string;
  version: number;
  status: string;
  generatedFrom: { generatedAt: string };
  roles: Role[];
  isStale: boolean;
  stalenessReasons: string[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  generating: "#8b5cf6",
  draft: "#f59e0b",
  published: "#22c55e",
  archived: "#6b7280",
};

interface TranslationsPanelProps {
  accentColor: string;
}

export function TranslationsPanel({ accentColor }: TranslationsPanelProps) {
  const [translations, setTranslations] = useState<TranslationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/plan/strategy-translations");
      const data = await res.json();
      if (data.success) {
        setTranslations(data.translations ?? []);
      } else {
        setError(data.error ?? "Failed to fetch");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  async function handleGenerate(department: string) {
    setGenerating(department);
    try {
      const res = await fetch("/api/plan/strategy-translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Generation failed");
      }
      await fetchTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  async function handleGenerateAll() {
    setGenerating("all");
    try {
      const res = await fetch("/api/plan/strategy-translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: "all" }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Generation failed");
      }
      await fetchTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  async function handlePublish(id: string) {
    await fetch(`/api/plan/strategy-translations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    fetchTranslations();
  }

  async function handleArchive(id: string) {
    await fetch(`/api/plan/strategy-translations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    fetchTranslations();
  }

  function handleStartEdit(translation: TranslationData) {
    setEditingId(translation.id);
    setEditRoles(JSON.parse(JSON.stringify(translation.roles)));
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditRoles([]);
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/plan/strategy-translations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: editRoles }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        setEditRoles([]);
        fetchTranslations();
      } else {
        setError(data.error ?? "Save failed");
      }
    } catch {
      setError("Failed to save edits");
    } finally {
      setSaving(false);
    }
  }

  function handleFieldChange(roleIndex: number, field: string, value: unknown) {
    setEditRoles((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const parts = field.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let target: any = updated[roleIndex];
      for (let i = 0; i < parts.length - 1; i++) {
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
      return updated;
    });
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group by department — show latest version per department
  const byDept = new Map<string, TranslationData>();
  for (const t of translations) {
    const existing = byDept.get(t.department);
    if (!existing || t.version > existing.version) {
      byDept.set(t.department, t);
    }
  }
  const departments = [...byDept.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-bold text-deep-blue">
              Strategic Translations
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-generated role-based language derived from your Foundation and Strategic Priorities.
            </p>
          </div>
          <button
            onClick={handleGenerateAll}
            disabled={generating !== null}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: accentColor }}
          >
            {generating === "all" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Generate All
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 mb-4">
            {error}
          </div>
        )}

        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Languages className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Translations Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Generate strategic translations to convert your strategy into role-based language.
            </p>
            <button
              onClick={handleGenerateAll}
              disabled={generating !== null}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              Generate All Departments
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map(([dept, translation]) => {
              const isExpanded = expandedDept === dept;
              const statusColor = STATUS_COLORS[translation.status] ?? "#6b7280";
              const statusLabel =
                TRANSLATION_STATUS_LABELS[
                  translation.status as keyof typeof TRANSLATION_STATUS_LABELS
                ] ?? translation.status;

              return (
                <div key={dept} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedDept(isExpanded ? null : dept)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className="flex-1 font-display text-sm font-semibold text-deep-blue">
                      {dept}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {translation.roles.length} role{translation.roles.length !== 1 ? "s" : ""}
                    </span>
                    {translation.isStale && (
                      <span title={translation.stalenessReasons.join(", ")}>
                        <AlertTriangle className="size-4 text-amber-500" />
                      </span>
                    )}
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${statusColor} 12%, white)`,
                        color: statusColor,
                      }}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      v{translation.version}
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-90",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200",
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t px-5 py-4 space-y-4">
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleGenerate(dept)}
                            disabled={generating !== null}
                            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                          >
                            {generating === dept ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <RefreshCw className="size-3" />
                            )}
                            Regenerate
                          </button>
                          {(translation.status === "draft" || translation.status === "published") && editingId !== translation.id && (
                            <button
                              onClick={() => handleStartEdit(translation)}
                              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3" />
                              Edit
                            </button>
                          )}
                          {editingId === translation.id && (
                            <>
                              <button
                                onClick={() => handleSaveEdit(translation.id)}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40"
                                style={{ backgroundColor: "#22c55e" }}
                              >
                                {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {translation.status === "draft" && editingId !== translation.id && (
                            <button
                              onClick={() => handlePublish(translation.id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                              style={{ backgroundColor: "#22c55e" }}
                            >
                              Publish
                            </button>
                          )}
                          {translation.status !== "archived" && editingId !== translation.id && (
                            <button
                              onClick={() => handleArchive(translation.id)}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Archive
                            </button>
                          )}
                        </div>

                        {/* Role previews */}
                        {(editingId === translation.id ? editRoles : translation.roles).map((role, i) => (
                          <TranslationRolePreview
                            key={i}
                            jobTitle={role.jobTitle}
                            level={role.level}
                            contributions={role.contributions}
                            behaviors={role.behaviors}
                            decisionRights={role.decisionRights}
                            accentColor={accentColor}
                            editing={editingId === translation.id}
                            onFieldChange={(field, value) => handleFieldChange(i, field, value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
