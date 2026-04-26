"use client";

import { Input } from "@ascenta/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@ascenta/db/job-description-constants";

export interface LibraryFilters {
  q: string;
  department: string;
  level: string; // "" = any
  employmentType: string;
  status: "published" | "all";
}

interface LibraryFilterBarProps {
  value: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  departments: string[];
}

export function LibraryFilterBar({
  value,
  onChange,
  departments,
}: LibraryFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search title or summary..."
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
        className="w-64"
        aria-label="Search job descriptions"
      />
      <Select
        value={value.department || "any"}
        onValueChange={(v) =>
          onChange({ ...value, department: v === "any" ? "" : v })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by department">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">All departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.level || "any"}
        onValueChange={(v) =>
          onChange({ ...value, level: v === "any" ? "" : v })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filter by level">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">All levels</SelectItem>
          {LEVEL_OPTIONS.map((l) => (
            <SelectItem key={l} value={l}>
              {LEVEL_LABELS[l]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.employmentType || "any"}
        onValueChange={(v) =>
          onChange({ ...value, employmentType: v === "any" ? "" : v })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by employment type">
          <SelectValue placeholder="Employment type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">All types</SelectItem>
          {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
            <SelectItem key={t} value={t}>
              {EMPLOYMENT_TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.status}
        onValueChange={(v) =>
          onChange({ ...value, status: v as LibraryFilters["status"] })
        }
      >
        <SelectTrigger className="w-32" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
