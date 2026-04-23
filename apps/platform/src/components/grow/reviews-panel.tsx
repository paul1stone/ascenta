"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@ascenta/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import {
  REVIEW_STATUS_LABELS,
  REVIEW_STEP_LABELS,
} from "@ascenta/db/performance-review-constants";
import { cn } from "@ascenta/ui";
import { useChat } from "@/lib/chat/chat-context";
import { useAuth } from "@/lib/auth/auth-context";
import { AlertCircle, Download, Users, Clock, CheckCircle, FileX } from "lucide-react";
import { ManagerAssessmentForm } from "./performance-reviews/manager-assessment-form";
import { DevelopmentPlanForm } from "./performance-reviews/development-plan-form";
import { GoalHandoffView } from "./performance-reviews/goal-handoff-view";
import type { ManagerAssessmentStatus } from "@ascenta/db/performance-review-categories";

interface ReviewEntry {
  employeeId: string;
  employeeObjectId: string;
  employeeName: string;
  department: string;
  goalCount: number;
  status: string;
  currentStep: string | null;
  reviewId: string | null;
  selfAssessmentStatus: string;
  managerAssessmentStatus: string;
  devPlanStatus: string;
  goalHandoffCompleted: boolean;
}

interface ReviewAggregates {
  directReports: number;
  notStarted: number;
  inProgress: number;
  finalized: number;
}

interface ReviewsPanelProps {
  pageKey: string;
  accentColor: string;
  onSwitchToDoTab?: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  not_started: { bg: "bg-orange-500/15", text: "text-orange-500" },
  in_progress: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  draft_complete: { bg: "bg-teal-500/15", text: "text-teal-500" },
  finalized: { bg: "bg-blue-500/15", text: "text-blue-500" },
  shared: { bg: "bg-gray-500/15", text: "text-gray-500" },
};

function getCurrentPeriod(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${quarter}`;
}

function getAvailablePeriods(): string[] {
  return ["Q1", "Q2", "Q3", "Q4", "H1", "H2", "annual"];
}

export function ReviewsPanel({ pageKey, accentColor, onSwitchToDoTab }: ReviewsPanelProps) {
  const { user, loading: authLoading } = useAuth();
  // /api/grow/reviews queries Employee.findOne({ employeeId: ... }), so we must
  // pass the EMP-style employeeId string here, not the Mongo ObjectId (user.id).
  const managerId = user?.employeeId ?? "";

  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [aggregates, setAggregates] = useState<ReviewAggregates>({
    directReports: 0,
    notStarted: 0,
    inProgress: 0,
    finalized: 0,
  });
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssessmentReviewId, setActiveAssessmentReviewId] = useState<string | null>(null);
  const [activePlanReviewId, setActivePlanReviewId] = useState<string | null>(null);
  const [activeHandoffReviewId, setActiveHandoffReviewId] = useState<string | null>(null);
  const { sendMessage } = useChat();

  const activeAssessmentReview = activeAssessmentReviewId
    ? (reviews.find((r) => r.reviewId === activeAssessmentReviewId) ?? null)
    : null;

  const activePlanReview = activePlanReviewId
    ? (reviews.find((r) => r.reviewId === activePlanReviewId) ?? null)
    : null;

  const activeHandoffReview = activeHandoffReviewId
    ? (reviews.find((r) => r.reviewId === activeHandoffReviewId) ?? null)
    : null;

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user?.id) headers["x-dev-user-id"] = user.id;
      const res = await fetch(
        `/api/grow/reviews?managerId=${managerId}&period=${period}`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAggregates(
          data.aggregates || { directReports: 0, notStarted: 0, inProgress: 0, finalized: 0 },
        );
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [managerId, period]);

  useEffect(() => {
    if (managerId && !authLoading) {
      fetchReviews();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [managerId, authLoading, fetchReviews]);

  const handleStartReview = (employeeName: string, employeeId: string) => {
    onSwitchToDoTab?.();
    sendMessage(
      pageKey,
      `Start a performance review for ${employeeName} (${employeeId}) for ${period}`,
      "startPerformanceReview",
    );
  };

  const handleContinueReview = (employeeName: string, reviewId: string) => {
    onSwitchToDoTab?.();
    sendMessage(
      pageKey,
      `Continue the performance review for ${employeeName} (review ID: ${reviewId})`,
    );
  };

  const handleDownloadPdf = (reviewId: string) => {
    window.open(`/api/grow/reviews/${reviewId}/pdf`, "_blank");
  };

  const [finalizeReviewError, setFinalizeReviewError] = useState<string | null>(null);

  const handleFinalizeReview = async (reviewId: string) => {
    setFinalizeReviewError(null);
    const res = await fetch(`/api/grow/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finalized" }),
    });
    if (res.ok) {
      fetchReviews();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setFinalizeReviewError(data.error ?? "Failed to finalize review. Please try again.");
    }
  };

  const dueWithin2Weeks = aggregates.notStarted > 0;

  if (activeAssessmentReview) {
    return (
      <ManagerAssessmentForm
        reviewId={activeAssessmentReview.reviewId!}
        employeeName={activeAssessmentReview.employeeName}
        reviewPeriod={period}
        initialStatus={activeAssessmentReview.managerAssessmentStatus as ManagerAssessmentStatus}
        accentColor={accentColor}
        onBack={() => setActiveAssessmentReviewId(null)}
        onSubmitted={() => {
          fetchReviews();
          setActiveAssessmentReviewId(null);
        }}
      />
    );
  }

  if (activePlanReview) {
    return (
      <DevelopmentPlanForm
        reviewId={activePlanReview.reviewId!}
        employeeName={activePlanReview.employeeName}
        reviewPeriod={period}
        accentColor={accentColor}
        onBack={() => setActivePlanReviewId(null)}
        onFinalized={() => {
          fetchReviews();
          setActivePlanReviewId(null);
        }}
      />
    );
  }

  if (activeHandoffReview) {
    return (
      <GoalHandoffView
        reviewId={activeHandoffReview.reviewId!}
        employeeName={activeHandoffReview.employeeName}
        reviewPeriod={period}
        accentColor={accentColor}
        onBack={() => setActiveHandoffReviewId(null)}
        onCompleted={() => {
          fetchReviews();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Nudge Banner */}
      {dueWithin2Weeks && (
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-3"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
            borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">
              <strong>{period} reviews:</strong> {aggregates.notStarted} of{" "}
              {aggregates.directReports} direct reports not started
            </span>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailablePeriods().map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Direct Reports", value: aggregates.directReports, icon: Users },
          {
            label: "Not Started",
            value: aggregates.notStarted,
            icon: FileX,
            highlight: aggregates.notStarted > 0,
          },
          { label: "In Progress", value: aggregates.inProgress, icon: Clock },
          { label: "Finalized", value: aggregates.finalized, icon: CheckCircle },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <stat.icon className="h-3 w-3" />
              {stat.label}
            </div>
            <div
              className={cn(
                "mt-1 text-2xl font-bold",
                stat.highlight && "text-orange-500",
              )}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Period Selector (when no banner) */}
      {!dueWithin2Weeks && (
        <div className="flex justify-end">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailablePeriods().map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Finalize review error */}
      {finalizeReviewError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {finalizeReviewError}
        </div>
      )}

      {/* Reviews Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Employee</th>
              <th className="px-3 py-2 text-left font-medium">Department</th>
              <th className="px-3 py-2 text-center font-medium">Goals</th>
              <th className="px-3 py-2 text-center font-medium">Status</th>
              <th className="px-3 py-2 text-center font-medium">Step</th>
              <th className="px-3 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No direct reports found.
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const colors = STATUS_COLORS[review.status] || STATUS_COLORS.not_started;
                return (
                  <tr key={review.employeeId} className="border-b last:border-0">
                    <td className="px-3 py-2.5 font-medium">{review.employeeName}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{review.department}</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">
                      {review.goalCount}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                          colors.bg,
                          colors.text,
                        )}
                      >
                        {REVIEW_STATUS_LABELS[
                          review.status as keyof typeof REVIEW_STATUS_LABELS
                        ] || review.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                      {review.currentStep
                        ? REVIEW_STEP_LABELS[
                            review.currentStep as keyof typeof REVIEW_STEP_LABELS
                          ]
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {review.status === "not_started" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          style={{ color: accentColor }}
                          onClick={() => handleStartReview(review.employeeName, review.employeeId)}
                        >
                          Start Review
                        </Button>
                      )}
                      {(review.status === "in_progress" ||
                        review.status === "draft_complete") && review.reviewId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          style={{ color: accentColor }}
                          onClick={() =>
                            handleContinueReview(review.employeeName, review.reviewId!)
                          }
                        >
                          Continue →
                        </Button>
                      )}
                      {review.status === "self_submitted" && review.reviewId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          style={{ color: accentColor }}
                          onClick={() => setActiveAssessmentReviewId(review.reviewId!)}
                        >
                          Begin Assessment
                        </Button>
                      )}
                      {review.status === "manager_in_progress" && review.reviewId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          style={{ color: accentColor }}
                          onClick={() => setActiveAssessmentReviewId(review.reviewId!)}
                        >
                          Continue Assessment →
                        </Button>
                      )}
                      {review.status === "draft_complete" && review.reviewId && (
                        review.devPlanStatus === "finalized" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            style={{ color: accentColor }}
                            onClick={() => handleFinalizeReview(review.reviewId!)}
                          >
                            Finalize Review →
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            style={{ color: accentColor }}
                            onClick={() => setActivePlanReviewId(review.reviewId!)}
                          >
                            {review.devPlanStatus === "draft" ? "Continue Dev Plan →" : "Complete Dev Plan"}
                          </Button>
                        )
                      )}
                      {(review.status === "finalized" || review.status === "shared") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleDownloadPdf(review.reviewId!)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          PDF
                        </Button>
                      )}
                      {review.status === "acknowledged" &&
                        !review.goalHandoffCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            style={{ color: accentColor }}
                            onClick={() =>
                              setActiveHandoffReviewId(review.reviewId!)
                            }
                          >
                            Plan next period →
                          </Button>
                        )}
                      {review.status === "acknowledged" &&
                        review.goalHandoffCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              setActiveHandoffReviewId(review.reviewId!)
                            }
                          >
                            View handoff
                          </Button>
                        )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
