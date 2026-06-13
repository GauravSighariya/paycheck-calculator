import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PaycheckCalculator from "@/components/PaycheckCalculator";
import { STATES, STATE_SLUGS, getState } from "@/lib/states";

type Props = { params: Promise<{ state: string }> };

export function generateStaticParams() {
  return STATE_SLUGS.map((state) => ({ state }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const info = getState(state);
  if (!info) return {};
  return {
    title: `${info.name} Paycheck Calculator — Take-Home Pay After Taxes (2025)`,
    description: `Calculate your ${info.name} take-home pay for 2025. See your net paycheck after federal income tax, ${info.hasIncomeTax ? `${info.name} state tax, ` : ""}Social Security, and Medicare — by salary and filing status.`,
    alternates: { canonical: `/${info.slug}` },
  };
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const info = getState(state);
  if (!info) notFound();

  const faq = [
    {
      q: `Does ${info.name} have a state income tax?`,
      a: info.hasIncomeTax
        ? `Yes. ${info.name} levies a progressive state income tax, which is withheld from your paycheck in addition to federal income tax, Social Security, and Medicare.`
        : `No. ${info.name} has no state income tax, so only federal income tax, Social Security, and Medicare are withheld from your paycheck.`,
    },
    {
      q: `How much is taken out of a paycheck in ${info.name}?`,
      a: `Every paycheck has Social Security (6.2%) and Medicare (1.45%) withheld, plus federal income tax based on your bracket${info.hasIncomeTax ? ` and ${info.name} state income tax` : ""}. Enter your salary above to see the exact breakdown.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${info.name} Paycheck Calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const otherStates = Object.values(STATES)
    .filter((s) => s.slug !== info.slug)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section>
        <nav className="mb-3 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>{" "}
          / <span className="text-slate-700">{info.name}</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {info.name} Paycheck Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">{info.intro}</p>
      </section>

      <PaycheckCalculator initialStateSlug={info.slug} />

      <section>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          How taxes work on a {info.name} paycheck
        </h2>
        <ul className="list-inside list-disc space-y-1 text-slate-600">
          {info.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
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
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Other state paycheck calculators</h2>
        <div className="flex flex-wrap gap-3">
          {otherStates.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              {s.name} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
