// packages/db/src/job-description-schema.ts

import mongoose, { Schema } from "mongoose";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  type Level,
  type EmploymentType,
  type JdStatus,
} from "./job-description-constants";

export {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "./job-description-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const jobDescriptionSchema = new Schema(
  {
    title: { type: String, required: true, index: true, trim: true },
    department: { type: String, required: true, index: true, trim: true },
    level: { type: String, required: true, index: true, enum: LEVEL_OPTIONS },
    employmentType: {
      type: String,
      required: true,
      index: true,
      enum: EMPLOYMENT_TYPE_OPTIONS,
    },
    roleSummary: { type: String, required: true, trim: true },
    coreResponsibilities: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "coreResponsibilities must have at least 1 item",
      },
    },
    requiredQualifications: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "requiredQualifications must have at least 1 item",
      },
    },
    preferredQualifications: { type: [String], default: [] },
    competencies: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "competencies must have at least 1 item",
      },
    },
    status: {
      type: String,
      required: true,
      enum: STATUS_OPTIONS,
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

jobDescriptionSchema.index({ department: 1, level: 1 });

export const JobDescription =
  mongoose.models.JobDescription ||
  mongoose.model("JobDescription", jobDescriptionSchema);

export type JobDescription_Type = {
  id: string;
  title: string;
  department: string;
  level: Level;
  employmentType: EmploymentType;
  roleSummary: string;
  coreResponsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  competencies: string[];
  status: JdStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type NewJobDescription = Omit<
  JobDescription_Type,
  "id" | "createdAt" | "updatedAt"
>;
