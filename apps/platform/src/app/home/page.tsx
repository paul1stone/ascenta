import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Welcome greeting */}
        <WelcomeBanner />

        {/* 2. Primary: Action items + Activity (two-column) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeedsAttention />
          <RecentActivity />
        </div>

        {/* 3. Quick actions */}
        <QuickActions />

        {/* 4. Stats overview */}
        <StatsOverview />

        {/* 5. Secondary: Directory + Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmployeeDirectory />
          </div>
          <div>
            <DocumentPipeline />
          </div>
        </div>
      </div>
    </div>
  );
}
