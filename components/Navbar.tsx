"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const toolLinks = [
  { href: "/calculator", label: "Tax Calculator" },
  { href: "/salary-optimizer", label: "Salary Optimizer", badge: true },
  { href: "/life-events", label: "Life Events", badge: true },
  { href: "/freelance", label: "Freelance Tax (44ADA)", badge: true },
  { href: "/form16", label: "Form 16 Parser", badge: true },
  { href: "/hra-calculator", label: "HRA Calculator" },
  { href: "/capital-gains", label: "Capital Gains" },
  { href: "/gst-calculator", label: "GST Calculator" },
  { href: "/advance-tax", label: "Advance Tax" },
  { href: "/tds-calculator", label: "TDS Calculator" },
  { href: "/compare-investments", label: "Compare Investments" },
];

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/planner", label: "Savings Planner" },
  { href: "/filing", label: "Filing Guide" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [showTools, setShowTools] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold gradient-text">TaxSense</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-accent-indigo/15 text-accent-indigo"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTools(!showTools)}
              onBlur={() => setTimeout(() => setShowTools(false), 200)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                toolLinks.some((l) => isActive(l.href))
                  ? "bg-accent-indigo/15 text-accent-indigo"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Tools
              <svg
                className={`h-3.5 w-3.5 transition-transform ${showTools ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showTools && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-card-border bg-card/95 backdrop-blur-xl p-2 shadow-xl">
                {toolLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive(link.href)
                        ? "bg-accent-indigo/15 text-accent-indigo"
                        : "text-muted hover:bg-background/50 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {"badge" in link && link.badge && (
                      <span className="rounded-full bg-accent-indigo/15 px-1.5 py-px text-[9px] font-semibold text-accent-indigo">NEW</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden rounded-lg p-2 text-muted hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-card-border bg-card/95 backdrop-blur-xl p-4 md:hidden">
          <div className="space-y-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent-indigo/15 text-accent-indigo"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-card-border" />
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted/60">
              Tools
            </p>
            {toolLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent-indigo/15 text-accent-indigo"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
                {"badge" in link && link.badge && (
                  <span className="rounded-full bg-accent-indigo/15 px-1.5 py-px text-[9px] font-semibold text-accent-indigo">NEW</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
