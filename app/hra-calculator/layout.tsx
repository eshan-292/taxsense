import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HRA Calculator FY 2025-26 | Section 10(13A) Exemption | TaxSense",
  description:
    "Calculate your HRA tax exemption under Section 10(13A). Instantly find the minimum of 3 HRA rules for metro and non-metro cities. Free and accurate.",
  keywords: ["HRA calculator", "house rent allowance", "HRA exemption", "section 10(13A)"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
