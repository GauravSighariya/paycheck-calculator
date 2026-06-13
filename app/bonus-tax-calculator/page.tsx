import type { Metadata } from "next";
import Link from "next/link";
import BonusCalculator from "@/components/BonusCalculator";
import { SITE_URL } from "@/lib/site";
import { EXTRA_TOOLS } from "@/lib/tools";

const TITLE = "Bonus Tax Calculator — How Much Is My Bonus Taxed? (2025)";
const DESC =
  "Find out how much of your bonus you keep after taxes in 2025. Calculate federal, state, Social Security, and Medicare tax on your bonus by salary, state, and filing status.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/bonus-tax-calculator" },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/bonus-tax-calculator`, siteName: "MyNetPaycheck", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const faq = [
  {
    q: "How much is a bonus taxed in 2025?",
    a: "For federal withholding, employers usually treat a bonus as supplemental income and withhold a flat 22% (37% on amounts over $1 million). Social Security (6.2%) and Medicare (1.45%) also apply, plus any state income tax. Your actual tax depends on your marginal bracket — the calculator above shows what you really keep.",
  },
  {
    q: "Why was my bonus taxed at 40%?",
    a: "It usually wasn't taxed that much — it was withheld at a higher rate. The flat 22% federal withholding plus Social Security, Medicare, and state withholding can feel like a big bite, but if your true marginal rate is lower, you get the difference back when you file your return.",
  },
  {
    q: "Is a bonus taxed higher than regular pay?",
    a: "No. A bonus is ultimately taxed at the same rates as the rest of your income. It can be withheld at a flat supplemental rate, which sometimes differs from your normal paycheck withholding, but it's reconciled at tax time.",
  },
];

export default function BonusPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: "Bonus Tax Calculator", url: `${SITE_URL}/bonus-tax-calculator`, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Bonus Tax Calculator", item: `${SITE_URL}/bonus-tax-calculator` },
      ] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section>
        <nav className="mb-3 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> / <span className="text-slate-700">Bonus Tax Calculator</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Bonus Tax Calculator</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Getting a bonus? See how much you&apos;ll actually take home after federal, state, Social Security, and Medicare
          taxes — based on your salary, state, and filing status, for the 2025 tax year.
        </p>
      </section>

      <BonusCalculator />

      <section>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">How bonuses are taxed</h2>
        <p className="text-slate-600">
          The IRS treats bonuses as &quot;supplemental wages.&quot; Most employers withhold federal tax on them at a flat
          <strong> 22%</strong> (the percentage method), rather than at your regular paycheck rate. Social Security and
          Medicare still apply, and so does state income tax in most states. Because that flat withholding may be higher
          or lower than your true marginal rate, your bonus is effectively &quot;trued up&quot; when you file your annual
          return — you may get part of the withholding back, or owe a little more.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Frequently asked questions</h2>
        <div className="space-y-4">
          {faq.map((f) => (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{f.q}</h3>
              <p className="mt-1 text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">More calculators</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700">Take-Home Pay Calculator →</Link>
          {EXTRA_TOOLS.filter((t) => t.slug !== "bonus-tax-calculator").map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700">{t.name} →</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
