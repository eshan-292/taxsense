"use client";

import { useState, useEffect } from "react";
import {
  calculateNewRegimeTax,
  calculateOldRegimeTax,
  getRecommendation,
  type TaxInput,
} from "@/lib/tax-calculator";
import { formatRupee } from "@/lib/utils";

const STORAGE_KEY = "taxsense_calculator_input";

const ELIGIBLE_PROFESSIONS = [
  "Doctor / Medical practitioner",
  "Lawyer / Legal consultant",
  "Architect / Engineer",
  "Chartered Accountant",
  "Interior designer",
  "Film artist / Technician",
  "IT consultant / Freelancer",
  "Management consultant",
  "Other professional",
];

function makeInput(salary: number, otherIncome: number): TaxInput {
  return {
    annualSalary: salary,
    incomeHouseProperty: 0,
    incomeCapitalGains: 0,
    incomeOtherSources: otherIncome,
    hra: 0,
    section80C: 0,
    section80D_self: 0,
    section80D_parents: 0,
    homeLoanInterest: 0,
    nps80CCD1B: 0,
    section80E: 0,
    section80G: 0,
    otherDeductions: 0,
  };
}

function getBest(input: TaxInput) {
  const nr = calculateNewRegimeTax(input);
  const or = calculateOldRegimeTax(input);
  const rec = getRecommendation(nr, or);
  return {
    tax: rec.regime === "new" ? nr.totalTax : or.totalTax,
    regime: rec.regime,
    result: rec.regime === "new" ? nr : or,
  };
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-background/50 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-xl font-bold ${accent ? "text-accent-green" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted/70 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function FreelancePage() {
  const [salary, setSalary] = useState(1200000);
  const [receipts, setReceipts] = useState(500000);
  const [receiptsInput, setReceiptsInput] = useState("500000");
  const [salaryInput, setSalaryInput] = useState("1200000");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.annualSalary > 0) {
          setSalary(data.annualSalary);
          setSalaryInput(String(data.annualSalary));
        }
      }
    } catch {}
  }, []);

  // 44ADA: 50% of gross receipts is deemed profit (taxable income)
  const taxableFreelance = Math.round(receipts * 0.5);

  // Salary only (no freelance)
  const salaryOnly = getBest(makeInput(salary, 0));

  // Salary + 44ADA income
  const combined = getBest(makeInput(salary, taxableFreelance));

  const additionalTax = combined.tax - salaryOnly.tax;
  const effectiveFreelanceRate = receipts > 0 ? (additionalTax / receipts) * 100 : 0;
  const netFreelanceEarnings = receipts - additionalTax;
  const marginalRate = receipts > 0 ? (additionalTax / taxableFreelance) * 100 : 0;

  // Break-even: what receipts needed to clear all additional tax
  const monthlyNet = Math.round(netFreelanceEarnings / 12);

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Freelance Tax Calculator</h1>
          <p className="text-sm text-muted">Side income alongside salary · Section 44ADA</p>
        </div>

        {/* Explainer */}
        <div className="mb-4 glass-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-indigo/10">
              <svg className="h-4 w-4 text-accent-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">How 44ADA works</p>
              <p className="text-xs text-muted leading-relaxed">
                Under Section 44ADA (Presumptive Taxation), professionals with receipts under ₹75L pay tax on just <strong className="text-foreground">50% of gross receipts</strong> — no bookkeeping needed. The 50% deemed profit is added to your salary income.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="glass-card mb-4 space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Annual Salary (from employer)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
              <input
                type="number"
                value={salaryInput}
                onChange={e => {
                  setSalaryInput(e.target.value);
                  setSalary(Number(e.target.value));
                }}
                step={100000}
                placeholder="12,00,000"
                className="w-full rounded-lg border border-card-border bg-background/50 py-2.5 pl-7 pr-3 text-sm text-foreground outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Gross Professional Receipts (freelance / consulting)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
              <input
                type="number"
                value={receiptsInput}
                onChange={e => {
                  setReceiptsInput(e.target.value);
                  setReceipts(Number(e.target.value));
                }}
                step={50000}
                placeholder="5,00,000"
                className="w-full rounded-lg border border-card-border bg-background/50 py-2.5 pl-7 pr-3 text-sm text-foreground outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20"
              />
            </div>
            <p className="mt-1 text-xs text-muted/60">Must be under ₹75L to use 44ADA. Eligible: doctors, lawyers, architects, CA, IT consultants, etc.</p>
          </div>
        </div>

        {receipts > 0 && (
          <>
            {/* 44ADA breakdown */}
            <div className="mb-4 glass-card p-5">
              <p className="mb-3 text-sm font-semibold text-foreground">44ADA Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Gross receipts</span>
                  <span className="font-mono text-foreground">{formatRupee(receipts)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Deemed expenses (50%)</span>
                  <span className="font-mono text-accent-green">−{formatRupee(taxableFreelance)}</span>
                </div>
                <div className="border-t border-card-border pt-2 flex justify-between text-sm font-semibold">
                  <span className="text-foreground">Taxable freelance income</span>
                  <span className="font-mono text-foreground">{formatRupee(taxableFreelance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total gross income</span>
                  <span className="font-mono text-foreground">{formatRupee(salary + taxableFreelance)}</span>
                </div>
              </div>
            </div>

            {/* Tax comparison */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <p className="text-xs text-muted mb-1">Salary-only tax</p>
                <p className="text-xl font-bold text-foreground">{formatRupee(salaryOnly.tax)}</p>
                <p className="text-xs text-muted/60 mt-0.5">{salaryOnly.regime === "new" ? "New" : "Old"} regime</p>
              </div>
              <div className="glass-card p-4 ring-1 ring-accent-red/20">
                <p className="text-xs text-muted mb-1">With freelance</p>
                <p className="text-xl font-bold text-foreground">{formatRupee(combined.tax)}</p>
                <p className="text-xs text-muted/60 mt-0.5">{combined.regime === "new" ? "New" : "Old"} regime</p>
              </div>
            </div>

            {/* Key metrics */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <StatCard
                label="Additional tax on freelance"
                value={formatRupee(additionalTax)}
                sub={`${effectiveFreelanceRate.toFixed(1)}% of receipts`}
              />
              <StatCard
                label="Net freelance earnings"
                value={formatRupee(netFreelanceEarnings)}
                sub={`${formatRupee(monthlyNet)}/month`}
                accent
              />
            </div>

            {/* Insight */}
            <div className="glass-card p-4">
              <p className="text-sm font-semibold text-foreground mb-2">Key insight</p>
              <div className="space-y-2 text-sm text-muted">
                <p>
                  You keep <strong className="text-foreground">{(100 - effectiveFreelanceRate).toFixed(1)}%</strong> of every rupee billed.
                  At 44ADA, your effective tax on receipts is{" "}
                  <strong className="text-foreground">{effectiveFreelanceRate.toFixed(1)}%</strong> — roughly half your marginal rate
                  ({marginalRate.toFixed(0)}% on the taxable 50%).
                </p>
                {receipts > 7500000 && (
                  <p className="text-accent-amber text-xs">
                    Receipts exceed ₹75L — 44ADA no longer applies. You&apos;ll need regular books of account.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Eligible professions */}
        <div className="mt-4 glass-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted/50">44ADA eligible professions</p>
          <div className="flex flex-wrap gap-1.5">
            {ELIGIBLE_PROFESSIONS.map(p => (
              <span key={p} className="rounded-full border border-card-border bg-background/30 px-2.5 py-0.5 text-xs text-muted">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
