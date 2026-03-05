"use client";

import { cn } from "@ascenta/ui";
import { FUNCTION_TABS, type TabKey } from "@/lib/constants/dashboard-nav";

interface FunctionTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  accentColor: string;
}

export function FunctionTabs({ activeTab, onTabChange, accentColor }: FunctionTabsProps) {
  return (
    <div className="flex border-b bg-[#fafafa]">
      {FUNCTION_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-6 py-3 text-[13px] transition-colors",
              isActive ? "font-bold text-foreground bg-white" : "text-muted-foreground hover:text-foreground"
            )}
            style={{
              borderBottom: isActive ? `3px solid ${accentColor}` : "3px solid transparent",
            }}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
