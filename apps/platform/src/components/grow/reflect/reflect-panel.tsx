"use client";

import { useState } from "react";
import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import {
  MOCK_HISTORY,
  MOCK_NEXT_SESSION,
  STATUS_COLORS,
  STATUS_LABELS,
  TRIGGER_LABELS,
  HR_AGGREGATE_SIGNALS,
  HR_LIBRARY_SURFACING,
} from "./mock-data";
import { ConversationMap } from "./conversation-map";
import { PreparationCard, type PreparationPrompt } from "./preparation-card";
import { ConversationMoves } from "./conversation-moves";
import { TriggersRouting } from "./triggers-routing";
import {
  PostReflectForm,
  EMPLOYEE_POST_REFLECT,
  MANAGER_POST_REFLECT,
} from "./post-reflect";

const EMPLOYEE_PREP_PROMPTS: PreparationPrompt[] = [
  {
    id: "er-1",
    label: "Relationship Quality Reflection",
    prompt:
      "How would you describe the quality of your working relationship with your manager right now — not their technical skills, but the relationship itself? Where does it feel strong? Where does it feel like something is missing or unclear?",
    paired: "Manager MR-1",
  },
  {
    id: "er-2",
    label: "Upward Feedback",
    prompt:
      "In what ways does your manager show up well for you? Where do you wish their support looked different?",
    paired: "Manager MR-2",
  },
  {
    id: "er-3",
    label: "Things Left Unsaid",
    prompt:
      "Is there something you have wanted to raise with your manager but have not felt the right moment?",
    helper: "Private to you. Never surfaces in the conversation map.",
    isPrivate: true,
  },
  {
    id: "er-4",
    label: "What I Need from My Manager",
    prompt:
      "If you could name one thing your manager could do that would make this working relationship more effective for you, what would it be? Frame it as a request with a reason.",
    paired: "Manager MR-4",
  },
];

const MANAGER_PREP_PROMPTS: PreparationPrompt[] = [
  {
    id: "mr-1",
    label: "Relationship Quality Reflection",
    prompt:
      "How would you describe the quality of your working relationship with this employee right now — not their performance, but the relationship itself? Where does it feel strong? Where does it feel like there is distance or missed connection?",
    paired: "Employee ER-1",
  },
  {
    id: "mr-2",
    label: "Manager Self-Assessment",
    prompt:
      "In what specific ways do you feel you are showing up well as this employee's manager? Where do you feel you are falling short or where could your support be stronger?",
    paired: "Employee ER-2",
  },
  {
    id: "mr-3",
    label: "Things Left Unsaid",
    prompt:
      "Is there anything you have been holding back in your Check-ins with this employee — a concern, a piece of feedback, an appreciation you have not named, or something about the working dynamic that feels unresolved?",
    helper: "Private to you. Never surfaces in the conversation map.",
    isPrivate: true,
  },
  {
    id: "mr-4",
    label: "What I Need from This Employee",
    prompt:
      "If you could name one thing this employee could do that would make this working relationship more effective, what would it be? Frame it as a request, not a criticism.",
    paired: "Employee ER-4",
  },
];

type ReflectTab = "overview" | "prepare" | "conversation" | "post" | "history";

const TABS: { key: ReflectTab; label: string; icon: typeof Brain }[] = [
  { key: "overview", label: "Overview", icon: Info },
  { key: "prepare", label: "Prepare", icon: Sparkles },
  { key: "conversation", label: "Conversation", icon: Brain },
  { key: "post", label: "Post-Reflect", icon: CheckCircle2 },
  { key: "history", label: "History", icon: Calendar },
];

type ReflectPanelProps = {
  accentColor: string;
};

export function ReflectPanel({ accentColor }: ReflectPanelProps) {
  const { user } = useAuth();
  const role = user?.role ?? "manager";
  const [tab, setTab] = useState<ReflectTab>("overview");

  if (role === "hr") {
    return <HrReflectView />;
  }

  const isManager = role === "manager";
  const prepPrompts = isManager ? MANAGER_PREP_PROMPTS : EMPLOYEE_PREP_PROMPTS;
  const postPrompts = isManager ? MANAGER_POST_REFLECT : EMPLOYEE_POST_REFLECT;
  const session = MOCK_NEXT_SESSION;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="size-5" style={{ color: accentColor }} />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Reflect
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Reflect is the structured two-way conversation that maintains the
            working relationship between {isManager ? "you and each direct report" : "you and your manager"}.
            Development data only — never used in formal performance evaluations.
          </p>
        </header>

        <SessionStatusBanner accentColor={accentColor} />

        <nav className="flex gap-1 border-b border-border overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                style={isActive ? { borderColor: accentColor } : undefined}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <OverviewCard
                title="Why this Reflect"
                value={TRIGGER_LABELS[session.trigger]}
                detail={session.triggerDetail}
                color={accentColor}
              />
              <OverviewCard
                title="Your prep"
                value={session.myPrepCompleted ? "Complete" : "In progress"}
                detail={
                  session.myPrepCompleted
                    ? "Submitted, ready for the conversation."
                    : "Due 24 hours before the conversation."
                }
                color={
                  session.myPrepCompleted ? "#44aa99" : "#e8a735"
                }
              />
              <OverviewCard
                title={`${isManager ? "Employee" : "Manager"} prep`}
                value={
                  session.partnerPrepCompleted ? "Complete" : "In progress"
                }
                detail={
                  session.partnerPrepCompleted
                    ? "Conversation map will populate when you're both ready."
                    : `Waiting on ${session.partner.name}.`
                }
                color={
                  session.partnerPrepCompleted ? "#44aa99" : "#94a3b8"
                }
              />
            </div>
            <TriggersRouting />
          </div>
        )}

        {tab === "prepare" && (
          <div className="space-y-4">
            <PreparationLegend />
            {prepPrompts.map((p, idx) => (
              <PreparationCard
                key={p.id}
                prompt={p}
                index={idx}
                initialValue={
                  idx === 1 && isManager
                    ? "Strong on access and unblocking. Lighter on celebrating quiet wins."
                    : idx === 0 && !isManager
                    ? "Trusting and direct, but I'd value more in-the-moment coaching."
                    : ""
                }
              />
            ))}
          </div>
        )}

        {tab === "conversation" && (
          <div className="space-y-5">
            <ConversationMap
              myLabel={isManager ? "You (Manager)" : "You"}
              partnerLabel={isManager ? session.partner.name : `${session.partner.name} (Manager)`}
            />
            <ConversationMoves currentMove={2} completed={[0, 1]} />
          </div>
        )}

        {tab === "post" && (
          <PostReflectForm prompts={postPrompts} role={isManager ? "manager" : "employee"} />
        )}

        {tab === "history" && <ReflectHistory />}
      </div>
    </div>
  );
}

function SessionStatusBanner({ accentColor }: { accentColor: string }) {
  const session = MOCK_NEXT_SESSION;
  const date = new Date(session.scheduledAt);
  const now = new Date();
  const diffHours = Math.round(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  return (
    <div
      className="rounded-xl border bg-background p-5 flex flex-wrap items-center gap-4"
      style={{ borderColor: `${accentColor}55` }}
    >
      <div
        className="flex size-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
      >
        <Brain className="size-5" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Next Reflect with {session.partner.name}
        </p>
        <p className="font-display text-lg font-semibold text-foreground">
          {date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
          })}{" "}
          —{" "}
          {date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          In about {Math.max(diffHours, 0)} hours · Triggered by{" "}
          {TRIGGER_LABELS[session.trigger].toLowerCase()}
        </p>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-medium"
        style={{
          backgroundColor: `${STATUS_COLORS[session.status]}1a`,
          color: STATUS_COLORS[session.status],
        }}
      >
        {STATUS_LABELS[session.status]}
      </span>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  detail,
  color,
}: {
  title: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </p>
      <p
        className="font-display text-base font-semibold leading-tight"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
        {detail}
      </p>
    </div>
  );
}

function PreparationLegend() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 flex items-start gap-3 text-xs text-muted-foreground">
      <ShieldCheck className="size-4 shrink-0 text-[#44aa99] mt-0.5" />
      <div className="space-y-1">
        <p>
          Both parties prepare independently and submit at least 24 hours
          before the conversation. Neither sees the other's responses until the
          map opens at the start of Reflect.
        </p>
        <p>
          Items marked <span className="text-[#aa8866] font-medium">Private</span> are visible only to you and never surface in the
          conversation map.
        </p>
      </div>
    </div>
  );
}

function ReflectHistory() {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Past Reflects
      </p>
      {MOCK_HISTORY.map((session) => {
        const date = new Date(session.scheduledAt);
        return (
          <div
            key={session.id}
            className="rounded-lg border border-border bg-background p-4 flex items-center gap-4"
          >
            <Clock className="size-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-semibold text-foreground">
                {date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                with {session.partner.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {TRIGGER_LABELS[session.trigger]} · {session.triggerDetail}
              </p>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${STATUS_COLORS[session.status]}1a`,
                color: STATUS_COLORS[session.status],
              }}
            >
              {STATUS_LABELS[session.status]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HrReflectView() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-[#44aa99]" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Reflect — HR Visibility
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Aggregate trigger and pattern visibility only. HR never sees raw
            preparation, conversation content, or post-Reflect text. Content
            visibility requires a defined safety escalation threshold.
          </p>
        </header>

        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Aggregate Signals (last 30 days)
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {HR_AGGREGATE_SIGNALS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-background p-4"
              >
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
                <p className="text-xs text-foreground mt-1">{s.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {s.delta}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background overflow-hidden">
          <header className="px-5 py-3 border-b border-border bg-muted/30">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Leadership Library Surfacing
            </h3>
            <p className="text-xs text-muted-foreground">
              Content automatically surfaced to managers when recurring
              patterns are detected.
            </p>
          </header>
          <div className="divide-y divide-border">
            {HR_LIBRARY_SURFACING.map((item) => (
              <div key={item.title} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.triggeringPattern}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  Surfaced to {item.surfacedTo} managers
                </span>
              </div>
            ))}
          </div>
        </section>

        <TriggersRouting />

        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Escalation Governance
          </p>
          <p className="leading-relaxed">
            HR can intervene only when defined safety thresholds are met or
            existing company policy requires action. Reflect must never become
            a shadow performance file. Intervention is tied to safety,
            repeated unresolved issues, or defined company escalation rules.
          </p>
        </div>
      </div>
    </div>
  );
}
