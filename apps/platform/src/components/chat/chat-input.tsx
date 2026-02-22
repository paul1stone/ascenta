"use client";

import { Button } from "@ascenta/ui/button";
import { cn } from "@ascenta/ui";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { useRef, useEffect } from "react";
import { ModelSelector } from "./model-selector";

const MAX_TEXTAREA_HEIGHT = 200;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  model: string;
  onModelChange: (model: string) => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading,
  placeholder = "Ask Ascenta anything about HR...",
  model,
  onModelChange,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative flex flex-col rounded-2xl border border-border bg-white shadow-lg shadow-deep-blue/5 transition-shadow focus-within:shadow-xl focus-within:shadow-deep-blue/10 focus-within:border-deep-blue/20">
        {/* Main input row */}
        <div className="flex items-end gap-2 p-2">
          {/* Attach button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-deep-blue hover:bg-glacier"
            type="button"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent py-2.5 text-deep-blue placeholder:text-muted-foreground focus:outline-none",
              "min-h-[44px] max-h-[200px]"
            )}
          />

          {/* Submit/Stop button */}
          {isLoading ? (
            <Button
              onClick={onStop}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl bg-red-500 hover:bg-red-600"
              type="button"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={!value.trim()}
              size="icon"
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl transition-all",
                value.trim()
                  ? "bg-summit hover:bg-summit-hover"
                  : "bg-muted text-muted-foreground"
              )}
              type="button"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Bottom bar with model selector */}
        <div className="flex items-center justify-between border-t border-border/50 px-2 py-1.5">
          <ModelSelector
            value={model}
            onChange={onModelChange}
            disabled={isLoading}
          />
          <span className="text-[10px] text-muted-foreground/60">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        Ascenta may make mistakes. Verify important HR decisions with your team.
      </p>
    </div>
  );
}
