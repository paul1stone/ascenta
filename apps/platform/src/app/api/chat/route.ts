import { streamText, stepCountIs, type ModelMessage } from "ai";
import { connectDB } from "@ascenta/db";
import { getModel, checkProviderConfig } from "@/lib/ai/providers";
import { getProviderForModel } from "@/lib/ai/config";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  defaultChatTools,
  createTaskTool,
  getEmployeeInfoTool,
} from "@/lib/ai/tools";
import {
  startCorrectiveActionTool,
  updateWorkflowFieldTool,
  generateCorrectiveActionDocumentTool,
  generateWorkflowFollowUpTool,
  getWorkflowStateSummary,
} from "@/lib/ai/workflow-tools";
import {
  startGoalCreationTool,
  startCheckInTool,
  startPerformanceNoteTool,
  completeGrowWorkflowTool,
} from "@/lib/ai/grow-tools";
import { AI_CONFIG } from "@/lib/ai/config";
import {
  createConversation,
  getConversation,
  addMessage,
  getRecentMessages,
  updateConversation,
} from "@ascenta/db/conversations";

export const maxDuration = 30;

interface ChatRequest {
  messages?: ModelMessage[];
  conversationId?: string;
  userId?: string;
  model?: string;
  systemPrompt?: string;
  useTools?: boolean;
  /** When set, no user message is shown or stored; backend injects this for the model only */
  workflowFieldSelection?: { runId: string; fieldKey: string; value: string };
  /** When set, no user message is shown or stored; backend injects this for the model only */
  workflowFollowUp?: { runId: string; type: "email" | "script" };
  /** Active corrective action run – we inject current collected/still-needed state so the AI does not re-ask */
  activeWorkflowRunId?: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body: ChatRequest = await req.json();
    const {
      messages = [],
      conversationId,
      userId = "anonymous",
      model = AI_CONFIG.defaultModels.anthropic,
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      useTools = true,
      workflowFieldSelection,
      workflowFollowUp,
      activeWorkflowRunId,
    } = body;

    const isWorkflowAction = !!(workflowFieldSelection || workflowFollowUp);

    if (isWorkflowAction) {
      if (!conversationId) {
        return new Response(
          JSON.stringify({ error: "conversationId is required for workflow actions" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (!messages || messages.length === 0) {
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
      conversation = await createConversation({
        userId,
        model,
        provider: getProviderForModel(model),
        systemPrompt,
      });
    }

    // Get conversation history for context
    const historyMessages = conversationId
      ? await getRecentMessages(conversationId, AI_CONFIG.context.maxMessages)
      : [];

    const contextMessages: ModelMessage[] = historyMessages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    const allMessages: ModelMessage[] = [...contextMessages];

    if (isWorkflowAction) {
      // Inject synthetic user message for the model only; do not store it
      const syntheticContent = workflowFieldSelection
        ? `[SELECT:${workflowFieldSelection.runId}:${workflowFieldSelection.fieldKey}:${workflowFieldSelection.value}]`
        : `[FOLLOW_UP:${workflowFollowUp!.runId}:${workflowFollowUp!.type}]`;
      allMessages.push({ role: "user", content: syntheticContent });
    } else {
      const newMessage = messages[messages.length - 1];
      const lastHistoryContent = contextMessages[contextMessages.length - 1]?.content;
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
      if (lastHistoryContent !== newMessageContent && newMessage) {
        allMessages.push(newMessage);
      }
      await addMessage({
        conversationId: conversation.id,
        role: "user",
        content: newMessageContent,
      });
      if (!conversation.title && historyMessages.length === 0) {
        const title = newMessageContent.slice(0, 50) + (newMessageContent.length > 50 ? "..." : "");
        await updateConversation(conversation.id, { title });
      }
    }

    // Inject workflow state when we have an active run so the AI does not re-ask for collected fields
    const runIdForState = activeWorkflowRunId ?? workflowFieldSelection?.runId ?? workflowFollowUp?.runId;
    let effectiveSystemPrompt = systemPrompt;
    if (runIdForState) {
      const stateSummary = await getWorkflowStateSummary(runIdForState);
      if (stateSummary) {
        effectiveSystemPrompt = `${systemPrompt}\n\n## Current workflow memory (use this – do not ask again for anything listed as collected)\n\n${stateSummary.formattedForPrompt}`;
      }
    }

    // Get the model instance
    const modelInstance = getModel(model);

    // Check which tools are available based on provider availability
    const availability = checkProviderConfig();
    // Full tools when OpenAI available (includes RAG search); otherwise workflow tools (no embeddings)
    const workflowTools = {
      createTask: createTaskTool,
      getEmployeeInfo: getEmployeeInfoTool,
      startCorrectiveAction: startCorrectiveActionTool,
      updateWorkflowField: updateWorkflowFieldTool,
      generateCorrectiveActionDocument: generateCorrectiveActionDocumentTool,
      generateWorkflowFollowUp: generateWorkflowFollowUpTool,
      startGoalCreation: startGoalCreationTool,
      startCheckIn: startCheckInTool,
      startPerformanceNote: startPerformanceNoteTool,
      completeGrowWorkflow: completeGrowWorkflowTool,
    };
    const availableTools = useTools
      ? availability.openai
        ? defaultChatTools
        : availability.anthropic
          ? workflowTools
          : { createTask: createTaskTool }
      : undefined;

    // Stream the response (stopWhen allows multiple tool roundtrips for workflow building)
    const result = streamText({
      model: modelInstance,
      system: effectiveSystemPrompt,
      messages: allMessages,
      tools: availableTools,
      stopWhen: stepCountIs(10),
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Chat API error:", stack || message);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: message,
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
    await connectDB();
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
