"use client";

import { useState } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobDescriptionInputSchema,
  type JobDescriptionInput,
} from "@/lib/validations/job-description";
import { Button } from "@ascenta/ui/button";
import { JdFormBody } from "./jd-form-body";
import { useAuth } from "@/lib/auth/auth-context";
import { withUserHeader } from "@/lib/auth/with-user-header";

interface JdFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<JobDescriptionInput> & { id?: string };
  /** When set, the department field is disabled and forced to this value. */
  lockedDepartment?: string;
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

export function JdForm({
  mode,
  initialValues,
  lockedDepartment,
  onSuccess,
  onCancel,
}: JdFormProps) {
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<JobDescriptionInput>({
    // The schema uses .default() on a couple of fields, which makes its input
    // type strictly looser than its output type. The form fills in defaults
    // via `defaultValues`, so input and output match at runtime — cast the
    // resolver to silence the spurious mismatch.
    resolver: zodResolver(jobDescriptionInputSchema) as unknown as Resolver<JobDescriptionInput>,
    defaultValues: {
      ...emptyDefaults,
      ...initialValues,
      ...(lockedDepartment ? { department: lockedDepartment } : {}),
    },
    mode: "onSubmit",
  });

  async function onSubmit(values: JobDescriptionInput) {
    setSubmitting(true);
    setServerError(null);
    try {
      const finalValues = lockedDepartment
        ? { ...values, department: lockedDepartment }
        : values;
      const url =
        mode === "create"
          ? "/api/job-descriptions"
          : `/api/job-descriptions/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: withUserHeader(user?.id, { "content-type": "application/json" }),
        body: JSON.stringify(finalValues),
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

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        aria-label={mode === "create" ? "Create Job Description" : "Edit Job Description"}
      >
        <JdFormBody departmentLocked={!!lockedDepartment} />

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
