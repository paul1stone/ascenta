"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Search, User, Plus, Trash2 } from "lucide-react";
import { goalFormSchema, getObjectiveWarning, type GoalFormValues } from "@/lib/validations/goal";
import { GOAL_TYPE_LABELS, CHECKIN_CADENCE_LABELS } from "@ascenta/db/goal-constants";

interface PerformanceGoalFormProps {
  accentColor: string;
  onClose: () => void;
  onSaved: () => void;
  defaultEmployeeId?: string;
  defaultEmployeeName?: string;
  defaultStrategyGoalId?: string;
  defaultStrategyGoalTitle?: string;
}

interface EmployeeResult {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
}

const GOAL_TYPE_OPTIONS = Object.entries(GOAL_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as "performance" | "development", label }),
);

const CHECKIN_CADENCE_OPTIONS = Object.entries(CHECKIN_CADENCE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

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

export function PerformanceGoalForm({
  accentColor,
  onClose,
  onSaved,
  defaultEmployeeId = "",
  defaultEmployeeName = "",
  defaultStrategyGoalId,
  defaultStrategyGoalTitle,
}: PerformanceGoalFormProps) {
  // Employee picker state (managed outside react-hook-form for search UX)
  const [employeeSearch, setEmployeeSearch] = useState(defaultEmployeeName);
  const [employeeResults, setEmployeeResults] = useState<EmployeeResult[]>([]);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [employeeSearchLoading, setEmployeeSearchLoading] = useState(false);
  const employeeContainerRef = useRef<HTMLDivElement>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      employeeName: defaultEmployeeName,
      employeeId: defaultEmployeeId,
      objectiveStatement: "",
      goalType: undefined,
      keyResults: [
        { description: "", metric: "", deadline: "" },
        { description: "", metric: "", deadline: "" },
      ],
      strategyGoalId: defaultStrategyGoalId ?? "",
      strategyGoalTitle: defaultStrategyGoalTitle ?? "",
      supportAgreement: "",
      timePeriod: undefined,
      customStartDate: "",
      customEndDate: "",
      checkInCadence: "every_check_in",
      notes: "",
    },
  });

  const {
    register,
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keyResults",
  });

  const employeeId = watch("employeeId");
  const employeeName = watch("employeeName");
  const timePeriod = watch("timePeriod");
  const goalType = watch("goalType");
  const objectiveStatement = watch("objectiveStatement");

  const wordCount = (objectiveStatement || "").trim().split(/\s+/).filter(Boolean).length;
  const objectiveWarning = getObjectiveWarning(objectiveStatement || "");

  const strategyGoalTitle = watch("strategyGoalTitle");

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

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      const payload = {
        employeeName: data.employeeName,
        employeeId: data.employeeId,
        objectiveStatement: data.objectiveStatement,
        goalType: data.goalType,
        keyResults: data.keyResults,
        strategyGoalId: data.strategyGoalId || undefined,
        strategyGoalTitle: data.strategyGoalTitle || undefined,
        supportAgreement: data.supportAgreement || undefined,
        checkInCadence: data.checkInCadence,
        timePeriod: data.timePeriod,
        customStartDate: data.timePeriod === "custom" ? data.customStartDate : undefined,
        customEndDate: data.timePeriod === "custom" ? data.customEndDate : undefined,
        notes: data.notes || undefined,
      };

      const res = await fetch("/api/grow/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        onSaved();
        onClose();
      } else {
        const errMsg =
          typeof result.error === "string" ? result.error : "Failed to create goal";
        setFormError(errMsg);
      }
    } catch {
      setFormError("Failed to create goal");
    }
  });

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

        <form onSubmit={onSubmit} className="p-5 space-y-4">
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
                  setValue("employeeId", "", { shouldValidate: false });
                  setValue("employeeName", "", { shouldValidate: false });
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
                    employeeSearch.length >= 2 && setEmployeeDropdownOpen(true)
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
                            setValue("employeeId", emp.id, { shouldValidate: true });
                            setValue("employeeName", name, { shouldValidate: true });
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
                  {errors.employeeId.message}
                </p>
              )}
            </div>
          )}

          {/* Objective Statement */}
          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Objective Statement
              </label>
              <span
                className={
                  wordCount >= 15
                    ? "text-xs text-muted-foreground"
                    : "text-xs text-amber-500"
                }
              >
                {wordCount} / 15 words min
              </span>
            </div>
            <textarea
              {...register("objectiveStatement")}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="Describe what this person will achieve and why it matters…"
            />
            {errors.objectiveStatement && (
              <p className="text-xs text-red-500 mt-1">
                {errors.objectiveStatement.message}
              </p>
            )}
            {!errors.objectiveStatement && objectiveWarning && (
              <p className="text-xs text-amber-600 mt-1">{objectiveWarning}</p>
            )}
          </div>

          {/* Goal Type */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Goal Type
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {GOAL_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("goalType", opt.value, { shouldValidate: true })}
                  className={[
                    "rounded-lg border px-4 py-3 text-sm font-medium text-left transition-colors",
                    goalType === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.goalType && (
              <p className="text-xs text-red-500 mt-1">{errors.goalType.message}</p>
            )}
          </div>

          {/* Key Results */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Key Results
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define 2–4 measurable outcomes that indicate goal success.
              </p>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Key Result {index + 1}
                  </span>
                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                      aria-label="Remove key result"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <input
                    {...register(`keyResults.${index}.description`)}
                    placeholder="What will be achieved?"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                  {errors.keyResults?.[index]?.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.keyResults[index].description?.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      {...register(`keyResults.${index}.metric`)}
                      placeholder="Measurable target"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    />
                    {errors.keyResults?.[index]?.metric && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.keyResults[index].metric?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="date"
                      {...register(`keyResults.${index}.deadline`)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    />
                    {errors.keyResults?.[index]?.deadline && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.keyResults[index].deadline?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {errors.keyResults && !Array.isArray(errors.keyResults) && (
              <p className="text-xs text-red-500">{errors.keyResults.message}</p>
            )}
            {fields.length < 4 && (
              <button
                type="button"
                onClick={() => append({ description: "", metric: "", deadline: "" })}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Plus className="size-3.5" />
                Add Key Result
              </button>
            )}
          </div>

          {/* Support Agreement */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Support Agreement{" "}
              <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              {...register("supportAgreement")}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="What support, resources, or commitments are needed from the manager?"
            />
          </div>

          {/* Time Period + Custom Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Time Period
              </label>
              <select
                value={timePeriod ?? ""}
                onChange={(e) =>
                  setValue(
                    "timePeriod",
                    e.target.value as GoalFormValues["timePeriod"],
                    { shouldValidate: true },
                  )
                }
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
                  {errors.timePeriod.message}
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
                    {...register("customStartDate")}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                  {errors.customStartDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.customStartDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    End
                  </label>
                  <input
                    type="date"
                    {...register("customEndDate")}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                  {errors.customEndDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.customEndDate.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Check-in Cadence */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Check-in Cadence
            </label>
            <select
              value={watch("checkInCadence") ?? ""}
              onChange={(e) =>
                setValue(
                  "checkInCadence",
                  e.target.value as GoalFormValues["checkInCadence"],
                  { shouldValidate: true },
                )
              }
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            >
              <option value="">Select...</option>
              {CHECKIN_CADENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.checkInCadence && (
              <p className="text-xs text-red-500 mt-1">
                {errors.checkInCadence.message}
              </p>
            )}
          </div>

          {/* Strategy Alignment (read-only) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Strategy Alignment
            </label>
            {strategyGoalTitle ? (
              <div className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                {strategyGoalTitle}
              </div>
            ) : (
              <div className="mt-1 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground italic">
                Independent goal
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
              placeholder="Additional context..."
            />
          </div>

          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
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
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Submit for Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
