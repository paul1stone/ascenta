"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ScrollText, Sparkles, Star } from "lucide-react";
import { cn } from "@ascenta/ui";

type AnchorMap = Record<number, string>;

const PER_CATEGORY_ANCHORS: Record<string, AnchorMap> = {
  job_knowledge: {
    1: "Misses key role responsibilities; needs supervision on routine tasks.",
    2: "Performs core duties; gaps in technical skill or process understanding.",
    3: "Reliably executes the role; understands tools and applies expertise.",
    4: "Goes beyond the role; teaches others; spots cross-functional gaps.",
    5: "Recognized expert; sets the technical standard for the team.",
  },
  quality_of_work: {
    1: "Frequent rework; errors reach customers or stakeholders.",
    2: "Generally accurate; occasional misses on complex deliverables.",
    3: "Consistently accurate and complete; meets professional standards.",
    4: "Quality clearly above peers; reduces rework for the team.",
    5: "Sets the bar — work is reused as a template for others.",
  },
  productivity: {
    1: "Misses commitments; struggles with prioritization or pacing.",
    2: "Hits most deadlines; pace dips on competing priorities.",
    3: "Meets deadlines and prioritizes effectively across normal load.",
    4: "Consistently delivers ahead of plan; absorbs additional scope.",
    5: "Multiplies team output through prioritization and operating rhythm.",
  },
  communication: {
    1: "Updates are missing, late, or ambiguous; stakeholders surprised.",
    2: "Communicates when prompted; clarity is uneven.",
    3: "Clear, timely, professional across written, verbal, and listening.",
    4: "Distills complex topics; active listener; proactively informs.",
    5: "Communication unlocks alignment across teams and levels.",
  },
};

const FALLBACK_ANCHORS: AnchorMap = {
  1: "Behavioral evidence shows this competency consistently below role expectations.",
  2: "Developing — partial evidence with named opportunities to grow.",
  3: "Solid behavioral evidence the competency is met in most situations.",
  4: "Behavior models the competency for peers; impact beyond direct work.",
  5: "Recognized exceptional behavior — shapes how the team performs.",
};

export function BehavioralAnchorsCallout({
  categoryKey,
  categoryLabel,
}: {
  categoryKey: string;
  categoryLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const anchors = PER_CATEGORY_ANCHORS[categoryKey] ?? FALLBACK_ANCHORS;

  return (
    <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-xs font-medium text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <ScrollText className="size-3.5 text-[#aa8866]" />
          Behavioral anchors for {categoryLabel}
        </span>
        {open ? (
          <ChevronUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <ol className="mt-2 space-y-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <li
              key={level}
              className="flex gap-2 text-xs leading-relaxed"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background border border-border text-[10px] font-semibold text-muted-foreground">
                {level}
              </span>
              <span className="text-foreground">{anchors[level]}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function EmployeeStrengthsSection({
  strengths,
  contributions,
  recognitionMoments,
}: {
  strengths?: string[];
  contributions?: string[];
  recognitionMoments?: string[];
}) {
  const defaultStrengths = strengths ?? [
    "Translates ambiguous customer feedback into structured product specs.",
    "Reliably runs cross-functional standups — keeps engineering and PM aligned.",
    "Mentors two junior teammates without dropping primary delivery.",
  ];

  const defaultContributions = contributions ?? [
    "Led the Q1 onboarding refresh — reduced new-hire ramp from 90 to 64 days.",
    "Owned the customer escalation playbook now used across 3 teams.",
  ];

  const defaultRecognition = recognitionMoments ?? [
    "Recognized in March all-hands for collaborative problem-solving on the migration freeze.",
    "Customer NPS handwritten letter — Brandon White cited as the difference-maker.",
  ];

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <header className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Star className="size-4 text-[#e8a735]" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Employee Strengths & Documented Contributions
        </h3>
      </header>
      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 text-sm">
        <Column
          title="Top Strengths"
          tone="#44aa99"
          items={defaultStrengths}
        />
        <Column
          title="Specific Contributions"
          tone="#6688bb"
          items={defaultContributions}
        />
        <Column
          title="Recognition Moments"
          tone="#aa8866"
          items={defaultRecognition}
        />
      </div>
      <footer className="px-5 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground italic">
        Captures the &quot;how&quot; behind the &quot;what&quot;. Primary input
        for compensation and promotion decisions.
      </footer>
    </div>
  );
}

function Column({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: string;
}) {
  return (
    <div className="space-y-2">
      <p
        className="text-[11px] uppercase tracking-wider font-semibold"
        style={{ color: tone }}
      >
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it}
            className="rounded-md border border-border bg-muted/20 p-3 text-xs text-foreground leading-relaxed"
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OverallRatingSummary({
  self,
  manager,
}: {
  self: number[];
  manager: number[];
}) {
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const selfAvg = avg(self.filter((n) => n > 0));
  const mgrAvg = avg(manager.filter((n) => n > 0));
  const overall = (selfAvg + mgrAvg) / 2;

  const labelFor = (n: number) => {
    if (n >= 4.5) return "Exceptional";
    if (n >= 3.5) return "Exceeds Expectations";
    if (n >= 2.5) return "Meets Expectations";
    if (n >= 1.5) return "Developing";
    if (n > 0) return "Improvement Needed";
    return "—";
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-4 text-[#6688bb]" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Overall Rating (computed from category averages)
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Score
          label="Self-Assessment Avg."
          value={selfAvg}
          sub={labelFor(selfAvg)}
          color="#6688bb"
        />
        <Score
          label="Manager Assessment Avg."
          value={mgrAvg}
          sub={labelFor(mgrAvg)}
          color="#aa8866"
        />
        <Score
          label="Overall"
          value={overall}
          sub={labelFor(overall)}
          color="#44aa99"
          large
        />
      </div>
      <p className="text-[11px] text-muted-foreground italic mt-3">
        No forced distribution. Anchored against per-competency behavioral
        descriptors, not a normalized curve.
      </p>
    </div>
  );
}

function Score({
  label,
  value,
  sub,
  color,
  large = false,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/20 p-4",
        large && "ring-2"
      )}
      style={large ? { borderColor: color } : undefined}
    >
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "font-display font-bold mt-1",
          large ? "text-3xl" : "text-2xl"
        )}
        style={{ color }}
      >
        {value > 0 ? value.toFixed(1) : "—"}
      </p>
      <p className="text-xs text-foreground mt-0.5">{sub}</p>
    </div>
  );
}

export function EmployeeWrittenResponse({
  initialValue = "",
  disabled = false,
}: {
  initialValue?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Optional written response
      </p>
      <p className="text-sm text-foreground">
        Add a written response to this review. Optional — your sign-off is
        valid with or without one. Anything you add becomes part of the formal
        record alongside the assessment.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Share what you agree with, what you'd push back on, or what context you want recorded."
        className="min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6688bb]/30 disabled:opacity-60"
      />
      <p className="text-[11px] text-muted-foreground italic">
        Your response is visible to your manager and HR as part of this review
        record.
      </p>
    </div>
  );
}
