"use client";

import { LibraryView } from "./job-descriptions/library-view";
import { OrgDesignEmptyTab } from "./org-design-empty-tab";
import { MyProfileTab } from "./my-profile-tab";

interface OrgDesignTabsProps {
  activeTab: string;
}

export function OrgDesignTabs({ activeTab }: OrgDesignTabsProps) {
  if (activeTab === "job-descriptions") return <LibraryView />;
  if (activeTab === "my-profile") return <MyProfileTab />;
  if (activeTab === "org-chart") return <OrgDesignEmptyTab />;
  return null;
}
