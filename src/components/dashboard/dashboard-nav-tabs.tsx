"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, BookOpen, KanbanSquare, BarChart3 } from "lucide-react";

type TabKey = "do" | "learn" | "status" | "insights";

interface DashboardNavTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "do", label: "Do", icon: MessageSquare },
  { key: "learn", label: "Learn", icon: BookOpen },
  { key: "status", label: "Status", icon: KanbanSquare },
  { key: "insights", label: "Insights", icon: BarChart3 },
];

export function DashboardNavTabs({ activeTab, onTabChange }: DashboardNavTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b bg-white px-4">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative",
              "hover:text-deep-blue",
              isActive
                ? "text-deep-blue after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-summit"
                : "text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export type { TabKey };
