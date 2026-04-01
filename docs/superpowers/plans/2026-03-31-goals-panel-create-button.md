# Goals Panel — Direct Goal Creation & Compass CTA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "+ Create Goal" button to the Goals panel that opens a modal form for manual goal creation, plus a Compass CTA linking to AI-assisted goal creation on the Do page.

**Architecture:** New `PerformanceGoalForm` modal component submits directly to `POST /api/grow/goals`. The existing `GoalsPanel` gains a header button, the modal trigger, and a Compass CTA card. No changes to the API or validation layer — the existing endpoint and `goalFormSchema` handle everything.

**Tech Stack:** React, Next.js App Router, Zod validation, Lucide icons, Tailwind CSS

---

### File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `apps/platform/src/components/grow/performance-goal-form.tsx` | Modal form for manual goal creation |
| Modify | `apps/platform/src/components/grow/goals-panel.tsx` | Add "+ Create Goal" button, Compass CTA, wire modal |

---

### Task 1: Create `PerformanceGoalForm` modal component

**Files:**
- Create: `apps/platform/src/components/grow/performance-goal-form.tsx`

This modal follows the same pattern as `components/plan/strategy-goal-form.tsx` but uses the performance goal fields from `GoalCreationForm`. It submits directly to `POST /api/grow/goals`.

- [ ] **Step 1: Create the modal form component**

Create `apps/platform/src/components/grow/performance-goal-form.tsx` with the following content:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Search, User } from "lucide-react";
import { goalFormSchema } from "@/lib/validations/goal";

interface PerformanceGoalFormProps {
  accentColor: string;
  onClose: () => void;
  onSaved: () => void;
  defaultEmployeeId?: string;
  defaultEmployeeName?: string;
}

interface EmployeeResult {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
}

const CATEGORY_GROUP_OPTIONS = [
  { value: "performance", label: "Performance Goals" },
  { value: "leadership", label: "Leadership Goals" },
  { value: "development", label: "Development Goals" },
] as const;

const CATEGORIES_BY_GROUP: Record<string, { value: string; label: string }[]> = {
  performance: [
    { value: "productivity", label: "Productivity" },
    { value: "quality", label: "Quality" },
    { value: "accuracy", label: "Accuracy" },
    { value: "efficiency", label: "Efficiency" },
    { value: "operational_excellence", label: "Operational Excellence" },
    { value: "customer_impact", label: "Customer Impact" },
  ],
  leadership: [
    { value: "communication", label: "Communication" },
    { value: "collaboration", label: "Collaboration" },
    { value: "conflict_resolution", label: "Conflict Resolution" },
    { value: "decision_making", label: "Decision Making" },
    { value: "initiative", label: "Initiative" },
  ],
  development: [
    { value: "skill_development", label: "Skill Development" },
    { value: "certification", label: "Certification" },
    { value: "training_completion", label: "Training Completion" },
    { value: "leadership_growth", label: "Leadership Growth" },
    { value: "career_advancement", label: "Career Advancement" },
  ],
};

const MEASUREMENT_TYPE_OPTIONS = [
  { value: "numeric_metric", label: "Numeric Metric" },
  { value: "percentage_target", label: "Percentage Target" },
  { value: "milestone_completion", label: "Milestone Completion" },
  { value: "behavior_change", label: "Behavior Change" },
  { value: "learning_completion", label: "Learning Completion" },
] as const;

const TIME_PERIOD_OPTIONS = [
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
  { value: "H1", label: "H1" },
  { value: "H2", label: "H2" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
] as const;

const CADENCE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "milestone", label: "Milestone" },
  { value: "manager_scheduled", label: "Manager Scheduled" },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: "mission", label: "Mission" },
  { value: "value", label: "Value" },
  { value: "priority", label: "Priority" },
] as const;

export function PerformanceGoalForm({
  accentColor,
  onClose,
  onSaved,
  defaultEmployeeId = "",
  defaultEmployeeName = "",
}: PerformanceGoalFormProps) {
  // Employee picker state
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId);
  const [employeeName, setEmployeeName] = useState(defaultEmployeeName);
  const [employeeSearch, setEmployeeSearch] = useState(defaultEmployeeName);
  const [employeeResults, setEmployeeResults] = useState<EmployeeResult[]>([]);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [employeeSearchLoading, setEmployeeSearchLoading] = useState(false);
  const employeeContainerRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryGroup, setCategoryGroup] = useState("");
  const [category, setCategory] = useState("");
  const [measurementType, setMeasurementType] = useState("");
  const [successMetric, setSuccessMetric] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [checkInCadence, setCheckInCadence] = useState("");
  const [alignment, setAlignment] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Employee search with debounce
  useEffect(() => {
    if (employeeSearch.length < 2 || employeeId) {
      setEmployeeResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setEmployeeSearchLoading(true);
      try {
        const res = await fetch(
          `/api/dashboard/employees?search=${encodeURIComponent(employeeSearch)}&limit=5`,
        );
        if (res.ok) {
          const data = await res.json();
          setEmployeeResults(data.employees ?? []);
        }
      } catch {
        setEmployeeResults([]);
      } finally {
        setEmployeeSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [employeeSearch, employeeId]);

  // Close employee dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        employeeContainerRef.current &&
        !employeeContainerRef.current.contains(e.target as Node)
      ) {
        setEmployeeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset category when categoryGroup changes
  useEffect(() => {
    if (categoryGroup) {
      const validCategories = CATEGORIES_BY_GROUP[categoryGroup] ?? [];
      const isStillValid = validCategories.some((c) => c.value === category);
      if (!isStillValid) {
        setCategory("");
      }
    }
  }, [categoryGroup, category]);

  const filteredCategories = categoryGroup
    ? (CATEGORIES_BY_GROUP[categoryGroup] ?? [])
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Validate via Zod
    const formData = {
      employeeName,
      employeeId,
      title,
      description,
      categoryGroup: categoryGroup || undefined,
      category: category || undefined,
      measurementType: measurementType || undefined,
      successMetric,
      timePeriod: timePeriod || undefined,
      customStartDate: timePeriod === "custom" ? customStartDate : undefined,
      customEndDate: timePeriod === "custom" ? customEndDate : undefined,
      checkInCadence: checkInCadence || undefined,
      alignment: alignment || undefined,
    };

    const parsed = goalFormSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        fieldErrors[key] = (messages as string[])?.[0] ?? "Invalid";
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/grow/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : "Failed to create goal";
        setErrors({ form: errMsg });
      }
    } catch {
      setErrors({ form: "Failed to create goal" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-display text-base font-bold text-deep-blue">
            Create Goal
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Employee picker */}
          {employeeId ? (
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
              <div className="flex items-center gap-3">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{employeeName}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmployeeId("");
                  setEmployeeName("");
                  setEmployeeSearch("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Change
              </button>
            </div>
          ) : (
            <div ref={employeeContainerRef} className="relative">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employee
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search employees..."
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                    setEmployeeDropdownOpen(true);
                  }}
                  onFocus={() =>
                    employeeSearch.length >= 2 &&
                    setEmployeeDropdownOpen(true)
                  }
                  className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
              </div>
              {employeeDropdownOpen &&
                (employeeResults.length > 0 ||
                  employeeSearchLoading ||
                  employeeSearch.length >= 2) && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
                    {employeeSearchLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Searching...
                      </div>
                    ) : employeeResults.length > 0 ? (
                      employeeResults.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            const name = `${emp.firstName} ${emp.lastName}`;
                            setEmployeeId(emp.id);
                            setEmployeeName(name);
                            setEmployeeSearch(name);
                            setEmployeeDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-glacier/50"
                        >
                          <User className="size-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-deep-blue">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {emp.jobTitle} · {emp.department}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No employees found
                      </div>
                    )}
                  </div>
                )}
              {errors.employeeId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.employeeId}
                </p>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              placeholder="e.g., Improve customer response time by 20%"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
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
              placeholder="Describe the goal and expected outcomes..."
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category Group + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category Group
              </label>
              <select
                value={categoryGroup}
                onChange={(e) => setCategoryGroup(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="">Select...</option>
                {CATEGORY_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.categoryGroup && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.categoryGroup}
                </p>
              )}
            </div>
            {categoryGroup && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                >
                  <option value="">Select...</option>
                  {filteredCategories.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.category}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Measurement Type */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Measurement Type
            </label>
            <select
              value={measurementType}
              onChange={(e) => setMeasurementType(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            >
              <option value="">Select...</option>
              {MEASUREMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.measurementType && (
              <p className="text-xs text-red-500 mt-1">
                {errors.measurementType}
              </p>
            )}
          </div>

          {/* Success Metric */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Success Metric
            </label>
            <textarea
              value={successMetric}
              onChange={(e) => setSuccessMetric(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="How will success be measured?"
            />
            {errors.successMetric && (
              <p className="text-xs text-red-500 mt-1">
                {errors.successMetric}
              </p>
            )}
          </div>

          {/* Time Period + Custom Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Time Period
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="">Select...</option>
                {TIME_PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.timePeriod && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.timePeriod}
                </p>
              )}
            </div>
            {timePeriod === "custom" && (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Start
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                  {errors.customStartDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.customStartDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    End
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                  {errors.customEndDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.customEndDate}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Check-in Cadence + Alignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Check-in Cadence
              </label>
              <select
                value={checkInCadence}
                onChange={(e) => setCheckInCadence(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="">Select...</option>
                {CADENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.checkInCadence && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.checkInCadence}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alignment
              </label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="">Select...</option>
                {ALIGNMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.alignment && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.alignment}
                </p>
              )}
            </div>
          </div>

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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`
Expected: No errors related to `performance-goal-form.tsx`

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/components/grow/performance-goal-form.tsx
git commit -m "feat: add PerformanceGoalForm modal for direct goal creation"
```

---

### Task 2: Update GoalsPanel with Create button and Compass CTA

**Files:**
- Modify: `apps/platform/src/components/grow/goals-panel.tsx`

Add a "+ Create Goal" button in the header, a Compass CTA card below the header, and wire the modal form. The Compass CTA links to `/do?prompt=...&tool=startGoalCreation`.

- [ ] **Step 1: Update GoalsPanel**

Replace the entire content of `apps/platform/src/components/grow/goals-panel.tsx` with:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Loader2, Plus, Compass } from "lucide-react";
import { GoalCard } from "@/components/grow/goal-card";
import { PerformanceGoalForm } from "@/components/grow/performance-goal-form";
import { useRole } from "@/lib/role/role-context";
import Link from "next/link";

interface GoalData {
  id: string;
  title: string;
  description: string;
  category: string;
  measurementType: string;
  successMetric: string;
  timePeriod: { start: string; end: string };
  checkInCadence: string;
  alignment: string;
  status: string;
  lastCheckInDate: string | null;
  createdAt: string;
}

interface GoalsPanelProps {
  accentColor: string;
}

export function GoalsPanel({ accentColor }: GoalsPanelProps) {
  const { persona, loading: roleLoading } = useRole();
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (roleLoading) return;
    if (!persona?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const goalsRes = await fetch(`/api/grow/goals?employeeId=${persona.id}`);
      const goalsData = await goalsRes.json();

      if (goalsData.success) {
        setGoals(goalsData.goals ?? []);
      } else {
        setError(goalsData.error ?? "Failed to fetch goals");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, [persona?.id, roleLoading]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const employeeName = persona
    ? `${persona.firstName} ${persona.lastName}`
    : "";

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
        <Target className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Unable to Load Goals
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header with Create button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-deep-blue">
              My Goals
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {employeeName ? `${employeeName} — ` : ""}
              {activeGoals.length} active goal
              {activeGoals.length !== 1 ? "s" : ""}
              {completedGoals.length > 0 &&
                `, ${completedGoals.length} completed`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="size-4" />
            Create Goal
          </button>
        </div>

        {/* Compass CTA */}
        <Link
          href="/do?prompt=Help%20me%20create%20a%20performance%20goal&tool=startGoalCreation"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-[--accent] hover:bg-[--accent-bg] mb-6"
          style={
            {
              "--accent": "#ff6b35",
              "--accent-bg": "rgba(255, 107, 53, 0.04)",
            } as React.CSSProperties
          }
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
          >
            <Compass className="size-5" style={{ color: "#ff6b35" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-deep-blue">
              Create Goal with Compass
            </p>
            <p className="text-xs text-muted-foreground">
              Use AI to help define goals, suggest metrics, and align to
              company strategy.
            </p>
          </div>
        </Link>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Goals Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first goal using the button above, or use Compass
              for AI-assisted goal creation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />
            ))}
            {completedGoals.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4 pb-1">
                  Completed
                </p>
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    accentColor={accentColor}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <PerformanceGoalForm
          accentColor={accentColor}
          onClose={() => setShowForm(false)}
          onSaved={fetchGoals}
          defaultEmployeeId={persona?.id}
          defaultEmployeeName={employeeName}
        />
      )}
    </div>
  );
}
```

Key changes from the original:
- Added `useCallback`-wrapped `fetchGoals` (replaces inline effect) so the modal can trigger a refetch
- Added `showForm` state and `PerformanceGoalForm` modal
- Added "+ Create Goal" button in header (matches strategy panel pattern)
- Added Compass CTA card linking to `/do?prompt=...&tool=startGoalCreation`
- Updated empty state text to reference both paths
- Pre-fills employee from current persona via `defaultEmployeeId` / `defaultEmployeeName`

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /Users/jason/personal-repos/ascenta && npx tsc --noEmit --project apps/platform/tsconfig.json 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Manual verification**

Run: `cd /Users/jason/personal-repos/ascenta && pnpm dev --filter=@ascenta/platform`

1. Navigate to Grow > Performance System > Goals tab
2. Verify "+ Create Goal" button appears in header next to "My Goals"
3. Verify Compass CTA card appears below header
4. Click "+ Create Goal" — modal should open with employee pre-filled
5. Fill all fields and submit — goal should appear in list
6. Click Compass CTA — should navigate to `/do` page with goal creation tool active

- [ ] **Step 4: Commit**

```bash
git add apps/platform/src/components/grow/goals-panel.tsx
git commit -m "feat: add Create Goal button and Compass CTA to Goals panel"
```
