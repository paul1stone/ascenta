"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <SidebarInset className="bg-glacier">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
          <h1 className="font-display text-lg font-semibold text-deep-blue">Dashboard</h1>
          <div className="flex-1" />
          <AppNavbar />
        </header>
        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
