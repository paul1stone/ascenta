"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/dialog";
import {
  REVIEW_TYPES,
  CYCLE_STATUSES,
  type CycleStatus,
  type ReviewType,
} from "@ascenta/db/performance-review-categories";

export interface CycleFormValues {
  label: string;
  type: ReviewType;
  periodStart: string;
  periodEnd: string;
  selfAssessmentDeadline: string | null;
  managerDeadline: string | null;
  participantEmployeeIds: string[];
  status?: CycleStatus;
}

interface InitialCycleValues {
  id?: string;
  label?: string;
  type?: ReviewType;
  periodStart?: string | null;
  periodEnd?: string | null;
  selfAssessmentDeadline?: string | null;
  managerDeadline?: string | null;
  participantEmployeeIds?: string[];
  status?: CycleStatus;
}

interface ReviewCycleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: InitialCycleValues;
  onSubmit: (values: CycleFormValues) => void | Promise<void>;
  submitting?: boolean;
  error?: string | null;
}

const TYPE_LABEL: Record<ReviewType, string> = {
  annual: "Annual",
  mid_year: "Mid-year",
  ninety_day: "90-day",
  custom: "Custom",
};

const STATUS_LABEL: Record<CycleStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
};

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultLabelForType(type: ReviewType): string {
  const year = new Date().getFullYear();
  switch (type) {
    case "annual":
      return `Annual ${year}`;
    case "mid_year":
      return `Mid-year ${year}`;
    case "ninety_day":
      return `90-day review`;
    default:
      return `Custom ${year}`;
  }
}

export function ReviewCycleFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  submitting = false,
  error = null,
}: ReviewCycleFormDialogProps) {
  const isEdit = Boolean(initialValues?.id);

  const [label, setLabel] = useState("");
  const [type, setType] = useState<ReviewType>("custom");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [selfDeadline, setSelfDeadline] = useState("");
  const [managerDeadline, setManagerDeadline] = useState("");
  const [status, setStatus] = useState<CycleStatus>("draft");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValidationError(null);
    setLabel(initialValues?.label ?? "");
    setType(initialValues?.type ?? "custom");
    setPeriodStart(toDateInputValue(initialValues?.periodStart));
    setPeriodEnd(toDateInputValue(initialValues?.periodEnd));
    setSelfDeadline(toDateInputValue(initialValues?.selfAssessmentDeadline));
    setManagerDeadline(toDateInputValue(initialValues?.managerDeadline));
    setStatus(initialValues?.status ?? "draft");
  }, [open, initialValues]);

  const title = isEdit ? "Edit review cycle" : "New review cycle";
  const submitLabel = submitting
    ? "Saving…"
    : isEdit
      ? "Save changes"
      : "Create cycle";

  const resolvedLabel = useMemo(
    () => (label.trim() ? label.trim() : defaultLabelForType(type)),
    [label, type],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!periodStart || !periodEnd) {
      setValidationError("Period start and end are required.");
      return;
    }
    if (new Date(periodStart) > new Date(periodEnd)) {
      setValidationError("Period start must be on or before period end.");
      return;
    }

    const values: CycleFormValues = {
      label: resolvedLabel,
      type,
      periodStart,
      periodEnd,
      selfAssessmentDeadline: selfDeadline || null,
      managerDeadline: managerDeadline || null,
      participantEmployeeIds: initialValues?.participantEmployeeIds ?? [],
    };
    if (isEdit) values.status = status;

    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Define the review period, type, and deadlines. Participants default to all
              active employees; specific participant selection comes later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="cycle-label">Label</Label>
              <Input
                id="cycle-label"
                placeholder={defaultLabelForType(type)}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cycle-type">Review type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ReviewType)}>
                <SelectTrigger id="cycle-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cycle-start">Period start</Label>
                <Input
                  id="cycle-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cycle-end">Period end</Label>
                <Input
                  id="cycle-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cycle-self-deadline">Self-assessment deadline</Label>
                <Input
                  id="cycle-self-deadline"
                  type="date"
                  value={selfDeadline}
                  onChange={(e) => setSelfDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cycle-manager-deadline">Manager deadline</Label>
                <Input
                  id="cycle-manager-deadline"
                  type="date"
                  value={managerDeadline}
                  onChange={(e) => setManagerDeadline(e.target.value)}
                />
              </div>
            </div>

            {isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="cycle-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as CycleStatus)}
                >
                  <SelectTrigger id="cycle-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(validationError || error) && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700">
                {validationError ?? error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
