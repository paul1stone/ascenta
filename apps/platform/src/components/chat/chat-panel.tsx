"use client";

import { useChatPanel } from "@/lib/chat/chat-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@ascenta/ui";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatWelcome } from "./chat-welcome";
import { ChatPanelConversations } from "./chat-panel-conversations";
import { Mountain, X, MessageSquarePlus } from "lucide-react";
import { Button } from "@ascenta/ui/button";

export function ChatPanel() {
  const {
    messages,
    input,
    isLoading,
    isPanelOpen,
    model,
    messagesEndRef,
    setInput,
    setModel,
    handleSubmit,
    handleWorkflowFieldSelect,
    handleWorkflowFollowUpSelect,
    handleStop,
    handleNewChat,
    closePanel,
  } = useChatPanel();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex flex-col border-l border-border bg-glacier shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        isPanelOpen ? "translate-x-0" : "translate-x-full",
        isMobile ? "w-full" : "w-[50vw]"
      )}
    >
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-deep-blue to-deep-blue/80 text-white">
            <Mountain className="size-3.5" />
          </div>
          <span className="font-display text-sm font-bold text-deep-blue">Ascenta</span>
        </div>

        <ChatPanelConversations />

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            handleNewChat();
          }}
          className="h-8 w-8 text-muted-foreground hover:text-deep-blue"
          title="New Chat"
        >
          <MessageSquarePlus className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={closePanel}
          className="h-8 w-8 text-muted-foreground hover:text-deep-blue"
        >
          <X className="size-4" />
        </Button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatWelcome onSuggestionClick={(suggestion) => setInput(suggestion)} />
        ) : (
          <div className="mx-auto max-w-3xl px-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                isStreaming={
                  isLoading && index === messages.length - 1 && message.role === "assistant"
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
  );
}
