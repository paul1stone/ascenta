"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeSheetProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmployeeDetail {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  managerName: string;
  hireDate: string;
  status: string;
}

interface EmployeeNote {
  id: string;
  noteType: string;
  title: string;
  content: string | null;
  severity: string | null;
  occurredAt: string;
}

interface TrackedDocument {
  id: string;
  title: string;
  documentType: string;
  stage: string;
  createdAt: string;
}

interface EmployeeResponse {
  employee: EmployeeDetail;
  notes: EmployeeNote[];
  documents: TrackedDocument[];
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "on_leave":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "terminated":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "on_leave":
      return "On Leave";
    case "terminated":
      return "Terminated";
    default:
      return status;
  }
}

function formatNoteType(noteType: string): string {
  switch (noteType) {
    case "written_warning":
      return "Written Warning";
    case "verbal_warning":
      return "Verbal Warning";
    case "pip":
      return "PIP";
    case "commendation":
      return "Commendation";
    case "late_notice":
      return "Late Notice";
    case "general":
      return "General";
    default:
      return noteType;
  }
}

function getNoteTypeBorderColor(noteType: string): string {
  switch (noteType) {
    case "written_warning":
      return "border-l-red-500";
    case "verbal_warning":
      return "border-l-amber-500";
    case "pip":
      return "border-l-orange-500";
    case "commendation":
      return "border-l-emerald-500";
    case "late_notice":
      return "border-l-yellow-500";
    case "general":
      return "border-l-slate-400";
    default:
      return "border-l-slate-400";
  }
}

function getSeverityBadgeClasses(severity: string): string {
  switch (severity) {
    case "high":
      return "bg-red-50 text-red-700 border border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "low":
      return "bg-slate-50 text-slate-600 border border-slate-200";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200";
  }
}

function getStageBadgeClasses(stage: string): string {
  switch (stage) {
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "on_us_to_send":
      return "bg-blue-50 text-blue-700";
    case "sent":
      return "bg-indigo-50 text-indigo-700";
    case "in_review":
      return "bg-amber-50 text-amber-700";
    case "acknowledged":
      return "bg-emerald-50 text-emerald-700";
    case "completed":
      return "bg-green-50 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatStage(stage: string): string {
  switch (stage) {
    case "draft":
      return "Draft";
    case "on_us_to_send":
      return "On Us to Send";
    case "sent":
      return "Sent";
    case "in_review":
      return "In Review";
    case "acknowledged":
      return "Acknowledged";
    case "completed":
      return "Completed";
    default:
      return stage;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDocumentType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Avatar and name */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
      {/* Notes */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export function EmployeeSheet({
  employeeId,
  open,
  onOpenChange,
}: EmployeeSheetProps) {
  const [data, setData] = useState<EmployeeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !employeeId) {
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/dashboard/employees/${employeeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch employee");
        return res.json();
      })
      .then((result: EmployeeResponse) => {
        setData(result);
      })
      .catch((err) => {
        console.error("Failed to fetch employee detail:", err);
        setError("Failed to load employee details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, employeeId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Employee Details</SheetTitle>
        </SheetHeader>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            {error}
          </div>
        ) : data ? (
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-summit to-summit-hover text-lg font-semibold text-white">
                  {getInitials(data.employee.firstName, data.employee.lastName)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-deep-blue">
                    {data.employee.firstName} {data.employee.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {data.employee.jobTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.employee.department}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border bg-slate-50/50 p-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Status
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(data.employee.status)}`}
                  >
                    {formatStatus(data.employee.status)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Hire Date
                  </p>
                  <p className="mt-1 text-sm text-deep-blue">
                    {formatDate(data.employee.hireDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Manager
                  </p>
                  <p className="mt-1 text-sm text-deep-blue">
                    {data.employee.managerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 truncate text-sm text-deep-blue">
                    {data.employee.email}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Employee ID
                  </p>
                  <p className="mt-1 text-sm font-mono text-deep-blue">
                    {data.employee.employeeId}
                  </p>
                </div>
              </div>

              {/* Notes Timeline */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-deep-blue">
                    Notes &amp; History
                  </h4>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {data.notes.length}
                  </span>
                </div>
                {data.notes.length > 0 ? (
                  <div className="space-y-3">
                    {data.notes.map((note) => (
                      <div
                        key={note.id}
                        className={`rounded-lg border border-l-4 bg-white p-3 ${getNoteTypeBorderColor(note.noteType)}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-deep-blue">
                              {note.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                                {formatNoteType(note.noteType)}
                              </span>
                              {note.severity && (
                                <span
                                  className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${getSeverityBadgeClasses(note.severity)}`}
                                >
                                  {note.severity.charAt(0).toUpperCase() +
                                    note.severity.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {note.content && (
                          <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                            {note.content}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground/70">
                          {formatDate(note.occurredAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No notes on file
                  </p>
                )}
              </div>

              {/* Documents Section */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-deep-blue">
                    Documents
                  </h4>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {data.documents.length}
                  </span>
                </div>
                {data.documents.length > 0 ? (
                  <div className="space-y-3">
                    {data.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-lg border bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-deep-blue">
                            {doc.title}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStageBadgeClasses(doc.stage)}`}
                          >
                            {formatStage(doc.stage)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDocumentType(doc.documentType)}
                          </span>
                          <span className="text-xs text-muted-foreground/50">
                            &middot;
                          </span>
                          <span className="text-xs text-muted-foreground/70">
                            {formatDate(doc.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No documents
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
