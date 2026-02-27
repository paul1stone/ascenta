"use client";

import { useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import { Textarea } from "@ascenta/ui/textarea";
import { useRole } from "@/lib/role/role-context";

interface GoalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GOAL_TYPES = [
  { label: "Individual", value: "individual" },
  { label: "Team", value: "team" },
  { label: "Role", value: "role" },
];

export function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const { role } = useRole();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statement, setStatement] = useState("");
  const [measure, setMeasure] = useState("");
  const [type, setType] = useState("individual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dependencies, setDependencies] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!statement.trim()) {
      setError("Goal statement is required.");
      return;
    }
    if (!measure.trim()) {
      setError("Success measure is required.");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        statement: statement.trim(),
        measure: measure.trim(),
        type,
      };

      if (startDate || endDate) {
        body.timeperiod = {
          ...(startDate ? { start: startDate } : {}),
          ...(endDate ? { end: endDate } : {}),
        };
      }

      if (dependencies.trim()) {
        body.dependencies = dependencies
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
      }

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ascenta-Role": role,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create goal.");
        return;
      }

      // Reset form
      setStatement("");
      setMeasure("");
      setType("individual");
      setStartDate("");
      setEndDate("");
      setDependencies("");

      onSuccess?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-deep-blue">
        Create Goal
      </h2>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Goal Statement */}
        <div className="space-y-2">
          <Label htmlFor="goal-statement">
            Goal Statement <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="goal-statement"
            placeholder="Describe what you want to achieve..."
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={3}
            required
          />
        </div>

        {/* Measure */}
        <div className="space-y-2">
          <Label htmlFor="goal-measure">
            How will you measure success? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="goal-measure"
            placeholder="Define measurable criteria for success..."
            value={measure}
            onChange={(e) => setMeasure(e.target.value)}
            rows={2}
            required
          />
        </div>

        {/* Goal Type */}
        <div className="space-y-2">
          <Label htmlFor="goal-type">Goal Type</Label>
          <select
            id="goal-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
          >
            {GOAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="goal-start-date">Start Date</Label>
            <Input
              id="goal-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-end-date">End Date</Label>
            <Input
              id="goal-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Dependencies */}
        <div className="space-y-2">
          <Label htmlFor="goal-dependencies">Dependencies</Label>
          <Input
            id="goal-dependencies"
            placeholder="e.g., Q1 budget approval, design review (comma-separated)"
            value={dependencies}
            onChange={(e) => setDependencies(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Separate multiple dependencies with commas.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Goal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
