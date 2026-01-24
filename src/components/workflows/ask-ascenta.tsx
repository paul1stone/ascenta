"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  FileText,
  Search,
  Target,
  Loader2,
  Check,
  ChevronRight,
  HeartHandshake,
  Scale,
  Gavel,
  ClipboardList,
} from "lucide-react";
import type {
  GuidedActionDefinition,
  WorkflowInputs,
} from "@/lib/workflows/types";

interface AskAscentaProps {
  actions: GuidedActionDefinition[];
  inputs: WorkflowInputs;
  onActionSelect: (action: GuidedActionDefinition) => void;
  executingActionId?: string;
  completedActionIds?: string[];
}

// Icon mapping for guided actions
const actionIcons: Record<string, React.ReactNode> = {
  FileText: <FileText className="size-4" />,
  Search: <Search className="size-4" />,
  Target: <Target className="size-4" />,
  HeartHandshake: <HeartHandshake className="size-4" />,
  Scale: <Scale className="size-4" />,
  Gavel: <Gavel className="size-4" />,
  ClipboardList: <ClipboardList className="size-4" />,
};

export function AskAscenta({
  actions,
  inputs,
  onActionSelect,
  executingActionId,
  completedActionIds = [],
}: AskAscentaProps) {
  // Check which actions have their required inputs filled
  const isActionEnabled = (action: GuidedActionDefinition): boolean => {
    if (!action.requiredInputs || action.requiredInputs.length === 0) {
      return true;
    }

    return action.requiredInputs.every((inputKey) => {
      const value = inputs[inputKey];
      return value !== undefined && value !== null && value !== "";
    });
  };

  // Get missing inputs for an action
  const getMissingInputs = (action: GuidedActionDefinition): string[] => {
    if (!action.requiredInputs) return [];

    return action.requiredInputs.filter((inputKey) => {
      const value = inputs[inputKey];
      return value === undefined || value === null || value === "";
    });
  };

  const activeActions = actions.filter((a) => a.isActive);

  if (activeActions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-summit" />
          Ask Ascenta
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select an action to have Ascenta assist you
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeActions
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((action) => {
              const enabled = isActionEnabled(action);
              const missingInputs = getMissingInputs(action);
              const isExecuting = executingActionId === action.id;
              const isCompleted = completedActionIds.includes(action.id);

              return (
                <ActionButton
                  key={action.id}
                  action={action}
                  enabled={enabled}
                  missingInputs={missingInputs}
                  isExecuting={isExecuting}
                  isCompleted={isCompleted}
                  onClick={() => enabled && onActionSelect(action)}
                />
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionButtonProps {
  action: GuidedActionDefinition;
  enabled: boolean;
  missingInputs: string[];
  isExecuting: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function ActionButton({
  action,
  enabled,
  missingInputs,
  isExecuting,
  isCompleted,
  onClick,
}: ActionButtonProps) {
  const icon = action.icon ? actionIcons[action.icon] : <Sparkles className="size-4" />;

  return (
    <button
      onClick={onClick}
      disabled={!enabled || isExecuting}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
        enabled && !isExecuting && !isCompleted
          ? "border-border hover:border-summit/50 hover:bg-summit/5 cursor-pointer"
          : "",
        isCompleted && "border-green-300 bg-green-50",
        !enabled && "opacity-50 cursor-not-allowed bg-muted/30"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 rounded-md p-1.5",
          isCompleted
            ? "bg-green-100 text-green-600"
            : enabled
              ? "bg-summit/10 text-summit"
              : "bg-muted text-muted-foreground"
        )}
      >
        {isExecuting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isCompleted ? (
          <Check className="size-4" />
        ) : (
          icon
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "font-medium text-sm",
              isCompleted ? "text-green-800" : "text-deep-blue"
            )}
          >
            {action.label}
          </p>
          {enabled && !isExecuting && !isCompleted && (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </div>

        {action.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {action.description}
          </p>
        )}

        {/* Missing inputs warning */}
        {!enabled && missingInputs.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Requires: {missingInputs.join(", ")}
          </p>
        )}

        {/* Executing state */}
        {isExecuting && (
          <p className="text-xs text-summit mt-1">
            Generating response...
          </p>
        )}

        {/* Completed state */}
        {isCompleted && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Completed - content generated
          </p>
        )}
      </div>
    </button>
  );
}

/**
 * Compact inline version for sidebar or embedded use
 */
export function AskAscentaCompact({
  actions,
  inputs,
  onActionSelect,
}: Omit<AskAscentaProps, "executingActionId" | "completedActionIds">) {
  const [isOpen, setIsOpen] = useState(false);

  const isActionEnabled = (action: GuidedActionDefinition): boolean => {
    if (!action.requiredInputs || action.requiredInputs.length === 0) {
      return true;
    }
    return action.requiredInputs.every((inputKey) => {
      const value = inputs[inputKey];
      return value !== undefined && value !== null && value !== "";
    });
  };

  const enabledActions = actions.filter((a) => a.isActive && isActionEnabled(a));

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sparkles className="size-4 text-summit" />
        Ask Ascenta
        {enabledActions.length > 0 && (
          <span className="bg-summit text-white text-xs rounded-full px-1.5 py-0.5">
            {enabledActions.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg border shadow-lg z-50">
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm text-deep-blue">
              What would you like help with?
            </h4>
          </div>
          <ScrollArea className="max-h-64">
            <div className="p-2 space-y-1">
              {actions
                .filter((a) => a.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((action) => {
                  const enabled = isActionEnabled(action);
                  const icon = action.icon
                    ? actionIcons[action.icon]
                    : <Sparkles className="size-4" />;

                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (enabled) {
                          onActionSelect(action);
                          setIsOpen(false);
                        }
                      }}
                      disabled={!enabled}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-md text-left text-sm",
                        enabled
                          ? "hover:bg-summit/10 text-deep-blue cursor-pointer"
                          : "opacity-50 cursor-not-allowed text-muted-foreground"
                      )}
                    >
                      <span className="text-summit">{icon}</span>
                      {action.label}
                    </button>
                  );
                })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
