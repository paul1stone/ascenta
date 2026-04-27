import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArea } from "@/lib/insights/areas";
import { parseFilters, filtersToSearchString } from "@/lib/insights/filters";
import { METRIC_REGISTRY } from "@/lib/insights/metrics";
import { summarizeArea } from "@/lib/insights/org-health";
import { FilterBar } from "@/components/insights/filter-bar";
import { MetricCard } from "@/components/insights/metric-card";
import { StatusPanel } from "@/components/insights/status-panel";
import { InsightsPanel } from "@/components/insights/insights-panel";
import { HealthDot } from "@/components/insights/health-dot";
import { DigestExportActions } from "@/components/insights/digest-export-actions";
import type { AreaKey, MetricResult } from "@/lib/insights/types";

interface PageProps {
  params: Promise<{ area: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InsightsAreaPage({ params, searchParams }: PageProps) {
  const { area: areaKey } = await params;
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const area = getArea(areaKey);
  if (!area) notFound();

  const summary = await summarizeArea(areaKey as AreaKey, filters);
  const queryString = filtersToSearchString(filters);

  const rawResults = await Promise.all(
    area.subcategories.flatMap((sub) =>
      sub.metricIds.map(async (id) => {
        const m = METRIC_REGISTRY[id];
        if (!m) return null;
        const result = await m.compute(filters);
        return { subcategoryKey: sub.key, result };
      }),
    ),
  );
  type MetricEntry = { subcategoryKey: string; result: MetricResult };
  const allMetricResults: MetricEntry[] = rawResults.filter(
    (r): r is MetricEntry => r !== null,
  );
  const metricsBySub = new Map<string, MetricEntry[]>();
  for (const item of allMetricResults) {
    const arr = metricsBySub.get(item.subcategoryKey) ?? [];
    arr.push(item);
    metricsBySub.set(item.subcategoryKey, arr);
  }

  const exportRows = allMetricResults.map((r) => ({
    label: r.result.label,
    value: r.result.display,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/40">
      <div className="mx-auto max-w-6xl p-6">
        <Link
          href="/insights"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-3" />
          Back to Canopy
        </Link>

        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-1.5 h-10 w-1 rounded-full shrink-0"
              style={{ backgroundColor: area.color }}
              aria-hidden="true"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-deep-blue">
                  {area.label}
                </h1>
                <HealthDot health={summary.health} showLabel />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{area.subtitle}</p>
            </div>
          </div>
          <DigestExportActions
            exportFilename={`canopy-${area.key}.csv`}
            exportRows={exportRows.length > 0 ? exportRows : [{ label: "Status", value: summary.health }]}
          />
        </header>

        <div className="mb-5">
          <FilterBar filters={filters} />
        </div>

        <div className="space-y-6">
          {area.subcategories.map((sub) => {
            const metrics = metricsBySub.get(sub.key) ?? [];
            return (
              <section key={sub.key} className="rounded-lg border bg-white overflow-hidden">
                <div className="border-b px-5 py-3">
                  <h2 className="font-display text-base font-bold text-deep-blue">
                    {sub.label}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                    {sub.description}
                  </p>
                </div>

                <div className="p-5 space-y-5">
                  {metrics.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {metrics.map(({ result }) => (
                        <MetricCard
                          key={result.id}
                          result={result}
                          drilldownHref={`/insights/${area.key}/${result.id}${queryString}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border-2 border-dashed bg-slate-50/40 px-4 py-3 text-[11px] text-muted-foreground italic">
                      No metrics defined yet — Status and Insights items below describe what will appear here.
                    </div>
                  )}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <StatusPanel items={sub.statusItems} color={area.color} />
                    <InsightsPanel items={sub.insightItems} color={area.color} />
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { area: "protect" },
    { area: "plan" },
    { area: "attract" },
    { area: "launch" },
    { area: "grow" },
    { area: "care" },
  ];
}
