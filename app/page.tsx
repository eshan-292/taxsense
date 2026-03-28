import Link from "next/link";

// Only the tools that matter for a salaried Indian
const tools = [
  {
    title: "HRA Calculator",
    desc: "Section 10(13A) exemption",
    href: "/hra-calculator",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Capital Gains",
    desc: "STCG & LTCG on stocks, MF",
    href: "/capital-gains",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: "text-accent-green",
    bg: "bg-accent-green/10",
  },
  {
    title: "Savings Planner",
    desc: "Maximize 80C, 80D, NPS",
    href: "/planner",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-accent-amber",
    bg: "bg-accent-amber/10",
  },
  {
    title: "Filing Guide",
    desc: "Step-by-step ITR help",
    href: "/filing",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

// Tax deadlines — show next 3 upcoming ones
const TAX_DATES = [
  { date: new Date("2026-03-31"), label: "FY ends", sublabel: "Last day for 80C investments", urgent: true },
  { date: new Date("2026-06-15"), label: "Advance Tax Q1", sublabel: "FY 2026-27 first instalment" },
  { date: new Date("2026-07-31"), label: "ITR Deadline", sublabel: "Filing FY 2025-26 returns" },
  { date: new Date("2026-09-15"), label: "Advance Tax Q2", sublabel: "Second instalment due" },
  { date: new Date("2026-12-15"), label: "Advance Tax Q3", sublabel: "Third instalment due" },
  { date: new Date("2027-03-15"), label: "Advance Tax Q4", sublabel: "Final instalment due" },
];

function getDaysLeft(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const upcoming = TAX_DATES.filter((d) => getDaysLeft(d.date) >= 0).slice(0, 2);

  return (
    <div className="bg-gradient-mesh min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-lg px-4 pb-8 pt-12 text-center sm:pt-16">
        <div className="mb-3 inline-block rounded-full border border-accent-indigo/20 bg-accent-indigo/10 px-3 py-1 text-xs font-medium text-accent-indigo">
          FY 2025-26 · Free · No sign-up
        </div>
        <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          Know your tax.{" "}
          <span className="gradient-text">Save more.</span>
        </h1>
        <p className="mb-6 text-sm text-muted">
          Indian tax toolkit — all calculations stay on your device.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
        >
          Calculate my tax
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      {/* Tax calendar strip */}
      {upcoming.length > 0 && (
        <section className="mx-auto max-w-lg px-4 pb-6">
          <div className="space-y-2">
            {upcoming.map((item) => {
              const days = getDaysLeft(item.date);
              const isUrgent = days <= 7 || item.urgent;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    isUrgent
                      ? "border-accent-red/20 bg-accent-red/5"
                      : "border-card-border bg-card/40"
                  }`}
                >
                  <div className={`text-center min-w-[40px] ${isUrgent ? "text-accent-red" : "text-accent-amber"}`}>
                    <div className="text-xl font-bold leading-none">{days}</div>
                    <div className="text-[9px] font-medium uppercase tracking-wider opacity-70">days</div>
                  </div>
                  <div className="w-px self-stretch bg-card-border" />
                  <div>
                    <p className={`text-sm font-semibold ${isUrgent ? "text-accent-red" : "text-foreground"}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-muted">{item.sublabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Other tools */}
      <section className="mx-auto max-w-lg px-4 pb-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/50">More tools</p>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center gap-3 rounded-2xl border border-card-border bg-card/60 p-4 transition-all hover:border-accent-indigo/20 hover:bg-card active:scale-95"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tool.bg} ${tool.color}`}>
                {tool.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{tool.title}</p>
                <p className="text-xs text-muted leading-tight mt-0.5">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
