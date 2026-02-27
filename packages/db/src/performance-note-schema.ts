/**
 * PerformanceNote Schema (Mongoose)
 * Manager/HR feedback observations linked to employees, goals, and check-ins.
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

export const PERFORMANCE_NOTE_TYPES = [
  "observation",
  "feedback",
  "coaching",
  "recognition",
  "concern",
] as const;
export const PERFORMANCE_NOTE_VISIBILITIES = [
  "manager_only",
  "hr_only",
  "shared_with_employee",
] as const;

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
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: PERFORMANCE_NOTE_TYPES,
      index: true,
    },
    content: { type: String, required: true },
    context: { type: String, default: null },
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
    visibility: {
      type: String,
      required: true,
      enum: PERFORMANCE_NOTE_VISIBILITIES,
      default: "manager_only",
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

// Compound index
performanceNoteSchema.index({ employee: 1, createdAt: -1 });

export const PerformanceNote =
  mongoose.models.PerformanceNote ||
  mongoose.model("PerformanceNote", performanceNoteSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type PerformanceNote_Type = {
  id: string;
  employee: string;
  author: string;
  type: (typeof PERFORMANCE_NOTE_TYPES)[number];
  content: string;
  context: string | null;
  relatedGoal: string | null;
  relatedCheckIn: string | null;
  visibility: (typeof PERFORMANCE_NOTE_VISIBILITIES)[number];
  createdAt: Date;
  updatedAt: Date;
};

export type NewPerformanceNote = {
  employee: string;
  author: string;
  type: (typeof PERFORMANCE_NOTE_TYPES)[number];
  content: string;
  context?: string | null;
  relatedGoal?: string | null;
  relatedCheckIn?: string | null;
  visibility?: (typeof PERFORMANCE_NOTE_VISIBILITIES)[number];
};
