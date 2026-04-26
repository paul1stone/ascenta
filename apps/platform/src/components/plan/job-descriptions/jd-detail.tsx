"use client";

import { useEffect, useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Badge } from "@ascenta/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/dialog";
import {
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@ascenta/db/job-description-constants";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { JdForm } from "./jd-form";
import { JdAssignDialog } from "./jd-assign-dialog";

interface AssignedEmployee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
}

interface JdDetailProps {
  jobDescription: ListedJobDescription;
  onChanged: () => void;
  onDeleted: () => void;
}

export function JdDetail({ jobDescription, onChanged, onDeleted }: JdDetailProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadEmployees() {
    const res = await fetch(
      `/api/job-descriptions/${jobDescription.id}/employees`,
    );
    const json = await res.json();
    setEmployees(json.employees ?? []);
  }

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobDescription.id]);

  async function unassign(employeeId: string) {
    await fetch(`/api/job-descriptions/${jobDescription.id}/employees`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ employeeIds: [employeeId] }),
    });
    await loadEmployees();
    onChanged();
  }

  async function performDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/job-descriptions/${jobDescription.id}`, {
        method: "DELETE",
      });
      onDeleted();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (mode === "edit") {
    return (
      <JdForm
        mode="edit"
        initialValues={{ ...jobDescription, id: jobDescription.id }}
        onSuccess={() => {
          onChanged();
          setMode("view");
        }}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">{jobDescription.title}</h2>
          <p className="text-sm text-muted-foreground">
            {jobDescription.department} · {LEVEL_LABELS[jobDescription.level]} ·{" "}
            {EMPLOYMENT_TYPE_LABELS[jobDescription.employmentType]}
          </p>
          {jobDescription.status === "draft" && (
            <Badge variant="outline" className="mt-2">Draft</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
            <Pencil className="size-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        </div>
      </header>

      <Section title="Role Summary">
        <p className="text-sm whitespace-pre-line">{jobDescription.roleSummary}</p>
      </Section>
      <BulletSection title="Core Responsibilities" items={jobDescription.coreResponsibilities} />
      <BulletSection title="Required Qualifications" items={jobDescription.requiredQualifications} />
      {jobDescription.preferredQualifications.length > 0 && (
        <BulletSection
          title="Preferred Qualifications"
          items={jobDescription.preferredQualifications}
        />
      )}
      <BulletSection title="Competencies" items={jobDescription.competencies} />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-display font-semibold">
            Assigned Employees{" "}
            <span className="text-sm text-muted-foreground">({employees.length})</span>
          </h3>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus className="size-4 mr-1" />
            Assign Employee
          </Button>
        </div>
        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded border border-dashed p-6 text-center">
            No employees assigned yet.
          </p>
        ) : (
          <ul className="rounded border divide-y">
            {employees.map((e) => (
              <li key={e.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-medium">
                    {e.firstName} {e.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.jobTitle} · {e.department}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unassign(e.id)}
                >
                  Unassign
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <JdAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        jobDescriptionId={jobDescription.id}
        onAssigned={() => {
          loadEmployees();
          onChanged();
        }}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this job description?</DialogTitle>
            <DialogDescription>
              This will also unassign {employees.length} employee
              {employees.length === 1 ? "" : "s"} currently assigned to this role.
              Their <code>jobTitle</code> field will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button onClick={performDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
      {children}
    </section>
  );
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Section title={title}>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </Section>
  );
}
