/**
 * ReviewCycle Schema (Mongoose)
 * HR-configured review periods that group employee reviews into formal cycles
 * (annual, mid-year, 90-day). Linked to PerformanceReview documents.
 */

import mongoose, { Schema, Types } from "mongoose";
import {
  REVIEW_TYPES,
  CYCLE_STATUSES,
} from "./performance-review-categories";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const reviewCycleSchema = new Schema(
  {
    orgId: { type: String, default: "default", index: true },
    label: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: REVIEW_TYPES,
      default: "custom",
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    selfAssessmentDeadline: { type: Date, default: null },
    managerDeadline: { type: Date, default: null },
    participantEmployeeIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: CYCLE_STATUSES,
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

reviewCycleSchema.index({ orgId: 1, status: 1 });
reviewCycleSchema.index({ type: 1, periodEnd: 1 });

export const ReviewCycle =
  mongoose.models.ReviewCycle ||
  mongoose.model("ReviewCycle", reviewCycleSchema);

export type ReviewCycle_Type = {
  id: string;
  orgId: string;
  label: string;
  type: (typeof REVIEW_TYPES)[number];
  periodStart: Date;
  periodEnd: Date;
  selfAssessmentDeadline: Date | null;
  managerDeadline: Date | null;
  participantEmployeeIds: Types.ObjectId[];
  status: (typeof CYCLE_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
};
