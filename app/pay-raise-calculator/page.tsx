import type { Metadata } from "next";
import Link from "next/link";
import RaiseCalculator from "@/components/RaiseCalculator";
import { SITE_URL } from "@/lib/site";
import { EXTRA_TOOLS } from "@/lib/tools";

const TITLE = "Pay Raise Calculator — How Much More After Taxes? (2025)";
const DESC =
  "See how a pay raise changes your take-home pay. Enter your salary and raise (percent or amount) to find your new net pay and how much of the raise you keep after taxes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/pay-raise-calculator" },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/pay-raise-calculator`, siteName: "MyNetPaycheck", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const faq = [
  {
    q: "How much of a raise do you actually keep?",
    a: "Because a raise is taxed at your marginal rate, you keep less than the full amount. Depending on your bracket and state, you typically take home roughly 60–75% of a raise after federal, state, Social Security, and Medicare taxes. The calculator above shows your exact figure.",
  },
  {
    q: "Will a raise put me in a higher tax bracket and cost me money?",
    a: "No. The U.S. uses marginal tax brackets, so only the income above each threshold is taxed at the higher rate. A raise always increases your take-home pay — you never lose money by earning more.",
  },
  {
    q: "How do I calculate a percentage raise?",
    a: "Multiply your current salary by the raise percentage. For example, a 5% raise on $75,000 is $3,750, making your new salary $78,750. This tool then estimates how much of that increase you keep after taxes.",
  },
];

export default function RaisePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: "Pay Raise Calculator", url: `${SITE_URL}/pay-raise-calculator`, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Pay Raise Calculator", item: `${SITE_URL}/pay-raise-calculator` },
      ] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section>
        <nav className="mb-3 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> / <span className="text-slate-700">Pay Raise Calculator</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Pay Raise Calculator</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Got a raise or negotiating one? See how much your take-home pay actually goes up after taxes — by percentage
          or dollar amount, for your state and filing status.
        </p>
      </section>

      <RaiseCalculator />

      <section>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">What a raise really adds</h2>
        <p className="text-slate-600">
          The sticker number on a raise is the gross increase, but taxes take a cut. Since extra income is taxed at your
          marginal rate, your take-home pay rises by less than the full raise — typically 60–75% of it. Importantly, a
          raise <strong>never</strong> reduces your overall take-home pay: the U.S. progressive system taxes only the
          dollars above each bracket threshold at the higher rate, so earning more always means keeping more.
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
          {EXTRA_TOOLS.filter((t) => t.slug !== "pay-raise-calculator").map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700">{t.name} →</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
