"use client";

import { LibraryView } from "./job-descriptions/library-view";
import { MyProfileTab } from "./my-profile-tab";
import { OrgChartView } from "./org-chart/org-chart-view";

interface OrgDesignTabsProps {
  activeTab: string;
}

export function OrgDesignTabs({ activeTab }: OrgDesignTabsProps) {
  if (activeTab === "job-descriptions") return <LibraryView />;
  if (activeTab === "my-profile") return <MyProfileTab />;
  if (activeTab === "org-chart") return <OrgChartView />;
  return null;
}
