"use client";

import type { TaxInput, TaxResult } from "@/lib/tax-calculator";
import { formatRupee } from "@/lib/utils";
import {
  SECTION_80C_LIMIT,
  SECTION_80D_SELF_LIMIT,
  SECTION_80D_PARENTS_LIMIT,
  NPS_80CCD_1B_LIMIT,
  HOME_LOAN_INTEREST_LIMIT,
} from "@/lib/tax-slabs";

interface Props {
  input: TaxInput;
  oldRegime: TaxResult;
}

interface Opportunity {
  section: string;
  label: string;
  current: number;
  max: number;
  annualSaving: number;
  tip: string;
}

function getMarginalRate(taxableIncome: number): number {
  if (taxableIncome > 1000000) return 0.30;
  if (taxableIncome > 500000) return 0.20;
  if (taxableIncome > 250000) return 0.05;
  return 0;
}

export default function TaxOpportunities({ input, oldRegime }: Props) {
  const marginalRate = getMarginalRate(oldRegime.taxableIncome);
  const effectiveRate = marginalRate * 1.04; // including 4% cess

  const toSaving = (gap: number) => Math.round(gap * effectiveRate);

  const rawOpportunities: Opportunity[] = [
    {
      section: "80C",
      label: "80C Investments",
      current: Math.min(input.section80C, SECTION_80C_LIMIT),
      max: SECTION_80C_LIMIT,
      annualSaving: toSaving(Math.max(0, SECTION_80C_LIMIT - input.section80C)),
      tip: "PPF, ELSS, EPF, LIC premium, tuition fees",
    },
    {
      section: "80CCD(1B)",
      label: "NPS Contribution",
      current: Math.min(input.nps80CCD1B, NPS_80CCD_1B_LIMIT),
      max: NPS_80CCD_1B_LIMIT,
      annualSaving: toSaving(Math.max(0, NPS_80CCD_1B_LIMIT - input.nps80CCD1B)),
      tip: "Over and above 80C limit — additional ₹50K deduction",
    },
    {
      section: "80D",
      label: "Health Insurance (self)",
      current: Math.min(input.section80D_self, SECTION_80D_SELF_LIMIT),
      max: SECTION_80D_SELF_LIMIT,
      annualSaving: toSaving(Math.max(0, SECTION_80D_SELF_LIMIT - input.section80D_self)),
      tip: "Family health insurance premium",
    },
    {
      section: "80D (parents)",
      label: "Health Insurance (parents)",
      current: Math.min(input.section80D_parents, SECTION_80D_PARENTS_LIMIT),
      max: SECTION_80D_PARENTS_LIMIT,
      annualSaving: toSaving(Math.max(0, SECTION_80D_PARENTS_LIMIT - input.section80D_parents)),
      tip: "Parents' health insurance — ₹25K or ₹50K if senior",
    },
    ...(input.homeLoanInterest > 0
      ? [
          {
            section: "24(b)",
            label: "Home Loan Interest",
            current: Math.min(input.homeLoanInterest, HOME_LOAN_INTEREST_LIMIT),
            max: HOME_LOAN_INTEREST_LIMIT,
            annualSaving: toSaving(
              Math.max(0, HOME_LOAN_INTEREST_LIMIT - input.homeLoanInterest)
            ),
            tip: "Interest on housing loan (max ₹2L)",
          },
        ]
      : []),
    ...(input.hra === 0
      ? [
          {
            section: "10(13A)",
            label: "HRA Exemption",
            current: 0,
            max: 1,
            annualSaving: 0,
            tip: "If you pay rent, use the HRA Calculator to find your exemption",
          },
        ]
      : []),
  ];

  const opportunities = rawOpportunities
    .filter((o) => o.current < o.max || o.annualSaving === 0)
    .sort((a, b) => b.annualSaving - a.annualSaving);

  const totalPotentialSaving = opportunities.reduce((s, o) => s + o.annualSaving, 0);

  if (opportunities.length === 0 || totalPotentialSaving === 0) return null;

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Tax Saving Opportunities</h3>
        {totalPotentialSaving > 0 && (
          <span className="rounded-full bg-accent-green/15 px-2.5 py-0.5 text-xs font-semibold text-accent-green">
            Save up to {formatRupee(totalPotentialSaving)}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {opportunities.map((op) => {
          const pct = op.max > 1 ? Math.round((op.current / op.max) * 100) : 0;
          const gap = op.max > 1 ? op.max - op.current : 0;
          return (
            <div key={op.section}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted">
                    {op.section}
                  </span>
                  <span className="text-sm text-foreground">{op.label}</span>
                </div>
                {op.annualSaving > 0 && (
                  <span className="text-xs font-semibold text-accent-green">
                    +{formatRupee(op.annualSaving)}/yr
                  </span>
                )}
              </div>
              {op.max > 1 ? (
                <>
                  <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-card">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-indigo to-accent-purple transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    {pct === 100
                      ? "Maxed out"
                      : `${formatRupee(op.current)} used · ${formatRupee(gap)} remaining · ${op.tip}`}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted">{op.tip}</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted/50">
        Savings calculated at {(marginalRate * 100).toFixed(0)}% marginal rate + 4% cess. Only applicable under Old Regime.
      </p>
    </div>
  );
}
