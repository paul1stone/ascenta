"use client";

import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import { REVIEW_CATEGORIES, RATING_SCALE } from "@ascenta/db/performance-review-categories";
import type { ReviewCategoryKey } from "@ascenta/db/performance-review-categories";
import { LikertScale } from "@/components/grow/check-in/likert-scale";

interface CategorySectionCardProps {
  categoryKey: ReviewCategoryKey;
  index: number;
  rating: number | null;
  notes: string;
  examples: string;
  disabled?: boolean;
  onRatingChange: (rating: number) => void;
  onNotesChange: (notes: string) => void;
  onExamplesChange: (examples: string) => void;
  onBlur?: () => void;
  employeeRating?: number | null;
  employeeNotes?: string;
}

export function CategorySectionCard({
  categoryKey,
  index,
  rating,
  notes,
  examples,
  disabled = false,
  onRatingChange,
  onNotesChange,
  onExamplesChange,
  onBlur,
  employeeRating = undefined,
  employeeNotes = undefined,
}: CategorySectionCardProps) {
  const category = REVIEW_CATEGORIES[categoryKey];

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {index}. {category.label}
        </h3>
        <p className="text-xs text-muted-foreground">{category.definition}</p>
      </div>

      {/* Employee self-assessment reference (manager view only) */}
      {employeeRating != null && (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Employee's self-assessment</p>
          <p className="text-xs text-foreground">
            {employeeRating} — {RATING_SCALE[employeeRating as keyof typeof RATING_SCALE]?.label ?? ""}
          </p>
          {employeeNotes && employeeNotes.trim() !== "" && (
            <p className="text-xs text-muted-foreground line-clamp-3">{employeeNotes}</p>
          )}
        </div>
      )}

      {/* Guided prompts */}
      <ul className="space-y-1 pl-4 list-disc">
        {category.guidedPrompts.map((prompt, i) => (
          <li key={i} className="text-xs text-muted-foreground italic">
            {prompt}
          </li>
        ))}
      </ul>

      {/* Rating */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Rating</Label>
        <LikertScale
          value={rating}
          onChange={onRatingChange}
          lowLabel={RATING_SCALE[1].label}
          highLabel={RATING_SCALE[5].label}
          disabled={disabled}
        />
        {rating !== null && rating >= 1 && rating <= 5 && (
          <p className="text-xs text-muted-foreground text-center">
            {RATING_SCALE[rating as keyof typeof RATING_SCALE].label} —{" "}
            {RATING_SCALE[rating as keyof typeof RATING_SCALE].description}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor={`notes-${categoryKey}`} className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id={`notes-${categoryKey}`}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="Describe your performance in this area during the review period..."
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Specific Examples */}
      <div className="space-y-1.5">
        <Label htmlFor={`examples-${categoryKey}`} className="text-sm font-medium">
          Specific Examples
        </Label>
        <Textarea
          id={`examples-${categoryKey}`}
          value={examples}
          onChange={(e) => onExamplesChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="List specific examples, achievements, or situations from the review period..."
          className="min-h-[80px] resize-none"
        />
      </div>
    </div>
  );
}
