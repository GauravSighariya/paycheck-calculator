import type { Metadata } from "next";
import Link from "next/link";
import OvertimeCalculator from "@/components/OvertimeCalculator";
import { SITE_URL } from "@/lib/site";
import { EXTRA_TOOLS } from "@/lib/tools";

const TITLE = "Overtime Pay Calculator — Time-and-a-Half Pay (2025)";
const DESC =
  "Calculate your overtime pay with time-and-a-half or double time. See your weekly gross, overtime premium, annual total, and estimated take-home pay.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/overtime-pay-calculator" },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/overtime-pay-calculator`, siteName: "MyNetPaycheck", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const faq = [
  {
    q: "How is overtime pay calculated?",
    a: "Under the federal Fair Labor Standards Act (FLSA), non-exempt employees must be paid at least 1.5× their regular hourly rate for hours worked over 40 in a workweek. So if you earn $25/hour, your overtime rate is $37.50/hour.",
  },
  {
    q: "What is time-and-a-half?",
    a: "Time-and-a-half means 1.5 times your normal hourly wage. Some employers or contracts pay double time (2×) for holidays or excessive hours, but 1.5× is the federal minimum for qualifying overtime.",
  },
  {
    q: "Is overtime taxed more than regular pay?",
    a: "No — overtime is taxed at the same rates as your other income. It can push more of your income into a higher bracket, but only the dollars above each threshold are taxed at the higher rate.",
  },
];

export default function OvertimePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", name: "Overtime Pay Calculator", url: `${SITE_URL}/overtime-pay-calculator`, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Overtime Pay Calculator", item: `${SITE_URL}/overtime-pay-calculator` },
      ] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section>
        <nav className="mb-3 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> / <span className="text-slate-700">Overtime Pay Calculator</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Overtime Pay Calculator</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Working extra hours? Calculate your time-and-a-half (or double-time) overtime pay, your total weekly gross,
          and an estimate of what you&apos;ll take home after taxes.
        </p>
      </section>

      <OvertimeCalculator />

      <section>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">How overtime pay works</h2>
        <p className="text-slate-600">
          For most hourly (non-exempt) workers in the U.S., the federal FLSA requires overtime of at least 1.5× the
          regular rate for hours beyond 40 in a workweek. Your overtime rate is your hourly wage multiplied by 1.5 (or
          2× for double time). Total weekly pay is your regular hours at your normal rate plus your overtime hours at the
          overtime rate. Overtime earnings are taxed like any other wages.
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
          {EXTRA_TOOLS.filter((t) => t.slug !== "overtime-pay-calculator").map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700">{t.name} →</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
