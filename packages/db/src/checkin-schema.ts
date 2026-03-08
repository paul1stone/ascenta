/**
 * CheckIn Schema (Mongoose)
 * Tracks scheduled check-ins between managers and employees for goal progress.
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

export const CHECKIN_STATUSES = [
  "scheduled",
  "completed",
  "missed",
  "cancelled",
] as const;

// ============================================================================
// CHECKIN SCHEMA
// ============================================================================

const checkInSchema = new Schema(
  {
    goals: {
      type: [{ type: Schema.Types.ObjectId, ref: "Goal" }],
      required: true,
    },
    employee: {
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
    dueDate: { type: Date, required: true, index: true },
    completedAt: { type: Date, default: null },
    managerProgressObserved: { type: String, default: null },
    managerCoachingNeeded: { type: String, default: null },
    managerRecognition: { type: String, default: null },
    employeeProgress: { type: String, default: null },
    employeeObstacles: { type: String, default: null },
    employeeSupportNeeded: { type: String, default: null },
    status: {
      type: String,
      required: true,
      enum: CHECKIN_STATUSES,
      default: "scheduled",
      index: true,
    },
    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

// Compound indexes
checkInSchema.index({ employee: 1, dueDate: 1 });
checkInSchema.index({ status: 1, dueDate: 1 });
checkInSchema.index({ manager: 1, status: 1 });

export const CheckIn =
  mongoose.models.CheckIn || mongoose.model("CheckIn", checkInSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type CheckIn_Type = {
  id: string;
  goals: Types.ObjectId[];
  employee: Types.ObjectId;
  manager: Types.ObjectId;
  dueDate: Date;
  completedAt: Date | null;
  managerProgressObserved: string | null;
  managerCoachingNeeded: string | null;
  managerRecognition: string | null;
  employeeProgress: string | null;
  employeeObstacles: string | null;
  employeeSupportNeeded: string | null;
  status: (typeof CHECKIN_STATUSES)[number];
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
