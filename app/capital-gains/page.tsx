"use client";

import { useState } from "react";
import { formatINR, formatRupee } from "@/lib/utils";

type AssetType = "equity" | "mutual_fund_equity" | "mutual_fund_debt" | "property" | "gold";

interface CGInput {
  assetType: AssetType;
  purchasePrice: number;
  salePrice: number;
  purchaseYear: number;
  saleYear: number;
  holdingMonths: number;
  expenses: number; // brokerage, stamp duty, etc.
}

interface CGResult {
  gain: number;
  isLongTerm: boolean;
  holdingPeriod: string;
  indexedCost: number;
  taxableGain: number;
  exemption: number;
  taxRate: number;
  tax: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  notes: string[];
}

// CII (Cost Inflation Index) values
const CII: Record<number, number> = {
  2001: 100, 2002: 105, 2003: 109, 2004: 113, 2005: 117,
  2006: 122, 2007: 129, 2008: 137, 2009: 148, 2010: 167,
  2011: 184, 2012: 200, 2013: 220, 2014: 240, 2015: 254,
  2016: 264, 2017: 272, 2018: 280, 2019: 289, 2020: 301,
  2021: 317, 2022: 331, 2023: 348, 2024: 363, 2025: 377,
  2026: 390,
};

const assetConfig: Record<AssetType, {
  label: string;
  ltcgMonths: number;
  ltcgRate: number;
  stcgRate: number;
  ltcgExemption: number;
  indexation: boolean;
  description: string;
}> = {
  equity: {
    label: "Listed Equity Shares",
    ltcgMonths: 12,
    ltcgRate: 12.5,
    stcgRate: 20,
    ltcgExemption: 125000,
    indexation: false,
    description: "STT-paid listed shares on recognized exchanges",
  },
  mutual_fund_equity: {
    label: "Equity Mutual Funds",
    ltcgMonths: 12,
    ltcgRate: 12.5,
    stcgRate: 20,
    ltcgExemption: 125000,
    indexation: false,
    description: "Equity-oriented mutual funds (65%+ equity)",
  },
  mutual_fund_debt: {
    label: "Debt Mutual Funds",
    ltcgMonths: 24,
    ltcgRate: 12.5,
    stcgRate: -1, // taxed at slab rate
    ltcgExemption: 0,
    indexation: true,
    description: "Debt/hybrid funds purchased after April 2023 taxed at slab rate; before that with indexation",
  },
  property: {
    label: "Real Estate / Property",
    ltcgMonths: 24,
    ltcgRate: 12.5,
    stcgRate: -1, // slab rate
    ltcgExemption: 0,
    indexation: true,
    description: "Immovable property (house, land, commercial)",
  },
  gold: {
    label: "Gold / Gold ETF",
    ltcgMonths: 24,
    ltcgRate: 12.5,
    stcgRate: -1,
    ltcgExemption: 0,
    indexation: true,
    description: "Physical gold, gold ETFs, sovereign gold bonds",
  },
};

function calculateCapitalGains(input: CGInput): CGResult | null {
  if (input.purchasePrice === 0 && input.salePrice === 0) return null;

  const config = assetConfig[input.assetType];
  const isLongTerm = input.holdingMonths >= config.ltcgMonths;
  const gain = input.salePrice - input.purchasePrice - input.expenses;
  const notes: string[] = [];

  let indexedCost = input.purchasePrice;
  let taxableGain = gain;
  let exemption = 0;
  let taxRate: number;

  if (isLongTerm) {
    // Apply indexation for applicable assets
    if (config.indexation && CII[input.purchaseYear] && CII[input.saleYear]) {
      indexedCost = Math.round(
        (input.purchasePrice * CII[input.saleYear]) / CII[input.purchaseYear]
      );
      taxableGain = input.salePrice - indexedCost - input.expenses;
      notes.push(
        `Indexation applied: CII ${input.purchaseYear} = ${CII[input.purchaseYear]}, CII ${input.saleYear} = ${CII[input.saleYear]}`
      );
    }

    // LTCG exemption for equity
    if (config.ltcgExemption > 0) {
      exemption = Math.min(Math.max(taxableGain, 0), config.ltcgExemption);
      taxableGain = Math.max(0, taxableGain - exemption);
      notes.push(
        `LTCG exemption of ${formatRupee(config.ltcgExemption)} applied (Section 112A)`
      );
    }

    taxRate = config.ltcgRate;
    notes.push(`Long-term: held for ${input.holdingMonths} months (threshold: ${config.ltcgMonths} months)`);
  } else {
    taxRate = config.stcgRate === -1 ? 30 : config.stcgRate; // assume 30% slab for estimation
    if (config.stcgRate === -1) {
      notes.push("STCG taxed at your income tax slab rate (30% assumed for estimation)");
    }
    notes.push(`Short-term: held for ${input.holdingMonths} months (threshold: ${config.ltcgMonths} months)`);
  }

  taxableGain = Math.max(0, taxableGain);
  const baseTax = Math.round(taxableGain * (taxRate / 100));
  const surcharge = 0; // simplified
  const cess = Math.round(baseTax * 0.04);
  const totalTax = baseTax + cess;

  return {
    gain,
    isLongTerm,
    holdingPeriod: isLongTerm ? "Long-Term" : "Short-Term",
    indexedCost,
    taxableGain,
    exemption,
    taxRate,
    tax: baseTax,
    surcharge,
    cess,
    totalTax,
    notes,
  };
}

export default function CapitalGainsPage() {
  const [input, setInput] = useState<CGInput>({
    assetType: "equity",
    purchasePrice: 0,
    salePrice: 0,
    purchaseYear: 2023,
    saleYear: 2025,
    holdingMonths: 18,
    expenses: 0,
  });

  const result = calculateCapitalGains(input);

  const handleChange = (key: keyof CGInput, value: string | number) => {
    if (typeof value === "string") {
      const num = parseInt(value.replace(/,/g, ""), 10) || 0;
      setInput((prev) => ({ ...prev, [key]: num }));
    } else {
      setInput((prev) => ({ ...prev, [key]: value }));
    }
  };

  const currentYear = 2026;
  const years = Array.from({ length: 26 }, (_, i) => 2001 + i);

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            Capital Gains Calculator
          </h1>
          <p className="text-muted">
            Calculate short-term and long-term capital gains tax on stocks, mutual
            funds, property, and gold. FY 2025-26 rules.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Input Form */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6 sm:p-8">
              <h2 className="mb-6 text-lg font-semibold text-foreground">
                Asset Details
              </h2>

              {/* Asset type selector */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Asset Type
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.entries(assetConfig) as [AssetType, typeof assetConfig[AssetType]][]).map(
                    ([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setInput((prev) => ({ ...prev, assetType: key }))
                        }
                        className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                          input.assetType === key
                            ? "border-accent-indigo/50 bg-accent-indigo/10"
                            : "border-card-border bg-card hover:border-accent-indigo/30"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            input.assetType === key
                              ? "text-accent-indigo"
                              : "text-foreground"
                          }`}
                        >
                          {config.label}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {config.description}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Price inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "purchasePrice" as const, label: "Purchase Price", hint: "Total cost of acquisition" },
                  { key: "salePrice" as const, label: "Sale Price", hint: "Total sale consideration" },
                  { key: "expenses" as const, label: "Expenses", hint: "Brokerage, stamp duty, etc." },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      {field.label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                        &#x20B9;
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={input[field.key] === 0 ? "" : formatINR(input[field.key])}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-8 pr-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">{field.hint}</p>
                  </div>
                ))}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Holding Period (Months)
                  </label>
                  <input
                    type="number"
                    value={input.holdingMonths || ""}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        holdingMonths: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="e.g. 18"
                    className="w-full rounded-xl border border-card-border bg-card py-2.5 px-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                  />
                  <p className="mt-1 text-xs text-muted">
                    Number of months held
                  </p>
                </div>
              </div>

              {/* Year selectors for indexation */}
              {assetConfig[input.assetType].indexation && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Purchase FY (for indexation)
                    </label>
                    <select
                      value={input.purchaseYear}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          purchaseYear: parseInt(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-card-border bg-card py-2.5 px-4 text-foreground focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          FY {y}-{(y + 1).toString().slice(-2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Sale FY (for indexation)
                    </label>
                    <select
                      value={input.saleYear}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          saleYear: parseInt(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-card-border bg-card py-2.5 px-4 text-foreground focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                    >
                      {years.filter((y) => y >= input.purchaseYear).map((y) => (
                        <option key={y} value={y}>
                          FY {y}-{(y + 1).toString().slice(-2)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-2">
            {result ? (
              <>
                <div
                  className={`glass-card p-6 ${
                    result.isLongTerm ? "glow-green" : "glow-indigo"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        result.isLongTerm
                          ? "bg-accent-green/15 text-accent-green"
                          : "bg-accent-amber/15 text-accent-amber"
                      }`}
                    >
                      {result.holdingPeriod}
                    </span>
                  </div>
                  <p className="text-sm text-muted">Capital Gain</p>
                  <p
                    className={`text-3xl font-bold ${
                      result.gain >= 0 ? "text-accent-green" : "text-accent-red"
                    }`}
                  >
                    {formatRupee(result.gain)}
                  </p>
                </div>

                <div className="glass-card p-6">
                  <p className="text-sm text-muted">Estimated Tax</p>
                  <p className="text-2xl font-bold text-accent-red">
                    {formatRupee(result.totalTax)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    at {result.taxRate}% + 4% cess
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Sale Price</span>
                      <span className="font-mono text-foreground">
                        {formatRupee(input.salePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Purchase Price</span>
                      <span className="font-mono text-foreground">
                        {formatRupee(input.purchasePrice)}
                      </span>
                    </div>
                    {assetConfig[input.assetType].indexation &&
                      result.isLongTerm && (
                        <div className="flex justify-between">
                          <span className="text-muted">Indexed Cost</span>
                          <span className="font-mono text-accent-indigo">
                            {formatRupee(result.indexedCost)}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between">
                      <span className="text-muted">Expenses</span>
                      <span className="font-mono text-foreground">
                        {formatRupee(input.expenses)}
                      </span>
                    </div>
                    {result.exemption > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">LTCG Exemption</span>
                        <span className="font-mono text-accent-green">
                          -{formatRupee(result.exemption)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-card-border pt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground">Taxable Gain</span>
                        <span className="font-mono text-foreground">
                          {formatRupee(result.taxableGain)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">
                        Tax @ {result.taxRate}%
                      </span>
                      <span className="font-mono text-foreground">
                        {formatRupee(result.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Cess (4%)</span>
                      <span className="font-mono text-foreground">
                        {formatRupee(result.cess)}
                      </span>
                    </div>
                    <div className="border-t border-card-border pt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total Tax</span>
                        <span className="font-mono text-accent-red">
                          {formatRupee(result.totalTax)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {result.notes.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      Notes
                    </h3>
                    <div className="space-y-2">
                      {result.notes.map((note, i) => (
                        <p key={i} className="text-xs text-muted">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card flex h-64 items-center justify-center p-6">
                <p className="text-muted">
                  Enter asset details to calculate capital gains tax
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-10 glass-card overflow-hidden p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            FY 2025-26 Capital Gains Tax Rates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left">
                  <th className="pb-3 pr-4 font-medium text-muted">Asset</th>
                  <th className="pb-3 pr-4 font-medium text-muted">
                    LTCG Threshold
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted">STCG Rate</th>
                  <th className="pb-3 pr-4 font-medium text-muted">LTCG Rate</th>
                  <th className="pb-3 font-medium text-muted">Exemption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {(Object.entries(assetConfig) as [AssetType, typeof assetConfig[AssetType]][]).map(
                  ([key, config]) => (
                    <tr key={key}>
                      <td className="py-3 pr-4 text-foreground">{config.label}</td>
                      <td className="py-3 pr-4 font-mono text-muted">
                        {config.ltcgMonths} months
                      </td>
                      <td className="py-3 pr-4 font-mono text-accent-amber">
                        {config.stcgRate === -1 ? "Slab Rate" : `${config.stcgRate}%`}
                      </td>
                      <td className="py-3 pr-4 font-mono text-accent-indigo">
                        {config.ltcgRate}%
                      </td>
                      <td className="py-3 font-mono text-accent-green">
                        {config.ltcgExemption > 0
                          ? formatRupee(config.ltcgExemption)
                          : "-"}
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
  );
}
