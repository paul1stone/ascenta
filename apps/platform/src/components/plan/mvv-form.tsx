"use client";

import { useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ascenta/ui/button";
import { Loader2, Check } from "lucide-react";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const mvvSchema = z.object({
  mission: z.string(),
  vision: z.string(),
  values: z.string(),
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
    formState: { isSubmitting },
  } = useForm<MVVFormValues>({
    resolver: zodResolver(mvvSchema),
    defaultValues: {
      mission: "",
      vision: "",
      values: "",
      ...(initialValues as Partial<MVVFormValues>),
    },
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  // Auto-save to /api/plan/foundation on field changes (debounced 1s)
  const autoSave = useCallback(
    async (formValues: Partial<MVVFormValues>) => {
      const key = JSON.stringify(formValues);
      if (key === lastSavedRef.current) return;
      lastSavedRef.current = key;

      try {
        await fetch("/api/plan/foundation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
      } catch {
        // silent
      }
    },
    [],
  );

  // Sync field changes back to chat context AND trigger auto-save
  useEffect(() => {
    const subscription = watch((formValues, { name }) => {
      if (name) {
        onFieldChange(name, formValues[name as keyof MVVFormValues]);
      }
      // Debounced auto-save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        autoSave(formValues as MVVFormValues);
      }, 1000);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [watch, onFieldChange, autoSave]);

  const mission = watch("mission");
  const vision = watch("vision");
  const values = watch("values");
  const hasContent = !!(mission || vision || values);

  return (
    <form
      onSubmit={handleSubmit(async () => {
        await onSubmit();
      })}
      className="space-y-5"
    >
      {/* Mission */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mission
          </label>
          {mission && <Check className="size-3 text-green-500" />}
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">
          What does your company do, who does it serve, and why does it exist?
        </p>
        <textarea
          {...register("mission")}
          rows={4}
          className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6688bb] resize-y"
          placeholder="Your mission statement will appear here as we work through it..."
        />
      </div>

      {/* Vision */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vision
          </label>
          {vision && <Check className="size-3 text-green-500" />}
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">
          What future is your company working to create?
        </p>
        <textarea
          {...register("vision")}
          rows={4}
          className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6688bb] resize-y"
          placeholder="Your vision statement will appear here..."
        />
      </div>

      {/* Values */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Values
          </label>
          {values && <Check className="size-3 text-green-500" />}
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">
          Core principles that guide how your company operates.
        </p>
        <textarea
          {...register("values")}
          rows={8}
          className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6688bb] resize-y"
          placeholder="Your core values will appear here..."
        />
      </div>

      {/* Auto-save indicator + Publish */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">Auto-saving as you go</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Close
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !hasContent}
            className="bg-[#6688bb] hover:bg-[#5577aa] text-white"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
