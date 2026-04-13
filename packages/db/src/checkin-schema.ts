import mongoose, { Schema, type Document, type Types } from "mongoose";
import {
  CHECKIN_STATUSES,
  CADENCE_SOURCES,
  type CheckInStatus,
} from "./checkin-constants";

export { CHECKIN_STATUSES, CADENCE_SOURCES, type CheckInStatus };

const EmployeePrepareSchema = new Schema(
  {
    progressReflection: { type: String, default: null },
    stuckPointReflection: { type: String, default: null },
    conversationIntent: { type: String, default: null },
    completedAt: { type: Date, default: null },
    distilledPreview: { type: String, default: null },
  },
  { _id: false }
);

const ManagerPrepareSchema = new Schema(
  {
    contextBriefingViewed: { type: Boolean, default: false },
    gapRecoveryViewed: { type: Boolean, default: false },
    openingMove: { type: String, default: null },
    recognitionNote: { type: String, default: null },
    developmentalFocus: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ParticipateSchema = new Schema(
  {
    employeeOpening: { type: String, default: null },
    employeeKeyTakeaways: { type: String, default: null },
    stuckPointDiscussion: { type: String, default: null },
    recognition: { type: String, default: null },
    development: { type: String, default: null },
    performance: { type: String, default: null },
    employeeCommitment: { type: String, default: null },
    managerCommitment: { type: String, default: null },
    employeeApprovedManagerCommitment: { type: Boolean, default: null },
    managerApprovedEmployeeCommitment: { type: Boolean, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const EmployeeReflectSchema = new Schema(
  {
    heard: { type: Number, default: null, min: 1, max: 5 },
    clarity: { type: Number, default: null, min: 1, max: 5 },
    recognition: { type: Number, default: null, min: 1, max: 5 },
    development: { type: Number, default: null, min: 1, max: 5 },
    safety: { type: Number, default: null, min: 1, max: 5 },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ManagerReflectSchema = new Schema(
  {
    clarity: { type: Number, default: null, min: 1, max: 5 },
    recognition: { type: Number, default: null, min: 1, max: 5 },
    development: { type: Number, default: null, min: 1, max: 5 },
    safety: { type: Number, default: null, min: 1, max: 5 },
    forwardAction: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const GapSignalsSchema = new Schema(
  {
    clarity: { type: Number, default: null },
    recognition: { type: Number, default: null },
    development: { type: Number, default: null },
    safety: { type: Number, default: null },
    generatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const CheckInSchema = new Schema(
  {
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
    goals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Goal",
        required: true,
      },
    ],
    scheduledAt: { type: Date, required: true, index: true },
    cadenceSource: {
      type: String,
      enum: CADENCE_SOURCES,
      default: "manual",
    },
    status: {
      type: String,
      enum: CHECKIN_STATUSES,
      required: true,
      default: "preparing",
      index: true,
    },
    employeePrepare: { type: EmployeePrepareSchema, default: () => ({}) },
    managerPrepare: { type: ManagerPrepareSchema, default: () => ({}) },
    participate: { type: ParticipateSchema, default: () => ({}) },
    employeeReflect: { type: EmployeeReflectSchema, default: () => ({}) },
    managerReflect: { type: ManagerReflectSchema, default: () => ({}) },
    gapSignals: { type: GapSignalsSchema, default: () => ({}) },
    completedAt: { type: Date, default: null },
    previousCheckInId: {
      type: Schema.Types.ObjectId,
      ref: "CheckIn",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CheckInSchema.index({ employee: 1, scheduledAt: -1 });
CheckInSchema.index({ manager: 1, status: 1 });
CheckInSchema.index({ status: 1, scheduledAt: 1 });
CheckInSchema.index({ employee: 1, manager: 1, status: 1 });

export interface CheckIn_Type extends Document {
  employee: Types.ObjectId;
  manager: Types.ObjectId;
  goals: Types.ObjectId[];
  scheduledAt: Date;
  cadenceSource: "auto" | "manual";
  status: CheckInStatus;
  employeePrepare: {
    progressReflection: string | null;
    stuckPointReflection: string | null;
    conversationIntent: string | null;
    completedAt: Date | null;
    distilledPreview: string | null;
  };
  managerPrepare: {
    contextBriefingViewed: boolean;
    gapRecoveryViewed: boolean;
    openingMove: string | null;
    recognitionNote: string | null;
    developmentalFocus: string | null;
    completedAt: Date | null;
  };
  participate: {
    employeeOpening: string | null;
    employeeKeyTakeaways: string | null;
    stuckPointDiscussion: string | null;
    recognition: string | null;
    development: string | null;
    performance: string | null;
    employeeCommitment: string | null;
    managerCommitment: string | null;
    employeeApprovedManagerCommitment: boolean | null;
    managerApprovedEmployeeCommitment: boolean | null;
    completedAt: Date | null;
  };
  employeeReflect: {
    heard: number | null;
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
    completedAt: Date | null;
  };
  managerReflect: {
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
    forwardAction: string | null;
    completedAt: Date | null;
  };
  gapSignals: {
    clarity: number | null;
    recognition: number | null;
    development: number | null;
    safety: number | null;
    generatedAt: Date | null;
  };
  completedAt: Date | null;
  previousCheckInId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export const CheckIn =
  (mongoose.models.CheckIn as mongoose.Model<CheckIn_Type>) ||
  mongoose.model<CheckIn_Type>("CheckIn", CheckInSchema);
