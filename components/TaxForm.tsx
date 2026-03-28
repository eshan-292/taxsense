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
  max?: number;
}

const STORAGE_KEY = "taxsense_calculator_input";

const salaryField: FieldConfig = {
  key: "annualSalary",
  label: "Salary Income (CTC)",
  hint: "Your total annual salary before deductions",
};

const incomeSourceFields: FieldConfig[] = [
  {
    key: "incomeHouseProperty",
    label: "Income from House Property",
    hint: "Rental income minus municipal taxes (negative for loss)",
  },
  {
    key: "incomeCapitalGains",
    label: "Capital Gains (already taxed)",
    hint: "Net capital gains from stocks, MF, property etc.",
  },
  {
    key: "incomeOtherSources",
    label: "Income from Other Sources",
    hint: "FD interest, dividends, freelance, etc.",
  },
];

const deductionFields: FieldConfig[] = [
  {
    key: "hra",
    label: "HRA Exemption",
    hint: "House Rent Allowance exemption (use HRA Calculator)",
    oldOnly: true,
    max: 600000,
  },
  {
    key: "section80C",
    label: "Section 80C Investments",
    hint: "EPF + PPF + ELSS + LIC + tuition fees (max ₹1.5L)",
    oldOnly: true,
    max: 150000,
  },
  {
    key: "section80D_self",
    label: "Health Insurance (Self/Family)",
    hint: "Section 80D — self & family premium (max ₹25K)",
    oldOnly: true,
    max: 25000,
  },
  {
    key: "section80D_parents",
    label: "Health Insurance (Parents)",
    hint: "Section 80D — parents premium (max ₹25K/50K)",
    oldOnly: true,
    max: 50000,
  },
  {
    key: "homeLoanInterest",
    label: "Home Loan Interest",
    hint: "Section 24(b) — interest on housing loan (max ₹2L)",
    oldOnly: true,
    max: 200000,
  },
  {
    key: "nps80CCD1B",
    label: "NPS Contribution",
    hint: "Section 80CCD(1B) — additional NPS (max ₹50K)",
    oldOnly: true,
    max: 50000,
  },
  {
    key: "section80E",
    label: "Education Loan Interest",
    hint: "Section 80E — no upper limit, for 8 years",
    oldOnly: true,
  },
  {
    key: "section80G",
    label: "Donations (80G)",
    hint: "Deductible amount under Section 80G",
    oldOnly: true,
  },
  {
    key: "otherDeductions",
    label: "Other Deductions",
    hint: "80TTA, 80GG, etc.",
    oldOnly: true,
  },
];

const defaultInput: TaxInput = {
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
    const parsed = JSON.parse(raw);
    // Merge with defaultInput to handle new fields
    return { ...defaultInput, ...parsed };
  } catch {
    return defaultInput;
  }
}

export default function TaxForm({ onCalculate }: TaxFormProps) {
  const [input, setInput] = useState<TaxInput>(defaultInput);
  const [showIncomeSources, setShowIncomeSources] = useState(false);
  const [showDeductions, setShowDeductions] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = loadFromStorage();
    setInput(saved);
    setHydrated(true);
    if (saved.annualSalary > 0) {
      // Trigger initial calculation with saved data
      onCalculate(saved);
      if (
        saved.hra > 0 ||
        saved.section80C > 0 ||
        saved.section80D_self > 0 ||
        saved.section80D_parents > 0 ||
        saved.homeLoanInterest > 0 ||
        saved.nps80CCD1B > 0 ||
        saved.section80E > 0 ||
        saved.section80G > 0 ||
        saved.otherDeductions > 0
      ) {
        setShowDeductions(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-calculate on input change (debounced 400ms) + save to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (input.annualSalary > 0) {
        onCalculate(input);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, hydrated, onCalculate]);

  const handleChange = useCallback((key: keyof TaxInput, value: string) => {
    const isNegative = value.startsWith("-");
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
    setInput((prev) => ({
      ...prev,
      [key]: isNegative ? -numericValue : numericValue,
    }));
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    setInput((prev) => ({ ...prev, annualSalary: value }));
  }, []);

  const handleQuickFill = (salary: number) => {
    const quickInput: TaxInput = {
      annualSalary: salary,
      incomeHouseProperty: 0,
      incomeCapitalGains: 0,
      incomeOtherSources: 0,
      hra: Math.round(salary * 0.15),
      section80C: 150000,
      section80D_self: 25000,
      section80D_parents: 0,
      homeLoanInterest: 0,
      nps80CCD1B: 50000,
      section80E: 0,
      section80G: 0,
      otherDeductions: 0,
    };
    setInput(quickInput);
    setShowDeductions(true);
  };

  const handleReset = () => {
    setInput(defaultInput);
    setShowDeductions(false);
    setShowIncomeSources(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sliderPercent =
    ((input.annualSalary - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  const renderField = (field: FieldConfig) => (
    <div key={field.key}>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {field.label}
        {field.oldOnly && (
          <span className="ml-2 text-xs text-muted">(Old Regime)</span>
        )}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          ₹
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={
            input[field.key] === 0
              ? ""
              : (input[field.key] < 0 ? "-" : "") +
                formatINR(Math.abs(input[field.key] as number))
          }
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-8 pr-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
        />
      </div>
      {field.hint && (
        <p className="mt-1 text-xs text-muted">{field.hint}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Quick fill */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted/60">
          Quick fill
        </p>
        <div className="flex flex-wrap gap-2">
          {SALARY_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleQuickFill(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                input.annualSalary === s
                  ? "border-accent-indigo/50 bg-accent-indigo/15 text-accent-indigo"
                  : "border-card-border bg-card text-foreground hover:border-accent-indigo/40 hover:bg-accent-indigo/10"
              }`}
            >
              {formatINR(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Salary — text input + slider */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Annual Salary (CTC)
          </label>
          {input.annualSalary > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-muted/60 hover:text-muted transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            ₹
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={input.annualSalary === 0 ? "" : formatINR(input.annualSalary)}
            onChange={(e) => handleChange("annualSalary", e.target.value)}
            placeholder="e.g. 12,00,000"
            className="w-full rounded-xl border border-card-border bg-card py-3 pl-8 pr-4 text-lg font-medium text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
          />
        </div>
        {/* Salary slider */}
        <div className="relative px-1">
          <style>{`
            .salary-slider {
              -webkit-appearance: none;
              appearance: none;
              height: 4px;
              border-radius: 2px;
              outline: none;
              cursor: pointer;
              background: linear-gradient(to right, #6366f1 ${sliderPercent}%, rgba(255,255,255,0.1) ${sliderPercent}%);
            }
            .salary-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #6366f1;
              cursor: pointer;
              border: 2px solid rgba(99,102,241,0.4);
              box-shadow: 0 0 8px rgba(99,102,241,0.4);
            }
            .salary-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #6366f1;
              cursor: pointer;
              border: 2px solid rgba(99,102,241,0.4);
              box-shadow: 0 0 8px rgba(99,102,241,0.4);
            }
          `}</style>
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={SLIDER_STEP}
            value={Math.min(Math.max(input.annualSalary || SLIDER_MIN, SLIDER_MIN), SLIDER_MAX)}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="salary-slider w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-muted/50">
            <span>₹3L</span>
            <span>₹50L</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">{salaryField.hint}</p>
      </div>

      {/* Toggle other income sources */}
      <button
        type="button"
        onClick={() => setShowIncomeSources(!showIncomeSources)}
        className="flex items-center gap-2 text-sm font-medium text-accent-green transition-colors hover:text-accent-green/80"
      >
        <svg
          className={`h-4 w-4 transition-transform ${showIncomeSources ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showIncomeSources ? "Hide" : "Add"} other income (house property, capital gains…)
      </button>

      {showIncomeSources && (
        <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-card-border bg-background/30 p-4">
          <div className="sm:col-span-2">
            <p className="text-xs text-muted mb-3">
              Add income from sources other than salary. Use negative value for house property loss.
            </p>
          </div>
          {incomeSourceFields.map(renderField)}
        </div>
      )}

      {/* Toggle deductions */}
      <button
        type="button"
        onClick={() => setShowDeductions(!showDeductions)}
        className="flex items-center gap-2 text-sm font-medium text-accent-indigo transition-colors hover:text-accent-purple"
      >
        <svg
          className={`h-4 w-4 transition-transform ${showDeductions ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showDeductions ? "Hide" : "Add"} deductions (80C, 80D, HRA…) for Old Regime
      </button>

      {showDeductions && (
        <div className="grid gap-4 sm:grid-cols-2">
          {deductionFields.map(renderField)}
        </div>
      )}

      {/* Auto-calc notice */}
      <p className="text-center text-xs text-muted/50">
        Results update automatically as you type
      </p>
    </div>
  );
}
