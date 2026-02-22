import { eq, desc } from "drizzle-orm";
import { db, conversations, messages, type NewConversation, type NewMessage } from "./index";

/**
 * Create a new conversation
 */
export async function createConversation(data: NewConversation) {
  const [conversation] = await db.insert(conversations).values(data).returning();
  return conversation;
}

/**
 * Get a conversation by ID
 */
export async function getConversation(id: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));
  return conversation ?? null;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

/**
 * Update conversation title or settings
 */
export async function updateConversation(
  id: string,
  data: Partial<Pick<NewConversation, "title" | "model" | "provider" | "systemPrompt">>
) {
  const [updated] = await db
    .update(conversations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();
  return updated;
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(id: string) {
  await db.delete(conversations).where(eq(conversations.id, id));
}

/**
 * Add a message to a conversation
 */
export async function addMessage(data: NewMessage) {
  const [message] = await db.insert(messages).values(data).returning();

  // Update conversation's updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  return message;
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limit?: number
) {
  const query = db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  if (limit) {
    return query.limit(limit);
  }
  return query;
}

/**
 * Get the last N messages for context
 */
export async function getRecentMessages(conversationId: string, count: number = 20) {
  // Get messages in reverse order, then reverse the result
  const recentMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(count);

  return recentMessages.reverse();
}

/**
 * Delete a specific message
 */
export async function deleteMessage(id: string) {
  await db.delete(messages).where(eq(messages.id, id));
}
