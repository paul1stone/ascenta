/**
 * Strategy Translation Schema (Mongoose)
 * Stores AI-generated role-based language derived from Foundation + Strategic Priorities.
 * One document per department per version. Versions are archived, never overwritten.
 */

import mongoose, { Schema, Types } from "mongoose";
import { TRANSLATION_STATUSES, ROLE_LEVELS } from "./strategy-translation-constants";

export {
  TRANSLATION_STATUSES,
  ROLE_LEVELS,
} from "./strategy-translation-constants";

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

const alignmentDescriptorSchema = new Schema(
  {
    strong: { type: String, required: true },
    acceptable: { type: String, required: true },
    poor: { type: String, required: true },
  },
  { _id: false },
);

const contributionSchema = new Schema(
  {
    strategyGoalId: {
      type: Schema.Types.ObjectId,
      ref: "StrategyGoal",
      required: true,
    },
    strategyGoalTitle: { type: String, required: true },
    roleContribution: { type: String, required: true },
    outcomes: { type: [String], required: true },
    alignmentDescriptors: {
      type: alignmentDescriptorSchema,
      required: true,
    },
  },
  { _id: false },
);

const behaviorSchema = new Schema(
  {
    valueName: { type: String, required: true },
    expectation: { type: String, required: true },
  },
  { _id: false },
);

const decisionRightsSchema = new Schema(
  {
    canDecide: { type: [String], default: [] },
    canRecommend: { type: [String], default: [] },
    mustEscalate: { type: [String], default: [] },
  },
  { _id: false },
);

const roleSchema = new Schema(
  {
    jobTitle: { type: String, required: true },
    level: {
      type: String,
      required: true,
      enum: ROLE_LEVELS,
    },
    contributions: { type: [contributionSchema], default: [] },
    behaviors: { type: [behaviorSchema], default: [] },
    decisionRights: {
      type: decisionRightsSchema,
      default: () => ({ canDecide: [], canRecommend: [], mustEscalate: [] }),
    },
  },
  { _id: true },
);

const generatedFromSchema = new Schema(
  {
    foundationId: { type: Schema.Types.ObjectId, ref: "CompanyFoundation" },
    foundationUpdatedAt: { type: Date },
    strategyGoalIds: [{ type: Schema.Types.ObjectId, ref: "StrategyGoal" }],
    generatedAt: { type: Date, required: true },
  },
  { _id: false },
);

// ============================================================================
// MAIN SCHEMA
// ============================================================================

const strategyTranslationSchema = new Schema(
  {
    department: { type: String, required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      required: true,
      enum: TRANSLATION_STATUSES,
      default: "generating",
      index: true,
    },
    generatedFrom: { type: generatedFromSchema, required: true },
    roles: { type: [roleSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

strategyTranslationSchema.index({ department: 1, status: 1 });
strategyTranslationSchema.index({ department: 1, version: -1 });

export const StrategyTranslation =
  mongoose.models.StrategyTranslation ||
  mongoose.model("StrategyTranslation", strategyTranslationSchema);

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type AlignmentDescriptors = {
  strong: string;
  acceptable: string;
  poor: string;
};

export type Contribution = {
  strategyGoalId: string | Types.ObjectId;
  strategyGoalTitle: string;
  roleContribution: string;
  outcomes: string[];
  alignmentDescriptors: AlignmentDescriptors;
};

export type Behavior = {
  valueName: string;
  expectation: string;
};

export type DecisionRights = {
  canDecide: string[];
  canRecommend: string[];
  mustEscalate: string[];
};

export type TranslationRole = {
  id: string;
  jobTitle: string;
  level: (typeof ROLE_LEVELS)[number];
  contributions: Contribution[];
  behaviors: Behavior[];
  decisionRights: DecisionRights;
};

export type StrategyTranslation_Type = {
  id: string;
  department: string;
  version: number;
  status: (typeof TRANSLATION_STATUSES)[number];
  generatedFrom: {
    foundationId: string | Types.ObjectId;
    foundationUpdatedAt: Date;
    strategyGoalIds: (string | Types.ObjectId)[];
    generatedAt: Date;
  };
  roles: TranslationRole[];
  createdAt: Date;
  updatedAt: Date;
};
