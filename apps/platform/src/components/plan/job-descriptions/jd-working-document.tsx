"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobDescriptionInputSchema,
  type JobDescriptionInput,
} from "@/lib/validations/job-description";
import { Button } from "@ascenta/ui/button";
import { JdFormBody } from "./jd-form-body";

interface Props {
  initialValues: Record<string, unknown>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const EMPTY: JobDescriptionInput = {
  title: "",
  department: "",
  level: "mid",
  employmentType: "full_time",
  roleSummary: "",
  coreResponsibilities: [""],
  requiredQualifications: [""],
  preferredQualifications: [],
  competencies: [""],
  status: "published",
};

function withDefaults(initial: Record<string, unknown>): JobDescriptionInput {
  return {
    ...EMPTY,
    ...(initial as Partial<JobDescriptionInput>),
  };
}

export function JdWorkingDocument({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: Props) {
  const mode = ((initialValues.mode as string) ?? "create") === "edit"
    ? "edit"
    : "create";

  const methods = useForm<JobDescriptionInput>({
    resolver: zodResolver(jobDescriptionInputSchema) as unknown as Resolver<JobDescriptionInput>,
    defaultValues: withDefaults(initialValues),
    mode: "onSubmit",
  });
  const { handleSubmit, watch, reset, formState } = methods;

  useEffect(() => {
    reset(withDefaults(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  useEffect(() => {
    const sub = watch((values) => {
      // Bubble each top-level field up so AI updates can be reapplied.
      for (const [k, v] of Object.entries(values)) {
        onFieldChange(k, v);
      }
    });
    return () => sub.unsubscribe();
  }, [watch, onFieldChange]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(async () => {
          await onSubmit();
        })}
        className="flex flex-col gap-6"
        aria-label={
          mode === "create"
            ? "Create Job Description"
            : "Refine Job Description"
        }
      >
        <JdFormBody />

        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Create"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
