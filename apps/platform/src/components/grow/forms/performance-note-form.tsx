"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ascenta/ui/button";
import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import {
  performanceNoteFormSchema,
  type PerformanceNoteFormValues,
} from "@/lib/validations/performance-note";
import { User } from "lucide-react";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const NOTE_TYPE_OPTIONS = [
  { value: "observation", label: "Observation" },
  { value: "feedback", label: "Feedback" },
  { value: "coaching", label: "Coaching" },
  { value: "recognition", label: "Recognition" },
  { value: "concern", label: "Concern" },
] as const;

const FOLLOW_UP_OPTIONS = [
  { value: "none", label: "None" },
  { value: "check_in", label: "Check-in" },
  { value: "goal", label: "Goal" },
  { value: "escalate", label: "Escalate" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PerformanceNoteFormProps {
  initialValues: Partial<PerformanceNoteFormValues>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function PerformanceNoteForm({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: PerformanceNoteFormProps) {
  const form = useForm({
    resolver: zodResolver(performanceNoteFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      noteType: undefined as PerformanceNoteFormValues["noteType"] | undefined,
      observation: "",
      expectation: "",
      followUp: "none" as PerformanceNoteFormValues["followUp"],
      ...initialValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Sync every field change back to the chat context
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name) {
        onFieldChange(name, values[name as keyof PerformanceNoteFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFieldChange]);

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

      {/* Note Type */}
      <div className="space-y-1.5">
        <Label htmlFor="noteType">
          Note Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("noteType") ?? ""}
          onValueChange={(v: string) =>
            setValue(
              "noteType",
              v as PerformanceNoteFormValues["noteType"],
              { shouldValidate: true },
            )
          }
        >
          <SelectTrigger id="noteType">
            <SelectValue placeholder="Select note type" />
          </SelectTrigger>
          <SelectContent>
            {NOTE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.noteType && (
          <p className="text-xs text-destructive">{errors.noteType.message}</p>
        )}
      </div>

      {/* Observation */}
      <div className="space-y-1.5">
        <Label htmlFor="observation">
          Observation <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="observation"
          rows={4}
          placeholder="What did you observe?"
          {...register("observation")}
        />
        {errors.observation && (
          <p className="text-xs text-destructive">
            {errors.observation.message}
          </p>
        )}
      </div>

      {/* Expectation */}
      <div className="space-y-1.5">
        <Label htmlFor="expectation">Expectation</Label>
        <Textarea
          id="expectation"
          rows={2}
          placeholder="What is the expectation going forward? (optional)"
          {...register("expectation")}
        />
      </div>

      {/* Follow Up */}
      <div className="space-y-1.5">
        <Label htmlFor="followUp">Follow Up</Label>
        <Select
          value={watch("followUp") ?? "none"}
          onValueChange={(v: string) =>
            setValue(
              "followUp",
              v as PerformanceNoteFormValues["followUp"],
              { shouldValidate: true },
            )
          }
        >
          <SelectTrigger id="followUp">
            <SelectValue placeholder="Select follow-up action" />
          </SelectTrigger>
          <SelectContent>
            {FOLLOW_UP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sticky submit/cancel bar */}
      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Save Note"}
        </Button>
      </div>
    </form>
  );
}
