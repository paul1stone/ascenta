"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { DoTabChat } from "@/components/do-tab-chat";
import { PAGE_CONFIG, DEFAULT_PAGE_CONFIG } from "@/lib/constants/dashboard-nav";
import { useChat } from "@/lib/chat/chat-context";
import { useRole } from "@/lib/role/role-context";

const DO_ACCENT_COLOR = "#ff6b35"; // Summit Orange

function DoPageInner() {
  const pageConfig = PAGE_CONFIG["do"] || DEFAULT_PAGE_CONFIG;
  const searchParams = useSearchParams();
  const { setPageInput, sendMessage } = useChat();
  const { persona } = useRole();
  const hasSeededRef = useRef(false);

  // Pre-seed chat input from URL params (e.g., ?prompt=Help+me+build+our+MVV&tool=buildMVV)
  useEffect(() => {
    if (hasSeededRef.current) return;
    const prompt = searchParams.get("prompt");
    const toolKey = searchParams.get("tool");
    const outcomeText = searchParams.get("outcomeText");
    const strategyGoalId = searchParams.get("strategyGoalId");
    const strategyGoalTitle = searchParams.get("strategyGoalTitle");
    const contributionRef = searchParams.get("contributionRef");

    if (prompt) {
      hasSeededRef.current = true;
      setPageInput("do", prompt);
      // Auto-send after a brief delay to let the component mount
      setTimeout(() => {
        const employeeInfo = persona
          ? {
              id: persona.id,
              employeeId: persona.employeeId,
              firstName: persona.firstName,
              lastName: persona.lastName,
              department: persona.department,
              title: persona.title,
            }
          : undefined;
        const outcomeCtx =
          outcomeText && strategyGoalId && strategyGoalTitle && contributionRef
            ? { outcomeText, strategyGoalId, strategyGoalTitle, contributionRef }
            : undefined;
        sendMessage("do", prompt, toolKey ?? undefined, employeeInfo, outcomeCtx);
      }, 100);
    }
  }, [searchParams, setPageInput, sendMessage, persona]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DoTabChat
        pageKey="do"
        pageConfig={pageConfig}
        accentColor={DO_ACCENT_COLOR}
      />
    </div>
  );
}

export default function DoPage() {
  return (
    <Suspense>
      <DoPageInner />
    </Suspense>
  );
}
