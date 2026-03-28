import Link from "next/link";

const features = [
  {
    title: "Tax Calculator",
    description: "Old vs New regime comparison in seconds",
    href: "/calculator",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    gradient: "from-accent-indigo to-accent-purple",
  },
  {
    title: "Filing Guide",
    description: "Step-by-step ITR filing companion",
    href: "/filing",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    gradient: "from-accent-green to-emerald-400",
  },
  {
    title: "Savings Planner",
    description: "Maximize your 80C and 80D deductions",
    href: "/planner",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    gradient: "from-accent-amber to-orange-400",
  },
];

export default function Home() {
  return (
    <div className="bg-gradient-mesh">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-block rounded-full border border-accent-indigo/20 bg-accent-indigo/10 px-4 py-1.5 text-sm font-medium text-accent-indigo">
            FY 2025-26 &middot; Free &middot; No Sign-up
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Know Your Tax.{" "}
            <span className="gradient-text">Save More.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted sm:text-xl">
            Free tax calculator for salaried Indians. Compare old vs new regime
            in 30 seconds.
          </p>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
          >
            Calculate Now
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <div className="glass-card h-full p-6 transition-all group-hover:border-accent-indigo/20 group-hover:shadow-lg">
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 text-white`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tax slabs preview */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="glass-card overflow-hidden p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            FY 2025-26 New Regime Tax Slabs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left">
                  <th className="pb-3 pr-4 font-medium text-muted">
                    Income Slab
                  </th>
                  <th className="pb-3 font-medium text-muted">Tax Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {[
                  { slab: "Up to \u20B94,00,000", rate: "Nil" },
                  {
                    slab: "\u20B94,00,001 - \u20B98,00,000",
                    rate: "5%",
                  },
                  {
                    slab: "\u20B98,00,001 - \u20B912,00,000",
                    rate: "10%",
                  },
                  {
                    slab: "\u20B912,00,001 - \u20B916,00,000",
                    rate: "15%",
                  },
                  {
                    slab: "\u20B916,00,001 - \u20B920,00,000",
                    rate: "20%",
                  },
                  {
                    slab: "\u20B920,00,001 - \u20B924,00,000",
                    rate: "25%",
                  },
                  { slab: "Above \u20B924,00,000", rate: "30%" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 text-foreground">{row.slab}</td>
                    <td className="py-3 font-mono font-medium text-accent-indigo">
                      {row.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">
            Standard deduction: &#x20B9;75,000 &middot; Rebate u/s 87A for
            income up to &#x20B9;12,00,000 (effective &#x20B9;12,75,000 with
            std deduction)
          </p>
        </div>
      </section>
    </div>
  );
}
