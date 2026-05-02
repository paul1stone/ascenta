"use client";

import { cn } from "@ascenta/ui";
import { MOCK_CONVERSATION_MAP, type ConversationDimension } from "./mock-data";

const ALIGNMENT_COLORS: Record<ConversationDimension["alignment"], string> = {
  aligned: "#44aa99",
  partial: "#e8a735",
  diverged: "#cc6677",
};

const ALIGNMENT_LABELS: Record<ConversationDimension["alignment"], string> = {
  aligned: "Aligned",
  partial: "Partial",
  diverged: "Divergent",
};

type ConversationMapProps = {
  myLabel?: string;
  partnerLabel?: string;
  dimensions?: ConversationDimension[];
};

export function ConversationMap({
  myLabel = "You",
  partnerLabel = "Partner",
  dimensions = MOCK_CONVERSATION_MAP,
}: ConversationMapProps) {
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <header className="px-5 py-3 border-b border-border bg-muted/30">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Conversation Map
        </h3>
        <p className="text-xs text-muted-foreground">
          Shared opening artifact — both parties view this together before
          either speaks. Private prompts are never shown here.
        </p>
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-0 text-xs">
        <div className="px-5 py-2 text-muted-foreground font-medium">
          {myLabel}
        </div>
        <div className="px-5 py-2 text-muted-foreground font-medium text-center">
          Alignment
        </div>
        <div className="px-5 py-2 text-muted-foreground font-medium text-right">
          {partnerLabel}
        </div>

        {dimensions.map((dim) => (
          <div
            key={dim.key}
            className="contents"
          >
            <div className="border-t border-border px-5 py-4 bg-muted/10">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                {dim.label}
              </p>
              <p className="text-sm text-foreground">{dim.myWord}</p>
            </div>

            <div className="border-t border-border px-5 py-4 flex items-center justify-center">
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: `${ALIGNMENT_COLORS[dim.alignment]}1a`,
                  color: ALIGNMENT_COLORS[dim.alignment],
                }}
              >
                {ALIGNMENT_LABELS[dim.alignment]}
              </span>
            </div>

            <div
              className={cn(
                "border-t border-border px-5 py-4 text-right bg-muted/10"
              )}
            >
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                {dim.label}
              </p>
              <p className="text-sm text-foreground">{dim.partnerWord}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="px-5 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground italic">
        Map framed as opportunity to reconnect — never blame or evaluation.
      </footer>
    </div>
  );
}
