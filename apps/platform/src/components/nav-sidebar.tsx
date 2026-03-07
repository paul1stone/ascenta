"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@ascenta/ui";
import { PanelLeftClose, PanelLeft, LayoutDashboard } from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@ascenta/ui/popover";

import type { NavCategory } from "@/lib/constants/dashboard-nav";
import type { LucideIcon } from "lucide-react";

function CategoryPopover({
  cat,
  isActive,
  activeSub,
  CategoryIcon,
}: {
  cat: NavCategory;
  isActive: boolean;
  activeSub: string;
  CategoryIcon: LucideIcon;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-center py-2.5 transition-colors",
            isActive
              ? "font-bold bg-primary/6 border-l-[3px]"
              : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
          )}
          style={isActive ? { borderLeftColor: cat.color } : undefined}
        >
          <CategoryIcon className="size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-48 bg-white p-2"
      >
        <div
          className="mb-2 border-l-[3px] pl-2 text-xs font-semibold text-deep-blue"
          style={{ borderLeftColor: cat.color }}
        >
          {cat.label}
        </div>
        {cat.subPages.map((sub) => {
          const subKey = sub.key.split("/")[1];
          const isSubActive = activeSub === subKey && isActive;
          return (
            <button
              key={sub.key}
              onClick={() => {
                setOpen(false);
                router.push(`/${cat.key}/${subKey}`);
              }}
              className={cn(
                "block w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors",
                isSubActive
                  ? "font-semibold bg-primary/8 text-deep-blue"
                  : "text-muted-foreground hover:bg-primary/5",
              )}
            >
              {sub.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export function NavSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeCategory = segments[0] ?? "";
  const activeSub = segments[1] ?? "";

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r border-border bg-white transition-[width] duration-200 overflow-hidden",
      )}
      style={{ width: collapsed ? 52 : 220 }}
    >
      {/* Logo header */}
      <div
        className={cn(
          "flex h-14 items-center border-b px-3 gap-2.5",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        <Image
          src="/compass.svg"
          alt="Ascenta"
          width={collapsed ? 24 : 28}
          height={collapsed ? 24 : 28}
          className="shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-wider text-deep-blue">ASCENTA</span>
            <span className="text-[10px] text-muted-foreground">
              StoneCyber
            </span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground hover:bg-primary/5 transition-colors",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        {collapsed ? (
          <PanelLeft className="size-4 shrink-0" />
        ) : (
          <>
            <PanelLeftClose className="size-4 shrink-0" />
            <span>Collapse</span>
          </>
        )}
      </button>

      {/* Category nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        {/* Home */}
        <Link
          href="/home"
          className={cn(
            "flex items-center gap-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors",
            collapsed ? "justify-center px-0" : "px-3.5",
            pathname === "/home"
              ? "font-bold bg-primary/6 border-l-[3px] border-l-deep-blue"
              : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
          )}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          {!collapsed && <span>Home</span>}
        </Link>
        <div className="mx-3 my-1 border-b" />
        {DASHBOARD_NAV.map((cat) => {
          const isActive = activeCategory === cat.key;
          const firstSubKey = cat.subPages[0].key.split("/")[1];
          const CategoryIcon = cat.icon;

          return (
            <div key={cat.key}>
              {collapsed ? (
                <CategoryPopover
                  cat={cat}
                  isActive={isActive}
                  activeSub={activeSub}
                  CategoryIcon={CategoryIcon}
                />
              ) : (
                <>
                  <Link
                    href={`/${cat.key}/${firstSubKey}`}
                    className={cn(
                      "flex items-center gap-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors px-3.5",
                      isActive
                        ? "font-bold bg-primary/6 border-l-[3px]"
                        : "text-muted-foreground hover:bg-primary/5 border-l-[3px] border-l-transparent",
                    )}
                    style={isActive ? { borderLeftColor: cat.color } : undefined}
                  >
                    <CategoryIcon className="size-4 shrink-0" />
                    <span>{cat.label}</span>
                  </Link>

                  {/* Subcategories */}
                  {isActive && (
                    <div>
                      {cat.subPages.map((sub) => {
                        const subKey = sub.key.split("/")[1];
                        const isSubActive = activeSub === subKey;

                        return (
                          <Link
                            key={sub.key}
                            href={`/${cat.key}/${subKey}`}
                            className={cn(
                              "block py-1.5 pl-[30px] pr-3.5 text-xs whitespace-nowrap transition-colors",
                              isSubActive
                                ? "font-semibold bg-primary/8 text-deep-blue"
                                : "text-muted-foreground hover:bg-primary/5",
                            )}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
