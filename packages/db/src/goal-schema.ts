/**
 * Goal Schema (Mongoose)
 * Supports GROW-101/102/103 goal-setting workflows
 */

import mongoose, { Schema, Types } from "mongoose";
export {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_GROUPS,
  MEASUREMENT_TYPES,
  CHECKIN_CADENCES,
  ALIGNMENT_TYPES,
  GOAL_STATUSES,
} from "./goal-constants";
import {
  GOAL_CATEGORIES,
  MEASUREMENT_TYPES,
  CHECKIN_CADENCES,
  ALIGNMENT_TYPES,
  GOAL_STATUSES,
} from "./goal-constants";

// ============================================================================
// SHARED
// ============================================================================

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

// ============================================================================
// GOAL SCHEMA
// ============================================================================

const goalSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: GOAL_CATEGORIES,
      index: true,
    },
    measurementType: {
      type: String,
      required: true,
      enum: MEASUREMENT_TYPES,
    },
    successMetric: { type: String, required: true },
    timePeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    checkInCadence: {
      type: String,
      required: true,
      enum: CHECKIN_CADENCES,
    },
    alignment: {
      type: String,
      required: true,
      enum: ALIGNMENT_TYPES,
    },
    status: {
      type: String,
      required: true,
      enum: GOAL_STATUSES,
      default: "on_track",
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    managerApproved: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

// Compound indexes
goalSchema.index({ owner: 1, status: 1 });
goalSchema.index({ manager: 1, status: 1 });
goalSchema.index({ "timePeriod.end": 1 });

export const Goal =
  mongoose.models.Goal || mongoose.model("Goal", goalSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type Goal_Type = {
  id: string;
  title: string;
  description: string;
  category: (typeof GOAL_CATEGORIES)[number];
  measurementType: (typeof MEASUREMENT_TYPES)[number];
  successMetric: string;
  timePeriod: {
    start: Date;
    end: Date;
  };
  checkInCadence: (typeof CHECKIN_CADENCES)[number];
  alignment: (typeof ALIGNMENT_TYPES)[number];
  status: (typeof GOAL_STATUSES)[number];
  owner: string | Types.ObjectId;
  manager: string | Types.ObjectId;
  managerApproved: boolean;
  locked: boolean;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
