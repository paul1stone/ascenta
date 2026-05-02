"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import {
  STRATEGY_HORIZONS,
  STRATEGY_HORIZON_LABELS,
  STRATEGY_HORIZON_SUGGESTIONS,
  STRATEGY_GOAL_STATUSES,
} from "@ascenta/db/strategy-goal-constants";
import type { StrategyGoalData } from "./strategy-goal-card";
import type { UserRole } from "@/lib/auth/auth-context";

interface StrategyGoalFormProps {
  accentColor: string;
  onClose: () => void;
  onSaved: () => void;
  editGoal?: StrategyGoalData | null;
  userRole: UserRole | null;
  userId?: string;
  userDepartment?: string;
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
  userRole,
  userId,
  userDepartment,
}: StrategyGoalFormProps) {
  const isManager = userRole === "manager";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [horizon, setHorizon] = useState<string>("short_term");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scope, setScope] = useState<"company" | "department">(
    isManager ? "department" : "company",
  );
  const [department, setDepartment] = useState(isManager ? (userDepartment ?? "") : "");
  const [successMetrics, setSuccessMetrics] = useState("");
  const [rationale, setRationale] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [departments, setDepartments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setRationale(editGoal.rationale ?? "");
      setStatus(editGoal.status);
    }
  }, [editGoal]);


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

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (userId) headers["x-dev-user-id"] = userId;
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          title,
          description,
          horizon,
          startDate,
          endDate,
          scope,
          department: scope === "department" ? department : "",
          successMetrics,
          rationale,
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

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="Describe the strategic objective..."
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Rationale */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rationale
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="Why is this a priority? What's the business case?"
            />
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
                disabled={isManager}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:bg-muted/40 disabled:text-muted-foreground"
              >
                {!isManager && <option value="company">Company-wide</option>}
                <option value="department">Department</option>
              </select>
              {isManager && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Managers can only create department-scoped goals.
                </p>
              )}
            </div>
            {scope === "department" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isManager}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:bg-muted/40 disabled:text-muted-foreground"
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

          {/* Success Metrics */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Success Metrics
            </label>
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
