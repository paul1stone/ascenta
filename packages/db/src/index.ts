import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. Please configure your MongoDB Atlas connection."
    );
  }

  await mongoose.connect(uri);
  isConnected = true;
}

// Re-export mongoose for direct access if needed
export { mongoose };

// Re-export all schemas/models
export * from "./schema";
export * from "./checkin-schema";
export * from "./goal-schema";
export * from "./performance-note-schema";
export * from "./notification-schema";
export * from "./review-cycle-schema";
