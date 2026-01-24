import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  vector,
} from "drizzle-orm/pg-core";

// Conversations table - persistent memory for chat sessions
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    title: text("title"),
    model: text("model").default("gpt-4o"),
    provider: text("provider").default("openai"), // 'openai' | 'anthropic'
    systemPrompt: text("system_prompt"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("conversations_user_id_idx").on(table.userId)]
);

// Messages table - individual messages in a conversation
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(), // 'user' | 'assistant' | 'system' | 'tool'
    content: text("content").notNull(),
    toolCalls: jsonb("tool_calls"), // For assistant tool calls
    toolCallId: text("tool_call_id"), // For tool responses
    metadata: jsonb("metadata"), // Token counts, model info, etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("messages_conversation_id_idx").on(table.conversationId)]
);

// Documents table - source documents for RAG
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title"),
  content: text("content"),
  source: text("source"), // URL, file path, etc.
  metadata: jsonb("metadata"), // Author, date, tags, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Embeddings table - vector embeddings for semantic search
export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .references(() => documents.id, { onDelete: "cascade" })
      .notNull(),
    chunkIndex: text("chunk_index"), // Position in document
    content: text("content").notNull(), // The text chunk
    embedding: vector("embedding", { dimensions: 1536 }), // OpenAI embedding
    metadata: jsonb("metadata"), // Chunk metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("embeddings_document_id_idx").on(table.documentId)]
);

// Type exports for use in queries
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;

// Re-export workflow schema
export * from "./workflow-schema";
