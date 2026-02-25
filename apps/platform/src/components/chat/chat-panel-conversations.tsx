"use client";

import { useChatPanel } from "@/lib/chat/chat-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ascenta/ui/dropdown-menu";
import { Button } from "@ascenta/ui/button";
import { ChevronDown, MessagesSquare, MessageSquarePlus } from "lucide-react";

export function ChatPanelConversations() {
  const { conversations, conversationId, loadConversation, handleNewChat } = useChatPanel();

  const currentTitle =
    conversations.find((c) => c.id === conversationId)?.title ?? "New Chat";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-deep-blue"
        >
          <MessagesSquare className="size-3.5" />
          <span className="max-w-[180px] truncate">{currentTitle}</span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem onClick={handleNewChat} className="cursor-pointer gap-2">
          <MessageSquarePlus className="size-4" />
          <span className="font-medium">New Chat</span>
        </DropdownMenuItem>
        {conversations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Recent Chats
            </DropdownMenuLabel>
            {conversations.map((conversation) => (
              <DropdownMenuItem
                key={conversation.id}
                onClick={() => loadConversation(conversation.id)}
                className={`cursor-pointer gap-2 ${
                  conversation.id === conversationId ? "bg-accent" : ""
                }`}
              >
                <MessagesSquare className="size-3.5 shrink-0" />
                <span className="truncate">{conversation.title}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
