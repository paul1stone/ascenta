"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import {
  participateManagerSchema,
  type ParticipateManagerValues,
} from "@/lib/validations/check-in";
import { AiAssistButton } from "./ai-assist-button";
import { CommitmentApproval } from "./commitment-approval";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Handshake,
  Star,
  TrendingUp,
  BarChart3,
  AlertCircle,
  FileText,
} from "lucide-react";

type ParticipateManagerProps = {
  checkIn: any;
  onSave: () => void;
  onComplete: () => void;
};

export function ParticipateManager({
  checkIn,
  onSave,
  onComplete,
}: ParticipateManagerProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prepExpanded, setPrepExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ParticipateManagerValues>({
    resolver: zodResolver(participateManagerSchema),
    defaultValues: {
      stuckPointDiscussion: checkIn.participate?.stuckPointDiscussion ?? "",
      recognition: checkIn.participate?.recognition ?? "",
      development: checkIn.participate?.development ?? "",
      performance: checkIn.participate?.performance ?? "",
      managerCommitment: checkIn.participate?.managerCommitment ?? "",
    },
  });

  const employeeOpening = checkIn.participate?.employeeOpening;
  const employeeCommitment = checkIn.participate?.employeeCommitment;
  const managerApprovedEmployee =
    checkIn.participate?.managerApprovedEmployeeCommitment;

  const doSave = async (data: ParticipateManagerValues) => {
    if (!user) return false;
    try {
      const res = await fetch(
        `/api/grow/check-ins/${checkIn._id}/participate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-dev-user-id": user.id,
          },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err.error ?? "Failed to save");
        return false;
      }
      return true;
    } catch {
      setSubmitError("Failed to save");
      return false;
    }
  };

  const handleSaveDraft = async () => {
    if (saving) return;
    setSaving(true);
    setSubmitError(null);
    const values = getValues();
    const ok = await doSave(values);
    setSaving(false);
    if (ok) onSave();
  };

  const onSubmit = async (data: ParticipateManagerValues) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const ok = await doSave(data);
    setSubmitting(false);
    if (ok) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Collapsible prep notes */}
      {checkIn.managerPrepare?.completedAt && (
        <div className="rounded-lg border border-[#44aa99]/30 bg-[#44aa99]/5">
          <button
            type="button"
            onClick={() => setPrepExpanded(!prepExpanded)}
            className="flex items-center justify-between w-full px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-[#44aa99]" />
              <span className="text-sm font-medium text-foreground">
                Your Preparation Notes
              </span>
            </div>
            {prepExpanded ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
          {prepExpanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-[#44aa99]/20 pt-3">
              {checkIn.managerPrepare.openingMove && (
                <PrepNote
                  label="Opening Move"
                  text={checkIn.managerPrepare.openingMove}
                />
              )}
              {checkIn.managerPrepare.recognitionNote && (
                <PrepNote
                  label="Recognition"
                  text={checkIn.managerPrepare.recognitionNote}
                />
              )}
              {checkIn.managerPrepare.developmentalFocus && (
                <PrepNote
                  label="Development"
                  text={checkIn.managerPrepare.developmentalFocus}
                />
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Move 1: Open with Employee */}
        <MoveCard
          moveNumber={1}
          title="Open with Employee"
          icon={<MessageSquare className="size-4" />}
        >
          {employeeOpening ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Employee&apos;s Opening
              </p>
              <p className="text-sm text-foreground bg-muted/30 rounded-md px-3 py-2 border">
                {employeeOpening}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Employee hasn&apos;t shared their opening yet.
            </p>
          )}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your Response Notes
              </p>
              <AiAssistButton
                checkInId={checkIn._id}
                field="opener"
                onSuggestion={(text) => setValue("stuckPointDiscussion", text)}
              />
            </div>
          </div>
        </MoveCard>

        {/* Move 2: Address Stuck Point */}
        <MoveCard
          moveNumber={2}
          title="Address Stuck Point"
          icon={<AlertCircle className="size-4" />}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              What came up around blockers or stuck points? How can you help?
            </p>
            <AiAssistButton
              checkInId={checkIn._id}
              field="coaching"
              onSuggestion={(text) => setValue("stuckPointDiscussion", text)}
            />
          </div>
          <textarea
            {...register("stuckPointDiscussion")}
            rows={3}
            className={cn(
              "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
              "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
              errors.stuckPointDiscussion &&
                "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
            )}
            placeholder="Notes on stuck points discussed..."
          />
          {errors.stuckPointDiscussion && (
            <p className="text-xs text-[#cc6677]">
              {errors.stuckPointDiscussion.message}
            </p>
          )}
        </MoveCard>

        {/* Move 3: Recognition, Development, Performance */}
        <MoveCard
          moveNumber={3}
          title="Recognition, Development, Performance"
          icon={<Star className="size-4" />}
        >
          {/* Recognition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="size-3.5 text-[#e8a735]" />
                <span className="text-sm font-medium text-foreground">
                  Recognition
                </span>
              </div>
              <AiAssistButton
                checkInId={checkIn._id}
                field="recognition"
                onSuggestion={(text) => setValue("recognition", text)}
              />
            </div>
            <textarea
              {...register("recognition")}
              rows={3}
              className={cn(
                "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
                errors.recognition &&
                  "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
              )}
              placeholder="Specific recognition..."
            />
            {errors.recognition && (
              <p className="text-xs text-[#cc6677]">
                {errors.recognition.message}
              </p>
            )}
          </div>

          {/* Development */}
          <div className="space-y-2 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-[#44aa99]" />
                <span className="text-sm font-medium text-foreground">
                  Development
                </span>
              </div>
              <AiAssistButton
                checkInId={checkIn._id}
                field="development"
                onSuggestion={(text) => setValue("development", text)}
              />
            </div>
            <textarea
              {...register("development")}
              rows={3}
              className={cn(
                "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
                errors.development &&
                  "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
              )}
              placeholder="Growth opportunities discussed..."
            />
            {errors.development && (
              <p className="text-xs text-[#cc6677]">
                {errors.development.message}
              </p>
            )}
          </div>

          {/* Performance (optional, de-emphasized) */}
          <div className="space-y-2 pt-3 opacity-75">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Performance (optional)
              </span>
            </div>
            <textarea
              {...register("performance")}
              rows={2}
              className={cn(
                "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
              )}
              placeholder="Performance notes (optional)..."
            />
          </div>
        </MoveCard>

        {/* Move 4: Mutual Commitment */}
        <MoveCard
          moveNumber={4}
          title="Mutual Commitment"
          icon={<Handshake className="size-4" />}
        >
          {/* Manager commitment */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Your Commitment
            </p>
            <textarea
              {...register("managerCommitment")}
              rows={3}
              className={cn(
                "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
                errors.managerCommitment &&
                  "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
              )}
              placeholder="What do you commit to before the next check-in?"
            />
            {errors.managerCommitment && (
              <p className="text-xs text-[#cc6677]">
                {errors.managerCommitment.message}
              </p>
            )}
          </div>

          {/* Employee commitment approval */}
          {employeeCommitment && (
            <div className="pt-3">
              <CommitmentApproval
                checkInId={checkIn._id}
                commitment={employeeCommitment}
                authorRole="employee"
                approved={managerApprovedEmployee}
                onApprovalChange={onComplete}
              />
            </div>
          )}
        </MoveCard>

        {/* Submit error */}
        {submitError && (
          <p className="text-sm text-[#cc6677]">{submitError}</p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || submitting}
            className={cn(
              "flex-1 rounded-lg border border-[#44aa99]/30 bg-white px-4 py-2.5 text-sm font-medium text-[#44aa99] transition-colors",
              "hover:bg-[#44aa99]/5 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Draft"
            )}
          </button>
          <button
            type="submit"
            disabled={saving || submitting}
            className={cn(
              "flex-1 rounded-lg bg-[#44aa99] px-4 py-2.5 text-sm font-medium text-white transition-colors",
              "hover:bg-[#44aa99]/90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MoveCard({
  moveNumber,
  title,
  icon,
  children,
}: {
  moveNumber: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center size-5 rounded-full bg-[#44aa99]/10 text-[#44aa99] text-xs font-bold">
          {moveNumber}
        </span>
        <span className="text-[#44aa99]">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PrepNote({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{text}</p>
    </div>
  );
}
