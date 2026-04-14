"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@ascenta/ui/button";
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

interface ManagerAssessmentFormProps {
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

export function ManagerAssessmentForm({
  reviewId,
  employeeName,
  reviewPeriod,
  initialStatus,
  accentColor,
  onBack,
  onSubmitted,
}: ManagerAssessmentFormProps) {
  const [sections, setSections] = useState<CategorySectionValue[]>(() =>
    buildInitialSections([]),
  );
  const [employeeSections, setEmployeeSections] = useState<CategorySectionValue[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(initialStatus === "submitted");
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionsRef = useRef<CategorySectionValue[]>(sections);
  // Track whether status has already been advanced to "in_progress" so we only
  // send that field on the very first save for a "not_started" review.
  const hasFirstSavedRef = useRef(initialStatus !== "not_started");

  const getEmployeeSection = (key: ReviewCategoryKey) =>
    employeeSections.find((s) => s.categoryKey === key);

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

        // Load employee's self-assessment sections as read-only reference
        const fetchedEmployeeSections: CategorySectionValue[] =
          data?.review?.selfAssessment?.sections ?? [];

        // Load manager's assessment sections for editing
        const fetchedManagerSections: CategorySectionValue[] =
          data?.review?.managerAssessment?.sections ?? [];
        const fetchedManagerStatus: SelfAssessmentStatus =
          data?.review?.managerAssessment?.status ?? initialStatus;

        if (!cancelled) {
          setEmployeeSections(fetchedEmployeeSections);

          const built = buildInitialSections(fetchedManagerSections);
          setSections(built);
          sectionsRef.current = built;

          if (fetchedManagerStatus === "submitted") {
            setSubmitted(true);
          }
          // If the DB already shows in_progress (or submitted), no need to
          // advance status again on the first save.
          if (fetchedManagerStatus !== "not_started") {
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

  const saveSections = useCallback(
    async (updatedSections: CategorySectionValue[]) => {
      setIsSaving(true);
      try {
        const body: Record<string, unknown> = { sections: updatedSections };
        if (!hasFirstSavedRef.current) {
          hasFirstSavedRef.current = true;
          body.status = "in_progress";
        }

        const res = await fetch(`/api/grow/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ managerAssessment: body }),
        });

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

  const handleRatingChange = useCallback(
    (index: number, rating: number) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setSections((prev) => {
        const updated = prev.map((s, i) => (i === index ? { ...s, rating } : s));
        sectionsRef.current = updated;
        saveSections(updated);
        return updated;
      });
    },
    [saveSections],
  );

  const handleTextChange = useCallback(
    (index: number, field: "notes" | "examples", value: string) => {
      setSections((prev) => {
        const next = prev.map((s, i) => (i === index ? { ...s, [field]: value } : s));
        sectionsRef.current = next;
        return next;
      });
    },
    [],
  );

  const handleBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveSections(sectionsRef.current);
    }, 500);
  }, [saveSections]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerAssessment: { status: "submitted", sections: sectionsRef.current } }),
      });

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
            <h2 className="text-base font-semibold text-foreground">Manager Assessment</h2>
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

      {isLoadingInitial ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Category sections */}
          <div className="space-y-4">
            {sections.map((section, index) => {
              const empSection = getEmployeeSection(section.categoryKey);
              return (
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
                  employeeRating={empSection?.rating ?? null}
                  employeeNotes={empSection?.notes ?? ""}
                />
              );
            })}
          </div>

          {/* Submit row */}
          {!submitted && (
            <div className="flex flex-col items-end gap-2 pt-2">
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
                  "Submit Manager Assessment"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
