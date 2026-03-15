"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { cn } from "@ascenta/ui";
import { useChat } from "@/lib/chat/chat-context";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { SuggestPromptPills } from "@/components/chat/suggest-prompt-pills";
import { WorkingDocument } from "@/components/grow/working-document";
import { parseWorkflowBlocks } from "@/components/chat/workflow-blocks";
import type { PageConfig } from "@/lib/constants/dashboard-nav";
import type { WorkflowType } from "@/lib/chat/chat-context";
import { MOCK_USER } from "@/lib/constants/mock-user";
import { getGreeting } from "@/lib/utils/greeting";

const TOOL_KEY_TO_WORKFLOW: Record<string, WorkflowType> = {
  startGoalCreation: "create-goal",
  startCheckIn: "run-check-in",
  startPerformanceNote: "add-performance-note",
};

interface DoTabChatProps {
  pageKey: string;
  pageConfig: PageConfig;
  accentColor: string;
}

export function DoTabChat({ pageKey, pageConfig, accentColor }: DoTabChatProps) {
  const {
    getPageState,
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
    updateWorkingDocumentFields,
  } = useChat();

  const pageState = getPageState(pageKey);
  const { messages, isLoading, input } = pageState;
  const hasMessages = messages.length > 0;

  // Tool selection state
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  // Track the tool that was used for the current streaming response
  const [activeToolForStream, setActiveToolForStream] = useState<string | null>(null);

  // Track which working doc blocks we've already processed to avoid re-triggering
  const processedWorkingDocRef = useRef<Set<string>>(new Set());

  // Keep the chat context aware of which page is active
  useEffect(() => {
    setActivePageKey(pageKey);
  }, [pageKey, setActivePageKey]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasMessages, messagesEndRef]);

  // Detect working document blocks in assistant messages and trigger panel
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant" || isLoading) return;

    // Skip if we already processed this message
    if (processedWorkingDocRef.current.has(lastMsg.id)) return;

    const parsed = parseWorkflowBlocks(lastMsg.content);
    if (!parsed.workingDoc) return;

    processedWorkingDocRef.current.add(lastMsg.id);
    const wd = parsed.workingDoc;

    if (wd.action === "open_working_document" && wd.workflowType) {
      openWorkingDocument(
        wd.workflowType,
        wd.runId,
        wd.employeeId ?? "",
        wd.employeeName ?? "",
        wd.prefilled ?? {},
        wd.availableGoals,
      );
    } else if (wd.action === "update_working_document" && wd.updates) {
      updateWorkingDocumentFields(wd.updates);
    }
  }, [messages, isLoading, openWorkingDocument, updateWorkingDocumentFields]);

  const handleSend = useCallback(() => {
    if (input.trim()) {
      sendMessage(pageKey, input, selectedTool ?? undefined);
      if (selectedTool) {
        setActiveToolForStream(selectedTool);
        setSelectedTool(null);
      }
    }
  }, [pageKey, input, sendMessage, selectedTool]);

  // Clear the active tool badge when streaming ends
  useEffect(() => {
    if (!isLoading && activeToolForStream) {
      setActiveToolForStream(null);
    }
  }, [isLoading, activeToolForStream]);

  const handlePromptSelect = useCallback(
    (prompt: string, toolKey: string) => {
      setPageInput(pageKey, prompt);
      setSelectedTool(toolKey);
    },
    [pageKey, setPageInput, setSelectedTool],
  );

  const handleDirectOpen = useCallback(
    (toolKey: string) => {
      const workflowType = TOOL_KEY_TO_WORKFLOW[toolKey];
      if (workflowType) {
        openWorkingDocument(workflowType, "", "", "", {});
      }
    },
    [openWorkingDocument],
  );

  const handleNewConversation = useCallback(() => {
    resetConversation(pageKey);
  }, [pageKey, resetConversation]);

  const handleStop = useCallback(() => {
    stopGeneration(pageKey);
  }, [pageKey, stopGeneration]);

  const onFieldSelect = useCallback(
    (runId: string, fieldKey: string, value: string) => {
      handleWorkflowFieldSelect(pageKey, runId, fieldKey, value);
    },
    [pageKey, handleWorkflowFieldSelect],
  );

  const onFollowUpSelect = useCallback(
    (runId: string, type: "email" | "script") => {
      handleWorkflowFollowUpSelect(pageKey, runId, type);
    },
    [pageKey, handleWorkflowFollowUpSelect],
  );

  const onFollowUpOther = useCallback(
    (value: string) => {
      sendMessage(pageKey, value);
    },
    [pageKey, sendMessage],
  );

  // Resolve active tool metadata for the streaming badge
  const activeToolMeta = activeToolForStream && pageConfig.tools
    ? pageConfig.tools.find((t) => t.key === activeToolForStream) ?? null
    : null;

  // ── Empty state ──────────────────────────────────────────────────────
  if (!hasMessages && !workingDocument.isOpen) {
    const hasTools = pageConfig.tools && pageConfig.tools.length > 0;

    return (
      <div className="flex h-full flex-col items-center justify-center px-6">
        {/* Title & greeting */}
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {pageConfig.title}
        </p>
        {hasTools && (
          <h1 className="font-display mt-1 text-2xl font-bold text-deep-blue">
            {getGreeting(MOCK_USER.name)}
          </h1>
        )}

        {/* Chat input card + tool pills share same width */}
        <div className="mt-6 w-full max-w-2xl">
          <ChatInput
            value={input}
            onChange={(v) => setPageInput(pageKey, v)}
            onSubmit={handleSend}
            onStop={handleStop}
            isLoading={isLoading}
            placeholder={`Ask about ${pageConfig.title.toLowerCase()}...`}
            model={model}
            onModelChange={setModel}
          />

          {hasTools && pageConfig.tools && (
            <div className="mt-4">
              <SuggestPromptPills
                tools={pageConfig.tools}
                user={MOCK_USER}
                accentColor={accentColor}
                onPromptSelect={handlePromptSelect}
                onDirectOpen={handleDirectOpen}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Active state (has messages) ──────────────────────────────────────
  const docOpen = workingDocument.isOpen;

  return (
    <div className="flex h-full">
      {/* Chat panel */}
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300",
          docOpen ? "w-1/2" : "w-full",
        )}
      >
        {/* Header bar */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-4 py-3"
          style={{ borderColor: `color-mix(in srgb, ${accentColor} 20%, var(--border))` }}
        >
          <h3 className="font-display text-sm font-semibold text-deep-blue">
            {pageConfig.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewConversation}
            className="gap-1.5 text-xs text-muted-foreground hover:text-deep-blue"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New conversation
          </Button>
        </div>

        {/* Scrollable messages */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn("mx-auto py-2", docOpen ? "max-w-xl" : "max-w-2xl")}>
            {messages.map((msg, i) => {
              const isLastStreaming = isLoading && i === messages.length - 1 && msg.role === "assistant";
              return (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  variant={msg.role === "user" ? "card" : "flat"}
                  isStreaming={isLastStreaming}
                  accentColor={accentColor}
                  botColor={accentColor}
                  activeTool={isLastStreaming && activeToolMeta ? { label: activeToolMeta.label, icon: activeToolMeta.icon } : null}
                  onWorkflowOptionSelect={onFieldSelect}
                  onFollowUpSelect={onFollowUpSelect}
                  onFollowUpOther={onFollowUpOther}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Pinned input */}
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className={cn("mx-auto", docOpen ? "max-w-xl" : "max-w-2xl")}>
            <ChatInput
              value={input}
              onChange={(v) => setPageInput(pageKey, v)}
              onSubmit={handleSend}
              onStop={handleStop}
              isLoading={isLoading}
              placeholder={`Ask about ${pageConfig.title.toLowerCase()}...`}
              model={model}
              onModelChange={setModel}
              />
          </div>
        </div>
      </div>

      {/* Working Document panel — shares space evenly */}
      {docOpen && (
        <div className="h-full w-1/2 p-3">
          <WorkingDocument pageKey={pageKey} accentColor={accentColor} />
        </div>
      )}
    </div>
  );
}
