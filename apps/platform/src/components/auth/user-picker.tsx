"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ascenta/ui/popover";
import { Button } from "@ascenta/ui/button";
import { ChevronDown, User, Shield, Users } from "lucide-react";
import { cn } from "@ascenta/ui";

type PickerUser = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  jobTitle: string;
  role: "manager" | "employee" | "hr";
};

const roleIcons = {
  manager: Users,
  employee: User,
  hr: Shield,
};

const roleBadgeColors = {
  manager: "bg-blue-500/10 text-blue-400",
  employee: "bg-emerald-500/10 text-emerald-400",
  hr: "bg-purple-500/10 text-purple-400",
};

export function UserPicker() {
  const { user, switchUser, loading } = useAuth();
  const [users, setUsers] = useState<PickerUser[]>([]);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (open && users.length === 0) {
      setFetchError(false);
      fetch("/api/auth/users")
        .then((r) => r.json())
        .then((data) => setUsers(data.users || []))
        .catch(() => setFetchError(true));
    }
  }, [open, users.length]);

  const RoleIcon = user ? roleIcons[user.role] : User;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RoleIcon className="h-4 w-4" />
          {loading ? (
            "Loading..."
          ) : user ? (
            <>
              <span className="text-sm">{user.name}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  roleBadgeColors[user.role]
                )}
              >
                {user.role}
              </span>
            </>
          ) : (
            "Select User"
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="end">
        <div className="text-xs text-muted-foreground px-2 py-1 mb-1 font-medium">
          Switch Identity (Dev Mode)
        </div>
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {fetchError && (
            <div className="px-2 py-3 text-xs text-destructive text-center">
              Failed to load users
            </div>
          )}
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                user?.id === u.id && "bg-accent"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{u.name}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    roleBadgeColors[u.role]
                  )}
                >
                  {u.role}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {u.jobTitle} · {u.department}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
