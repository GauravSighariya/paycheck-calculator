"use client";

import { useMemo, useState } from "react";
import { computePaycheck, formatUSD, formatUSDCents, type FilingStatus } from "@/lib/tax";
import { STATES } from "@/lib/states";

export default function OvertimeCalculator() {
  const [rate, setRate] = useState<number>(25);
  const [regularHours, setRegularHours] = useState<number>(40);
  const [otHours, setOtHours] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1.5);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateSlug, setStateSlug] = useState<string>("texas");

  const r = useMemo(() => {
    const otRate = (rate || 0) * multiplier;
    const regularWeekly = (rate || 0) * (regularHours || 0);
    const otWeekly = otRate * (otHours || 0);
    const totalWeekly = regularWeekly + otWeekly;
    const annualGross = totalWeekly * 52;
    const net = computePaycheck({
      grossAmount: annualGross,
      frequency: "annual",
      filingStatus,
      state: STATES[stateSlug] ?? STATES.texas,
    });
    return { otRate, regularWeekly, otWeekly, totalWeekly, annualGross, netWeekly: net.netAnnual / 52, netAnnual: net.netAnnual };
  }, [rate, regularHours, otHours, multiplier, filingStatus, stateSlug]);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your hours &amp; rate</h2>

        <label className="mb-1 block text-sm font-medium text-slate-600">Hourly wage</label>
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            min={0}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Regular hours / week</label>
            <input
              type="number"
              min={0}
              max={168}
              value={regularHours}
              onChange={(e) => setRegularHours(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Overtime hours / week</label>
            <input
              type="number"
              min={0}
              max={168}
              value={otHours}
              onChange={(e) => setOtHours(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-600">Overtime multiplier</label>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[1.5, 2, 1].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMultiplier(m)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                multiplier === m
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {m === 1.5 ? "Time-and-a-half" : m === 2 ? "Double time" : "1× (none)"}
            </button>
          ))}
        </div>

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
        <p className="text-sm font-medium text-indigo-100">Total weekly gross pay</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">{formatUSDCents(r.totalWeekly)}</p>
        <p className="mt-1 text-sm text-indigo-100">
          Overtime rate: {formatUSDCents(r.otRate)}/hr &middot; ~{formatUSD(r.annualGross)}/year gross
        </p>

        <div className="mt-5 space-y-2 rounded-xl bg-white/10 p-4 text-sm">
          <div className="flex items-center justify-between text-indigo-50">
            <span>Regular pay (weekly)</span>
            <span>{formatUSDCents(r.regularWeekly)}</span>
          </div>
          <div className="flex items-center justify-between text-indigo-50">
            <span>Overtime pay (weekly)</span>
            <span>{formatUSDCents(r.otWeekly)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 font-semibold">
            <span>Total weekly gross</span>
            <span>{formatUSDCents(r.totalWeekly)}</span>
          </div>
          <div className="flex items-center justify-between text-indigo-100">
            <span>Est. weekly take-home</span>
            <span>{formatUSDCents(r.netWeekly)}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-indigo-200">
          Under federal law (FLSA), non-exempt employees earn at least 1.5× their regular rate for hours over 40 in a
          week. Take-home is an estimate for 2026; excludes local taxes and other withholdings.
        </p>
      </div>
    </div>
  );
}
