"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ascenta/ui/popover";
import { Button } from "@ascenta/ui/button";
import { Check, ChevronDown, ShieldCheck, User, Users } from "lucide-react";
import { cn } from "@ascenta/ui";

type PersonaRole = "employee" | "manager" | "hr";

type PickerUser = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  title: string;
  role: PersonaRole;
};

const ROLE_META: Record<
  PersonaRole,
  { label: string; icon: typeof User; iconBg: string; accent: string; description: string }
> = {
  employee: {
    label: "Employee",
    icon: User,
    iconBg: "bg-emerald-500/15 text-emerald-600",
    accent: "border-emerald-500/40",
    description: "Individual contributor view",
  },
  manager: {
    label: "Manager",
    icon: Users,
    iconBg: "bg-blue-500/15 text-blue-600",
    accent: "border-blue-500/40",
    description: "Team leader view",
  },
  hr: {
    label: "HR",
    icon: ShieldCheck,
    iconBg: "bg-purple-500/15 text-purple-600",
    accent: "border-purple-500/40",
    description: "People operations view",
  },
};

export function UserPicker() {
  const { user, switchUser, loading } = useAuth();
  const [users, setUsers] = useState<PickerUser[]>([]);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    if (open && users.length === 0) {
      setFetchError(false);
      fetch("/api/auth/users")
        .then((r) => r.json())
        .then((data) => setUsers(data.users || []))
        .catch(() => setFetchError(true));
    }
  }, [open, users.length]);

  const TriggerIcon = user ? ROLE_META[user.role].icon : User;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <TriggerIcon className="h-4 w-4" />
          {loading ? (
            "Loading..."
          ) : user ? (
            <>
              <span className="text-sm">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                {ROLE_META[user.role].label}
              </span>
            </>
          ) : (
            "Select User"
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="end">
        <div className="mb-2 px-1">
          <div className="text-xs font-semibold text-foreground">Demo identities</div>
          <div className="text-[11px] text-muted-foreground">
            Switch role to preview the experience
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {fetchError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-3 text-xs text-destructive">
              Failed to load demo users
            </div>
          )}
          {!fetchError && users.length === 0 && (
            <div className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
              Loading personas…
            </div>
          )}
          {users.map((u) => {
            const meta = ROLE_META[u.role];
            const Icon = meta.icon;
            const isActive = user?.id === u.id;
            const isSwitching = switching === u.id;
            return (
              <button
                key={u.id}
                disabled={isSwitching}
                onClick={async () => {
                  setSwitching(u.id);
                  try {
                    await switchUser(u.id);
                    setOpen(false);
                  } finally {
                    setSwitching(null);
                  }
                }}
                className={cn(
                  "group relative flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition-all",
                  "hover:border-foreground/30 hover:shadow-sm",
                  isActive ? `${meta.accent} ring-1 ring-current/20` : "border-border",
                  isSwitching && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md",
                    meta.iconBg
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {u.name}
                    </span>
                    {isActive && (
                      <Check className="size-4 shrink-0 text-foreground" aria-label="Active" />
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{u.title}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    <span>{meta.label}</span>
                    <span aria-hidden>·</span>
                    <span className="truncate">{u.department}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
