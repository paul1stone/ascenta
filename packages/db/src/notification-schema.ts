import mongoose, { Schema, type Document, type Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "prepare_open",
  "prepare_reminder",
  "checkin_ready",
  "reflect_open",
  "reflect_reminder",
  "gap_signal",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    checkInId: {
      type: Schema.Types.ObjectId,
      ref: "CheckIn",
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export interface Notification_Type extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  checkInId: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const Notification =
  (mongoose.models.Notification as mongoose.Model<Notification_Type>) ||
  mongoose.model<Notification_Type>("Notification", NotificationSchema);
