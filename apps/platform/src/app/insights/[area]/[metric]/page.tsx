import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Database, Clock } from "lucide-react";
import { getArea, getSubcategory } from "@/lib/insights/areas";
import { parseFilters, filtersToSearchString } from "@/lib/insights/filters";
import { getMetric } from "@/lib/insights/metrics";
import { FilterBar } from "@/components/insights/filter-bar";
import { HealthDot } from "@/components/insights/health-dot";
import { BreakdownChart } from "@/components/insights/breakdown-chart";
import { BreakdownTable } from "@/components/insights/breakdown-table";
import { InsufficientData } from "@/components/insights/insufficient-data";
import { DigestExportActions } from "@/components/insights/digest-export-actions";

interface PageProps {
  params: Promise<{ area: string; metric: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InsightsDrilldownPage({ params, searchParams }: PageProps) {
  const { area: areaKey, metric: metricId } = await params;
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const area = getArea(areaKey);
  const metric = getMetric(metricId);
  if (!area || !metric || metric.area !== areaKey) notFound();

  const sub = getSubcategory(areaKey, metric.subcategory);

  const [result, drilldown] = await Promise.all([
    metric.compute(filters),
    metric.drilldown(filters),
  ]);

  const queryString = filtersToSearchString(filters);

  const exportRows = [
    { label: metric.label, value: result.display },
    ...(result.topSignal ? [{ label: "Top signal", value: result.topSignal }] : []),
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/40">
      <div className="mx-auto max-w-5xl p-6">
        <Link
          href={`/insights/${area.key}${queryString}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-3" />
          Back to {area.label}
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
                  {metric.label}
                </h1>
                <HealthDot health={result.health} showLabel />
              </div>
              {sub && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium" style={{ color: area.color }}>
                    {area.label}
                  </span>{" "}
                  · {sub.label}
                </p>
              )}
            </div>
          </div>
          <DigestExportActions
            exportFilename={`canopy-${metric.id}.csv`}
            exportRows={exportRows}
            breakdown={drilldown.rows}
          />
        </header>

        <div className="mb-5">
          <FilterBar filters={filters} showManager />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {result.health === "insufficient" ? (
              <InsufficientData />
            ) : (
              <>
                <BreakdownChart
                  rows={drilldown.rows}
                  groupByLabel={drilldown.groupByLabel}
                  valueLabel="Value"
                />
                <BreakdownTable
                  rows={drilldown.rows}
                  groupByLabel={drilldown.groupByLabel}
                />
              </>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="border-b px-4 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Headline
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-3xl font-bold text-deep-blue tracking-tight">
                  {result.display}
                </div>
                {result.topSignal && (
                  <div className="text-[11px] text-slate-700 leading-snug">
                    {result.topSignal}
                  </div>
                )}
                {result.delta && (
                  <div className="text-[11px] text-muted-foreground">
                    {result.delta.direction === "up" ? "▲" : result.delta.direction === "down" ? "▼" : "—"}{" "}
                    {result.delta.value} {result.delta.unit ?? ""} vs prior period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="border-b px-4 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Build details
                </span>
              </div>
              <div className="p-4 space-y-3">
                <Field
                  icon={<Database className="size-3" />}
                  label="Source"
                  value={result.isMock ? "Demo data (table not yet built)" : "Live MongoDB collection"}
                />
                <Field
                  icon={<Clock className="size-3" />}
                  label="As of"
                  value={result.asOf.toLocaleString()}
                />
                <Field
                  icon={<HealthDot health={result.health} size="sm" />}
                  label="Threshold"
                  value={result.health}
                />
              </div>
            </div>

            {drilldown.notes && drilldown.notes.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 leading-snug">
                {drilldown.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="mt-0.5 text-muted-foreground" aria-hidden="true">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-foreground">{value}</span>
      </div>
    </div>
  );
}
