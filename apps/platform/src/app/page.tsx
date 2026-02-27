"use client";

import { useState } from "react";
import { useChatPanel } from "@/lib/chat/chat-context";
import { useRole } from "@/lib/role/role-context";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { DocumentTracker } from "@/components/document-tracker";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { GrowStatus } from "@/components/grow/grow-status";
import { GrowLearn } from "@/components/grow/grow-learn";
import { GrowDashboard } from "@/components/grow/grow-dashboard";
import { cn } from "@ascenta/ui";
import {
  Mountain,
  MessageSquare,
  BookOpen,
  KanbanSquare,
  LayoutDashboard,
  FileCheck,
  Clock,
} from "lucide-react";
import type { TabKey } from "@/lib/constants/dashboard-nav";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "do", label: "Do", icon: MessageSquare },
  { key: "learn", label: "Learn", icon: BookOpen },
  { key: "status", label: "Status", icon: KanbanSquare },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

function LearnContent() {
  const cards = [
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
  ];

  return (
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
  );
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      <StatsOverview />
      <NeedsAttention />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmployeeDirectory />
        </div>
        <div className="space-y-6">
          <DocumentPipeline />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TAB_HEADERS: Record<TabKey, { title: string; description: string }> = {
  do: { title: "", description: "" },
  learn: {
    title: "HR Knowledge Base",
    description: "Guides, policies, and best practices for your organization.",
  },
  status: {
    title: "Document Tracker",
    description: "Track and manage HR documents through their delivery lifecycle.",
  },
  dashboard: {
    title: "Dashboard",
    description: "Overview of your HR operations and team activity.",
  },
};

const GROW_TAB_HEADERS: Record<TabKey, { title: string; description: string }> = {
  do: { title: "", description: "" },
  learn: {
    title: "Grow — Learn",
    description: "Guides, examples, and scripts for goals, notes, check-ins, and feedback.",
  },
  status: {
    title: "Grow — Status",
    description: "Goal metrics, check-in progress, and performance note activity.",
  },
  dashboard: {
    title: "Grow — Dashboard",
    description: "Overview of your team's growth activity and items needing attention.",
  },
};

export default function RootPage() {
  const { activeTab, setActiveTab, openPanel, handleSubmit, setInput } = useChatPanel();
  const { role, setRole, roles } = useRole();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSuggestionClick = (suggestion: string) => {
    openPanel();
    setInput(suggestion);
    handleSubmit(suggestion);
  };

  const isGrow = selectedCategory === "grow";
  const header = isGrow ? GROW_TAB_HEADERS[activeTab] : DEFAULT_TAB_HEADERS[activeTab];

  return (
    <div className="flex flex-1 flex-col bg-glacier min-h-screen">
      {/* Tab Bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
        <div className="flex items-center gap-2 mr-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-deep-blue to-deep-blue/80 text-white">
            <Mountain className="size-3.5" />
          </div>
          <span className="font-display text-sm font-bold text-deep-blue">Ascenta</span>
        </div>
        <div className="h-5 w-px bg-border mr-2" />
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  isActive
                    ? "bg-deep-blue/8 text-deep-blue"
                    : "text-muted-foreground hover:text-deep-blue hover:bg-slate-100"
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="rounded-md border bg-white px-2 py-1 text-xs font-medium text-deep-blue capitalize"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "do" ? (
          <ChatWelcome
            onSuggestionClick={handleSuggestionClick}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        ) : (
          <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
            {header.title && (
              <div>
                <h1 className="font-display text-2xl font-bold text-deep-blue">{header.title}</h1>
                <p className="mt-1 text-muted-foreground">{header.description}</p>
              </div>
            )}
            {activeTab === "learn" && (isGrow ? <GrowLearn /> : <LearnContent />)}
            {activeTab === "status" && (isGrow ? <GrowStatus /> : <DocumentTracker />)}
            {activeTab === "dashboard" && (isGrow ? <GrowDashboard /> : <DashboardContent />)}
          </div>
        )}
      </div>
    </div>
  );
}
