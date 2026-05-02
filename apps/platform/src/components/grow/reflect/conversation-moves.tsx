"use client";

import { cn } from "@ascenta/ui";
import { Check } from "lucide-react";

export type ConversationMove = {
  id: string;
  title: string;
  description: string;
  whoLeads: "shared" | "employee" | "manager";
};

const WHO_LEADS_LABELS: Record<ConversationMove["whoLeads"], string> = {
  shared: "Both",
  employee: "Employee leads",
  manager: "Manager leads",
};

const WHO_LEADS_COLORS: Record<ConversationMove["whoLeads"], string> = {
  shared: "#6688bb",
  employee: "#44aa99",
  manager: "#aa8866",
};

export const REFLECT_CONVERSATION_MOVES: ConversationMove[] = [
  {
    id: "move-1",
    title: "Open with the Conversation Map",
    description:
      "Both view the map together before either speaks — prevents agenda control by either party.",
    whoLeads: "shared",
  },
  {
    id: "move-2",
    title: "Name What Is Working",
    description:
      "Acknowledge strengths first; recognition is specific and genuine before addressing what needs attention.",
    whoLeads: "shared",
  },
  {
    id: "move-3",
    title: "Employee Delivers Upward Feedback",
    description:
      "Employee perspective on manager effectiveness comes first — structure prevents employee calibration to manager mood.",
    whoLeads: "employee",
  },
  {
    id: "move-4",
    title: "Manager Delivers Feedback to Employee",
    description:
      "Manager uses SBI framework (Situation, Behavior, Impact). Library reminders prevent character judgment.",
    whoLeads: "manager",
  },
  {
    id: "move-5",
    title: "Exchange Requests",
    description:
      "Both share what they need the other to do differently — invitations with reasons, not demands.",
    whoLeads: "shared",
  },
  {
    id: "move-6",
    title: "Mutual Commitment",
    description:
      "Both name one concrete change before conversation ends. Commitments are observable, logged, and seeded into future Check-ins.",
    whoLeads: "shared",
  },
];

type ConversationMovesProps = {
  currentMove?: number;
  completed?: number[];
};

export function ConversationMoves({
  currentMove = 0,
  completed = [],
}: ConversationMovesProps) {
  return (
    <ol className="space-y-3">
      {REFLECT_CONVERSATION_MOVES.map((move, idx) => {
        const isDone = completed.includes(idx);
        const isCurrent = idx === currentMove;
        return (
          <li
            key={move.id}
            className={cn(
              "rounded-lg border p-4 flex gap-4 transition-colors",
              isCurrent && "border-[#6688bb] bg-[#6688bb]/5",
              !isCurrent && !isDone && "border-border bg-background",
              isDone && "border-border bg-muted/30 opacity-70"
            )}
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                isCurrent && "bg-[#6688bb] text-white",
                !isCurrent && !isDone && "bg-muted text-muted-foreground",
                isDone && "bg-[#44aa99] text-white"
              )}
            >
              {isDone ? <Check className="size-4" /> : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-display text-sm font-semibold text-foreground">
                  {move.title}
                </h4>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${WHO_LEADS_COLORS[move.whoLeads]}1a`,
                    color: WHO_LEADS_COLORS[move.whoLeads],
                  }}
                >
                  {WHO_LEADS_LABELS[move.whoLeads]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {move.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
