"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import { cn } from "@ascenta/ui";
import { goalFormSchema, getObjectiveWarning, type GoalFormValues } from "@/lib/validations/goal";
import { GOAL_TYPE_LABELS, CHECKIN_CADENCE_LABELS } from "@ascenta/db/goal-constants";
import { User, Plus, Trash2 } from "lucide-react";
import { EmployeePicker } from "./employee-picker";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GoalCreationFormProps {
  initialValues: Partial<GoalFormValues>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  strategyGoals?: { id: string; title: string; horizon: string }[];
}

export function GoalCreationForm({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
  strategyGoals = [],
}: GoalCreationFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      objectiveStatement: "",
      goalType: undefined,
      keyResults: [
        { description: "", metric: "", deadline: "" },
        { description: "", metric: "", deadline: "" },
      ],
      strategyGoalId: "",
      strategyGoalTitle: "",
      teamGoalId: "",
      supportAgreement: "",
      timePeriod: undefined,
      customStartDate: "",
      customEndDate: "",
      checkInCadence: "every_check_in",
      notes: "",
      stretchConfidence: null,
      milestones: [],
      ...initialValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keyResults",
  });

  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    control,
    name: "milestones",
  });

  const timePeriod = watch("timePeriod");
  const goalType = watch("goalType");
  const objectiveStatement = watch("objectiveStatement");

  const wordCount = (objectiveStatement || "").trim().split(/\s+/).filter(Boolean).length;
  const objectiveWarning = getObjectiveWarning(objectiveStatement || "");

  // Sync every field change back to the chat context
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name) {
        onFieldChange(name, values[name as keyof GoalFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFieldChange]);

  const handleFormSubmit = form.handleSubmit(async () => {
    await onSubmit();
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Employee: picker for direct-open, read-only banner for AI-initiated */}
      {watch("employeeId") ? (
        <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
          <User className="size-4 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium">{watch("employeeName") || "Employee"}</span>
            <span className="ml-2 text-muted-foreground">
              ({watch("employeeId")})
            </span>
          </div>
        </div>
      ) : (
        <EmployeePicker
          onSelect={(employeeId, employeeName) => {
            setValue("employeeId", employeeId, { shouldValidate: true });
            setValue("employeeName", employeeName, { shouldValidate: true });
            onFieldChange("employeeId", employeeId);
            onFieldChange("employeeName", employeeName);
          }}
        />
      )}

      {/* Objective Statement */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="objectiveStatement">
            Objective Statement <span className="text-destructive">*</span>
          </Label>
          <span
            className={cn(
              "text-xs",
              wordCount >= 15 ? "text-muted-foreground" : "text-amber-500",
            )}
          >
            {wordCount} / 15 words min
          </span>
        </div>
        <Textarea
          id="objectiveStatement"
          rows={3}
          placeholder="Describe what this person will achieve and why it matters…"
          {...register("objectiveStatement")}
        />
        {errors.objectiveStatement && (
          <p className="text-xs text-destructive">{errors.objectiveStatement.message}</p>
        )}
        {!errors.objectiveStatement && objectiveWarning && (
          <p className="text-xs text-amber-600">{objectiveWarning}</p>
        )}
      </div>

      {/* Goal Type */}
      <div className="space-y-1.5">
        <Label>
          Goal Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setValue("goalType", opt.value, { shouldValidate: true });
                onFieldChange("goalType", opt.value);
              }}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-medium text-left transition-colors",
                goalType === opt.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.goalType && (
          <p className="text-xs text-destructive">{errors.goalType.message}</p>
        )}
      </div>

      {/* Key Results */}
      <div className="space-y-2">
        <Label>
          Key Results <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Define measurable outcomes that indicate goal success. We recommend 1–3 key results.
        </p>
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Key Result {index + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove key result"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              <Input
                placeholder="What will be achieved?"
                {...register(`keyResults.${index}.description`)}
              />
              {errors.keyResults?.[index]?.description && (
                <p className="text-xs text-destructive">
                  {errors.keyResults[index].description?.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Input
                  placeholder="Measurable target"
                  {...register(`keyResults.${index}.metric`)}
                />
                {errors.keyResults?.[index]?.metric && (
                  <p className="text-xs text-destructive">
                    {errors.keyResults[index].metric?.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Input
                  type="date"
                  {...register(`keyResults.${index}.deadline`)}
                />
                {errors.keyResults?.[index]?.deadline && (
                  <p className="text-xs text-destructive">
                    {errors.keyResults[index].deadline?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {errors.keyResults && !Array.isArray(errors.keyResults) && (
          <p className="text-xs text-destructive">{errors.keyResults.message}</p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => append({ description: "", metric: "", deadline: "" })}
        >
          <Plus className="size-3.5" />
          Add Key Result
        </Button>
      </div>

      {/* Strategy Pillar (conditional) */}
      {strategyGoals.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="strategyGoalId">Strategy Pillar</Label>
          <Select
            value={watch("strategyGoalId") ?? ""}
            onValueChange={(v: string) => {
              setValue("strategyGoalId", v, { shouldValidate: true });
              const found = strategyGoals.find((g) => g.id === v);
              setValue("strategyGoalTitle", found?.title ?? "");
              onFieldChange("strategyGoalId", v);
              onFieldChange("strategyGoalTitle", found?.title ?? "");
            }}
          >
            <SelectTrigger id="strategyGoalId">
              <SelectValue placeholder="Link to a strategy goal (optional)" />
            </SelectTrigger>
            <SelectContent>
              {strategyGoals.map((goal) => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.title}
                  {goal.horizon && (
                    <span className="ml-1 text-muted-foreground">({goal.horizon})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Support Agreement */}
      <div className="space-y-1.5">
        <Label htmlFor="supportAgreement">Support Agreement</Label>
        <Textarea
          id="supportAgreement"
          rows={2}
          placeholder="What support, resources, or commitments are needed from the manager?"
          {...register("supportAgreement")}
        />
      </div>

      {/* Check-in Cadence */}
      <div className="space-y-1.5">
        <Label htmlFor="checkInCadence">
          Check-in Cadence <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("checkInCadence") ?? "every_check_in"}
          onValueChange={(v: string) =>
            setValue("checkInCadence", v as GoalFormValues["checkInCadence"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="checkInCadence">
            <SelectValue placeholder="Select cadence" />
          </SelectTrigger>
          <SelectContent>
            {CHECKIN_CADENCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.checkInCadence && (
          <p className="text-xs text-destructive">{errors.checkInCadence.message}</p>
        )}
      </div>

      {/* Time Period */}
      <div className="space-y-1.5">
        <Label htmlFor="timePeriod">
          Time Period <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("timePeriod") ?? ""}
          onValueChange={(v: string) =>
            setValue("timePeriod", v as GoalFormValues["timePeriod"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="timePeriod">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {TIME_PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timePeriod && (
          <p className="text-xs text-destructive">{errors.timePeriod.message}</p>
        )}
      </div>

      {/* Custom date fields (conditional on timePeriod === "custom") */}
      {timePeriod === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="customStartDate">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customStartDate"
              type="date"
              {...register("customStartDate")}
            />
            {errors.customStartDate && (
              <p className="text-xs text-destructive">
                {errors.customStartDate.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customEndDate">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customEndDate"
              type="date"
              {...register("customEndDate")}
            />
            {errors.customEndDate && (
              <p className="text-xs text-destructive">
                {errors.customEndDate.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stretch confidence — goals should sit at stretch-but-achievable
          (~70-80% confidence) per docs/reqs/goals.md Goal Best Practices. */}
      <div className="space-y-1.5">
        <Label htmlFor="stretchConfidence">
          Stretch confidence
          <span className="text-muted-foreground font-normal"> — how likely to achieve? (optional)</span>
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="stretchConfidence"
            type="range"
            min={0}
            max={100}
            step={5}
            className="flex-1"
            value={watch("stretchConfidence") ?? 75}
            onChange={(e) =>
              setValue("stretchConfidence", Number(e.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <span
            className="w-12 text-sm tabular-nums text-right"
            aria-live="polite"
          >
            {watch("stretchConfidence") ?? 75}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Aim for 70–80% — stretch but achievable. Below 50% may be too risky;
          above 90% may not be ambitious enough.
        </p>
      </div>

      {/* Milestones — required for year-long goals (quarterly checkpoints) and
          longer-range goals (midpoint revisit) per docs/reqs/goals.md Goal
          Best Practices. */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Milestones
            <span className="text-muted-foreground font-normal"> — optional checkpoints</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendMilestone({ label: "", targetDate: "", notes: "" })
            }
          >
            Add milestone
          </Button>
        </div>
        {(timePeriod === "annual" || timePeriod === "H1" || timePeriod === "H2") &&
          milestoneFields.length === 0 && (
            <p className="text-xs text-amber-600">
              Goals spanning a half or full year benefit from quarterly
              checkpoints.
            </p>
          )}
        {milestoneFields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No milestones yet. Add one to break this goal into checkpoints.
          </p>
        ) : (
          <div className="space-y-2">
            {milestoneFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-md border bg-muted/20 p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Input
                      placeholder="Milestone label (e.g. Q1 checkpoint)"
                      {...register(`milestones.${index}.label` as const)}
                    />
                    {errors.milestones?.[index]?.label && (
                      <p className="text-xs text-destructive">
                        {errors.milestones[index]?.label?.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(index)}
                    aria-label={`Remove milestone ${index + 1}`}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Input
                      type="date"
                      {...register(`milestones.${index}.targetDate` as const)}
                    />
                    {errors.milestones?.[index]?.targetDate && (
                      <p className="text-xs text-destructive">
                        {errors.milestones[index]?.targetDate?.message}
                      </p>
                    )}
                  </div>
                  <Input
                    placeholder="Notes (optional)"
                    {...register(`milestones.${index}.notes` as const)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Any additional context or notes"
          {...register("notes")}
        />
      </div>

      {/* Submit/cancel bar */}
      <div className="flex items-center justify-end gap-2 border-t pt-4 mt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Goal"}
        </Button>
      </div>
    </form>
  );
}
