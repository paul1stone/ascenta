import { streamText, type ModelMessage } from "ai";
import { getModel, checkProviderConfig } from "@/lib/ai/providers";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { defaultChatTools, createTaskTool } from "@/lib/ai/tools";
import { AI_CONFIG } from "@/lib/ai/config";
import {
  createConversation,
  getConversation,
  addMessage,
  getRecentMessages,
  updateConversation,
} from "@/lib/db/conversations";

export const maxDuration = 30;

interface ChatRequest {
  messages: ModelMessage[];
  conversationId?: string;
  userId?: string;
  model?: string;
  systemPrompt?: string;
  useTools?: boolean;
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const {
      messages,
      conversationId,
      userId = "anonymous",
      model = AI_CONFIG.defaultModels.anthropic,
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      useTools = true,
    } = body;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await getConversation(conversationId);
      if (!conversation) {
        return new Response(
          JSON.stringify({ error: "Conversation not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      // Create new conversation
      conversation = await createConversation({
        userId,
        model,
        provider: model.startsWith("claude") ? "anthropic" : "openai",
        systemPrompt,
      });
    }

    // Get conversation history for context
    const historyMessages = conversationId
      ? await getRecentMessages(conversationId, AI_CONFIG.context.maxMessages)
      : [];

    // Convert history to ModelMessage format
    const contextMessages: ModelMessage[] = historyMessages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    // Combine history with new messages (avoid duplicates)
    const allMessages = [...contextMessages];
    const lastHistoryContent = contextMessages[contextMessages.length - 1]?.content;
    const newMessage = messages[messages.length - 1];

    // Get content as string for comparison
    const getMessageContent = (msg: ModelMessage): string => {
      if (typeof msg.content === "string") return msg.content;
      if (Array.isArray(msg.content)) {
        return msg.content
          .filter((part): part is { type: "text"; text: string } => part.type === "text")
          .map((part) => part.text)
          .join("");
      }
      return "";
    };

    const newMessageContent = newMessage ? getMessageContent(newMessage) : "";
    
    // Only add the new message if it's not already in history
    if (lastHistoryContent !== newMessageContent && newMessage) {
      allMessages.push(newMessage);
    }

    // Store the user message
    if (newMessage?.role === "user") {
      await addMessage({
        conversationId: conversation.id,
        role: "user",
        content: newMessageContent,
      });

      // Generate title from first message if not set
      if (!conversation.title && historyMessages.length === 0) {
        const title = newMessageContent.slice(0, 50) + (newMessageContent.length > 50 ? "..." : "");
        await updateConversation(conversation.id, { title });
      }
    }

    // Get the model instance
    const modelInstance = getModel(model);

    // Check which tools are available based on provider availability
    const availability = checkProviderConfig();
    // Only include searchKnowledgeBase if OpenAI is available (for embeddings)
    const availableTools = useTools
      ? availability.openai
        ? defaultChatTools
        : { createTask: createTaskTool }
      : undefined;

    // Stream the response
    const result = streamText({
      model: modelInstance,
      system: systemPrompt,
      messages: allMessages,
      tools: availableTools,
      onFinish: async ({ text, toolCalls }) => {
        // Store the assistant's response
        await addMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: text,
          toolCalls: toolCalls ? JSON.parse(JSON.stringify(toolCalls)) : null,
        });
      },
    });

    // Return the streaming response with conversation ID
    return result.toTextStreamResponse({
      headers: {
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET endpoint to retrieve conversation history
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: "conversationId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const conversation = await getConversation(conversationId);
    if (!conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages = await getRecentMessages(conversationId, 100);

    return new Response(
      JSON.stringify({
        conversation,
        messages,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Get conversation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve conversation" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
