"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@ascenta/db/job-description-constants";
import type { JobDescriptionInput } from "@/lib/validations/job-description";
import { BulletListField } from "./bullet-list-field";

interface JdFormBodyProps {
  departmentLocked?: boolean;
}

export function JdFormBody({ departmentLocked }: JdFormBodyProps = {}) {
  const { register, watch, setValue, formState } =
    useFormContext<JobDescriptionInput>();
  const { errors } = formState;

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium" htmlFor="jd-title">
            Title <span className="text-destructive">*</span>
          </label>
          <Input id="jd-title" {...register("title")} />
          {errors.title && (
            <p className="text-xs text-destructive mt-1">
              {errors.title.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="jd-department">
            Department <span className="text-destructive">*</span>
          </label>
          <Input
            id="jd-department"
            {...register("department")}
            disabled={departmentLocked}
            aria-readonly={departmentLocked}
          />
          {departmentLocked && (
            <p className="text-xs text-muted-foreground mt-1">
              Locked to your department.
            </p>
          )}
          {errors.department && (
            <p className="text-xs text-destructive mt-1">
              {errors.department.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Level</label>
          <Select
            value={watch("level")}
            onValueChange={(v) =>
              setValue("level", v as JobDescriptionInput["level"], {
                shouldValidate: true,
              })
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
              setValue(
                "employmentType",
                v as JobDescriptionInput["employmentType"],
                { shouldValidate: true },
              )
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
              setValue("status", v as JobDescriptionInput["status"], {
                shouldValidate: true,
              })
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
          <p className="text-xs text-destructive mt-1">
            {errors.roleSummary.message}
          </p>
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
    </>
  );
}
