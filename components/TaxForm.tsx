"use client";

import { useState, useCallback } from "react";
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

const fields: FieldConfig[] = [
  {
    key: "annualSalary",
    label: "Annual Salary (CTC)",
    hint: "Your total annual salary before deductions",
  },
  {
    key: "hra",
    label: "HRA Exemption",
    hint: "House Rent Allowance exemption amount",
    oldOnly: true,
  },
  {
    key: "section80C",
    label: "Section 80C Investments",
    hint: "EPF + PPF + ELSS + LIC + tuition fees (max 1.5L)",
    oldOnly: true,
  },
  {
    key: "section80D_self",
    label: "Health Insurance (Self/Family)",
    hint: "Section 80D - self & family premium (max 25K)",
    oldOnly: true,
  },
  {
    key: "section80D_parents",
    label: "Health Insurance (Parents)",
    hint: "Section 80D - parents premium (max 25K/50K)",
    oldOnly: true,
  },
  {
    key: "homeLoanInterest",
    label: "Home Loan Interest",
    hint: "Section 24(b) - interest on housing loan (max 2L)",
    oldOnly: true,
  },
  {
    key: "nps80CCD1B",
    label: "NPS Contribution",
    hint: "Section 80CCD(1B) - additional NPS (max 50K)",
    oldOnly: true,
  },
  {
    key: "otherDeductions",
    label: "Other Deductions",
    hint: "Any other deductions under old regime",
    oldOnly: true,
  },
];

const defaultInput: TaxInput = {
  annualSalary: 0,
  hra: 0,
  section80C: 0,
  section80D_self: 0,
  section80D_parents: 0,
  homeLoanInterest: 0,
  nps80CCD1B: 0,
  otherDeductions: 0,
};

export default function TaxForm({ onCalculate }: TaxFormProps) {
  const [input, setInput] = useState<TaxInput>(defaultInput);
  const [showDeductions, setShowDeductions] = useState(false);

  const handleChange = useCallback(
    (key: keyof TaxInput, value: string) => {
      const numericValue = parseInt(value.replace(/,/g, ""), 10) || 0;
      setInput((prev) => ({ ...prev, [key]: numericValue }));
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(input);
  };

  const handleQuickFill = (salary: number) => {
    const quickInput: TaxInput = {
      annualSalary: salary,
      hra: Math.round(salary * 0.15),
      section80C: 150000,
      section80D_self: 25000,
      section80D_parents: 0,
      homeLoanInterest: 0,
      nps80CCD1B: 50000,
      otherDeductions: 0,
    };
    setInput(quickInput);
    setShowDeductions(true);
    onCalculate(quickInput);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick fill buttons */}
      <div>
        <p className="mb-2 text-sm text-muted">Quick fill salary:</p>
        <div className="flex flex-wrap gap-2">
          {[500000, 750000, 1000000, 1500000, 2000000, 2500000].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleQuickFill(s)}
              className="rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent-indigo/50 hover:bg-accent-indigo/10"
            >
              {formatINR(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Salary field - always visible */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {fields[0].label}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            &#x20B9;
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
        <p className="mt-1 text-xs text-muted">{fields[0].hint}</p>
      </div>

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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        {showDeductions ? "Hide" : "Add"} deductions (for Old Regime comparison)
      </button>

      {/* Deduction fields */}
      {showDeductions && (
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.slice(1).map((field) => (
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
                  value={
                    input[field.key] === 0
                      ? ""
                      : formatINR(input[field.key])
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
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.99]"
      >
        Calculate Tax
      </button>
    </form>
  );
}
