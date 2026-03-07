"use client";

import { Button } from "@ascenta/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ascenta/ui/dropdown-menu";
import { ChevronDown, Wrench } from "lucide-react";
import { cn } from "@ascenta/ui";
import type { PageTool } from "@/lib/constants/dashboard-nav";

interface ToolSelectorProps {
  tools?: PageTool[];
  value: string | null;
  onChange: (tool: string | null) => void;
  disabled?: boolean;
}

export function ToolSelector({ tools, value, onChange, disabled }: ToolSelectorProps) {
  const hasTools = tools && tools.length > 0;
  const selectedTool = hasTools ? tools.find((t) => t.key === value) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || !hasTools}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium hover:text-deep-blue hover:bg-glacier",
            !hasTools && "opacity-40 cursor-not-allowed",
            selectedTool
              ? "text-deep-blue bg-glacier/60"
              : "text-muted-foreground",
          )}
        >
          {selectedTool ? (
            <selectedTool.icon className="size-3.5 text-summit" />
          ) : (
            <Wrench className="size-3.5" />
          )}
          <span className="max-w-[100px] truncate">
            {selectedTool ? selectedTool.label : hasTools ? "Tools" : "No tools"}
          </span>
          {hasTools && <ChevronDown className="size-3 opacity-60" />}
        </Button>
      </DropdownMenuTrigger>
      {hasTools && (
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Page Tools
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {tools.map((tool) => (
              <DropdownMenuItem
                key={tool.key}
                onClick={() => onChange(value === tool.key ? null : tool.key)}
                className={cn(
                  "cursor-pointer gap-2",
                  value === tool.key && "bg-accent",
                )}
              >
                <tool.icon className="size-4 text-summit" />
                <span className="font-medium">{tool.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          {value && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onChange(null)}
                className="cursor-pointer text-muted-foreground"
              >
                Clear selection
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
