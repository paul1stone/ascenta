"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@ascenta/ui/sheet";
import { Plus, Upload } from "lucide-react";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";
import { LibraryFilterBar, type LibraryFilters } from "./library-filter-bar";
import { LibraryTable } from "./library-table";
import { JdForm } from "./jd-form";
import { JdDetail } from "./jd-detail";
import { JdImportStubDialog } from "./jd-import-stub-dialog";

const initialFilters: LibraryFilters = {
  q: "",
  department: "",
  level: "",
  employmentType: "",
  status: "published",
};

export function LibraryView() {
  const [items, setItems] = useState<ListedJobDescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LibraryFilters>(initialFilters);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchList(current: LibraryFilters) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (current.q) params.set("q", current.q);
      if (current.department) params.set("department", current.department);
      if (current.level) params.set("level", current.level);
      if (current.employmentType) params.set("employmentType", current.employmentType);
      params.set("status", current.status);
      const res = await fetch(`/api/job-descriptions?${params.toString()}`);
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
  }, [filters]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.department);
    return Array.from(set).sort();
  }, [items]);

  const selected = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold">Job Descriptions</h2>
          <p className="text-xs text-muted-foreground">
            The authoritative library of role definitions across the organization.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="size-4 mr-1" />
            Import
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-1" />
            New Job Description
          </Button>
        </div>
      </header>

      <LibraryFilterBar
        value={filters}
        onChange={setFilters}
        departments={departments}
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
    </div>
  );
}
