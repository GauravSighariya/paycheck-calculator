import Link from "next/link";
import PaycheckCalculator from "@/components/PaycheckCalculator";
import { STATES } from "@/lib/states";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Take-Home Pay Calculator
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Find out exactly how much of your paycheck you keep after federal, state, Social Security, and Medicare
          taxes. Updated for the 2025 tax year.
        </p>
      </section>

      <PaycheckCalculator initialStateSlug="texas" />

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Paycheck calculators by state</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.values(STATES)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
            >
              {s.name} paycheck calculator →
            </Link>
            ))}
        </div>
      </section>

      <section className="max-w-none">
        <h2 className="text-xl font-semibold text-slate-900">How take-home pay is calculated</h2>
        <p className="mt-2 text-slate-600">
          Your take-home (net) pay is your gross pay minus taxes and pre-tax deductions. The biggest pieces are
          federal income tax (a progressive bracket system), Social Security (6.2% up to the annual wage base),
          Medicare (1.45%), and — depending on where you live — state income tax. Pre-tax contributions like a
          traditional 401(k) lower your income tax but not Social Security and Medicare.
        </p>
      </section>
    </div>
  );
}
