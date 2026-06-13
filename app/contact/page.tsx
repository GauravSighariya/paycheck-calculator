import type { Metadata } from "next";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${BRAND} team.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-5 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Contact</h1>

      <p>
        {BRAND} is an independent project. We read every message and welcome corrections to our tax data, feature ideas,
        and partnership inquiries.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-500">Email</p>
        <a className="text-lg font-semibold text-indigo-600 underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </div>

      <p>
        For tax-data corrections, it helps to include the state, filing status, and the figure you expected so we can
        verify and update quickly. Please note we can&apos;t provide personalized tax advice — for that, consult the IRS,
        your state tax authority, or a qualified tax professional.
      </p>

      <p className="text-sm text-slate-500">We aim to reply within a few business days.</p>
    </article>
  );
}
