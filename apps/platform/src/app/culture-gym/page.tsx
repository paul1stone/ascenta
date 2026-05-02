"use client";

import { useState } from "react";
import { Activity, BarChart3, Dumbbell } from "lucide-react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { DailyWorkout } from "@/components/culture-gym/daily-workout";
import { StatusView } from "@/components/culture-gym/status-view";
import { InsightsView } from "@/components/culture-gym/insights-view";
import type { Lane } from "@/components/culture-gym/mock-data";

const ACCENT_COLOR = "#44aa99";

type CGTab = "workout" | "status" | "insights";

export default function CultureGymPage() {
  const { user } = useAuth();
  const role = user?.role ?? "employee";
  const lane: Lane = role === "manager" ? "manager" : role === "hr" ? "hr" : "employee";
  const [tab, setTab] = useState<CGTab>("workout");

  const tabs: { key: CGTab; label: string; icon: typeof Dumbbell; visible: boolean }[] = [
    { key: "workout", label: "Daily Workout", icon: Dumbbell, visible: true },
    { key: "status", label: "Status", icon: Activity, visible: true },
    { key: "insights", label: "Insights", icon: BarChart3, visible: role === "hr" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Culture Gym · {lane === "hr" ? "HR / People Ops" : lane === "manager" ? "Manager Lane" : "Employee Lane"}
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
              Teach it. Apply it. Measure it. Improve it.
            </h1>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${ACCENT_COLOR}1a`, color: ACCENT_COLOR }}
            >
              5–7 minutes per day
            </span>
          </div>
        </div>
        <nav className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 flex gap-1 overflow-x-auto">
            {tabs
              .filter((t) => t.visible)
              .map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                      isActive
                        ? "text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    style={{
                      borderColor: isActive ? ACCENT_COLOR : "transparent",
                    }}
                  >
                    <Icon className="size-4" />
                    {t.label}
                  </button>
                );
              })}
          </div>
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto bg-muted/10">
        <div className="mx-auto max-w-5xl p-6">
          {tab === "workout" && <DailyWorkout lane={lane} />}
          {tab === "status" && <StatusView lane={lane === "hr" ? "manager" : lane} />}
          {tab === "insights" && role === "hr" && <InsightsView />}
        </div>
      </div>
    </div>
  );
}
