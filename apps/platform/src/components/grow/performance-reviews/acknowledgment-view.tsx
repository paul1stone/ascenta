"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@ascenta/ui/button";
import {
  REVIEW_CATEGORY_KEYS,
  REVIEW_CATEGORIES,
  RATING_SCALE,
} from "@ascenta/db/performance-review-categories";
import type { ReviewCategoryKey } from "@ascenta/db/performance-review-categories";
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { computeOverallRating } from "@/lib/perf-reviews/overall-rating";
import { OverallRatingSummary } from "./overall-rating-summary";

interface AssessmentSection {
  categoryKey: ReviewCategoryKey;
  rating: number | null;
  notes: string;
  examples: string;
}

interface AreaOfImprovement {
  area: string;
  actions: string[];
  timeline: string;
  owner: string;
}

interface DevelopmentPlan {
  status: string;
  areasOfImprovement: AreaOfImprovement[];
  managerCommitments: string[];
  nextReviewDate: string | null;
}

interface ReviewData {
  selfAssessment: { sections: AssessmentSection[] };
  managerAssessment: { sections: AssessmentSection[] };
  developmentPlan: DevelopmentPlan | null;
  status: string;
}

interface AcknowledgmentViewProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  accentColor: string;
  onBack: () => void;
  onAcknowledged: () => void;
}

function getSectionForKey(
  sections: AssessmentSection[],
  key: ReviewCategoryKey,
): AssessmentSection | undefined {
  return sections.find((s) => s.categoryKey === key);
}

export function AcknowledgmentView({
  reviewId,
  employeeName,
  reviewPeriod,
  accentColor,
  onBack,
  onAcknowledged,
}: AcknowledgmentViewProps) {
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/grow/reviews/${reviewId}`);
        if (!res.ok) {
          if (!cancelled) setLoadError("Could not load review data. Please try again.");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          const r = data?.review;
          setReview({
            selfAssessment: r?.selfAssessment ?? { sections: [] },
            managerAssessment: r?.managerAssessment ?? { sections: [] },
            developmentPlan: r?.developmentPlan ?? null,
            status: r?.status ?? "",
          });
          if (r?.status === "acknowledged") {
            setAcknowledged(true);
          }
        }
      } catch {
        if (!cancelled) setLoadError("Failed to load review. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    setAckError(null);
    try {
      const res = await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "acknowledged" }),
      });
      if (res.ok) {
        setAcknowledged(true);
        onAcknowledged();
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setAckError(data.error ?? "Failed to acknowledge — please try again.");
      }
    } finally {
      setIsAcknowledging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Performance Review — {reviewPeriod}
            </h2>
            <p className="text-sm text-muted-foreground">{employeeName}</p>
          </div>
        </div>
        {acknowledged && (
          <div
            className="flex items-center gap-1.5 text-sm shrink-0"
            style={{ color: accentColor }}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Acknowledged</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{loadError}</p>
        </div>
      ) : review ? (
        <>
          {/* Overall rating summary — mean across all 10 category ratings,
              shown side-by-side for self vs manager. */}
          <OverallRatingsRow
            selfSections={review.selfAssessment.sections}
            managerSections={review.managerAssessment.sections}
            accentColor={accentColor}
          />

          {/* Column headers */}
          <div className="grid grid-cols-2 gap-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Self-Assessment
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Manager&apos;s Assessment
            </p>
          </div>

          {/* Category comparison rows */}
          <div className="space-y-4">
            {REVIEW_CATEGORY_KEYS.map((key, i) => {
              const category = REVIEW_CATEGORIES[key];
              const selfSection = getSectionForKey(
                review.selfAssessment.sections,
                key,
              );
              const mgrSection = getSectionForKey(
                review.managerAssessment.sections,
                key,
              );
              const selfRating = selfSection?.rating ?? null;
              const mgrRating = mgrSection?.rating ?? null;
              const selfNotes = selfSection?.notes ?? "";
              const mgrNotes = mgrSection?.notes ?? "";

              return (
                <div
                  key={key}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div className="bg-muted/40 px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-foreground">
                      {i + 1}. {category.label}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                    {/* Self-assessment column */}
                    <div className="p-4 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Self-Assessment</p>
                      <p className="text-sm">
                        {selfRating != null
                          ? `${selfRating} — ${RATING_SCALE[selfRating as keyof typeof RATING_SCALE]?.label ?? ""}`
                          : "Not rated"}
                      </p>
                      {selfNotes && selfNotes.trim() !== "" && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {selfNotes}
                        </p>
                      )}
                    </div>

                    {/* Manager assessment column */}
                    <div className="p-4 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Manager&apos;s Assessment
                      </p>
                      <p className="text-sm">
                        {mgrRating != null
                          ? `${mgrRating} — ${RATING_SCALE[mgrRating as keyof typeof RATING_SCALE]?.label ?? ""}`
                          : "Not rated"}
                      </p>
                      {mgrNotes && mgrNotes.trim() !== "" && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {mgrNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Development Plan */}
          {review.developmentPlan && review.developmentPlan.status !== "not_started" && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Development Plan</h3>

              {review.developmentPlan.areasOfImprovement?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Areas of Improvement
                  </p>
                  {review.developmentPlan.areasOfImprovement.map((area, i) => (
                    <div key={i} className="rounded-md border border-border bg-muted/20 p-3 space-y-1.5">
                      <p className="text-sm font-medium">{area.area}</p>
                      {area.actions?.length > 0 && (
                        <ul className="space-y-0.5 pl-4 list-disc">
                          {area.actions.map((action, j) => (
                            <li key={j} className="text-xs text-muted-foreground">
                              {action}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                        {area.timeline && (
                          <span>
                            <span className="font-medium">Timeline:</span> {area.timeline}
                          </span>
                        )}
                        {area.owner && (
                          <span>
                            <span className="font-medium">Owner:</span> {area.owner}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {review.developmentPlan.managerCommitments?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Manager Commitments
                  </p>
                  <ul className="space-y-0.5 pl-4 list-disc">
                    {review.developmentPlan.managerCommitments.map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.developmentPlan.nextReviewDate && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Next Review Date
                  </p>
                  <p className="text-sm">
                    {new Date(review.developmentPlan.nextReviewDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sign-off row */}
          <div className="flex flex-col items-end gap-2 pt-4 border-t border-border">
            {!acknowledged && (
              <>
                <p className="text-xs text-muted-foreground">
                  By signing off you confirm you have reviewed and understand this assessment.
                </p>
                {ackError && <p className="text-xs text-red-500">{ackError}</p>}
                <Button
                  onClick={handleAcknowledge}
                  disabled={isAcknowledging}
                  style={{ backgroundColor: accentColor }}
                  className="text-white"
                >
                  {isAcknowledging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing off…
                    </>
                  ) : (
                    "Sign Off →"
                  )}
                </Button>
              </>
            )}
            {acknowledged && (
              <div
                className="flex items-center gap-1.5 text-sm"
                style={{ color: accentColor }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Acknowledged
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function OverallRatingsRow({
  selfSections,
  managerSections,
  accentColor,
}: {
  selfSections: AssessmentSection[];
  managerSections: AssessmentSection[];
  accentColor: string;
}) {
  const expectedCount = REVIEW_CATEGORY_KEYS.length;
  const selfOverall = useMemo(
    () =>
      computeOverallRating(
        selfSections.map((s) => ({ rating: s.rating })),
        expectedCount,
      ),
    [selfSections, expectedCount],
  );
  const managerOverall = useMemo(
    () =>
      computeOverallRating(
        managerSections.map((s) => ({ rating: s.rating })),
        expectedCount,
      ),
    [managerSections, expectedCount],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <OverallRatingSummary
        label="Your overall rating"
        rating={selfOverall}
        accentColor={accentColor}
      />
      <OverallRatingSummary
        label="Manager's overall rating"
        rating={managerOverall}
        accentColor={accentColor}
      />
    </div>
  );
}
