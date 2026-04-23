"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ClipboardList,
  Lock,
  Pencil,
  Play,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@ascenta/ui/button";
import { Badge } from "@ascenta/ui/badge";
import {
  REVIEW_TYPES,
  CYCLE_STATUSES,
  type CycleStatus,
  type ReviewType,
} from "@ascenta/db/performance-review-categories";
import { ReviewCycleFormDialog, type CycleFormValues } from "./review-cycle-form-dialog";

const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  annual: "Annual",
  mid_year: "Mid-year",
  ninety_day: "90-day",
  custom: "Custom",
};

const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
};

interface ReviewCycle {
  id: string;
  orgId: string;
  label: string;
  type: ReviewType;
  periodStart: string;
  periodEnd: string;
  selfAssessmentDeadline: string | null;
  managerDeadline: string | null;
  participantEmployeeIds: string[];
  status: CycleStatus;
  createdAt: string;
  updatedAt: string;
}

interface ReviewCyclesPanelProps {
  accentColor: string;
}

const STATUS_COLORS: Record<CycleStatus, string> = {
  draft: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  open: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  closed: "bg-gray-500/15 text-gray-600 border-gray-500/30",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewCyclesPanel({ accentColor }: ReviewCyclesPanelProps) {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ReviewCycle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCycles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/grow/review-cycles");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to load");
      setCycles(data.cycles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cycles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (cycle: ReviewCycle) => {
    setEditing(cycle);
    setFormError(null);
    setDialogOpen(true);
  };

  const changeStatus = async (cycle: ReviewCycle, next: CycleStatus) => {
    if (cycle.status === next) return;
    try {
      const res = await fetch(`/api/grow/review-cycles/${cycle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchCycles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleSubmit = async (values: CycleFormValues) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const url = editing
        ? `/api/grow/review-cycles/${editing.id}`
        : "/api/grow/review-cycles";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = typeof data.error === "string"
          ? data.error
          : "Validation failed — check field values";
        throw new Error(msg);
      }
      setDialogOpen(false);
      setEditing(null);
      await fetchCycles();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save cycle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            Review Cycles
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure performance review periods, cadence, and participants
          </p>
        </div>
        <Button onClick={openCreate} style={{ backgroundColor: accentColor }}>
          <Plus className="size-4 mr-1" /> New Cycle
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading cycles…</div>
      ) : cycles.length === 0 ? (
        <EmptyState accentColor={accentColor} onCreate={openCreate} />
      ) : (
        <div className="space-y-3">
          {cycles.map((c) => (
            <CycleCard
              key={c.id}
              cycle={c}
              onEdit={() => openEdit(c)}
              onChangeStatus={(next) => changeStatus(c, next)}
            />
          ))}
        </div>
      )}

      <ReviewCycleFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        initialValues={editing ?? undefined}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={formError}
      />
    </div>
  );
}

function EmptyState({
  accentColor,
  onCreate,
}: {
  accentColor: string;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-16 text-center">
      <ClipboardList className="size-8 text-muted-foreground/40 mb-3" />
      <h3 className="font-display text-base font-bold text-foreground mb-1">
        No review cycles yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        Cycles define the review period, deadlines, and participants for a wave of
        performance reviews. Create your first cycle to get started.
      </p>
      <Button onClick={onCreate} style={{ backgroundColor: accentColor }}>
        <Plus className="size-4 mr-1" /> Create cycle
      </Button>
    </div>
  );
}

function CycleCard({
  cycle,
  onEdit,
  onChangeStatus,
}: {
  cycle: ReviewCycle;
  onEdit: () => void;
  onChangeStatus: (next: CycleStatus) => void;
}) {
  const participantCount = cycle.participantEmployeeIds?.length ?? 0;

  return (
    <div className="rounded-lg border bg-card px-4 py-3 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-foreground truncate">
            {cycle.label}
          </h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            {REVIEW_TYPE_LABELS[cycle.type] ?? cycle.type}
          </Badge>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[cycle.status]}`}
          >
            {CYCLE_STATUS_LABELS[cycle.status] ?? cycle.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(cycle.periodStart)} → {formatDate(cycle.periodEnd)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {participantCount === 0 ? "All employees" : `${participantCount} participants`}
          </span>
          {cycle.selfAssessmentDeadline && (
            <span>Self due: {formatDate(cycle.selfAssessmentDeadline)}</span>
          )}
          {cycle.managerDeadline && (
            <span>Manager due: {formatDate(cycle.managerDeadline)}</span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {cycle.status === "draft" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChangeStatus("open")}
            aria-label="Open cycle"
          >
            <Play className="size-3 mr-1" /> Open
          </Button>
        )}
        {cycle.status === "open" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChangeStatus("closed")}
            aria-label="Close cycle"
          >
            <Lock className="size-3 mr-1" /> Close
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit cycle">
          <Pencil className="size-3" />
        </Button>
      </div>
    </div>
  );
}

// Re-export so callers can discover the type alongside the panel
export type { CycleStatus, ReviewType };
export { REVIEW_TYPES, CYCLE_STATUSES };
