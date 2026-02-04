"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { parseWorkflowBlocks, type FieldPromptData, type FollowUpData } from "./workflow-blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  onWorkflowOptionSelect?: (runId: string, fieldKey: string, value: string) => void;
  onFollowUpSelect?: (runId: string, type: "email" | "script") => void;
  onFollowUpOther?: (value: string) => void;
}

export function ChatMessage({
  role,
  content,
  isStreaming,
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
          {isStreaming && (
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

function FieldPromptBlock({
  data,
  otherValue,
  onOtherChange,
  onSelect,
}: {
  data: FieldPromptData;
  otherValue: string;
  onOtherChange: (v: string) => void;
  onSelect: (runId: string, fieldKey: string, value: string) => void;
}) {
  const letters = "ABCDEFGH".split("");
  const hasOptions = data.options.length > 0;
  const isTextInput = !hasOptions || ["text", "textarea", "date"].includes(data.fieldType);

  return (
    <div className="mt-4 rounded-xl border border-summit/20 bg-summit/5 p-4">
      <p className="mb-3 font-medium text-deep-blue">{data.question}</p>
      {hasOptions && !isTextInput ? (
        <div className="flex flex-wrap gap-2 items-center">
          {data.options.map((opt, i) => (
            <Button
              key={opt.value}
              variant="outline"
              size="sm"
              className="rounded-lg border-summit/30 hover:bg-summit/10 hover:border-summit"
              onClick={() => onSelect(data.runId, data.fieldKey, opt.value)}
            >
              {letters[i]}. {opt.label}
            </Button>
          ))}
          {data.allowOther && (
            <div className="flex flex-1 min-w-[200px] items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {letters[data.options.length]}. Other:
              </span>
              <Input
                placeholder={data.placeholder ?? "Specify..."}
                value={otherValue}
                onChange={(e) => onOtherChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && otherValue.trim()) {
                    onSelect(data.runId, data.fieldKey, otherValue.trim());
                  }
                }}
                className="flex-1"
              />
              <Button
                size="sm"
                disabled={!otherValue.trim()}
                onClick={() =>
                  otherValue.trim() && onSelect(data.runId, data.fieldKey, otherValue.trim())
                }
                className="bg-summit hover:bg-summit-hover"
              >
                Submit
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.fieldType === "textarea" ? (
            <textarea
              placeholder={data.placeholder ?? "Enter..."}
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              rows={4}
              className="flex-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : (
            <Input
              placeholder={data.placeholder ?? "Enter..."}
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otherValue.trim()) {
                  onSelect(data.runId, data.fieldKey, otherValue.trim());
                }
              }}
              type={data.fieldType === "date" ? "date" : "text"}
              className="flex-1"
            />
          )}
          <Button
            size="sm"
            disabled={!otherValue.trim()}
            onClick={() =>
              otherValue.trim() && onSelect(data.runId, data.fieldKey, otherValue.trim())
            }
            className="bg-summit hover:bg-summit-hover self-start"
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}

function FollowUpBlock({
  data,
  onSelect,
  onOther,
}: {
  data: FollowUpData;
  onSelect: (runId: string, type: "email" | "script") => void;
  onOther?: (value: string) => void;
}) {
  const [showDoc, setShowDoc] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-summit/20 bg-summit/5 p-4">
        <button
          type="button"
          onClick={() => setShowDoc(!showDoc)}
          className="text-sm font-medium text-summit hover:underline"
        >
          {showDoc ? "Hide document" : "View generated document"}
        </button>
        {showDoc && (
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-white p-3 text-xs text-deep-blue whitespace-pre-wrap">
            {data.documentContent}
          </pre>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Would you like help giving {data.employeeName} this news?
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-summit/30 hover:bg-summit/10"
          onClick={() => onSelect(data.runId, "email")}
        >
          A. Format me an email
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-summit/30 hover:bg-summit/10"
          onClick={() => onSelect(data.runId, "script")}
        >
          B. In-person script to avoid legal trouble
        </Button>
        {onOther && (
          <div className="flex flex-1 min-w-[200px] items-center gap-2">
            <span className="text-sm text-muted-foreground">C. Other:</span>
            <Input
              placeholder="Ask something else..."
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otherValue.trim()) {
                  onOther(otherValue.trim());
                  setOtherValue("");
                }
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={!otherValue.trim()}
              onClick={() => {
                if (otherValue.trim()) {
                  onOther(otherValue.trim());
                  setOtherValue("");
                }
              }}
              className="bg-summit hover:bg-summit-hover"
            >
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
