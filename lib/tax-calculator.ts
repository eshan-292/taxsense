import {
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  NEW_REGIME_STANDARD_DEDUCTION,
  OLD_REGIME_STANDARD_DEDUCTION,
  NEW_REGIME_REBATE_LIMIT,
  OLD_REGIME_REBATE_LIMIT,
  SECTION_80C_LIMIT,
  SECTION_80D_SELF_LIMIT,
  SECTION_80D_PARENTS_LIMIT,
  NPS_80CCD_1B_LIMIT,
  HOME_LOAN_INTEREST_LIMIT,
  SURCHARGE_SLABS,
  NEW_REGIME_MAX_SURCHARGE_RATE,
  CESS_RATE,
  type TaxSlab,
} from "./tax-slabs";

export interface TaxInput {
  annualSalary: number;
  incomeHouseProperty: number;
  incomeCapitalGains: number;
  incomeOtherSources: number;
  hra: number; // HRA exemption (only old regime)
  section80C: number; // EPF + PPF + ELSS + LIC + etc.
  section80D_self: number; // Health insurance for self/family
  section80D_parents: number; // Health insurance for parents
  homeLoanInterest: number; // Section 24(b)
  nps80CCD1B: number; // Additional NPS deduction
  section80E: number; // Education loan interest
  section80G: number; // Donations
  otherDeductions: number; // Any other deductions under old regime
}

export interface TaxSlabBreakdown {
  slab: string;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface TaxResult {
  grossIncome: number;
  standardDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  slabBreakdown: TaxSlabBreakdown[];
  baseTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRate: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  monthlyTax: number;
  takeHome: number;
  monthlyTakeHome: number;
}

function calculateSlabTax(
  taxableIncome: number,
  slabs: TaxSlab[]
): { total: number; breakdown: TaxSlabBreakdown[] } {
  let remaining = taxableIncome;
  let total = 0;
  const breakdown: TaxSlabBreakdown[] = [];

  for (const slab of slabs) {
    if (remaining <= 0) break;

    const slabWidth = slab.to === Infinity ? remaining : slab.to - slab.from + 1;
    const taxableAmount = Math.min(remaining, slabWidth);
    const tax = taxableAmount * slab.rate;

    breakdown.push({
      slab:
        slab.to === Infinity
          ? `Above \u20B9${(slab.from - 1).toLocaleString("en-IN")}`
          : `\u20B9${slab.from.toLocaleString("en-IN")} - \u20B9${slab.to.toLocaleString("en-IN")}`,
      rate: slab.rate * 100,
      taxableAmount,
      tax,
    });

    total += tax;
    remaining -= taxableAmount;
  }

  return { total, breakdown };
}

function calculateSurcharge(
  income: number,
  baseTax: number,
  isNewRegime: boolean
): { surcharge: number; rate: number } {
  let rate = 0;

  for (const slab of SURCHARGE_SLABS) {
    if (income >= slab.from && income <= slab.to) {
      rate = slab.rate;
      break;
    }
  }

  // New regime caps surcharge at 25%
  if (isNewRegime && rate > NEW_REGIME_MAX_SURCHARGE_RATE) {
    rate = NEW_REGIME_MAX_SURCHARGE_RATE;
  }

  return { surcharge: baseTax * rate, rate };
}

function getGrossIncome(input: TaxInput): number {
  return (
    input.annualSalary +
    (input.incomeHouseProperty || 0) +
    (input.incomeCapitalGains || 0) +
    (input.incomeOtherSources || 0)
  );
}

export function calculateNewRegimeTax(input: TaxInput): TaxResult {
  const grossIncome = getGrossIncome(input);
  const standardDeduction = NEW_REGIME_STANDARD_DEDUCTION;

  // New regime: only standard deduction, no other deductions
  const totalDeductions = standardDeduction;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  const { total: baseTax, breakdown } = calculateSlabTax(
    taxableIncome,
    NEW_REGIME_SLABS
  );

  // Rebate u/s 87A: Full rebate if taxable income <= 12,00,000
  const rebate87A = taxableIncome <= NEW_REGIME_REBATE_LIMIT ? baseTax : 0;
  const taxAfterRebate = Math.max(0, baseTax - rebate87A);

  const { surcharge, rate: surchargeRate } = calculateSurcharge(
    grossIncome,
    taxAfterRebate,
    true
  );

  const cess = (taxAfterRebate + surcharge) * CESS_RATE;
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);

  return {
    grossIncome,
    standardDeduction,
    totalDeductions,
    taxableIncome,
    slabBreakdown: breakdown,
    baseTax,
    rebate87A,
    taxAfterRebate,
    surcharge,
    surchargeRate,
    cess,
    totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    monthlyTax: Math.round(totalTax / 12),
    takeHome: grossIncome - totalTax,
    monthlyTakeHome: Math.round((grossIncome - totalTax) / 12),
  };
}

export function calculateOldRegimeTax(input: TaxInput): TaxResult {
  const grossIncome = getGrossIncome(input);
  const standardDeduction = OLD_REGIME_STANDARD_DEDUCTION;

  // Old regime: all deductions apply
  const capped80C = Math.min(input.section80C, SECTION_80C_LIMIT);
  const capped80D_self = Math.min(input.section80D_self, SECTION_80D_SELF_LIMIT);
  const capped80D_parents = Math.min(
    input.section80D_parents,
    SECTION_80D_PARENTS_LIMIT
  );
  const cappedHomeLoan = Math.min(
    input.homeLoanInterest,
    HOME_LOAN_INTEREST_LIMIT
  );
  const cappedNPS = Math.min(input.nps80CCD1B, NPS_80CCD_1B_LIMIT);

  const totalDeductions =
    standardDeduction +
    input.hra +
    capped80C +
    capped80D_self +
    capped80D_parents +
    cappedHomeLoan +
    cappedNPS +
    (input.section80E || 0) +
    (input.section80G || 0) +
    input.otherDeductions;

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  const { total: baseTax, breakdown } = calculateSlabTax(
    taxableIncome,
    OLD_REGIME_SLABS
  );

  // Rebate u/s 87A: Full rebate if taxable income <= 5,00,000
  const rebate87A = taxableIncome <= OLD_REGIME_REBATE_LIMIT ? baseTax : 0;
  const taxAfterRebate = Math.max(0, baseTax - rebate87A);

  const { surcharge, rate: surchargeRate } = calculateSurcharge(
    grossIncome,
    taxAfterRebate,
    false
  );

  const cess = (taxAfterRebate + surcharge) * CESS_RATE;
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);

  return {
    grossIncome,
    standardDeduction,
    totalDeductions,
    taxableIncome,
    slabBreakdown: breakdown,
    baseTax,
    rebate87A,
    taxAfterRebate,
    surcharge,
    surchargeRate,
    cess,
    totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    monthlyTax: Math.round(totalTax / 12),
    takeHome: grossIncome - totalTax,
    monthlyTakeHome: Math.round((grossIncome - totalTax) / 12),
  };
}

export function getRecommendation(
  newRegime: TaxResult,
  oldRegime: TaxResult
): { regime: "new" | "old"; savings: number } {
  if (newRegime.totalTax <= oldRegime.totalTax) {
    return {
      regime: "new",
      savings: oldRegime.totalTax - newRegime.totalTax,
    };
  }
  return {
    regime: "old",
    savings: newRegime.totalTax - oldRegime.totalTax,
  };
}
