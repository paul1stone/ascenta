"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import {
  participateEmployeeSchema,
  type ParticipateEmployeeValues,
} from "@/lib/validations/check-in";
import { CommitmentApproval } from "./commitment-approval";
import {
  Loader2,
  MessageSquare,
  Lightbulb,
  Handshake,
  Users,
} from "lucide-react";

type ParticipateEmployeeProps = {
  checkIn: any;
  onSave: () => void;
  onComplete: () => void;
};

function getManagerName(checkIn: any): string {
  const m = checkIn.manager;
  if (m?.firstName && m?.lastName) return `${m.firstName} ${m.lastName}`;
  return m?.employeeId ?? "your manager";
}

export function ParticipateEmployee({
  checkIn,
  onSave,
  onComplete,
}: ParticipateEmployeeProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const managerName = getManagerName(checkIn);
  const managerCommitment = checkIn.participate?.managerCommitment;
  const employeeApprovedManager =
    checkIn.participate?.employeeApprovedManagerCommitment;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ParticipateEmployeeValues>({
    resolver: zodResolver(participateEmployeeSchema),
    defaultValues: {
      employeeOpening: checkIn.participate?.employeeOpening ?? "",
      employeeKeyTakeaways: checkIn.participate?.employeeKeyTakeaways ?? "",
      employeeCommitment: checkIn.participate?.employeeCommitment ?? "",
    },
  });

  const doSave = async (data: ParticipateEmployeeValues) => {
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

  const onSubmit = async (data: ParticipateEmployeeValues) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const ok = await doSave(data);
    setSubmitting(false);
    if (ok) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-[#6688bb]/30 bg-[#6688bb]/5 px-4 py-3">
        <Users className="size-4 mt-0.5 text-[#6688bb] shrink-0" />
        <p className="text-sm text-[#6688bb]">
          Your check-in with <span className="font-medium">{managerName}</span>{" "}
          is in progress.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Your Opening */}
        <SectionCard
          title="Your Opening"
          icon={<MessageSquare className="size-4 text-[#44aa99]" />}
          prompt="Share what's on your mind. What's most important for you to discuss?"
        >
          <textarea
            {...register("employeeOpening")}
            rows={3}
            className={cn(
              "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
              "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
              errors.employeeOpening &&
                "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
            )}
            placeholder="What's on your mind..."
          />
          {errors.employeeOpening && (
            <p className="text-xs text-[#cc6677]">
              {errors.employeeOpening.message}
            </p>
          )}
        </SectionCard>

        {/* Key Takeaways */}
        <SectionCard
          title="Key Takeaways"
          icon={<Lightbulb className="size-4 text-[#e8a735]" />}
          prompt="What are the most important things you're taking away from this conversation?"
        >
          <textarea
            {...register("employeeKeyTakeaways")}
            rows={3}
            className={cn(
              "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
              "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
              errors.employeeKeyTakeaways &&
                "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
            )}
            placeholder="Key takeaways from the discussion..."
          />
          {errors.employeeKeyTakeaways && (
            <p className="text-xs text-[#cc6677]">
              {errors.employeeKeyTakeaways.message}
            </p>
          )}
        </SectionCard>

        {/* Your Commitment */}
        <SectionCard
          title="Your Commitment"
          icon={<Handshake className="size-4 text-[#44aa99]" />}
          prompt="What do you commit to doing before the next check-in?"
        >
          <textarea
            {...register("employeeCommitment")}
            rows={3}
            className={cn(
              "w-full rounded-md border bg-muted/30 px-3 py-2 text-sm",
              "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#44aa99]/30 focus:border-[#44aa99]",
              errors.employeeCommitment &&
                "border-[#cc6677] focus:ring-[#cc6677]/30 focus:border-[#cc6677]",
            )}
            placeholder="Your commitment..."
          />
          {errors.employeeCommitment && (
            <p className="text-xs text-[#cc6677]">
              {errors.employeeCommitment.message}
            </p>
          )}

          {/* Manager's commitment approval */}
          {managerCommitment && (
            <div className="pt-3">
              <CommitmentApproval
                checkInId={checkIn._id}
                commitment={managerCommitment}
                authorRole="manager"
                approved={employeeApprovedManager}
                onApprovalChange={onComplete}
              />
            </div>
          )}
        </SectionCard>

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

function SectionCard({
  title,
  icon,
  prompt,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  prompt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{prompt}</p>
      {children}
    </div>
  );
}
