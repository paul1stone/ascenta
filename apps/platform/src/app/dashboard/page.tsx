"use client";

import { SidebarInset } from "@ascenta/ui/sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <SidebarInset className="bg-glacier">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
          <div className="flex-1" />
          <AppNavbar />
        </header>
        <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-blue">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Overview of your HR operations and team activity.</p>
          </div>
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
  );
}
