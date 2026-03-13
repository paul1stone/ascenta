"use client";

import Link from "next/link";

interface CategoryStatusCardProps {
  label: string;
  subtitle: string;
  color: string;
  detailHref?: string;
  children: React.ReactNode;
}

export function CategoryStatusCard({
  label,
  subtitle,
  color,
  detailHref,
  children,
}: CategoryStatusCardProps) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-bold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        {detailHref && (
          <Link
            href={detailHref}
            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            View Details →
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
