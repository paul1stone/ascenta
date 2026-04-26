/**
 * Employee and Employee Notes Schema (Mongoose)
 * Notes are embedded sub-documents within employees
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
// EMPLOYEE NOTE (embedded sub-document)
// ============================================================================

const employeeNoteSchema = new Schema(
  {
    noteType: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String },
    severity: { type: String },
    occurredAt: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ============================================================================
// EMPLOYEE PROFILE (embedded sub-document)
// ============================================================================

const employeeChoiceSchema = new Schema(
  {
    label: { type: String, default: "", trim: true },
    value: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const getToKnowSchema = new Schema(
  {
    personalBio: { type: String, default: "", trim: true },
    hobbies: { type: String, default: "", trim: true },
    funFacts: { type: [String], default: [] },
    askMeAbout: { type: String, default: "", trim: true },
    hometown: { type: String, default: "", trim: true },
    currentlyConsuming: { type: String, default: "", trim: true },
    employeeChoice: { type: employeeChoiceSchema, default: () => ({}) },
  },
  { _id: false }
);

const profileSchema = new Schema(
  {
    photoBase64: { type: String, default: null },
    pronouns: { type: String, default: null, trim: true },
    preferredChannel: { type: String, default: null, trim: true },
    getToKnow: { type: getToKnowSchema, default: () => ({}) },
    profileUpdatedAt: { type: Date, default: null },
  },
  { _id: false }
);

// ============================================================================
// EMPLOYEE
// ============================================================================

const employeeSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    department: { type: String, required: true, index: true },
    jobTitle: { type: String, required: true },
    managerName: { type: String, required: true },
    hireDate: { type: Date, required: true },
    status: { type: String, default: "active", required: true },
    notes: [employeeNoteSchema],
    jobDescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "JobDescription",
      index: true,
      default: null,
    },
    profile: { type: profileSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

// Compound index for name search
employeeSchema.index({ firstName: 1, lastName: 1 });

export const Employee =
  mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);

// ============================================================================
// TYPE ALIASES (backward compatibility)
// ============================================================================

export type EmployeeChoice = {
  label: string;
  value: string;
};

export type EmployeeGetToKnow = {
  personalBio: string;
  hobbies: string;
  funFacts: string[];
  askMeAbout: string;
  hometown: string;
  currentlyConsuming: string;
  employeeChoice: EmployeeChoice;
};

export type EmployeeProfile = {
  photoBase64: string | null;
  pronouns: string | null;
  preferredChannel: string | null;
  getToKnow: EmployeeGetToKnow;
  profileUpdatedAt: Date | null;
};

export type Employee_Type = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  managerName: string;
  hireDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  jobDescriptionId?: string | null;
  profile?: EmployeeProfile;
};

export type NewEmployee = {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  managerName: string;
  hireDate: Date;
  status?: string;
  jobDescriptionId?: string | null;
};

export type EmployeeNote = {
  id: string;
  employeeId: string;
  noteType: string;
  title: string;
  content: string | null;
  severity: string | null;
  occurredAt: Date;
  metadata: unknown;
  createdAt: Date;
};

export type NewEmployeeNote = {
  employeeId: string;
  noteType: string;
  title: string;
  content?: string | null;
  severity?: string | null;
  occurredAt: Date;
  metadata?: unknown;
};
