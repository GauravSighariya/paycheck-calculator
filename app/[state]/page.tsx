import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PaycheckCalculator from "@/components/PaycheckCalculator";
import { STATES, STATE_SLUGS, getState, rateSummary } from "@/lib/states";
import { computePaycheck, formatUSD, type Bracket } from "@/lib/tax";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ state: string }> };

export function generateStaticParams() {
  return STATE_SLUGS.map((state) => ({ state }));
}

export const dynamicParams = false;

const pct = (n: number) => `${Math.round(n * 1000) / 1000}%`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const info = getState(state);
  if (!info) return {};
  const title = `${info.name} Paycheck Calculator — Take-Home Pay After Taxes (2026)`;
  const description = `Calculate your ${info.name} take-home pay for 2026. See your net paycheck after federal income tax, ${info.hasIncomeTax ? `${info.name} state tax, ` : ""}Social Security, and Medicare — by salary and filing status.`;
  const url = `${SITE_URL}/${info.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/${info.slug}` },
    openGraph: { title, description, url, siteName: "MyNetPaycheck", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function bracketRows(brackets: Bracket[]) {
  const rows: { rate: number; from: number; to: number | null }[] = [];
  let prev = 0;
  for (const b of brackets) {
    rows.push({ rate: b.rate, from: prev, to: b.upTo });
    if (b.upTo !== null) prev = b.upTo;
  }
  return rows;
}

const EXAMPLE_SALARIES = [40000, 60000, 80000, 100000];

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const info = getState(state);
  if (!info) notFound();

  const summary = rateSummary(info);

  // Server-computed examples (single filer, salaried) — unique, useful content.
  const examples = EXAMPLE_SALARIES.map((salary) => {
    const r = computePaycheck({
      grossAmount: salary,
      frequency: "annual",
      filingStatus: "single",
      state: info,
    });
    return { salary, net: r.netAnnual, monthly: r.netAnnual / 12, rate: r.effectiveTaxRate };
  });
  const example75 = computePaycheck({
    grossAmount: 75000,
    frequency: "annual",
    filingStatus: "single",
    state: info,
  });

  const stateRateText = !summary
    ? `${info.name} has no state income tax`
    : summary.isFlat
      ? `${info.name} has a flat ${pct(summary.top)} state income tax`
      : `${info.name}'s state income tax ranges from ${pct(summary.low)} to ${pct(summary.top)} across ${summary.brackets} brackets`;

  const faq = [
    {
      q: `Does ${info.name} have a state income tax?`,
      a: !summary
        ? `No. ${info.name} has no state income tax, so only federal income tax, Social Security, and Medicare are withheld from your paycheck.`
        : summary.isFlat
          ? `Yes. ${info.name} has a flat ${pct(summary.top)} state income tax that is withheld in addition to federal income tax, Social Security, and Medicare.`
          : `Yes. ${info.name} has a progressive state income tax from ${pct(summary.low)} to ${pct(summary.top)}, withheld in addition to federal income tax, Social Security, and Medicare.`,
    },
    {
      q: `What is the income tax rate in ${info.name}?`,
      a: `${stateRateText}. Federal income tax, Social Security (6.2%), and Medicare (1.45%) apply on top of any state tax.`,
    },
    {
      q: `How much is $75,000 after taxes in ${info.name}?`,
      a: `A single filer earning $75,000 in ${info.name} takes home about ${formatUSD(example75.netAnnual)} per year (${formatUSD(example75.netAnnual / 12)} per month) — an effective tax rate of about ${(example75.effectiveTaxRate * 100).toFixed(1)}%. Adjust the calculator above for your exact salary, filing status, and 401(k).`,
    },
    {
      q: `How much is taken out of a paycheck in ${info.name}?`,
      a: `Every paycheck has Social Security (6.2%) and Medicare (1.45%) withheld, plus federal income tax based on your bracket${summary ? ` and ${info.name} state income tax` : ""}. Pre-tax 401(k) contributions lower the income-tax portion. Enter your pay above for the exact breakdown.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${info.name} Paycheck Calculator`,
        url: `${SITE_URL}/${info.slug}`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: `${info.name} Paycheck Calculator`, item: `${SITE_URL}/${info.slug}` },
        ],
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
        <nav className="mb-3 text-sm text-slate-500" aria-label="Breadcrumb">
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
        <h2 className="mb-2 text-xl font-semibold text-slate-900">How taxes work on a {info.name} paycheck</h2>
        <ul className="list-inside list-disc space-y-1 text-slate-600">
          {info.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Take-home pay at common salaries in {info.name}
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          Estimated net pay for a single filer with no pre-tax deductions, 2026 rates.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-semibold">Gross salary</th>
                <th className="px-4 py-2 font-semibold">Take-home / year</th>
                <th className="px-4 py-2 font-semibold">Take-home / month</th>
                <th className="px-4 py-2 font-semibold">Effective tax rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examples.map((e) => (
                <tr key={e.salary} className="text-slate-700">
                  <td className="px-4 py-2 font-medium">{formatUSD(e.salary)}</td>
                  <td className="px-4 py-2">{formatUSD(e.net)}</td>
                  <td className="px-4 py-2">{formatUSD(e.monthly)}</td>
                  <td className="px-4 py-2">{(e.rate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {summary && info.brackets && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            {info.name} state income tax brackets (2026, single filer)
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2 font-semibold">Tax rate</th>
                  <th className="px-4 py-2 font-semibold">Taxable income</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bracketRows(info.brackets.single).map((r, i) => (
                  <tr key={i} className="text-slate-700">
                    <td className="px-4 py-2 font-medium">{pct(r.rate * 100)}</td>
                    <td className="px-4 py-2">
                      {formatUSD(r.from)} {r.to === null ? "and up" : `– ${formatUSD(r.to)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {info.standardDeduction && info.standardDeduction.single > 0 && (
            <p className="mt-2 text-sm text-slate-500">
              Brackets apply to taxable income after {info.name}&apos;s standard deduction of{" "}
              {formatUSD(info.standardDeduction.single)} (single) / {formatUSD(info.standardDeduction.married)} (married
              filing jointly).
            </p>
          )}
        </section>
      )}

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
