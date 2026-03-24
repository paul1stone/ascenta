import mongoose, { Schema } from "mongoose";
export {
  STRATEGY_HORIZONS,
  STRATEGY_HORIZON_LABELS,
  STRATEGY_HORIZON_SUGGESTIONS,
  STRATEGY_SCOPES,
  STRATEGY_GOAL_STATUSES,
} from "./strategy-goal-constants";
import {
  STRATEGY_HORIZONS,
  STRATEGY_SCOPES,
  STRATEGY_GOAL_STATUSES,
} from "./strategy-goal-constants";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const strategyGoalSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    horizon: {
      type: String,
      required: true,
      enum: STRATEGY_HORIZONS,
      index: true,
    },
    timePeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    scope: {
      type: String,
      required: true,
      enum: STRATEGY_SCOPES,
      index: true,
    },
    department: { type: String, default: null, index: true },
    successMetrics: { type: String, default: "" },
    status: {
      type: String,
      required: true,
      enum: STRATEGY_GOAL_STATUSES,
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

strategyGoalSchema.index({ scope: 1, horizon: 1 });
strategyGoalSchema.index({ department: 1, horizon: 1 });

export const StrategyGoal =
  mongoose.models.StrategyGoal ||
  mongoose.model("StrategyGoal", strategyGoalSchema);
