"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/dialog";
import { Input } from "@ascenta/ui/input";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";
import { useAuth } from "@/lib/auth/auth-context";
import { withUserHeader } from "@/lib/auth/with-user-header";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JdPickerDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ListedJobDescription[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  async function fetchList(query: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("status", "published");
      const res = await fetch(`/api/job-descriptions?${params.toString()}`, {
        headers: withUserHeader(user?.id),
      });
      const json = await res.json();
      setItems(json.jobDescriptions ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchList(q), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, open]);

  function pick(item: ListedJobDescription) {
    const params = new URLSearchParams({
      prompt: `Refine "${item.title}"`,
      tool: "startJobDescriptionWorkflow",
      jobDescriptionId: item.id,
    });
    onOpenChange(false);
    router.push(`/do?${params.toString()}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Refine an existing JD</DialogTitle>
          <DialogDescription>
            Pick a job description to refine with Compass.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search by title or department..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-[320px] overflow-y-auto -mx-2 mt-2">
          {loading && (
            <p className="text-sm text-muted-foreground px-2 py-1">
              Loading...
            </p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-1">
              No matches.
            </p>
          )}
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => pick(it)}
              className="w-full text-left rounded-md px-2 py-2 hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm font-medium">{it.title}</p>
              <p className="text-xs text-muted-foreground">{it.department}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
