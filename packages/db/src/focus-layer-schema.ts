import mongoose, { Schema } from "mongoose";
import { FOCUS_LAYER_STATUSES } from "./focus-layer-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const responsesSchema = new Schema(
  {
    uniqueContribution: { type: String, default: "", trim: true },
    highImpactArea: { type: String, default: "", trim: true },
    signatureResponsibility: { type: String, default: "", trim: true },
    workingStyle: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const employeeSubmittedSchema = new Schema(
  { at: { type: Date, default: null } },
  { _id: false }
);

const managerConfirmedSchema = new Schema(
  {
    at: { type: Date, default: null },
    byUserId: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    comment: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const focusLayerSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
      index: true,
    },
    jobDescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "JobDescription",
      default: null,
      index: true,
    },
    responses: { type: responsesSchema, default: () => ({}) },
    status: {
      type: String,
      required: true,
      enum: FOCUS_LAYER_STATUSES,
      default: "draft",
      index: true,
    },
    employeeSubmitted: { type: employeeSubmittedSchema, default: () => ({}) },
    managerConfirmed: { type: managerConfirmedSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: toJSONOptions, toObject: toJSONOptions }
);

focusLayerSchema.index({ jobDescriptionId: 1, status: 1 });

export const FocusLayer =
  mongoose.models.FocusLayer || mongoose.model("FocusLayer", focusLayerSchema);

export type FocusLayer_Type = {
  id: string;
  employeeId: string;
  jobDescriptionId: string | null;
  responses: {
    uniqueContribution: string;
    highImpactArea: string;
    signatureResponsibility: string;
    workingStyle: string;
  };
  status: "draft" | "submitted" | "confirmed";
  employeeSubmitted: { at: Date | null };
  managerConfirmed: {
    at: Date | null;
    byUserId: string | null;
    comment: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
};
