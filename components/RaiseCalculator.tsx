"use client";

import { useMemo, useState } from "react";
import { computePaycheck, formatUSD, type FilingStatus } from "@/lib/tax";
import { STATES } from "@/lib/states";

export default function RaiseCalculator() {
  const [salary, setSalary] = useState<number>(75000);
  const [mode, setMode] = useState<"percent" | "amount">("percent");
  const [raisePct, setRaisePct] = useState<number>(5);
  const [raiseAmt, setRaiseAmt] = useState<number>(5000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateSlug, setStateSlug] = useState<string>("texas");

  const r = useMemo(() => {
    const cur = salary || 0;
    const increase = mode === "percent" ? cur * ((raisePct || 0) / 100) : raiseAmt || 0;
    const next = cur + increase;
    const state = STATES[stateSlug] ?? STATES.texas;
    const before = computePaycheck({ grossAmount: cur, frequency: "annual", filingStatus, state });
    const after = computePaycheck({ grossAmount: next, frequency: "annual", filingStatus, state });
    const netIncrease = after.netAnnual - before.netAnnual;
    const keptPct = increase ? netIncrease / increase : 0;
    return { increase, next, netIncrease, netMonthly: netIncrease / 12, keptPct, newNetAnnual: after.netAnnual };
  }, [salary, mode, raisePct, raiseAmt, filingStatus, stateSlug]);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your raise</h2>

        <label className="mb-1 block text-sm font-medium text-slate-600">Current annual salary</label>
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

        <label className="mb-1 block text-sm font-medium text-slate-600">Raise</label>
        <div className="mb-3 grid grid-cols-2 gap-2">
          {(["percent", "amount"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                mode === m
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {m === "percent" ? "By percent (%)" : "By amount ($)"}
            </button>
          ))}
        </div>

        {mode === "percent" ? (
          <div className="relative mb-4">
            <input
              type="number"
              min={0}
              value={raisePct}
              onChange={(e) => setRaisePct(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
          </div>
        ) : (
          <div className="relative mb-4">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              type="number"
              min={0}
              value={raiseAmt}
              onChange={(e) => setRaiseAmt(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Filing status</label>
            <select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="single">Single</option>
              <option value="married">Married (joint)</option>
            </select>
          </div>
          <div>
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
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-indigo-100">Extra take-home pay</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          +{formatUSD(r.netIncrease)}
          <span className="ml-2 text-lg font-medium text-indigo-100">/ year</span>
        </p>
        <p className="mt-1 text-sm text-indigo-100">
          +{formatUSD(r.netMonthly)}/month &middot; you keep {(r.keptPct * 100).toFixed(0)}% of the raise after taxes
        </p>

        <div className="mt-5 space-y-2 rounded-xl bg-white/10 p-4 text-sm">
          <div className="flex items-center justify-between text-indigo-50">
            <span>New salary</span>
            <span>{formatUSD(r.next)}</span>
          </div>
          <div className="flex items-center justify-between text-indigo-50">
            <span>Gross raise</span>
            <span>+{formatUSD(r.increase)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 font-semibold">
            <span>After-tax raise</span>
            <span>+{formatUSD(r.netIncrease)}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-indigo-200">
          A raise is taxed at your <strong>marginal</strong> rate, so you keep less than the full amount. Estimate for
          2026; excludes local taxes and other withholdings.
        </p>
      </div>
    </div>
  );
}
