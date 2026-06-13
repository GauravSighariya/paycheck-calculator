import Link from "next/link";
import { STATES } from "@/lib/states";

export default function NotFound() {
  const popular = ["california", "texas", "new-york", "florida", "illinois", "pennsylvania"]
    .map((s) => STATES[s])
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        We couldn&apos;t find that page. Try the main calculator or pick your state below.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
      >
        Go to the Take-Home Pay Calculator
      </Link>
      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-slate-500">Popular states</p>
        <div className="flex flex-wrap justify-center gap-2">
          {popular.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
