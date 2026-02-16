"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { AppSidebar } from "@/components/chat/app-sidebar";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { extractLastWorkflowRunId } from "@/components/chat/workflow-blocks";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AI_CONFIG } from "@/lib/ai/config";
import type { ConversationSummary } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Default to Anthropic Claude Sonnet 4
const DEFAULT_MODEL = AI_CONFIG.defaultModels.anthropic;

// Inner component that can use useSidebar hook
function ChatContent({
  messages,
  setMessages,
  input,
  setInput,
  isLoading,
  setIsLoading,
  conversationId,
  setConversationId,
  conversations,
  model,
  setModel,
  messagesEndRef,
  abortControllerRef,
  handleNewChat,
  loadConversation,
  loadConversations,
}: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  conversationId: string | undefined;
  setConversationId: React.Dispatch<React.SetStateAction<string | undefined>>;
  conversations: ConversationSummary[];
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  handleNewChat: () => void;
  loadConversation: (id: string) => Promise<void>;
  loadConversations: () => Promise<void>;
}) {
  const handleSubmit = async (overrideValue?: string) => {
    const content = (overrideValue ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideValue) setInput("");
    setIsLoading(true);

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      abortControllerRef.current = new AbortController();

      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
      const activeWorkflowRunId = lastAssistant ? extractLastWorkflowRunId(lastAssistant.content) : undefined;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content }],
          conversationId,
          userId: "anonymous",
          model,
          ...(activeWorkflowRunId ? { activeWorkflowRunId } : {}),
        }),
        signal: abortControllerRef.current.signal,
      });

      // Get conversation ID from response header
      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
        loadConversations();
      }

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  /** Workflow field/button selection: no user message shown, backend injects it */
  const handleWorkflowFieldSelect = async (runId: string, fieldKey: string, value: string) => {
    if (isLoading || !conversationId) return;
    setIsLoading(true);
    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);
    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          model,
          workflowFieldSelection: { runId, fieldKey, value },
        }),
        signal: abortControllerRef.current.signal,
      });
      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
        loadConversations();
      }
      if (!res.ok) throw new Error("Failed to get response");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      if (reader) {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(chunk, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
            )
          );
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Chat error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Sorry, something went wrong. Please try again." }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  /** Follow-up action (email/script): no user message shown */
  const handleWorkflowFollowUpSelect = async (runId: string, type: "email" | "script") => {
    if (isLoading || !conversationId) return;
    setIsLoading(true);
    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);
    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          model,
          workflowFollowUp: { runId, type },
        }),
        signal: abortControllerRef.current.signal,
      });
      if (!res.ok) throw new Error("Failed to get response");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      if (reader) {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(chunk, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
            )
          );
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Chat error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Sorry, something went wrong. Please try again." }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  // No offset needed — right sidebar is removed, SidebarInset already
  // accounts for the left sidebar width via its own CSS.

  return (
    <SidebarInset className="bg-glacier flex flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="flex-1 font-display font-semibold text-deep-blue">
          {conversationId ? "Chat" : "New Chat"}
        </h1>
      </header>

      {/* Main Content Area - fills remaining height */}
      <div className="flex flex-1 min-h-0">
        {/* Chat Area (messages + input) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <ChatWelcome onSuggestionClick={handleSuggestionClick} />
            ) : (
              <div className="mx-auto max-w-3xl px-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    isStreaming={
                      isLoading &&
                      index === messages.length - 1 &&
                      message.role === "assistant"
                    }
                    onWorkflowOptionSelect={handleWorkflowFieldSelect}
                    onFollowUpSelect={handleWorkflowFollowUpSelect}
                    onFollowUpOther={(value) => handleSubmit(value)}
                  />
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t border-border bg-gradient-to-t from-glacier to-transparent p-4">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={() => handleSubmit()}
                onStop={handleStop}
                isLoading={isLoading}
                model={model}
                onModelChange={setModel}
              />
            </div>
          </div>
        </div>

      </div>
    </SidebarInset>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/conversations?userId=anonymous");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations?id=${id}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map(
            (m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            })
          )
        );
        setConversationId(id);
        if (data.conversation?.model) {
          setModel(data.conversation.model);
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setInput("");
    setModel(DEFAULT_MODEL);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar
        conversations={conversations}
        currentConversationId={conversationId}
        onNewChat={handleNewChat}
        onSelectConversation={loadConversation}
      />
      <ChatContent
        messages={messages}
        setMessages={setMessages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        conversationId={conversationId}
        setConversationId={setConversationId}
        conversations={conversations}
        model={model}
        setModel={setModel}
        messagesEndRef={messagesEndRef}
        abortControllerRef={abortControllerRef}
        handleNewChat={handleNewChat}
        loadConversation={loadConversation}
        loadConversations={loadConversations}
      />
    </SidebarProvider>
  );
}
