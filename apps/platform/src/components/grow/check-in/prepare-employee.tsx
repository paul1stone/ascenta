"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import {
  employeePrepareSchema,
  type EmployeePrepareValues,
} from "@/lib/validations/check-in";
import { Clock, Lock, CheckCircle2, Target, Loader2 } from "lucide-react";

type PrepareEmployeeProps = {
  checkIn: any;
  onComplete: () => void;
};

function formatDeadline(scheduledAt: string): string {
  const deadline = new Date(new Date(scheduledAt).getTime() - 24 * 60 * 60 * 1000);
  return deadline.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PrepareEmployee({ checkIn, onComplete }: PrepareEmployeeProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCompleted = !!checkIn.employeePrepare?.completedAt;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeePrepareValues>({
    resolver: zodResolver(employeePrepareSchema),
    defaultValues: {
      progressReflection: checkIn.employeePrepare?.progressReflection ?? "",
      stuckPointReflection: checkIn.employeePrepare?.stuckPointReflection ?? "",
      conversationIntent: checkIn.employeePrepare?.conversationIntent ?? "",
    },
  });

  const goalNames = (checkIn.goals ?? [])
    .map((g: any) => g.objectiveStatement)
    .filter(Boolean);

  const onSubmit = async (data: EmployeePrepareValues) => {
    if (!user || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/grow/check-ins/${checkIn._id}/prepare`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": user.id,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err.error ?? "Failed to submit preparation");
        return;
      }
      onComplete();
    } catch {
      setSubmitError("Failed to submit preparation");
    } finally {
      setSubmitting(false);
    }
  };

  // Read-only completed view
  if (isCompleted) {
    return (
      <div className="space-y-6">
        {/* Completed badge */}
        <div className="flex items-center gap-2 rounded-lg border border-[#44aa99]/30 bg-[#44aa99]/5 px-4 py-3">
          <CheckCircle2 className="size-4 text-[#44aa99]" />
          <span className="text-sm font-medium text-[#44aa99]">
            Preparation complete
          </span>
        </div>

        {/* Read-only reflections */}
        <div className="space-y-4">
          <ReadOnlyCard
            title="Progress Reflection"
            content={checkIn.employeePrepare.progressReflection}
          />
          <ReadOnlyCard
            title="Stuck Point Reflection"
            content={checkIn.employeePrepare.stuckPointReflection}
          />
          <ReadOnlyCard
            title="Conversation Intent"
            content={checkIn.employeePrepare.conversationIntent}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-[#44aa99]/30 bg-[#44aa99]/5 px-4 py-3">
        <Lock className="size-4 mt-0.5 text-[#44aa99] shrink-0" />
        <p className="text-sm text-[#44aa99]">
          Your preparation is private — only a brief summary will be shared with
          your manager.
        </p>
      </div>

      {/* Deadline */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-3.5" />
        <span>
          Prepare by{" "}
          <span className="font-medium text-foreground">
            {formatDeadline(checkIn.scheduledAt)}
          </span>
        </span>
      </div>

      {/* Linked goals */}
      {goalNames.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Linked Goals</h3>
          <div className="space-y-1.5">
            {goalNames.map((name: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Target className="size-3.5 text-[#44aa99] shrink-0" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Progress Reflection */}
        <TextareaCard
          title="Progress Reflection"
          prompt="Think about the goals linked to this check-in. What progress have you made? What are you most proud of?"
          goalNames={goalNames}
          register={register("progressReflection")}
          error={errors.progressReflection?.message}
        />

        {/* Stuck Point Reflection */}
        <TextareaCard
          title="Stuck Point Reflection"
          prompt="Where are you feeling stuck or blocked? What would help you move forward?"
          register={register("stuckPointReflection")}
          error={errors.stuckPointReflection?.message}
        />

        {/* Conversation Intent */}
        <TextareaCard
          title="Conversation Intent"
          prompt="What do you most want to get out of this conversation with your manager?"
          register={register("conversationIntent")}
          error={errors.conversationIntent?.message}
        />

        {/* Submit error */}
        {submitError && (
          <p className="text-sm text-[#cc6677]">{submitError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
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
            "Submit Preparation"
          )}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TextareaCard({
  title,
  prompt,
  goalNames,
  register,
  error,
}: {
  title: string;
  prompt: string;
  goalNames?: string[];
  register: any;
  error?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{prompt}</p>
      {goalNames && goalNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {goalNames.map((name: string, i: number) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-[#44aa99]/10 px-2.5 py-0.5 text-xs text-[#44aa99]"
            >
              <Target className="size-3" />
              {name}
            </span>
          ))}
        </div>
      )}
      <textarea
        {...register}
        rows={4}
        className={cn(
          "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
          "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
          error && "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
        )}
        placeholder="Write your thoughts..."
      />
      {error && <p className="text-xs text-[#cc6677]">{error}</p>}
    </div>
  );
}

function ReadOnlyCard({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {content ?? "—"}
      </p>
    </div>
  );
}
