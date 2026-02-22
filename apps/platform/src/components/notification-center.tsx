"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ascenta/ui/popover";
import { Button } from "@ascenta/ui/button";
import { ScrollArea } from "@ascenta/ui/scroll-area";
import { Skeleton } from "@ascenta/ui/skeleton";
import {
  Bell,
  Check,
  FileText,
  Send,
  Activity,
  CheckCircle,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "document_acknowledged":
      return <CheckCircle className="size-4 text-emerald-500" />;
    case "document_sent":
      return <Send className="size-4 text-blue-500" />;
    case "workflow_completed":
      return <Check className="size-4 text-summit" />;
    case "audit_event":
      return <Activity className="size-4 text-slate-500" />;
    default:
      return <FileText className="size-4 text-slate-500" />;
  }
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      fetchNotifications();
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-deep-blue">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-summit text-white px-1.5 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="size-8 mb-2 opacity-30" />
              <span className="text-sm">No notifications</span>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const content = (
                  <div
                    key={notification.id}
                    className="px-4 py-3 border-b last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                if (notification.link) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      onClick={() => setOpen(false)}
                    >
                      {content}
                    </Link>
                  );
                }

                return content;
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t text-center">
          <Link
            href="/dashboard"
            className="text-xs text-summit hover:underline"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
