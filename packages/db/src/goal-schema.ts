/**
 * Goal Schema (Mongoose)
 * Supports structured key results, dual confirmation, and recalibration history.
 */

import mongoose, { Schema, Types } from "mongoose";
import {
  GOAL_TYPES,
  GOAL_STATUSES,
  KEY_RESULT_STATUSES,
  CHECKIN_CADENCES,
} from "./goal-constants";

// Re-export constants for consumers that import from goal-schema
export {
  GOAL_TYPES,
  GOAL_STATUSES,
  KEY_RESULT_STATUSES,
  CHECKIN_CADENCES,
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
// SUB-SCHEMAS
// ============================================================================

const keyResultSchema = new Schema(
  {
    description: { type: String, required: true },
    metric: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: KEY_RESULT_STATUSES,
      default: "not_started",
    },
  },
  { _id: true },
);

const confirmationSchema = new Schema(
  {
    confirmed: { type: Boolean, default: false },
    at: { type: Date, default: null },
  },
  { _id: false },
);

const recalibrationSchema = new Schema(
  {
    recalibratedAt: { type: Date, required: true },
    reason: { type: String, required: true },
    previousSnapshot: { type: Schema.Types.Mixed, required: true },
    revisedFields: { type: Schema.Types.Mixed, required: true },
    revisedSupportAgreement: { type: String, default: null },
  },
  { _id: true },
);

// ============================================================================
// GOAL SCHEMA
// ============================================================================

const goalSchema = new Schema(
  {
    objectiveStatement: { type: String, required: true },
    goalType: {
      type: String,
      required: true,
      enum: GOAL_TYPES,
    },
    keyResults: {
      type: [keyResultSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length >= 2 && v.length <= 4,
        message: "Goals must have between 2 and 4 key results.",
      },
    },
    strategyGoalId: {
      type: Schema.Types.ObjectId,
      ref: "StrategyGoal",
      default: null,
      index: true,
    },
    teamGoalId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    supportAgreement: { type: String, default: "" },
    checkInCadence: {
      type: String,
      required: true,
      enum: CHECKIN_CADENCES,
      default: "every_check_in",
    },
    timePeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: GOAL_STATUSES,
      default: "draft",
      index: true,
    },
    employeeConfirmed: {
      type: confirmationSchema,
      default: () => ({ confirmed: false, at: null }),
    },
    managerConfirmed: {
      type: confirmationSchema,
      default: () => ({ confirmed: false, at: null }),
    },
    recalibrations: {
      type: [recalibrationSchema],
      default: [],
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
    locked: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
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

export type KeyResult = {
  id: string;
  description: string;
  metric: string;
  deadline: Date;
  status: (typeof KEY_RESULT_STATUSES)[number];
};

export type Confirmation = {
  confirmed: boolean;
  at: Date | null;
};

export type Recalibration = {
  id: string;
  recalibratedAt: Date;
  reason: string;
  previousSnapshot: Record<string, unknown>;
  revisedFields: Record<string, unknown>;
  revisedSupportAgreement: string | null;
};

export type Goal_Type = {
  id: string;
  objectiveStatement: string;
  goalType: (typeof GOAL_TYPES)[number];
  keyResults: KeyResult[];
  strategyGoalId: string | Types.ObjectId | null;
  teamGoalId: string | Types.ObjectId | null;
  supportAgreement: string;
  checkInCadence: (typeof CHECKIN_CADENCES)[number];
  timePeriod: { start: Date; end: Date };
  status: (typeof GOAL_STATUSES)[number];
  employeeConfirmed: Confirmation;
  managerConfirmed: Confirmation;
  recalibrations: Recalibration[];
  owner: string | Types.ObjectId;
  manager: string | Types.ObjectId;
  locked: boolean;
  notes: string;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
