"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusDashboard } from "@/components/grow/status-dashboard";

export default function StatusGrowDetailPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <Link
          href="/status"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-3" />
          Back to Status Overview
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground">Grow — Performance Status</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed performance metrics for your direct reports
        </p>
      </div>
      <StatusDashboard />
    </div>
  );
}
