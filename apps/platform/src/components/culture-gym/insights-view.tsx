"use client";

import { AlertTriangle, BarChart3, Megaphone, ShieldAlert } from "lucide-react";
import { cn } from "@ascenta/ui";
import { HR_INSIGHTS, HR_CAMPAIGNS, LANE_COLORS } from "./mock-data";

const HEAT_COLOR = (score: number) => {
  if (score >= 80) return "#44aa99";
  if (score >= 70) return "#6688bb";
  if (score >= 60) return "#e8a735";
  return "#cc6677";
};

export function InsightsView() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Insights — HR / People Ops
          </h2>
          <p className="text-sm text-muted-foreground">
            Organization-level capability signals, heatmaps, and risk
            indicators. All figures roll up from individual workouts.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50"
        >
          <Megaphone className="size-4" />
          Launch new campaign
        </button>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Today participation"
          value={HR_INSIGHTS.participation.today}
          sub="vs 78% / 7d · 72% / 30d"
          color="#44aa99"
        />
        <Stat
          label="Average mastery"
          value={String(HR_INSIGHTS.averageMastery.overall)}
          sub={`Emp ${HR_INSIGHTS.averageMastery.employee} · Mgr ${HR_INSIGHTS.averageMastery.manager} · HR ${HR_INSIGHTS.averageMastery.hr}`}
          color="#6688bb"
        />
        <Stat
          label="Manager engagement"
          value={HR_INSIGHTS.managerEngagement}
          sub="Completion rate, last 30d"
          color="#aa8866"
        />
        <Stat
          label="Culture momentum"
          value={String(HR_INSIGHTS.cultureMomentum)}
          sub="Org-level momentum score"
          color="#cc6677"
        />
      </section>

      <section className="rounded-2xl border border-border bg-background overflow-hidden">
        <header className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h3 className="font-display text-sm font-semibold text-foreground">
            Skill Heatmap
          </h3>
        </header>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {(["employee", "manager", "hr"] as const).map((lane) => {
            const items = HR_INSIGHTS.heatmap.filter((c) => c.lane === lane);
            return (
              <div key={lane} className="space-y-2">
                <p
                  className="text-xs uppercase tracking-wider font-semibold"
                  style={{ color: LANE_COLORS[lane] }}
                >
                  {lane === "hr" ? "HR / People Ops" : lane}
                </p>
                {items.map((cell) => (
                  <div
                    key={cell.category}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1 truncate text-xs text-foreground">
                      {cell.category}
                    </div>
                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cell.score}%`,
                          backgroundColor: HEAT_COLOR(cell.score),
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold w-8 text-right"
                      style={{ color: HEAT_COLOR(cell.score) }}
                    >
                      {cell.score}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SignalList
          title="Risk Indicators"
          icon={ShieldAlert}
          color="#cc6677"
          items={HR_INSIGHTS.riskIndicators.map((r) => ({
            label: r.label,
            sub: r.lane,
            detail: r.detail,
          }))}
        />
        <SignalList
          title="Manager Capability Signals"
          icon={AlertTriangle}
          color="#e8a735"
          items={HR_INSIGHTS.capabilitySignals.map((c) => ({
            label: c.label,
            sub: "Capability gap",
            detail: c.detail,
          }))}
        />
      </section>

      <section className="rounded-2xl border border-border bg-background overflow-hidden">
        <header className="px-5 py-3 border-b border-border bg-muted/30">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Active Campaigns
          </h3>
          <p className="text-xs text-muted-foreground">
            Skill campaigns assigned to specific lanes or audiences.
          </p>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-muted/20 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-2 font-medium">Name</th>
              <th className="text-left px-5 py-2 font-medium">Audience</th>
              <th className="text-left px-5 py-2 font-medium">Window</th>
              <th className="text-left px-5 py-2 font-medium">Completion</th>
              <th className="text-left px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {HR_CAMPAIGNS.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-medium text-foreground">
                  {c.name}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{c.audience}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {c.start} – {c.end}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#44aa99]"
                        style={{ width: `${c.completion}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {c.completion}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      c.status === "active"
                        ? "bg-[#44aa99]/15 text-[#44aa99]"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
        <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-[#cc6677]" />
          Culture Drift Alerts
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          {HR_INSIGHTS.cultureDrift.map((d) => (
            <li key={d.label}>
              <span className="font-medium text-foreground">{d.label}: </span>
              {d.detail}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p
        className="font-display text-2xl font-bold"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-xs text-foreground mt-1">{label}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function SignalList({
  title,
  icon: Icon,
  color,
  items,
}: {
  title: string;
  icon: typeof AlertTriangle;
  color: string;
  items: { label: string; sub: string; detail: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden">
      <header className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Icon className="size-4" style={{ color }} />
        <h3 className="font-display text-sm font-semibold text-foreground">
          {title}
        </h3>
      </header>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.label} className="p-4">
            <div className="flex items-center justify-between gap-3 mb-1">
              <p className="font-display text-sm font-semibold text-foreground">
                {item.label}
              </p>
              <span className="text-[11px] text-muted-foreground">
                {item.sub}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
