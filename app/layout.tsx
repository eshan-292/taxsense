import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaxSense - Smart Tax Calculator for Salaried Indians",
  description:
    "Free tax calculator for salaried Indians. Compare Old vs New tax regime, plan 80C/80D savings, and get step-by-step ITR filing guidance. FY 2025-26.",
  keywords: [
    "income tax calculator",
    "india tax",
    "old vs new regime",
    "80C",
    "80D",
    "ITR filing",
    "tax savings",
    "FY 2025-26",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
