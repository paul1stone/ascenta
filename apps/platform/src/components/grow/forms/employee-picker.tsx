"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@ascenta/ui/input";
import { Label } from "@ascenta/ui/label";
import { Search, User } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
}

interface EmployeePickerProps {
  onSelect: (employeeId: string, employeeName: string) => void;
}

export function EmployeePicker({ onSelect }: EmployeePickerProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/dashboard/employees?search=${encodeURIComponent(search)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.employees ?? []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <Label htmlFor="employee-search">
        Employee <span className="text-destructive">*</span>
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="employee-search"
          placeholder="Search employees..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => search.length >= 2 && setIsOpen(true)}
          className="pl-9"
        />
      </div>
      {isOpen && (results.length > 0 || isLoading || search.length >= 2) && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  const name = `${emp.firstName} ${emp.lastName}`;
                  onSelect(emp.id, name);
                  setSearch(name);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-glacier/50"
              >
                <User className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-deep-blue">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {emp.jobTitle} · {emp.department}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No employees found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
