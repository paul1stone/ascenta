"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import {
  findNavContext,
  FUNCTION_TABS,
  PAGE_CONFIG,
  DEFAULT_PAGE_CONFIG,
  type TabKey,
} from "@/lib/constants/dashboard-nav";
import { FunctionTabs } from "@/components/function-tabs";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { DoTabChat } from "@/components/do-tab-chat";

export default function CategorySubPage({
  params,
}: {
  params: Promise<{ category: string; sub: string }>;
}) {
  const { category, sub } = use(params);
  const ctx = findNavContext(category, sub);
  if (!ctx) notFound();

  const [activeTab, setActiveTab] = useState<TabKey>("do");
  const tabMeta = FUNCTION_TABS.find((t) => t.key === activeTab)!;
  const pageKey = `${category}/${sub}`;
  const pageConfig = PAGE_CONFIG[pageKey] || DEFAULT_PAGE_CONFIG;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FunctionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ctx.category.color}
      />

      {activeTab === "do" ? (
        <DoTabChat
          pageKey={pageKey}
          pageConfig={pageConfig}
          accentColor={ctx.category.color}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <BreadcrumbNav
            category={ctx.category.label}
            subPage={ctx.subPage.label}
            functionTab={tabMeta.label}
          />
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {tabMeta.title}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {ctx.category.label} / {ctx.subPage.label} — {tabMeta.description}
          </p>
          <div className="rounded-lg border-2 border-dashed flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {tabMeta.label} content coming soon
          </div>
        </div>
      )}
    </div>
  );
}
