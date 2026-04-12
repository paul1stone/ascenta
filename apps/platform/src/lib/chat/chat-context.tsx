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

export type WorkflowType = "create-goal" | "run-check-in" | "add-performance-note" | "build-mvv" | "strategy-breakdown" | "performance-review";

export interface WorkingDocumentState {
  isOpen: boolean;
  workflowType: WorkflowType | null;
  runId: string | null;
  employeeId: string | null;
  employeeName: string | null;
  fields: Record<string, unknown>;
  /** For check-ins: available goals to link */
  availableGoals?: { id: string; title: string }[];
}

export interface ChatContextValue {
  getPageState: (pageKey: string) => PageConversation;
  activePageKey: string;
  setActivePageKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (pageKey: string, content: string, requiredTool?: string, currentEmployee?: { id: string; employeeId?: string; firstName: string; lastName: string; department: string; title: string }, outcomeContext?: { outcomeText: string; strategyGoalId: string; strategyGoalTitle: string; contributionRef: string }) => Promise<void>;
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
  workingDocument: WorkingDocumentState;
  openWorkingDocument: (
    workflowType: WorkflowType,
    runId: string,
    employeeId: string,
    employeeName: string,
    prefilled: Record<string, unknown>,
    availableGoals?: { id: string; title: string }[],
  ) => void;
  updateWorkingDocumentField: (fieldKey: string, value: unknown) => void;
  updateWorkingDocumentFields: (updates: Record<string, unknown>) => void;
  closeWorkingDocument: () => void;
  submitWorkingDocument: (pageKey: string) => Promise<void>;
}

const DEFAULT_PAGE_STATE: PageConversation = {
  messages: [],
  conversationId: undefined,
  isLoading: false,
  input: "",
};

const INITIAL_WORKING_DOC: WorkingDocumentState = {
  isOpen: false,
  workflowType: null,
  runId: null,
  employeeId: null,
  employeeName: null,
  fields: {},
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
  const [workingDocument, setWorkingDocument] =
    useState<WorkingDocumentState>(INITIAL_WORKING_DOC);

  const openWorkingDocument = useCallback(
    (
      workflowType: WorkflowType,
      runId: string,
      employeeId: string,
      employeeName: string,
      prefilled: Record<string, unknown>,
      availableGoals?: { id: string; title: string }[],
    ) => {
      setWorkingDocument({
        isOpen: true,
        workflowType,
        runId,
        employeeId,
        employeeName,
        fields: prefilled,
        availableGoals,
      });
    },
    [],
  );

  const updateWorkingDocumentField = useCallback(
    (fieldKey: string, value: unknown) => {
      setWorkingDocument((prev) => ({
        ...prev,
        fields: { ...prev.fields, [fieldKey]: value },
      }));
    },
    [],
  );

  const updateWorkingDocumentFields = useCallback(
    (updates: Record<string, unknown>) => {
      setWorkingDocument((prev) => ({
        ...prev,
        fields: { ...prev.fields, ...updates },
      }));
    },
    [],
  );

  const closeWorkingDocument = useCallback(() => {
    setWorkingDocument(INITIAL_WORKING_DOC);
  }, []);

  const submitWorkingDocument = useCallback(
    async (pageKey: string) => {
      const { workflowType, runId, fields, employeeId, employeeName } =
        workingDocument;

      if (!workflowType) {
        throw new Error("No active working document to submit");
      }

      const routeMap: Partial<Record<WorkflowType, string>> = {
        "create-goal": "/api/grow/goals",
        "run-check-in": "/api/grow/check-ins",
        "add-performance-note": "/api/grow/performance-notes",
        "build-mvv": "/api/plan/foundation",
      };

      const route = routeMap[workflowType];
      if (!route) {
        throw new Error(`Workflow type "${workflowType}" is read-only and cannot be submitted`);
      }

      // Prefer form-level employeeId/employeeName (set by EmployeePicker) over
      // the working-document-level values, which may be empty for direct-open.
      const effectiveEmployeeId =
        (fields.employeeId as string) || employeeId;
      const effectiveEmployeeName =
        (fields.employeeName as string) || employeeName;

      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          employeeId: effectiveEmployeeId,
          employeeName: effectiveEmployeeName,
          ...(runId ? { runId } : {}),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error ?? "Failed to submit working document",
        );
      }

      // For MVV, also publish after saving
      if (workflowType === "build-mvv") {
        await fetch("/api/plan/foundation", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "publish" }),
        });
      }

      let confirmText = `Successfully submitted ${workflowType.replace(/-/g, " ")}`;
      if (workflowType === "build-mvv") {
        confirmText = "Mission, Vision & Values saved and published! You can view them on the Foundation page.";
      } else {
        confirmText += ` for ${employeeName ?? "employee"}.`;
      }

      const confirmationMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: confirmText,
      };

      setPageConversations((prev) => {
        const next = new Map(prev);
        const current = prev.get(pageKey) ?? { ...DEFAULT_PAGE_STATE };
        next.set(pageKey, {
          ...current,
          messages: [...current.messages, confirmationMessage],
        });
        return next;
      });

      setWorkingDocument(INITIAL_WORKING_DOC);
    },
    [workingDocument],
  );

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
    async (pageKey: string, content: string, requiredTool?: string, currentEmployee?: { id: string; employeeId?: string; firstName: string; lastName: string; department: string; title: string }, outcomeContext?: { outcomeText: string; strategyGoalId: string; strategyGoalTitle: string; contributionRef: string }) => {
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
            ...(requiredTool ? { requiredTool } : {}),
            ...(currentEmployee ? { currentEmployee } : {}),
            ...(outcomeContext ? { outcomeContext } : {}),
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
        workingDocument,
        openWorkingDocument,
        updateWorkingDocumentField,
        updateWorkingDocumentFields,
        closeWorkingDocument,
        submitWorkingDocument,
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
