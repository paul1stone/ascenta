"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@ascenta/ui/button";
import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import { REVIEW_CATEGORY_KEYS } from "@ascenta/db/performance-review-categories";
import type { ReviewCategoryKey, SelfAssessmentStatus } from "@ascenta/db/performance-review-categories";
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { CategorySectionCard } from "./category-section-card";

interface CategorySectionValue {
  categoryKey: ReviewCategoryKey;
  rating: number | null;
  notes: string;
  examples: string;
}

interface NarrativeFields {
  strengthsNarrative: string;
  developmentPriorities: string;
  supportNeeds: string;
}

const EMPTY_NARRATIVE: NarrativeFields = {
  strengthsNarrative: "",
  developmentPriorities: "",
  supportNeeds: "",
};

interface SelfAssessmentFormProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  initialStatus: SelfAssessmentStatus;
  accentColor: string;
  onBack: () => void;
  onSubmitted: () => void;
}

function buildInitialSections(initial: CategorySectionValue[]): CategorySectionValue[] {
  const byKey = new Map<ReviewCategoryKey, CategorySectionValue>();
  for (const s of initial) {
    byKey.set(s.categoryKey, s);
  }
  return REVIEW_CATEGORY_KEYS.map((key) => {
    const existing = byKey.get(key);
    return existing ?? { categoryKey: key, rating: null, notes: "", examples: "" };
  });
}

export function SelfAssessmentForm({
  reviewId,
  employeeName,
  reviewPeriod,
  initialStatus,
  accentColor,
  onBack,
  onSubmitted,
}: SelfAssessmentFormProps) {
  const [sections, setSections] = useState<CategorySectionValue[]>(() =>
    buildInitialSections([]),
  );
  const [narrative, setNarrative] = useState<NarrativeFields>(EMPTY_NARRATIVE);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(initialStatus === "submitted");
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionsRef = useRef<CategorySectionValue[]>(sections);
  const narrativeRef = useRef<NarrativeFields>(EMPTY_NARRATIVE);
  // Track whether status has already been advanced to "in_progress" so we only
  // send that field on the very first save for a "not_started" review.
  const hasFirstSavedRef = useRef(initialStatus !== "not_started");

  // Bug 1: fetch persisted sections on mount so "Continue" restores prior work
  useEffect(() => {
    let cancelled = false;

    async function loadSections() {
      try {
        const res = await fetch(`/api/grow/reviews/${reviewId}`);
        if (!res.ok) {
          if (!cancelled) setSaveError("Could not load saved progress. Your changes will still be saved.");
          return;
        }
        if (cancelled) return;

        const data = await res.json();
        const fetchedSections: CategorySectionValue[] =
          data?.review?.selfAssessment?.sections ?? [];
        const fetchedStatus: SelfAssessmentStatus =
          data?.review?.selfAssessment?.status ?? initialStatus;
        const fetchedNarrative: NarrativeFields = {
          strengthsNarrative:
            data?.review?.selfAssessment?.strengthsNarrative ?? "",
          developmentPriorities:
            data?.review?.selfAssessment?.developmentPriorities ?? "",
          supportNeeds: data?.review?.selfAssessment?.supportNeeds ?? "",
        };

        if (!cancelled) {
          const built = buildInitialSections(fetchedSections);
          setSections(built);
          sectionsRef.current = built;
          setNarrative(fetchedNarrative);
          narrativeRef.current = fetchedNarrative;
          if (fetchedStatus === "submitted") {
            setSubmitted(true);
          }
          // If the DB already shows in_progress (or submitted), no need to
          // advance status again on the first save.
          if (fetchedStatus !== "not_started") {
            hasFirstSavedRef.current = true;
          }
        }
      } finally {
        if (!cancelled) setIsLoadingInitial(false);
      }
    }

    loadSections();
    return () => {
      cancelled = true;
    };
  }, [reviewId, initialStatus]);

  const saveProgress = useCallback(
    async (
      updatedSections: CategorySectionValue[],
      updatedNarrative: NarrativeFields,
    ) => {
      setIsSaving(true);
      try {
        // Bug 2: advance status to "in_progress" on the very first save
        const body: Record<string, unknown> = {
          sections: updatedSections,
          strengthsNarrative: updatedNarrative.strengthsNarrative,
          developmentPriorities: updatedNarrative.developmentPriorities,
          supportNeeds: updatedNarrative.supportNeeds,
        };
        if (!hasFirstSavedRef.current) {
          hasFirstSavedRef.current = true;
          body.status = "in_progress";
        }

        const res = await fetch(`/api/grow/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selfAssessment: body }),
        });

        // Medium fix A: surface save errors
        if (!res.ok) {
          setSaveError("Failed to save — please try again.");
        } else {
          setSaveError(null);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [reviewId],
  );

  // Bug 3c: cancel any pending debounce before saving the rating immediately
  const handleRatingChange = useCallback(
    (index: number, rating: number) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setSections((prev) => {
        // Bug 3a: keep sectionsRef in sync inside the updater
        const updated = prev.map((s, i) => (i === index ? { ...s, rating } : s));
        sectionsRef.current = updated;
        saveProgress(updated, narrativeRef.current);
        return updated;
      });
    },
    [saveProgress],
  );

  const handleTextChange = useCallback(
    (index: number, field: "notes" | "examples", value: string) => {
      setSections((prev) => {
        // Bug 3a: keep sectionsRef in sync inside the updater
        const next = prev.map((s, i) => (i === index ? { ...s, [field]: value } : s));
        sectionsRef.current = next;
        return next;
      });
    },
    [],
  );

  const handleNarrativeChange = useCallback(
    (field: keyof NarrativeFields, value: string) => {
      setNarrative((prev) => {
        const next = { ...prev, [field]: value };
        narrativeRef.current = next;
        return next;
      });
    },
    [],
  );

  // Bug 3b: no argument — reads from refs to avoid stale closure
  const handleBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveProgress(sectionsRef.current, narrativeRef.current);
    }, 500);
  }, [saveProgress]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfAssessment: {
            status: "submitted",
            sections: sectionsRef.current,
            strengthsNarrative: narrativeRef.current.strengthsNarrative,
            developmentPriorities: narrativeRef.current.developmentPriorities,
            supportNeeds: narrativeRef.current.supportNeeds,
          },
        }),
      });

      // Medium fix A: surface submit errors
      if (!res.ok) {
        setSubmitError("Failed to submit — please try again.");
        return;
      }

      setSubmitted(true);
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  }, [reviewId, onSubmitted]);

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
            <h2 className="text-base font-semibold text-foreground">Self-Assessment</h2>
            <p className="text-sm text-muted-foreground">
              {employeeName} · {reviewPeriod}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm shrink-0">
          {submitted ? (
            <>
              <CheckCircle2 className="h-4 w-4" style={{ color: accentColor }} />
              <span style={{ color: accentColor }} className="font-medium">
                Submitted
              </span>
            </>
          ) : saveError ? (
            <span className="text-red-500">{saveError}</span>
          ) : isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Saving…</span>
            </>
          ) : (
            <span className="text-muted-foreground">Auto-saving</span>
          )}
        </div>
      </div>

      {/* Bug 1: show spinner while fetching persisted data */}
      {isLoadingInitial ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Category sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <CategorySectionCard
                key={section.categoryKey}
                categoryKey={section.categoryKey}
                index={index + 1}
                rating={section.rating}
                notes={section.notes}
                examples={section.examples}
                disabled={submitted}
                onRatingChange={(rating) => handleRatingChange(index, rating)}
                onNotesChange={(value) => handleTextChange(index, "notes", value)}
                onExamplesChange={(value) => handleTextChange(index, "examples", value)}
                onBlur={handleBlur}
              />
            ))}
          </div>

          {/* Narrative fields — strengths, development priorities, support needs.
              Required by docs/reqs/perf-reviews.md Step 2. */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-foreground mb-0.5">
                Reflection
              </h3>
              <p className="text-xs text-muted-foreground">
                These narratives sit alongside your category ratings and give your
                manager a fuller picture of the review period.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="self-strengths">
                Strengths narrative
                <span className="text-muted-foreground font-normal">
                  {" "}
                  — what you did well this period
                </span>
              </Label>
              <Textarea
                id="self-strengths"
                placeholder="What are you most proud of? Which contributions exceeded expectations? Where did you see measurable impact?"
                value={narrative.strengthsNarrative}
                onChange={(e) =>
                  handleNarrativeChange("strengthsNarrative", e.target.value)
                }
                onBlur={handleBlur}
                disabled={submitted}
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="self-development">
                Development priorities
                <span className="text-muted-foreground font-normal">
                  {" "}
                  — where you want to grow
                </span>
              </Label>
              <Textarea
                id="self-development"
                placeholder="Which skills or capabilities do you want to strengthen next period? What learning goals would help you contribute more?"
                value={narrative.developmentPriorities}
                onChange={(e) =>
                  handleNarrativeChange("developmentPriorities", e.target.value)
                }
                onBlur={handleBlur}
                disabled={submitted}
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="self-support">
                Support needs
                <span className="text-muted-foreground font-normal">
                  {" "}
                  — what you need from your manager
                </span>
              </Label>
              <Textarea
                id="self-support"
                placeholder="What specific support, resources, or changes would help you perform at your best?"
                value={narrative.supportNeeds}
                onChange={(e) =>
                  handleNarrativeChange("supportNeeds", e.target.value)
                }
                onBlur={handleBlur}
                disabled={submitted}
                rows={4}
              />
            </div>
          </div>

          {/* Submit row */}
          {!submitted && (
            <div className="flex flex-col items-end gap-2 pt-2">
              {/* Medium fix B: warn about unrated categories */}
              {sections.some((s) => s.rating === null) && (
                <p className="text-xs text-amber-600">
                  {sections.filter((s) => s.rating === null).length} of 10 categories have no
                  rating yet.
                </p>
              )}
              {submitError && <p className="text-xs text-red-500">{submitError}</p>}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-white"
                style={{ backgroundColor: accentColor }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Self-Assessment"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
