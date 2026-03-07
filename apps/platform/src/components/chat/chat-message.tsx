"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import type { LucideIcon } from "lucide-react";
import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { parseWorkflowBlocks } from "./workflow-blocks";
import { FieldPromptBlock } from "./field-prompt-block";
import { FollowUpBlock } from "./follow-up-block";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  activeTool?: { label: string; icon: LucideIcon } | null;
  onWorkflowOptionSelect?: (runId: string, fieldKey: string, value: string) => void;
  onFollowUpSelect?: (runId: string, type: "email" | "script") => void;
  onFollowUpOther?: (value: string) => void;
}

export function ChatMessage({
  role,
  content,
  isStreaming,
  activeTool,
  onWorkflowOptionSelect,
  onFollowUpSelect,
  onFollowUpOther,
}: ChatMessageProps) {
  const isUser = role === "user";
  const [otherInputValue, setOtherInputValue] = useState<Record<string, string>>({});

  const parsed = !isUser && content ? parseWorkflowBlocks(content) : null;
  const displayContent = parsed?.text ?? content;

  return (
    <div
      className={cn(
        "group flex gap-4 py-6 px-4 md:px-6",
        isUser ? "bg-transparent" : "bg-white/50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          isUser
            ? "bg-deep-blue text-white"
            : "bg-gradient-to-br from-summit to-summit-hover text-white"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-deep-blue">
            {isUser ? "You" : "Ascenta"}
          </span>
          {isStreaming && activeTool && (
            <span className="flex items-center gap-1 rounded-full bg-summit/10 px-2 py-0.5 text-xs font-medium text-summit">
              <activeTool.icon className="size-3" />
              {activeTool.label}
            </span>
          )}
          {isStreaming && !activeTool && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-summit" />
              Thinking...
            </span>
          )}
        </div>

        <div className="max-w-none space-y-4">
          {isUser ? (
            <div className="text-deep-blue/90 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <>
              {displayContent ? (
                <MarkdownRenderer content={displayContent} />
              ) : isStreaming ? (
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-summit/60 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-summit/60 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-summit/60" />
                </span>
              ) : null}

              {parsed?.fieldPrompt && onWorkflowOptionSelect && !isStreaming && (
                <FieldPromptBlock
                  data={parsed.fieldPrompt}
                  otherValue={otherInputValue[parsed.fieldPrompt.fieldKey] ?? ""}
                  onOtherChange={(v) =>
                    setOtherInputValue((prev) => ({ ...prev, [parsed.fieldPrompt!.fieldKey]: v }))
                  }
                  onSelect={onWorkflowOptionSelect}
                />
              )}

              {parsed?.followUp && onFollowUpSelect && !isStreaming && (
                <FollowUpBlock
                  data={parsed.followUp}
                  onSelect={onFollowUpSelect}
                  onOther={onFollowUpOther}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
