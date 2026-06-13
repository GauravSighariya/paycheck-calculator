// Canonical site URL. Override by setting NEXT_PUBLIC_SITE_URL in Vercel
// (e.g. to your custom domain) — falls back to the current Vercel URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://mynetpaycheck.com";

export const SITE_NAME = "Take-Home Pay Calculator";
export const BRAND = "MyNetPaycheck";
export const CONTACT_EMAIL = "hello@mynetpaycheck.com";

// Google Analytics 4 measurement ID (public; embedded in client HTML).
export const GA_ID = "G-3WVGGCWTTE";
