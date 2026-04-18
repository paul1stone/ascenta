"use client";

import { useState } from "react";
import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import { REVIEW_CATEGORIES, RATING_SCALE } from "@ascenta/db/performance-review-categories";
import type { ReviewCategoryKey } from "@ascenta/db/performance-review-categories";
import { LikertScale } from "@/components/grow/check-in/likert-scale";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface EvidenceItem {
  id: string;
  kind: "goal" | "checkin" | "note";
  label: string;
}

export interface EvidenceRef {
  type: "goal" | "checkin" | "note" | "other";
  refId: string;
  label: string;
}

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
  evidenceItems?: EvidenceItem[];
  selectedEvidence?: EvidenceRef[];
  onEvidenceChange?: (refs: EvidenceRef[]) => void;
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
  evidenceItems = undefined,
  selectedEvidence = undefined,
  onEvidenceChange = undefined,
}: CategorySectionCardProps) {
  const category = REVIEW_CATEGORIES[categoryKey];
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  const handleEvidenceToggle = (item: EvidenceItem) => {
    if (!onEvidenceChange) return;

    const newRefs = selectedEvidence ? [...selectedEvidence] : [];
    const evidenceRef: EvidenceRef = {
      type: item.kind === "checkin" ? "checkin" : item.kind,
      refId: item.id,
      label: item.label,
    };

    const existingIndex = newRefs.findIndex((ref) => ref.refId === item.id);
    if (existingIndex >= 0) {
      newRefs.splice(existingIndex, 1);
    } else {
      newRefs.push(evidenceRef);
    }

    onEvidenceChange(newRefs);
  };

  const isItemSelected = (itemId: string): boolean => {
    return selectedEvidence?.some((ref) => ref.refId === itemId) ?? false;
  };

  const groupedEvidence =
    evidenceItems && evidenceItems.length > 0
      ? {
          goals: evidenceItems.filter((item) => item.kind === "goal"),
          checkIns: evidenceItems.filter((item) => item.kind === "checkin"),
          notes: evidenceItems.filter((item) => item.kind === "note"),
        }
      : null;

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

      {/* Supporting Evidence Section */}
      {evidenceItems && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Supporting Evidence</span>
              {selectedEvidence && selectedEvidence.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {selectedEvidence.length} tagged
                </span>
              )}
            </div>
            {isEvidenceOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {isEvidenceOpen && (
            <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
              {groupedEvidence ? (
                <>
                  {/* Goals */}
                  {groupedEvidence.goals.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Goals
                      </p>
                      <div className="space-y-1 pl-2">
                        {groupedEvidence.goals.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 cursor-pointer py-1"
                          >
                            <input
                              type="checkbox"
                              checked={isItemSelected(item.id)}
                              onChange={() => handleEvidenceToggle(item)}
                              disabled={disabled}
                              className="mt-1 w-4 h-4"
                            />
                            <span className="text-sm text-foreground break-words">
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Check-ins */}
                  {groupedEvidence.checkIns.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Check-ins
                      </p>
                      <div className="space-y-1 pl-2">
                        {groupedEvidence.checkIns.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 cursor-pointer py-1"
                          >
                            <input
                              type="checkbox"
                              checked={isItemSelected(item.id)}
                              onChange={() => handleEvidenceToggle(item)}
                              disabled={disabled}
                              className="mt-1 w-4 h-4"
                            />
                            <span className="text-sm text-foreground break-words">
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {groupedEvidence.notes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Notes
                      </p>
                      <div className="space-y-1 pl-2">
                        {groupedEvidence.notes.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 cursor-pointer py-1"
                          >
                            <input
                              type="checkbox"
                              checked={isItemSelected(item.id)}
                              onChange={() => handleEvidenceToggle(item)}
                              disabled={disabled}
                              className="mt-1 w-4 h-4"
                            />
                            <span className="text-sm text-foreground break-words">
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No linked items found for this review period.
                </p>
              )}

              {/* Read-only evidence display when disabled */}
              {disabled && selectedEvidence && selectedEvidence.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tagged Evidence
                  </p>
                  <ul className="space-y-1 pl-2">
                    {selectedEvidence.map((ref) => (
                      <li key={ref.refId} className="text-sm text-foreground">
                        • {ref.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
