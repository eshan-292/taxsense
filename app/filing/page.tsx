"use client";

import { useState } from "react";

interface Step {
  title: string;
  content: React.ReactNode;
}

function ChecklistItem({
  text,
  checked,
  onToggle,
}: {
  text: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-background/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 rounded accent-accent-indigo"
      />
      <span
        className={`text-sm ${checked ? "text-muted line-through" : "text-foreground"}`}
      >
        {text}
      </span>
    </label>
  );
}

function ITRFormSelector() {
  const [answers, setAnswers] = useState({
    salaryOnly: true,
    capitalGains: false,
    multipleHouseProperty: false,
    foreignAssets: false,
    businessIncome: false,
  });

  let recommendedForm = "ITR-1 (Sahaj)";
  let reason =
    "You have salary income with no capital gains or foreign assets.";

  if (
    answers.businessIncome
  ) {
    recommendedForm = "ITR-3";
    reason = "You have business/professional income.";
  } else if (
    answers.foreignAssets ||
    answers.capitalGains ||
    answers.multipleHouseProperty
  ) {
    recommendedForm = "ITR-2";
    reason =
      "You have capital gains, foreign assets, or multiple house properties.";
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Answer these questions to find the right ITR form:
      </p>
      {[
        {
          key: "salaryOnly" as const,
          label: "Is salary your primary income source?",
        },
        {
          key: "capitalGains" as const,
          label: "Do you have capital gains (stocks, mutual funds, property)?",
        },
        {
          key: "multipleHouseProperty" as const,
          label: "Do you own more than one house property?",
        },
        {
          key: "foreignAssets" as const,
          label: "Do you have foreign assets or income?",
        },
        {
          key: "businessIncome" as const,
          label: "Do you have business or professional income?",
        },
      ].map((q) => (
        <label
          key={q.key}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-card-border bg-background/30 p-3 transition-colors hover:border-accent-indigo/30"
        >
          <input
            type="checkbox"
            checked={answers[q.key]}
            onChange={() =>
              setAnswers((prev) => ({ ...prev, [q.key]: !prev[q.key] }))
            }
            className="h-4 w-4 rounded accent-accent-indigo"
          />
          <span className="text-sm text-foreground">{q.label}</span>
        </label>
      ))}
      <div className="rounded-xl border border-accent-indigo/20 bg-accent-indigo/5 p-4">
        <p className="text-sm text-muted">Recommended form:</p>
        <p className="text-lg font-semibold text-accent-indigo">
          {recommendedForm}
        </p>
        <p className="mt-1 text-sm text-muted">{reason}</p>
      </div>
    </div>
  );
}

export default function FilingPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [activeStep, setActiveStep] = useState(0);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const steps: Step[] = [
    {
      title: "1. Choose Your ITR Form",
      content: <ITRFormSelector />,
    },
    {
      title: "2. Gather Documents",
      content: (
        <div className="space-y-1">
          <p className="mb-3 text-sm text-muted">
            Collect these before starting your ITR filing:
          </p>
          {[
            "PAN Card",
            "Aadhaar Card (linked with PAN)",
            "Form 16 from employer",
            "Form 26AS (Tax Credit Statement) - download from TRACES",
            "AIS (Annual Information Statement) - download from income tax portal",
            "Bank statements (all accounts)",
            "Interest certificates from banks/post office",
            "Investment proofs: PPF passbook, ELSS statements, LIC receipts",
            "Health insurance premium receipts (80D)",
            "Home loan interest certificate (if applicable)",
            "Rent receipts + landlord PAN (if HRA claimed, rent > 1L/year)",
            "Capital gains statements from brokers (if applicable)",
          ].map((doc) => (
            <ChecklistItem
              key={doc}
              text={doc}
              checked={!!checklist[doc]}
              onToggle={() => toggleCheck(doc)}
            />
          ))}
        </div>
      ),
    },
    {
      title: "3. Verify Form 26AS & AIS",
      content: (
        <div className="space-y-4 text-sm text-muted">
          <p>
            Before filing, cross-check your Form 26AS and AIS to ensure all TDS
            credits and income entries are correct.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-card-border bg-background/30 p-3">
              <p className="font-medium text-foreground">Form 26AS</p>
              <p>
                Shows TDS deducted by employer, bank, etc. Verify that TDS
                amounts match your Form 16 and bank certificates.
              </p>
            </div>
            <div className="rounded-lg border border-card-border bg-background/30 p-3">
              <p className="font-medium text-foreground">
                AIS (Annual Information Statement)
              </p>
              <p>
                Shows all financial transactions: salary, interest, dividends,
                share trading, mutual fund transactions, etc. Report any
                discrepancies.
              </p>
            </div>
          </div>
          <p>
            Login to{" "}
            <a
              href="https://www.incometax.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-indigo underline"
            >
              incometax.gov.in
            </a>{" "}
            to download both.
          </p>
        </div>
      ),
    },
    {
      title: "4. File on Income Tax Portal",
      content: (
        <div className="space-y-4 text-sm text-muted">
          <ol className="list-inside list-decimal space-y-3">
            <li>
              Login to{" "}
              <a
                href="https://www.incometax.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-indigo underline"
              >
                incometax.gov.in
              </a>
            </li>
            <li>
              Go to <strong className="text-foreground">e-File</strong> &rarr;{" "}
              <strong className="text-foreground">
                Income Tax Returns
              </strong>{" "}
              &rarr;{" "}
              <strong className="text-foreground">File Income Tax Return</strong>
            </li>
            <li>Select Assessment Year (AY 2026-27 for FY 2025-26)</li>
            <li>Choose filing mode: Online (recommended for salaried)</li>
            <li>Select the ITR form recommended above</li>
            <li>
              Choose tax regime: <strong className="text-foreground">Old</strong>{" "}
              or <strong className="text-foreground">New</strong> (use our
              calculator to decide)
            </li>
            <li>Fill in salary details from Form 16</li>
            <li>Add deductions (80C, 80D, HRA, etc.) if using Old Regime</li>
            <li>Verify pre-filled data matches your records</li>
            <li>Compute tax and check for refund or balance due</li>
            <li>Submit and e-verify using Aadhaar OTP (fastest method)</li>
          </ol>
        </div>
      ),
    },
    {
      title: "5. Key Dates & Deadlines",
      content: (
        <div className="space-y-3">
          {[
            {
              date: "31 July 2026",
              event: "ITR filing deadline for salaried individuals (no audit)",
              important: true,
            },
            {
              date: "31 October 2026",
              event: "ITR deadline for cases requiring audit",
              important: false,
            },
            {
              date: "31 December 2026",
              event: "Belated/Revised return deadline",
              important: false,
            },
            {
              date: "31 March 2026",
              event:
                "Last date to make 80C/80D investments for FY 2025-26",
              important: true,
            },
            {
              date: "15 June / Sep / Dec / Mar",
              event: "Advance tax installment dates (if tax > \u20B910,000)",
              important: false,
            },
          ].map((d, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 rounded-lg border p-3 ${
                d.important
                  ? "border-accent-amber/30 bg-accent-amber/5"
                  : "border-card-border bg-background/30"
              }`}
            >
              <div className="shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    d.important ? "text-accent-amber" : "text-accent-indigo"
                  }`}
                >
                  {d.date}
                </span>
              </div>
              <p className="text-sm text-muted">{d.event}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "6. Common Mistakes to Avoid",
      content: (
        <div className="space-y-3">
          {[
            {
              mistake: "Not verifying Form 26AS",
              fix: "Always cross-check TDS credits before filing. Mismatches lead to notices.",
            },
            {
              mistake: "Forgetting to report all bank accounts",
              fix: "Report interest from all savings accounts. The IT dept knows about them via AIS.",
            },
            {
              mistake: "Claiming HRA without rent receipts",
              fix: "Keep rent receipts and landlord PAN (mandatory if rent > \u20B91,00,000/year).",
            },
            {
              mistake: "Not choosing the right regime",
              fix: "Use our calculator to compare. Once you choose New Regime as default, you cannot switch mid-year for salaried.",
            },
            {
              mistake: "Not disclosing capital gains",
              fix: "Even LTCG on equity (above \u20B91.25L exemption) must be reported. AIS shows your trades.",
            },
            {
              mistake: "Filing wrong ITR form",
              fix: "ITR-1 is only for salary + one house + interest income (up to \u20B950L). Use ITR-2 for capital gains.",
            },
            {
              mistake: "Missing the e-verification step",
              fix: "ITR is not valid until e-verified. Use Aadhaar OTP within 30 days of filing.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-card-border bg-background/30 p-3"
            >
              <p className="text-sm font-medium text-accent-red">
                {item.mistake}
              </p>
              <p className="mt-1 text-sm text-muted">{item.fix}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            ITR Filing Guide
          </h1>
          <p className="text-muted">
            Step-by-step companion for filing your Income Tax Return. FY 2025-26
            (AY 2026-27).
          </p>
        </div>

        {/* Step navigation */}
        <div className="mb-8 flex flex-wrap gap-2">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeStep === i
                  ? "bg-accent-indigo/15 text-accent-indigo"
                  : "text-muted hover:bg-background/50 hover:text-foreground"
              }`}
            >
              Step {i + 1}
            </button>
          ))}
        </div>

        {/* Active step content */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            {steps[activeStep].title}
          </h2>
          {steps[activeStep].content}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))
            }
            disabled={activeStep === steps.length - 1}
            className="rounded-lg bg-accent-indigo px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-indigo/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
