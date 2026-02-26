import { Conversation } from "./schema";
import type { NewConversation, NewMessage, Message } from "./schema";

/**
 * Convert a Mongoose conversation doc to a plain object.
 */
function toConversation(doc: Record<string, unknown>) {
  return doc as unknown as {
    id: string;
    userId: string;
    title: string | null;
    model: string | null;
    provider: string | null;
    systemPrompt: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

function toMessage(msg: Record<string, unknown>, conversationId: string): Message {
  return {
    id: msg.id as string ?? String(msg._id),
    conversationId,
    role: msg.role as string,
    content: msg.content as string,
    toolCalls: msg.toolCalls,
    toolCallId: (msg.toolCallId as string | null) ?? null,
    metadata: msg.metadata,
    createdAt: msg.createdAt as Date,
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(data: NewConversation) {
  const doc = await Conversation.create({
    userId: data.userId,
    title: data.title ?? undefined,
    aiModel: data.model ?? "gpt-4o",
    provider: data.provider ?? "openai",
    systemPrompt: data.systemPrompt ?? undefined,
    messages: [],
  });
  return toConversation(doc.toJSON());
}

/**
 * Get a conversation by ID
 */
export async function getConversation(id: string) {
  const doc = await Conversation.findById(id);
  return doc ? toConversation(doc.toJSON()) : null;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string) {
  const docs = await Conversation.find({ userId }).sort({ updatedAt: -1 });
  return docs.map((d: InstanceType<typeof Conversation>) => toConversation(d.toJSON()));
}

/**
 * Update conversation title or settings
 */
export async function updateConversation(
  id: string,
  data: Partial<Pick<NewConversation, "title" | "model" | "provider" | "systemPrompt">>
) {
  // Map `model` → `aiModel` for internal storage
  const updateFields: Record<string, unknown> = {};
  if (data.title !== undefined) updateFields.title = data.title;
  if (data.model !== undefined) updateFields.aiModel = data.model;
  if (data.provider !== undefined) updateFields.provider = data.provider;
  if (data.systemPrompt !== undefined) updateFields.systemPrompt = data.systemPrompt;

  const doc = await Conversation.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  );
  return doc ? toConversation(doc.toJSON()) : null;
}

/**
 * Delete a conversation and all its messages (embedded)
 */
export async function deleteConversation(id: string) {
  await Conversation.findByIdAndDelete(id);
}

/**
 * Add a message to a conversation (push to embedded array)
 */
export async function addMessage(data: NewMessage) {
  const doc = await Conversation.findByIdAndUpdate(
    data.conversationId,
    {
      $push: {
        messages: {
          role: data.role,
          content: data.content,
          toolCalls: data.toolCalls ?? undefined,
          toolCallId: data.toolCallId ?? undefined,
          metadata: data.metadata ?? undefined,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );
  if (!doc) throw new Error(`Conversation ${data.conversationId} not found`);
  const messages = (doc as Record<string, unknown>).messages as Record<string, unknown>[];
  const lastMsg = messages[messages.length - 1];
  return toMessage(lastMsg, data.conversationId);
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limit?: number
) {
  const doc = await Conversation.findById(conversationId);
  if (!doc) return [];
  const allMsgs = ((doc as Record<string, unknown>).messages ?? []) as Record<string, unknown>[];
  const msgs = limit ? allMsgs.slice(0, limit) : allMsgs;
  return msgs.map((m: Record<string, unknown>) => toMessage(m, conversationId));
}

/**
 * Get the last N messages for context
 */
export async function getRecentMessages(conversationId: string, count: number = 20) {
  const doc = await Conversation.findById(conversationId);
  if (!doc) return [];
  const allMsgs = ((doc as Record<string, unknown>).messages ?? []) as Record<string, unknown>[];
  const msgs = allMsgs.slice(-count);
  return msgs.map((m: Record<string, unknown>) => toMessage(m, conversationId));
}

/**
 * Delete a specific message
 */
export async function deleteMessage(id: string) {
  await Conversation.updateOne(
    { "messages._id": id },
    { $pull: { messages: { _id: id } } }
  );
}
