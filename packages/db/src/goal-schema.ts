/**
 * Goal Schema (Mongoose)
 * Supports GROW-101/102/103 goal-setting workflows
 */

import mongoose, { Schema, Types } from "mongoose";

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
// CONSTANTS
// ============================================================================

export const GOAL_CATEGORIES = [
  "productivity",
  "quality",
  "accuracy",
  "efficiency",
  "operational_excellence",
  "customer_impact",
  "communication",
  "collaboration",
  "conflict_resolution",
  "decision_making",
  "initiative",
  "skill_development",
  "certification",
  "training_completion",
  "leadership_growth",
  "career_advancement",
] as const;

export const GOAL_CATEGORY_GROUPS: Record<
  string,
  (typeof GOAL_CATEGORIES)[number][]
> = {
  "Performance Goals": [
    "productivity",
    "quality",
    "accuracy",
    "efficiency",
    "operational_excellence",
    "customer_impact",
  ],
  "Leadership Goals": [
    "communication",
    "collaboration",
    "conflict_resolution",
    "decision_making",
    "initiative",
  ],
  "Development Goals": [
    "skill_development",
    "certification",
    "training_completion",
    "leadership_growth",
    "career_advancement",
  ],
};

export const MEASUREMENT_TYPES = [
  "numeric_metric",
  "percentage_target",
  "milestone_completion",
  "behavior_change",
  "learning_completion",
] as const;

export const CHECKIN_CADENCES = [
  "monthly",
  "quarterly",
  "milestone",
  "manager_scheduled",
] as const;

export const ALIGNMENT_TYPES = ["mission", "value", "priority"] as const;

export const GOAL_STATUSES = [
  "on_track",
  "needs_attention",
  "off_track",
  "completed",
] as const;

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
