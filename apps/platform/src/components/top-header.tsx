"use client";

import { Button } from "@ascenta/ui/button";
import { Settings, CircleUser } from "lucide-react";
import { NotificationCenter } from "@/components/notification-center";
import { RoleSwitcher } from "@/components/role-switcher";

export function TopHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-4">
      {/* Left: Company branding */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-deep-blue text-xs font-bold text-white">
          SC
        </div>
        <span className="font-display text-sm font-bold text-deep-blue">
          StoneCyber
        </span>
      </div>

      {/* Right: App actions */}
      <div className="flex items-center gap-1">
        <RoleSwitcher />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-deep-blue">
          <Settings className="size-4" />
        </Button>
        <NotificationCenter />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-deep-blue">
          <CircleUser className="size-4" />
        </Button>
      </div>
    </header>
  );
}
