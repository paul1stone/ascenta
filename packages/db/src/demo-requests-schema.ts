import mongoose, { Schema } from "mongoose";

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const demoRequestSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    employeeCount: { type: String, required: true },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const DemoRequest =
  mongoose.models.DemoRequest ||
  mongoose.model("DemoRequest", demoRequestSchema);

export type DemoRequest_Type = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  employeeCount: string;
  phone: string | null;
  createdAt: Date;
};

export type NewDemoRequest = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  employeeCount: string;
  phone?: string | null;
};
