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

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface PageConversation {
  messages: Message[];
  conversationId: string | undefined;
  isLoading: boolean;
  input: string;
}

export interface ChatContextValue {
  getPageState: (pageKey: string) => PageConversation;
  activePageKey: string;
  setActivePageKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (pageKey: string, content: string) => Promise<void>;
  setPageInput: (pageKey: string, value: string) => void;
  resetConversation: (pageKey: string) => void;
  stopGeneration: (pageKey: string) => void;
  handleWorkflowFieldSelect: (
    pageKey: string,
    runId: string,
    fieldKey: string,
    value: string,
  ) => Promise<void>;
  handleWorkflowFollowUpSelect: (
    pageKey: string,
    runId: string,
    type: "email" | "script",
  ) => Promise<void>;
}

const DEFAULT_PAGE_STATE: PageConversation = {
  messages: [],
  conversationId: undefined,
  isLoading: false,
  input: "",
};

const ChatContext = createContext<ChatContextValue | null>(null);

const DEFAULT_MODEL = AI_CONFIG.defaultModels.anthropic;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [pageConversations, setPageConversations] = useState<
    Map<string, PageConversation>
  >(new Map());
  const [activePageKey, setActivePageKey] = useState<string>("");
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Scroll to bottom when active page messages change
  const activeMessages = pageConversations.get(activePageKey)?.messages;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const getPageState = useCallback(
    (pageKey: string): PageConversation => {
      return pageConversations.get(pageKey) ?? DEFAULT_PAGE_STATE;
    },
    [pageConversations],
  );

  const updatePageState = useCallback(
    (pageKey: string, partial: Partial<PageConversation>) => {
      setPageConversations((prev) => {
        const next = new Map(prev);
        const current = prev.get(pageKey) ?? { ...DEFAULT_PAGE_STATE };
        next.set(pageKey, { ...current, ...partial });
        return next;
      });
    },
    [],
  );

  const setPageInput = useCallback(
    (pageKey: string, value: string) => {
      updatePageState(pageKey, { input: value });
    },
    [updatePageState],
  );

  const resetConversation = useCallback((pageKey: string) => {
    // Abort any in-flight request
    const controller = abortControllersRef.current.get(pageKey);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(pageKey);
    }
    setPageConversations((prev) => {
      const next = new Map(prev);
      next.delete(pageKey);
      return next;
    });
  }, []);

  const stopGeneration = useCallback((pageKey: string) => {
    const controller = abortControllersRef.current.get(pageKey);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(pageKey);
    }
    setPageConversations((prev) => {
      const current = prev.get(pageKey);
      if (!current) return prev;
      const next = new Map(prev);
      next.set(pageKey, { ...current, isLoading: false });
      return next;
    });
  }, []);

  const sendMessage = useCallback(
    async (pageKey: string, content: string) => {
      const trimmed = content.trim();
      const pageState = pageConversations.get(pageKey) ?? {
        ...DEFAULT_PAGE_STATE,
      };
      if (!trimmed || pageState.isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      // Add user message + placeholder and set loading
      setPageConversations((prev) => {
        const next = new Map(prev);
        const current = prev.get(pageKey) ?? { ...DEFAULT_PAGE_STATE };
        next.set(pageKey, {
          ...current,
          messages: [...current.messages, userMessage, assistantPlaceholder],
          isLoading: true,
          input: "",
        });
        return next;
      });

      try {
        const abortController = new AbortController();
        abortControllersRef.current.set(pageKey, abortController);

        const lastAssistant = [...pageState.messages]
          .reverse()
          .find((m) => m.role === "assistant");
        const activeWorkflowRunId = lastAssistant
          ? extractLastWorkflowRunId(lastAssistant.content)
          : undefined;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: trimmed }],
            conversationId: pageState.conversationId,
            userId: "anonymous",
            model,
            ...(activeWorkflowRunId ? { activeWorkflowRunId } : {}),
          }),
          signal: abortController.signal,
        });

        const newConversationId = res.headers.get("X-Conversation-Id");
        if (newConversationId && !pageState.conversationId) {
          updatePageState(pageKey, { conversationId: newConversationId });
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
            const streamedContent = fullContent;
            setPageConversations((prev) => {
              const next = new Map(prev);
              const current = prev.get(pageKey);
              if (!current) return prev;
              next.set(pageKey, {
                ...current,
                messages: current.messages.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: streamedContent }
                    : msg,
                ),
              });
              return next;
            });
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Chat error:", error);
          setPageConversations((prev) => {
            const next = new Map(prev);
            const current = prev.get(pageKey);
            if (!current) return prev;
            next.set(pageKey, {
              ...current,
              messages: current.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content:
                        "Sorry, I encountered an error. Please try again.",
                    }
                  : msg,
              ),
            });
            return next;
          });
        }
      } finally {
        abortControllersRef.current.delete(pageKey);
        setPageConversations((prev) => {
          const current = prev.get(pageKey);
          if (!current) return prev;
          const next = new Map(prev);
          next.set(pageKey, { ...current, isLoading: false });
          return next;
        });
      }
    },
    [pageConversations, model, updatePageState],
  );

  const handleWorkflowFieldSelect = useCallback(
    async (pageKey: string, runId: string, fieldKey: string, value: string) => {
      const pageState = pageConversations.get(pageKey) ?? {
        ...DEFAULT_PAGE_STATE,
      };
      if (pageState.isLoading || !pageState.conversationId) return;

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      setPageConversations((prev) => {
        const next = new Map(prev);
        const current = prev.get(pageKey) ?? { ...DEFAULT_PAGE_STATE };
        next.set(pageKey, {
          ...current,
          messages: [...current.messages, assistantPlaceholder],
          isLoading: true,
        });
        return next;
      });

      try {
        const abortController = new AbortController();
        abortControllersRef.current.set(pageKey, abortController);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: pageState.conversationId,
            model,
            workflowFieldSelection: { runId, fieldKey, value },
          }),
          signal: abortController.signal,
        });

        const newConversationId = res.headers.get("X-Conversation-Id");
        if (newConversationId && !pageState.conversationId) {
          updatePageState(pageKey, { conversationId: newConversationId });
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
            const streamedContent = fullContent;
            setPageConversations((prev) => {
              const next = new Map(prev);
              const current = prev.get(pageKey);
              if (!current) return prev;
              next.set(pageKey, {
                ...current,
                messages: current.messages.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: streamedContent }
                    : msg,
                ),
              });
              return next;
            });
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Chat error:", err);
          setPageConversations((prev) => {
            const next = new Map(prev);
            const current = prev.get(pageKey);
            if (!current) return prev;
            next.set(pageKey, {
              ...current,
              messages: current.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content:
                        "Sorry, something went wrong. Please try again.",
                    }
                  : msg,
              ),
            });
            return next;
          });
        }
      } finally {
        abortControllersRef.current.delete(pageKey);
        setPageConversations((prev) => {
          const current = prev.get(pageKey);
          if (!current) return prev;
          const next = new Map(prev);
          next.set(pageKey, { ...current, isLoading: false });
          return next;
        });
      }
    },
    [pageConversations, model, updatePageState],
  );

  const handleWorkflowFollowUpSelect = useCallback(
    async (pageKey: string, runId: string, type: "email" | "script") => {
      const pageState = pageConversations.get(pageKey) ?? {
        ...DEFAULT_PAGE_STATE,
      };
      if (pageState.isLoading || !pageState.conversationId) return;

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      setPageConversations((prev) => {
        const next = new Map(prev);
        const current = prev.get(pageKey) ?? { ...DEFAULT_PAGE_STATE };
        next.set(pageKey, {
          ...current,
          messages: [...current.messages, assistantPlaceholder],
          isLoading: true,
        });
        return next;
      });

      try {
        const abortController = new AbortController();
        abortControllersRef.current.set(pageKey, abortController);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: pageState.conversationId,
            model,
            workflowFollowUp: { runId, type },
          }),
          signal: abortController.signal,
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
            const streamedContent = fullContent;
            setPageConversations((prev) => {
              const next = new Map(prev);
              const current = prev.get(pageKey);
              if (!current) return prev;
              next.set(pageKey, {
                ...current,
                messages: current.messages.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: streamedContent }
                    : msg,
                ),
              });
              return next;
            });
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Chat error:", err);
          setPageConversations((prev) => {
            const next = new Map(prev);
            const current = prev.get(pageKey);
            if (!current) return prev;
            next.set(pageKey, {
              ...current,
              messages: current.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content:
                        "Sorry, something went wrong. Please try again.",
                    }
                  : msg,
              ),
            });
            return next;
          });
        }
      } finally {
        abortControllersRef.current.delete(pageKey);
        setPageConversations((prev) => {
          const current = prev.get(pageKey);
          if (!current) return prev;
          const next = new Map(prev);
          next.set(pageKey, { ...current, isLoading: false });
          return next;
        });
      }
    },
    [pageConversations, model],
  );

  return (
    <ChatContext.Provider
      value={{
        getPageState,
        activePageKey,
        setActivePageKey,
        model,
        setModel,
        messagesEndRef,
        sendMessage,
        setPageInput,
        resetConversation,
        stopGeneration,
        handleWorkflowFieldSelect,
        handleWorkflowFollowUpSelect,
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

/** @deprecated Use useChat() instead */
export const useChatPanel = useChat;
