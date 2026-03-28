import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GST Calculator | Inclusive & Exclusive GST India | TaxSense",
  description:
    "Calculate GST for 5%, 12%, 18%, and 28% slabs. Add or extract GST from any amount. Shows CGST, SGST, and IGST breakdown instantly.",
  keywords: ["GST calculator", "GST India", "CGST SGST", "inclusive GST", "exclusive GST"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
