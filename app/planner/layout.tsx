import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax Savings Planner | Maximize 80C, 80D, NPS Deductions | TaxSense",
  description:
    "Track and maximize your tax deductions under 80C, 80D, 80CCD(1B), 24(b) and more. Find unused deduction capacity and get personalized optimization tips.",
  keywords: ["tax savings planner", "80C calculator", "80D deduction", "NPS deduction", "tax deductions India"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
