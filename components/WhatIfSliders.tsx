"use client";

import { useState } from "react";
import { calculateOldRegimeTax, type TaxInput, type TaxResult } from "@/lib/tax-calculator";
import { formatRupee } from "@/lib/utils";
import {
  SECTION_80C_LIMIT,
  SECTION_80D_SELF_LIMIT,
  NPS_80CCD_1B_LIMIT,
  HOME_LOAN_INTEREST_LIMIT,
} from "@/lib/tax-slabs";

interface Props {
  originalInput: TaxInput;
  originalOldRegime: TaxResult;
}

interface SliderConfig {
  key: keyof TaxInput;
  label: string;
  section: string;
  max: number;
  step: number;
}

const SLIDERS: SliderConfig[] = [
  { key: "section80C", label: "80C Investments", section: "80C", max: SECTION_80C_LIMIT, step: 5000 },
  { key: "nps80CCD1B", label: "NPS Contribution", section: "80CCD(1B)", max: NPS_80CCD_1B_LIMIT, step: 5000 },
  { key: "section80D_self", label: "Health Insurance", section: "80D", max: SECTION_80D_SELF_LIMIT, step: 1000 },
  { key: "homeLoanInterest", label: "Home Loan Interest", section: "24(b)", max: HOME_LOAN_INTEREST_LIMIT, step: 10000 },
];

export default function WhatIfSliders({ originalInput, originalOldRegime }: Props) {
  const [overrides, setOverrides] = useState<Partial<TaxInput>>({});
  const [open, setOpen] = useState(false);

  const currentInput = { ...originalInput, ...overrides };
  const currentResult = calculateOldRegimeTax(currentInput);
  const taxDelta = originalOldRegime.totalTax - currentResult.totalTax;
  const hasChanges = Object.keys(overrides).length > 0 && taxDelta !== 0;

  const handleSlider = (key: keyof TaxInput, value: number) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => setOverrides({});

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5"
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="text-sm font-semibold text-foreground">What if I invest more?</span>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="rounded-full bg-accent-green/15 px-2.5 py-0.5 text-xs font-semibold text-accent-green">
              Save {formatRupee(taxDelta)} more
            </span>
          )}
          <svg
            className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-card-border px-5 pb-5">
          <p className="mb-4 mt-4 text-xs text-muted">
            Drag to see how additional investments reduce your Old Regime tax.
          </p>

          <div className="space-y-5">
            {SLIDERS.map((slider) => {
              const value = (currentInput[slider.key] as number) ?? 0;
              const pct = (value / slider.max) * 100;
              const originalValue = (originalInput[slider.key] as number) ?? 0;
              const delta = value - originalValue;

              return (
                <div key={slider.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted">
                        {slider.section}
                      </span>
                      <span className="text-sm font-medium text-foreground">{slider.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{formatRupee(value)}</span>
                      {delta > 0 && (
                        <span className="ml-1 text-xs text-accent-green">+{formatRupee(delta)}</span>
                      )}
                    </div>
                  </div>
                  <style>{`
                    .whatif-slider-${slider.key} {
                      -webkit-appearance: none;
                      appearance: none;
                      height: 4px;
                      border-radius: 2px;
                      outline: none;
                      cursor: pointer;
                      background: linear-gradient(to right, #6366f1 ${pct}%, rgba(255,255,255,0.1) ${pct}%);
                    }
                    .whatif-slider-${slider.key}::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background: #6366f1;
                      cursor: pointer;
                      border: 2px solid rgba(99,102,241,0.4);
                    }
                    .whatif-slider-${slider.key}::-moz-range-thumb {
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background: #6366f1;
                      cursor: pointer;
                      border: 2px solid rgba(99,102,241,0.4);
                    }
                  `}</style>
                  <input
                    type="range"
                    min={0}
                    max={slider.max}
                    step={slider.step}
                    value={value}
                    onChange={(e) => handleSlider(slider.key, Number(e.target.value))}
                    className={`whatif-slider-${slider.key} w-full`}
                  />
                  <div className="mt-0.5 flex justify-between text-[10px] text-muted/40">
                    <span>₹0</span>
                    <span>{formatRupee(slider.max)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result summary */}
          <div className="mt-5 rounded-xl bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">Old Regime tax with changes</p>
                <p className="text-2xl font-bold text-foreground">{formatRupee(currentResult.totalTax)}</p>
              </div>
              {hasChanges && (
                <div className="text-right">
                  <p className="text-xs text-muted">vs original</p>
                  <p className="text-lg font-bold text-accent-green">−{formatRupee(taxDelta)}</p>
                </div>
              )}
            </div>
            {hasChanges && currentResult.totalTax < originalOldRegime.totalTax && (
              <p className="mt-2 text-xs text-accent-green">
                Monthly savings: {formatRupee(Math.round(taxDelta / 12))}
              </p>
            )}
          </div>

          {hasChanges && (
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-muted/60 hover:text-muted transition-colors"
            >
              Reset to original values
            </button>
          )}
        </div>
      )}
    </div>
  );
}
