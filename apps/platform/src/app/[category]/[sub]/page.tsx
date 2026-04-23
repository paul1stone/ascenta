"use client";

import { use, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { notFound } from "next/navigation";
import {
  findNavContext,
  FUNCTION_TABS,
  PAGE_CONFIG,
  DEFAULT_PAGE_CONFIG,
} from "@/lib/constants/dashboard-nav";
import { FunctionTabs } from "@/components/function-tabs";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { DoTabChat } from "@/components/do-tab-chat";
import { LearnPanel } from "@/components/grow/learn-panel";
import { GoalsPanel } from "@/components/grow/goals-panel";
import { ReviewsPanel } from "@/components/grow/reviews-panel";
import { ReviewCyclesPanel } from "@/components/grow/review-cycles-panel";
import { CheckinsPanel } from "@/components/grow/checkins-panel";
import { SelfAssessmentPanel } from "@/components/grow/performance-reviews/self-assessment-panel";

export default function CategorySubPage({
  params,
}: {
  params: Promise<{ category: string; sub: string }>;
}) {
  const { category, sub } = use(params);
  const ctx = findNavContext(category, sub);
  if (!ctx) notFound();

  const pageKey = `${category}/${sub}`;
  const pageConfig = PAGE_CONFIG[pageKey] || DEFAULT_PAGE_CONFIG;
  const tabs = pageConfig.tabs ?? FUNCTION_TABS;
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FunctionTabs
        tabs={tabs}
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
      ) : activeTab === "learn" ? (
        <div className="flex-1 overflow-y-auto p-6">
          <BreadcrumbNav
            category={ctx.category.label}
            subPage={ctx.subPage.label}
            functionTab="Learn"
          />
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            Knowledge Base
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {ctx.category.label} / {ctx.subPage.label} — Documentation, guides, and training
          </p>
          {pageKey === "grow/performance" ? (
            <LearnPanel />
          ) : (
            <div className="rounded-lg border-2 border-dashed flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              Learn content coming soon
            </div>
          )}
        </div>
      ) : activeTab === "goals" ? (
        <GoalsPanel accentColor={ctx.category.color} />
      ) : activeTab === "checkins" ? (
        <CheckinsPanel accentColor={ctx.category.color} />
      ) : activeTab === "cycles" ? (
        <ReviewCyclesPanel accentColor={ctx.category.color} />
      ) : activeTab === "reviews" ? (
        <div className="flex-1 overflow-y-auto p-6">
          {user?.role === "employee" ? (
            <SelfAssessmentPanel
              employeeObjectId={user.id}
              employeeName={user.name}
              accentColor={ctx.category.color}
            />
          ) : (
            <ReviewsPanel
              pageKey={pageKey}
              accentColor={ctx.category.color}
              onSwitchToDoTab={() => setActiveTab("do")}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="text-muted-foreground/40 mb-3">
            {(() => {
              const tab = tabs.find((t) => t.key === activeTab);
              if (!tab) return null;
              const Icon = tab.icon;
              return <Icon className="size-10 mx-auto" />;
            })()}
          </div>
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            {tabs.find((t) => t.key === activeTab)?.label ?? "Coming Soon"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This section is under development. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
