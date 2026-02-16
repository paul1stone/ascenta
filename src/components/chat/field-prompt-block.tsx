"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FieldPromptData } from "./workflow-blocks";

const OPTION_LABELS = "ABCDEFGH".split("");

interface FieldPromptBlockProps {
  data: FieldPromptData;
  otherValue: string;
  onOtherChange: (v: string) => void;
  onSelect: (runId: string, fieldKey: string, value: string) => void;
}

export function FieldPromptBlock({
  data,
  otherValue,
  onOtherChange,
  onSelect,
}: FieldPromptBlockProps) {
  const letters = OPTION_LABELS;
  const options = data.options ?? [];
  const hasOptions = options.length > 0;
  const isTextInput = !hasOptions || ["text", "textarea", "date"].includes(data.fieldType);

  return (
    <div className="mt-4 rounded-xl border border-summit/20 bg-summit/5 p-4">
      <p className="mb-3 font-medium text-deep-blue">{data.question}</p>
      {hasOptions && !isTextInput ? (
        <div className="flex flex-wrap gap-2 items-center">
          {options.map((opt, i) => (
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
                {letters[options.length]}. Other:
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
