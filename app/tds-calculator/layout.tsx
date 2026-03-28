import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TDS Calculator | Salary, FD, Rent, Professional Fees | TaxSense",
  description:
    "Calculate TDS deducted on salary, FD interest, rent, professional fees, dividends, and more. Know the exact TDS rate and threshold for each income type.",
  keywords: ["TDS calculator", "TDS on salary", "TDS on FD interest", "TDS on rent", "194A 194IB"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
