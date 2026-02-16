"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { TabKey } from "@/components/dashboard/dashboard-nav-tabs";

export default function DashboardPage() {
  const [activeSubPage, setActiveSubPage] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("do");

  const handleSubPageChange = (key: string) => {
    setActiveSubPage(key);
    setActiveTab("do");
  };

  return (
    <SidebarProvider>
      <DashboardSidebar
        activeSubPage={activeSubPage}
        onSubPageChange={handleSubPageChange}
      />
      <DashboardContent
        activeSubPage={activeSubPage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </SidebarProvider>
  );
}
