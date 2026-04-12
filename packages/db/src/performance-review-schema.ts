// packages/db/src/performance-review-schema.ts

import mongoose, { Schema } from "mongoose";
export {
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  REVIEW_STEPS,
  REVIEW_STEP_LABELS,
} from "./performance-review-constants";
import { REVIEW_STATUSES, REVIEW_STEPS } from "./performance-review-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const performanceReviewSchema = new Schema(
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
    reviewPeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      label: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: REVIEW_STATUSES,
      default: "in_progress",
      index: true,
    },
    currentStep: {
      type: String,
      required: true,
      enum: REVIEW_STEPS,
      default: "contributions",
    },

    // Step 1 — pulled context
    alignedGoals: [
      {
        goalId: { type: Schema.Types.ObjectId, ref: "Goal" },
        title: String,
        category: String,
        status: String,
        alignment: String,
        successMetric: String,
      },
    ],
    checkInSummaries: [
      {
        checkInId: { type: Schema.Types.ObjectId, ref: "CheckIn" },
        completedAt: Date,
        managerNotes: String,
        employeeNotes: String,
      },
    ],
    performanceNotes: [
      {
        noteId: { type: Schema.Types.ObjectId, ref: "PerformanceNote" },
        type: String,
        observation: String,
        createdAt: Date,
      },
    ],
    foundation: {
      mission: { type: String, default: "" },
      values: { type: String, default: "" },
    },
    strategyGoals: [
      {
        strategyGoalId: { type: Schema.Types.ObjectId, ref: "StrategyGoal" },
        title: String,
        horizon: String,
      },
    ],

    // Step 2 — manager contributions
    contributions: {
      strategicPriorities: { type: String, default: "" },
      outcomesAchieved: { type: String, default: "" },
      behaviors: { type: String, default: "" },
      additionalContext: { type: String, default: "" },
    },

    // Step 3 — AI draft
    draft: {
      summary: { type: String, default: "" },
      strengthsAndImpact: { type: String, default: "" },
      areasForGrowth: { type: String, default: "" },
      strategicAlignment: { type: String, default: "" },
      overallAssessment: { type: String, default: "" },
    },

    // Step 4 — final document
    finalDocument: {
      summary: { type: String, default: "" },
      strengthsAndImpact: { type: String, default: "" },
      areasForGrowth: { type: String, default: "" },
      strategicAlignment: { type: String, default: "" },
      overallAssessment: { type: String, default: "" },
      managerSignoff: {
        at: { type: Date, default: null },
        name: { type: String, default: "" },
      },
    },

    // Step 5 — goal recommendations
    goalRecommendations: [
      {
        title: String,
        description: String,
        category: String,
        alignment: String,
        rationale: String,
      },
    ],
    goalHandoffCompleted: { type: Boolean, default: false },

    alignmentLevel: {
      type: String,
      enum: ["strong", "acceptable", "poor", null],
      default: null,
    },

    workflowRunId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

performanceReviewSchema.index({ employee: 1, "reviewPeriod.end": 1 });
performanceReviewSchema.index({ manager: 1, status: 1 });
performanceReviewSchema.index({ status: 1, "reviewPeriod.end": 1 });

export const PerformanceReview =
  mongoose.models.PerformanceReview ||
  mongoose.model("PerformanceReview", performanceReviewSchema);
