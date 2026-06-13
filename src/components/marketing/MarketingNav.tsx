"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Try Demo", href: "/demo" },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-xl font-bold tracking-tight text-deep-navy sm:text-2xl">
            CareFlow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-clinical-teal transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium text-slate-600 hover:text-clinical-teal hover:bg-slate-50">
              Sign In
            </Button>
          </Link>
          <Link href="/register-facility">
            <Button className="bg-clinical-teal hover:bg-clinical-teal/90 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md shadow-clinical-teal/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
              Start Free Pilot
            </Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-md text-slate-600 hover:text-clinical-teal hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden absolute top-full left-0 right-0 border-t border-slate-100 bg-white shadow-lg z-50">
          <nav aria-label="Mobile navigation" className="flex flex-col px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center py-3 px-3 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-clinical-teal transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 px-4 pb-5 pt-2 border-t border-slate-100">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:text-clinical-teal hover:border-clinical-teal">
                Sign In
              </Button>
            </Link>
            <Link href="/register-facility" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-clinical-teal hover:bg-clinical-teal/90 text-white font-semibold">
                Start Free Pilot
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
