"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ascenta/ui/button";
import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import { cn } from "@ascenta/ui";
import {
  checkInFormSchema,
  type CheckInFormValues,
} from "@/lib/validations/check-in";
import { User } from "lucide-react";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CheckInFormProps {
  initialValues: Partial<CheckInFormValues>;
  availableGoals: { id: string; title: string }[];
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function CheckInForm({
  initialValues,
  availableGoals,
  onFieldChange,
  onSubmit,
  onCancel,
}: CheckInFormProps) {
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      linkedGoals: [],
      managerProgressObserved: "",
      managerCoachingNeeded: "",
      managerRecognition: "",
      employeeProgress: "",
      employeeObstacles: "",
      employeeSupportNeeded: "",
      ...initialValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const linkedGoals = watch("linkedGoals") ?? [];

  // Sync every field change back to the chat context
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name) {
        onFieldChange(name, values[name as keyof CheckInFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFieldChange]);

  const toggleGoal = (goalId: string) => {
    const current = watch("linkedGoals") ?? [];
    const next = current.includes(goalId)
      ? current.filter((id) => id !== goalId)
      : [...current, goalId];
    setValue("linkedGoals", next, { shouldValidate: true });
  };

  const handleFormSubmit = form.handleSubmit(async () => {
    await onSubmit();
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Employee info banner */}
      <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
        <User className="size-4 text-muted-foreground" />
        <div className="text-sm">
          <span className="font-medium">
            {watch("employeeName") || "Employee"}
          </span>
          {watch("employeeId") && (
            <span className="ml-2 text-muted-foreground">
              ({watch("employeeId")})
            </span>
          )}
        </div>
      </div>

      {/* Linked Goals - pill toggle */}
      <div className="space-y-1.5">
        <Label>
          Linked Goals <span className="text-destructive">*</span>
        </Label>
        {availableGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No goals available for this employee.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableGoals.map((goal) => {
              const isSelected = linkedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {goal.title}
                </button>
              );
            })}
          </div>
        )}
        {errors.linkedGoals && (
          <p className="text-xs text-destructive">
            {errors.linkedGoals.message}
          </p>
        )}
      </div>

      {/* Manager Assessment section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Manager Assessment
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="managerProgressObserved">
            Progress Observed <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="managerProgressObserved"
            rows={3}
            placeholder="What progress have you observed?"
            {...register("managerProgressObserved")}
          />
          {errors.managerProgressObserved && (
            <p className="text-xs text-destructive">
              {errors.managerProgressObserved.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="managerCoachingNeeded">
            Coaching Needed <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="managerCoachingNeeded"
            rows={3}
            placeholder="What coaching or support is needed?"
            {...register("managerCoachingNeeded")}
          />
          {errors.managerCoachingNeeded && (
            <p className="text-xs text-destructive">
              {errors.managerCoachingNeeded.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="managerRecognition">Recognition</Label>
          <Textarea
            id="managerRecognition"
            rows={2}
            placeholder="Any recognition or praise (optional)"
            {...register("managerRecognition")}
          />
        </div>
      </div>

      {/* Employee Input section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Employee Input
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="employeeProgress">
            Progress <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="employeeProgress"
            rows={3}
            placeholder="Employee's self-reported progress"
            {...register("employeeProgress")}
          />
          {errors.employeeProgress && (
            <p className="text-xs text-destructive">
              {errors.employeeProgress.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employeeObstacles">
            Obstacles <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="employeeObstacles"
            rows={3}
            placeholder="What obstacles are they facing?"
            {...register("employeeObstacles")}
          />
          {errors.employeeObstacles && (
            <p className="text-xs text-destructive">
              {errors.employeeObstacles.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employeeSupportNeeded">Support Needed</Label>
          <Textarea
            id="employeeSupportNeeded"
            rows={2}
            placeholder="What support does the employee need? (optional)"
            {...register("employeeSupportNeeded")}
          />
        </div>
      </div>

      {/* Submit/cancel bar */}
      <div className="flex items-center justify-end gap-2 border-t pt-4 mt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Check-in"}
        </Button>
      </div>
    </form>
  );
}
