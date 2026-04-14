"use client";

import { useState, useCallback, useRef } from "react";
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

interface SelfAssessmentFormProps {
  reviewId: string;
  employeeName: string;
  reviewPeriod: string;
  initialSections: CategorySectionValue[];
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
  initialSections,
  initialStatus,
  accentColor,
  onBack,
  onSubmitted,
}: SelfAssessmentFormProps) {
  const [sections, setSections] = useState<CategorySectionValue[]>(() =>
    buildInitialSections(initialSections),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(initialStatus === "submitted");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveSections = useCallback(
    async (updatedSections: CategorySectionValue[]) => {
      setIsSaving(true);
      try {
        await fetch(`/api/grow/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selfAssessment: { sections: updatedSections } }),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [reviewId],
  );

  const handleRatingChange = useCallback(
    (index: number, rating: number) => {
      setSections((prev) => {
        const updated = prev.map((s, i) => (i === index ? { ...s, rating } : s));
        saveSections(updated);
        return updated;
      });
    },
    [saveSections],
  );

  const handleTextChange = useCallback(
    (index: number, field: "notes" | "examples", value: string) => {
      setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    },
    [],
  );

  const handleBlur = useCallback(
    (currentSections: CategorySectionValue[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        saveSections(currentSections);
      }, 500);
    },
    [saveSections],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfAssessment: { status: "submitted", sections } }),
      });
      setSubmitted(true);
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  }, [reviewId, sections, onSubmitted]);

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
            onBlur={() => handleBlur(sections)}
          />
        ))}
      </div>

      {/* Submit row */}
      {!submitted && (
        <div className="flex justify-end pt-2">
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
    </div>
  );
}
