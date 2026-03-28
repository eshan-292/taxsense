"use client";

import { useState } from "react";
import { formatRupee, formatINR } from "@/lib/utils";
import {
  SECTION_80C_LIMIT,
  SECTION_80D_SELF_LIMIT,
  SECTION_80D_PARENTS_LIMIT,
  NPS_80CCD_1B_LIMIT,
  HOME_LOAN_INTEREST_LIMIT,
} from "@/lib/tax-slabs";

interface Investment {
  key: string;
  label: string;
  section: "80C" | "80D" | "NPS" | "24b";
  value: number;
  description: string;
}

const defaultInvestments: Investment[] = [
  {
    key: "epf",
    label: "EPF (Employee PF)",
    section: "80C",
    value: 0,
    description: "Employee contribution to Provident Fund",
  },
  {
    key: "ppf",
    label: "PPF",
    section: "80C",
    value: 0,
    description: "Public Provident Fund contributions",
  },
  {
    key: "elss",
    label: "ELSS Mutual Funds",
    section: "80C",
    value: 0,
    description: "Equity Linked Savings Scheme (3-yr lock-in)",
  },
  {
    key: "lic",
    label: "LIC / Insurance Premium",
    section: "80C",
    value: 0,
    description: "Life insurance premiums",
  },
  {
    key: "tuition",
    label: "Children Tuition Fees",
    section: "80C",
    value: 0,
    description: "Tuition fees for up to 2 children",
  },
  {
    key: "nsc",
    label: "NSC / Tax Saving FD",
    section: "80C",
    value: 0,
    description: "National Savings Certificate or 5-yr FD",
  },
  {
    key: "homeLoanPrincipal",
    label: "Home Loan Principal",
    section: "80C",
    value: 0,
    description: "Principal repayment on housing loan",
  },
  {
    key: "health_self",
    label: "Health Insurance (Self/Family)",
    section: "80D",
    value: 0,
    description: "Medical insurance premium for self & family",
  },
  {
    key: "health_parents",
    label: "Health Insurance (Parents)",
    section: "80D",
    value: 0,
    description: "Medical insurance premium for parents",
  },
  {
    key: "nps",
    label: "NPS (80CCD 1B)",
    section: "NPS",
    value: 0,
    description: "Additional NPS contribution beyond 80C",
  },
  {
    key: "homeLoanInterest",
    label: "Home Loan Interest",
    section: "24b",
    value: 0,
    description: "Interest on housing loan u/s 24(b)",
  },
];

function ProgressBar({
  used,
  limit,
  color,
}: {
  used: number;
  limit: number;
  color: string;
}) {
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(0, limit - used);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted">
          {formatRupee(used)} of {formatRupee(limit)}
        </span>
        <span
          className={
            remaining === 0
              ? "font-medium text-accent-green"
              : "text-accent-amber"
          }
        >
          {remaining === 0
            ? "Fully utilized"
            : `${formatRupee(remaining)} remaining`}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-background/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function SavingsOptimizer() {
  const [investments, setInvestments] =
    useState<Investment[]>(defaultInvestments);

  const handleChange = (key: string, value: string) => {
    const numericValue = parseInt(value.replace(/,/g, ""), 10) || 0;
    setInvestments((prev) =>
      prev.map((inv) => (inv.key === key ? { ...inv, value: numericValue } : inv))
    );
  };

  // Calculate totals
  const total80C = investments
    .filter((i) => i.section === "80C")
    .reduce((sum, i) => sum + i.value, 0);
  const total80D_self = investments
    .filter((i) => i.key === "health_self")
    .reduce((sum, i) => sum + i.value, 0);
  const total80D_parents = investments
    .filter((i) => i.key === "health_parents")
    .reduce((sum, i) => sum + i.value, 0);
  const totalNPS = investments
    .filter((i) => i.section === "NPS")
    .reduce((sum, i) => sum + i.value, 0);
  const totalHomeLoan = investments
    .filter((i) => i.section === "24b")
    .reduce((sum, i) => sum + i.value, 0);

  const totalDeductions =
    Math.min(total80C, SECTION_80C_LIMIT) +
    Math.min(total80D_self, SECTION_80D_SELF_LIMIT) +
    Math.min(total80D_parents, SECTION_80D_PARENTS_LIMIT) +
    Math.min(totalNPS, NPS_80CCD_1B_LIMIT) +
    Math.min(totalHomeLoan, HOME_LOAN_INTEREST_LIMIT);

  // Estimate tax savings (assuming 30% slab for simplicity)
  const maxSlab = 0.3;
  const estimatedSavings = Math.round(totalDeductions * maxSlab);

  // Suggestions
  const suggestions: string[] = [];
  if (total80C < SECTION_80C_LIMIT) {
    const gap = SECTION_80C_LIMIT - total80C;
    suggestions.push(
      `Invest ${formatRupee(gap)} more in 80C instruments (ELSS, PPF) to utilize the full limit.`
    );
  }
  if (total80D_self === 0) {
    suggestions.push(
      "Get a health insurance policy for self/family to claim up to \u20B925,000 under 80D."
    );
  }
  if (total80D_parents === 0) {
    suggestions.push(
      "Insure your parents' health to claim up to \u20B925,000 (or \u20B950,000 for senior citizens) under 80D."
    );
  }
  if (totalNPS === 0) {
    suggestions.push(
      "Invest up to \u20B950,000 in NPS for additional deduction under 80CCD(1B), beyond the 80C limit."
    );
  }

  // Monthly investment plan
  const remaining80C = Math.max(0, SECTION_80C_LIMIT - total80C);
  const monthsLeft = 12; // simplified
  const monthlyTarget = Math.round(remaining80C / monthsLeft);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-sm text-muted">Total Deductions</p>
          <p className="text-2xl font-bold text-accent-indigo">
            {formatRupee(totalDeductions)}
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted">Estimated Tax Savings</p>
          <p className="text-2xl font-bold text-accent-green">
            {formatRupee(estimatedSavings)}
          </p>
          <p className="text-xs text-muted">at 30% tax slab</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted">Monthly Investment Target</p>
          <p className="text-2xl font-bold text-accent-purple">
            {formatRupee(monthlyTarget)}
          </p>
          <p className="text-xs text-muted">to max out 80C</p>
        </div>
      </div>

      {/* Section utilization bars */}
      <div className="glass-card space-y-5 p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Section Utilization
        </h3>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Section 80C
          </p>
          <ProgressBar
            used={total80C}
            limit={SECTION_80C_LIMIT}
            color="bg-gradient-to-r from-accent-indigo to-accent-purple"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Section 80D (Self/Family)
          </p>
          <ProgressBar
            used={total80D_self}
            limit={SECTION_80D_SELF_LIMIT}
            color="bg-gradient-to-r from-accent-green to-emerald-400"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Section 80D (Parents)
          </p>
          <ProgressBar
            used={total80D_parents}
            limit={SECTION_80D_PARENTS_LIMIT}
            color="bg-gradient-to-r from-accent-green to-emerald-400"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            NPS 80CCD(1B)
          </p>
          <ProgressBar
            used={totalNPS}
            limit={NPS_80CCD_1B_LIMIT}
            color="bg-gradient-to-r from-accent-amber to-orange-400"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Home Loan Interest 24(b)
          </p>
          <ProgressBar
            used={totalHomeLoan}
            limit={HOME_LOAN_INTEREST_LIMIT}
            color="bg-gradient-to-r from-rose-500 to-accent-red"
          />
        </div>
      </div>

      {/* Input investments */}
      <div className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Your Investments
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {investments.map((inv) => (
            <div key={inv.key}>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {inv.label}
                <span className="ml-2 text-xs text-muted">({inv.section})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  &#x20B9;
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inv.value === 0 ? "" : formatINR(inv.value)}
                  onChange={(e) => handleChange(inv.key, e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-card-border bg-card py-2.5 pl-8 pr-4 text-foreground placeholder:text-muted/50 focus:border-accent-indigo/50 focus:outline-none focus:ring-1 focus:ring-accent-indigo/30"
                />
              </div>
              <p className="mt-0.5 text-xs text-muted">{inv.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Optimization Suggestions
          </h3>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-amber/15 text-xs text-accent-amber">
                  {i + 1}
                </div>
                <p className="text-muted">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
