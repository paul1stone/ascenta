/**
 * Goal Schema (Mongoose)
 * Performance goals for employees — team, role, or individual level.
 */

import mongoose, { Schema } from "mongoose";

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

export const GOAL_TYPES = ["team", "role", "individual"] as const;
export const GOAL_STATUSES = [
  "draft",
  "active",
  "locked",
  "completed",
  "cancelled",
] as const;
export const VISIBILITY_LEVELS = ["employee", "manager", "hr"] as const;

// ============================================================================
// GOAL
// ============================================================================

const goalSchema = new Schema(
  {
    statement: { type: String, required: true },
    measure: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: GOAL_TYPES,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    timeperiod: {
      start: { type: Date },
      end: { type: Date },
    },
    parentGoal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    dependencies: [{ type: String }],
    status: {
      type: String,
      required: true,
      enum: GOAL_STATUSES,
      default: "draft",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    visibility: {
      type: String,
      required: true,
      enum: VISIBILITY_LEVELS,
      default: "manager",
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

// Compound indexes
goalSchema.index({ owner: 1, status: 1 });
goalSchema.index({ "timeperiod.end": 1 });

export const Goal =
  mongoose.models.Goal || mongoose.model("Goal", goalSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type Goal_Type = {
  id: string;
  statement: string;
  measure: string;
  type: (typeof GOAL_TYPES)[number];
  owner: string;
  timeperiod: { start: Date | null; end: Date | null };
  parentGoal: string | null;
  dependencies: string[];
  status: (typeof GOAL_STATUSES)[number];
  createdBy: string;
  visibility: (typeof VISIBILITY_LEVELS)[number];
  createdAt: Date;
  updatedAt: Date;
};

export type NewGoal = {
  statement: string;
  measure: string;
  type: (typeof GOAL_TYPES)[number];
  owner: string;
  timeperiod?: { start?: Date; end?: Date };
  parentGoal?: string | null;
  dependencies?: string[];
  status?: (typeof GOAL_STATUSES)[number];
  createdBy: string;
  visibility?: (typeof VISIBILITY_LEVELS)[number];
};
