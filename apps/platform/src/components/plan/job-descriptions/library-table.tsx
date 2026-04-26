"use client";

import { Badge } from "@ascenta/ui/badge";
import {
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@ascenta/db/job-description-constants";
import type { ListedJobDescription } from "@ascenta/db/job-descriptions";

interface LibraryTableProps {
  items: ListedJobDescription[];
  onSelect: (id: string) => void;
}

export function LibraryTable({ items, onSelect }: LibraryTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
        No job descriptions match your filters.
      </div>
    );
  }
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Department</th>
            <th className="text-left p-3 font-medium">Level</th>
            <th className="text-left p-3 font-medium">Employment</th>
            <th className="text-right p-3 font-medium">Assigned</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-t hover:bg-muted/20 cursor-pointer"
              onClick={() => onSelect(it.id)}
            >
              <td className="p-3 font-medium">{it.title}</td>
              <td className="p-3">{it.department}</td>
              <td className="p-3">{LEVEL_LABELS[it.level]}</td>
              <td className="p-3">{EMPLOYMENT_TYPE_LABELS[it.employmentType]}</td>
              <td className="p-3 text-right">
                <Badge variant="secondary">{it.assignedCount}</Badge>
              </td>
              <td className="p-3">
                {it.status === "draft" ? (
                  <Badge variant="outline">Draft</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Published</span>
                )}
              </td>
              <td className="p-3 text-xs text-muted-foreground">
                {new Date(it.updatedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
