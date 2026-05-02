"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/dialog";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { useAuth } from "@/lib/auth/auth-context";
import { withUserHeader } from "@/lib/auth/with-user-header";

interface EmployeeRow {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  jobDescriptionId: string | null;
  jobDescriptionTitle?: string | null;
}

interface JdAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescriptionId: string;
  /** When set, only employees in this department are listed (manager view). */
  departmentFilter?: string;
  onAssigned: () => void;
}

export function JdAssignDialog({
  open,
  onOpenChange,
  jobDescriptionId,
  departmentFilter,
  onAssigned,
}: JdAssignDialogProps) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setSearch("");
    fetch("/api/dashboard/employees?limit=500")
      .then((r) => r.json())
      .then((data) =>
        setEmployees(
          (data.employees ?? []).filter(
            (e: EmployeeRow) =>
              e.jobDescriptionId !== jobDescriptionId &&
              (!departmentFilter || e.department === departmentFilter),
          ),
        ),
      )
      .catch((err) => setError(err.message ?? "Failed to load employees"));
  }, [open, jobDescriptionId, departmentFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q),
    );
  }, [employees, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/job-descriptions/${jobDescriptionId}/employees`,
        {
          method: "POST",
          headers: withUserHeader(user?.id, { "content-type": "application/json" }),
          body: JSON.stringify({ employeeIds: Array.from(selected) }),
        },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed with ${res.status}`);
      }
      onAssigned();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Employees</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name, department, or current title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search employees"
        />
        <div className="max-h-96 overflow-y-auto border rounded">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No employees found.
            </p>
          ) : (
            <ul className="divide-y">
              {filtered.map((e) => (
                <li key={e.id} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(e.id)}
                    onChange={() => toggle(e.id)}
                    aria-label={`Select ${e.firstName} ${e.lastName}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {e.firstName} {e.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.jobTitle} · {e.department}
                      {e.jobDescriptionTitle &&
                        ` · Currently: ${e.jobDescriptionTitle}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || selected.size === 0}
          >
            {submitting ? "Assigning..." : `Assign ${selected.size} employee${selected.size === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
