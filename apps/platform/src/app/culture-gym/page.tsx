"use client";

import { DoTabChat } from "@/components/do-tab-chat";
import { PAGE_CONFIG, DEFAULT_PAGE_CONFIG } from "@/lib/constants/dashboard-nav";

const ACCENT_COLOR = "#44aa99";

export default function CultureGymPage() {
  const pageConfig = PAGE_CONFIG["culture-gym"] || DEFAULT_PAGE_CONFIG;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DoTabChat
        pageKey="culture-gym"
        pageConfig={pageConfig}
        accentColor={ACCENT_COLOR}
      />
    </div>
  );
}
