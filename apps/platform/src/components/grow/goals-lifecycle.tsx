"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  ClipboardList,
  Compass,
  Sparkles,
} from "lucide-react";
import { cn } from "@ascenta/ui";

type Role = "employee" | "manager" | "hr";

const PREP_PROMPTS_EMPLOYEE = [
  {
    id: "ep-1",
    label: "Strategy Orientation",
    prompt:
      "Review your organization's strategy pillars. Which connects most to your daily work? Which feels furthest from your role?",
  },
  {
    id: "ep-2",
    label: "Goal Recommendations Review",
    prompt:
      "Five AI-suggested goals are queued from your job description, lifecycle stage, and Strategy Studio. Which resonate?",
  },
  {
    id: "ep-3",
    label: "Personal Aspiration Reflection",
    prompt:
      "Where do you want to be 6–12 months from now in your role, skills, or career?",
  },
  {
    id: "ep-4",
    label: "Current Constraints Reflection",
    prompt:
      "What might make it hard to achieve your goals this period? Naming it early lets your manager pre-empt support.",
  },
];

const PREP_PROMPTS_MANAGER = [
  {
    id: "mp-1",
    label: "Strategy Context Brief",
    prompt:
      "Two strategy pillars most relevant to this report's role auto-populate from Strategy Studio. Read-only reference.",
  },
  {
    id: "mp-2",
    label: "AI Goal Recommendations Review",
    prompt:
      "Five goal ideas from Leadership Library are ready. Accept, edit, or dismiss each. Pick the 2–3 you'll propose.",
  },
  {
    id: "mp-3",
    label: "Employee Aspiration Preview",
    prompt:
      "Distilled preview of your direct report's EP-3 aspiration arrives 24 hours before the conversation.",
  },
  {
    id: "mp-4",
    label: "Prior Goal Status",
    prompt:
      "Progress on existing goals — complete, stalled, carry forward, or retire. Hidden if no prior goals.",
  },
  {
    id: "mp-5",
    label: "Conversation Intent",
    prompt:
      "What is the one thing you most want this employee to leave the conversation feeling — clarity, excitement, or ownership?",
  },
];

type GoalsLifecycleProps = {
  role: Role;
  hasPriorGoals?: boolean;
};

export function GoalsLifecycle({ role, hasPriorGoals = true }: GoalsLifecycleProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3 flex items-center justify-between gap-3 hover:bg-muted/30"
      >
        <div className="flex items-center gap-2 text-left">
          <CalendarRange className="size-4 text-muted-foreground" />
          <span className="font-display text-sm font-semibold text-foreground">
            Goal Cycle & Lifecycle
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Q2 cycle · Conversations open through May 18
          </span>
        </div>
        {open ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          <CycleBanner role={role} />
          <PreparationGrid role={role} />
          <MidPeriodCard />
          {hasPriorGoals && <EndOfPeriodCloseCard />}
          {role === "hr" && <HrAnalyticsSection />}
        </div>
      )}
    </div>
  );
}

function CycleBanner({ role }: { role: Role }) {
  const items = [
    { label: "Preparation Window", value: "Open through May 4", color: "#44aa99" },
    {
      label: "Conversation Deadline",
      value: "May 18, 2026",
      color: "#6688bb",
    },
    {
      label: "Confirmation Deadline",
      value: "May 25, 2026",
      color: "#aa8866",
    },
    {
      label: role === "hr" ? "Cascade Coverage" : "Your Status",
      value: role === "hr" ? "94% of teams have aligned goals" : "3 active · 1 needs confirmation",
      color: "#cc6677",
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-lg border border-border p-3"
        >
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {it.label}
          </p>
          <p
            className="font-display text-sm font-semibold mt-1"
            style={{ color: it.color }}
          >
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function PreparationGrid({ role }: { role: Role }) {
  const isManager = role === "manager";
  const employeePrompts = PREP_PROMPTS_EMPLOYEE;
  const managerPrompts = PREP_PROMPTS_MANAGER;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-[#6688bb]" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Preparation (48–72 hours before the conversation)
        </h3>
      </div>
      <p className="text-xs text-muted-foreground -mt-2 ml-6">
        Both parties prepare independently. Distilled previews flow to the
        other side 24 hours before the conversation.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PrepColumn
          title="Employee Preparation"
          color="#44aa99"
          prompts={employeePrompts}
          highlightedFirst={!isManager}
        />
        <PrepColumn
          title="Manager Preparation"
          color="#aa8866"
          prompts={managerPrompts}
          highlightedFirst={isManager}
        />
      </div>
    </div>
  );
}

function PrepColumn({
  title,
  color,
  prompts,
  highlightedFirst,
}: {
  title: string;
  color: string;
  prompts: { id: string; label: string; prompt: string }[];
  highlightedFirst: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <p className="text-xs uppercase tracking-wider font-semibold text-foreground">
          {title}
        </p>
        {highlightedFirst && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px]"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            Your prep
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {prompts.map((p, idx) => (
          <li key={p.id} className="flex items-start gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-muted-foreground border border-border">
              {idx + 1}
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">{p.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {p.prompt}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MidPeriodCard() {
  return (
    <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e8a735]/15 text-[#e8a735]">
        <AlertTriangle className="size-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-display text-sm font-semibold text-foreground">
          Mid-Period Goal Review — auto-trigger at midpoint
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
          On June 17, Ascenta will generate a review guide listing every active
          goal, its current status, completion progress, and at-risk flags.
          Both parties review and confirm any recalibrations.
        </p>
      </div>
      <button
        className="text-xs font-medium rounded-lg border border-border px-3 py-2 hover:bg-muted/40 whitespace-nowrap"
      >
        Preview review guide
      </button>
    </div>
  );
}

function EndOfPeriodCloseCard() {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <CircleCheck className="size-4 text-[#44aa99]" />
        <h4 className="font-display text-sm font-semibold text-foreground">
          End-of-Period Close — Q1 summary (preview)
        </h4>
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-4 grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
        <CloseStat label="Agreed" value="5" color="#6688bb" />
        <CloseStat label="Completed" value="3" color="#44aa99" />
        <CloseStat label="Recalibrated" value="1" color="#aa8866" />
        <CloseStat label="In Progress" value="1" color="#e8a735" />
        <CloseStat label="Key Results Hit" value="11/14" color="#cc6677" />
      </div>
      <p className="text-[11px] text-muted-foreground italic mt-3">
        Both parties confirm the summary before it locks into the performance
        record. Becomes primary input for the next Performance Review.
      </p>
    </div>
  );
}

function CloseStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p
        className="font-display text-xl font-bold"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function HrAnalyticsSection() {
  const signals = [
    { label: "Goal Alignment Rate", value: "94%", target: "Target 100%", color: "#44aa99" },
    { label: "Goal Balance Ratio", value: "1.4 : 1", target: "Performance : Development", color: "#6688bb" },
    { label: "Confirmation Rate", value: "88%", target: "Both-party agreed", color: "#aa8866" },
    { label: "Recalibration Frequency", value: "12%", target: "Healthy 8–15%", color: "#cc6677" },
    { label: "Goal Health Score", value: "72", target: "Aggregate, by team", color: "#44aa99" },
    { label: "Avg. KRs per Goal", value: "3.1", target: "Healthy 2–4", color: "#6688bb" },
  ];
  const lowAlignmentTeams = [
    { team: "Customer Support", rate: 71, employees: 18 },
    { team: "Field Operations - West", rate: 68, employees: 11 },
  ];
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-4 text-[#cc6677]" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          HR Analytics — Cascade Integrity & Quality
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {signals.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border p-3"
          >
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
            <p
              className="font-display text-2xl font-bold mt-1"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {s.target}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
        <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
          <ClipboardList className="size-3.5 text-[#cc6677]" />
          Low-alignment teams (coach managers here)
        </p>
        <ul className="space-y-1.5">
          {lowAlignmentTeams.map((t) => (
            <li
              key={t.team}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-foreground">{t.team}</span>
              <span className="text-muted-foreground">
                {t.rate}% aligned · {t.employees} employees
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Compass className="size-3.5 text-muted-foreground" />
        Recalibration documentation, immutable confirmation logs, and goal
        close archives feed Performance Reviews directly.
      </div>
    </div>
  );
}
