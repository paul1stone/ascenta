"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageSquarePlus,
  MessagesSquare,
  Settings,
  ChevronLeft,
  Mountain,
} from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-border bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-deep-blue to-deep-blue/80">
              <Mountain className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-deep-blue">
              Ascenta
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "h-8 w-8 rounded-lg text-muted-foreground hover:text-deep-blue",
            isCollapsed && "mx-auto"
          )}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className={cn(
            "w-full justify-start gap-2 rounded-xl bg-summit hover:bg-summit-hover text-white font-medium",
            isCollapsed && "justify-center px-0"
          )}
        >
          <MessageSquarePlus className="h-4 w-4" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {!isCollapsed && (
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent
          </p>
        )}
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                "w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                conversation.id === currentConversationId
                  ? "bg-deep-blue/5 text-deep-blue"
                  : "text-muted-foreground hover:bg-glacier hover:text-deep-blue",
                isCollapsed && "justify-center px-2"
              )}
            >
              <MessagesSquare className="h-4 w-4 shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{conversation.title}</span>
              )}
            </button>
          ))}
          {conversations.length === 0 && !isCollapsed && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No conversations yet
            </p>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-deep-blue hover:bg-glacier",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </div>
    </div>
  );
}
