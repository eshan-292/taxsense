import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form 16 Auto-Fill | Parse Form 16 | TaxSense",
  description:
    "Paste your Form 16 text to automatically extract salary, deductions, and TDS. Instantly fills the tax calculator. All processing is done on your device — no data is sent anywhere.",
  keywords: ["Form 16 parser", "Form 16 auto fill", "TDS certificate", "salary income tax", "Form 16 India"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
