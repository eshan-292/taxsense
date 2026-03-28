// FY 2025-26 Tax Slabs

export interface TaxSlab {
  from: number;
  to: number;
  rate: number;
}

// New Tax Regime (Default from FY 2023-24 onwards, updated for FY 2025-26)
export const NEW_REGIME_SLABS: TaxSlab[] = [
  { from: 0, to: 400000, rate: 0 },
  { from: 400001, to: 800000, rate: 0.05 },
  { from: 800001, to: 1200000, rate: 0.10 },
  { from: 1200001, to: 1600000, rate: 0.15 },
  { from: 1600001, to: 2000000, rate: 0.20 },
  { from: 2000001, to: 2400000, rate: 0.25 },
  { from: 2400001, to: Infinity, rate: 0.30 },
];

// Old Tax Regime
export const OLD_REGIME_SLABS: TaxSlab[] = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250001, to: 500000, rate: 0.05 },
  { from: 500001, to: 1000000, rate: 0.20 },
  { from: 1000001, to: Infinity, rate: 0.30 },
];

// Standard deductions
export const NEW_REGIME_STANDARD_DEDUCTION = 75000;
export const OLD_REGIME_STANDARD_DEDUCTION = 50000;

// Rebate u/s 87A
export const NEW_REGIME_REBATE_LIMIT = 1200000; // taxable income limit
export const OLD_REGIME_REBATE_LIMIT = 500000;

// Section 80C limit
export const SECTION_80C_LIMIT = 150000;

// Section 80D limits
export const SECTION_80D_SELF_LIMIT = 25000;
export const SECTION_80D_SELF_SENIOR_LIMIT = 50000;
export const SECTION_80D_PARENTS_LIMIT = 25000;
export const SECTION_80D_PARENTS_SENIOR_LIMIT = 50000;

// NPS 80CCD(1B) additional deduction
export const NPS_80CCD_1B_LIMIT = 50000;

// Home loan interest deduction u/s 24(b)
export const HOME_LOAN_INTEREST_LIMIT = 200000;

// Surcharge slabs (on income, not tax)
export interface SurchargeSlab {
  from: number;
  to: number;
  rate: number;
}

export const SURCHARGE_SLABS: SurchargeSlab[] = [
  { from: 0, to: 5000000, rate: 0 },
  { from: 5000001, to: 10000000, rate: 0.10 },
  { from: 10000001, to: 20000000, rate: 0.15 },
  { from: 20000001, to: 50000000, rate: 0.25 },
  { from: 50000001, to: Infinity, rate: 0.37 },
];

// New regime caps surcharge at 25%
export const NEW_REGIME_MAX_SURCHARGE_RATE = 0.25;

// Health & Education Cess
export const CESS_RATE = 0.04;
