"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/#contact" },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-xl font-bold tracking-tight text-deep-navy sm:text-2xl">
            CareFlow<span className="text-clinical-teal">.ai</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-[#0B6E6E] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="text-slate-600 hover:text-[#0B6E6E] hover:bg-slate-50">
              Sign In
            </Button>
          </Link>
          <Link href="/#demo-request">
            <Button className="bg-[#0B6E6E] hover:bg-[#095757] text-white">
              Request a Demo
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-md text-slate-600 hover:text-[#0B6E6E] hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-slate-200 bg-white shadow-lg"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center py-3 px-3 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-[#0B6E6E] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 px-4 pb-5 pt-2 border-t border-slate-100">
            <Link href="/auth" onClick={() => setMobileOpen(false)}>
              <Button
                variant="outline"
                className="w-full border-slate-300 text-slate-700 hover:text-[#0B6E6E] hover:border-[#0B6E6E]"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/#demo-request" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#0B6E6E] hover:bg-[#095757] text-white">
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
