"use client";

import { ChatProvider, useChat } from "@/lib/chat/chat-context";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { ChatInline } from "@/components/chat/chat-inline";
import { ChatInput } from "@/components/chat/chat-input";

interface DoTabProps {
  selectedCategory: string | null;
  onCategorySelect: (key: string) => void;
}

function DoTabInner({ selectedCategory, onCategorySelect }: DoTabProps) {
  const {
    messages,
    input,
    isLoading,
    model,
    setInput,
    setModel,
    handleSubmit,
    handleStop,
  } = useChat();

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {hasMessages ? (
          <ChatInline />
        ) : (
          <ChatWelcome
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
          />
        )}
      </div>

      {/* Input always visible at bottom */}
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

export function DoTab({ selectedCategory, onCategorySelect }: DoTabProps) {
  return (
    <ChatProvider>
      <DoTabInner
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />
    </ChatProvider>
  );
}
