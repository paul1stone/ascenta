"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardNavTabs, type TabKey } from "./dashboard-nav-tabs";
import { ChatPanel } from "@/components/chat/chat-panel";
import {
  BookOpen,
  BarChart3,
  TrendingUp,
  Users,
  FileCheck,
  Clock,
  KanbanSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SUB_PAGE_TITLES: Record<string, string> = {
  "launch/onboarding": "Onboarding",
  "launch/training": "Training Plans",
  "launch/probation": "Probation Review",
  "protect/warnings": "Written Warnings",
  "protect/pip": "PIP Management",
  "protect/compliance": "Compliance",
  "attract/recruitment": "Recruitment",
  "attract/engagement": "Engagement",
  "attract/recognition": "Recognition",
};

interface DashboardContentProps {
  activeSubPage: string;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

function StatusContent({ subPage }: { subPage: string }) {
  const title = SUB_PAGE_TITLES[subPage] || "All Workflows";

  const stages = [
    { label: "Draft", count: 3, icon: FileCheck, color: "bg-slate-100 text-slate-600" },
    { label: "In Review", count: 2, icon: AlertCircle, color: "bg-amber-50 text-amber-600" },
    { label: "Sent", count: 4, icon: KanbanSquare, color: "bg-blue-50 text-blue-600" },
    { label: "Completed", count: 8, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <div key={stage.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{stage.label}</span>
              <div className={`flex size-8 items-center justify-center rounded-lg ${stage.color}`}>
                <stage.icon className="size-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-deep-blue">{stage.count}</div>
            <p className="text-xs text-muted-foreground mt-1">documents</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <KanbanSquare className="size-5 text-deep-blue" />
          <h3 className="font-semibold text-deep-blue">{title} Pipeline</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-dashed rounded-lg">
          Document pipeline view — connect to tracked documents
        </div>
      </div>
    </div>
  );
}

function LearnContent({ subPage }: { subPage: string }) {
  const title = SUB_PAGE_TITLES[subPage] || "HR";
  const isGeneral = !subPage;

  const cards = isGeneral
    ? [
        {
          title: "Getting Started with Ascenta",
          description: "Learn how to use the platform to manage HR workflows end-to-end.",
          icon: BookOpen,
        },
        {
          title: "Company Policies",
          description: "Review your organization's HR policies and compliance requirements.",
          icon: FileCheck,
        },
        {
          title: "Best Practices",
          description: "Proven approaches for employee relations, performance management, and more.",
          icon: Clock,
        },
      ]
    : [
        {
          title: `${title} Basics`,
          description: "Get started with foundational concepts and best practices.",
          icon: BookOpen,
        },
        {
          title: "Policy Guidelines",
          description: "Review company policies and regulatory requirements.",
          icon: FileCheck,
        },
        {
          title: "Recent Updates",
          description: "Stay current with the latest process changes and announcements.",
          icon: Clock,
        },
      ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-deep-blue/5">
                <card.icon className="size-5 text-deep-blue" />
              </div>
              <h3 className="font-semibold text-deep-blue">{card.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsContent({ subPage }: { subPage: string }) {
  const title = SUB_PAGE_TITLES[subPage] || "Organization";

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Cases", value: "12", icon: Users, change: "+2 this week" },
          { label: "Completed", value: "47", icon: FileCheck, change: "+5 this month" },
          { label: "Avg. Resolution", value: "8.3d", icon: Clock, change: "-1.2d vs last month" },
          { label: "Compliance Rate", value: "96%", icon: TrendingUp, change: "+2% this quarter" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-deep-blue">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-5 text-deep-blue" />
          <h3 className="font-semibold text-deep-blue">{title} Analytics</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-dashed rounded-lg">
          Chart placeholder — connect analytics data source
        </div>
      </div>
    </div>
  );
}

export function DashboardContent({
  activeSubPage,
  activeTab,
  onTabChange,
}: DashboardContentProps) {
  const pageTitle = activeSubPage ? (SUB_PAGE_TITLES[activeSubPage] ?? "Dashboard") : "Dashboard";

  return (
    <SidebarInset className="bg-glacier flex flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="flex-1 font-display font-semibold text-deep-blue">
          {pageTitle}
        </h1>
      </header>

      {/* Tab Bar */}
      <DashboardNavTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Content */}
      {activeTab === "do" ? (
        <ChatPanel subPage={activeSubPage} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "learn" && <LearnContent subPage={activeSubPage} />}
          {activeTab === "status" && <StatusContent subPage={activeSubPage} />}
          {activeTab === "insights" && <InsightsContent subPage={activeSubPage} />}
        </div>
      )}
    </SidebarInset>
  );
}
