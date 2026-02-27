import mongoose, { Schema, Types } from "mongoose";

// ============================================================================
// SHARED SCHEMA OPTIONS
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
// MESSAGE (embedded sub-document)
// ============================================================================

const messageSchema = new Schema(
  {
    role: { type: String, required: true },
    content: { type: String, required: true },
    toolCalls: { type: Schema.Types.Mixed },
    toolCallId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ============================================================================
// CONVERSATION
// ============================================================================

const conversationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String },
    aiModel: { type: String, default: "gpt-4o" },
    provider: { type: String, default: "openai" },
    systemPrompt: { type: String },
    messages: [messageSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: unknown, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        // Map internal aiModel → model for backward compat
        ret.model = ret.aiModel;
        delete ret.aiModel;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc: unknown, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        ret.model = ret.aiModel;
        delete ret.aiModel;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

// ============================================================================
// DOCUMENT (RAG source documents)
// ============================================================================

const documentSchema = new Schema(
  {
    title: { type: String },
    content: { type: String },
    source: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const DocumentModel =
  mongoose.models.Document ||
  mongoose.model("Document", documentSchema);

// ============================================================================
// EMBEDDING (vector chunks for Atlas Vector Search)
// ============================================================================

const embeddingSchema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    chunkIndex: { type: String },
    content: { type: String, required: true },
    embedding: { type: [Number] },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const EmbeddingModel =
  mongoose.models.Embedding ||
  mongoose.model("Embedding", embeddingSchema);

// ============================================================================
// TYPE ALIASES (backward compatibility)
// ============================================================================

export type Conversation = {
  id: string;
  userId: string;
  title: string | null;
  model: string | null;
  provider: string | null;
  systemPrompt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewConversation = {
  userId: string;
  title?: string | null;
  model?: string | null;
  provider?: string | null;
  systemPrompt?: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  toolCalls?: unknown;
  toolCallId?: string | null;
  metadata?: unknown;
  createdAt: Date;
};

export type NewMessage = {
  conversationId: string;
  role: string;
  content: string;
  toolCalls?: unknown;
  toolCallId?: string | null;
  metadata?: unknown;
};

export type Document = {
  id: string;
  title: string | null;
  content: string | null;
  source: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type NewDocument = {
  title?: string | null;
  content?: string | null;
  source?: string | null;
  metadata?: unknown;
};

export type Embedding = {
  id: string;
  documentId: string;
  chunkIndex: string | null;
  content: string;
  embedding: number[] | null;
  metadata: unknown;
  createdAt: Date;
};

export type NewEmbedding = {
  documentId: string;
  chunkIndex?: string | null;
  content: string;
  embedding?: number[] | null;
  metadata?: unknown;
};

// Re-export sub-schemas
export * from "./workflow-schema";
export * from "./employee-schema";
export * from "./demo-requests-schema";
