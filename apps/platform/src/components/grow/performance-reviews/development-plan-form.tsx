"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@ascenta/ui/button";
import type { DevelopmentPlanStatus } from "@ascenta/db/performance-review-categories";
import { ChevronLeft, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@ascenta/ui";

interface AreaItem {
  area: string;
  actions: string; // textarea: one per line
  timeline: string;
  owner: string;
}

interface DevelopmentPlanValue {
  areasOfImprovement: AreaItem[];
  managerCommitments: string; // textarea: one per line
  nextReviewDate: string; // YYYY-MM-DD for input[type=date]
}

interface DevelopmentPlanFormProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  accentColor: string;
  onBack: () => void;
  onFinalized: () => void;
}

function buildInitialPlan(): DevelopmentPlanValue {
  return {
    areasOfImprovement: [],
    managerCommitments: "",
    nextReviewDate: "",
  };
}

function serializePlan(plan: DevelopmentPlanValue) {
  return {
    areasOfImprovement: plan.areasOfImprovement.map((a) => ({
      area: a.area,
      actions: a.actions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      timeline: a.timeline,
      owner: a.owner,
    })),
    managerCommitments: plan.managerCommitments
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    nextReviewDate: plan.nextReviewDate ? new Date(plan.nextReviewDate).toISOString() : null,
  };
}

function deserializePlan(raw: {
  areasOfImprovement?: Array<{
    area?: string;
    actions?: string[];
    timeline?: string;
    owner?: string;
  }>;
  managerCommitments?: string[];
  nextReviewDate?: string | null;
}): DevelopmentPlanValue {
  return {
    areasOfImprovement: (raw.areasOfImprovement ?? []).map((a) => ({
      area: a.area ?? "",
      actions: (a.actions ?? []).join("\n"),
      timeline: a.timeline ?? "",
      owner: a.owner ?? "",
    })),
    managerCommitments: (raw.managerCommitments ?? []).join("\n"),
    nextReviewDate: raw.nextReviewDate
      ? new Date(raw.nextReviewDate).toISOString().slice(0, 10)
      : "",
  };
}

export function DevelopmentPlanForm({
  reviewId,
  employeeName,
  reviewPeriod,
  accentColor,
  onBack,
  onFinalized,
}: DevelopmentPlanFormProps) {
  const [plan, setPlan] = useState<DevelopmentPlanValue>(buildInitialPlan);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const planRef = useRef<DevelopmentPlanValue>(plan);
  // True if status is already "draft" or "finalized" — so first save doesn't re-send status
  const hasFirstSavedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPlan() {
      try {
        const res = await fetch(`/api/grow/reviews/${reviewId}`);
        if (!res.ok) {
          if (!cancelled)
            setSaveError("Could not load saved progress. Your changes will still be saved.");
          return;
        }
        if (cancelled) return;

        const data = await res.json();
        const devPlan = data?.review?.developmentPlan;
        const devStatus: DevelopmentPlanStatus = devPlan?.status ?? "not_started";

        if (!cancelled) {
          if (devStatus !== "not_started") {
            hasFirstSavedRef.current = true;
          }
          if (devStatus === "finalized") {
            setFinalized(true);
          }
          if (devPlan) {
            const loaded = deserializePlan(devPlan);
            setPlan(loaded);
            planRef.current = loaded;
          }
        }
      } finally {
        if (!cancelled) setIsLoadingInitial(false);
      }
    }

    loadPlan();
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  const savePlan = useCallback(
    async (current: DevelopmentPlanValue) => {
      setIsSaving(true);
      try {
        const body: Record<string, unknown> = { ...serializePlan(current) };
        if (!hasFirstSavedRef.current) {
          hasFirstSavedRef.current = true;
          body.status = "draft";
        }

        const res = await fetch(`/api/grow/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ developmentPlan: body }),
        });

        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as { error?: string };
          setSaveError(errorData?.error ?? "Failed to save — please try again.");
        } else {
          setSaveError(null);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [reviewId],
  );

  const scheduleAutoSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      savePlan(planRef.current);
    }, 500);
  }, [savePlan]);

  // --- Area helpers ---

  const handleAddArea = useCallback(() => {
    setPlan((prev) => {
      const next = {
        ...prev,
        areasOfImprovement: [
          ...prev.areasOfImprovement,
          { area: "", actions: "", timeline: "", owner: "" },
        ],
      };
      planRef.current = next;
      return next;
    });
  }, []);

  const handleRemoveArea = useCallback(
    (index: number) => {
      setPlan((prev) => {
        const next = {
          ...prev,
          areasOfImprovement: prev.areasOfImprovement.filter((_, i) => i !== index),
        };
        planRef.current = next;
        savePlan(next);
        return next;
      });
    },
    [savePlan],
  );

  const handleAreaChange = useCallback(
    (index: number, field: keyof AreaItem, value: string) => {
      setPlan((prev) => {
        const next = {
          ...prev,
          areasOfImprovement: prev.areasOfImprovement.map((a, i) =>
            i === index ? { ...a, [field]: value } : a,
          ),
        };
        planRef.current = next;
        return next;
      });
    },
    [],
  );

  const handleCommitmentsChange = useCallback((value: string) => {
    setPlan((prev) => {
      const next = { ...prev, managerCommitments: value };
      planRef.current = next;
      return next;
    });
  }, []);

  const handleDateChange = useCallback((value: string) => {
    setPlan((prev) => {
      const next = { ...prev, nextReviewDate: value };
      planRef.current = next;
      return next;
    });
  }, []);

  // --- Finalize ---

  const handleFinalize = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setIsFinalizing(true);
    setFinalizeError(null);
    try {
      const res = await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developmentPlan: {
            status: "finalized",
            ...serializePlan(planRef.current),
          },
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as { error?: string };
        setFinalizeError(errorData?.error ?? "Failed to finalize — please try again.");
        return;
      }

      setFinalized(true);
      onFinalized();
    } finally {
      setIsFinalizing(false);
    }
  }, [reviewId, onFinalized]);

  const noAreasWarning = plan.areasOfImprovement.length === 0 && !finalized;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h2 className="text-base font-semibold text-foreground">Development Plan</h2>
            <p className="text-sm text-muted-foreground">
              {employeeName} · {reviewPeriod}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm shrink-0">
          {finalized ? (
            <>
              <CheckCircle2 className="h-4 w-4" style={{ color: accentColor }} />
              <span style={{ color: accentColor }} className="font-medium">
                Finalized
              </span>
            </>
          ) : saveError ? (
            <span className="text-red-500">{saveError}</span>
          ) : isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Saving…</span>
            </>
          ) : (
            <span className="text-muted-foreground">Auto-saving</span>
          )}
        </div>
      </div>

      {isLoadingInitial ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Areas of Improvement */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Areas of Improvement</h3>
              {!finalized && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleAddArea}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add area
                </Button>
              )}
            </div>

            {plan.areasOfImprovement.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No areas added yet.{" "}
                {!finalized && "Click \u201cAdd area\u201d to add the first item."}
              </p>
            )}

            {plan.areasOfImprovement.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Area {index + 1}
                  </p>
                  {!finalized && (
                    <button
                      onClick={() => handleRemoveArea(index)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                      aria-label="Remove area"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Area</label>
                  <input
                    type="text"
                    value={item.area}
                    disabled={finalized}
                    onChange={(e) => handleAreaChange(index, "area", e.target.value)}
                    onBlur={scheduleAutoSave}
                    placeholder="e.g. Communication with cross-functional teams"
                    className={cn(
                      "w-full rounded-md border bg-background px-3 py-1.5 text-sm",
                      "placeholder:text-muted-foreground/50",
                      "focus:outline-none focus:ring-2 focus:ring-ring",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Actions <span className="text-muted-foreground/60">(one per line)</span>
                  </label>
                  <textarea
                    value={item.actions}
                    disabled={finalized}
                    onChange={(e) => handleAreaChange(index, "actions", e.target.value)}
                    onBlur={scheduleAutoSave}
                    placeholder={"e.g. Attend weekly sync\nPresent updates in all-hands"}
                    rows={3}
                    className={cn(
                      "w-full rounded-md border bg-background px-3 py-1.5 text-sm resize-none",
                      "placeholder:text-muted-foreground/50",
                      "focus:outline-none focus:ring-2 focus:ring-ring",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Timeline</label>
                    <input
                      type="text"
                      value={item.timeline}
                      disabled={finalized}
                      onChange={(e) => handleAreaChange(index, "timeline", e.target.value)}
                      onBlur={scheduleAutoSave}
                      placeholder="e.g. Q3 2026"
                      className={cn(
                        "w-full rounded-md border bg-background px-3 py-1.5 text-sm",
                        "placeholder:text-muted-foreground/50",
                        "focus:outline-none focus:ring-2 focus:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Owner</label>
                    <input
                      type="text"
                      value={item.owner}
                      disabled={finalized}
                      onChange={(e) => handleAreaChange(index, "owner", e.target.value)}
                      onBlur={scheduleAutoSave}
                      placeholder="e.g. Employee + Manager"
                      className={cn(
                        "w-full rounded-md border bg-background px-3 py-1.5 text-sm",
                        "placeholder:text-muted-foreground/50",
                        "focus:outline-none focus:ring-2 focus:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Manager Commitments */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Manager Commitments</h3>
            <p className="text-xs text-muted-foreground">One commitment per line.</p>
            <textarea
              value={plan.managerCommitments}
              disabled={finalized}
              onChange={(e) => handleCommitmentsChange(e.target.value)}
              onBlur={scheduleAutoSave}
              placeholder={"e.g. Provide bi-weekly feedback sessions\nShare relevant resources and training opportunities"}
              rows={4}
              className={cn(
                "w-full rounded-md border bg-background px-3 py-2 text-sm resize-none",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
          </div>

          {/* Next Review Date */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Next Review Date</h3>
            <input
              type="date"
              value={plan.nextReviewDate}
              disabled={finalized}
              onChange={(e) => handleDateChange(e.target.value)}
              onBlur={scheduleAutoSave}
              className={cn(
                "rounded-md border bg-background px-3 py-1.5 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col items-end gap-2 pt-2">
            {noAreasWarning && (
              <p className="text-xs text-amber-600">
                No areas of improvement have been added yet.
              </p>
            )}
            {finalizeError && <p className="text-xs text-red-500">{finalizeError}</p>}

            {finalized ? (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: accentColor }}>
                <CheckCircle2 className="h-4 w-4" />
                Dev Plan Finalized
              </div>
            ) : (
              <Button
                onClick={handleFinalize}
                disabled={isFinalizing}
                className="text-white"
                style={{ backgroundColor: accentColor }}
              >
                {isFinalizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizing…
                  </>
                ) : (
                  "Finalize Dev Plan →"
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
