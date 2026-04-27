"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Calendar, MapPin, Building2, UserCircle } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ascenta/ui/select";
import type { DateRange, FilterState } from "@/lib/insights/types";
import { rangeLabel } from "@/lib/insights/filters";
import { MOCK_LOCATIONS, MOCK_DEPARTMENTS } from "@/lib/insights/mock-data";

const RANGES: DateRange[] = ["30d", "90d", "6m", "12m"];

interface FilterBarProps {
  filters: FilterState;
  showManager?: boolean;
}

export function FilterBar({ filters, showManager = false }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string, fallback: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === fallback) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border bg-white px-3 py-2",
        isPending && "opacity-70",
      )}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Filters
      </span>

      <FilterControl icon={<Calendar className="size-3.5" />} label="Date">
        <Select
          value={filters.range}
          onValueChange={(v) => setParam("range", v, "30d")}
        >
          <SelectTrigger className="h-8 text-xs w-[150px]" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r} value={r} className="text-xs">
                {rangeLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterControl>

      <FilterControl icon={<MapPin className="size-3.5" />} label="Location">
        <Select
          value={filters.location}
          onValueChange={(v) => setParam("loc", v, "all")}
        >
          <SelectTrigger className="h-8 text-xs w-[160px]" aria-label="Location">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All locations</SelectItem>
            {MOCK_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc} className="text-xs">
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterControl>

      <FilterControl icon={<Building2 className="size-3.5" />} label="Department">
        <Select
          value={filters.department}
          onValueChange={(v) => setParam("dept", v, "all")}
        >
          <SelectTrigger className="h-8 text-xs w-[170px]" aria-label="Department">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All departments</SelectItem>
            {MOCK_DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept} className="text-xs">
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterControl>

      {showManager && (
        <FilterControl icon={<UserCircle className="size-3.5" />} label="Manager">
          <Select
            value={filters.manager}
            onValueChange={(v) => setParam("mgr", v, "all")}
          >
            <SelectTrigger className="h-8 text-xs w-[170px]" aria-label="Manager">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All managers</SelectItem>
              <SelectItem value="katie-smith" className="text-xs">Katie Smith</SelectItem>
              <SelectItem value="darius-okafor" className="text-xs">Darius Okafor</SelectItem>
              <SelectItem value="lauren-park" className="text-xs">Lauren Park</SelectItem>
              <SelectItem value="miguel-torres" className="text-xs">Miguel Torres</SelectItem>
              <SelectItem value="sasha-ng" className="text-xs">Sasha Ng</SelectItem>
            </SelectContent>
          </Select>
        </FilterControl>
      )}
    </div>
  );
}

function FilterControl({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground" aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
