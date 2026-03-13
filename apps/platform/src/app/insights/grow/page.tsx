import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InsightsGrowDetailPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <Link
          href="/insights"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-3" />
          Back to Insights
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground">Grow — Performance Insights</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Trends and analytics for performance, goals, and check-ins
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed h-[300px]">
        <span className="text-sm text-muted-foreground">Performance insights coming soon</span>
      </div>
    </div>
  );
}
