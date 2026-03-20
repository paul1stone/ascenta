"use client";

import { DoTabChat } from "@/components/do-tab-chat";
import { PAGE_CONFIG, DEFAULT_PAGE_CONFIG } from "@/lib/constants/dashboard-nav";

const DO_ACCENT_COLOR = "#ff6b35"; // Summit Orange

export default function DoPage() {
  const pageConfig = PAGE_CONFIG["do"] || DEFAULT_PAGE_CONFIG;

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
