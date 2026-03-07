"use client";

import { useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import { Textarea } from "@ascenta/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import { cn } from "@ascenta/ui";
import { Send } from "lucide-react";
import type { FieldPromptData } from "./workflow-blocks";

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
  const [selectValue, setSelectValue] = useState("");
  const options = data.options ?? [];
  const hasOptions = options.length > 0;

  const handleSubmit = () => {
    const val = otherValue.trim();
    if (val) onSelect(data.runId, data.fieldKey, val);
  };

  const handleSelectSubmit = (value: string) => {
    if (value) onSelect(data.runId, data.fieldKey, value);
  };

  // Dropdown fields — use Select component
  if (data.fieldType === "dropdown" && hasOptions) {
    return (
      <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5">
        <Label className="text-sm font-medium text-foreground">
          {data.question}
        </Label>
        {data.placeholder && (
          <p className="text-xs text-muted-foreground">{data.placeholder}</p>
        )}
        <div className="flex items-center gap-2">
          <Select
            value={selectValue}
            onValueChange={(v) => {
              setSelectValue(v);
              handleSelectSubmit(v);
            }}
          >
            <SelectTrigger className="flex-1 bg-background">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {data.allowOther && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              placeholder="Or type a custom value..."
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="flex-1 bg-background text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              disabled={!otherValue.trim()}
              onClick={handleSubmit}
              className="shrink-0"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Checkbox group — use button pills
  if (data.fieldType === "checkbox_group" && hasOptions) {
    return (
      <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5">
        <Label className="text-sm font-medium text-foreground">
          {data.question}
        </Label>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              size="sm"
              className="rounded-full text-xs hover:bg-primary/10 hover:border-primary"
              onClick={() => onSelect(data.runId, data.fieldKey, opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Textarea fields
  if (data.fieldType === "textarea") {
    return (
      <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5">
        <Label className="text-sm font-medium text-foreground">
          {data.question}
        </Label>
        {data.placeholder && (
          <p className="text-xs text-muted-foreground">{data.placeholder}</p>
        )}
        <Textarea
          placeholder="Type your response..."
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          rows={3}
          className="bg-background text-sm resize-none"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!otherValue.trim()}
            onClick={handleSubmit}
            className="gap-1.5"
          >
            <Send className="size-3.5" />
            Submit
          </Button>
        </div>
      </div>
    );
  }

  // Date fields
  if (data.fieldType === "date") {
    return (
      <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5">
        <Label className="text-sm font-medium text-foreground">
          {data.question}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            className="flex-1 bg-background text-sm"
          />
          <Button
            size="sm"
            disabled={!otherValue.trim()}
            onClick={handleSubmit}
            className="gap-1.5 shrink-0"
          >
            <Send className="size-3.5" />
            Submit
          </Button>
        </div>
      </div>
    );
  }

  // Default: text input (also handles fields with options + allowOther)
  if (hasOptions && !data.allowOther) {
    // Options displayed as pill buttons (e.g., checkbox-style single select)
    return (
      <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5">
        <Label className="text-sm font-medium text-foreground">
          {data.question}
        </Label>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              size="sm"
              className="rounded-full text-xs hover:bg-primary/10 hover:border-primary"
              onClick={() => onSelect(data.runId, data.fieldKey, opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Text input (default)
  return (
    <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5">
      <Label className="text-sm font-medium text-foreground">
        {data.question}
      </Label>
      {data.placeholder && (
        <p className="text-xs text-muted-foreground">{data.placeholder}</p>
      )}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Type your response..."
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="flex-1 bg-background text-sm"
        />
        <Button
          size="sm"
          variant="ghost"
          disabled={!otherValue.trim()}
          onClick={handleSubmit}
          className="shrink-0"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
