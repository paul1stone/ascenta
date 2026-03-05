"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@ascenta/ui";
import { PanelLeftClose, PanelLeft, LayoutDashboard } from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";

export function NavSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeCategory = segments[0] ?? "";
  const activeSub = segments[1] ?? "";

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r bg-[#f0f0f0] transition-[width] duration-200 overflow-hidden",
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
            <span className="text-sm font-bold tracking-wider">ASCENTA</span>
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
          "flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground hover:bg-[#e8e8e8] transition-colors",
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
              ? "font-bold bg-[#ddd]"
              : "text-muted-foreground hover:bg-[#e8e8e8]",
          )}
          style={{
            borderLeft: pathname === "/home"
              ? "3px solid #0c1e3d"
              : "3px solid transparent",
          }}
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
              <Link
                href={`/${cat.key}/${firstSubKey}`}
                className={cn(
                  "flex items-center gap-2.5 py-2.5 text-[13px] whitespace-nowrap transition-colors",
                  collapsed ? "justify-center px-0" : "px-3.5",
                  isActive
                    ? "font-bold bg-[#ddd]"
                    : "text-muted-foreground hover:bg-[#e8e8e8]",
                )}
                style={
                  isActive
                    ? { borderLeft: `3px solid ${cat.color}` }
                    : { borderLeft: "3px solid transparent" }
                }
              >
                <CategoryIcon className="size-4 shrink-0" />
                {!collapsed && <span>{cat.label}</span>}
              </Link>

              {/* Subcategories */}
              {isActive && !collapsed && (
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
                            ? "font-semibold bg-[#e8e8e8]"
                            : "text-muted-foreground hover:bg-[#e8e8e8]",
                        )}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
