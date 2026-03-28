import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life Event Tax Impact | TaxSense",
  description:
    "See how major life events — buying a house, salary hike, NPS investment, education loan — affect your income tax. Instant before/after comparison for FY 2025-26.",
  keywords: ["life event tax impact", "home loan tax benefit", "nps tax saving", "salary hike tax", "India tax planning"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
