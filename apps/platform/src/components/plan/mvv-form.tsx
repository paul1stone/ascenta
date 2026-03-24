"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ascenta/ui/button";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const mvvSchema = z.object({
  mission: z.string().min(1, "Mission is required"),
  vision: z.string().min(1, "Vision is required"),
  values: z.string().min(1, "Values are required"),
});

type MVVFormValues = z.infer<typeof mvvSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MVVFormProps {
  initialValues: Record<string, unknown>;
  onFieldChange: (field: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function MVVForm({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: MVVFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MVVFormValues>({
    resolver: zodResolver(mvvSchema),
    defaultValues: {
      mission: "",
      vision: "",
      values: "",
      ...(initialValues as Partial<MVVFormValues>),
    },
  });

  // Sync field changes back to chat context
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name) {
        onFieldChange(name, values[name as keyof MVVFormValues]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFieldChange]);

  return (
    <form
      onSubmit={handleSubmit(async () => {
        await onSubmit();
      })}
      className="space-y-5"
    >
      {/* Mission */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mission
        </label>
        <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
          What does your company do, who does it serve, and why does it exist?
        </p>
        <textarea
          {...register("mission")}
          rows={4}
          className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6688bb] resize-y"
          placeholder="Our mission is to..."
        />
        {errors.mission && (
          <p className="text-xs text-red-500 mt-1">{errors.mission.message}</p>
        )}
      </div>

      {/* Vision */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Vision
        </label>
        <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
          What future is your company working to create?
        </p>
        <textarea
          {...register("vision")}
          rows={4}
          className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6688bb] resize-y"
          placeholder="We envision a world where..."
        />
        {errors.vision && (
          <p className="text-xs text-red-500 mt-1">{errors.vision.message}</p>
        )}
      </div>

      {/* Values */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Values
        </label>
        <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
          Core principles that guide how your company operates. List each value with a brief description.
        </p>
        <textarea
          {...register("values")}
          rows={8}
          className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6688bb] resize-y"
          placeholder={"People First — Every feature we build starts with the question: does this make someone's work life better?\n\nTransparency by Default — We believe in open communication, clear expectations, and honest feedback at every level."}
        />
        {errors.values && (
          <p className="text-xs text-red-500 mt-1">{errors.values.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="bg-[#6688bb] hover:bg-[#5577aa] text-white"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Save & Publish"
          )}
        </Button>
      </div>
    </form>
  );
}
