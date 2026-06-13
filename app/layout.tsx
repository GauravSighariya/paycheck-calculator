import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE_URL, SITE_NAME, BRAND } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "Take-Home Pay Calculator — Paycheck Estimator by State (2025)";
const DEFAULT_DESC =
  "Free take-home pay calculator. See your net paycheck after federal, state, Social Security, and Medicare taxes for 2025 — by state, salary, and filing status.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Take-Home Pay Calculator",
  },
  description: DEFAULT_DESC,
  applicationName: BRAND,
  openGraph: {
    type: "website",
    siteName: BRAND,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">$</span>
              {SITE_NAME}
            </Link>
            <nav className="text-sm text-slate-500">2025 tax year</nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl space-y-3 px-4 py-6">
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <Link href="/about" className="hover:text-indigo-600">About</Link>
              <Link href="/contact" className="hover:text-indigo-600">Contact</Link>
              <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
            </nav>
            <p className="text-xs text-slate-500">
              Estimates for planning only — not tax or financial advice. Figures use 2025 federal rates and the
              latest published state rates and may not reflect local taxes or every deduction.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
