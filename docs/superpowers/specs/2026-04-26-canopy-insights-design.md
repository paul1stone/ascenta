# Canopy Insights — Design Spec

**Date:** 2026-04-26
**Reqs:** [`docs/reqs/canopy-insights.md`](../../reqs/canopy-insights.md)
**Status:** Approved (skeleton build, mock data + real where it exists)

## Goal

Replace the `/insights` placeholder page with the full Canopy HR Insights Dashboard described in the requirements doc. Build the complete skeleton across all six areas of work (Protect, Plan, Attract, Launch, Grow, Care) with placeholder content where underlying features don't exist yet, and wire real data for the metrics whose underlying tables already exist (Goals, Check-ins, Performance Notes).

Out of scope for this build: notification infra for the weekly Digest, PDF generation for exports, audit-log collection for export logging, role-based access controls, and Manager/Vantage view.

## Architecture

### Routes (Layer 1 → 2 → 3)

```
/insights                              Layer 1: Summary dashboard
/insights/[area]                       Layer 2: Area detail
/insights/[area]/[metric]              Layer 3: Drill-down
```

`[area]` is one of: `protect | plan | attract | launch | grow | care`. `[metric]` is the slug of one of the 11 spec metrics. Server components render each layer; filter state lives in URL `searchParams`.

### Data layer

All metric logic lives in `apps/platform/src/lib/insights/`:

```
lib/insights/
├── types.ts                # Health, MetricResult, FilterState, etc.
├── areas.ts                # Area registry (color, label, subcategories, applicable metrics)
├── filters.ts              # parseFilters(searchParams), Date/location/dept/manager
├── thresholds.ts           # green/yellow/red helpers
├── org-health.ts           # Composite Org Health Score (1–100) calc
├── metrics/
│   ├── index.ts            # registry: METRIC_ID → compute()
│   ├── check-in-completion-rate.ts        (real — uses Check-In schema)
│   ├── coaching-case-volume.ts            (mock — corrective_action_cases doesn't exist)
│   ├── pip-success-rate.ts                (mock)
│   ├── culture-gym-streaks.ts             (mock — culture_gym_sessions doesn't exist)
│   ├── goal-progress-rollup.ts            (real — uses Goal schema)
│   ├── day-one-readiness.ts               (mock)
│   ├── arrival-cycle-time.ts              (mock)
│   ├── overdue-tasks-by-owner.ts          (mock)
│   ├── protected-feedback-open.ts         (mock)
│   ├── policy-ack-completion.ts           (mock)
│   └── benefits-cases-open.ts             (mock)
└── mock-data.ts            # Seeded mock breakdowns for drill-downs
```

Each metric module exports:

```ts
export const metric: MetricDefinition = {
  id: "check-in-completion-rate",
  area: "grow",
  subcategory: "performance-system",
  label: "Check-in completion rate",
  isMock: false,                                    // true for stubs
  compute: (filters: FilterState) => Promise<MetricResult>,
  drilldown: (filters: FilterState) => Promise<DrilldownData>,
};
```

`MetricResult` shape:
```ts
{
  value: string | number,           // headline value
  display: string,                   // e.g. "71%"
  health: "green" | "yellow" | "red",
  delta?: { value: number; direction: "up" | "down" | "flat" },
  topSignal?: string,                // sub-line shown on summary card
  isMock: boolean,
  asOf: Date,
}
```

The privacy-threshold rule (no individual data when cohort < 5) is enforced in `compute()` — when the filter narrows the cohort below 5 employees, `value` returns `null` and `health` returns a `"insufficient"` state that the UI renders as "Not enough data."

### Filter wiring (URL-driven)

`FilterState` lives in URL `searchParams`:
- `range` — `30d` (default) | `90d` | `6m` | `12m` | `custom:YYYY-MM-DD:YYYY-MM-DD`
- `loc` — location id or `all`
- `dept` — department slug or `all`
- `mgr` — manager id (Layer 3 only)

`<FilterBar>` is a Client Component that reads filters from `useSearchParams()` and writes via `router.replace()` so URL changes are shallow and don't refetch the page tree unnecessarily. Server components on each page parse `searchParams` directly with `parseFilters()` and pass into metric `compute()`.

### Area registry

`lib/insights/areas.ts` maps each area key → label, color (reuses tokens from `dashboard-nav.ts`), subcategory list, and the metric IDs that belong to that area. Drives both the summary card layout and the area detail page.

```ts
export const INSIGHTS_AREAS = [
  { key: "grow",    label: "Grow",    color: "#44aa99",
    subcategories: [
      { key: "performance-system", label: "Performance System",
        statusItems: [...], insightItems: [...],
        metrics: ["check-in-completion-rate", "goal-progress-rollup", "culture-gym-streaks"] },
      { key: "coaching", label: "Coaching & Corrective Action",
        statusItems: [...], insightItems: [...],
        metrics: ["coaching-case-volume", "pip-success-rate"] },
    ] },
  // ... protect, plan, attract, launch, care
];
```

The `statusItems` and `insightItems` arrays are the bullet text from the requirements doc — surfaced verbatim in the area detail page even when no metric backs them yet (placeholder rows).

## Components

```
components/insights/
├── filter-bar.tsx              # Client. Reads/writes searchParams.
├── area-card.tsx               # Layer 1 summary card per area.
├── metric-card.tsx             # Layer 2 metric tile (clickable to drill-down).
├── status-panel.tsx            # Bullet list with checkmark/empty icons.
├── insights-panel.tsx          # Bullet list with insight icons.
├── health-dot.tsx              # Green/yellow/red dot + label.
├── org-health-score.tsx        # 1–100 score tile with delta.
├── risk-signals.tsx            # Top 3 open risk signals strip.
├── breakdown-chart.tsx         # Layer 3 horizontal bar chart (d3-driven).
├── breakdown-table.tsx         # Layer 3 data table.
├── insufficient-data.tsx       # < 5 cohort placeholder.
└── digest-export-actions.tsx   # Stub buttons + dialog.
```

`<MetricCard>` renders the headline value, a health dot, an optional sub-line ("3 managers below threshold — Katie Smith at 50%"), an optional delta (▲ 3 pts WoW), and a "View drill-down →" link. If `isMock`, shows a small `demo data` badge.

## Org Health Score

Computed live in `lib/insights/org-health.ts` from the per-area health states:

```
score = 100
       - 12 × (count of red areas)
       - 5 × (count of yellow areas)
       - 0 × (green)
clamp [0, 100]
```

Equal weight across the four spec components (Compliance, Talent velocity, Performance, Operational stability) is achieved by mapping each area to a component:
- Compliance: protect, care
- Talent velocity: attract, launch
- Performance: grow
- Operational: plan

The component-weight adjustment is out of scope for this build; weights are 1.0 each.

## Stubbed features (visible UI, no real backend)

- **Canopy Digest** — Settings dialog (`<DigestExportActions>`) showing frequency (weekly/daily) and delivery (in-platform/email) toggles. Save shows a toast: "Digest preferences saved (demo)." No actual notifications are sent.
- **Export** — CSV button on summary, area, and drill-down pages downloads a CSV file generated client-side from the visible mock data. No PDF generation, no audit-log entry. Disabled-with-tooltip on PII-blocked cells.
- **Privacy threshold** — Real check ("cohort < 5 → insufficient") is in place but, in practice, will rarely trigger with mock data; the UX is exercised by manually filtering down a small department.

## Real-data wiring (initial)

Two metrics use real data:

1. **Check-in completion rate** — `CheckIn.find({ scheduledFor: { $gte, $lte }})`, group by manager, computed = completed / scheduled.
2. **Goal progress rollup** — `Goal.find({ status: { $in: [...] }})`, count by status bucket; alignment rate = goals with `strategyPillarId` / total.

Both gate on `MONGODB_URI`. If the env var is absent (CI, fresh dev), `compute()` returns `{ ...mockResult, isMock: true }` and the UI badges accordingly.

## Sidebar treatment

`/insights` stays as a single link in the Overview section of `nav-sidebar.tsx` (no expansion). The summary screen IS the entry point per the spec. The existing `/insights/grow/page.tsx` placeholder is deleted (superseded by `/insights/grow`).

## Testing strategy

- **Pure functions** (threshold logic, score calc, filter parsing) — unit tests in `lib/insights/__tests__/`.
- **Real-data metrics** (check-in, goals) — integration tests gated on `MONGODB_URI` per the project pattern.
- **Pages** — manual browser smoke test only. No page-level RTL tests in this build.

## File-by-file plan

| File | Action |
|---|---|
| `apps/platform/src/lib/insights/types.ts` | Create |
| `apps/platform/src/lib/insights/areas.ts` | Create |
| `apps/platform/src/lib/insights/filters.ts` | Create |
| `apps/platform/src/lib/insights/thresholds.ts` | Create |
| `apps/platform/src/lib/insights/org-health.ts` | Create |
| `apps/platform/src/lib/insights/metrics/{*.ts, index.ts}` | Create (12 files) |
| `apps/platform/src/lib/insights/mock-data.ts` | Create |
| `apps/platform/src/components/insights/*.tsx` | Create (~12 files) |
| `apps/platform/src/app/insights/page.tsx` | Replace |
| `apps/platform/src/app/insights/[area]/page.tsx` | Create |
| `apps/platform/src/app/insights/[area]/[metric]/page.tsx` | Create |
| `apps/platform/src/app/insights/grow/page.tsx` | Delete |
| `apps/platform/src/lib/insights/__tests__/*.test.ts` | Create unit tests for thresholds, score, filters |

## Open questions

None. Decisions locked from Q1–Q4.
