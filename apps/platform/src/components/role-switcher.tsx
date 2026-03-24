"use client";

import { useRole } from "@/lib/role/role-context";
import type { RoleType } from "@/lib/role/personas";
import { cn } from "@ascenta/ui";
import { Loader2, AlertCircle } from "lucide-react";

const ROLE_LABELS: Record<RoleType, string> = {
  hr: "HR",
  manager: "Manager",
  employee: "Employee",
};

export function RoleSwitcher() {
  const { role, persona, loading, setRole, setPersona, personas } = useRole();

  return (
    <div className="flex items-center gap-2">
      {/* Role segmented control */}
      <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
        {(["hr", "manager", "employee"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              role === r
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Persona dropdown */}
      <div className="flex items-center gap-1.5">
        {loading ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : persona ? (
          <select
            value={`${persona.firstName} ${persona.lastName}`}
            onChange={(e) => {
              const selected = personas.find(
                (p) => `${p.firstName} ${p.lastName}` === e.target.value,
              );
              if (selected) setPersona(selected);
            }}
            className="h-7 rounded-md border bg-white px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1"
          >
            {personas.map((p) => (
              <option key={`${p.firstName}-${p.lastName}`} value={`${p.firstName} ${p.lastName}`}>
                {p.firstName} {p.lastName} — {p.title}
              </option>
            ))}
          </select>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="size-3" />
            Run db:seed
          </span>
        )}
      </div>
    </div>
  );
}
