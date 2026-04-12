"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ascenta/ui/card";
import { Languages, AlertTriangle, Check, Building2 } from "lucide-react";

interface DeptStatus {
  department: string;
  hasTranslation: boolean;
  version: number | null;
  updatedAt: string | null;
}

interface TranslationHealthDashboardProps {
  departments: DeptStatus[];
  accentColor: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: "red" | "green" | "amber";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${
            highlight === "red"
              ? "text-rose-600"
              : highlight === "green"
                ? "text-emerald-600"
                : highlight === "amber"
                  ? "text-amber-600"
                  : ""
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function TranslationHealthDashboard({
  departments,
  accentColor,
}: TranslationHealthDashboardProps) {
  const total = departments.length;
  const withTranslation = departments.filter((d) => d.hasTranslation).length;
  const missing = total - withTranslation;
  const coverage = total > 0 ? Math.round((withTranslation / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-bold text-deep-blue">
        Translation Health
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Coverage"
          value={`${coverage}%`}
          icon={Languages}
          highlight={coverage === 100 ? "green" : coverage >= 50 ? "amber" : "red"}
        />
        <StatCard
          title="Departments Translated"
          value={`${withTranslation} / ${total}`}
          icon={Building2}
        />
        <StatCard
          title="Missing Translations"
          value={missing}
          icon={AlertTriangle}
          highlight={missing > 0 ? "red" : "green"}
        />
      </div>

      {/* Department list */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="divide-y">
          {departments.map((d) => (
            <div key={d.department} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-foreground">{d.department}</span>
              <div className="flex items-center gap-2">
                {d.hasTranslation ? (
                  <>
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">v{d.version}</span>
                  </>
                ) : (
                  <span className="text-xs text-rose-500 font-medium">Not translated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
