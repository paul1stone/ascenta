import mongoose, { Schema } from "mongoose";

const namedItemSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const foundationSchema = new Schema(
  {
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    values: { type: String, default: "" },
    nonNegotiableBehaviors: { type: [namedItemSchema], default: [] },
    livedPrinciples: { type: [namedItemSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  },
);

export const CompanyFoundation =
  mongoose.models.CompanyFoundation ||
  mongoose.model("CompanyFoundation", foundationSchema);
