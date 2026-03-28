"use client";

import { useState } from "react";
import TaxForm from "@/components/TaxForm";
import RegimeComparison from "@/components/RegimeComparison";
import {
  calculateNewRegimeTax,
  calculateOldRegimeTax,
  getRecommendation,
  type TaxInput,
  type TaxResult,
} from "@/lib/tax-calculator";

export default function CalculatorPage() {
  const [results, setResults] = useState<{
    newRegime: TaxResult;
    oldRegime: TaxResult;
    recommendation: { regime: "new" | "old"; savings: number };
  } | null>(null);

  const handleCalculate = (input: TaxInput) => {
    const newRegime = calculateNewRegimeTax(input);
    const oldRegime = calculateOldRegimeTax(input);
    const recommendation = getRecommendation(newRegime, oldRegime);
    setResults({ newRegime, oldRegime, recommendation });
  };

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            Income Tax Calculator
          </h1>
          <p className="text-muted">
            Compare Old vs New Tax Regime for FY 2025-26. Enter your details
            below.
          </p>
        </div>

        {/* Form */}
        <div className="mx-auto mb-10 max-w-2xl">
          <div className="glass-card p-6 sm:p-8">
            <TaxForm onCalculate={handleCalculate} />
          </div>
        </div>

        {/* Results */}
        {results && (
          <RegimeComparison
            newRegime={results.newRegime}
            oldRegime={results.oldRegime}
            recommendation={results.recommendation}
          />
        )}
      </div>
    </div>
  );
}
