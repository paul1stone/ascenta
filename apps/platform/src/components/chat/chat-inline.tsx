"use client";

import { useChat } from "@/lib/chat/chat-context";
import { ChatMessage } from "./chat-message";
import { ChatPanelConversations } from "./chat-panel-conversations";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@ascenta/ui/button";

export function ChatInline() {
  const {
    messages,
    isLoading,
    messagesEndRef,
    handleSubmit,
    handleWorkflowFieldSelect,
    handleWorkflowFollowUpSelect,
    handleNewChat,
  } = useChat();

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-2">
        <ChatPanelConversations />
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          className="h-8 w-8 text-muted-foreground hover:text-deep-blue"
          title="New Chat"
        >
          <MessageSquarePlus className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
}
