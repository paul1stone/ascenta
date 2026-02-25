"use client";

import { useChatPanel } from "@/lib/chat/chat-context";
import Image from "next/image";

export function ChatPanelTrigger() {
  const { isPanelOpen, openPanel } = useChatPanel();

  if (isPanelOpen) return null;

  return (
    <button
      onClick={openPanel}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-summit shadow-lg shadow-summit/25 transition-all hover:bg-summit-hover hover:shadow-xl hover:shadow-summit/30 hover:scale-105 active:scale-95"
      aria-label="Open chat"
    >
      <Image
        src="/compass.svg"
        alt=""
        width={28}
        height={28}
        className="invert"
      />
    </button>
  );
}
