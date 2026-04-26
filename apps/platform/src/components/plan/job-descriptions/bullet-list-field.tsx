"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Plus, X } from "lucide-react";

interface BulletListFieldProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  placeholder?: string;
}

export function BulletListField({
  name,
  label,
  min = 0,
  max = 20,
  placeholder = "Add an item...",
}: BulletListFieldProps) {
  const { control, register, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const errors = (formState.errors as Record<string, unknown>)[name] as
    | { message?: string }
    | Array<{ message?: string }>
    | undefined;

  const rootError =
    errors && !Array.isArray(errors) && "message" in errors
      ? errors.message
      : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {min > 0 && <span className="text-destructive">*</span>}
        </label>
        <span className="text-xs text-muted-foreground">
          {fields.length}/{max}
        </span>
      </div>
      <div className="space-y-2">
        {fields.map((field, idx) => {
          const itemError = Array.isArray(errors) ? errors[idx] : undefined;
          return (
            <div key={field.id} className="flex items-start gap-2">
              <Input
                {...register(`${name}.${idx}` as const)}
                placeholder={placeholder}
                aria-label={`${label} ${idx + 1}`}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(idx)}
                disabled={fields.length <= min}
                aria-label={`Remove ${label} ${idx + 1}`}
              >
                <X className="size-4" />
              </Button>
              {itemError?.message && (
                <p className="text-xs text-destructive mt-2">{itemError.message}</p>
              )}
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append("")}
        disabled={fields.length >= max}
      >
        <Plus className="size-4 mr-1" />
        Add item
      </Button>
      {rootError && <p className="text-xs text-destructive">{String(rootError)}</p>}
    </div>
  );
}
