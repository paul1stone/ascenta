"use client";

import { useState, useRef, useEffect } from "react";
import { Separator } from "@ascenta/ui/separator";
import { Button } from "@ascenta/ui/button";
import { SquarePen } from "lucide-react";
import type { PageTool } from "@/lib/constants/dashboard-nav";
import type { ResolvedPersona } from "@/lib/role/role-context";
import { resolvePrompt } from "@/lib/utils/resolve-prompt";

interface SuggestPromptPillsProps {
  tools: PageTool[];
  user: ResolvedPersona | null;
  accentColor: string;
  onPromptSelect: (prompt: string, toolKey: string) => void;
  onDirectOpen: (toolKey: string) => void;
}

export function SuggestPromptPills({
  tools,
  user,
  accentColor,
  onPromptSelect,
  onDirectOpen,
}: SuggestPromptPillsProps) {
  const [openToolKey, setOpenToolKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openToolKey) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenToolKey(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openToolKey]);

  const toolsWithSuggestions = tools.filter(
    (t) => t.promptSuggestions && t.promptSuggestions.length > 0
  );

  if (toolsWithSuggestions.length === 0) return null;

  const openTool = toolsWithSuggestions.find((t) => t.key === openToolKey);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2">
      {/* Pill buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {toolsWithSuggestions.map((tool) => (
          <Button
            key={tool.key}
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-glacier/50"
            style={{
              borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
              color: accentColor,
            }}
            onClick={() =>
              setOpenToolKey(openToolKey === tool.key ? null : tool.key)
            }
          >
            <tool.icon className="size-3.5" />
            {tool.label}
          </Button>
        ))}
      </div>

      {/* Inline dropdown — full width of parent */}
      {openTool && (
        <div className="w-full animate-in fade-in slide-in-from-top-1 rounded-lg border bg-popover p-1 shadow-md">
          <div className="flex flex-col">
            {openTool.promptSuggestions!.map((suggestion) => {
              const resolved = resolvePrompt(suggestion.promptTemplate, user);
              return (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => {
                    onPromptSelect(resolved, openTool.key);
                    setOpenToolKey(null);
                  }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-deep-blue/80 transition-colors hover:bg-glacier/50"
                >
                  {resolved}
                </button>
              );
            })}
            <Separator className="my-1" />
            <button
              type="button"
              onClick={() => {
                onDirectOpen(openTool.key);
                setOpenToolKey(null);
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-glacier/50 hover:text-deep-blue"
            >
              <SquarePen className="size-3" />
              Open form directly
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
