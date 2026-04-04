"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import { cn } from "@ascenta/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ascenta/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ascenta/ui/command";

export interface EmployeeOption {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
}

interface EmployeeComboboxProps {
  value: string | null;
  onChange: (employee: EmployeeOption | null) => void;
  /** If set, only show employees in this department */
  department?: string;
  /** Label for the "all" / self option */
  selfLabel?: string;
  className?: string;
}

export function EmployeeCombobox({
  value,
  onChange,
  department,
  selfLabel = "My Goals",
  className,
}: EmployeeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (department) params.set("department", department);
      const res = await fetch(`/api/dashboard/employees?${params}`);
      const data = await res.json();
      if (data.employees) {
        setEmployees(
          data.employees.map(
            (e: Record<string, string>) => ({
              id: e.id,
              employeeId: e.employeeId,
              firstName: e.firstName,
              lastName: e.lastName,
              department: e.department,
              jobTitle: e.jobTitle,
            }),
          ),
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const selected = value
    ? employees.find((e) => e.id === value)
    : null;

  const displayLabel = selected
    ? `${selected.firstName} ${selected.lastName}`
    : selfLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-white",
            value && "text-foreground",
            className,
          )}
        >
          <Users className="size-3.5" />
          <span className="truncate max-w-[160px]">{displayLabel}</span>
          <ChevronsUpDown className="size-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No employees found."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__self__"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
                {selfLabel}
              </CommandItem>
              {employees.map((emp) => (
                <CommandItem
                  key={emp.id}
                  value={`${emp.firstName} ${emp.lastName} ${emp.department}`}
                  onSelect={() => {
                    onChange(emp.id === value ? null : emp);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === emp.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {emp.department} — {emp.jobTitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
