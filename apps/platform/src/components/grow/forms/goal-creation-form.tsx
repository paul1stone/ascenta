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
import { User } from "lucide-react";

// ---------------------------------------------------------------------------
// Category groups → filtered categories
// ---------------------------------------------------------------------------

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
      categoryGroup: undefined,
      category: undefined,
      measurementType: undefined,
      successMetric: "",
      timePeriod: undefined,
      customStartDate: "",
      customEndDate: "",
      checkInCadence: undefined,
      alignment: undefined,
      ...initialValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const categoryGroup = watch("categoryGroup");
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

  // Reset category when categoryGroup changes
  useEffect(() => {
    const current = watch("category");
    if (categoryGroup) {
      const validCategories = CATEGORIES_BY_GROUP[categoryGroup] ?? [];
      const isStillValid = validCategories.some((c) => c.value === current);
      if (!isStillValid) {
        setValue("category", undefined as unknown as GoalFormValues["category"], {
          shouldValidate: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryGroup, setValue]);

  const filteredCategories = categoryGroup
    ? (CATEGORIES_BY_GROUP[categoryGroup] ?? [])
    : [];

  const handleFormSubmit = form.handleSubmit(async () => {
    await onSubmit();
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Employee info banner */}
      <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
        <User className="size-4 text-muted-foreground" />
        <div className="text-sm">
          <span className="font-medium">{watch("employeeName") || "Employee"}</span>
          {watch("employeeId") && (
            <span className="ml-2 text-muted-foreground">
              ({watch("employeeId")})
            </span>
          )}
        </div>
      </div>

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

      {/* Category Group */}
      <div className="space-y-1.5">
        <Label htmlFor="categoryGroup">
          Category Group <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("categoryGroup") ?? ""}
          onValueChange={(v: string) =>
            setValue("categoryGroup", v as GoalFormValues["categoryGroup"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="categoryGroup">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_GROUP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryGroup && (
          <p className="text-xs text-destructive">{errors.categoryGroup.message}</p>
        )}
      </div>

      {/* Category (conditional on categoryGroup) */}
      {categoryGroup && (
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
              {filteredCategories.map((opt) => (
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
      )}

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

      {/* Alignment */}
      <div className="space-y-1.5">
        <Label htmlFor="alignment">
          Alignment <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("alignment") ?? ""}
          onValueChange={(v: string) =>
            setValue("alignment", v as GoalFormValues["alignment"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="alignment">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            {ALIGNMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.alignment && (
          <p className="text-xs text-destructive">{errors.alignment.message}</p>
        )}
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
