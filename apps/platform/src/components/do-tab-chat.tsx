"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { cn } from "@ascenta/ui";
import { useChat } from "@/lib/chat/chat-context";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { WorkingDocument } from "@/components/grow/working-document";
import { parseWorkflowBlocks } from "@/components/chat/workflow-blocks";
import type { PageConfig } from "@/lib/constants/dashboard-nav";

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

  const handleSuggestionClick = useCallback(
    (prompt: string) => {
      setPageInput(pageKey, prompt);
    },
    [pageKey, setPageInput],
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
  if (!hasMessages) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <h2 className="font-display text-2xl font-bold text-deep-blue">
            {pageConfig.title}
          </h2>
          <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
            {pageConfig.description}
          </p>

          <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-3">
            {pageConfig.suggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="rounded-xl border bg-white p-4 text-left transition-colors hover:bg-glacier/50"
                style={{
                  borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                }}
              >
                <span className="text-sm font-medium text-deep-blue">
                  {suggestion.title}
                </span>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {suggestion.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-4 pb-4">
          <div className="mx-auto max-w-2xl">
            <ChatInput
              value={input}
              onChange={(v) => setPageInput(pageKey, v)}
              onSubmit={handleSend}
              onStop={handleStop}
              isLoading={isLoading}
              placeholder={`Ask about ${pageConfig.title.toLowerCase()}...`}
              model={model}
              onModelChange={setModel}
              tools={pageConfig.tools}
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Active state (has messages) ──────────────────────────────────────
  return (
    <div className="flex h-full">
      {/* Left panel: Chat */}
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300",
          workingDocument.isOpen ? "w-1/2" : "w-full",
        )}
      >
        {/* Header bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
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
          <div className="mx-auto max-w-2xl">
            {messages.map((msg, i) => {
              const isLastStreaming = isLoading && i === messages.length - 1 && msg.role === "assistant";
              return (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isLastStreaming}
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
          <div className="mx-auto max-w-2xl">
            <ChatInput
              value={input}
              onChange={(v) => setPageInput(pageKey, v)}
              onSubmit={handleSend}
              onStop={handleStop}
              isLoading={isLoading}
              placeholder={`Ask about ${pageConfig.title.toLowerCase()}...`}
              model={model}
              onModelChange={setModel}
              tools={pageConfig.tools}
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
            />
          </div>
        </div>
      </div>

      {/* Right panel: Working Document */}
      {workingDocument.isOpen && (
        <div className="h-full w-1/2">
          <WorkingDocument pageKey={pageKey} />
        </div>
      )}
    </div>
  );
}
