"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import { Pencil, SkipForward } from "lucide-react";
import type { OptionsData } from "./workflow-blocks";

interface OptionSelectorBlockProps {
  data: OptionsData;
  onSelect: (value: string) => void;
  accentColor?: string;
}

export function OptionSelectorBlock({
  data,
  onSelect,
  accentColor,
}: OptionSelectorBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [otherValue, setOtherValue] = useState("");
  const [showOther, setShowOther] = useState(false);
  const dismissed = selected !== null;

  function handleSelect(index: number, value: string) {
    if (dismissed) return;
    setSelected(index);
    onSelect(value);
  }

  function handleOtherSubmit() {
    if (!otherValue.trim() || dismissed) return;
    setSelected(data.options.length);
    onSelect(otherValue.trim());
  }

  return (
    <div className="mt-3 space-y-1.5">
      {data.options.map((option, i) => (
        <button
          key={i}
          type="button"
          disabled={dismissed}
          onClick={() => handleSelect(i, option)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
            dismissed && selected === i
              ? "border-primary/30 bg-primary/5"
              : dismissed
                ? "border-transparent opacity-40"
                : "border-border bg-white hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-sm",
          )}
          style={
            dismissed && selected === i && accentColor
              ? {
                  borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 5%, transparent)`,
                }
              : undefined
          }
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
              dismissed && selected === i
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground",
            )}
            style={
              dismissed && selected === i && accentColor
                ? { backgroundColor: accentColor }
                : undefined
            }
          >
            {i + 1}
          </span>
          <span
            className={cn(
              "font-medium",
              dismissed && selected === i
                ? "text-foreground"
                : "text-foreground/80",
            )}
          >
            {option}
          </span>
        </button>
      ))}

      {/* "Something else" input */}
      {!dismissed && !showOther && (
        <button
          type="button"
          onClick={() => setShowOther(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Pencil className="size-3.5 text-muted-foreground" />
          </span>
          <span className="font-medium">Something else</span>
        </button>
      )}

      {!dismissed && showOther && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Pencil className="size-3.5 text-muted-foreground" />
          </span>
          <input
            autoFocus
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleOtherSubmit();
              if (e.key === "Escape") {
                setShowOther(false);
                setOtherValue("");
              }
            }}
            placeholder="Type your answer..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={handleOtherSubmit}
            disabled={!otherValue.trim()}
            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white transition-colors disabled:opacity-40"
            style={accentColor ? { backgroundColor: accentColor } : undefined}
          >
            Send
          </button>
        </div>
      )}

      {/* Dismissed "other" selection */}
      {dismissed && selected === data.options.length && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white text-xs font-semibold">
            <Pencil className="size-3.5" />
          </span>
          <span className="font-medium text-foreground">{otherValue}</span>
        </div>
      )}

      {/* Skip button */}
      {data.allowSkip && !dismissed && (
        <button
          type="button"
          onClick={() => handleSelect(-1, "Skip")}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <SkipForward className="size-3" />
          Skip
        </button>
      )}
    </div>
  );
}
