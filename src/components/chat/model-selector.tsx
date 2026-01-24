"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AI_CONFIG } from "@/lib/ai/config";
import { ChevronDown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

// Get all models in a flat array with provider info
const allModels = [
  ...AI_CONFIG.models.anthropic.map((m) => ({ ...m, provider: "anthropic" as const })),
  ...AI_CONFIG.models.openai.map((m) => ({ ...m, provider: "openai" as const })),
];

// Get display name for current model
function getModelDisplayName(modelId: string): string {
  const model = allModels.find((m) => m.id === modelId);
  return model?.name || modelId;
}

// Get provider icon
function ProviderIcon({ provider }: { provider: "openai" | "anthropic" }) {
  if (provider === "anthropic") {
    return <Sparkles className="size-3.5 text-orange-500" />;
  }
  return <Zap className="size-3.5 text-emerald-500" />;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const currentModel = allModels.find((m) => m.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-deep-blue hover:bg-glacier",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {currentModel && <ProviderIcon provider={currentModel.provider} />}
          <span className="max-w-[100px] truncate">{getModelDisplayName(value)}</span>
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {/* Anthropic Models */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-orange-500" />
            Anthropic
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {AI_CONFIG.models.anthropic.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onChange(model.id)}
              className={cn(
                "cursor-pointer",
                value === model.id && "bg-accent"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* OpenAI Models */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-emerald-500" />
            OpenAI
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {AI_CONFIG.models.openai.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onChange(model.id)}
              className={cn(
                "cursor-pointer",
                value === model.id && "bg-accent"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
