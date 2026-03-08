/**
 * PerformanceNote Schema (Mongoose)
 * Manager observations and feedback on employee performance.
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
// CONSTANTS (re-exported from performance-note-constants.ts)
// ============================================================================

export { NOTE_TYPES } from "./performance-note-constants";
import { NOTE_TYPES } from "./performance-note-constants";

// ============================================================================
// PERFORMANCE NOTE
// ============================================================================

const performanceNoteSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: NOTE_TYPES,
      index: true,
    },
    observation: { type: String, required: true },
    expectation: { type: String, default: null },
    relatedGoal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    relatedCheckIn: {
      type: Schema.Types.ObjectId,
      ref: "CheckIn",
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

// Compound index for querying notes by employee in reverse chronological order
performanceNoteSchema.index({ employee: 1, createdAt: -1 });

export const PerformanceNote =
  mongoose.models.PerformanceNote ||
  mongoose.model("PerformanceNote", performanceNoteSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type PerformanceNote_Type = {
  id: string;
  employee: Types.ObjectId | string;
  author: Types.ObjectId | string;
  type: (typeof NOTE_TYPES)[number];
  observation: string;
  expectation: string | null;
  relatedGoal: Types.ObjectId | string | null;
  relatedCheckIn: Types.ObjectId | string | null;
  workflowRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
