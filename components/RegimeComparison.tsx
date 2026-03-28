"use client";

import { useState } from "react";
import type { TaxResult } from "@/lib/tax-calculator";
import { formatRupee } from "@/lib/utils";

interface RegimeComparisonProps {
  newRegime: TaxResult;
  oldRegime: TaxResult;
  recommendation: { regime: "new" | "old"; savings: number };
}

function TaxCard({
  title,
  result,
  isRecommended,
  accentColor,
}: {
  title: string;
  result: TaxResult;
  isRecommended: boolean;
  accentColor: string;
}) {
  return (
    <div
      className={`glass-card relative overflow-hidden p-6 ${
        isRecommended ? "glow-green ring-1 ring-accent-green/30" : ""
      }`}
    >
      {isRecommended && (
        <div className="absolute right-4 top-4 rounded-full bg-accent-green/15 px-3 py-1 text-xs font-semibold text-accent-green">
          Recommended
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-sm text-muted">FY 2025-26</p>

      {/* Total Tax - prominent */}
      <div className="mb-6 rounded-xl bg-background/50 p-4">
        <p className="text-sm text-muted">Total Tax Payable</p>
        <p
          className={`text-3xl font-bold ${
            result.totalTax === 0
              ? "text-accent-green"
              : `text-${accentColor}`
          }`}
        >
          {formatRupee(result.totalTax)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {result.effectiveRate.toFixed(1)}% effective rate
        </p>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <Row label="Gross Income" value={result.grossIncome} />
        <Row label="Standard Deduction" value={-result.standardDeduction} />
        <Row label="Total Deductions" value={-result.totalDeductions} />
        <div className="border-t border-card-border pt-2">
          <Row label="Taxable Income" value={result.taxableIncome} bold />
        </div>
        <Row label="Base Tax" value={result.baseTax} />
        {result.rebate87A > 0 && (
          <Row label="Rebate u/s 87A" value={-result.rebate87A} green />
        )}
        {result.surcharge > 0 && (
          <Row
            label={`Surcharge (${(result.surchargeRate * 100).toFixed(0)}%)`}
            value={result.surcharge}
          />
        )}
        {result.cess > 0 && <Row label="Health & Edu. Cess (4%)" value={result.cess} />}
        <div className="border-t border-card-border pt-2">
          <Row label="Monthly Tax" value={result.monthlyTax} />
          <Row label="Annual Take-Home" value={result.takeHome} bold green />
          <Row label="Monthly Take-Home" value={result.monthlyTakeHome} bold green />
        </div>
      </div>

      {/* Slab breakdown */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-foreground">
          Slab-wise Breakdown
        </p>
        <div className="space-y-2">
          {result.slabBreakdown.map((slab, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {slab.slab}{" "}
                <span className="text-xs">({slab.rate}%)</span>
              </span>
              <span className="font-mono text-foreground">
                {formatRupee(slab.tax)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  green,
}: {
  label: string;
  value: number;
  bold?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-medium text-foreground" : "text-muted"}>
        {label}
      </span>
      <span
        className={`font-mono ${
          bold ? "font-semibold" : ""
        } ${green ? "text-accent-green" : "text-foreground"}`}
      >
        {formatRupee(value)}
      </span>
    </div>
  );
}

export default function RegimeComparison({
  newRegime,
  oldRegime,
  recommendation,
}: RegimeComparisonProps) {
  const [copied, setCopied] = useState(false);
  const maxTax = Math.max(newRegime.totalTax, oldRegime.totalTax, 1);
  const newBarHeight = (newRegime.totalTax / maxTax) * 100;
  const oldBarHeight = (oldRegime.totalTax / maxTax) * 100;

  const handleShare = () => {
    const better = recommendation.regime === "new" ? "New" : "Old";
    const text = `My FY 2025-26 Tax Summary (via TaxSense)
---
Income: ${formatRupee(newRegime.grossIncome)}
✅ ${better} Regime recommended — saves ${formatRupee(recommendation.savings)}

New Regime: ${formatRupee(newRegime.totalTax)} tax | ${newRegime.effectiveRate.toFixed(1)}% effective rate
Old Regime: ${formatRupee(oldRegime.totalTax)} tax | ${oldRegime.effectiveRate.toFixed(1)}% effective rate

Monthly take-home (${better}): ${formatRupee(recommendation.regime === "new" ? newRegime.monthlyTakeHome : oldRegime.monthlyTakeHome)}

Calculate yours free at taxsense-self.vercel.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <div className="glass-card glow-green flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-green/15">
          <svg
            className="h-6 w-6 text-accent-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-foreground">
            {recommendation.regime === "new" ? "New" : "Old"} Tax Regime saves
            you more
          </p>
          <p className="text-sm text-muted">
            You save{" "}
            <span className="font-semibold text-accent-green">
              {formatRupee(recommendation.savings)}
            </span>{" "}
            compared to the{" "}
            {recommendation.regime === "new" ? "old" : "new"} regime
          </p>
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

      {/* Visual comparison bar chart */}
      <div className="glass-card p-6">
        <h3 className="mb-6 text-sm font-medium text-foreground">
          Tax Comparison
        </h3>
        <div className="flex items-end justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatRupee(newRegime.totalTax)}
            </span>
            <div
              className="w-20 animate-bar rounded-t-lg bg-gradient-to-t from-accent-indigo to-accent-purple sm:w-28"
              style={{ height: `${Math.max(newBarHeight * 1.5, 8)}px` }}
            />
            <span className="text-xs text-muted">New Regime</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatRupee(oldRegime.totalTax)}
            </span>
            <div
              className="w-20 animate-bar rounded-t-lg bg-gradient-to-t from-accent-amber to-accent-red sm:w-28"
              style={{ height: `${Math.max(oldBarHeight * 1.5, 8)}px` }}
            />
            <span className="text-xs text-muted">Old Regime</span>
          </div>
        </div>
      </div>

      {/* Detailed cards side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TaxCard
          title="New Tax Regime"
          result={newRegime}
          isRecommended={recommendation.regime === "new"}
          accentColor="accent-indigo"
        />
        <TaxCard
          title="Old Tax Regime"
          result={oldRegime}
          isRecommended={recommendation.regime === "old"}
          accentColor="accent-amber"
        />
      </div>
    </div>
  );
}
