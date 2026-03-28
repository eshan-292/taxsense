"use client";

import { useState, useEffect } from "react";
import {
  calculateNewRegimeTax,
  calculateOldRegimeTax,
  getRecommendation,
  type TaxInput,
} from "@/lib/tax-calculator";
import { formatRupee } from "@/lib/utils";

const STORAGE_KEY = "taxsense_calculator_input";

const baseInput = (): TaxInput => ({
  annualSalary: 0,
  incomeHouseProperty: 0,
  incomeCapitalGains: 0,
  incomeOtherSources: 0,
  hra: 0,
  section80C: 0,
  section80D_self: 0,
  section80D_parents: 0,
  homeLoanInterest: 0,
  nps80CCD1B: 0,
  section80E: 0,
  section80G: 0,
  otherDeductions: 0,
});

function getBestTax(input: TaxInput): number {
  const nr = calculateNewRegimeTax(input);
  const or = calculateOldRegimeTax(input);
  return Math.min(nr.totalTax, or.totalTax);
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return null;
  const saving = -delta;
  const color = saving > 0 ? "text-accent-green" : "text-accent-red";
  const bg = saving > 0 ? "bg-accent-green/10" : "bg-accent-red/10";
  const sign = saving > 0 ? "-" : "+";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color} ${bg}`}>
      {sign}{formatRupee(Math.abs(saving))}/yr
    </span>
  );
}

interface EventCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
  delta: number | null;
  children: React.ReactNode;
  color: string;
}

function EventCard({ icon, title, subtitle, enabled, onToggle, delta, children, color }: EventCardProps) {
  return (
    <div className={`glass-card overflow-hidden transition-all ${enabled ? "ring-1 ring-accent-indigo/30" : ""}`}>
      <div className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {enabled && delta !== null && <DeltaBadge delta={delta} />}
          </div>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${enabled ? "bg-accent-indigo" : "bg-card-border"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
      {enabled && (
        <div className="border-t border-card-border px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step, placeholder }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step || 1000}
        placeholder={placeholder || "0"}
        className="w-full rounded-lg border border-card-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20"
      />
    </div>
  );
}

export default function LifeEventsPage() {
  const [salary, setSalary] = useState(1200000);

  // Events state
  const [homeLoan, setHomeLoan] = useState({ enabled: false, interest: 1500000, principal80C: 50000 });
  const [nps, setNps] = useState({ enabled: false, amount: 50000 });
  const [salaryHike, setSalaryHike] = useState({ enabled: false, newSalary: 1500000 });
  const [eduLoan, setEduLoan] = useState({ enabled: false, interest: 120000 });
  const [health, setHealth] = useState({ enabled: false, premium: 25000, parentPremium: 25000 });
  const [marriage, setMarriage] = useState({ enabled: false });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.annualSalary > 0) {
          setSalary(data.annualSalary);
          setSalaryHike(s => ({ ...s, newSalary: Math.round(data.annualSalary * 1.2) }));
        }
      }
    } catch {}
  }, []);

  // Baseline input (current salary, no events)
  const baseline = { ...baseInput(), annualSalary: salary };
  const baselineTax = getBestTax(baseline);

  // Build combined input applying all enabled events
  const buildEventInput = (): TaxInput => {
    const s = salaryHike.enabled ? salaryHike.newSalary : salary;
    return {
      ...baseInput(),
      annualSalary: s,
      homeLoanInterest: homeLoan.enabled ? Math.min(homeLoan.interest, 200000) : 0,
      section80C: homeLoan.enabled ? Math.min(homeLoan.principal80C, 150000) : 0,
      nps80CCD1B: nps.enabled ? Math.min(nps.amount, 50000) : 0,
      section80E: eduLoan.enabled ? eduLoan.interest : 0,
      section80D_self: health.enabled ? Math.min(health.premium, 25000) : 0,
      section80D_parents: health.enabled ? Math.min(health.parentPremium, 25000) : 0,
    };
  };

  const eventInput = buildEventInput();
  const eventTax = getBestTax(eventInput);
  const totalDelta = eventTax - baselineTax;

  // Per-event deltas (relative to base, with that single event)
  const homeLoanDelta = homeLoan.enabled
    ? getBestTax({ ...baseInput(), annualSalary: salary, homeLoanInterest: Math.min(homeLoan.interest, 200000), section80C: Math.min(homeLoan.principal80C, 150000) }) - baselineTax
    : null;
  const npsDelta = nps.enabled
    ? getBestTax({ ...baseInput(), annualSalary: salary, nps80CCD1B: Math.min(nps.amount, 50000) }) - baselineTax
    : null;
  const hikeDelta = salaryHike.enabled
    ? getBestTax({ ...baseInput(), annualSalary: salaryHike.newSalary }) - baselineTax
    : null;
  const eduDelta = eduLoan.enabled
    ? getBestTax({ ...baseInput(), annualSalary: salary, section80E: eduLoan.interest }) - baselineTax
    : null;
  const healthDelta = health.enabled
    ? getBestTax({ ...baseInput(), annualSalary: salary, section80D_self: Math.min(health.premium, 25000), section80D_parents: Math.min(health.parentPremium, 25000) }) - baselineTax
    : null;

  const anyEnabled = homeLoan.enabled || nps.enabled || salaryHike.enabled || eduLoan.enabled || health.enabled || marriage.enabled;

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Life Event Tax Impact</h1>
          <p className="text-sm text-muted">Toggle events to see how they affect your tax bill</p>
        </div>

        {/* Salary input */}
        <div className="glass-card mb-4 p-4">
          <label className="mb-1 block text-xs font-medium text-muted">Your Annual Salary</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">₹</span>
            <input
              type="number"
              value={salary || ""}
              onChange={e => setSalary(Number(e.target.value))}
              step={100000}
              placeholder="12,00,000"
              className="flex-1 rounded-lg border border-card-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent-indigo/50"
            />
          </div>
          <p className="mt-1 text-xs text-muted/60">
            Base tax: <span className="font-medium text-foreground">{formatRupee(baselineTax)}/yr</span>
            {" · "}{formatRupee(Math.round(baselineTax / 12))}/mo
          </p>
        </div>

        {/* Events */}
        <div className="space-y-3">
          <EventCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            title="Buy a House"
            subtitle="Home loan interest (24b) + principal (80C)"
            enabled={homeLoan.enabled}
            onToggle={() => setHomeLoan(s => ({ ...s, enabled: !s.enabled }))}
            delta={homeLoanDelta}
            color="bg-cyan-500/10 text-cyan-400"
          >
            <div className="space-y-3">
              <NumberInput
                label="Annual interest paid"
                value={homeLoan.interest}
                onChange={v => setHomeLoan(s => ({ ...s, interest: v }))}
                max={200000} step={50000}
                placeholder="1,50,000"
              />
              <NumberInput
                label="Principal repaid (part of 80C)"
                value={homeLoan.principal80C}
                onChange={v => setHomeLoan(s => ({ ...s, principal80C: v }))}
                max={150000} step={10000}
                placeholder="50,000"
              />
              <p className="text-xs text-muted/60">Interest deduction capped at ₹2L (old regime only). Principal counted in your 80C ₹1.5L limit.</p>
            </div>
          </EventCard>

          <EventCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Invest in NPS"
            subtitle="Extra ₹50K deduction under 80CCD(1B)"
            enabled={nps.enabled}
            onToggle={() => setNps(s => ({ ...s, enabled: !s.enabled }))}
            delta={npsDelta}
            color="bg-accent-amber/10 text-accent-amber"
          >
            <div className="space-y-3">
              <NumberInput
                label="Annual NPS contribution (self)"
                value={nps.amount}
                onChange={v => setNps(s => ({ ...s, amount: v }))}
                max={50000} step={5000}
                placeholder="50,000"
              />
              <p className="text-xs text-muted/60">Capped at ₹50K. This is OVER and above your 80C ₹1.5L limit. Old regime only.</p>
            </div>
          </EventCard>

          <EventCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            title="Salary Hike"
            subtitle="Calculate tax on your new package"
            enabled={salaryHike.enabled}
            onToggle={() => setSalaryHike(s => ({ ...s, enabled: !s.enabled }))}
            delta={hikeDelta}
            color="bg-accent-green/10 text-accent-green"
          >
            <div className="space-y-3">
              <NumberInput
                label="New annual salary (CTC)"
                value={salaryHike.newSalary}
                onChange={v => setSalaryHike(s => ({ ...s, newSalary: v }))}
                step={100000}
                placeholder="15,00,000"
              />
              {hikeDelta !== null && hikeDelta > 0 && (
                <div className="rounded-lg bg-background/50 p-3">
                  <p className="text-xs text-muted">Hike amount: <span className="font-medium text-foreground">{formatRupee(salaryHike.newSalary - salary)}</span></p>
                  <p className="text-xs text-muted">Additional tax: <span className="font-medium text-accent-red">{formatRupee(hikeDelta)}/yr</span></p>
                  <p className="text-xs text-muted">Net take-home increase: <span className="font-medium text-accent-green">{formatRupee((salaryHike.newSalary - salary) - hikeDelta)}/yr</span></p>
                </div>
              )}
            </div>
          </EventCard>

          <EventCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            title="Education Loan"
            subtitle="100% interest deduction under 80E (no cap)"
            enabled={eduLoan.enabled}
            onToggle={() => setEduLoan(s => ({ ...s, enabled: !s.enabled }))}
            delta={eduDelta}
            color="bg-violet-500/10 text-violet-400"
          >
            <div className="space-y-3">
              <NumberInput
                label="Annual interest paid on education loan"
                value={eduLoan.interest}
                onChange={v => setEduLoan(s => ({ ...s, interest: v }))}
                step={10000}
                placeholder="1,20,000"
              />
              <p className="text-xs text-muted/60">Full interest is deductible — no upper limit. Available for 8 years from repayment start. Old regime only.</p>
            </div>
          </EventCard>

          <EventCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            title="Health Insurance"
            subtitle="80D premium for self and parents"
            enabled={health.enabled}
            onToggle={() => setHealth(s => ({ ...s, enabled: !s.enabled }))}
            delta={healthDelta}
            color="bg-rose-500/10 text-rose-400"
          >
            <div className="space-y-3">
              <NumberInput
                label="Premium for self + family (max ₹25K)"
                value={health.premium}
                onChange={v => setHealth(s => ({ ...s, premium: v }))}
                max={25000} step={5000}
                placeholder="25,000"
              />
              <NumberInput
                label="Premium for parents (max ₹25K)"
                value={health.parentPremium}
                onChange={v => setHealth(s => ({ ...s, parentPremium: v }))}
                max={25000} step={5000}
                placeholder="25,000"
              />
              <p className="text-xs text-muted/60">Senior citizen parents: up to ₹50K allowed. Old regime only.</p>
            </div>
          </EventCard>
        </div>

        {/* Summary */}
        {anyEnabled && (
          <div className={`mt-4 glass-card p-5 ${totalDelta < 0 ? "glow-green ring-1 ring-accent-green/30" : "ring-1 ring-accent-red/20"}`}>
            <p className="mb-3 text-sm font-semibold text-foreground">Combined Impact</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Current tax</span>
                <span className="font-mono text-foreground">{formatRupee(baselineTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">After events</span>
                <span className="font-mono text-foreground">{formatRupee(eventTax)}</span>
              </div>
              <div className="border-t border-card-border pt-2 flex justify-between text-sm font-semibold">
                <span className="text-foreground">{totalDelta < 0 ? "Total saving" : "Additional tax"}</span>
                <span className={`font-mono ${totalDelta < 0 ? "text-accent-green" : "text-accent-red"}`}>
                  {totalDelta < 0 ? "-" : "+"}{formatRupee(Math.abs(totalDelta))}/yr
                </span>
              </div>
              {totalDelta < 0 && (
                <p className="text-xs text-muted/60">
                  That&apos;s {formatRupee(Math.round(Math.abs(totalDelta) / 12))} extra per month in take-home
                </p>
              )}
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-muted/50">
          Deduction-based savings apply to Old Regime only · Regime auto-selected for best outcome
        </p>
      </div>
    </div>
  );
}
