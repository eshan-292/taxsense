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
  const [lastInput, setLastInput] = useState<TaxInput | null>(null);
  const [results, setResults] = useState<{

    newRegime: TaxResult;
    oldRegime: TaxResult;
    recommendation: { regime: "new" | "old"; savings: number };
  } | null>(null);
  const handleCalculate = (input: TaxInput) => {
    const newRegime = calculateNewRegimeTax(input);
    const oldRegime = calculateOldRegimeTax(input);
    const recommendation = getRecommendation(newRegime, oldRegime);
    setLastInput(input);
    setResults({ newRegime, oldRegime, recommendation });
  };

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-bold text-foreground sm:text-3xl">
            Income Tax Calculator
          </h1>
          <p className="text-sm text-muted">FY 2025-26 · Old vs New Regime</p>
        </div>

        <div className="glass-card mb-6 p-5 sm:p-7">
          <TaxForm onCalculate={handleCalculate} />
        </div>

        {results && lastInput && (
          <div className="scroll-mt-4">
            <RegimeComparison
              input={lastInput}
              newRegime={results.newRegime}
              oldRegime={results.oldRegime}
              recommendation={results.recommendation}
            />
          </div>
        )}
      </div>
    </div>
  );
}
