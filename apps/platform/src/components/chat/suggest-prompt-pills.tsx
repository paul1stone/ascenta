"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@ascenta/ui/popover";
import { Separator } from "@ascenta/ui/separator";
import { Button } from "@ascenta/ui/button";
import { SquarePen } from "lucide-react";
import type { PageTool } from "@/lib/constants/dashboard-nav";
import type { MockUser } from "@/lib/constants/mock-user";
import { resolvePrompt } from "@/lib/utils/resolve-prompt";

interface SuggestPromptPillsProps {
  tools: PageTool[];
  user: MockUser;
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

  const toolsWithSuggestions = tools.filter(
    (t) => t.promptSuggestions && t.promptSuggestions.length > 0
  );

  if (toolsWithSuggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {toolsWithSuggestions.map((tool) => (
        <Popover
          key={tool.key}
          open={openToolKey === tool.key}
          onOpenChange={(open: boolean) => setOpenToolKey(open ? tool.key : null)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-glacier/50"
              style={{
                borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
                color: accentColor,
              }}
            >
              <tool.icon className="size-3.5" />
              {tool.label}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-1"
            align="center"
            sideOffset={8}
          >
            <div className="flex flex-col">
              {tool.promptSuggestions!.map((suggestion) => {
                const resolved = resolvePrompt(suggestion.promptTemplate, user);
                return (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => {
                      onPromptSelect(resolved, tool.key);
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
                  onDirectOpen(tool.key);
                  setOpenToolKey(null);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-glacier/50 hover:text-deep-blue"
              >
                <SquarePen className="size-3" />
                Open form directly
              </button>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
