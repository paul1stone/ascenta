"use client";

import { cn } from "@ascenta/ui";

type LikertScaleProps = {
  value: number | null;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
  disabled?: boolean;
};

export function LikertScale({
  value,
  onChange,
  lowLabel,
  highLabel,
  disabled = false,
}: LikertScaleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16">{lowLabel}</span>
      <div className="flex gap-1.5 flex-1 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors",
              value === n
                ? n <= 2
                  ? "bg-[#cc6677]/20 border border-[#cc6677] text-[#cc6677]"
                  : "bg-[#44aa99]/20 border border-[#44aa99] text-[#44aa99]"
                : "bg-muted/50 border border-border text-muted-foreground hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground w-16 text-right">
        {highLabel}
      </span>
    </div>
  );
}
