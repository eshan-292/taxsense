"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { TaxInput } from "@/lib/tax-calculator";
import { formatINR } from "@/lib/utils";

interface TaxFormProps {
  onCalculate: (input: TaxInput) => void;
}

interface FieldConfig {
  key: keyof TaxInput;
  label: string;
  hint?: string;
  oldOnly?: boolean;
}

const STORAGE_KEY = "taxsense_calculator_input";
const PLANNER_KEY = "taxsense_planner_deductions";

// URL param schema (short keys to keep URLs tidy)
const URL_PARAM_MAP: Record<string, keyof TaxInput> = {
  s: "annualSalary",
  hra: "hra",
  c: "section80C",
  ds: "section80D_self",
  dp: "section80D_parents",
  hl: "homeLoanInterest",
  nps: "nps80CCD1B",
  e: "section80E",
  g: "section80G",
  od: "otherDeductions",
  hp: "incomeHouseProperty",
  cg: "incomeCapitalGains",
  os: "incomeOtherSources",
};

const incomeSourceFields: FieldConfig[] = [
  { key: "incomeHouseProperty", label: "Income from House Property", hint: "Rental income minus municipal taxes (negative for loss)" },
  { key: "incomeCapitalGains", label: "Capital Gains (already taxed)", hint: "Net capital gains from stocks, MF, property etc." },
  { key: "incomeOtherSources", label: "Income from Other Sources", hint: "FD interest, dividends, freelance, etc." },
];

const deductionFields: FieldConfig[] = [
  { key: "hra", label: "HRA Exemption", hint: "House Rent Allowance exemption (use HRA Calculator)", oldOnly: true },
  { key: "section80C", label: "Section 80C Investments", hint: "EPF + PPF + ELSS + LIC + tuition fees (max ₹1.5L)", oldOnly: true },
  { key: "section80D_self", label: "Health Insurance (Self/Family)", hint: "Section 80D — self & family premium (max ₹25K)", oldOnly: true },
  { key: "section80D_parents", label: "Health Insurance (Parents)", hint: "Section 80D — parents premium (max ₹25K/50K)", oldOnly: true },
  { key: "homeLoanInterest", label: "Home Loan Interest", hint: "Section 24(b) — interest on housing loan (max ₹2L)", oldOnly: true },
  { key: "nps80CCD1B", label: "NPS Contribution", hint: "Section 80CCD(1B) — additional NPS (max ₹50K)", oldOnly: true },
  { key: "section80E", label: "Education Loan Interest", hint: "Section 80E — no upper limit, for 8 years", oldOnly: true },
  { key: "section80G", label: "Donations (80G)", hint: "Deductible amount under Section 80G", oldOnly: true },
  { key: "otherDeductions", label: "Other Deductions", hint: "80TTA, 80GG, etc.", oldOnly: true },
];

interface DeductionSuggestion {
  key: keyof TaxInput;
  label: string;
  section: string;
  sub: string;
  estimate: number;
}

const DEDUCTION_SUGGESTIONS: DeductionSuggestion[] = [
  { key: "section80C", label: "80C Investments", section: "80C", sub: "EPF, PPF, ELSS, LIC, tuition fees", estimate: 150000 },
  { key: "nps80CCD1B", label: "NPS", section: "80CCD(1B)", sub: "Additional NPS · beyond 80C limit", estimate: 50000 },
  { key: "section80D_self", label: "Health Insurance (Self)", section: "80D", sub: "Mediclaim for self & family", estimate: 25000 },
  { key: "section80D_parents", label: "Health Insurance (Parents)", section: "80D", sub: "Mediclaim for parents", estimate: 25000 },
  { key: "homeLoanInterest", label: "Home Loan Interest", section: "24(b)", sub: "Interest on housing loan · max ₹2L", estimate: 200000 },
];

const EXTRA_DEDUCTION_FIELDS: FieldConfig[] = [
  { key: "section80E", label: "Education Loan Interest", hint: "Section 80E — no upper limit, for 8 years", oldOnly: true },
  { key: "section80G", label: "Donations (80G)", hint: "Deductible amount under Section 80G", oldOnly: true },
  { key: "otherDeductions", label: "Other Deductions", hint: "80TTA, 80GG, etc.", oldOnly: true },
];

function getMarginalRate(salary: number): number {
  const taxable = salary - 50000;
  if (taxable <= 250000) return 0;
  if (taxable <= 500000) return 0.05;
  if (taxable <= 1000000) return 0.20;
  return 0.30;
}

const defaultInput: TaxInput = {
  annualSalary: 0, incomeHouseProperty: 0, incomeCapitalGains: 0, incomeOtherSources: 0,
  hra: 0, section80C: 0, section80D_self: 0, section80D_parents: 0,
  homeLoanInterest: 0, nps80CCD1B: 0, section80E: 0, section80G: 0, otherDeductions: 0,
};

const SALARY_PRESETS = [500000, 750000, 1000000, 1500000, 2000000, 2500000];
const SLIDER_MIN = 300000;
const SLIDER_MAX = 5000000;
const SLIDER_STEP = 25000;

function loadFromStorage(): TaxInput {
  if (typeof window === "undefined") return defaultInput;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultInput;
    return { ...defaultInput, ...JSON.parse(raw) };
  } catch { return defaultInput; }
}

function loadFromURLParams(): TaxInput | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("s")) return null;
  const input = { ...defaultInput };
  for (const [urlKey, inputKey] of Object.entries(URL_PARAM_MAP)) {
    const val = params.get(urlKey);
    if (val !== null) (input as Record<string, number>)[inputKey] = Number(val) || 0;
  }
  return input;
}

function loadFromPlanner(): Partial<TaxInput> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLANNER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    localStorage.removeItem(PLANNER_KEY); // consume once
    return data;
  } catch { return null; }
}

export default function TaxForm({ onCalculate }: TaxFormProps) {
  const [input, setInput] = useState<TaxInput>(defaultInput);
  const [showIncomeSources, setShowIncomeSources] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const urlInput = loadFromURLParams();
    const plannerOverride = loadFromPlanner();

    if (urlInput) {
      setInput(urlInput);
      setHydrated(true);
      onCalculate(urlInput);
      return;
    }

    const saved = loadFromStorage();
    const merged = plannerOverride ? { ...saved, ...plannerOverride } : saved;
    setInput(merged);
    setHydrated(true);
    if (merged.annualSalary > 0) onCalculate(merged);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (input.annualSalary > 0) onCalculate(input);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, hydrated, onCalculate]);

  const handleChange = useCallback((key: keyof TaxInput, value: string) => {
    const isNegative = value.startsWith("-");
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
    setInput((prev) => ({ ...prev, [key]: isNegative ? -numericValue : numericValue }));
  }, []);

  const handleSlider = useCallback((value: number) => {
    setInput((prev) => ({ ...prev, annualSalary: value }));
  }, []);

  const handleReset = () => {
    setInput(defaultInput);
    setShowIncomeSources(false);
    setShowMore(false);
    localStorage.removeItem(STORAGE_KEY);
    window.history.replaceState({}, "", window.location.pathname);
  };

  const toggleDeduction = (key: keyof TaxInput, estimate: number) => {
    setInput((prev) => ({
      ...prev,
      [key]: (prev[key] as number) > 0 ? 0 : estimate,
    }));
  };

  const sliderPct = ((input.annualSalary - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  const marginalRate = getMarginalRate(input.annualSalary);
  const calcSaving = (amount: number) => Math.round(amount * marginalRate * 1.04);

  // HRA estimate
  const hraEstimate = (() => {
    const b = Math.round(input.annualSalary * 0.4);
    const h = Math.round(b * 0.5);
    const r = Math.round(b * 0.6);
    return Math.min(h, Math.max(0, r - Math.round(b * 0.1)), h);
  })();

  const allDeductions = [
    { key: "hra" as keyof TaxInput, label: "HRA", estimate: hraEstimate },
    ...DEDUCTION_SUGGESTIONS.map(d => ({ key: d.key, label: d.label, estimate: d.estimate })),
  ];

  const totalSaving = allDeductions.reduce((sum, d) => sum + calcSaving(input[d.key] as number), 0);

  const renderField = (field: FieldConfig) => (
    <div key={field.key}>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {field.label}
        {field.oldOnly && <span className="ml-2 text-xs text-muted">(Old Regime)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
        <input
          type="text"
          inputMode="numeric"
          value={input[field.key] === 0 ? "" : (input[field.key] < 0 ? "-" : "") + formatINR(Math.abs(input[field.key] as number))}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-8 pr-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
        />
      </div>
      {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Salary field + slider */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Annual Salary (CTC)</label>
          {input.annualSalary > 0 && (
            <button type="button" onClick={handleReset} className="text-xs text-muted/60 hover:text-muted transition-colors">
              Reset
            </button>
          )}
        </div>
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
          <input
            type="text" inputMode="numeric"
            value={input.annualSalary === 0 ? "" : formatINR(input.annualSalary)}
            onChange={(e) => handleChange("annualSalary", e.target.value)}
            placeholder="e.g. 12,00,000"
            className="w-full rounded-xl border border-card-border bg-card py-3 pl-8 pr-4 text-lg font-medium text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
          />
        </div>
        <div className="relative px-1">
          <style>{`
            .salary-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; outline: none; cursor: pointer;
              background: linear-gradient(to right, #6366f1 ${sliderPct}%, rgba(255,255,255,0.1) ${sliderPct}%); }
            .salary-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
              background: #6366f1; cursor: pointer; border: 2px solid rgba(99,102,241,0.4); box-shadow: 0 0 8px rgba(99,102,241,0.4); }
            .salary-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%;
              background: #6366f1; cursor: pointer; border: 2px solid rgba(99,102,241,0.4); }
          `}</style>
          <input type="range" min={SLIDER_MIN} max={SLIDER_MAX} step={SLIDER_STEP}
            value={Math.min(Math.max(input.annualSalary || SLIDER_MIN, SLIDER_MIN), SLIDER_MAX)}
            onChange={(e) => handleSlider(Number(e.target.value))}
            className="salary-slider w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-muted/50">
            <span>₹3L</span><span>₹50L</span>
          </div>
        </div>
        {/* Quick fill */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SALARY_PRESETS.map((s) => (
            <button key={s} type="button"
              onClick={() => setInput(prev => ({ ...prev, annualSalary: s }))}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                input.annualSalary === s
                  ? "border-accent-indigo/50 bg-accent-indigo/15 text-accent-indigo"
                  : "border-card-border text-muted hover:text-foreground"
              }`}>
              ₹{formatINR(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Deduction pills - Old Regime */}
      {input.annualSalary >= 300000 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">Add deductions <span className="text-muted/50">(Old Regime)</span></p>
            {totalSaving > 0 && (
              <span className="text-[10px] font-semibold text-accent-green">
                Saves ₹{formatINR(totalSaving)}/yr
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allDeductions.map((d) => {
              const current = input[d.key] as number;
              const isActive = current > 0;
              const saving = calcSaving(d.estimate);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggleDeduction(d.key, d.estimate)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    isActive
                      ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                      : "border-card-border text-muted hover:border-accent-indigo/30 hover:text-foreground"
                  }`}
                >
                  {isActive ? "✓ " : "+ "}{d.label}
                  {!isActive && saving > 0 && (
                    <span className="ml-1 text-accent-green/70">₹{formatINR(saving)}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Editable values for active deductions */}
          {allDeductions.some(d => (input[d.key] as number) > 0) && (
            <div className="mt-3 space-y-2">
              {allDeductions.filter(d => (input[d.key] as number) > 0).map((d) => (
                <div key={d.key} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-muted truncate">{d.label}</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
                    <input
                      type="text" inputMode="numeric"
                      value={formatINR(input[d.key] as number)}
                      onChange={(e) => handleChange(d.key, e.target.value)}
                      className="w-full rounded-lg border border-card-border bg-card/50 py-1.5 pl-7 pr-2 text-sm text-foreground outline-none focus:border-accent-indigo/50"
                    />
                  </div>
                  <span className="shrink-0 text-[10px] text-accent-green">-₹{formatINR(calcSaving(input[d.key] as number))}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted/50">Values are estimates based on your salary. Edit for exact amounts.</p>
            </div>
          )}
        </div>
      )}

      {/* Other income + more deductions */}
      <div className="flex flex-wrap gap-3 text-xs">
        <button type="button" onClick={() => setShowIncomeSources(!showIncomeSources)}
          className="flex items-center gap-1 text-muted/60 hover:text-muted transition-colors">
          <svg className={`h-3 w-3 transition-transform ${showIncomeSources ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Other income
        </button>
        <button type="button" onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 text-muted/60 hover:text-muted transition-colors">
          <svg className={`h-3 w-3 transition-transform ${showMore ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          80E, 80G, other
        </button>
      </div>

      {showIncomeSources && (
        <div className="grid gap-3 sm:grid-cols-2">
          {incomeSourceFields.map(renderField)}
        </div>
      )}

      {showMore && (
        <div className="grid gap-3 sm:grid-cols-2">
          {EXTRA_DEDUCTION_FIELDS.map(renderField)}
        </div>
      )}

      <p className="text-center text-xs text-muted/50">Results update as you type</p>
    </div>
  );
}
