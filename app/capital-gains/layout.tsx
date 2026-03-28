import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator | STCG & LTCG India FY 2025-26 | TaxSense",
  description:
    "Calculate short-term and long-term capital gains tax on stocks, equity MF, debt MF, property, and gold. Includes CII indexation and Section 112A exemption.",
  keywords: ["capital gains tax", "STCG", "LTCG", "capital gains calculator India", "Section 112A"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
