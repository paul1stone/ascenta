import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EmployeeDirectory } from "@/components/dashboard/employee-directory";
import { DocumentPipeline } from "@/components/dashboard/document-pipeline";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
      </div>
    </div>
  );
}
