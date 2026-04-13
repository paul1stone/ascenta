"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

type CommitmentApprovalProps = {
  checkInId: string;
  commitment: string;
  authorRole: "manager" | "employee";
  approved: boolean | null;
  onApprovalChange: () => void;
};

export function CommitmentApproval({
  checkInId,
  commitment,
  authorRole,
  approved,
  onApprovalChange,
}: CommitmentApprovalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const authorLabel = authorRole === "manager" ? "Manager" : "Employee";

  const handleApproval = async (approvedValue: boolean) => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/grow/check-ins/${checkInId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": user.id,
        },
        body: JSON.stringify({ approved: approvedValue }),
      });
      if (res.ok) {
        onApprovalChange();
      }
    } catch {
      console.error("Approval failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/10 p-4 space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {authorLabel}&apos;s Commitment
      </h4>
      <p className="text-sm text-foreground whitespace-pre-wrap">
        {commitment}
      </p>

      {approved === null && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleApproval(true)}
            disabled={submitting}
            className={cn(
              "rounded-md bg-[#44aa99] px-3 py-1.5 text-xs font-medium text-white transition-colors",
              "hover:bg-[#44aa99]/90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {submitting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              "Approve"
            )}
          </button>
          <button
            type="button"
            onClick={() => handleApproval(false)}
            disabled={submitting}
            className={cn(
              "rounded-md border border-[#cc6677]/30 bg-[#cc6677]/5 px-3 py-1.5 text-xs font-medium text-[#cc6677] transition-colors",
              "hover:bg-[#cc6677]/10 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            This isn&apos;t what we agreed on
          </button>
        </div>
      )}

      {approved === true && (
        <div className="flex items-center gap-1.5 text-sm text-[#44aa99]">
          <CheckCircle2 className="size-3.5" />
          <span className="font-medium">Approved</span>
        </div>
      )}

      {approved === false && (
        <div className="flex items-center gap-1.5 text-sm text-[#cc6677]">
          <AlertTriangle className="size-3.5" />
          <span className="font-medium">Flagged — needs revision</span>
        </div>
      )}
    </div>
  );
}
