import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelance & Side Income Tax Calculator | 44ADA | TaxSense",
  description:
    "Calculate tax on freelance or consulting income alongside your salary. Uses 44ADA presumptive taxation — only 50% of professional receipts is taxable. FY 2025-26.",
  keywords: ["freelance tax", "44ADA", "side income tax", "consultant tax India", "presumptive taxation"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
