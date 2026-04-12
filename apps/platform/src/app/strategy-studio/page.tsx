"use client";

import { useState } from "react";
import { FunctionTabs } from "@/components/function-tabs";
import { DoTabChat } from "@/components/do-tab-chat";
import { FoundationPanel } from "@/components/plan/foundation-panel";
import { StrategyPanel } from "@/components/plan/strategy-panel";
import { TranslationsPanel } from "@/components/plan/translations-panel";
import { PAGE_CONFIG, DEFAULT_PAGE_CONFIG } from "@/lib/constants/dashboard-nav";

const ACCENT_COLOR = "#6688bb";

export default function StrategyStudioPage() {
  const pageConfig = PAGE_CONFIG["strategy-studio"] || DEFAULT_PAGE_CONFIG;
  const tabs = pageConfig.tabs ?? [];
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.key ?? "foundation");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FunctionTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ACCENT_COLOR}
      />

      {activeTab === "foundation" ? (
        <FoundationPanel accentColor={ACCENT_COLOR} />
      ) : activeTab === "strategy" ? (
        <StrategyPanel accentColor={ACCENT_COLOR} />
      ) : activeTab === "translations" ? (
        <TranslationsPanel accentColor={ACCENT_COLOR} />
      ) : (
        <DoTabChat
          pageKey="strategy-studio"
          pageConfig={pageConfig}
          accentColor={ACCENT_COLOR}
        />
      )}
    </div>
  );
}
