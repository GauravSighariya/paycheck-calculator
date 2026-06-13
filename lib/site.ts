// Canonical site URL. Override by setting NEXT_PUBLIC_SITE_URL in Vercel
// (e.g. to your custom domain) — falls back to the current Vercel URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://paycheck-calculator-vert.vercel.app";

export const SITE_NAME = "Take-Home Pay Calculator";
export const BRAND = "MyNetPaycheck";
export const CONTACT_EMAIL = "hello@mynetpaycheck.com";
