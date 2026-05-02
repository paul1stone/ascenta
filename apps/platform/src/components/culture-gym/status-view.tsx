"use client";

import { Award, Flame, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  EMPLOYEE_STATUS,
  MANAGER_STATUS,
  type StatusMetrics,
  type Lane,
  LANE_COLORS,
  TEAM_METRICS,
  SKILL_BADGES,
} from "./mock-data";

type StatusViewProps = {
  lane: Lane;
};

export function StatusView({ lane }: StatusViewProps) {
  const status: StatusMetrics =
    lane === "manager" ? MANAGER_STATUS : EMPLOYEE_STATUS;
  const accent = LANE_COLORS[lane];
  const isManager = lane === "manager";
  const TrendIcon =
    status.momentum === "rising"
      ? TrendingUp
      : status.momentum === "falling"
      ? TrendingDown
      : TrendingUp;

  const levelProgress =
    (status.level.current /
      Math.max(status.level.nextThreshold, status.level.current)) *
    100;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={Flame}
          label="Current streak"
          value={`${status.currentStreak} days`}
          sub={`Best: ${status.bestStreak} days`}
          color="#cc6677"
        />
        <Stat
          icon={Award}
          label="Mastery score"
          value={`${status.masteryScore}`}
          sub={`/100 — ${status.momentum}`}
          color={accent}
          TrendIcon={TrendIcon}
        />
        <Stat
          icon={Trophy}
          label="Level"
          value={status.level.label}
          sub={`${status.level.current}/${status.level.nextThreshold} workouts`}
          color="#aa8866"
        />
        <Stat
          icon={Award}
          label="Total completed"
          value={String(status.totalCompleted)}
          sub="All-time"
          color="#6688bb"
        />
      </section>

      <section className="rounded-2xl border border-border bg-background p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Path to next level
        </p>
        <div className="flex items-center gap-3 mb-3">
          <p className="font-display text-lg font-semibold text-foreground">
            {status.level.label}
          </p>
          <span className="text-xs text-muted-foreground">
            {status.level.nextThreshold - status.level.current} workouts to next
            level
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(levelProgress, 100)}%`,
              backgroundColor: accent,
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Category strengths
        </p>
        <div className="space-y-3">
          {status.categoryStrengths.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{cat.category}</span>
                <span className="text-muted-foreground">{cat.score}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${cat.score}%`,
                    backgroundColor: accent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {isManager && (
        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Team metrics (direct reports)
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TEAM_METRICS.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-border bg-background p-4"
              >
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: m.color }}
                >
                  {m.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Skill badges
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SKILL_BADGES.map((b) => (
            <div
              key={b.name}
              className={cn(
                "rounded-xl border p-4 text-center",
                b.earned
                  ? "border-border bg-background"
                  : "border-dashed border-border bg-muted/20 opacity-60"
              )}
            >
              <Trophy
                className={cn(
                  "size-6 mx-auto mb-1",
                  b.earned ? "text-[#aa8866]" : "text-muted-foreground/40"
                )}
              />
              <p className="text-xs text-foreground font-medium">{b.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {b.earned ? "Earned" : "Locked"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  color,
  TrendIcon,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub: string;
  color: string;
  TrendIcon?: typeof TrendingUp;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <div
          className="flex size-8 items-center justify-center rounded-md"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <Icon className="size-4" />
        </div>
        {TrendIcon && <TrendIcon className="size-4 text-muted-foreground" />}
      </div>
      <p
        className="font-display text-2xl font-bold mt-2"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-xs text-foreground mt-1">{label}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
