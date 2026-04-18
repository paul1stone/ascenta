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
  accentColor?: string;
  /** Hex color for the bot avatar — defaults to summit orange */
  botColor?: string;
  variant?: "card" | "flat";
  onWorkflowOptionSelect?: (runId: string, fieldKey: string, value: string) => void;
  onFollowUpSelect?: (runId: string, type: "email" | "script") => void;
  onFollowUpOther?: (value: string) => void;
}

export function ChatMessage({
  role,
  content,
  isStreaming,
  activeTool,
  accentColor,
  botColor,
  onWorkflowOptionSelect,
  onFollowUpSelect,
  onFollowUpOther,
  variant = "card",
}: ChatMessageProps) {
  const isUser = role === "user";
  const [otherInputValue, setOtherInputValue] = useState<Record<string, string>>({});

  const parsed = !isUser && content ? parseWorkflowBlocks(content) : null;
  // Strip any ASCENTA blocks that survived parsing (malformed JSON, streaming artifacts)
  let displayContent = parsed?.text ?? content;
  if (!isUser) {
    displayContent = displayContent
      .replace(/\[ASCENTA_\w+\][\s\S]*?\[\/ASCENTA_\w+\]/g, "") // strip complete blocks
      .replace(/\[ASCENTA_\w+\][\s\S]*$/, "") // strip from any unclosed block tag to end
      .trim();
  }

  return (
    <div className="px-4 md:px-6 py-2">
      <div
        className={cn(
          "px-4 py-4 transition-colors",
          variant === "card" && "rounded-2xl border",
          variant === "card" && isUser && "border-primary/15 bg-primary/[0.03]",
          variant === "card" && !isUser && "bg-white/80",
        )}
        style={
          variant === "card" && !isUser && accentColor
            ? { borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)` }
            : undefined
        }
      >
        <div className="flex gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
            style={{
              background: isUser
                ? "var(--primary)"
                : botColor ?? "#ff6b35",
            }}
          >
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>

          <div className="flex-1 space-y-2 overflow-hidden pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-deep-blue">
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
                <div className="text-sm text-deep-blue/90 leading-relaxed whitespace-pre-wrap">
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
      </div>
    </div>
  );
}
