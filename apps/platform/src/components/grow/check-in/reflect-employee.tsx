"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { LikertScale } from "./likert-scale";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";

type ReflectEmployeeProps = {
  checkIn: any;
  onComplete: () => void;
};

type LikertDimension = {
  key: "heard" | "clarity" | "recognition" | "development" | "safety";
  question: string;
  lowLabel: string;
  highLabel: string;
};

const DIMENSIONS: LikertDimension[] = [
  {
    key: "heard",
    question: "How heard did you feel during this conversation?",
    lowLabel: "Not at all",
    highLabel: "Completely",
  },
  {
    key: "clarity",
    question:
      "How clear are you on what's expected of you and what success looks like?",
    lowLabel: "Not at all",
    highLabel: "Completely",
  },
  {
    key: "recognition",
    question:
      "How well did your manager recognize your contributions and effort?",
    lowLabel: "Not at all",
    highLabel: "Completely",
  },
  {
    key: "development",
    question:
      "Was the conversation focused on your growth and future, or on past performance?",
    lowLabel: "Past-focused",
    highLabel: "Growth-focused",
  },
  {
    key: "safety",
    question:
      "How safe did you feel being honest about challenges and concerns?",
    lowLabel: "Not safe",
    highLabel: "Fully safe",
  },
];

export function ReflectEmployee({
  checkIn,
  onComplete,
}: ReflectEmployeeProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCompleted = !!checkIn.employeeReflect?.completedAt;

  const [scores, setScores] = useState<Record<string, number | null>>({
    heard: checkIn.employeeReflect?.heard ?? null,
    clarity: checkIn.employeeReflect?.clarity ?? null,
    recognition: checkIn.employeeReflect?.recognition ?? null,
    development: checkIn.employeeReflect?.development ?? null,
    safety: checkIn.employeeReflect?.safety ?? null,
  });

  const allScoresSet = DIMENSIONS.every((d) => scores[d.key] !== null);

  const handleSubmit = async () => {
    if (!user || submitting || !allScoresSet) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/grow/check-ins/${checkIn._id}/reflect`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": user.id,
        },
        body: JSON.stringify({
          heard: scores.heard,
          clarity: scores.clarity,
          recognition: scores.recognition,
          development: scores.development,
          safety: scores.safety,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err.error ?? "Failed to submit reflection");
        return;
      }
      onComplete();
    } catch {
      setSubmitError("Failed to submit reflection");
    } finally {
      setSubmitting(false);
    }
  };

  // Read-only completed view
  if (isCompleted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 rounded-lg border border-[#44aa99]/30 bg-[#44aa99]/5 px-4 py-3">
          <CheckCircle2 className="size-4 text-[#44aa99]" />
          <span className="text-sm font-medium text-[#44aa99]">
            Reflection submitted
          </span>
        </div>

        <div className="space-y-4">
          {DIMENSIONS.map((dim) => (
            <div key={dim.key} className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                {dim.question}
              </p>
              <LikertScale
                value={scores[dim.key]}
                onChange={() => {}}
                lowLabel={dim.lowLabel}
                highLabel={dim.highLabel}
                disabled
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-[#cc6677]/30 bg-[#cc6677]/5 px-4 py-3">
        <Lock className="size-4 mt-0.5 text-[#cc6677] shrink-0" />
        <p className="text-sm text-[#cc6677]">
          Your responses are completely private — they are never shared with
          your manager.
        </p>
      </div>

      {/* Likert dimensions */}
      <div className="space-y-4">
        {DIMENSIONS.map((dim) => (
          <div key={dim.key} className="rounded-lg border bg-white p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              {dim.question}
            </p>
            <LikertScale
              value={scores[dim.key]}
              onChange={(v) =>
                setScores((prev) => ({ ...prev, [dim.key]: v }))
              }
              lowLabel={dim.lowLabel}
              highLabel={dim.highLabel}
            />
          </div>
        ))}
      </div>

      {/* Submit error */}
      {submitError && (
        <p className="text-sm text-[#cc6677]">{submitError}</p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !allScoresSet}
        className={cn(
          "w-full rounded-lg bg-[#44aa99] px-4 py-2.5 text-sm font-medium text-white transition-colors",
          "hover:bg-[#44aa99]/90 disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Reflection"
        )}
      </button>

      {!allScoresSet && (
        <p className="text-xs text-muted-foreground text-center">
          Please answer all questions to submit your reflection.
        </p>
      )}
    </div>
  );
}
