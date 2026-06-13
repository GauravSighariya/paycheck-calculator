import type { Metadata } from "next";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `What ${BRAND} is, how the take-home pay estimates are calculated, and their limitations.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-5 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">About {BRAND}</h1>

      <p>
        {BRAND} is a free tool that estimates your <strong>take-home (net) pay</strong> — what actually lands in your
        bank account after taxes — for any salary or hourly wage, in any U.S. state. We built it because most paycheck
        information online is buried in dense articles; we wanted a fast, clear calculator that shows the full breakdown.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">How the estimates are calculated</h2>
      <p>Each estimate combines four components:</p>
      <ul className="list-inside list-disc space-y-1">
        <li><strong>Federal income tax</strong> — the 2025 progressive bracket schedule and standard deduction by filing status.</li>
        <li><strong>Social Security</strong> — 6.2% up to the annual Social Security wage base.</li>
        <li><strong>Medicare</strong> — 1.45%, plus the 0.9% Additional Medicare Tax above the IRS threshold.</li>
        <li><strong>State income tax</strong> — current rates and brackets for all 50 states and Washington, D.C., including no-tax, flat-tax, and progressive states.</li>
      </ul>
      <p>
        Pre-tax contributions such as a traditional 401(k) reduce your taxable income for income-tax purposes (but not
        for Social Security and Medicare), and the calculator reflects that.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Data sources</h2>
      <p>
        Federal figures follow IRS inflation-adjusted amounts for the 2025 tax year. State income-tax rates and brackets
        are based on the Tax Foundation&apos;s published 2025 state individual income tax data. We review the figures as new
        tax-year data is released.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Accuracy and limitations</h2>
      <p>
        These are <strong>estimates for planning and education only — not tax, legal, or financial advice.</strong> Real
        paychecks can differ because of local (city/county) income taxes, state disability insurance, pre-tax health
        premiums, garnishments, supplemental withholding rules, and other deductions that this tool does not model. For
        decisions that matter, confirm with the IRS, your state tax authority, or a qualified tax professional.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
      <p>
        Spot something that looks off, or have a suggestion? We&apos;d genuinely like to hear it — email{" "}
        <a className="text-indigo-600 underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </article>
  );
}
