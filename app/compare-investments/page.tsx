"use client";

import { useState, useMemo } from "react";
import { formatINR, formatRupee } from "@/lib/utils";

type InvestmentType = "fd" | "ppf" | "elss" | "nps" | "mutual_fund";

interface InvestmentConfig {
  label: string;
  returnRate: number; // pre-tax annual return %
  lockIn: string;
  taxTreatment: string;
  risk: "Low" | "Moderate" | "High";
  section: string;
  color: string;
}

const investments: Record<InvestmentType, InvestmentConfig> = {
  fd: {
    label: "Fixed Deposit",
    returnRate: 7.0,
    lockIn: "5 years (tax saving)",
    taxTreatment: "Interest taxed at slab rate",
    risk: "Low",
    section: "80C (5-yr FD)",
    color: "from-blue-500 to-blue-400",
  },
  ppf: {
    label: "PPF",
    returnRate: 7.1,
    lockIn: "15 years",
    taxTreatment: "EEE - Exempt at all stages",
    risk: "Low",
    section: "80C",
    color: "from-accent-green to-emerald-400",
  },
  elss: {
    label: "ELSS Mutual Fund",
    returnRate: 12.0,
    lockIn: "3 years",
    taxTreatment: "LTCG > 1.25L taxed at 12.5%",
    risk: "High",
    section: "80C",
    color: "from-accent-indigo to-accent-purple",
  },
  nps: {
    label: "NPS (National Pension)",
    returnRate: 10.0,
    lockIn: "Until 60",
    taxTreatment: "60% tax-free on maturity, 40% annuity taxed",
    risk: "Moderate",
    section: "80CCD(1B) + 80C",
    color: "from-accent-amber to-orange-400",
  },
  mutual_fund: {
    label: "Equity Mutual Fund (Non-ELSS)",
    returnRate: 12.0,
    lockIn: "None",
    taxTreatment: "LTCG > 1.25L at 12.5%, STCG at 20%",
    risk: "High",
    section: "No 80C benefit",
    color: "from-rose-500 to-accent-red",
  },
};

interface YearlyData {
  year: number;
  invested: number;
  preTransactionValue: number;
  postTaxValue: number;
}

function calculateReturns(
  type: InvestmentType,
  monthlyInvestment: number,
  years: number,
  taxSlab: number
): YearlyData[] {
  const config = investments[type];
  const rate = config.returnRate / 100;
  const data: YearlyData[] = [];

  let totalInvested = 0;
  let corpus = 0;

  for (let y = 1; y <= years; y++) {
    const yearlyInvestment = monthlyInvestment * 12;
    totalInvested += yearlyInvestment;

    // Simple compound calculation
    corpus = (corpus + yearlyInvestment) * (1 + rate);

    // Calculate post-tax value
    const totalGain = corpus - totalInvested;
    let taxOnGain = 0;

    switch (type) {
      case "fd":
        // Interest taxed at slab rate every year
        taxOnGain = totalGain * (taxSlab / 100);
        break;
      case "ppf":
        // EEE - no tax
        taxOnGain = 0;
        break;
      case "elss":
      case "mutual_fund":
        // LTCG: gains above 1.25L taxed at 12.5%
        if (totalGain > 125000) {
          taxOnGain = (totalGain - 125000) * 0.125;
        }
        break;
      case "nps":
        // 60% tax-free, 40% taxed at slab (simplified)
        taxOnGain = totalGain * 0.4 * (taxSlab / 100);
        break;
    }

    // 80C tax savings (for eligible instruments)
    let taxSavings = 0;
    if (type !== "mutual_fund") {
      const eligible80C = Math.min(yearlyInvestment, 150000);
      taxSavings += eligible80C * (taxSlab / 100);
    }
    if (type === "nps") {
      // Additional 50K under 80CCD(1B)
      const npsExtra = Math.min(yearlyInvestment, 50000);
      taxSavings += npsExtra * (taxSlab / 100);
    }

    const postTaxValue = Math.round(corpus - taxOnGain);

    data.push({
      year: y,
      invested: Math.round(totalInvested),
      preTransactionValue: Math.round(corpus),
      postTaxValue,
    });
  }

  return data;
}

export default function CompareInvestmentsPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [years, setYears] = useState(10);
  const [taxSlab, setTaxSlab] = useState(30);
  const [selected, setSelected] = useState<InvestmentType[]>([
    "fd",
    "ppf",
    "elss",
    "nps",
  ]);

  const results = useMemo(() => {
    const data: Record<string, YearlyData[]> = {};
    for (const type of selected) {
      data[type] = calculateReturns(type, monthlyInvestment, years, taxSlab);
    }
    return data;
  }, [monthlyInvestment, years, taxSlab, selected]);

  const toggleInvestment = (type: InvestmentType) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Get final values for comparison
  const finalValues = selected.map((type) => {
    const data = results[type];
    const final = data?.[data.length - 1];
    return {
      type,
      config: investments[type],
      invested: final?.invested || 0,
      preTransactionValue: final?.preTransactionValue || 0,
      postTaxValue: final?.postTaxValue || 0,
      totalGain: (final?.postTaxValue || 0) - (final?.invested || 0),
    };
  });

  const maxValue = Math.max(...finalValues.map((v) => v.postTaxValue), 1);

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            Compare Investment Returns
          </h1>
          <p className="text-muted">
            Compare FD, PPF, ELSS, NPS, and Mutual Funds with post-tax returns.
            See how tax implications affect your real returns.
          </p>
        </div>

        {/* Controls */}
        <div className="glass-card mb-8 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Monthly Investment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  &#x20B9;
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={monthlyInvestment === 0 ? "" : formatINR(monthlyInvestment)}
                  onChange={(e) => {
                    const num = parseInt(e.target.value.replace(/,/g, ""), 10) || 0;
                    setMonthlyInvestment(num);
                  }}
                  placeholder="10,000"
                  className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-8 pr-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Investment Period (Years)
              </label>
              <input
                type="number"
                value={years}
                min={1}
                max={30}
                onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-card-border bg-card py-2.5 px-4 text-foreground focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Your Tax Slab
              </label>
              <div className="flex gap-2">
                {[0, 5, 10, 15, 20, 30].map((slab) => (
                  <button
                    key={slab}
                    type="button"
                    onClick={() => setTaxSlab(slab)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                      taxSlab === slab
                        ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
                        : "border-card-border bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    {slab}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Investment type selector */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Select Investments to Compare
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(investments) as [InvestmentType, InvestmentConfig][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInvestment(key)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      selected.includes(key)
                        ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
                        : "border-card-border bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    {config.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Visual bar chart comparison */}
        {finalValues.length > 0 && (
          <div className="glass-card mb-8 p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Post-Tax Value After {years} Years
            </h2>
            <div className="space-y-4">
              {finalValues
                .sort((a, b) => b.postTaxValue - a.postTaxValue)
                .map((item) => {
                  const barWidth = (item.postTaxValue / maxValue) * 100;
                  const investedWidth = (item.invested / maxValue) * 100;
                  return (
                    <div key={item.type}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {item.config.label}
                        </span>
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {formatRupee(item.postTaxValue)}
                        </span>
                      </div>
                      <div className="relative h-8 overflow-hidden rounded-lg bg-background/80">
                        {/* Invested amount bar */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg bg-muted/20"
                          style={{ width: `${investedWidth}%` }}
                        />
                        {/* Post-tax value bar */}
                        <div
                          className={`absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r ${item.config.color} animate-bar opacity-80`}
                          style={{ width: `${barWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-medium text-white drop-shadow-sm">
                            Gain: {formatRupee(item.totalGain)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-0.5 flex justify-between text-xs text-muted">
                        <span>Invested: {formatRupee(item.invested)}</span>
                        <span>
                          Return: {item.config.returnRate}% |{" "}
                          {item.config.risk} risk
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-4 text-xs text-muted">
              Total invested:{" "}
              {formatRupee(monthlyInvestment * 12 * years)} over {years} years
            </div>
          </div>
        )}

        {/* Year-by-year table */}
        {selected.length > 0 && (
          <div className="glass-card overflow-hidden p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Year-by-Year Growth (Post-Tax)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border text-left">
                    <th className="pb-3 pr-4 font-medium text-muted">Year</th>
                    <th className="pb-3 pr-4 font-medium text-muted">
                      Invested
                    </th>
                    {selected.map((type) => (
                      <th
                        key={type}
                        className="pb-3 pr-4 font-medium text-muted"
                      >
                        {investments[type].label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {Array.from({ length: years }, (_, i) => i).map((i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4 font-mono text-foreground">
                        {i + 1}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-muted">
                        {formatRupee(monthlyInvestment * 12 * (i + 1))}
                      </td>
                      {selected.map((type) => {
                        const yearData = results[type]?.[i];
                        return (
                          <td
                            key={type}
                            className="py-2.5 pr-4 font-mono text-foreground"
                          >
                            {yearData
                              ? formatRupee(yearData.postTaxValue)
                              : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Investment details cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(investments) as [InvestmentType, InvestmentConfig][]).map(
            ([key, config]) => (
              <div key={key} className="glass-card p-5">
                <div
                  className={`mb-3 inline-flex rounded-lg bg-gradient-to-r ${config.color} px-3 py-1 text-xs font-semibold text-white`}
                >
                  {config.returnRate}% p.a.
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {config.label}
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Lock-in</span>
                    <span className="text-foreground">{config.lockIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Risk</span>
                    <span
                      className={`font-medium ${
                        config.risk === "Low"
                          ? "text-accent-green"
                          : config.risk === "Moderate"
                          ? "text-accent-amber"
                          : "text-accent-red"
                      }`}
                    >
                      {config.risk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Section</span>
                    <span className="text-foreground">{config.section}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted">{config.taxTreatment}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
