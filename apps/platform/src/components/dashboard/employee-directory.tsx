"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@ascenta/ui/input";
import { Button } from "@ascenta/ui/button";
import { Skeleton } from "@ascenta/ui/skeleton";
import { EmployeeSheet } from "@/components/dashboard/employee-sheet";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  status: "active" | "on_leave" | "terminated";
  hireDate: string;
  notesCount: number;
  documentsCount: number;
}

interface EmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}

const DEPARTMENTS = [
  "All",
  "Engineering",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
  "Operations",
  "Legal",
];

const STATUSES = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "On Leave", value: "on_leave" },
  { label: "Terminated", value: "terminated" },
];

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "on_leave":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "terminated":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "on_leave":
      return "On Leave";
    case "terminated":
      return "Terminated";
    default:
      return status;
  }
}

function formatHireDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function EmployeeDirectory() {
  const [data, setData] = useState<EmployeesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (department !== "All") params.set("department", department);
      if (status !== "all") params.set("status", status);
      params.set("page", String(page));

      const res = await fetch(`/api/dashboard/employees?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, department, status, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="font-display text-base font-semibold text-deep-blue">
          Employee Directory
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "All" ? "All Departments" : dept}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label === "All" ? "All Statuses" : s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/50">
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                Department
              </th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                Job Title
              </th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                Hire Date
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                </tr>
              ))
            ) : data?.employees && data.employees.length > 0 ? (
              data.employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-deep-blue/10 text-xs font-medium text-deep-blue">
                        {getInitials(`${employee.firstName} ${employee.lastName}`)}
                      </div>
                      <button
                        onClick={() => setSelectedEmployeeId(employee.id)}
                        className="font-medium text-deep-blue hover:text-summit hover:underline text-left"
                      >
                        {employee.firstName} {employee.lastName}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {employee.department}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {employee.jobTitle}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(employee.status)}`}
                    >
                      {formatStatus(employee.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {formatHireDate(employee.hireDate)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && Math.ceil(data.total / data.limit) > 1 && (
        <div className="flex items-center justify-between border-t px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.page} of {Math.ceil(data.total / data.limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(Math.ceil(data.total / data.limit), p + 1))}
            disabled={page >= Math.ceil(data.total / data.limit)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      <EmployeeSheet
        employeeId={selectedEmployeeId}
        open={!!selectedEmployeeId}
        onOpenChange={(open) => { if (!open) setSelectedEmployeeId(null); }}
      />
    </div>
  );
}
