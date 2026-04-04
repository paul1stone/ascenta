"use client";

import { DoTabChat } from "@/components/do-tab-chat";
import { PAGE_CONFIG, DEFAULT_PAGE_CONFIG } from "@/lib/constants/dashboard-nav";

const ACCENT_COLOR = "#8b5cf6";

export default function LeadershipLibraryPage() {
  const pageConfig = PAGE_CONFIG["leadership-library"] || DEFAULT_PAGE_CONFIG;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DoTabChat
        pageKey="leadership-library"
        pageConfig={pageConfig}
        accentColor={ACCENT_COLOR}
      />
    </div>
  );
}
