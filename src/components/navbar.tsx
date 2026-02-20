"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TerrainIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/customers", label: "Customers" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-deep-blue/90 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-white/5"
          : "bg-transparent backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <TerrainIcon className="text-summit size-7 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-display text-xl font-black tracking-tight text-white uppercase">
              Ascenta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-white/[0.06] rounded-full px-1.5 py-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
                      isActive
                        ? "text-white bg-white/[0.12]"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Button
              asChild
              className="bg-summit hover:bg-summit-hover text-white px-5 py-2 shadow-lg shadow-summit/20 font-semibold text-sm rounded-full transition-all duration-200 hover:shadow-summit/30 hover:scale-[1.02]"
            >
              <Link href="/book-demo">Book a Demo</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "text-white bg-white/10"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Button
                  asChild
                  className="bg-summit hover:bg-summit-hover text-white font-semibold text-sm rounded-full w-full"
                >
                  <Link href="/book-demo">Book a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
