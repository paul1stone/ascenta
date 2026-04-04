"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { goalFormSchema, type GoalFormValues } from "@/lib/validations/goal";
import { GOAL_CATEGORY_LABELS } from "@ascenta/db/goal-constants";
import { User } from "lucide-react";
import { EmployeePicker } from "./employee-picker";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS = Object.entries(GOAL_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GoalCreationFormProps {
  initialValues: Partial<GoalFormValues>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function GoalCreationForm({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: GoalCreationFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      title: "",
      description: "",
      category: undefined,
      measurementType: undefined,
      successMetric: "",
      timePeriod: undefined,
      customStartDate: "",
      customEndDate: "",
      checkInCadence: undefined,
      strategyGoalId: "",
      strategyGoalTitle: "",
      notes: "",
      ...initialValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const timePeriod = watch("timePeriod");

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

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input id="title" placeholder="Goal title" {...register("title")} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Describe the goal"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("category") ?? ""}
          onValueChange={(v: string) =>
            setValue("category", v as GoalFormValues["category"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Measurement Type */}
      <div className="space-y-1.5">
        <Label htmlFor="measurementType">
          Measurement Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("measurementType") ?? ""}
          onValueChange={(v: string) =>
            setValue("measurementType", v as GoalFormValues["measurementType"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="measurementType">
            <SelectValue placeholder="Select measurement type" />
          </SelectTrigger>
          <SelectContent>
            {MEASUREMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.measurementType && (
          <p className="text-xs text-destructive">{errors.measurementType.message}</p>
        )}
      </div>

      {/* Success Metric */}
      <div className="space-y-1.5">
        <Label htmlFor="successMetric">
          Success Metric <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="successMetric"
          rows={2}
          placeholder="How will success be measured?"
          {...register("successMetric")}
        />
        {errors.successMetric && (
          <p className="text-xs text-destructive">{errors.successMetric.message}</p>
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

      {/* Check-in Cadence */}
      <div className="space-y-1.5">
        <Label htmlFor="checkInCadence">
          Check-in Cadence <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("checkInCadence") ?? ""}
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
            {CADENCE_OPTIONS.map((opt) => (
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
