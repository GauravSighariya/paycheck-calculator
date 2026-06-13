"use client";

import { useMemo, useState } from "react";
import {
  computePaycheck,
  formatUSD,
  formatUSDCents,
  type FilingStatus,
  type PayFrequency,
} from "@/lib/tax";
import { STATES } from "@/lib/states";

const FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: "annual", label: "Per year" },
  { value: "monthly", label: "Per month" },
  { value: "semimonthly", label: "Semi-monthly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "hourly", label: "Hourly" },
];

const PERIOD_LABEL: Record<PayFrequency, string> = {
  annual: "year",
  monthly: "month",
  semimonthly: "paycheck",
  biweekly: "paycheck",
  weekly: "week",
  hourly: "week",
};

export default function PaycheckCalculator({
  initialStateSlug = "texas",
}: {
  initialStateSlug?: string;
}) {
  const [frequency, setFrequency] = useState<PayFrequency>("annual");
  const [grossAmount, setGrossAmount] = useState<number>(75000);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateSlug, setStateSlug] = useState<string>(initialStateSlug);
  const [retirement, setRetirement] = useState<number>(0);

  const result = useMemo(
    () =>
      computePaycheck({
        grossAmount: grossAmount || 0,
        frequency,
        hoursPerWeek,
        filingStatus,
        retirement401kPercent: retirement,
        state: STATES[stateSlug] ?? STATES.texas,
      }),
    [grossAmount, frequency, hoursPerWeek, filingStatus, stateSlug, retirement],
  );

  const takeHomePct = result.annualGross > 0 ? result.netAnnual / result.annualGross : 0;

  const rows = [
    { label: "Federal income tax", value: result.federalTax, color: "bg-rose-500" },
    { label: "Social Security", value: result.socialSecurity, color: "bg-amber-500" },
    { label: "Medicare", value: result.medicare, color: "bg-orange-400" },
    { label: `${STATES[stateSlug]?.name ?? ""} state tax`, value: result.stateTax, color: "bg-fuchsia-500" },
    { label: "401(k) contribution", value: result.retirement, color: "bg-sky-500" },
  ].filter((r) => r.value > 0 || r.label.startsWith("Federal"));

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
      {/* Inputs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your details</h2>

        <label className="mb-1 block text-sm font-medium text-slate-600">Pay frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as PayFrequency)}
          className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-slate-600">
          {frequency === "hourly" ? "Hourly wage" : "Gross pay"}
        </label>
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            min={0}
            value={grossAmount}
            onChange={(e) => setGrossAmount(parseFloat(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {frequency === "hourly" && (
          <>
            <label className="mb-1 block text-sm font-medium text-slate-600">Hours per week</label>
            <input
              type="number"
              min={0}
              max={168}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(parseFloat(e.target.value))}
              className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </>
        )}

        <label className="mb-1 block text-sm font-medium text-slate-600">Filing status</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["single", "married"] as FilingStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilingStatus(s)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
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
          className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {Object.values(STATES).map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-slate-600">
          401(k) contribution: <span className="font-semibold text-slate-900">{retirement}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={retirement}
          onChange={(e) => setRetirement(parseFloat(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-indigo-100">Estimated take-home pay</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {formatUSDCents(result.netPerPeriod)}
          <span className="ml-2 text-lg font-medium text-indigo-100">/ {PERIOD_LABEL[frequency]}</span>
        </p>
        <p className="mt-1 text-sm text-indigo-100">
          {formatUSD(result.netAnnual)} per year &middot; {(takeHomePct * 100).toFixed(1)}% of gross &middot;{" "}
          {(result.effectiveTaxRate * 100).toFixed(1)}% effective tax rate
        </p>

        {/* Stacked bar */}
        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-emerald-400" style={{ width: `${takeHomePct * 100}%` }} title="Take-home" />
          {rows
            .filter((r) => r.label !== "401(k) contribution")
            .map((r) => (
              <div
                key={r.label}
                className={`h-full ${r.color}`}
                style={{ width: `${result.annualGross > 0 ? (r.value / result.annualGross) * 100 : 0}%` }}
                title={r.label}
              />
            ))}
        </div>

        <div className="mt-5 space-y-2 rounded-xl bg-white/10 p-4 text-sm">
          <div className="flex items-center justify-between font-semibold">
            <span>Annual gross</span>
            <span>{formatUSD(result.annualGross)}</span>
          </div>
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-indigo-50">
              <span className="flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${r.color}`} />
                {r.label}
              </span>
              <span>−{formatUSD(r.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-white/20 pt-2 font-semibold">
            <span>Take-home (net)</span>
            <span>{formatUSD(result.netAnnual)}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-indigo-200">
          Estimate based on 2025 federal rates and the latest published state rates. For planning only — not tax
          advice. Excludes local taxes, SDI, and other withholdings.
        </p>
      </div>
    </div>
  );
}
