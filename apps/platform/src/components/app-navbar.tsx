"use client";

import Link from "next/link";
import { cn } from "@ascenta/ui";
import { LayoutDashboard } from "lucide-react";
import { UserPicker } from "@/components/auth/user-picker";

interface AppNavbarProps {
  onDashboardClick?: () => void;
  isDashboardActive?: boolean;
}

export function AppNavbar({ onDashboardClick, isDashboardActive }: AppNavbarProps) {
  const className = cn(
    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
    isDashboardActive
      ? "bg-deep-blue/8 text-deep-blue"
      : "text-muted-foreground hover:text-deep-blue hover:bg-slate-100"
  );

  const dashboardButton = onDashboardClick ? (
    <button onClick={onDashboardClick} className={className}>
      <LayoutDashboard className="size-3.5" />
      Dashboard
    </button>
  ) : (
    <Link href="/home" className={className}>
      <LayoutDashboard className="size-3.5" />
      Dashboard
    </Link>
  );

  return (
    <div className="flex items-center gap-2">
      {dashboardButton}
      <UserPicker />
    </div>
  );
}
