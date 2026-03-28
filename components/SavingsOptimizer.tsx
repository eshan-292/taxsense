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

// Additional limits
const SECTION_80E_LIMIT = Infinity; // No upper limit on education loan interest
const SECTION_80G_LIMIT = Infinity; // Varies; simplified
const SECTION_80CCD2_LIMIT = Infinity; // 10% of salary; simplified
const SECTION_80TTA_LIMIT = 10000;
const SECTION_80GG_LIMIT = 60000; // max 5000/month

interface Investment {
  key: string;
  label: string;
  section: string;
  sectionGroup: "80C" | "80D_self" | "80D_parents" | "NPS" | "24b" | "80E" | "80G" | "80CCD2" | "80TTA" | "80GG";
  value: number;
  description: string;
}

const defaultInvestments: Investment[] = [
  // 80C investments
  {
    key: "epf",
    label: "EPF (Employee PF)",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "Employee contribution to Provident Fund",
  },
  {
    key: "ppf",
    label: "PPF",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "Public Provident Fund contributions",
  },
  {
    key: "elss",
    label: "ELSS Mutual Funds",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "Equity Linked Savings Scheme (3-yr lock-in)",
  },
  {
    key: "lic",
    label: "LIC / Insurance Premium",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "Life insurance premiums",
  },
  {
    key: "tuition",
    label: "Children Tuition Fees",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "Tuition fees for up to 2 children",
  },
  {
    key: "nsc",
    label: "NSC / Tax Saving FD",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "National Savings Certificate or 5-yr FD",
  },
  {
    key: "homeLoanPrincipal",
    label: "Home Loan Principal",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "Principal repayment on housing loan",
  },
  {
    key: "sukanya",
    label: "Sukanya Samriddhi Yojana",
    section: "80C",
    sectionGroup: "80C",
    value: 0,
    description: "For girl child education/marriage (EEE benefit)",
  },
  // 80D - Health Insurance
  {
    key: "health_self",
    label: "Health Insurance (Self/Family)",
    section: "80D",
    sectionGroup: "80D_self",
    value: 0,
    description: "Medical insurance premium for self & family (max 25K / 50K for senior)",
  },
  {
    key: "health_parents",
    label: "Health Insurance (Parents)",
    section: "80D",
    sectionGroup: "80D_parents",
    value: 0,
    description: "Medical insurance premium for parents (max 25K / 50K for senior)",
  },
  {
    key: "preventive_health",
    label: "Preventive Health Checkup",
    section: "80D",
    sectionGroup: "80D_self",
    value: 0,
    description: "Annual health checkup up to 5,000 (within 80D limit)",
  },
  // NPS
  {
    key: "nps",
    label: "NPS (80CCD 1B)",
    section: "80CCD(1B)",
    sectionGroup: "NPS",
    value: 0,
    description: "Additional NPS contribution beyond 80C (max 50K)",
  },
  {
    key: "nps_employer",
    label: "NPS Employer Contribution",
    section: "80CCD(2)",
    sectionGroup: "80CCD2",
    value: 0,
    description: "Employer contribution to NPS (up to 10% of salary, no cap under 80CCD(2))",
  },
  // Home Loan
  {
    key: "homeLoanInterest",
    label: "Home Loan Interest",
    section: "24(b)",
    sectionGroup: "24b",
    value: 0,
    description: "Interest on housing loan u/s 24(b) (max 2L for self-occupied)",
  },
  // 80E - Education Loan
  {
    key: "educationLoan",
    label: "Education Loan Interest",
    section: "80E",
    sectionGroup: "80E",
    value: 0,
    description: "Interest on education loan (no upper limit, for 8 years from start of repayment)",
  },
  // 80G - Donations
  {
    key: "donations100",
    label: "Donations (100% Deductible)",
    section: "80G",
    sectionGroup: "80G",
    value: 0,
    description: "PM Relief Fund, National Defence Fund, etc. - full deduction",
  },
  {
    key: "donations50",
    label: "Donations (50% Deductible)",
    section: "80G",
    sectionGroup: "80G",
    value: 0,
    description: "Approved charitable organizations - 50% deduction",
  },
  // 80TTA
  {
    key: "savingsInterest",
    label: "Savings Account Interest",
    section: "80TTA",
    sectionGroup: "80TTA",
    value: 0,
    description: "Interest from savings bank accounts (max 10K deduction)",
  },
  // 80GG - Rent without HRA
  {
    key: "rentWithoutHRA",
    label: "Rent Paid (No HRA from employer)",
    section: "80GG",
    sectionGroup: "80GG",
    value: 0,
    description: "If you don't receive HRA, claim rent paid (max 5K/month)",
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
  const effectiveLimit = limit === Infinity ? Math.max(used, 100000) : limit;
  const percentage = limit === Infinity ? 100 : Math.min((used / effectiveLimit) * 100, 100);
  const remaining = limit === Infinity ? null : Math.max(0, limit - used);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted">
          {formatRupee(used)}{limit !== Infinity ? ` of ${formatRupee(limit)}` : " (no cap)"}
        </span>
        <span
          className={
            remaining === null
              ? "text-accent-indigo"
              : remaining === 0
              ? "font-medium text-accent-green"
              : "text-accent-amber"
          }
        >
          {remaining === null
            ? "No upper limit"
            : remaining === 0
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
  const [investments, setInvestments] = useState<Investment[]>(defaultInvestments);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "80C": true,
    "80D": true,
    NPS: true,
    "24b": false,
    "80E": false,
    "80G": false,
    other: false,
  });

  const handleChange = (key: string, value: string) => {
    const numericValue = parseInt(value.replace(/,/g, ""), 10) || 0;
    setInvestments((prev) =>
      prev.map((inv) => (inv.key === key ? { ...inv, value: numericValue } : inv))
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate totals by section
  const total80C = investments
    .filter((i) => i.sectionGroup === "80C")
    .reduce((sum, i) => sum + i.value, 0);
  const total80D_self = investments
    .filter((i) => i.sectionGroup === "80D_self")
    .reduce((sum, i) => sum + i.value, 0);
  const total80D_parents = investments
    .filter((i) => i.sectionGroup === "80D_parents")
    .reduce((sum, i) => sum + i.value, 0);
  const totalNPS = investments
    .filter((i) => i.sectionGroup === "NPS")
    .reduce((sum, i) => sum + i.value, 0);
  const totalNPSEmployer = investments
    .filter((i) => i.sectionGroup === "80CCD2")
    .reduce((sum, i) => sum + i.value, 0);
  const totalHomeLoan = investments
    .filter((i) => i.sectionGroup === "24b")
    .reduce((sum, i) => sum + i.value, 0);
  const total80E = investments
    .filter((i) => i.sectionGroup === "80E")
    .reduce((sum, i) => sum + i.value, 0);
  const total80G_100 = investments
    .filter((i) => i.key === "donations100")
    .reduce((sum, i) => sum + i.value, 0);
  const total80G_50 = investments
    .filter((i) => i.key === "donations50")
    .reduce((sum, i) => sum + i.value, 0);
  const total80TTA = investments
    .filter((i) => i.sectionGroup === "80TTA")
    .reduce((sum, i) => sum + i.value, 0);
  const total80GG = investments
    .filter((i) => i.sectionGroup === "80GG")
    .reduce((sum, i) => sum + i.value, 0);

  const totalDeductions =
    Math.min(total80C, SECTION_80C_LIMIT) +
    Math.min(total80D_self, SECTION_80D_SELF_LIMIT) +
    Math.min(total80D_parents, SECTION_80D_PARENTS_LIMIT) +
    Math.min(totalNPS, NPS_80CCD_1B_LIMIT) +
    totalNPSEmployer +
    Math.min(totalHomeLoan, HOME_LOAN_INTEREST_LIMIT) +
    total80E +
    total80G_100 +
    Math.round(total80G_50 * 0.5) +
    Math.min(total80TTA, SECTION_80TTA_LIMIT) +
    Math.min(total80GG, SECTION_80GG_LIMIT);

  // Estimate tax savings (assuming 30% slab for simplicity)
  const maxSlab = 0.3;
  const estimatedSavings = Math.round(totalDeductions * maxSlab);

  // Suggestions
  const suggestions: string[] = [];
  if (total80C < SECTION_80C_LIMIT) {
    const gap = SECTION_80C_LIMIT - total80C;
    suggestions.push(
      `Invest ${formatRupee(gap)} more in 80C instruments (ELSS, PPF) to utilize the full 1.5L limit.`
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
  if (total80E === 0) {
    suggestions.push(
      "If you have an education loan, the entire interest amount is deductible under Section 80E (no cap) for up to 8 years."
    );
  }
  if (total80G_100 === 0 && total80G_50 === 0) {
    suggestions.push(
      "Donations to approved charities qualify for deduction under Section 80G. PM Relief Fund gets 100% deduction."
    );
  }

  // Monthly investment plan
  const remaining80C = Math.max(0, SECTION_80C_LIMIT - total80C);
  const monthsLeft = 12;
  const monthlyTarget = Math.round(remaining80C / monthsLeft);

  // Group investments by section for display
  const sectionGroups: { key: string; label: string; items: Investment[] }[] = [
    { key: "80C", label: "Section 80C (Max 1.5L)", items: investments.filter((i) => i.sectionGroup === "80C") },
    { key: "80D", label: "Section 80D (Health Insurance)", items: investments.filter((i) => i.sectionGroup === "80D_self" || i.sectionGroup === "80D_parents") },
    { key: "NPS", label: "NPS Contributions", items: investments.filter((i) => i.sectionGroup === "NPS" || i.sectionGroup === "80CCD2") },
    { key: "24b", label: "Home Loan Interest - Sec 24(b)", items: investments.filter((i) => i.sectionGroup === "24b") },
    { key: "80E", label: "Education Loan - Sec 80E", items: investments.filter((i) => i.sectionGroup === "80E") },
    { key: "80G", label: "Donations - Sec 80G", items: investments.filter((i) => i.sectionGroup === "80G") },
    { key: "other", label: "Other Deductions (80TTA, 80GG)", items: investments.filter((i) => i.sectionGroup === "80TTA" || i.sectionGroup === "80GG") },
  ];

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
          <p className="mb-2 text-sm font-medium text-foreground">Section 80C</p>
          <ProgressBar used={total80C} limit={SECTION_80C_LIMIT} color="bg-gradient-to-r from-accent-indigo to-accent-purple" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Section 80D (Self/Family)</p>
          <ProgressBar used={total80D_self} limit={SECTION_80D_SELF_LIMIT} color="bg-gradient-to-r from-accent-green to-emerald-400" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Section 80D (Parents)</p>
          <ProgressBar used={total80D_parents} limit={SECTION_80D_PARENTS_LIMIT} color="bg-gradient-to-r from-accent-green to-emerald-400" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">NPS 80CCD(1B)</p>
          <ProgressBar used={totalNPS} limit={NPS_80CCD_1B_LIMIT} color="bg-gradient-to-r from-accent-amber to-orange-400" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Home Loan Interest 24(b)</p>
          <ProgressBar used={totalHomeLoan} limit={HOME_LOAN_INTEREST_LIMIT} color="bg-gradient-to-r from-rose-500 to-accent-red" />
        </div>
        {total80E > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Education Loan 80E</p>
            <ProgressBar used={total80E} limit={SECTION_80E_LIMIT} color="bg-gradient-to-r from-cyan-500 to-blue-500" />
          </div>
        )}
        {(total80G_100 > 0 || total80G_50 > 0) && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Donations 80G</p>
            <ProgressBar used={total80G_100 + Math.round(total80G_50 * 0.5)} limit={SECTION_80G_LIMIT} color="bg-gradient-to-r from-violet-500 to-purple-500" />
          </div>
        )}
        {total80TTA > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Savings Interest 80TTA</p>
            <ProgressBar used={total80TTA} limit={SECTION_80TTA_LIMIT} color="bg-gradient-to-r from-teal-500 to-cyan-400" />
          </div>
        )}
      </div>

      {/* Input investments - grouped by section */}
      <div className="space-y-4">
        {sectionGroups.map((group) => (
          <div key={group.key} className="glass-card overflow-hidden">
            <button
              onClick={() => toggleSection(group.key)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <h3 className="text-base font-semibold text-foreground">
                {group.label}
              </h3>
              <svg
                className={`h-5 w-5 text-muted transition-transform ${
                  expandedSections[group.key] ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections[group.key] && (
              <div className="border-t border-card-border px-5 pb-5 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.items.map((inv) => (
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
            )}
          </div>
        ))}
      </div>

      {/* Calculate my tax CTA */}
      {totalDeductions > 0 && (() => {
        const p = new URLSearchParams();
        if (Math.min(total80C, SECTION_80C_LIMIT) > 0) p.set("c", String(Math.min(total80C, SECTION_80C_LIMIT)));
        if (Math.min(total80D_self, SECTION_80D_SELF_LIMIT) > 0) p.set("ds", String(Math.min(total80D_self, SECTION_80D_SELF_LIMIT)));
        if (Math.min(total80D_parents, SECTION_80D_PARENTS_LIMIT) > 0) p.set("dp", String(Math.min(total80D_parents, SECTION_80D_PARENTS_LIMIT)));
        if (Math.min(totalNPS, NPS_80CCD_1B_LIMIT) > 0) p.set("nps", String(Math.min(totalNPS, NPS_80CCD_1B_LIMIT)));
        if (Math.min(totalHomeLoan, HOME_LOAN_INTEREST_LIMIT) > 0) p.set("hl", String(Math.min(totalHomeLoan, HOME_LOAN_INTEREST_LIMIT)));
        if (total80E > 0) p.set("e", String(total80E));
        if (total80G_100 + total80G_50 > 0) p.set("g", String(total80G_100 + Math.round(total80G_50 * 0.5)));
        const url = `/calculator?${p.toString()}`;
        return (
          <a
            href={url}
            className="glass-card flex items-center justify-between p-5 transition-all hover:border-accent-indigo/30 hover:glow-indigo"
          >
            <div>
              <p className="font-semibold text-foreground">Calculate my tax with these deductions</p>
              <p className="text-sm text-muted">Opens calculator with your {formatRupee(totalDeductions)} in deductions pre-filled</p>
            </div>
            <svg className="h-5 w-5 shrink-0 text-accent-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        );
      })()}

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
