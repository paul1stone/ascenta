"use client";

import { LibraryView } from "./job-descriptions/library-view";
import { MyRoleTab } from "./my-role-tab";
import { OrgChartView } from "./org-chart/org-chart-view";

interface OrgDesignTabsProps {
  activeTab: string;
}

export function OrgDesignTabs({ activeTab }: OrgDesignTabsProps) {
  if (activeTab === "job-descriptions") return <LibraryView />;
  if (activeTab === "my-role") return <MyRoleTab />;
  if (activeTab === "org-chart") return <OrgChartView />;
  return null;
}
