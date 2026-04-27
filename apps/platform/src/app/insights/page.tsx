import { Info } from "lucide-react";
import { INSIGHTS_AREAS } from "@/lib/insights/areas";
import { parseFilters } from "@/lib/insights/filters";
import {
  computeOrgHealthScore,
  summarizeAllAreas,
  topRiskSignals,
} from "@/lib/insights/org-health";
import { FilterBar } from "@/components/insights/filter-bar";
import { AreaCard } from "@/components/insights/area-card";
import { OrgHealthScore } from "@/components/insights/org-health-score";
import { RiskSignals } from "@/components/insights/risk-signals";
import { DigestExportActions } from "@/components/insights/digest-export-actions";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InsightsSummaryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const summaries = await summarizeAllAreas(filters);
  const score = computeOrgHealthScore(summaries);
  const risks = topRiskSignals(summaries, 3);

  const exportRows = [
    { label: "Organization Health Score", value: `${score.score}/100` },
    ...summaries.map((s) => {
      const area = INSIGHTS_AREAS.find((a) => a.key === s.area);
      return {
        label: `${area?.label ?? s.area} — ${s.headlineMetric?.label ?? "Health"}`,
        value: s.headlineMetric?.display ?? s.health,
      };
    }),
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/40">
      <div className="mx-auto max-w-7xl p-6">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-deep-blue">Canopy</h1>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                HR Insights
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Organization-wide lens across all six areas of work — read-only.
              Click any area to drill in.
            </p>
          </div>
          <DigestExportActions
            exportFilename="canopy-summary.csv"
            exportRows={exportRows}
          />
        </header>

        <div className="mb-5">
          <FilterBar filters={filters} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {INSIGHTS_AREAS.map((area) => {
              const summary = summaries.find((s) => s.area === area.key);
              if (!summary) return null;
              return (
                <AreaCard
                  key={area.key}
                  area={area}
                  health={summary.health}
                  headlineMetric={summary.headlineMetric}
                  topSignal={summary.topSignal}
                  href={`/insights/${area.key}`}
                />
              );
            })}
          </section>

          <aside className="flex flex-col gap-4">
            <OrgHealthScore score={score} />
            <RiskSignals signals={risks} />
            <div className="flex items-start gap-2 rounded-lg border border-dashed bg-white px-3 py-2.5 text-[11px] text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="leading-snug">
                Canopy aggregates signals; it never surfaces individual employee data
                below the 5-person privacy threshold. Health indicators recalculate
                every 4 hours.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
