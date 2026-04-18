"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@ascenta/ui";
import { Clock, CheckCircle, FileX, ChevronRight } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import type { ComponentType } from "react";
import type { SelfAssessmentStatus } from "@ascenta/db/performance-review-categories";
import { SelfAssessmentForm } from "./self-assessment-form";
import { AcknowledgmentView } from "./acknowledgment-view";

interface ReviewSummary {
  id: string;
  employeeName: string;
  reviewPeriod: string;
  reviewType: string;
  selfAssessmentStatus: SelfAssessmentStatus;
  status: string;
}

interface SelfAssessmentPanelProps {
  employeeObjectId: string;
  employeeName: string;
  accentColor: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  not_started: {
    label: "Not Started",
    bg: "bg-orange-500/15",
    text: "text-orange-500",
    icon: FileX,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-teal-500/15",
    text: "text-teal-600",
    icon: Clock,
  },
  submitted: {
    label: "Submitted",
    bg: "bg-blue-500/15",
    text: "text-blue-600",
    icon: CheckCircle,
  },
  finalized: {
    label: "Ready to Review",
    bg: "bg-blue-500/15",
    text: "text-blue-600",
    icon: CheckCircle,
  },
  acknowledged: {
    label: "Acknowledged",
    bg: "bg-gray-500/15",
    text: "text-gray-500",
    icon: CheckCircle,
  },
};

export function SelfAssessmentPanel({
  employeeObjectId,
  employeeName,
  accentColor,
}: SelfAssessmentPanelProps) {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [activeAckReviewId, setActiveAckReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/grow/reviews?employeeObjectId=${encodeURIComponent(employeeObjectId)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [employeeObjectId]);

  useEffect(() => {
    if (employeeObjectId) fetchReviews();
  }, [employeeObjectId, fetchReviews]);

  const activeReview = reviews.find((r) => r.id === activeReviewId) ?? null;
  const activeAckReview = reviews.find((r) => r.id === activeAckReviewId) ?? null;

  if (activeAckReview) {
    return (
      <AcknowledgmentView
        reviewId={activeAckReview.id}
        employeeName={activeAckReview.employeeName}
        reviewPeriod={activeAckReview.reviewPeriod}
        accentColor={accentColor}
        onBack={() => setActiveAckReviewId(null)}
        onAcknowledged={() => {
          fetchReviews();
          setActiveAckReviewId(null);
        }}
      />
    );
  }

  if (activeReview) {
    return (
      <SelfAssessmentForm
        reviewId={activeReview.id}
        employeeName={activeReview.employeeName}
        reviewPeriod={activeReview.reviewPeriod}
        initialStatus={activeReview.selfAssessmentStatus}
        accentColor={accentColor}
        onBack={() => setActiveReviewId(null)}
        onSubmitted={() => {
          fetchReviews();
          setActiveReviewId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">My Performance Reviews</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Complete your self-assessment before the manager review begins.
        </p>
      </div>

      <div className="divide-y rounded-lg border">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No reviews assigned yet.
          </div>
        ) : (
          reviews.map((review) => {
            // For badge display: use overall status for finalized/acknowledged, else selfAssessmentStatus
            const displayStatus =
              review.status === "finalized" || review.status === "acknowledged"
                ? review.status
                : review.selfAssessmentStatus;
            const config = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG["not_started"];
            const Icon = config.icon;
            return (
              <div key={review.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {review.reviewPeriod}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.reviewType.replaceAll("_", " ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    config.bg,
                    config.text,
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
                {review.status === "finalized" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-xs"
                    style={{ color: accentColor }}
                    onClick={() => setActiveAckReviewId(review.id)}
                  >
                    View &amp; Sign Off
                    <ChevronRight className="ml-0.5 h-3 w-3" />
                  </Button>
                ) : review.status === "acknowledged" ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-xs"
                    style={{ color: accentColor }}
                    onClick={() => setActiveReviewId(review.id)}
                  >
                    {review.selfAssessmentStatus === "not_started"
                      ? "Start"
                      : review.selfAssessmentStatus === "in_progress"
                        ? "Continue"
                        : "View"}
                    <ChevronRight className="ml-0.5 h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
