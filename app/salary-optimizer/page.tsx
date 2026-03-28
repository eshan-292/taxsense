"use client";

import { useState, useEffect } from "react";
import {
  calculateNewRegimeTax,
  calculateOldRegimeTax,
  type TaxInput,
} from "@/lib/tax-calculator";
import { formatRupee } from "@/lib/utils";
import { CESS_RATE, OLD_REGIME_SLABS } from "@/lib/tax-slabs";

const STORAGE_KEY = "taxsense_calculator_input";

// Food coupons: ₹50/meal × 2 meals × 22 working days × 12 months
const FOOD_COUPON_ANNUAL = 26400;
// Phone reimbursement
const PHONE_ANNUAL = 18000;
// LTA: approximate (2 journeys in 4 years ≈ half basic monthly × 2 / 4)
const LTA_ANNUAL = 20000;

function makeTaxInput(grossTaxableIncome: number): TaxInput {
  return {
    annualSalary: grossTaxableIncome,
    incomeHouseProperty: 0,
    incomeCapitalGains: 0,
    incomeOtherSources: 0,
    hra: 0,
    section80C: 150000, // assume max 80C
    section80D_self: 0,
    section80D_parents: 0,
    homeLoanInterest: 0,
    nps80CCD1B: 0,
    section80E: 0,
    section80G: 0,
    otherDeductions: 0,
  };
}

function getMarginalRate(taxableIncome: number): number {
  let rate = 0;
  for (const slab of OLD_REGIME_SLABS) {
    if (taxableIncome > slab.from) {
      rate = slab.rate;
    }
  }
  return rate;
}

interface Structure {
  basic: number;
  hra: number;
  employerPF: number;
  employerNPS: number;
  foodCoupons: number;
  phone: number;
  lta: number;
  specialAllowance: number;
  hraExemption: number;
  taxableIncome: number; // after all exemptions and standard deduction
  oldTax: number;
  newTax: number;
  bestTax: number;
  bestRegime: "new" | "old";
}

function computeStructure(
  ctc: number,
  basicPct: number,
  metro: boolean,
  rentPaid: number,
  includeNPS: boolean,
  includePerks: boolean
): Structure {
  const basic = Math.round(ctc * basicPct);
  const hraReceived = Math.round(basic * (metro ? 0.5 : 0.4));
  const epfMonthly = Math.min(Math.round(basic * 0.12 / 12), 1800); // capped at ₹1800/mo
  const employerPF = epfMonthly * 12;
  const employerNPS = includeNPS ? Math.round(basic * 0.10) : 0;
  const foodCoupons = includePerks ? FOOD_COUPON_ANNUAL : 0;
  const phone = includePerks ? PHONE_ANNUAL : 0;
  const lta = includePerks ? LTA_ANNUAL : 0;

  const perks = foodCoupons + phone + lta;
  const specialAllowance = Math.max(0, ctc - basic - hraReceived - employerPF - employerNPS - perks);

  // HRA exemption = min(HRA received, 50%/40% of basic, rent - 10% basic)
  const hraExemption = rentPaid > 0
    ? Math.min(
        hraReceived,
        metro ? basic * 0.5 : basic * 0.4,
        Math.max(0, rentPaid - basic * 0.1)
      )
    : 0;

  // Taxable salary for old regime
  // CTC - HRA exemption - employer NPS - perks (food, phone, LTA) - standard deduction
  const oldStdDed = 50000;
  const oldTaxableSalary = Math.max(0, ctc - hraExemption - employerNPS - perks - oldStdDed);

  // Apply 80C (assume max)
  const old80C = Math.min(150000, oldTaxableSalary);
  const oldTaxableIncome = Math.max(0, oldTaxableSalary - old80C);

  // New regime: CTC - employer NPS - std deduction (75K) — no other exemptions
  const newStdDed = 75000;
  const newTaxableIncome = Math.max(0, ctc - employerNPS - newStdDed);

  const oldResult = calculateOldRegimeTax({
    annualSalary: ctc - hraExemption - employerNPS - perks,
    incomeHouseProperty: 0, incomeCapitalGains: 0, incomeOtherSources: 0,
    hra: 0, // already applied above
    section80C: 150000,
    section80D_self: 0, section80D_parents: 0,
    homeLoanInterest: 0, nps80CCD1B: 0, section80E: 0, section80G: 0, otherDeductions: 0,
  });

  const newResult = calculateNewRegimeTax({
    annualSalary: ctc - employerNPS, // employer NPS reduces taxable salary even in new regime (80CCD2)
    incomeHouseProperty: 0, incomeCapitalGains: 0, incomeOtherSources: 0,
    hra: 0, section80C: 0, section80D_self: 0, section80D_parents: 0,
    homeLoanInterest: 0, nps80CCD1B: 0, section80E: 0, section80G: 0, otherDeductions: 0,
  });

  const bestRegime: "new" | "old" = newResult.totalTax <= oldResult.totalTax ? "new" : "old";

  return {
    basic,
    hra: hraReceived,
    employerPF,
    employerNPS,
    foodCoupons,
    phone,
    lta,
    specialAllowance,
    hraExemption,
    taxableIncome: bestRegime === "new" ? newTaxableIncome : oldTaxableIncome,
    oldTax: oldResult.totalTax,
    newTax: newResult.totalTax,
    bestTax: bestRegime === "new" ? newResult.totalTax : oldResult.totalTax,
    bestRegime,
  };
}

function Row({ label, value, sub, muted, green }: { label: string; value: number; sub?: string; muted?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div>
        <span className={muted ? "text-muted" : "text-foreground"}>{label}</span>
        {sub && <span className="ml-1.5 text-xs text-muted/60">{sub}</span>}
      </div>
      <span className={`font-mono text-sm ${green ? "text-accent-green" : muted ? "text-muted" : "text-foreground"}`}>
        {formatRupee(value)}
      </span>
    </div>
  );
}

export default function SalaryOptimizerPage() {
  const [ctc, setCtc] = useState(1500000);
  const [metro, setMetro] = useState(true);
  const [rentPaid, setRentPaid] = useState(25000); // monthly rent
  const [paysRent, setPaysRent] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.annualSalary > 0) setCtc(data.annualSalary);
      }
    } catch {}
  }, []);

  const annualRent = paysRent ? rentPaid * 12 : 0;

  // Standard structure: 50% basic, no employer NPS, no perks
  const standard = computeStructure(ctc, 0.5, metro, annualRent, false, false);

  // Optimized structure: 40% basic, employer NPS (10% basic), perks
  const optimized = computeStructure(ctc, 0.4, metro, annualRent, true, true);

  const oldSaving = standard.oldTax - optimized.oldTax;
  const newSaving = standard.newTax - optimized.newTax;
  const bestSaving = Math.max(oldSaving, newSaving);

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Salary Structure Optimizer</h1>
          <p className="text-sm text-muted">Restructure your CTC to pay less tax legally</p>
        </div>

        {/* Inputs */}
        <div className="glass-card mb-4 space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Annual CTC (Cost to Company)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
              <input
                type="number"
                value={ctc || ""}
                onChange={e => setCtc(Number(e.target.value))}
                step={100000}
                placeholder="15,00,000"
                className="w-full rounded-lg border border-card-border bg-background/50 py-2.5 pl-7 pr-3 text-sm text-foreground outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20"
              />
            </div>
          </div>

          {/* City type */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted">City type</label>
            <div className="flex gap-2">
              {["Metro", "Non-metro"].map((city) => (
                <button
                  key={city}
                  onClick={() => setMetro(city === "Metro")}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    (city === "Metro") === metro
                      ? "border-accent-indigo/40 bg-accent-indigo/10 text-accent-indigo"
                      : "border-card-border text-muted hover:text-foreground"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted/60">Metro: Mumbai, Delhi, Kolkata, Chennai · HRA exemption = 50% of Basic</p>
          </div>

          {/* Rent */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted">Monthly rent paid</label>
              <button
                onClick={() => setPaysRent(r => !r)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${paysRent ? "bg-accent-indigo" : "bg-card-border"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${paysRent ? "translate-x-4" : "translate-x-1"}`} />
              </button>
            </div>
            {paysRent && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
                <input
                  type="number"
                  value={rentPaid || ""}
                  onChange={e => setRentPaid(Number(e.target.value))}
                  step={1000}
                  placeholder="25,000"
                  className="w-full rounded-lg border border-card-border bg-background/50 py-2.5 pl-7 pr-3 text-sm text-foreground outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20"
                />
              </div>
            )}
          </div>
        </div>

        {ctc > 0 && (
          <>
            {/* Savings banner */}
            {bestSaving > 0 && (
              <div className="mb-4 glass-card glow-green p-4 ring-1 ring-accent-green/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-green/15">
                    <svg className="h-5 w-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Save up to <span className="text-accent-green">{formatRupee(bestSaving)}/year</span>
                    </p>
                    <p className="text-xs text-muted">by restructuring your salary components</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison table */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              {/* Standard */}
              <div className="glass-card p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/50">Standard</p>
                <div className="space-y-0 divide-y divide-card-border/50">
                  <Row label="Basic" value={standard.basic} muted />
                  <Row label="HRA" value={standard.hra} muted />
                  <Row label="Employer PF" value={standard.employerPF} muted />
                  <Row label="Special Allow." value={standard.specialAllowance} muted />
                  <Row label="HRA exempt." value={standard.hraExemption} green />
                </div>
                <div className="mt-3 border-t border-card-border pt-3">
                  <p className="text-xs text-muted">Old regime tax</p>
                  <p className="text-lg font-bold text-foreground">{formatRupee(standard.oldTax)}</p>
                  <p className="text-xs text-muted mt-1">New regime tax</p>
                  <p className="text-base font-semibold text-foreground">{formatRupee(standard.newTax)}</p>
                </div>
              </div>

              {/* Optimized */}
              <div className="glass-card p-4 ring-1 ring-accent-indigo/30">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-indigo/70">Optimized</p>
                <div className="space-y-0 divide-y divide-card-border/50">
                  <Row label="Basic" value={optimized.basic} muted />
                  <Row label="HRA" value={optimized.hra} muted />
                  <Row label="Employer PF" value={optimized.employerPF} muted />
                  <Row label="Employer NPS" value={optimized.employerNPS} muted />
                  <Row label="Perks" value={optimized.foodCoupons + optimized.phone + optimized.lta} muted />
                  <Row label="Special Allow." value={optimized.specialAllowance} muted />
                  <Row label="HRA exempt." value={optimized.hraExemption} green />
                </div>
                <div className="mt-3 border-t border-card-border pt-3">
                  <p className="text-xs text-muted">Old regime tax</p>
                  <p className="text-lg font-bold text-foreground">{formatRupee(optimized.oldTax)}</p>
                  <p className="text-xs text-muted mt-1">New regime tax</p>
                  <p className="text-base font-semibold text-foreground">{formatRupee(optimized.newTax)}</p>
                </div>
              </div>
            </div>

            {/* Savings breakdown */}
            <div className="glass-card mb-4 p-5">
              <p className="mb-3 text-sm font-semibold text-foreground">What changes & why</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-indigo/10 text-xs font-bold text-accent-indigo">1</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Employer NPS (Section 80CCD2)</p>
                    <p className="text-xs text-muted">10% of basic ({formatRupee(optimized.employerNPS)}/yr) is fully tax-free — in <strong>both old and new regime</strong>. This is separate from your personal ₹1.5L 80C limit.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-indigo/10 text-xs font-bold text-accent-indigo">2</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Tax-free perks</p>
                    <p className="text-xs text-muted">Food coupons ({formatRupee(FOOD_COUPON_ANNUAL)}), phone reimbursement ({formatRupee(PHONE_ANNUAL)}), and LTA ({formatRupee(LTA_ANNUAL)}) replace taxable special allowance.</p>
                  </div>
                </div>
                {paysRent && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-indigo/10 text-xs font-bold text-accent-indigo">3</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">HRA exemption</p>
                      <p className="text-xs text-muted">Optimized: {formatRupee(optimized.hraExemption)}/yr tax-free (old regime only). Submit actual rent receipts to HR.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="glass-card p-4">
              <p className="text-sm font-semibold text-foreground mb-2">How to implement</p>
              <ol className="space-y-1.5 text-xs text-muted list-decimal list-inside">
                <li>Talk to your HR/payroll team to restructure CTC</li>
                <li>Ask employer to enroll in NPS and contribute 10% of basic (80CCD2)</li>
                <li>Get food coupons/Sodexo cards included in your CTC split</li>
                <li>Submit rent receipts for HRA exemption every April</li>
                <li>Keep phone bills for reimbursement claims</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
