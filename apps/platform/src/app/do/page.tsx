"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { DoTabChat } from "@/components/do-tab-chat";
import { PAGE_CONFIG, DEFAULT_PAGE_CONFIG } from "@/lib/constants/dashboard-nav";
import { useChat } from "@/lib/chat/chat-context";
import { useAuth } from "@/lib/auth/auth-context";

const DO_ACCENT_COLOR = "#ff6b35"; // Summit Orange

function DoPageInner() {
  const pageConfig = PAGE_CONFIG["do"] || DEFAULT_PAGE_CONFIG;
  const searchParams = useSearchParams();
  const { setPageInput, sendMessage } = useChat();
  const { user } = useAuth();
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
    const jobDescriptionId = searchParams.get("jobDescriptionId");

    if (prompt) {
      hasSeededRef.current = true;
      // If a jobDescriptionId is supplied (refine flow), bake it into the
      // prompt so the tool call carries the jdId arg without expanding the
      // sendMessage signature.
      const augmentedPrompt = jobDescriptionId
        ? `${prompt} (jdId=${jobDescriptionId})`
        : prompt;
      setPageInput("do", augmentedPrompt);
      // Auto-send after a brief delay to let the component mount
      setTimeout(() => {
        const employeeInfo = user
          ? {
              id: user.id,
              employeeId: user.employeeId,
              firstName: user.firstName,
              lastName: user.lastName,
              department: user.department,
              title: user.title,
            }
          : undefined;
        const outcomeCtx =
          outcomeText && strategyGoalId && strategyGoalTitle && contributionRef
            ? { outcomeText, strategyGoalId, strategyGoalTitle, contributionRef }
            : undefined;
        sendMessage(
          "do",
          augmentedPrompt,
          toolKey ?? undefined,
          employeeInfo,
          outcomeCtx,
        );
      }, 100);
    }
  }, [searchParams, setPageInput, sendMessage, user]);

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
