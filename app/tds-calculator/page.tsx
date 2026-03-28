"use client";

import { useState } from "react";
import { formatINR, formatRupee } from "@/lib/utils";

type TDSCategory =
  | "salary"
  | "fd_interest"
  | "rent"
  | "professional_fees"
  | "commission"
  | "dividend"
  | "epf_withdrawal"
  | "property_sale";

interface TDSConfig {
  label: string;
  section: string;
  rate: number;
  rateNoPAN: number;
  threshold: number;
  description: string;
  notes: string;
}

const tdsCategories: Record<TDSCategory, TDSConfig> = {
  salary: {
    label: "Salary",
    section: "192",
    rate: -1, // at slab rates
    rateNoPAN: 30,
    threshold: 250000,
    description: "TDS on salary is deducted by employer at applicable slab rates",
    notes: "Employer deducts TDS based on estimated annual income and declared investments. Submit Form 12BB to employer for deductions.",
  },
  fd_interest: {
    label: "FD / RD Interest",
    section: "194A",
    rate: 10,
    rateNoPAN: 20,
    threshold: 40000,
    description: "Banks deduct TDS on interest exceeding threshold per FY",
    notes: "Threshold is 40,000 for regular citizens, 50,000 for senior citizens. Submit Form 15G/15H if total income is below taxable limit.",
  },
  rent: {
    label: "Rent (by Individual/HUF)",
    section: "194-IB",
    rate: 2,
    rateNoPAN: 20,
    threshold: 50000,
    description: "TDS on rent paid exceeding 50,000/month",
    notes: "Individual/HUF tenants must deduct 2% TDS if monthly rent exceeds 50,000. No TAN required - use Form 26QC.",
  },
  professional_fees: {
    label: "Professional / Technical Fees",
    section: "194J",
    rate: 10,
    rateNoPAN: 20,
    threshold: 30000,
    description: "TDS on fees for professional or technical services",
    notes: "Rate is 2% for technical services and 10% for professional services. Threshold of 30,000 per FY.",
  },
  commission: {
    label: "Commission / Brokerage",
    section: "194H",
    rate: 5,
    rateNoPAN: 20,
    threshold: 15000,
    description: "TDS on commission or brokerage payments",
    notes: "Applicable when commission/brokerage exceeds 15,000 in a FY.",
  },
  dividend: {
    label: "Dividend Income",
    section: "194",
    rate: 10,
    rateNoPAN: 20,
    threshold: 5000,
    description: "TDS on dividend from shares and mutual funds",
    notes: "Companies/MFs deduct 10% TDS on dividend exceeding 5,000 in a FY.",
  },
  epf_withdrawal: {
    label: "EPF Withdrawal",
    section: "192A",
    rate: 10,
    rateNoPAN: 30,
    threshold: 50000,
    description: "TDS on premature EPF withdrawal",
    notes: "No TDS if withdrawal after 5 years of service, or if amount is below 50,000, or if Form 15G/15H is submitted.",
  },
  property_sale: {
    label: "Property Sale (by Buyer)",
    section: "194-IA",
    rate: 1,
    rateNoPAN: 20,
    threshold: 5000000,
    description: "TDS on purchase of immovable property above 50 lakhs",
    notes: "Buyer must deduct 1% TDS on total sale consideration (not just amount above 50L). Use Form 26QB.",
  },
};

interface TDSResult {
  amount: number;
  threshold: number;
  isAboveThreshold: boolean;
  tdsRate: number;
  tdsAmount: number;
  netAmount: number;
}

function calculateTDS(
  category: TDSCategory,
  amount: number,
  hasPAN: boolean,
  salaryTaxRate?: number
): TDSResult | null {
  if (amount === 0) return null;
  const config = tdsCategories[category];
  const isAboveThreshold = amount > config.threshold;

  let tdsRate = 0;
  if (isAboveThreshold) {
    if (!hasPAN) {
      tdsRate = config.rateNoPAN;
    } else if (config.rate === -1) {
      // Salary - use estimated slab rate
      tdsRate = salaryTaxRate ?? 30;
    } else {
      tdsRate = config.rate;
    }
  }

  const tdsAmount = Math.round((amount * tdsRate) / 100);

  return {
    amount,
    threshold: config.threshold,
    isAboveThreshold,
    tdsRate,
    tdsAmount,
    netAmount: amount - tdsAmount,
  };
}

export default function TDSCalculatorPage() {
  const [category, setCategory] = useState<TDSCategory>("salary");
  const [amount, setAmount] = useState(0);
  const [hasPAN, setHasPAN] = useState(true);
  const [salaryTaxRate, setSalaryTaxRate] = useState(20);

  const config = tdsCategories[category];
  const result = calculateTDS(category, amount, hasPAN, salaryTaxRate);

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            TDS Calculator
          </h1>
          <p className="text-muted">
            Calculate Tax Deducted at Source for salary, FD interest, rent,
            professional fees, and more. FY 2025-26 rates.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Category selection */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Income Type
              </h2>
              <div className="space-y-2">
                {(Object.entries(tdsCategories) as [TDSCategory, TDSConfig][]).map(
                  ([key, cat]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        category === key
                          ? "border-accent-indigo/50 bg-accent-indigo/10"
                          : "border-card-border bg-card hover:border-accent-indigo/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            category === key
                              ? "text-accent-indigo"
                              : "text-foreground"
                          }`}
                        >
                          {cat.label}
                        </p>
                        <span className="text-xs font-mono text-muted">
                          Sec {cat.section}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {cat.rate === -1 ? "Slab rate" : `${cat.rate}%`} | Threshold:{" "}
                        {formatRupee(cat.threshold)}
                      </p>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Calculator & Results */}
          <div className="space-y-6 lg:col-span-3">
            <div className="glass-card p-6 sm:p-8">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                {config.label}
              </h2>
              <p className="mb-6 text-sm text-muted">{config.description}</p>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Amount (Annual)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                      &#x20B9;
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount === 0 ? "" : formatINR(amount)}
                      onChange={(e) => {
                        const num = parseInt(e.target.value.replace(/,/g, ""), 10) || 0;
                        setAmount(num);
                      }}
                      placeholder="e.g. 10,00,000"
                      className="w-full rounded-xl border border-card-border bg-card py-3 pl-8 pr-4 text-lg font-medium text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                    />
                  </div>
                </div>

                {/* PAN toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">
                    PAN Submitted?
                  </label>
                  <div className="flex gap-2">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setHasPAN(val)}
                        className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                          hasPAN === val
                            ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
                            : "border-card-border bg-card text-muted"
                        }`}
                      >
                        {val ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                  {!hasPAN && (
                    <span className="text-xs text-accent-red">
                      Higher TDS rate applies without PAN
                    </span>
                  )}
                </div>

                {/* Salary slab rate */}
                {category === "salary" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Estimated Average Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={salaryTaxRate}
                      onChange={(e) =>
                        setSalaryTaxRate(parseInt(e.target.value) || 0)
                      }
                      className="w-full rounded-xl border border-card-border bg-card py-2.5 px-4 text-foreground focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                    />
                    <p className="mt-1 text-xs text-muted">
                      Employer deducts TDS based on your tax slab. Enter your
                      estimated effective tax rate.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {result ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="glass-card glow-indigo p-5">
                    <p className="text-sm text-muted">TDS Amount</p>
                    <p className="text-2xl font-bold text-accent-red">
                      {formatRupee(result.tdsAmount)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      @ {result.tdsRate}% TDS rate
                    </p>
                  </div>
                  <div className="glass-card glow-green p-5">
                    <p className="text-sm text-muted">Net Amount (After TDS)</p>
                    <p className="text-2xl font-bold text-accent-green">
                      {formatRupee(result.netAmount)}
                    </p>
                  </div>
                </div>

                {!result.isAboveThreshold && (
                  <div className="rounded-xl border border-accent-green/20 bg-accent-green/5 p-4">
                    <p className="text-sm text-accent-green font-medium">
                      No TDS Applicable
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Amount is below the threshold of{" "}
                      {formatRupee(result.threshold)} for this category. No TDS
                      will be deducted.
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div className="rounded-xl border border-card-border bg-background/30 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Important Notes
                  </p>
                  <p className="mt-1 text-sm text-muted">{config.notes}</p>
                </div>
              </>
            ) : (
              <div className="glass-card flex h-40 items-center justify-center p-6">
                <p className="text-muted">Enter an amount to calculate TDS</p>
              </div>
            )}

            {/* Quick reference table */}
            <div className="glass-card overflow-hidden p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                TDS Quick Reference (FY 2025-26)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-card-border text-left">
                      <th className="pb-2 pr-3 font-medium text-muted">Type</th>
                      <th className="pb-2 pr-3 font-medium text-muted">Section</th>
                      <th className="pb-2 pr-3 font-medium text-muted">Rate</th>
                      <th className="pb-2 font-medium text-muted">Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {(Object.entries(tdsCategories) as [TDSCategory, TDSConfig][]).map(
                      ([key, cat]) => (
                        <tr
                          key={key}
                          className={
                            category === key ? "bg-accent-indigo/5" : ""
                          }
                        >
                          <td className="py-2 pr-3 text-foreground">
                            {cat.label}
                          </td>
                          <td className="py-2 pr-3 font-mono text-muted">
                            {cat.section}
                          </td>
                          <td className="py-2 pr-3 font-mono text-accent-indigo">
                            {cat.rate === -1 ? "Slab" : `${cat.rate}%`}
                          </td>
                          <td className="py-2 font-mono text-muted">
                            {formatRupee(cat.threshold)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
