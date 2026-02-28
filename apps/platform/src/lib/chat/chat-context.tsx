"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { extractLastWorkflowRunId } from "@/components/chat/workflow-blocks";
import { AI_CONFIG } from "@/lib/ai/config";
import type { ConversationSummary } from "@ascenta/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatContextValue {
  // State
  messages: Message[];
  input: string;
  isLoading: boolean;
  conversationId: string | undefined;
  conversations: ConversationSummary[];
  model: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;

  // Setters
  setInput: (value: string) => void;
  setModel: (model: string) => void;

  // Handlers
  handleSubmit: (overrideValue?: string) => Promise<void>;
  handleWorkflowFieldSelect: (runId: string, fieldKey: string, value: string) => Promise<void>;
  handleWorkflowFollowUpSelect: (runId: string, type: "email" | "script") => Promise<void>;
  handleStop: () => void;
  handleNewChat: () => void;
  loadConversation: (id: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const DEFAULT_MODEL = AI_CONFIG.defaultModels.anthropic;

export function ChatProvider({ children }: { children: ReactNode }) {
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

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations?userId=anonymous");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSubmit = useCallback(
    async (overrideValue?: string) => {
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
        const activeWorkflowRunId = lastAssistant
          ? extractLastWorkflowRunId(lastAssistant.content)
          : undefined;

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

        const newConversationId = res.headers.get("X-Conversation-Id");
        if (newConversationId && !conversationId) {
          setConversationId(newConversationId);
          loadConversations();
        }

        if (!res.ok) {
          throw new Error("Failed to get response");
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let fullContent = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullContent += decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
              )
            );
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Chat error:", error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
                : msg
            )
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [input, isLoading, messages, conversationId, model, loadConversations]
  );

  const handleWorkflowFieldSelect = useCallback(
    async (runId: string, fieldKey: string, value: string) => {
      if (isLoading || !conversationId) return;
      setIsLoading(true);
      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);
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
    },
    [isLoading, conversationId, model, loadConversations]
  );

  const handleWorkflowFollowUpSelect = useCallback(
    async (runId: string, type: "email" | "script") => {
      if (isLoading || !conversationId) return;
      setIsLoading(true);
      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);
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
    },
    [isLoading, conversationId, model]
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setInput("");
    setModel(DEFAULT_MODEL);
  }, []);

  const loadConversation = useCallback(
    async (id: string) => {
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
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        isLoading,
        conversationId,
        conversations,
        model,
        messagesEndRef,
        setInput,
        setModel,
        handleSubmit,
        handleWorkflowFieldSelect,
        handleWorkflowFollowUpSelect,
        handleStop,
        handleNewChat,
        loadConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
}
