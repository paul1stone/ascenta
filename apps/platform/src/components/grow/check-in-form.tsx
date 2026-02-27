"use client";

import { useEffect, useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";

interface Goal {
  id: string;
  statement: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface CheckInFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CADENCE_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
] as const;

export function CheckInForm({ onSuccess, onCancel }: CheckInFormProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goalId, setGoalId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [cadence, setCadence] = useState("biweekly");

  useEffect(() => {
    async function fetchGoals() {
      try {
        const res = await fetch("/api/goals?status=active");
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch {
        console.error("Failed to load goals");
      } finally {
        setLoadingGoals(false);
      }
    }
    fetchGoals();
  }, []);

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

    if (!goalId || !employeeId || !scheduledDate) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goalId,
          employee: employeeId,
          scheduledDate,
          cadence,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to schedule check-in");
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
        Schedule Check-in
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ci-goal">
            Goal <span className="text-red-500">*</span>
          </Label>
          <select
            id="ci-goal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            disabled={loadingGoals}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50 md:text-sm"
          >
            <option value="">
              {loadingGoals ? "Loading..." : "Select a goal"}
            </option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.statement}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ci-employee">
            Employee <span className="text-red-500">*</span>
          </Label>
          <select
            id="ci-employee"
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

        <div className="space-y-1.5">
          <Label htmlFor="ci-date">
            Scheduled Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ci-date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ci-cadence">Cadence</Label>
          <select
            id="ci-cadence"
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm"
          >
            {CADENCE_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule Check-in"}
          </Button>
        </div>
      </form>
    </div>
  );
}
