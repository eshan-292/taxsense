import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FD vs PPF vs ELSS vs NPS | Investment Comparison | TaxSense",
  description:
    "Compare FD, PPF, ELSS, NPS, and Equity Mutual Funds with post-tax returns. Find the best investment for your tax slab and financial goals.",
  keywords: ["FD vs PPF", "ELSS vs NPS", "investment comparison India", "best tax saving investment", "post-tax returns"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
