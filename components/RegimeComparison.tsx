"use client";

import { useState } from "react";
import type { TaxInput, TaxResult } from "@/lib/tax-calculator";
import { calculateOldRegimeTax } from "@/lib/tax-calculator";
import { formatRupee } from "@/lib/utils";
import TaxOpportunities from "./TaxOpportunities";
import WhatIfSliders from "./WhatIfSliders";

interface RegimeComparisonProps {
  input: TaxInput;
  newRegime: TaxResult;
  oldRegime: TaxResult;
  recommendation: { regime: "new" | "old"; savings: number };
}

function Row({ label, value, bold, green }: { label: string; value: number; bold?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-medium text-foreground" : "text-muted"}>{label}</span>
      <span className={`font-mono ${bold ? "font-semibold" : ""} ${green ? "text-accent-green" : "text-foreground"}`}>
        {formatRupee(value)}
      </span>
    </div>
  );
}

function TaxCard({
  title,
  result,
  isRecommended,
  accentClass,
}: {
  title: string;
  result: TaxResult;
  isRecommended: boolean;
  accentClass: string;
}) {
  const [showSlabs, setShowSlabs] = useState(false);

  return (
    <div className={`glass-card relative overflow-hidden p-5 ${isRecommended ? "glow-green ring-1 ring-accent-green/30" : ""}`}>
      {isRecommended && (
        <div className="absolute right-4 top-4 rounded-full bg-accent-green/15 px-2.5 py-0.5 text-xs font-semibold text-accent-green">
          Recommended
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>

      {/* Total tax — prominent */}
      <div className="my-4 rounded-xl bg-background/50 p-4">
        <p className="text-xs text-muted">Total Tax Payable</p>
        <p className={`text-3xl font-bold ${result.totalTax === 0 ? "text-accent-green" : accentClass}`}>
          {formatRupee(result.totalTax)}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {result.effectiveRate.toFixed(1)}% effective · {formatRupee(result.monthlyTax)}/mo
        </p>
      </div>

      <div className="space-y-2.5">
        <Row label="Gross Income" value={result.grossIncome} />
        <Row label="Total Deductions" value={-result.totalDeductions} />
        <div className="border-t border-card-border pt-2">
          <Row label="Taxable Income" value={result.taxableIncome} bold />
        </div>
        <Row label="Base Tax" value={result.baseTax} />
        {result.rebate87A > 0 && <Row label="Rebate u/s 87A" value={-result.rebate87A} green />}
        {result.surcharge > 0 && (
          <Row label={`Surcharge (${(result.surchargeRate * 100).toFixed(0)}%)`} value={result.surcharge} />
        )}
        {result.cess > 0 && <Row label="Health & Edu Cess (4%)" value={result.cess} />}
        <div className="border-t border-card-border pt-2">
          <Row label="Annual Take-Home" value={result.takeHome} bold green />
          <Row label="Monthly Take-Home" value={result.monthlyTakeHome} bold green />
        </div>
      </div>

      {/* Slab breakdown — collapsible */}
      <button
        onClick={() => setShowSlabs(!showSlabs)}
        className="mt-4 flex w-full items-center gap-1 text-xs text-muted/60 hover:text-muted transition-colors"
      >
        <svg className={`h-3 w-3 transition-transform ${showSlabs ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showSlabs ? "Hide" : "Show"} slab breakdown
      </button>
      {showSlabs && (
        <div className="mt-3 space-y-2">
          {result.slabBreakdown.map((slab, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted">{slab.slab} <span className="opacity-60">({slab.rate}%)</span></span>
              <span className="font-mono text-foreground">{formatRupee(slab.tax)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function computeBreakeven(newRegime: TaxResult, oldRegime: TaxResult): number | null {
  const grossIncome = newRegime.grossIncome;
  const newTax = newRegime.totalTax;

  // If old regime is already better with current deductions, find minimum deductions needed
  // Binary search: find D such that old_regime_tax(gross - stdDeduction - D) ≈ newTax
  const baseInput: TaxInput = {
    annualSalary: grossIncome,
    incomeHouseProperty: 0, incomeCapitalGains: 0, incomeOtherSources: 0,
    hra: 0, section80C: 0, section80D_self: 0, section80D_parents: 0,
    homeLoanInterest: 0, nps80CCD1B: 0, section80E: 0, section80G: 0, otherDeductions: 0,
  };

  // If even with no deductions old regime is cheaper, breakeven is 0
  const oldNoDeductions = calculateOldRegimeTax(baseInput).totalTax;
  if (oldNoDeductions <= newTax) return 0;

  let lo = 0, hi = 3_000_000;
  for (let i = 0; i < 30; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const result = calculateOldRegimeTax({ ...baseInput, otherDeductions: mid });
    if (result.totalTax > newTax) lo = mid;
    else hi = mid;
  }
  return Math.round(hi / 1000) * 1000; // round to nearest 1K
}

export default function RegimeComparison({ input, newRegime, oldRegime, recommendation }: RegimeComparisonProps) {
  const [copied, setCopied] = useState(false);
  const [showOtherRegime, setShowOtherRegime] = useState(false);

  const recommended = recommendation.regime === "new" ? newRegime : oldRegime;
  const other = recommendation.regime === "new" ? oldRegime : newRegime;
  const recommendedTitle = recommendation.regime === "new" ? "New Tax Regime" : "Old Tax Regime";
  const otherTitle = recommendation.regime === "new" ? "Old Tax Regime" : "New Tax Regime";
  const recommendedAccent = recommendation.regime === "new" ? "text-accent-indigo" : "text-accent-amber";
  const otherAccent = recommendation.regime === "new" ? "text-accent-amber" : "text-accent-indigo";

  const breakeven = computeBreakeven(newRegime, oldRegime);
  const currentDeductions = oldRegime.totalDeductions - 50000; // subtract std deduction

  const handleShare = () => {
    const better = recommendation.regime === "new" ? "New" : "Old";
    const text = `My FY 2025-26 Tax Summary (via TaxSense)
---
Income: ${formatRupee(newRegime.grossIncome)}
✅ ${better} Regime — saves ${formatRupee(recommendation.savings)}

New Regime: ${formatRupee(newRegime.totalTax)} tax (${newRegime.effectiveRate.toFixed(1)}% effective)
Old Regime: ${formatRupee(oldRegime.totalTax)} tax (${oldRegime.effectiveRate.toFixed(1)}% effective)

Monthly take-home: ${formatRupee(recommendation.regime === "new" ? newRegime.monthlyTakeHome : oldRegime.monthlyTakeHome)}

taxsense-self.vercel.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Recommendation banner */}
      <div className="glass-card glow-green flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-green/15">
          <svg className="h-5 w-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">
            {recommendation.regime === "new" ? "New" : "Old"} Regime saves you more
          </p>
          <p className="text-sm text-muted">
            <span className="font-semibold text-accent-green">{formatRupee(recommendation.savings)}</span> less tax vs{" "}
            {recommendation.regime === "new" ? "old" : "new"} regime
          </p>
          {/* Breakeven */}
          {breakeven !== null && recommendation.regime === "new" && (
            <p className="mt-1 text-xs text-muted/70">
              Old regime beats New if deductions exceed{" "}
              <span className="font-medium text-muted">{formatRupee(breakeven)}</span>
              {currentDeductions > 0 && (
                <> · you have {formatRupee(currentDeductions)}</>
              )}
            </p>
          )}
          {recommendation.regime === "old" && (
            <p className="mt-1 text-xs text-muted/70">
              Your deductions ({formatRupee(currentDeductions)}) make Old Regime beneficial
            </p>
          )}
        </div>
        <button
          onClick={handleShare}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-card-border bg-background/40 px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-accent-indigo/30 hover:text-foreground"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Share
            </>
          )}
        </button>
      </div>

      {/* Recommended regime — full width hero */}
      <TaxCard
        title={recommendedTitle}
        result={recommended}
        isRecommended
        accentClass={recommendedAccent}
      />

      {/* Tax saving opportunities (old regime focused) */}
      <TaxOpportunities input={input} oldRegime={oldRegime} />

      {/* What-if sliders */}
      <WhatIfSliders originalInput={input} originalOldRegime={oldRegime} />

      {/* Other regime — collapsible */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowOtherRegime(!showOtherRegime)}
          className="flex w-full items-center justify-between p-5"
        >
          <div>
            <p className="text-sm font-semibold text-foreground text-left">{otherTitle}</p>
            <p className="text-xs text-muted">{formatRupee(other.totalTax)} tax · {other.effectiveRate.toFixed(1)}% effective</p>
          </div>
          <svg
            className={`h-4 w-4 text-muted transition-transform ${showOtherRegime ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showOtherRegime && (
          <div className="border-t border-card-border p-5 pt-4">
            <TaxCard
              title={otherTitle}
              result={other}
              isRecommended={false}
              accentClass={otherAccent}
            />
          </div>
        )}
      </div>
    </div>
  );
}
