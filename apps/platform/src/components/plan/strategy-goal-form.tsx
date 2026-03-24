"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  STRATEGY_HORIZONS,
  STRATEGY_HORIZON_LABELS,
  STRATEGY_HORIZON_SUGGESTIONS,
  STRATEGY_GOAL_STATUSES,
} from "@ascenta/db/strategy-goal-constants";
import type { StrategyGoalData } from "./strategy-goal-card";

interface StrategyGoalFormProps {
  accentColor: string;
  onClose: () => void;
  onSaved: () => void;
  editGoal?: StrategyGoalData | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  on_track: "On Track",
  needs_attention: "Needs Attention",
  off_track: "Off Track",
  completed: "Completed",
  archived: "Archived",
};

export function StrategyGoalForm({
  accentColor,
  onClose,
  onSaved,
  editGoal,
}: StrategyGoalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [horizon, setHorizon] = useState<string>("short_term");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scope, setScope] = useState<"company" | "department">("company");
  const [department, setDepartment] = useState("");
  const [successMetrics, setSuccessMetrics] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [departments, setDepartments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Load departments from employees
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/dashboard/employees?limit=200");
        const data = await res.json();
        if (data.employees) {
          const depts = [
            ...new Set(
              data.employees
                .map((e: { department?: string }) => e.department)
                .filter(Boolean),
            ),
          ] as string[];
          setDepartments(depts.sort());
        }
      } catch {
        // silent
      }
    }
    fetchDepartments();
  }, []);

  // Pre-fill if editing
  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setDescription(editGoal.description);
      setHorizon(editGoal.horizon);
      setStartDate(editGoal.timePeriod.start.split("T")[0]);
      setEndDate(editGoal.timePeriod.end.split("T")[0]);
      setScope(editGoal.scope as "company" | "department");
      setDepartment(editGoal.department ?? "");
      setSuccessMetrics(editGoal.successMetrics);
      setStatus(editGoal.status);
    }
  }, [editGoal]);

  async function handleAiAssist(field: "description" | "successMetrics") {
    setAiLoading(field);
    try {
      const section = field === "description" ? "strategy_description" : "strategy_metrics";
      const context = `Title: ${title}\nHorizon: ${STRATEGY_HORIZON_LABELS[horizon as keyof typeof STRATEGY_HORIZON_LABELS]}\nScope: ${scope === "department" ? department : "Company-wide"}`;
      const res = await fetch("/api/plan/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          currentValue: field === "description" ? description : successMetrics,
          context,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (field === "description") setDescription(data.text);
        else setSuccessMetrics(data.text);
      }
    } catch {
      // silent
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (scope === "department" && !department) newErrors.department = "Department is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const url = editGoal
        ? `/api/plan/strategy-goals/${editGoal.id}`
        : "/api/plan/strategy-goals";
      const method = editGoal ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          horizon,
          startDate,
          endDate,
          scope,
          department: scope === "department" ? department : "",
          successMetrics,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        setErrors({ form: typeof data.error === "string" ? data.error : "Failed to save" });
      }
    } catch {
      setErrors({ form: "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-display text-base font-bold text-deep-blue">
            {editGoal ? "Edit Strategy Goal" : "Create Strategy Goal"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              placeholder="e.g., Expand into APAC market"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description + AI Assist */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <button
                type="button"
                onClick={() => handleAiAssist("description")}
                disabled={aiLoading !== null}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: accentColor }}
              >
                {aiLoading === "description" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI Assist
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="Describe the strategic objective..."
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Horizon + Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horizon
              </label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                {STRATEGY_HORIZONS.map((h) => (
                  <option key={h} value={h}>
                    {STRATEGY_HORIZON_LABELS[h]} ({STRATEGY_HORIZON_SUGGESTIONS[h]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Start
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                End
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Scope + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "company" | "department")}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="company">Company-wide</option>
                <option value="department">Department</option>
              </select>
            </div>
            {scope === "department" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                >
                  <option value="">Select department...</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
            )}
          </div>

          {/* Success Metrics + AI Assist */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Success Metrics
              </label>
              <button
                type="button"
                onClick={() => handleAiAssist("successMetrics")}
                disabled={aiLoading !== null}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: accentColor }}
              >
                {aiLoading === "successMetrics" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI Assist
              </button>
            </div>
            <textarea
              value={successMetrics}
              onChange={(e) => setSuccessMetrics(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="How will success be measured?"
            />
          </div>

          {/* Status (edit only) */}
          {editGoal && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                {STRATEGY_GOAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s] ?? s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errors.form && (
            <p className="text-xs text-red-500">{errors.form}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editGoal ? (
                "Save Changes"
              ) : (
                "Create Goal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
