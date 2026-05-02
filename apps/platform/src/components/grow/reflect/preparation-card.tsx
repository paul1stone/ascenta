"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import { Lock, CheckCircle2 } from "lucide-react";

export type PreparationPrompt = {
  id: string;
  label: string;
  prompt: string;
  helper?: string;
  isPrivate?: boolean;
  paired?: string;
};

type PreparationCardProps = {
  prompt: PreparationPrompt;
  index: number;
  initialValue?: string;
  locked?: boolean;
};

export function PreparationCard({
  prompt,
  index,
  initialValue = "",
  locked = false,
}: PreparationCardProps) {
  const [value, setValue] = useState(initialValue);
  const [submitted, setSubmitted] = useState(Boolean(initialValue));

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-5 space-y-3",
        prompt.isPrivate && "border-l-4 border-l-[#aa8866]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              {prompt.label}
            </p>
            {prompt.paired && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Paired with: {prompt.paired}
              </p>
            )}
          </div>
        </div>

        {prompt.isPrivate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#aa8866]/15 px-2 py-0.5 text-[10px] font-medium text-[#aa8866]">
            <Lock className="size-2.5" /> Private
          </span>
        ) : null}
      </div>

      <p className="text-sm text-foreground leading-relaxed pl-10">
        {prompt.prompt}
      </p>

      {prompt.helper && (
        <p className="text-xs text-muted-foreground italic pl-10">
          {prompt.helper}
        </p>
      )}

      <div className="pl-10 space-y-2">
        {locked || submitted ? (
          <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm text-foreground italic flex items-start gap-2">
            <CheckCircle2 className="size-4 mt-0.5 text-[#44aa99] shrink-0" />
            <span>{value || "Your reflection is locked in."}</span>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Take your time — there are no wrong answers."
            className="min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6688bb]/30"
          />
        )}
        {!submitted && !locked && (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!value.trim()}
            className="text-xs font-medium text-[#6688bb] disabled:text-muted-foreground/50"
          >
            Save reflection
          </button>
        )}
      </div>
    </div>
  );
}
