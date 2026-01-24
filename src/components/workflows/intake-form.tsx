"use client";

import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  IntakeFieldDefinition,
  WorkflowInputs,
} from "@/lib/workflows/types";

interface IntakeFormProps {
  fields: IntakeFieldDefinition[];
  initialValues?: WorkflowInputs;
  onSubmit: (values: WorkflowInputs) => void;
  onSave?: (values: WorkflowInputs) => void;
  isSubmitting?: boolean;
}

/**
 * Build Zod schema from intake field definitions
 */
function buildSchema(fields: IntakeFieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "text":
      case "textarea":
        fieldSchema = z.string();
        if (field.validationRules?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validationRules.minLength,
            `Minimum ${field.validationRules.minLength} characters`
          );
        }
        if (field.validationRules?.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validationRules.maxLength,
            `Maximum ${field.validationRules.maxLength} characters`
          );
        }
        break;

      case "number":
        fieldSchema = z.coerce.number();
        if (field.validationRules?.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(field.validationRules.min);
        }
        if (field.validationRules?.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(field.validationRules.max);
        }
        break;

      case "date":
        fieldSchema = z.string();
        break;

      case "dropdown":
        fieldSchema = z.string();
        break;

      case "checkbox":
        fieldSchema = z.boolean();
        break;

      case "checkbox_group":
        fieldSchema = z.array(z.string());
        break;

      default:
        fieldSchema = z.string();
    }

    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.fieldKey] = fieldSchema;
  }

  return z.object(shape);
}

export function IntakeForm({
  fields,
  initialValues = {},
  onSubmit,
  onSave,
  isSubmitting = false,
}: IntakeFormProps) {
  const schema = buildSchema(fields);
  
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const { register, handleSubmit, control, watch, formState } = methods;
  const { errors } = formState;

  // Group fields by group name
  const groupedFields: Record<string, IntakeFieldDefinition[]> = {};
  for (const field of fields) {
    const group = field.groupName || "General";
    if (!groupedFields[group]) {
      groupedFields[group] = [];
    }
    groupedFields[group].push(field);
  }

  // Check conditional visibility
  const watchedValues = watch();
  const isFieldVisible = (field: IntakeFieldDefinition): boolean => {
    if (!field.conditionalOn) return true;

    const { fieldKey, operator, value } = field.conditionalOn;
    const currentValue = watchedValues[fieldKey];

    switch (operator) {
      case "equals":
        return currentValue === value;
      case "not_equals":
        return currentValue !== value;
      case "not_empty":
        return currentValue !== undefined && currentValue !== "" && currentValue !== null;
      case "empty":
        return currentValue === undefined || currentValue === "" || currentValue === null;
      case "contains":
        return Array.isArray(currentValue)
          ? currentValue.includes(value)
          : String(currentValue).includes(String(value));
      default:
        return true;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {Object.entries(groupedFields).map(([groupName, groupFields], index) => (
          <div key={groupName}>
            {index > 0 && <Separator className="mb-6" />}
            <div className="mb-4">
              <h3 className="font-display font-semibold text-deep-blue">
                {groupName}
              </h3>
            </div>
            <div className="space-y-4">
              {groupFields.map((field) => {
                if (!isFieldVisible(field)) return null;

                return (
                  <IntakeField
                    key={field.fieldKey}
                    field={field}
                    register={register}
                    control={control}
                    error={errors[field.fieldKey]?.message as string | undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <Separator />

        <div className="flex gap-4">
          {onSave && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSave(watchedValues as WorkflowInputs)}
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 bg-summit hover:bg-summit-hover"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Validating..." : "Continue to Review"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

interface IntakeFieldProps {
  field: IntakeFieldDefinition;
  register: ReturnType<typeof useForm>["register"];
  control: ReturnType<typeof useForm>["control"];
  error?: string;
}

function IntakeField({ field, register, control, error }: IntakeFieldProps) {
  const baseClasses = cn(
    "transition-colors",
    error && "border-red-500 focus-visible:ring-red-500"
  );

  return (
    <div className="space-y-2">
      <Label
        htmlFor={field.fieldKey}
        className={cn(
          "flex items-center gap-1",
          error && "text-red-500"
        )}
      >
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>

      {field.type === "text" && (
        <Input
          id={field.fieldKey}
          {...register(field.fieldKey)}
          placeholder={field.placeholder}
          className={baseClasses}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          id={field.fieldKey}
          {...register(field.fieldKey)}
          placeholder={field.placeholder}
          rows={4}
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            baseClasses
          )}
        />
      )}

      {field.type === "number" && (
        <Input
          id={field.fieldKey}
          type="number"
          {...register(field.fieldKey)}
          placeholder={field.placeholder}
          className={baseClasses}
        />
      )}

      {field.type === "date" && (
        <Input
          id={field.fieldKey}
          type="date"
          {...register(field.fieldKey)}
          className={baseClasses}
        />
      )}

      {field.type === "dropdown" && field.options && (
        <Controller
          name={field.fieldKey}
          control={control}
          render={({ field: controllerField }) => (
            <select
              id={field.fieldKey}
              value={controllerField.value || ""}
              onChange={controllerField.onChange}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                baseClasses
              )}
            >
              <option value="">Select an option...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />
      )}

      {field.type === "checkbox" && (
        <Controller
          name={field.fieldKey}
          control={control}
          render={({ field: controllerField }) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={field.fieldKey}
                checked={controllerField.value || false}
                onChange={(e) => controllerField.onChange(e.target.checked)}
                className="size-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">
                {field.placeholder || "Yes"}
              </span>
            </div>
          )}
        />
      )}

      {field.type === "checkbox_group" && field.options && (
        <Controller
          name={field.fieldKey}
          control={control}
          render={({ field: controllerField }) => {
            const selectedValues: string[] = controllerField.value || [];
            return (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          controllerField.onChange([
                            ...selectedValues,
                            option.value,
                          ]);
                        } else {
                          controllerField.onChange(
                            selectedValues.filter((v) => v !== option.value)
                          );
                        }
                      }}
                      className="size-4 rounded border-border"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            );
          }}
        />
      )}

      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
