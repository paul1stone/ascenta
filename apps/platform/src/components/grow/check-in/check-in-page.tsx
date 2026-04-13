"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Loader2, MessageCircle, Calendar } from "lucide-react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { PhaseStepper } from "./phase-stepper";
import { PrepareEmployee } from "./prepare-employee";
import { PrepareManager } from "./prepare-manager";
import { ParticipateManager } from "./participate-manager";
import { ParticipateEmployee } from "./participate-employee";
import { ReflectEmployee } from "./reflect-employee";
import { ReflectManager } from "./reflect-manager";
import { GapSignals } from "./gap-signals";
import {
  CHECKIN_STATUS_LABELS,
  type CheckInStatus,
  type CheckInDetailView,
  type PopulatedRef,
} from "@ascenta/db/checkin-constants";

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

const STATUS_DOT_COLORS: Record<CheckInStatus, string> = {
  preparing: "#44aa99",
  ready: "#6688bb",
  in_progress: "#6688bb",
  reflecting: "#cc6677",
  completed: "#555",
  missed: "#e8a735",
  cancelled: "#888",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPersonName(ref: PopulatedRef): string {
  if (ref.firstName && ref.lastName) return `${ref.firstName} ${ref.lastName}`;
  return ref.employeeId ?? "Unknown";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// CheckInPage
// ---------------------------------------------------------------------------

export function CheckInPage({ checkInId }: { checkInId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const [checkIn, setCheckIn] = useState<CheckInDetailView | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/grow/check-ins/${checkInId}`, {
        headers: { "x-dev-user-id": user.id },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setError("Check-in not found");
        } else {
          setError("Failed to load check-in");
        }
        return;
      }
      const data = await res.json();
      setCheckIn(data.checkIn);
      setRole(data.role);
    } catch {
      setError("Failed to load check-in");
    } finally {
      setLoading(false);
    }
  }, [checkInId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (!user || loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error || !checkIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <MessageCircle className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          {error ?? "Check-in Not Found"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          This check-in may not exist or you may not have access to it.
        </p>
        <button
          onClick={() => router.push("/grow/performance")}
          className="text-sm font-medium text-[#44aa99] hover:text-[#44aa99]/80 transition-colors"
        >
          Back to Check-ins
        </button>
      </div>
    );
  }

  const isManager = role === "manager";
  const otherParty = isManager ? checkIn.employee : checkIn.manager;
  const otherPartyName = getPersonName(otherParty);
  const goalsList = checkIn.goals
    .map((g) => g.objectiveStatement)
    .filter(Boolean);

  const isCancelled = checkIn.status === "cancelled";
  const isMissed = checkIn.status === "missed";
  const isTerminal = isCancelled || isMissed;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => router.push("/grow/performance")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to Check-ins
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-xl font-bold text-deep-blue">
              Check-in with {otherPartyName}
            </h1>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${STATUS_DOT_COLORS[checkIn.status]}1a`,
                color: STATUS_DOT_COLORS[checkIn.status],
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: STATUS_DOT_COLORS[checkIn.status] }}
              />
              {CHECKIN_STATUS_LABELS[checkIn.status]}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formatDate(checkIn.scheduledAt)}
            </span>
            {goalsList.length > 0 && (
              <span className="truncate max-w-[400px]">
                {goalsList.length === 1
                  ? goalsList[0]
                  : `${goalsList.length} goals`}
              </span>
            )}
          </div>
        </div>

        {/* Stepper */}
        {!isTerminal && <PhaseStepper status={checkIn.status} />}

        {/* Terminal status banner */}
        {isTerminal && (
          <div
            className={cn(
              "rounded-lg border px-4 py-3 mb-8 text-sm",
              isMissed
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-border bg-muted/50 text-muted-foreground",
            )}
          >
            {isMissed
              ? "This check-in was missed. It was not completed by the scheduled date."
              : "This check-in was cancelled."}
          </div>
        )}

        {/* Phase content */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {checkIn.status === "preparing" && !isManager && (
            <PrepareEmployee checkIn={checkIn} onComplete={refreshData} />
          )}
          {checkIn.status === "preparing" && isManager && (
            <PrepareManager checkIn={checkIn} onComplete={refreshData} />
          )}
          {(checkIn.status === "ready" || checkIn.status === "in_progress") &&
            isManager && (
              <ParticipateManager
                checkIn={checkIn}
                onSave={refreshData}
                onComplete={refreshData}
              />
            )}
          {(checkIn.status === "ready" || checkIn.status === "in_progress") &&
            !isManager && (
              <ParticipateEmployee
                checkIn={checkIn}
                onSave={refreshData}
                onComplete={refreshData}
              />
            )}
          {checkIn.status === "reflecting" && !isManager && (
            <ReflectEmployee checkIn={checkIn} onComplete={refreshData} />
          )}
          {checkIn.status === "reflecting" && isManager && (
            <ReflectManager checkIn={checkIn} onComplete={refreshData} />
          )}
          {checkIn.status === "completed" && isManager && checkIn.gapSignals && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Gap Signals
              </h3>
              <GapSignals gaps={checkIn.gapSignals} />
            </div>
          )}
          {checkIn.status === "completed" && !isManager && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-12 rounded-full bg-[#44aa99]/10 flex items-center justify-center mb-3">
                <MessageCircle className="size-6 text-[#44aa99]" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                Check-in Complete
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                This check-in has been completed. Thank you for your
                participation and reflection.
              </p>
            </div>
          )}
          {isTerminal && (
            <div className="text-sm text-muted-foreground">
              No additional details to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
