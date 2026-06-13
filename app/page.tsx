import Link from "next/link";
import PaycheckCalculator from "@/components/PaycheckCalculator";
import { STATES } from "@/lib/states";
import { SITE_URL, BRAND } from "@/lib/site";
import { EXTRA_TOOLS } from "@/lib/tools";

const FAQ = [
  {
    q: "How do I calculate my take-home pay?",
    a: "Start with your gross pay, then subtract federal income tax, Social Security (6.2%), Medicare (1.45%), and any state income tax. Pre-tax deductions such as a traditional 401(k) reduce your taxable income. This calculator does all of that automatically for the 2026 tax year — just enter your salary, state, and filing status.",
  },
  {
    q: "What is the difference between gross pay and net pay?",
    a: "Gross pay is your total earnings before any deductions. Net pay — also called take-home pay — is what actually lands in your bank account after taxes and pre-tax deductions are withheld.",
  },
  {
    q: "Which states have no income tax?",
    a: "Nine states have no state income tax on wages: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. In those states only federal income tax, Social Security, and Medicare are withheld.",
  },
  {
    q: "Does a 401(k) contribution increase my take-home pay?",
    a: "A traditional 401(k) lowers your taxable income, so it reduces your income tax — but the contribution still leaves your paycheck (it goes into your retirement account), and it does not reduce Social Security or Medicare taxes. Use the 401(k) slider above to see the effect on both your taxes and your take-home cash.",
  },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: BRAND,
        url: SITE_URL,
      },
      {
        "@type": "Organization",
        name: BRAND,
        url: SITE_URL,
      },
      {
        "@type": "WebApplication",
        name: "Take-Home Pay Calculator",
        url: SITE_URL,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Take-Home Pay Calculator</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Find out exactly how much of your paycheck you keep after federal, state, Social Security, and Medicare
          taxes. Updated for the 2026 tax year — for all 50 states and Washington, D.C.
        </p>
      </section>

      <PaycheckCalculator initialStateSlug="texas" />

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">More pay calculators</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXTRA_TOOLS.map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300"
            >
              <span className="font-semibold text-slate-900">{t.name}</span>
              <span className="mt-1 block text-sm text-slate-500">{t.short}</span>
            </Link>
          ))}
        </div>
      </section>

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

      <section>
        <h2 className="text-xl font-semibold text-slate-900">How take-home pay is calculated</h2>
        <p className="mt-2 text-slate-600">
          Your take-home (net) pay is your gross pay minus taxes and pre-tax deductions. The biggest pieces are federal
          income tax (a progressive bracket system), Social Security (6.2% up to the annual wage base), Medicare (1.45%),
          and — depending on where you live — state income tax. Pre-tax contributions like a traditional 401(k) lower
          your income tax but not Social Security and Medicare. This calculator applies the 2026 federal brackets and
          each state&apos;s current rates to estimate your net pay for any salary or hourly wage.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{f.q}</h3>
              <p className="mt-1 text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
