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
