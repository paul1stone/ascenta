"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Lightbulb,
  PenLine,
  Target,
  Workflow,
} from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  TODAYS_EMPLOYEE_WORKOUT,
  TODAYS_MANAGER_WORKOUT,
  type DailyWorkout as DailyWorkoutType,
  type Lane,
  LANE_COLORS,
} from "./mock-data";

type Step = "principle" | "skill" | "teach" | "example" | "application" | "quiz" | "reflection";

const STEPS: { key: Step; label: string; icon: typeof Dumbbell }[] = [
  { key: "principle", label: "Principle", icon: Lightbulb },
  { key: "skill", label: "Skill", icon: Target },
  { key: "teach", label: "Teach", icon: BookOpen },
  { key: "example", label: "Example", icon: Workflow },
  { key: "application", label: "Apply", icon: Dumbbell },
  { key: "quiz", label: "Quiz", icon: CheckCircle2 },
  { key: "reflection", label: "Reflect", icon: PenLine },
];

type DailyWorkoutProps = {
  lane: Lane;
};

export function DailyWorkout({ lane }: DailyWorkoutProps) {
  const workout: DailyWorkoutType =
    lane === "manager" ? TODAYS_MANAGER_WORKOUT : TODAYS_EMPLOYEE_WORKOUT;
  const [step, setStep] = useState<Step>("principle");
  const [completed, setCompleted] = useState<Step[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [reflection, setReflection] = useState("");

  const accent = LANE_COLORS[lane];
  const currentIndex = STEPS.findIndex((s) => s.key === step);

  const advance = () => {
    if (!completed.includes(step)) {
      setCompleted((prev) => [...prev, step]);
    }
    const next = STEPS[Math.min(currentIndex + 1, STEPS.length - 1)];
    setStep(next.key);
  };

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-border bg-background p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Day {workout.day} · {workout.category}
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground mt-1">
              Today&apos;s Workout
            </h2>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ backgroundColor: `${accent}1a`, color: accent }}
          >
            <Flame className="size-4" />
            <span className="text-sm font-semibold">14-day streak</span>
          </div>
        </div>

        <Stepper
          steps={STEPS}
          current={step}
          completed={completed}
          accent={accent}
          onSelect={setStep}
        />
      </header>

      <div className="rounded-2xl border border-border bg-background p-6 min-h-[320px]">
        {step === "principle" && (
          <SectionCard
            title="Principle"
            icon={Lightbulb}
            accent={accent}
            description={workout.principle}
            footnote="Source: Leadership Library"
          />
        )}

        {step === "skill" && (
          <SectionCard
            title="Defined Skill"
            icon={Target}
            accent={accent}
            description={workout.skill}
            footnote="The specific behavior you&apos;ll train today."
          />
        )}

        {step === "teach" && (
          <SectionCard
            title="Teach (2–4 min read)"
            icon={BookOpen}
            accent={accent}
            description={workout.teach}
          />
        )}

        {step === "example" && (
          <SectionCard
            title="Real-World Example"
            icon={Workflow}
            accent={accent}
            description={workout.example}
          />
        )}

        {step === "application" && (
          <SectionCard
            title="Apply It Today"
            icon={Dumbbell}
            accent={accent}
            description={workout.application}
            footnote="Try this within the next 24 hours."
          />
        )}

        {step === "quiz" && (
          <Quiz
            questions={workout.quiz}
            answers={quizAnswers}
            onAnswer={(qid, idx) =>
              setQuizAnswers((prev) => ({ ...prev, [qid]: idx }))
            }
          />
        )}

        {step === "reflection" && (
          <div className="space-y-3">
            <SectionHeader
              title="Reflection"
              icon={PenLine}
              accent={accent}
            />
            <p className="text-sm text-foreground italic">{workout.reflection}</p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="A sentence or two is enough."
              className="min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6688bb]/30"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            const prev = STEPS[Math.max(currentIndex - 1, 0)];
            setStep(prev.key);
          }}
        >
          Back
        </button>
        <button
          onClick={advance}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {step === "reflection"
            ? completed.includes("reflection")
              ? "Workout complete"
              : "Complete workout"
            : "Next"}
        </button>
      </div>
    </div>
  );
}

function Stepper({
  steps,
  current,
  completed,
  accent,
  onSelect,
}: {
  steps: { key: Step; label: string; icon: typeof Dumbbell }[];
  current: Step;
  completed: Step[];
  accent: string;
  onSelect: (s: Step) => void;
}) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((s, idx) => {
        const isCurrent = s.key === current;
        const isDone = completed.includes(s.key);
        const Icon = s.icon;
        return (
          <li
            key={s.key}
            className="flex items-center gap-1 flex-1 min-w-fit"
          >
            <button
              onClick={() => onSelect(s.key)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                isCurrent
                  ? "text-white"
                  : isDone
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{
                backgroundColor: isCurrent ? accent : isDone ? `${accent}1a` : "transparent",
              }}
            >
              {isDone ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <Icon className="size-3.5" />
              )}
              {s.label}
            </button>
            {idx < steps.length - 1 && (
              <span className="h-px w-4 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  accent,
}: {
  title: string;
  icon: typeof Dumbbell;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div
        className="flex size-8 items-center justify-center rounded-md"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <Icon className="size-4" />
      </div>
      <h3 className="font-display text-base font-semibold text-foreground">
        {title}
      </h3>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  accent,
  description,
  footnote,
}: {
  title: string;
  icon: typeof Dumbbell;
  accent: string;
  description: string;
  footnote?: string;
}) {
  return (
    <div className="space-y-3">
      <SectionHeader title={title} icon={icon} accent={accent} />
      <p className="text-base text-foreground leading-relaxed">{description}</p>
      {footnote && (
        <p className="text-xs text-muted-foreground italic">{footnote}</p>
      )}
    </div>
  );
}

function Quiz({
  questions,
  answers,
  onAnswer,
}: {
  questions: { id: string; question: string; options: string[]; correctIndex: number; rationale: string }[];
  answers: Record<string, number>;
  onAnswer: (qid: string, idx: number) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Quiz" icon={CheckCircle2} accent="#44aa99" />
      {questions.map((q, qi) => {
        const selected = answers[q.id];
        return (
          <div key={q.id} className="space-y-3">
            <p className="text-sm font-display font-semibold text-foreground">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === q.correctIndex;
                const showResult = selected !== undefined;
                return (
                  <button
                    key={idx}
                    onClick={() => onAnswer(q.id, idx)}
                    className={cn(
                      "w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors flex items-start gap-3",
                      !showResult && isSelected && "border-foreground bg-muted/40",
                      !showResult && !isSelected && "border-border hover:border-foreground/30",
                      showResult && isCorrect && "border-[#44aa99] bg-[#44aa99]/10",
                      showResult && !isCorrect && isSelected && "border-[#cc6677] bg-[#cc6677]/10",
                      showResult && !isCorrect && !isSelected && "border-border opacity-60"
                    )}
                  >
                    {showResult ? (
                      isCorrect ? (
                        <CheckCircle2 className="size-4 text-[#44aa99] mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      )
                    ) : (
                      <Circle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {selected !== undefined && (
              <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Why: </span>
                {q.rationale}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
