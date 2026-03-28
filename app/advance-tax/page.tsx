"use client";

import { useState } from "react";
import { formatINR, formatRupee } from "@/lib/utils";
import {
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  NEW_REGIME_STANDARD_DEDUCTION,
  OLD_REGIME_STANDARD_DEDUCTION,
  NEW_REGIME_REBATE_LIMIT,
  OLD_REGIME_REBATE_LIMIT,
  CESS_RATE,
  type TaxSlab,
} from "@/lib/tax-slabs";

interface AdvanceTaxInput {
  estimatedIncome: number;
  tdsAlreadyDeducted: number;
  regime: "new" | "old";
  deductions: number; // simplified: total deductions under old regime
}

interface Installment {
  quarter: string;
  dueDate: string;
  cumulativePercent: number;
  percent: number;
  amount: number;
  cumulativeAmount: number;
  status: "upcoming" | "due" | "overdue";
}

function calculateSlabTax(taxableIncome: number, slabs: TaxSlab[]): number {
  let remaining = taxableIncome;
  let total = 0;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabWidth = slab.to === Infinity ? remaining : slab.to - slab.from + 1;
    const taxable = Math.min(remaining, slabWidth);
    total += taxable * slab.rate;
    remaining -= taxable;
  }
  return total;
}

function calculateAdvanceTax(input: AdvanceTaxInput) {
  const isNew = input.regime === "new";
  const stdDeduction = isNew ? NEW_REGIME_STANDARD_DEDUCTION : OLD_REGIME_STANDARD_DEDUCTION;
  const totalDeductions = isNew ? stdDeduction : stdDeduction + input.deductions;
  const taxableIncome = Math.max(0, input.estimatedIncome - totalDeductions);
  const slabs = isNew ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  const rebateLimit = isNew ? NEW_REGIME_REBATE_LIMIT : OLD_REGIME_REBATE_LIMIT;

  let baseTax = calculateSlabTax(taxableIncome, slabs);

  // Rebate
  if (taxableIncome <= rebateLimit) {
    baseTax = 0;
  }

  const cess = baseTax * CESS_RATE;
  const totalTax = Math.round(baseTax + cess);
  const netTaxPayable = Math.max(0, totalTax - input.tdsAlreadyDeducted);

  // Determine installment status based on current date approximation
  // Using FY 2025-26 dates
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  function getStatus(dueMonth: number, dueYear: number): "upcoming" | "due" | "overdue" {
    const dueDate = new Date(dueYear, dueMonth - 1, 15);
    const now = new Date();
    const daysBefore = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysBefore < 0) return "overdue";
    if (daysBefore < 30) return "due";
    return "upcoming";
  }

  const installments: Installment[] = [
    {
      quarter: "Q1 (Apr-Jun)",
      dueDate: "15 June 2025",
      cumulativePercent: 15,
      percent: 15,
      amount: Math.round(netTaxPayable * 0.15),
      cumulativeAmount: Math.round(netTaxPayable * 0.15),
      status: getStatus(6, 2025),
    },
    {
      quarter: "Q2 (Jul-Sep)",
      dueDate: "15 September 2025",
      cumulativePercent: 45,
      percent: 30,
      amount: Math.round(netTaxPayable * 0.30),
      cumulativeAmount: Math.round(netTaxPayable * 0.45),
      status: getStatus(9, 2025),
    },
    {
      quarter: "Q3 (Oct-Dec)",
      dueDate: "15 December 2025",
      cumulativePercent: 75,
      percent: 30,
      amount: Math.round(netTaxPayable * 0.30),
      cumulativeAmount: Math.round(netTaxPayable * 0.75),
      status: getStatus(12, 2025),
    },
    {
      quarter: "Q4 (Jan-Mar)",
      dueDate: "15 March 2026",
      cumulativePercent: 100,
      percent: 25,
      amount: Math.round(netTaxPayable * 0.25),
      cumulativeAmount: netTaxPayable,
      status: getStatus(3, 2026),
    },
  ];

  return {
    taxableIncome,
    totalTax,
    tdsDeducted: input.tdsAlreadyDeducted,
    netTaxPayable,
    isAdvanceTaxApplicable: netTaxPayable >= 10000,
    installments,
  };
}

export default function AdvanceTaxPage() {
  const [input, setInput] = useState<AdvanceTaxInput>({
    estimatedIncome: 0,
    tdsAlreadyDeducted: 0,
    regime: "new",
    deductions: 0,
  });

  const result = input.estimatedIncome > 0 ? calculateAdvanceTax(input) : null;

  const handleChange = (key: keyof AdvanceTaxInput, value: string) => {
    const num = parseInt(value.replace(/,/g, ""), 10) || 0;
    setInput((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            Advance Tax Calculator
          </h1>
          <p className="text-muted">
            Calculate quarterly advance tax installments for FY 2025-26. Advance
            tax is applicable if your tax liability exceeds &#x20B9;10,000 in a year.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input */}
          <div className="glass-card p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Income Details
            </h2>

            {/* Regime selector */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Tax Regime
              </label>
              <div className="flex gap-3">
                {[
                  { value: "new" as const, label: "New Regime" },
                  { value: "old" as const, label: "Old Regime" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, regime: opt.value }))}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      input.regime === opt.value
                        ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
                        : "border-card-border bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Estimated Annual Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    &#x20B9;
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={input.estimatedIncome === 0 ? "" : formatINR(input.estimatedIncome)}
                    onChange={(e) => handleChange("estimatedIncome", e.target.value)}
                    placeholder="e.g. 20,00,000"
                    className="w-full rounded-xl border border-card-border bg-card py-3 pl-8 pr-4 text-lg font-medium text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  Total estimated income from all sources
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  TDS Already Deducted / Expected
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    &#x20B9;
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={input.tdsAlreadyDeducted === 0 ? "" : formatINR(input.tdsAlreadyDeducted)}
                    onChange={(e) => handleChange("tdsAlreadyDeducted", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-8 pr-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  TDS on salary, FD interest, etc. that employer/bank will deduct
                </p>
              </div>

              {input.regime === "old" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Total Deductions (80C + 80D + others)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                      &#x20B9;
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={input.deductions === 0 ? "" : formatINR(input.deductions)}
                      onChange={(e) => handleChange("deductions", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-8 pr-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Sum of all deductions: 80C, 80D, HRA, 24(b), NPS, etc.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="glass-card p-5">
                    <p className="text-sm text-muted">Total Tax Liability</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatRupee(result.totalTax)}
                    </p>
                  </div>
                  <div className="glass-card p-5">
                    <p className="text-sm text-muted">TDS Already Covered</p>
                    <p className="text-2xl font-bold text-accent-green">
                      {formatRupee(result.tdsDeducted)}
                    </p>
                  </div>
                </div>

                <div
                  className={`glass-card p-6 ${
                    result.isAdvanceTaxApplicable ? "glow-indigo" : "glow-green"
                  }`}
                >
                  <p className="text-sm text-muted">Net Advance Tax Payable</p>
                  <p
                    className={`text-3xl font-bold ${
                      result.isAdvanceTaxApplicable
                        ? "text-accent-indigo"
                        : "text-accent-green"
                    }`}
                  >
                    {formatRupee(result.netTaxPayable)}
                  </p>
                  {!result.isAdvanceTaxApplicable && (
                    <p className="mt-2 text-sm text-accent-green">
                      Advance tax is not applicable (liability under &#x20B9;10,000)
                    </p>
                  )}
                </div>

                {/* Installment schedule */}
                {result.isAdvanceTaxApplicable && (
                  <div className="glass-card p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">
                      Quarterly Installments
                    </h3>
                    <div className="space-y-3">
                      {result.installments.map((inst, i) => (
                        <div
                          key={i}
                          className={`rounded-xl border p-4 ${
                            inst.status === "overdue"
                              ? "border-accent-red/30 bg-accent-red/5"
                              : inst.status === "due"
                              ? "border-accent-amber/30 bg-accent-amber/5"
                              : "border-card-border bg-background/30"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {inst.quarter}
                              </p>
                              <p className="text-xs text-muted">
                                Due: {inst.dueDate}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">
                                {formatRupee(inst.amount)}
                              </p>
                              <p className="text-xs text-muted">
                                {inst.percent}% of total
                              </p>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted">
                              <span>Cumulative: {inst.cumulativePercent}%</span>
                              <span>{formatRupee(inst.cumulativeAmount)}</span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-background/80">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-accent-indigo to-accent-purple transition-all"
                                style={{
                                  width: `${inst.cumulativePercent}%`,
                                }}
                              />
                            </div>
                          </div>
                          {inst.status === "overdue" && (
                            <p className="mt-2 text-xs font-medium text-accent-red">
                              Past due - interest u/s 234C may apply
                            </p>
                          )}
                          {inst.status === "due" && (
                            <p className="mt-2 text-xs font-medium text-accent-amber">
                              Due soon - pay before the deadline to avoid interest
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interest warning */}
                <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/5 p-4">
                  <p className="text-sm font-medium text-accent-amber">
                    Interest on Late Payment
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    <li>
                      <strong>Section 234B:</strong> 1% per month if advance tax paid
                      is less than 90% of assessed tax
                    </li>
                    <li>
                      <strong>Section 234C:</strong> 1% per month for deferment of
                      individual installments
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="glass-card flex h-64 items-center justify-center p-6">
                <p className="text-muted">
                  Enter your estimated income to calculate advance tax
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
