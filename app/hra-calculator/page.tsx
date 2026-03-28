"use client";

import { useState } from "react";
import { formatINR, formatRupee } from "@/lib/utils";

interface HRAInput {
  basicSalary: number;
  da: number;
  hraReceived: number;
  rentPaid: number;
  isMetro: boolean;
}

interface HRAResult {
  actualHRA: number;
  rentMinus10: number;
  percentOfSalary: number;
  exemption: number;
  taxableHRA: number;
  rule: string;
}

function calculateHRA(input: HRAInput): HRAResult | null {
  if (input.basicSalary === 0 && input.hraReceived === 0) return null;

  const salary = input.basicSalary + input.da;
  const metroPercent = input.isMetro ? 0.5 : 0.4;

  const actualHRA = input.hraReceived;
  const rentMinus10 = Math.max(0, input.rentPaid - 0.1 * salary);
  const percentOfSalary = metroPercent * salary;

  const exemption = Math.min(actualHRA, rentMinus10, percentOfSalary);

  let rule = "";
  if (exemption === actualHRA) rule = "Actual HRA received";
  else if (exemption === rentMinus10)
    rule = "Rent paid minus 10% of salary (Basic + DA)";
  else rule = `${input.isMetro ? "50%" : "40%"} of salary (Basic + DA)`;

  return {
    actualHRA,
    rentMinus10,
    percentOfSalary,
    exemption: Math.round(exemption),
    taxableHRA: Math.round(Math.max(0, actualHRA - exemption)),
    rule,
  };
}

export default function HRACalculatorPage() {
  const [input, setInput] = useState<HRAInput>({
    basicSalary: 0,
    da: 0,
    hraReceived: 0,
    rentPaid: 0,
    isMetro: true,
  });

  const result = calculateHRA(input);

  const handleChange = (key: keyof Omit<HRAInput, "isMetro">, value: string) => {
    const num = parseInt(value.replace(/,/g, ""), 10) || 0;
    setInput((prev) => ({ ...prev, [key]: num }));
  };

  const fields: { key: keyof Omit<HRAInput, "isMetro">; label: string; hint: string }[] = [
    {
      key: "basicSalary",
      label: "Basic Salary (Annual)",
      hint: "Your annual basic salary component",
    },
    {
      key: "da",
      label: "Dearness Allowance (Annual)",
      hint: "DA received annually (enter 0 if not applicable)",
    },
    {
      key: "hraReceived",
      label: "HRA Received (Annual)",
      hint: "Total HRA received from employer in a year",
    },
    {
      key: "rentPaid",
      label: "Rent Paid (Annual)",
      hint: "Total rent paid during the year",
    },
  ];

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            HRA Calculator
          </h1>
          <p className="text-muted">
            Calculate your House Rent Allowance exemption under Section 10(13A).
            Applicable under the Old Tax Regime only.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div className="glass-card p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Enter Details
            </h2>
            <div className="space-y-4">
              {fields.map((field) => (
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

              {/* Metro toggle */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  City Type
                </label>
                <div className="flex gap-3">
                  {[
                    { value: true, label: "Metro (Delhi, Mumbai, Kolkata, Chennai)" },
                    { value: false, label: "Non-Metro" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setInput((prev) => ({ ...prev, isMetro: opt.value }))}
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                        input.isMetro === opt.value
                          ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
                          : "border-card-border bg-card text-muted hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted">
                  Metro cities get 50% of salary; non-metro gets 40%
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Exemption amount */}
                <div className="glass-card glow-green p-6">
                  <p className="text-sm text-muted">HRA Exemption (Tax-Free)</p>
                  <p className="text-3xl font-bold text-accent-green">
                    {formatRupee(result.exemption)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    per year ({formatRupee(Math.round(result.exemption / 12))}/month)
                  </p>
                </div>

                {/* Taxable HRA */}
                <div className="glass-card p-6">
                  <p className="text-sm text-muted">Taxable HRA</p>
                  <p className="text-2xl font-bold text-accent-amber">
                    {formatRupee(result.taxableHRA)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    This amount will be added to your taxable income
                  </p>
                </div>

                {/* Three conditions breakdown */}
                <div className="glass-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    Exemption Calculation
                  </h3>
                  <p className="mb-4 text-sm text-muted">
                    HRA exemption is the minimum of these three:
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Actual HRA received",
                        value: result.actualHRA,
                        isMin: result.exemption === result.actualHRA,
                      },
                      {
                        label: `Rent paid - 10% of salary`,
                        value: result.rentMinus10,
                        isMin: result.exemption === result.rentMinus10,
                      },
                      {
                        label: `${input.isMetro ? "50%" : "40%"} of salary (Basic + DA)`,
                        value: result.percentOfSalary,
                        isMin: result.exemption === result.percentOfSalary,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          item.isMin
                            ? "border-accent-green/30 bg-accent-green/5"
                            : "border-card-border bg-background/30"
                        }`}
                      >
                        <span className="text-sm text-muted">{item.label}</span>
                        <span
                          className={`font-mono text-sm font-semibold ${
                            item.isMin ? "text-accent-green" : "text-foreground"
                          }`}
                        >
                          {formatRupee(Math.round(item.value))}
                          {item.isMin && (
                            <span className="ml-2 text-xs font-normal text-accent-green">
                              (Minimum)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/5 p-4">
                  <p className="text-sm text-accent-amber font-medium">Note</p>
                  <p className="mt-1 text-sm text-muted">
                    HRA exemption is only available under the Old Tax Regime.
                    If you choose the New Tax Regime, you cannot claim HRA exemption.
                    Keep rent receipts and landlord PAN (if annual rent exceeds
                    &#x20B9;1,00,000) as proof.
                  </p>
                </div>
              </>
            ) : (
              <div className="glass-card flex h-64 items-center justify-center p-6">
                <p className="text-muted">
                  Enter your salary and rent details to calculate HRA exemption
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
