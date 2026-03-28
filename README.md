# TaxSense

**Free, privacy-first Indian tax and finance platform.** Calculate income tax, plan deductions, compare investments, and file ITR with confidence. All calculations run entirely in your browser -- zero data is sent to any server.

**Live:** [taxsense-self.vercel.app](https://taxsense-self.vercel.app)

---

## Features

### 1. Tax Calculator
Side-by-side Old vs New regime comparison. Supports multiple income sources (salary, house property, capital gains, other sources) and all major deductions. Shows slab-wise breakdown, surcharge, cess, effective tax rate, monthly take-home, and a clear recommendation on which regime saves more.

### 2. Savings Planner
Comprehensive deduction optimizer covering Sections 80C, 80D, 80E, 80G, 80CCD(1B), 80CCD(2), 80TTA, 80GG, and Section 24(b). Visual progress bars show utilization against each section's limit. Generates personalized optimization suggestions and a monthly investment target to maximize tax savings.

### 3. ITR Filing Guide
Step-by-step companion for filing your Income Tax Return. Walks through the entire process from gathering documents to submission.

### 4. HRA Calculator
Calculates House Rent Allowance exemption under Section 10(13A). Computes the minimum of actual HRA received, rent paid minus 10% of salary, and 50%/40% of salary (metro/non-metro). Shows which rule applies and the resulting taxable HRA.

### 5. Capital Gains Calculator
STCG and LTCG tax on listed equity, equity mutual funds, debt mutual funds, real estate, and gold. Includes Cost Inflation Index (CII) based indexation from FY 2001-02 to FY 2026-27, Section 112A exemption for equity (Rs 1.25L), and a quick-reference table of all capital gains tax rates.

### 6. GST Calculator
Inclusive and exclusive GST calculation across all four slabs (5%, 12%, 18%, 28%). Splits into CGST + SGST for intra-state and IGST for inter-state transactions. Includes common examples for each slab.

### 7. Advance Tax Calculator
Calculates quarterly advance tax installments (15%, 30%, 30%, 25%) with FY 2025-26 due dates. Shows whether advance tax is applicable (Rs 10,000 threshold), factors in TDS already deducted, and flags overdue installments with Section 234B/234C interest warnings.

### 8. TDS Calculator
TDS rates and thresholds for 8 income categories: salary (Sec 192), FD interest (194A), rent (194-IB), professional fees (194J), commission (194H), dividends (194), EPF withdrawal (192A), and property sale (194-IA). Handles PAN vs no-PAN scenarios with higher TDS rates.

### 9. Investment Comparison Tool
Compare FD, PPF, ELSS, NPS, and equity mutual funds side by side. Factors in lock-in periods, risk levels, Section 80C/80CCD(1B) tax benefits, and post-tax returns at your slab rate. Includes a visual bar chart, year-by-year growth table, and detailed investment cards.

---

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Fully client-side** -- no backend, no API calls, no database

---

## Tax Rules Covered (FY 2025-26)

### New Regime Tax Slabs (Default)
| Income Slab | Rate |
|---|---|
| Up to Rs 4,00,000 | Nil |
| Rs 4,00,001 -- Rs 8,00,000 | 5% |
| Rs 8,00,001 -- Rs 12,00,000 | 10% |
| Rs 12,00,001 -- Rs 16,00,000 | 15% |
| Rs 16,00,001 -- Rs 20,00,000 | 20% |
| Rs 20,00,001 -- Rs 24,00,000 | 25% |
| Above Rs 24,00,000 | 30% |

### Old Regime Tax Slabs
| Income Slab | Rate |
|---|---|
| Up to Rs 2,50,000 | Nil |
| Rs 2,50,001 -- Rs 5,00,000 | 5% |
| Rs 5,00,001 -- Rs 10,00,000 | 20% |
| Above Rs 10,00,000 | 30% |

### Key Provisions
- **Standard Deduction:** Rs 75,000 (new regime), Rs 50,000 (old regime)
- **Rebate u/s 87A:** Full rebate for taxable income up to Rs 12,00,000 (new) / Rs 5,00,000 (old)
- **Section 80C:** Up to Rs 1,50,000 (EPF, PPF, ELSS, LIC, NSC, etc.)
- **Section 80D:** Rs 25,000 self/family + Rs 25,000 parents (Rs 50,000 for senior citizens)
- **Section 80CCD(1B):** Additional Rs 50,000 for NPS
- **Section 24(b):** Home loan interest up to Rs 2,00,000
- **Surcharge:** 10% to 37% based on income; capped at 25% under new regime
- **Health & Education Cess:** 4% on tax + surcharge
- **Capital Gains:** LTCG at 12.5% on equity/property/gold; STCG at 20% on equity, slab rate on others

---

## Privacy

TaxSense runs entirely in the browser. Your financial data never leaves your device.

- No server-side processing
- No user accounts or sign-up
- No cookies, analytics, or tracking
- No data storage of any kind

---

## Setup & Development

```bash
# Clone the repository
git clone https://github.com/your-username/taxsense.git
cd taxsense

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app runs at `http://localhost:3000` by default.

---

## Deployment

The app is deployed on **Vercel** with auto-deploy from the `main` branch. Every push to `main` triggers a production build.

**Live URL:** [https://taxsense-self.vercel.app](https://taxsense-self.vercel.app)

---

## License

MIT
