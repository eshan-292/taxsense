"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupee } from "@/lib/utils";

interface ParsedForm16 {
  grossSalary: number;
  hra: number;
  lta: number;
  otherExemptions: number;
  section80C: number;
  section80D_self: number;
  section80D_parents: number;
  homeLoanInterest: number;
  nps80CCD1B: number;
  section80E: number;
  section80G: number;
  totalTDS: number;
}

function parseAmount(str: string): number {
  return parseInt(str.replace(/[,\s]/g, ""), 10) || 0;
}

function findAmount(text: string, patterns: RegExp[]): number {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amt = parseAmount(match[1]);
      if (amt > 0) return amt;
    }
  }
  return 0;
}

function parseForm16Text(raw: string): ParsedForm16 {
  // Normalize: remove extra whitespace, lowercase for matching
  const text = raw.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");
  const lower = text.toLowerCase();

  // Gross salary patterns
  const grossSalary = findAmount(text, [
    /gross\s+salary[^\d]*?([\d,]+)/i,
    /salary\s+as\s+per\s+provisions[^\d]*?([\d,]+)/i,
    /value\s+of\s+perquisites[^\d]*?(?:aggregate\s+of)?[^\d]*?([\d,]+)/i,
    /(?:total|gross)\s+(?:salary|income)[^\d]*?([\d,]+)/i,
    /1\s*[\.\)]\s*gross\s+salary[^\d]*?([\d,]+)/i,
  ]);

  // HRA
  const hra = findAmount(text, [
    /house\s+rent\s+allowance[^\d]*?([\d,]+)/i,
    /hra\s+exemption[^\d]*?([\d,]+)/i,
    /exempt\s+u\/s\s+10[^\d]*?hra[^\d]*?([\d,]+)/i,
    /(?:hra|house\s+rent)[^\d]*?([\d,]+)/i,
  ]);

  // LTA
  const lta = findAmount(text, [
    /leave\s+travel\s+(?:allowance|concession)[^\d]*?([\d,]+)/i,
    /lta[^\d]*?([\d,]+)/i,
    /ltc[^\d]*?([\d,]+)/i,
  ]);

  // Section 80C
  const section80C = findAmount(text, [
    /(?:gross\s+amount\s+)?(?:deductible\s+)?(?:under\s+)?section\s+80c[^\d]*?([\d,]+)/i,
    /80\s*c\s*(?:\(total\)|deductions?)?[^\d]*?([\d,]+)/i,
    /(?:epf|pf|ppf|elss|lic)[^\d]*?([\d,]+)/i,
  ]);

  // Section 80D
  const section80D_self = findAmount(text, [
    /80d[^\d]*?(?:self|family)[^\d]*?([\d,]+)/i,
    /mediclaim[^\d]*?([\d,]+)/i,
    /health\s+insurance[^\d]*?([\d,]+)/i,
  ]);

  const section80D_parents = findAmount(text, [
    /80d[^\d]*?parent[^\d]*?([\d,]+)/i,
    /parents?\s+(?:health|mediclaim)[^\d]*?([\d,]+)/i,
  ]);

  // Home loan interest 24(b)
  const homeLoanInterest = findAmount(text, [
    /(?:interest\s+on\s+)?(?:home|housing)\s+loan[^\d]*?([\d,]+)/i,
    /section\s+24[^\d]*?([\d,]+)/i,
    /24\s*[\(\)b]+[^\d]*?([\d,]+)/i,
    /loss\s+from\s+house\s+property[^\d]*?([\d,]+)/i,
  ]);

  // NPS 80CCD(1B)
  const nps80CCD1B = findAmount(text, [
    /80ccd\s*[\(]?\s*1b\s*[\)]?[^\d]*?([\d,]+)/i,
    /nps[^\d]*?([\d,]+)/i,
    /national\s+pension[^\d]*?([\d,]+)/i,
  ]);

  // 80E education loan
  const section80E = findAmount(text, [
    /80e[^\d]*?([\d,]+)/i,
    /education\s+loan[^\d]*?([\d,]+)/i,
  ]);

  // 80G donations
  const section80G = findAmount(text, [
    /80g[^\d]*?([\d,]+)/i,
    /donation[^\d]*?([\d,]+)/i,
  ]);

  // TDS paid
  const totalTDS = findAmount(text, [
    /(?:total\s+)?tax\s+deducted\s+at\s+source[^\d]*?([\d,]+)/i,
    /tds\s+(?:deducted|paid)[^\d]*?([\d,]+)/i,
    /(?:total|net)\s+tds[^\d]*?([\d,]+)/i,
    /tax\s+deducted[^\d]*?([\d,]+)/i,
  ]);

  const otherExemptions = findAmount(text, [
    /other\s+exemptions?[^\d]*?([\d,]+)/i,
    /other\s+allowances?[^\d]*?exempt[^\d]*?([\d,]+)/i,
  ]);

  return { grossSalary, hra, lta, otherExemptions, section80C, section80D_self, section80D_parents, homeLoanInterest, nps80CCD1B, section80E, section80G, totalTDS };
}

function FieldRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${highlight && value > 0 ? "bg-accent-green/5" : "bg-background/30"}`}>
      <span className="text-muted">{label}</span>
      <span className={`font-mono font-medium ${value > 0 && highlight ? "text-accent-green" : value > 0 ? "text-foreground" : "text-muted/40"}`}>
        {value > 0 ? formatRupee(value) : "—"}
      </span>
    </div>
  );
}

const SAMPLE_TEXT = `Gross Salary: 12,00,000
House Rent Allowance (HRA): 60,000
Leave Travel Allowance (LTA): 20,000

Section 80C (PF + PPF + ELSS): 1,50,000
80CCD(1B) NPS: 50,000
80D Self & Family: 25,000
80D Parents: 20,000
Interest on Home Loan Section 24(b): 1,50,000

Tax Deducted at Source (TDS): 85,000`;

export default function Form16Page() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedForm16 | null>(null);
  const [step, setStep] = useState<"input" | "review">("input");

  const handleParse = () => {
    if (!text.trim()) return;
    const result = parseForm16Text(text);
    setParsed(result);
    setStep("review");
  };

  const handleGoToCalculator = () => {
    if (!parsed) return;
    const p = new URLSearchParams();
    if (parsed.grossSalary) p.set("s", String(parsed.grossSalary));
    if (parsed.hra) p.set("hra", String(parsed.hra));
    if (parsed.section80C) p.set("c", String(parsed.section80C));
    if (parsed.section80D_self) p.set("ds", String(parsed.section80D_self));
    if (parsed.section80D_parents) p.set("dp", String(parsed.section80D_parents));
    if (parsed.homeLoanInterest) p.set("hl", String(parsed.homeLoanInterest));
    if (parsed.nps80CCD1B) p.set("nps", String(parsed.nps80CCD1B));
    if (parsed.section80E) p.set("e", String(parsed.section80E));
    if (parsed.section80G) p.set("g", String(parsed.section80G));
    router.push(`/calculator?${p.toString()}`);
  };

  const hasAnyData = parsed && (
    parsed.grossSalary > 0 || parsed.hra > 0 || parsed.section80C > 0
  );

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Form 16 Auto-Fill</h1>
          <p className="text-sm text-muted">Paste your Form 16 text · instantly fills the calculator</p>
        </div>

        {/* Privacy notice */}
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-accent-green/20 bg-accent-green/5 px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-xs text-accent-green">100% private — all parsing happens in your browser. Nothing is sent to any server.</p>
        </div>

        {step === "input" && (
          <>
            {/* How to guide */}
            <div className="mb-4 glass-card p-4">
              <p className="mb-2 text-sm font-semibold text-foreground">How to get your Form 16 text</p>
              <ol className="space-y-1.5 text-xs text-muted list-decimal list-inside">
                <li>Open your Form 16 PDF (Part B) in a browser or PDF viewer</li>
                <li>Press <kbd className="rounded border border-card-border bg-background/50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl+A</kbd> to select all, then <kbd className="rounded border border-card-border bg-background/50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl+C</kbd> to copy</li>
                <li>Paste below — we&apos;ll extract salary, deductions, and TDS automatically</li>
              </ol>
            </div>

            <div className="glass-card mb-4 p-4">
              <label className="mb-2 block text-xs font-medium text-muted">Paste Form 16 text (Part B preferred)</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={10}
                placeholder={SAMPLE_TEXT}
                className="w-full rounded-lg border border-card-border bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20 placeholder:text-muted/30 font-mono leading-relaxed resize-none"
              />
              <p className="mt-1.5 text-xs text-muted/60">Works with most digitally generated Form 16s. Scanned PDFs won&apos;t work (text not selectable).</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                Extract & Review
              </button>
              <button
                onClick={() => setText(SAMPLE_TEXT)}
                className="rounded-xl border border-card-border px-4 py-3 text-sm text-muted hover:text-foreground transition-colors"
              >
                Try sample
              </button>
            </div>
          </>
        )}

        {step === "review" && parsed && (
          <>
            <div className="mb-4 glass-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Extracted values</p>
                {hasAnyData ? (
                  <span className="rounded-full bg-accent-green/10 px-2.5 py-0.5 text-xs font-semibold text-accent-green">
                    {[parsed.grossSalary, parsed.hra, parsed.section80C, parsed.section80D_self, parsed.section80D_parents, parsed.homeLoanInterest, parsed.nps80CCD1B, parsed.section80E, parsed.section80G].filter(v => v > 0).length} fields found
                  </span>
                ) : (
                  <span className="rounded-full bg-accent-red/10 px-2.5 py-0.5 text-xs font-semibold text-accent-red">Nothing detected</span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted/50 pb-1">Income</p>
                <FieldRow label="Gross Salary" value={parsed.grossSalary} />
                <FieldRow label="HRA Exemption" value={parsed.hra} highlight />
                <FieldRow label="LTA Exemption" value={parsed.lta} highlight />
                <FieldRow label="Other Exemptions" value={parsed.otherExemptions} highlight />

                <p className="text-xs font-medium uppercase tracking-wider text-muted/50 pb-1 pt-3">Deductions</p>
                <FieldRow label="Section 80C" value={parsed.section80C} highlight />
                <FieldRow label="80CCD(1B) NPS" value={parsed.nps80CCD1B} highlight />
                <FieldRow label="80D Self & Family" value={parsed.section80D_self} highlight />
                <FieldRow label="80D Parents" value={parsed.section80D_parents} highlight />
                <FieldRow label="Home Loan Interest 24(b)" value={parsed.homeLoanInterest} highlight />
                <FieldRow label="80E Education Loan" value={parsed.section80E} highlight />
                <FieldRow label="80G Donations" value={parsed.section80G} highlight />

                <p className="text-xs font-medium uppercase tracking-wider text-muted/50 pb-1 pt-3">TDS</p>
                <FieldRow label="Total TDS Deducted" value={parsed.totalTDS} />
              </div>
            </div>

            {!hasAnyData && (
              <div className="mb-4 rounded-xl border border-accent-amber/20 bg-accent-amber/5 p-4">
                <p className="text-sm font-medium text-accent-amber mb-1">No data detected</p>
                <p className="text-xs text-muted">The text may be from a scanned/image-based PDF. Try copying from a digitally generated Form 16 or enter values manually in the calculator.</p>
              </div>
            )}

            <div className="flex gap-3">
              {hasAnyData && (
                <button
                  onClick={handleGoToCalculator}
                  className="flex-1 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
                >
                  Open in Calculator →
                </button>
              )}
              <button
                onClick={() => { setStep("input"); setParsed(null); }}
                className={`rounded-xl border border-card-border px-4 py-3 text-sm text-muted hover:text-foreground transition-colors ${!hasAnyData ? "flex-1" : ""}`}
              >
                Try again
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-muted/50">
              Review extracted values in the calculator and adjust if needed
            </p>
          </>
        )}
      </div>
    </div>
  );
}
