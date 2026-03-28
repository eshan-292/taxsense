import SavingsOptimizer from "@/components/SavingsOptimizer";

export default function PlannerPage() {
  return (
    <div className="bg-gradient-mesh min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            Tax Savings Planner
          </h1>
          <p className="text-muted">
            Track your 80C, 80D, NPS, 80E, 80G, and other investments. Find how
            much more you can save under the Old Tax Regime.
          </p>
        </div>

        <SavingsOptimizer />
      </div>
    </div>
  );
}
