"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@ascenta/ui/sheet";
import { Plus, Upload, Compass, Wrench } from "lucide-react";
import Link from "next/link";
import { JdPickerDialog } from "./jd-picker-dialog";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";
import { LibraryFilterBar, type LibraryFilters } from "./library-filter-bar";
import { LibraryTable } from "./library-table";
import { JdForm } from "./jd-form";
import { JdDetail } from "./jd-detail";
import { JdImportStubDialog } from "./jd-import-stub-dialog";
import { useAuth } from "@/lib/auth/auth-context";
import { withUserHeader } from "@/lib/auth/with-user-header";

const initialFilters: LibraryFilters = {
  q: "",
  department: "",
  level: "",
  employmentType: "",
  status: "published",
};

export function LibraryView() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const isHr = user?.role === "hr";
  const isEmployee = user?.role === "employee";
  const lockedDepartment = isManager ? user?.department : undefined;
  const canCreate = isHr || isManager;
  const canEdit = isHr || isManager;
  const canDelete = isHr || isManager;
  const canAssign = isHr || isManager;

  const [items, setItems] = useState<ListedJobDescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LibraryFilters>(() =>
    lockedDepartment
      ? { ...initialFilters, department: lockedDepartment }
      : initialFilters,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep manager filter pinned to their department even if they try to override.
  useEffect(() => {
    if (lockedDepartment && filters.department !== lockedDepartment) {
      setFilters((f) => ({ ...f, department: lockedDepartment }));
    }
  }, [lockedDepartment, filters.department]);

  async function fetchList(current: LibraryFilters) {
    if (isEmployee) {
      // Employees should not be reading the JD library.
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (current.q) params.set("q", current.q);
      if (current.department) params.set("department", current.department);
      if (current.level) params.set("level", current.level);
      if (current.employmentType) params.set("employmentType", current.employmentType);
      params.set("status", current.status);
      const res = await fetch(`/api/job-descriptions?${params.toString()}`, {
        headers: withUserHeader(user?.id),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const json = await res.json();
      setItems(json.jobDescriptions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchList(filters), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user?.id, user?.role]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.department);
    if (lockedDepartment) set.add(lockedDepartment);
    return Array.from(set).sort();
  }, [items, lockedDepartment]);

  const selected = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  );

  if (isEmployee) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Job Description Library
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your own role and job description live in the <strong>My Role</strong> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold">Job Descriptions</h2>
          <p className="text-xs text-muted-foreground">
            {isManager
              ? `Job descriptions for the ${user?.department} department.`
              : "The authoritative library of role definitions across the organization."}
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4 mr-1" />
              Import
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-1" />
              New Job Description
            </Button>
          )}
        </div>
      </header>

      {canCreate && (
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/do?prompt=${encodeURIComponent("Help me build a job description")}&tool=startJobDescriptionWorkflow`}
            className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
            style={{
              borderColor: "rgba(255, 107, 53, 0.3)",
              background: "rgba(255, 107, 53, 0.03)",
            }}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
            >
              <Compass className="size-[18px]" style={{ color: "#ff6b35" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-deep-blue">
                Build a JD with Compass
              </p>
              <p className="text-xs text-muted-foreground truncate">
                AI-guided JD creation
              </p>
            </div>
          </Link>

          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md text-left"
            style={{
              borderColor: "rgba(102, 136, 187, 0.3)",
              background: "rgba(102, 136, 187, 0.03)",
            }}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(102, 136, 187, 0.1)" }}
            >
              <Wrench className="size-[18px]" style={{ color: "#6688bb" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-deep-blue">
                Refine an existing JD
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Polish or expand any JD in your library
              </p>
            </div>
          </button>
        </div>
      )}

      <LibraryFilterBar
        value={filters}
        onChange={setFilters}
        departments={departments}
        lockedDepartment={lockedDepartment}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <LibraryTable items={items} onSelect={setSelectedId} />
      )}

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0 gap-0">
          <SheetHeader className="border-b px-6 pt-6 pb-4">
            <SheetTitle>New Job Description</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <JdForm
              mode="create"
              lockedDepartment={lockedDepartment}
              onSuccess={() => {
                setCreateOpen(false);
                fetchList(filters);
              }}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-[700px] sm:max-w-[700px] p-0 gap-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Job Description Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <JdDetail
                jobDescription={selected}
                canEdit={canEdit}
                canDelete={canDelete}
                canAssign={canAssign}
                lockedDepartment={lockedDepartment}
                onChanged={() => fetchList(filters)}
                onDeleted={() => {
                  setSelectedId(null);
                  fetchList(filters);
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <JdImportStubDialog open={importOpen} onOpenChange={setImportOpen} />
      <JdPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
}
