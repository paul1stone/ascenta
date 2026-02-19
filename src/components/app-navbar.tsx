"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/tracker", label: "Tracker" },
  { href: "/docs", label: "Docs" },
];

export function AppNavbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-colors",
              isActive
                ? "bg-deep-blue/8 text-deep-blue"
                : "text-muted-foreground hover:text-deep-blue hover:bg-slate-100"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
