# Performance Reviews v2 — Phase B: Self-Assessment UI Implementation Plan

**Date:** 2026-04-13
**Branch:** `feat/perf-reviews-v2-phase-b`
**Worktree:** `.worktrees/feat/perf-reviews-v2-phase-b`
**Spec:** `docs/superpowers/specs/2026-04-13-perf-reviews-v2-phase-b-self-assessment-design.md`

---

## Context

Phase A shipped the data layer (ReviewCycle schema, expanded PerformanceReview with selfAssessment/managerAssessment subdocs, PATCH gate, status machine). Phase B adds the employee-facing self-assessment UI.

Key imports available from Phase A:
- `REVIEW_CATEGORIES`, `REVIEW_CATEGORY_KEYS`, `RATING_SCALE`, `SELF_ASSESSMENT_STATUSES` from `@ascenta/db/performance-review-categories`
- `ReviewCategoryKey`, `SelfAssessmentStatus` types from same
- `selfAssessmentUpdateSchema`, `categorySectionSchema` in `@/lib/validations/performance-review`
- `LikertScale` component at `@/components/grow/check-in/likert-scale.tsx`
- `useAuth()` from `@/lib/auth/auth-context` — provides `user.role`, `user.id`, `user.name`

---

## Tasks

### Task 1: `CategorySectionCard` component

**File:** Create `apps/platform/src/components/grow/performance-reviews/category-section-card.tsx`

This is a pure presentational component — no API calls, no state.

```typescript
"use client";

import { Textarea } from "@ascenta/ui/textarea";
import { Label } from "@ascenta/ui/label";
import { cn } from "@ascenta/ui";
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
}: CategorySectionCardProps) {
  const category = REVIEW_CATEGORIES[categoryKey];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold">
            <span className="text-muted-foreground mr-1.5">{index}.</span>
            {category.label}
          </h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {category.definition}
        </p>
      </div>

      {/* Guided Prompts */}
      <div className="space-y-1">
        {category.guidedPrompts.map((prompt, i) => (
          <p key={i} className="text-xs text-muted-foreground italic">
            • {prompt}
          </p>
        ))}
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Rating</Label>
        <LikertScale
          value={rating}
          onChange={onRatingChange}
          lowLabel={RATING_SCALE[1].label}
          highLabel={RATING_SCALE[5].label}
          disabled={disabled}
        />
        {rating !== null && (
          <p className="text-xs text-muted-foreground text-center">
            {RATING_SCALE[rating as keyof typeof RATING_SCALE]?.label} —{" "}
            {RATING_SCALE[rating as keyof typeof RATING_SCALE]?.description}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="Describe your performance in this area during the review period..."
          className="text-sm resize-none min-h-[80px]"
        />
      </div>

      {/* Examples */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Specific Examples</Label>
        <Textarea
          value={examples}
          onChange={(e) => onExamplesChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="List specific examples, achievements, or situations from the review period..."
          className="text-sm resize-none min-h-[80px]"
        />
      </div>
    </div>
  );
}
```

**Step 1: Write** the file above.

**Step 2: Verify types**
```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | grep "error TS" | grep -v "chat-message"
```

**Step 3: Commit**
```bash
git add apps/platform/src/components/grow/performance-reviews/category-section-card.tsx
git commit -m "feat(ui): add CategorySectionCard for self-assessment per-category entry"
```

---

### Task 2: `SelfAssessmentForm` component

**File:** Create `apps/platform/src/components/grow/performance-reviews/self-assessment-form.tsx`

This component manages the 10-category form state and handles auto-save + submit.

```typescript
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
  return REVIEW_CATEGORY_KEYS.map((key) => {
    const existing = initial.find((s) => s.categoryKey === key);
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
  const [sections, setSections] = useState<CategorySectionValue[]>(
    () => buildInitialSections(initialSections),
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
          body: JSON.stringify({
            selfAssessment: { sections: updatedSections },
          }),
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
        const next = prev.map((s, i) => (i === index ? { ...s, rating } : s));
        saveSections(next);
        return next;
      });
    },
    [saveSections],
  );

  const handleTextChange = useCallback(
    (index: number, field: "notes" | "examples", value: string) => {
      setSections((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  const handleBlur = useCallback(
    (currentSections: CategorySectionValue[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveSections(currentSections);
      }, 500);
    },
    [saveSections],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/grow/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfAssessment: { status: "submitted", sections },
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        onSubmitted();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 px-2">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold">Self-Assessment</h2>
          <p className="text-xs text-muted-foreground">
            {employeeName} · {reviewPeriod}
          </p>
        </div>
        {submitted ? (
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: accentColor }}>
            <CheckCircle2 className="h-4 w-4" />
            Submitted
          </div>
        ) : isSaving ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Auto-saving</span>
        )}
      </div>

      {/* Category cards */}
      <div className="space-y-3">
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

      {/* Submit */}
      {!submitted && (
        <div className="flex justify-end border-t pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ backgroundColor: accentColor }}
            className="text-white"
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
```

**Step 1: Write** the file above.

**Step 2: Verify types**
```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | grep "error TS" | grep -v "chat-message"
```

**Step 3: Commit**
```bash
git add apps/platform/src/components/grow/performance-reviews/self-assessment-form.tsx
git commit -m "feat(ui): add SelfAssessmentForm with auto-save and submission"
```

---

### Task 3: GET /api/grow/reviews — add employeeObjectId filter

**File:** Modify `apps/platform/src/app/api/grow/reviews/route.ts`

Add a new branch at the top of the GET handler, before the existing `managerId` logic:

```typescript
const employeeObjectId = searchParams.get("employeeObjectId");

if (employeeObjectId) {
  // Employee view: fetch reviews assigned to this employee
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeeReviews = await PerformanceReview.find({ employee: employeeObjectId })
    .sort({ "reviewPeriod.end": -1 })
    .lean() as any[];

  return NextResponse.json({
    success: true,
    reviews: employeeReviews.map((r) => ({
      id: String(r._id),
      employeeName: r.employeeName,
      reviewPeriod: r.reviewPeriod?.label ?? String(r.reviewPeriod),
      reviewType: r.reviewType ?? "custom",
      selfAssessmentStatus: r.selfAssessment?.status ?? "not_started",
    })),
  });
}
```

Place this block immediately after `await connectDB()` and before the `managerId` check. The existing `managerId` path is unchanged.

Also update the error message for missing params:
```typescript
if (!managerId) {
  return NextResponse.json(
    { success: false, error: "managerId or employeeObjectId is required" },
    { status: 400 },
  );
}
```

**Step 1: Read** the current file to find the exact insertion point.
**Step 2: Edit** to add the employeeObjectId branch.
**Step 3: Verify types**
```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | grep "error TS" | grep -v "chat-message"
```
**Step 4: Commit**
```bash
git add apps/platform/src/app/api/grow/reviews/route.ts
git commit -m "feat(api): add employeeObjectId filter to GET /api/grow/reviews"
```

---

### Task 4: `SelfAssessmentPanel` component

**File:** Create `apps/platform/src/components/grow/performance-reviews/self-assessment-panel.tsx`

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@ascenta/ui";
import { Clock, CheckCircle, FileX, ChevronRight } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import type { SelfAssessmentStatus } from "@ascenta/db/performance-review-categories";
import { SelfAssessmentForm } from "./self-assessment-form";

interface ReviewSummary {
  id: string;
  employeeName: string;
  reviewPeriod: string;
  reviewType: string;
  selfAssessmentStatus: SelfAssessmentStatus;
}

interface SelfAssessmentPanelProps {
  employeeObjectId: string;
  employeeName: string;
  accentColor: string;
}

const STATUS_CONFIG: Record<SelfAssessmentStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  not_started: { label: "Not Started", bg: "bg-orange-500/15", text: "text-orange-500", icon: FileX },
  in_progress: { label: "In Progress", bg: "bg-teal-500/15", text: "text-teal-600", icon: Clock },
  submitted: { label: "Submitted", bg: "bg-blue-500/15", text: "text-blue-600", icon: CheckCircle },
};

export function SelfAssessmentPanel({
  employeeObjectId,
  employeeName,
  accentColor,
}: SelfAssessmentPanelProps) {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/grow/reviews?employeeObjectId=${employeeObjectId}`);
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

  if (activeReview) {
    return (
      <SelfAssessmentForm
        reviewId={activeReview.id}
        employeeName={activeReview.employeeName}
        reviewPeriod={activeReview.reviewPeriod}
        initialSections={[]}
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
        <p className="text-xs text-muted-foreground mt-0.5">
          Complete your self-assessment before the manager review begins.
        </p>
      </div>

      <div className="rounded-lg border divide-y">
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
            const config = STATUS_CONFIG[review.selfAssessmentStatus];
            const Icon = config.icon;
            const canEdit = review.selfAssessmentStatus !== "submitted";
            return (
              <div key={review.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{review.reviewPeriod}</p>
                  <p className="text-xs text-muted-foreground">{review.reviewType.replace("_", " ")}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", config.bg, config.text)}>
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs shrink-0"
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
```

**Step 1: Write** the file above.

**Step 2: Verify types**
```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | grep "error TS" | grep -v "chat-message"
```

**Step 3: Commit**
```bash
git add apps/platform/src/components/grow/performance-reviews/self-assessment-panel.tsx
git commit -m "feat(ui): add SelfAssessmentPanel — employee review list with status badges"
```

---

### Task 5: Wire into page — role-based rendering

**File:** Modify `apps/platform/src/app/[category]/[sub]/page.tsx`

Read the file first. Find where `<ReviewsPanel>` is rendered (currently around line 61–80, inside `pageKey === "grow/performance"`).

Change the rendering logic to:

```typescript
// In the grow/performance branch, replace <ReviewsPanel ... /> with:
{user?.role === "employee" ? (
  <SelfAssessmentPanel
    employeeObjectId={user.id}
    employeeName={user.name}
    accentColor={pageConfig?.accentColor ?? "#44aa99"}
  />
) : (
  <ReviewsPanel
    pageKey={pageKey}
    accentColor={pageConfig?.accentColor ?? "#44aa99"}
    onSwitchToDoTab={onSwitchToDoTab}
  />
)}
```

Add import at the top:
```typescript
import { SelfAssessmentPanel } from "@/components/grow/performance-reviews/self-assessment-panel";
```

**Important**: Read the page.tsx carefully before editing — the exact shape of the existing conditional and variable names may differ. Match the surrounding code style.

**Step 1: Read** `apps/platform/src/app/[category]/[sub]/page.tsx` to find exact insertion point.
**Step 2: Edit** to add role-based rendering.
**Step 3: Verify types**
```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | grep "error TS" | grep -v "chat-message"
```
**Step 4: Run tests**
```bash
pnpm -F @ascenta/platform run test 2>&1 | tail -10
```
**Step 5: Commit**
```bash
git add apps/platform/src/app/[category]/[sub]/page.tsx
git commit -m "feat(ui): render SelfAssessmentPanel for employee role on performance page"
```

---

### Task 6: Final verification

**Step 1: Run full test suite**
```bash
pnpm -F @ascenta/platform run test 2>&1 | tail -15
```
Expected: all tests pass.

**Step 2: Type check**
```bash
pnpm -F @ascenta/platform exec tsc --noEmit 2>&1 | grep "error TS" | grep -v "chat-message"
```
Expected: no new errors.

**Step 3: Self-review acceptance criteria**
- [ ] `CategorySectionCard` renders all 10 categories with LikertScale + notes + examples
- [ ] `SelfAssessmentForm` auto-saves on rating change and text blur
- [ ] `SelfAssessmentForm` submits status `"submitted"` on button click
- [ ] `SelfAssessmentPanel` fetches from `GET /api/grow/reviews?employeeObjectId=X`
- [ ] Panel shows list → form → back to list flow
- [ ] Page renders `SelfAssessmentPanel` for employee role, `ReviewsPanel` for manager/hr
- [ ] All TypeScript clean (excluding pre-existing chat-message.tsx TS1501)

**Step 4: Commit if any cleanup needed, then push**
```bash
git push -u origin feat/perf-reviews-v2-phase-b
```
