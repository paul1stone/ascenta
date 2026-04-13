"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { AiAssistButton } from "./ai-assist-button";
import { GapSignals } from "./gap-signals";
import { getGapLevel } from "@/lib/check-in/gap-engine";
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Clock,
  FileText,
} from "lucide-react";

type PrepareManagerProps = {
  checkIn: any;
  onComplete: () => void;
};

export function PrepareManager({ checkIn, onComplete }: PrepareManagerProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [openingMove, setOpeningMove] = useState(
    checkIn.managerPrepare?.openingMove ?? "",
  );
  const [recognitionNote, setRecognitionNote] = useState(
    checkIn.managerPrepare?.recognitionNote ?? "",
  );
  const [developmentalFocus, setDevelopmentalFocus] = useState(
    checkIn.managerPrepare?.developmentalFocus ?? "",
  );

  const isCompleted = !!checkIn.managerPrepare?.completedAt;

  // Previous check-in data (populated)
  const prev = checkIn.previousCheckInId;
  const prevForwardAction = prev?.managerReflect?.forwardAction;
  const distilledPreview = checkIn.employeePrepare?.distilledPreview;
  const employeePrepDone = !!checkIn.employeePrepare?.completedAt;

  // Gap recovery: check if previous check-in has any dimension with |delta| >= 2
  const prevGaps = prev?.gapSignals;
  const hasGapRecovery =
    prevGaps &&
    prevGaps.generatedAt &&
    ["clarity", "recognition", "development", "safety"].some(
      (dim) => getGapLevel(prevGaps[dim]) === "gap",
    );

  const gapDimensions = hasGapRecovery
    ? ["clarity", "recognition", "development", "safety"].filter(
        (dim) => getGapLevel(prevGaps[dim]) === "gap",
      )
    : [];

  const handleSubmit = async () => {
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
        body: JSON.stringify({
          openingMove: openingMove || null,
          recognitionNote: recognitionNote || null,
          developmentalFocus: developmentalFocus || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err.error ?? "Failed to complete preparation");
        return;
      }
      onComplete();
    } catch {
      setSubmitError("Failed to complete preparation");
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
            Preparation complete
          </span>
        </div>

        <div className="space-y-4">
          <ReadOnlyCard title="Opening Move" content={openingMove} />
          <ReadOnlyCard title="Recognition Prep" content={recognitionNote} />
          <ReadOnlyCard title="Developmental Focus" content={developmentalFocus} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* M-1: Context Briefing */}
      <div className="rounded-lg border-2 border-[#44aa99]/40 bg-[#44aa99]/5 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-[#44aa99]" />
          <h3 className="text-sm font-semibold text-foreground">
            Context Briefing
          </h3>
        </div>

        {/* Previous forward action */}
        {prevForwardAction && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Your forward action from last check-in
            </p>
            <p className="text-sm text-foreground bg-white/60 rounded-md px-3 py-2 border border-[#44aa99]/20">
              {prevForwardAction}
            </p>
          </div>
        )}

        {/* Employee distilled preview */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Employee preparation preview
          </p>
          {employeePrepDone && distilledPreview ? (
            <p className="text-sm text-foreground bg-white/60 rounded-md px-3 py-2 border border-[#44aa99]/20">
              {distilledPreview}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/40 rounded-md px-3 py-2 border border-border">
              <Clock className="size-3.5" />
              Waiting for employee preparation...
            </div>
          )}
        </div>
      </div>

      {/* M-6: Gap Recovery (conditional) */}
      {hasGapRecovery && (
        <div className="rounded-lg border-2 border-[#cc6677]/30 bg-[#cc6677]/5 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-[#cc6677]" />
            <h3 className="text-sm font-semibold text-foreground">
              Gap Recovery
            </h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Your last check-in showed a perception gap in{" "}
            <span className="font-medium text-[#cc6677]">
              {gapDimensions.join(", ")}
            </span>
            . Consider opening with warmth and genuine curiosity. Ask how
            they&apos;re feeling, and listen before diving into goals.
          </p>

          <GapSignals gaps={prevGaps} />
        </div>
      )}

      {/* Conversation Toolkit */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#44aa99]" />
          <h3 className="text-sm font-semibold text-foreground">
            Conversation Toolkit
          </h3>
        </div>

        {/* M-2: Opening Move */}
        <ToolkitCard
          title="Opening Move"
          prompt="How will you open this check-in? Consider referencing your forward action and the employee's preparation."
          value={openingMove}
          onChange={setOpeningMove}
          aiField="openingMove"
          checkInId={checkIn._id}
        />

        {/* M-3: Recognition Prep */}
        <ToolkitCard
          title="Recognition Prep"
          prompt="What specific contribution or behavior do you want to recognize?"
          value={recognitionNote}
          onChange={setRecognitionNote}
          aiField="recognition"
          checkInId={checkIn._id}
        />

        {/* M-4: Developmental Focus */}
        <ToolkitCard
          title="Developmental Focus"
          prompt="What growth opportunity or development area will you explore together?"
          value={developmentalFocus}
          onChange={setDevelopmentalFocus}
          aiField="development"
          checkInId={checkIn._id}
        />
      </div>

      {/* Submit error */}
      {submitError && (
        <p className="text-sm text-[#cc6677]">{submitError}</p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className={cn(
          "w-full rounded-lg bg-[#44aa99] px-4 py-2.5 text-sm font-medium text-white transition-colors",
          "hover:bg-[#44aa99]/90 disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </span>
        ) : (
          "Mark Preparation Complete"
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToolkitCard({
  title,
  prompt,
  value,
  onChange,
  aiField,
  checkInId,
}: {
  title: string;
  prompt: string;
  value: string;
  onChange: (v: string) => void;
  aiField: string;
  checkInId: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <AiAssistButton
          checkInId={checkInId}
          field={aiField}
          onSuggestion={(text) => onChange(text)}
        />
      </div>
      <p className="text-sm text-muted-foreground">{prompt}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={cn(
          "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
          "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
        )}
        placeholder="Write your notes..."
      />
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
        {content || "—"}
      </p>
    </div>
  );
}
