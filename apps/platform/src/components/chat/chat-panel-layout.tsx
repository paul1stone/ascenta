"use client";

import { type ReactNode } from "react";
import { useChatPanel } from "@/lib/chat/chat-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@ascenta/ui";

export function ChatPanelLayout({ children }: { children: ReactNode }) {
  const { isPanelOpen } = useChatPanel();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "min-h-screen transition-[margin-right] duration-300 ease-in-out",
        isPanelOpen && !isMobile && "mr-[50vw]"
      )}
    >
      {children}
    </div>
  );
}
