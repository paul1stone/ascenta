"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TerrainIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { useState } from "react";

const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/tracker", label: "Tracker" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-deep-blue/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <TerrainIcon className="text-summit size-8" />
            <span className="font-display text-2xl font-black tracking-tighter text-white uppercase">
              Ascenta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-200 hover:text-summit transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Button asChild className="bg-summit hover:bg-summit-hover text-white px-6 py-2.5 shadow-lg shadow-orange-900/20 font-bold text-sm uppercase tracking-wide">
              <Link href="/book-demo">Book a Demo</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="size-6" />
            ) : (
              <MenuIcon className="size-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold text-slate-200 hover:text-summit transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-200 hover:text-white transition-colors px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Button asChild className="bg-summit hover:bg-summit-hover text-white font-bold text-sm uppercase tracking-wide w-full">
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
