"use client";

import { useState } from "react";
import { Bell, Download, Settings2 } from "lucide-react";
import { Button } from "@ascenta/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@ascenta/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import { Label } from "@ascenta/ui/label";
import type { BreakdownRow } from "@/lib/insights/types";

interface DigestExportActionsProps {
  exportFilename: string;
  exportRows: Array<{ label: string; value: string }>;
  /** Optional drill-down rows for richer CSV. */
  breakdown?: BreakdownRow[];
}

export function DigestExportActions({ exportFilename, exportRows, breakdown }: DigestExportActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <DigestSettings />
      <ExportButton filename={exportFilename} rows={exportRows} breakdown={breakdown} />
    </div>
  );
}

function DigestSettings() {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [delivery, setDelivery] = useState("in_platform");
  const [saved, setSaved] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <Bell className="size-3.5" />
          Canopy Digest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-4" />
            Canopy Digest preferences
          </DialogTitle>
          <DialogDescription className="text-xs">
            A summary of the Org Health Score, top risk signals, and items moved
            to red — delivered on your cadence.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="freq" className="text-xs">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="freq" className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                <SelectItem value="daily" className="text-xs">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delivery" className="text-xs">Delivery</Label>
            <Select value={delivery} onValueChange={setDelivery}>
              <SelectTrigger id="delivery" className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_platform" className="text-xs">In-platform notification</SelectItem>
                <SelectItem value="email" className="text-xs">Email summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {saved && (
            <p className="text-[11px] text-emerald-700">
              Preferences saved (demo — no notifications are sent yet).
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setOpen(false), 800);
            }}
          >
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExportButton({
  filename,
  rows,
  breakdown,
}: {
  filename: string;
  rows: Array<{ label: string; value: string }>;
  breakdown?: BreakdownRow[];
}) {
  function handleDownload() {
    const lines: string[] = [];
    lines.push("Section,Metric,Value");
    for (const row of rows) {
      lines.push(`Summary,"${escape(row.label)}","${escape(row.value)}"`);
    }
    if (breakdown && breakdown.length > 0) {
      lines.push("");
      lines.push("Breakdown,Group,Value,Cohort,Health");
      for (const row of breakdown) {
        lines.push(
          `Breakdown,"${escape(row.label)}","${escape(row.display)}",${row.cohortSize ?? ""},${row.health ?? ""}`,
        );
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs gap-1.5"
      onClick={handleDownload}
    >
      <Download className="size-3.5" />
      Export CSV
    </Button>
  );
}

function escape(s: string): string {
  return s.replace(/"/g, '""');
}
