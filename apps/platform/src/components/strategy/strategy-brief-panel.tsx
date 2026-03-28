"use client";

import { useRef } from "react";
import { Download, X, Building2, Users, Sparkles } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { cn } from "@ascenta/ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyGoalSection {
  title: string;
  description: string;
  horizon: string;
  status: string;
}

interface BriefSections {
  companySummary: string;
  companyGoals: StrategyGoalSection[];
  departmentGoals: StrategyGoalSection[];
  relevance: string;
}

interface StrategyBriefPanelProps {
  initialValues: Record<string, unknown>;
  onCancel: () => void;
  accentColor?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HORIZON_LABELS: Record<string, string> = {
  long_term: "Long-term (3-5 years)",
  medium_term: "Medium-term (1-2 years)",
  short_term: "Short-term (this quarter - 6 months)",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-400",
  on_track: "bg-emerald-500",
  needs_attention: "bg-amber-500",
  off_track: "bg-red-500",
  completed: "bg-gray-400",
};

function groupByHorizon(goals: StrategyGoalSection[]) {
  const groups: Record<string, StrategyGoalSection[]> = {};
  for (const goal of goals) {
    const key = goal.horizon;
    if (!groups[key]) groups[key] = [];
    groups[key].push(goal);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StrategyBriefPanel({ initialValues, onCancel, accentColor = "#6688bb" }: StrategyBriefPanelProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const employeeName = initialValues.employeeName as string;
  const department = initialValues.department as string;
  const generatedAt = initialValues.generatedAt as string;
  const sections = initialValues.sections as BriefSections;

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Strategy Brief - ${employeeName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #0c1e3d; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          h2 { font-size: 18px; margin-top: 32px; margin-bottom: 12px; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; }
          h3 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
          .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
          .goal { margin-bottom: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; }
          .goal-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .goal-desc { font-size: 13px; color: #555; }
          .status { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
          .relevance { background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; line-height: 1.6; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const companyByHorizon = groupByHorizon(sections?.companyGoals ?? []);
  const deptByHorizon = groupByHorizon(sections?.departmentGoals ?? []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
          <span className="text-sm font-semibold">Strategy Brief</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download PDF
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div ref={printRef}>
          {/* Document header */}
          <h1 className="text-lg font-bold" style={{ color: "#0c1e3d" }}>
            Strategy Brief
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {employeeName} &middot; {department} &middot; {formattedDate}
          </p>

          {/* Company Strategy */}
          <h2
            className="mb-3 flex items-center gap-2 border-b pb-1 text-sm font-semibold"
            style={{ borderColor: accentColor }}
          >
            <Building2 className="h-4 w-4" style={{ color: accentColor }} />
            Company Strategy
          </h2>
          {sections?.companySummary && (
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {sections.companySummary}
            </p>
          )}
          {Object.entries(companyByHorizon).map(([horizon, goals]) => (
            <div key={horizon} className="mb-4">
              <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                {HORIZON_LABELS[horizon] ?? horizon}
              </h3>
              {goals.map((goal, i) => (
                <div key={i} className="mb-2 rounded-md border p-3">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-2 w-2 rounded-full", STATUS_COLORS[goal.status] ?? "bg-gray-400")} />
                    <span className="text-sm font-medium">{goal.title}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">{goal.description}</p>
                </div>
              ))}
            </div>
          ))}

          {/* Department Strategy */}
          {(sections?.departmentGoals?.length ?? 0) > 0 && (
            <>
              <h2
                className="mb-3 mt-6 flex items-center gap-2 border-b pb-1 text-sm font-semibold"
                style={{ borderColor: accentColor }}
              >
                <Users className="h-4 w-4" style={{ color: accentColor }} />
                {department} Department Strategy
              </h2>
              {Object.entries(deptByHorizon).map(([horizon, goals]) => (
                <div key={horizon} className="mb-4">
                  <h3 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                    {HORIZON_LABELS[horizon] ?? horizon}
                  </h3>
                  {goals.map((goal, i) => (
                    <div key={i} className="mb-2 rounded-md border p-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", STATUS_COLORS[goal.status] ?? "bg-gray-400")} />
                        <span className="text-sm font-medium">{goal.title}</span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{goal.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* What This Means For You */}
          {sections?.relevance && (
            <>
              <h2
                className="mb-3 mt-6 flex items-center gap-2 border-b pb-1 text-sm font-semibold"
                style={{ borderColor: accentColor }}
              >
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                What This Means For You
              </h2>
              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed">
                {sections.relevance}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
