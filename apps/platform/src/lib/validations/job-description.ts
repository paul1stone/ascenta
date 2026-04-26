import { z } from "zod";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "@ascenta/db/job-description-constants";

const bullet = z.string().trim().min(1, "Required").max(500);

const jobDescriptionBaseSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(200),
  department: z.string().trim().min(1, "Department is required").max(100),
  level: z.enum(LEVEL_OPTIONS, { message: "Level is required" }),
  employmentType: z.enum(EMPLOYMENT_TYPE_OPTIONS, {
    message: "Employment type is required",
  }),
  roleSummary: z
    .string()
    .trim()
    .min(20, "Role summary must be at least 20 characters")
    .max(4000),
  coreResponsibilities: z.array(bullet).min(1, "At least 1 responsibility is required").max(20),
  requiredQualifications: z.array(bullet).min(1, "At least 1 required qualification is required").max(20),
  preferredQualifications: z.array(bullet).max(20),
  competencies: z.array(bullet).min(1, "At least 1 competency is required").max(20),
  status: z.enum(STATUS_OPTIONS),
});

export const jobDescriptionInputSchema = jobDescriptionBaseSchema.extend({
  preferredQualifications: z.array(bullet).max(20).default([]),
  status: z.enum(STATUS_OPTIONS).default("published"),
});

export type JobDescriptionInput = z.infer<typeof jobDescriptionInputSchema>;

export const jobDescriptionPatchSchema = jobDescriptionBaseSchema.partial();
export type JobDescriptionPatch = z.infer<typeof jobDescriptionPatchSchema>;

export const assignEmployeesSchema = z.object({
  employeeIds: z.array(z.string().min(1)).min(1, "At least one employee is required").max(500),
});
export type AssignEmployeesInput = z.infer<typeof assignEmployeesSchema>;
