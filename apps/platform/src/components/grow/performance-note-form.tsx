"use client";

import { useEffect, useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import { Textarea } from "@ascenta/ui/textarea";

const NOTE_TYPES = [
  { value: "observation", label: "Observation" },
  { value: "feedback", label: "Feedback" },
  { value: "coaching", label: "Coaching" },
  { value: "recognition", label: "Recognition" },
  { value: "concern", label: "Concern" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "manager_only", label: "Manager Only" },
  { value: "hr_only", label: "HR Only" },
  { value: "shared_with_employee", label: "Shared with Employee" },
] as const;

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface PerformanceNoteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PerformanceNoteForm({ onSuccess, onCancel }: PerformanceNoteFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [employeeId, setEmployeeId] = useState("");
  const [noteType, setNoteType] = useState("observation");
  const [content, setContent] = useState("");
  const [context, setContext] = useState("");
  const [visibility, setVisibility] = useState("manager_only");

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/dashboard/employees");
        const data = await res.json();
        setEmployees(data.employees ?? []);
      } catch {
        console.error("Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    }
    fetchEmployees();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeId || !noteType || !content.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/performance-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee: employeeId,
          type: noteType,
          content: content.trim(),
          context: context.trim() || undefined,
          visibility,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create note");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-deep-blue">
        Add Performance Note
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Employee */}
        <div className="space-y-1.5">
          <Label htmlFor="pn-employee">Employee</Label>
          <select
            id="pn-employee"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={loadingEmployees}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50 md:text-sm"
          >
            <option value="">
              {loadingEmployees ? "Loading..." : "Select an employee"}
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Note Type */}
        <div className="space-y-1.5">
          <Label htmlFor="pn-type">Note Type</Label>
          <select
            id="pn-type"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm"
          >
            {NOTE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Label htmlFor="pn-content">Content</Label>
          <Textarea
            id="pn-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe the observation, feedback, or coaching note..."
            rows={4}
            required
          />
        </div>

        {/* Context */}
        <div className="space-y-1.5">
          <Label htmlFor="pn-context">Context (optional)</Label>
          <Input
            id="pn-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., During 1:1 meeting"
          />
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <Label htmlFor="pn-visibility">Visibility</Label>
          <select
            id="pn-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm"
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
