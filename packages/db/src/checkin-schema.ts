/**
 * CheckIn Schema (Mongoose)
 * Scheduled check-ins linked to goals for tracking progress.
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

export const CHECKIN_CADENCES = [
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
] as const;
export const CHECKIN_RATINGS = ["on_track", "at_risk", "off_track"] as const;
export const CHECKIN_STATUSES = [
  "scheduled",
  "completed",
  "missed",
  "cancelled",
] as const;

// ============================================================================
// CHECKIN
// ============================================================================

const checkInSchema = new Schema(
  {
    goal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    scheduledDate: { type: Date, required: true, index: true },
    completedDate: { type: Date, default: null },
    cadence: {
      type: String,
      required: true,
      enum: CHECKIN_CADENCES,
    },
    progress: { type: String, default: null },
    blockers: { type: String, default: null },
    supportNeeded: { type: String, default: null },
    rating: {
      type: String,
      enum: CHECKIN_RATINGS,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: CHECKIN_STATUSES,
      default: "scheduled",
      index: true,
    },
    performanceNote: {
      type: Schema.Types.ObjectId,
      ref: "PerformanceNote",
      default: null,
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
checkInSchema.index({ employee: 1, scheduledDate: 1 });
checkInSchema.index({ status: 1, scheduledDate: 1 });

export const CheckIn =
  mongoose.models.CheckIn || mongoose.model("CheckIn", checkInSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type CheckIn_Type = {
  id: string;
  goal: string;
  employee: string;
  scheduledDate: Date;
  completedDate: Date | null;
  cadence: (typeof CHECKIN_CADENCES)[number];
  progress: string | null;
  blockers: string | null;
  supportNeeded: string | null;
  rating: (typeof CHECKIN_RATINGS)[number] | null;
  status: (typeof CHECKIN_STATUSES)[number];
  performanceNote: string | null;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewCheckIn = {
  goal: string;
  employee: string;
  scheduledDate: Date;
  completedDate?: Date | null;
  cadence: (typeof CHECKIN_CADENCES)[number];
  progress?: string | null;
  blockers?: string | null;
  supportNeeded?: string | null;
  rating?: (typeof CHECKIN_RATINGS)[number] | null;
  status?: (typeof CHECKIN_STATUSES)[number];
  performanceNote?: string | null;
  workflowRunId?: string | null;
};
