import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Income Tax Calculator FY 2025-26 | Old vs New Regime | TaxSense",
  description:
    "Free income tax calculator for FY 2025-26. Compare Old vs New tax regime instantly. Get exact tax payable, effective rate, and monthly take-home for any salary.",
  keywords: ["income tax calculator", "old vs new regime", "tax calculator 2025-26", "salary tax India"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
