import type { Metadata } from "next";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND} handles data, cookies, and advertising.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-5 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: June 13, 2026</p>

      <p>
        {BRAND} (&quot;we&quot;, &quot;us&quot;) operates this paycheck calculator website. This policy explains what
        information is and isn&apos;t collected when you use the site, and how cookies and advertising work.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">The numbers you enter stay in your browser</h2>
      <p>
        Our calculators run entirely in your browser. The salary, wage, filing status, and other figures you enter to
        estimate take-home pay are <strong>never sent to, stored on, or logged by our servers</strong>. We do not have a
        database of your inputs and cannot see them.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Information collected automatically</h2>
      <p>
        Like most websites, our hosting provider records standard technical request data (such as IP address, browser
        type, and pages requested) for security and reliability. We may also use aggregate, privacy-respecting analytics
        to understand which pages are popular. This data is used in aggregate and is not used to personally identify you.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Cookies and advertising</h2>
      <p>
        This site may display advertising served by Google AdSense and other third-party vendors. To do this:
      </p>
      <ul className="list-inside list-disc space-y-1">
        <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</li>
        <li>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this
          site and/or other sites on the internet.
        </li>
        <li>
          You can opt out of personalized advertising by visiting{" "}
          <a className="text-indigo-600 underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          , or opt out of third-party vendor cookies at{" "}
          <a className="text-indigo-600 underline" href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          .
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-slate-900">Third-party links</h2>
      <p>
        We may link to third-party sites (for example, tax software or government resources). We are not responsible for
        the privacy practices of those sites and encourage you to review their policies.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Children&apos;s privacy</h2>
      <p>This site is intended for a general adult audience and is not directed at children under 13.</p>

      <h2 className="text-xl font-semibold text-slate-900">Changes to this policy</h2>
      <p>We may update this policy from time to time. Material changes will be reflected by the &quot;last updated&quot; date above.</p>

      <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
      <p>
        Questions about this policy? Email us at{" "}
        <a className="text-indigo-600 underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </article>
  );
}
