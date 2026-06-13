"use client";

import { useMemo, useState } from "react";
import { computePaycheck, formatUSD, type FilingStatus } from "@/lib/tax";
import { STATES } from "@/lib/states";

export default function BonusCalculator() {
  const [salary, setSalary] = useState<number>(75000);
  const [bonus, setBonus] = useState<number>(10000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateSlug, setStateSlug] = useState<string>("texas");

  const result = useMemo(() => {
    const state = STATES[stateSlug] ?? STATES.texas;
    const base = computePaycheck({ grossAmount: salary || 0, frequency: "annual", filingStatus, state });
    const withBonus = computePaycheck({
      grossAmount: (salary || 0) + (bonus || 0),
      frequency: "annual",
      filingStatus,
      state,
    });
    const federal = withBonus.federalTax - base.federalTax;
    const stateTax = withBonus.stateTax - base.stateTax;
    const fica = withBonus.socialSecurity + withBonus.medicare - base.socialSecurity - base.medicare;
    const tax = federal + stateTax + fica;
    const net = (bonus || 0) - tax;
    return { federal, stateTax, fica, tax, net, rate: bonus ? tax / bonus : 0 };
  }, [salary, bonus, filingStatus, stateSlug]);

  const rows = [
    { label: "Federal income tax", value: result.federal },
    { label: "Social Security + Medicare", value: result.fica },
    { label: `${STATES[stateSlug]?.name ?? ""} state tax`, value: result.stateTax },
  ].filter((r) => r.value > 0.5);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your details</h2>

        <label className="mb-1 block text-sm font-medium text-slate-600">Annual salary (before bonus)</label>
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            min={0}
            value={salary}
            onChange={(e) => setSalary(parseFloat(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-600">Bonus amount</label>
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            min={0}
            value={bonus}
            onChange={(e) => setBonus(parseFloat(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-600">Filing status</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["single", "married"] as FilingStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilingStatus(s)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                filingStatus === s
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {s === "married" ? "Married (joint)" : "Single"}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-600">State</label>
        <select
          value={stateSlug}
          onChange={(e) => setStateSlug(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {Object.values(STATES)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-indigo-100">You actually keep</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">{formatUSD(result.net)}</p>
        <p className="mt-1 text-sm text-indigo-100">
          of your {formatUSD(bonus || 0)} bonus &middot; {(result.rate * 100).toFixed(1)}% goes to taxes
        </p>

        <div className="mt-5 space-y-2 rounded-xl bg-white/10 p-4 text-sm">
          <div className="flex items-center justify-between font-semibold">
            <span>Bonus</span>
            <span>{formatUSD(bonus || 0)}</span>
          </div>
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-indigo-50">
              <span>{r.label}</span>
              <span>−{formatUSD(r.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-white/20 pt-2 font-semibold">
            <span>Net bonus</span>
            <span>{formatUSD(result.net)}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-indigo-200">
          This shows the <strong>actual tax</strong> on your bonus at your marginal rate. Employers often withhold
          federal tax on bonuses at a flat 22% — if that differs from your real rate, it&apos;s reconciled when you file.
          Estimate only; excludes local taxes and other withholdings.
        </p>
      </div>
    </div>
  );
}
