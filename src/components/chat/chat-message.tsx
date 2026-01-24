"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

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
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-summit" />
              Thinking...
            </span>
          )}
        </div>

        <div className="max-w-none">
          {isUser ? (
            // User messages: plain text
            <div className="text-deep-blue/90 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            // Assistant messages: render as markdown
            <>
              {content ? (
                <MarkdownRenderer content={content} />
              ) : isStreaming ? (
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-summit/60 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-summit/60 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-summit/60" />
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
