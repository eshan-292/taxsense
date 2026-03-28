import Link from "next/link";

const tools = [
  {
    title: "Tax Calculator",
    href: "/calculator",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-accent-indigo",
    bg: "bg-accent-indigo/10",
    primary: true,
  },
  {
    title: "Savings Planner",
    href: "/planner",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-accent-amber",
    bg: "bg-accent-amber/10",
    primary: true,
  },
  {
    title: "HRA Calculator",
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
    title: "GST Calculator",
    href: "/gst-calculator",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    title: "Advance Tax",
    href: "/advance-tax",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    title: "TDS Calculator",
    href: "/tds-calculator",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    title: "Investments",
    href: "/compare-investments",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    title: "Filing Guide",
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

export default function Home() {
  return (
    <div className="bg-gradient-mesh min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-lg px-4 pb-10 pt-14 text-center sm:pt-20">
        <div className="mb-3 inline-block rounded-full border border-accent-indigo/20 bg-accent-indigo/10 px-3 py-1 text-xs font-medium text-accent-indigo">
          FY 2025-26 · Free · No sign-up
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          Know your tax.{" "}
          <span className="gradient-text">Save more.</span>
        </h1>
        <p className="mb-6 text-sm text-muted">
          Indian tax toolkit — income tax, HRA, capital gains, GST & more. All calculations stay on your device.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90"
        >
          Calculate my tax
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      {/* Tools grid */}
      <section className="mx-auto max-w-lg px-4 pb-16">
        <div className="grid grid-cols-3 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-card-border bg-card/60 p-4 text-center transition-all hover:border-accent-indigo/20 hover:bg-card active:scale-95"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tool.bg} ${tool.color} transition-transform group-hover:scale-110`}>
                {tool.icon}
              </div>
              <span className="text-xs font-medium leading-tight text-foreground">
                {tool.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
