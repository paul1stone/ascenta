"use client";

import { useState } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobDescriptionInputSchema,
  type JobDescriptionInput,
} from "@/lib/validations/job-description";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@ascenta/db/job-description-constants";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import { BulletListField } from "./bullet-list-field";

interface JdFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<JobDescriptionInput> & { id?: string };
  onSuccess: (jd: JobDescriptionInput & { id: string }) => void;
  onCancel: () => void;
}

const emptyDefaults: JobDescriptionInput = {
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

export function JdForm({ mode, initialValues, onSuccess, onCancel }: JdFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<JobDescriptionInput>({
    // The schema uses .default() on a couple of fields, which makes its input
    // type strictly looser than its output type. The form fills in defaults
    // via `defaultValues`, so input and output match at runtime — cast the
    // resolver to silence the spurious mismatch.
    resolver: zodResolver(jobDescriptionInputSchema) as unknown as Resolver<JobDescriptionInput>,
    defaultValues: { ...emptyDefaults, ...initialValues },
    mode: "onSubmit",
  });

  async function onSubmit(values: JobDescriptionInput) {
    setSubmitting(true);
    setServerError(null);
    try {
      const url =
        mode === "create"
          ? "/api/job-descriptions"
          : `/api/job-descriptions/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed with ${res.status}`);
      }
      const json = await res.json();
      onSuccess(json.jobDescription);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  const { register, handleSubmit, formState, setValue, watch } = methods;
  const { errors } = formState;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        aria-label={mode === "create" ? "Create Job Description" : "Edit Job Description"}
      >
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium" htmlFor="jd-title">
              Title <span className="text-destructive">*</span>
            </label>
            <Input id="jd-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="jd-department">
              Department <span className="text-destructive">*</span>
            </label>
            <Input id="jd-department" {...register("department")} />
            {errors.department && (
              <p className="text-xs text-destructive mt-1">{errors.department.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Level</label>
            <Select
              value={watch("level")}
              onValueChange={(v) =>
                setValue("level", v as JobDescriptionInput["level"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Employment Type</label>
            <Select
              value={watch("employmentType")}
              onValueChange={(v) =>
                setValue("employmentType", v as JobDescriptionInput["employmentType"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {EMPLOYMENT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={watch("status")}
              onValueChange={(v) =>
                setValue("status", v as JobDescriptionInput["status"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <label className="text-sm font-medium" htmlFor="jd-summary">
            Role Summary <span className="text-destructive">*</span>
          </label>
          <Textarea id="jd-summary" rows={5} {...register("roleSummary")} />
          {errors.roleSummary && (
            <p className="text-xs text-destructive mt-1">{errors.roleSummary.message}</p>
          )}
        </section>

        <BulletListField
          name="coreResponsibilities"
          label="Core Responsibilities"
          min={1}
          placeholder="e.g., Lead the design of cross-team initiatives"
        />
        <BulletListField
          name="requiredQualifications"
          label="Required Qualifications"
          min={1}
          placeholder="e.g., 5+ years of relevant experience"
        />
        <BulletListField
          name="preferredQualifications"
          label="Preferred Qualifications"
          min={0}
          placeholder="e.g., Experience with TypeScript"
        />
        <BulletListField
          name="competencies"
          label="Competencies"
          min={1}
          placeholder="e.g., Communication"
        />

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
