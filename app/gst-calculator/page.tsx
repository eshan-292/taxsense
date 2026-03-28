"use client";

import { useState } from "react";
import { formatINR, formatRupee } from "@/lib/utils";

type CalcMode = "exclusive" | "inclusive";
type GSTRate = 5 | 12 | 18 | 28;

interface GSTResult {
  baseAmount: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

function calculateGST(
  amount: number,
  rate: GSTRate,
  mode: CalcMode,
  isInterState: boolean
): GSTResult {
  let baseAmount: number;
  let gstAmount: number;

  if (mode === "exclusive") {
    baseAmount = amount;
    gstAmount = Math.round((amount * rate) / 100);
  } else {
    baseAmount = Math.round((amount * 100) / (100 + rate));
    gstAmount = amount - baseAmount;
  }

  const totalAmount = baseAmount + gstAmount;

  return {
    baseAmount,
    gstAmount,
    cgst: isInterState ? 0 : Math.round(gstAmount / 2),
    sgst: isInterState ? 0 : Math.round(gstAmount / 2),
    igst: isInterState ? gstAmount : 0,
    totalAmount,
  };
}

const gstSlabs: { rate: GSTRate; examples: string }[] = [
  { rate: 5, examples: "Packaged food, footwear under 1000, economy hotels" },
  { rate: 12, examples: "Processed food, business class air tickets, apparel 1000+" },
  { rate: 18, examples: "Most services, restaurants in hotels, IT services, telecom" },
  { rate: 28, examples: "Luxury items, cars, cement, pan masala, aerated drinks" },
];

export default function GSTCalculatorPage() {
  const [amount, setAmount] = useState(0);
  const [rate, setRate] = useState<GSTRate>(18);
  const [mode, setMode] = useState<CalcMode>("exclusive");
  const [isInterState, setIsInterState] = useState(false);

  const result = amount > 0 ? calculateGST(amount, rate, mode, isInterState) : null;

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            GST Calculator
          </h1>
          <p className="text-muted">
            Calculate GST inclusive and exclusive amounts. Supports all GST slabs
            (5%, 12%, 18%, 28%).
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input */}
          <div className="glass-card p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Enter Details
            </h2>

            {/* Calc mode */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Calculation Type
              </label>
              <div className="flex gap-3">
                {[
                  { value: "exclusive" as const, label: "GST Exclusive", hint: "Add GST to amount" },
                  { value: "inclusive" as const, label: "GST Inclusive", hint: "Extract GST from amount" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                      mode === opt.value
                        ? "border-accent-indigo/50 bg-accent-indigo/10"
                        : "border-card-border bg-card hover:border-accent-indigo/30"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        mode === opt.value ? "text-accent-indigo" : "text-foreground"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted">{opt.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {mode === "exclusive" ? "Amount (before GST)" : "Amount (including GST)"}
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
                  placeholder="e.g. 10,000"
                  className="w-full rounded-xl border border-card-border bg-card py-3 pl-8 pr-4 text-lg font-medium text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                />
              </div>
            </div>

            {/* GST Rate */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                GST Rate
              </label>
              <div className="grid grid-cols-4 gap-2">
                {gstSlabs.map((slab) => (
                  <button
                    key={slab.rate}
                    type="button"
                    onClick={() => setRate(slab.rate)}
                    className={`rounded-xl border px-4 py-3 text-center transition-colors ${
                      rate === slab.rate
                        ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
                        : "border-card-border bg-card text-foreground hover:border-accent-indigo/30"
                    }`}
                  >
                    <span className="text-lg font-semibold">{slab.rate}%</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                {gstSlabs.find((s) => s.rate === rate)?.examples}
              </p>
            </div>

            {/* Inter/Intra state */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Transaction Type
              </label>
              <div className="flex gap-3">
                {[
                  { value: false, label: "Intra-State", hint: "CGST + SGST" },
                  { value: true, label: "Inter-State", hint: "IGST" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setIsInterState(opt.value)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-center transition-colors ${
                      isInterState === opt.value
                        ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
                        : "border-card-border bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs opacity-70">{opt.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                <div className="glass-card glow-indigo p-6">
                  <p className="text-sm text-muted">Total Amount</p>
                  <p className="text-3xl font-bold text-accent-indigo">
                    {formatRupee(result.totalAmount)}
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    Breakdown
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Base Amount</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatRupee(result.baseAmount)}
                      </span>
                    </div>

                    <div className="border-t border-card-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted">
                          Total GST ({rate}%)
                        </span>
                        <span className="font-mono font-semibold text-accent-amber">
                          {formatRupee(result.gstAmount)}
                        </span>
                      </div>
                    </div>

                    {!isInterState ? (
                      <>
                        <div className="flex justify-between pl-4">
                          <span className="text-muted">
                            CGST ({rate / 2}%)
                          </span>
                          <span className="font-mono text-foreground">
                            {formatRupee(result.cgst)}
                          </span>
                        </div>
                        <div className="flex justify-between pl-4">
                          <span className="text-muted">
                            SGST ({rate / 2}%)
                          </span>
                          <span className="font-mono text-foreground">
                            {formatRupee(result.sgst)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between pl-4">
                        <span className="text-muted">IGST ({rate}%)</span>
                        <span className="font-mono text-foreground">
                          {formatRupee(result.igst)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-card-border pt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total Amount</span>
                        <span className="font-mono text-accent-indigo">
                          {formatRupee(result.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card flex h-64 items-center justify-center p-6">
                <p className="text-muted">Enter an amount to calculate GST</p>
              </div>
            )}

            {/* GST Slabs reference */}
            <div className="glass-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Common GST Slabs
              </h3>
              <div className="space-y-3">
                {gstSlabs.map((slab) => (
                  <div key={slab.rate} className="text-sm">
                    <span className="font-mono font-semibold text-accent-indigo">
                      {slab.rate}%
                    </span>
                    <span className="ml-2 text-muted">{slab.examples}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
