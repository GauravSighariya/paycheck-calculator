import type { StateTax, Bracket, FilingStatus } from "./tax";
import { formatUSD } from "./tax";

export interface StateInfo extends StateTax {
  slug: string; // url segment, e.g. "texas"
  name: string; // "Texas"
  abbr: string; // "TX"
  intro: string; // generated, data-driven (SEO + helpful content)
  facts: string[];
}

// ----------------------------------------------------------------------------
// Data source: Tax Foundation, "2026 State Individual Income Tax Rates and
// Brackets" + flat/no-tax classifications. Figures are estimates for planning
// only — see disclaimer in the UI. State standard deductions for states that
// use personal exemptions/credits instead are approximated; states that conform
// to the federal standard deduction use the 2026 federal amounts.
// ----------------------------------------------------------------------------

// Pairs are [ratePercent, lowerThreshold]. Converted to upper-bound brackets.
// If the first pair's threshold > 0, an implicit 0% band is prepended.
type Pair = [number, number];

function brk(pairs: Pair[]): Bracket[] {
  const list: Pair[] = pairs[0][1] > 0 ? [[0, 0], ...pairs] : pairs;
  return list.map(([rate, _start], i) => ({
    rate: rate / 100,
    upTo: i < list.length - 1 ? list[i + 1][1] : null,
  }));
}

type Raw = {
  slug: string;
  name: string;
  abbr: string;
  kind: "none" | "flat" | "progressive";
  flat?: number; // flat rate %
  single?: Pair[];
  married?: Pair[];
  std?: [number, number]; // [single, married] standard deduction
  note?: string;
};

const RAW: Raw[] = [
  // ---- No state income tax ----
  { slug: "alaska", name: "Alaska", abbr: "AK", kind: "none" },
  { slug: "florida", name: "Florida", abbr: "FL", kind: "none" },
  { slug: "nevada", name: "Nevada", abbr: "NV", kind: "none" },
  { slug: "new-hampshire", name: "New Hampshire", abbr: "NH", kind: "none", note: "New Hampshire does not tax earned wages; its tax on interest and dividends ended in 2025." },
  { slug: "south-dakota", name: "South Dakota", abbr: "SD", kind: "none" },
  { slug: "tennessee", name: "Tennessee", abbr: "TN", kind: "none", note: "Tennessee fully phased out its tax on interest and dividends; wages are untaxed." },
  { slug: "texas", name: "Texas", abbr: "TX", kind: "none" },
  { slug: "washington", name: "Washington", abbr: "WA", kind: "none", note: "Washington taxes certain high-earner capital gains, but not wage income." },
  { slug: "wyoming", name: "Wyoming", abbr: "WY", kind: "none" },

  // ---- Flat tax (2026 rates) ----
  { slug: "arizona", name: "Arizona", abbr: "AZ", kind: "flat", flat: 2.5, std: [16100, 32200] },
  { slug: "colorado", name: "Colorado", abbr: "CO", kind: "flat", flat: 4.4, std: [16100, 32200] },
  { slug: "georgia", name: "Georgia", abbr: "GA", kind: "flat", flat: 5.19, std: [12000, 24000] },
  { slug: "idaho", name: "Idaho", abbr: "ID", kind: "flat", flat: 5.3, std: [16100, 32200] },
  { slug: "illinois", name: "Illinois", abbr: "IL", kind: "flat", flat: 4.95, std: [2850, 5700] },
  { slug: "indiana", name: "Indiana", abbr: "IN", kind: "flat", flat: 2.95, std: [1000, 2000], note: "Indiana counties levy additional local income taxes (not included here)." },
  { slug: "iowa", name: "Iowa", abbr: "IA", kind: "flat", flat: 3.8, std: [16100, 32200] },
  { slug: "kentucky", name: "Kentucky", abbr: "KY", kind: "flat", flat: 3.5, std: [3330, 6660], note: "Many Kentucky localities levy a local occupational/payroll tax (not included here)." },
  { slug: "louisiana", name: "Louisiana", abbr: "LA", kind: "flat", flat: 3.0, std: [4500, 9000] },
  { slug: "michigan", name: "Michigan", abbr: "MI", kind: "flat", flat: 4.25, std: [5800, 11600], note: "Some Michigan cities (e.g., Detroit) levy a local income tax (not included here)." },
  { slug: "north-carolina", name: "North Carolina", abbr: "NC", kind: "flat", flat: 3.99, std: [12750, 25500] },
  { slug: "pennsylvania", name: "Pennsylvania", abbr: "PA", kind: "flat", flat: 3.07, std: [0, 0], note: "Most Pennsylvania municipalities add a local earned income tax (not included here)." },
  { slug: "utah", name: "Utah", abbr: "UT", kind: "flat", flat: 4.5, std: [16100, 32200] },

  // Mississippi: flat 4.0% (2026) above a $10,000 exemption.
  { slug: "mississippi", name: "Mississippi", abbr: "MS", kind: "progressive", single: [[0, 0], [4.0, 10000]], married: [[0, 0], [4.0, 10000]], std: [2300, 4600], note: "The first $10,000 of taxable income is exempt in Mississippi." },

  // ---- Progressive (2026) ----
  { slug: "alabama", name: "Alabama", abbr: "AL", kind: "progressive", single: [[2, 0], [4, 500], [5, 3000]], married: [[2, 0], [4, 1000], [5, 6000]], std: [3000, 8500], note: "Some Alabama municipalities levy a local occupational tax (not included here)." },
  { slug: "arkansas", name: "Arkansas", abbr: "AR", kind: "progressive", single: [[2, 0], [3.9, 4600]], married: [[2, 0], [3.9, 4600]], std: [2470, 4940] },
  { slug: "california", name: "California", abbr: "CA", kind: "progressive", single: [[1, 0], [2, 11079], [4, 26264], [6, 41452], [8, 57542], [9.3, 72724], [10.3, 371479], [11.3, 445771], [12.3, 742953], [13.3, 1000000]], married: [[1, 0], [2, 22158], [4, 52528], [6, 82904], [8, 115084], [9.3, 145448], [10.3, 742958], [11.3, 891542], [12.3, 1000000], [13.3, 1485906]], std: [5540, 11080], note: "California also withholds State Disability Insurance (SDI), which is not included here." },
  { slug: "connecticut", name: "Connecticut", abbr: "CT", kind: "progressive", single: [[2, 0], [4.5, 10000], [5.5, 50000], [6, 100000], [6.5, 200000], [6.9, 250000], [6.99, 500000]], married: [[2, 0], [4.5, 20000], [5.5, 100000], [6, 200000], [6.5, 400000], [6.9, 500000], [6.99, 1000000]], std: [0, 0] },
  { slug: "delaware", name: "Delaware", abbr: "DE", kind: "progressive", single: [[2.2, 2000], [3.9, 5000], [4.8, 10000], [5.2, 20000], [5.55, 25000], [6.6, 60000]], married: [[2.2, 2000], [3.9, 5000], [4.8, 10000], [5.2, 20000], [5.55, 25000], [6.6, 60000]], std: [3250, 6500] },
  { slug: "district-of-columbia", name: "District of Columbia", abbr: "DC", kind: "progressive", single: [[4, 0], [6, 10000], [6.5, 40000], [8.5, 60000], [9.25, 250000], [9.75, 500000], [10.75, 1000000]], married: [[4, 0], [6, 10000], [6.5, 40000], [8.5, 60000], [9.25, 250000], [9.75, 500000], [10.75, 1000000]], std: [16100, 32200] },
  { slug: "hawaii", name: "Hawaii", abbr: "HI", kind: "progressive", single: [[1.4, 0], [3.2, 9600], [5.5, 14400], [6.4, 19200], [6.8, 24000], [7.2, 36000], [7.6, 48000], [7.9, 125000], [8.25, 175000], [9, 225000], [10, 275000], [11, 325000]], married: [[1.4, 0], [3.2, 19200], [5.5, 28800], [6.4, 38400], [6.8, 48000], [7.2, 72000], [7.6, 96000], [7.9, 250000], [8.25, 350000], [9, 450000], [10, 550000], [11, 650000]], std: [4400, 8800] },
  { slug: "kansas", name: "Kansas", abbr: "KS", kind: "progressive", single: [[5.2, 0], [5.58, 23000]], married: [[5.2, 0], [5.58, 46000]], std: [3605, 8240] },
  { slug: "maine", name: "Maine", abbr: "ME", kind: "progressive", single: [[5.8, 0], [6.75, 27399], [7.15, 64849]], married: [[5.8, 0], [6.75, 54849], [7.15, 129749]], std: [16100, 32200] },
  { slug: "maryland", name: "Maryland", abbr: "MD", kind: "progressive", single: [[2, 0], [3, 1000], [4, 2000], [4.75, 3000], [5, 100000], [5.25, 125000], [5.5, 150000], [5.75, 250000], [6.25, 500000], [6.5, 1000000]], married: [[2, 0], [3, 1000], [4, 2000], [4.75, 3000], [5, 150000], [5.25, 175000], [5.5, 225000], [5.75, 300000], [6.25, 600000], [6.5, 1200000]], std: [3350, 6700], note: "Maryland counties levy a local income tax on top of the state rate (not included here)." },
  { slug: "massachusetts", name: "Massachusetts", abbr: "MA", kind: "progressive", single: [[5, 0], [9, 1083150]], married: [[5, 0], [9, 1083150]], std: [4400, 8800] },
  { slug: "minnesota", name: "Minnesota", abbr: "MN", kind: "progressive", single: [[5.35, 0], [6.8, 33310], [7.85, 109430], [9.85, 203150]], married: [[5.35, 0], [6.8, 48700], [7.85, 193480], [9.85, 337930]], std: [15300, 30600] },
  { slug: "missouri", name: "Missouri", abbr: "MO", kind: "progressive", single: [[2, 1348], [2.5, 2696], [3, 4044], [3.5, 5392], [4, 6740], [4.5, 8088], [4.7, 9436]], married: [[2, 1348], [2.5, 2696], [3, 4044], [3.5, 5392], [4, 6740], [4.5, 8088], [4.7, 9436]], std: [16100, 32200], note: "Kansas City and St. Louis levy a 1% local earnings tax (not included here)." },
  { slug: "montana", name: "Montana", abbr: "MT", kind: "progressive", single: [[4.7, 0], [5.65, 47500]], married: [[4.7, 0], [5.65, 95000]], std: [16100, 32200] },
  { slug: "nebraska", name: "Nebraska", abbr: "NE", kind: "progressive", single: [[2.46, 0], [3.51, 4130], [4.55, 24760]], married: [[2.46, 0], [3.51, 8250], [4.55, 49530]], std: [8850, 17700] },
  { slug: "new-jersey", name: "New Jersey", abbr: "NJ", kind: "progressive", single: [[1.4, 0], [1.75, 20000], [3.5, 35000], [5.53, 40000], [6.37, 75000], [8.97, 500000], [10.75, 1000000]], married: [[1.4, 0], [1.75, 20000], [2.45, 50000], [3.5, 70000], [5.53, 80000], [6.37, 150000], [8.97, 500000], [10.75, 1000000]], std: [0, 0] },
  { slug: "new-mexico", name: "New Mexico", abbr: "NM", kind: "progressive", single: [[1.5, 0], [3.2, 5500], [4.3, 16500], [4.7, 33500], [4.9, 66500], [5.9, 210000]], married: [[1.5, 0], [3.2, 8000], [4.3, 25000], [4.7, 50000], [4.9, 100000], [5.9, 315000]], std: [16100, 32200] },
  { slug: "new-york", name: "New York", abbr: "NY", kind: "progressive", single: [[3.9, 0], [4.4, 8500], [5.15, 11700], [5.4, 13900], [5.9, 80650], [6.85, 215400], [9.65, 1077550], [10.3, 5000000], [10.9, 25000000]], married: [[3.9, 0], [4.4, 17150], [5.15, 23600], [5.4, 27900], [5.9, 161550], [6.85, 323200], [9.65, 2155350], [10.3, 5000000], [10.9, 25000000]], std: [8000, 16050], note: "New York City and Yonkers residents owe an additional local income tax (not included here)." },
  { slug: "north-dakota", name: "North Dakota", abbr: "ND", kind: "progressive", single: [[1.95, 48475], [2.5, 244825]], married: [[1.95, 80975], [2.5, 298075]], std: [16100, 32200] },
  { slug: "ohio", name: "Ohio", abbr: "OH", kind: "progressive", single: [[0, 0], [2.75, 26050]], married: [[0, 0], [2.75, 26050]], std: [0, 0], note: "Ohio applies its flat 2.75% rate to income above about $26,050; income below that is untaxed. Many Ohio cities also levy a local income tax (not included here)." },
  { slug: "oklahoma", name: "Oklahoma", abbr: "OK", kind: "progressive", single: [[0, 0], [2.5, 3750], [3.5, 4900], [4.5, 7200]], married: [[0, 0], [2.5, 7500], [3.5, 9800], [4.5, 14400]], std: [6350, 12700] },
  { slug: "oregon", name: "Oregon", abbr: "OR", kind: "progressive", single: [[4.75, 0], [6.75, 4550], [8.75, 11400], [9.9, 125000]], married: [[4.75, 0], [6.75, 9100], [8.75, 22800], [9.9, 250000]], std: [2910, 5820] },
  { slug: "rhode-island", name: "Rhode Island", abbr: "RI", kind: "progressive", single: [[3.75, 0], [4.75, 82050], [5.99, 186450]], married: [[3.75, 0], [4.75, 82050], [5.99, 186450]], std: [11200, 22400] },
  { slug: "south-carolina", name: "South Carolina", abbr: "SC", kind: "progressive", single: [[0, 0], [3, 3640], [6, 18230]], married: [[0, 0], [3, 3640], [6, 18230]], std: [16100, 32200] },
  { slug: "vermont", name: "Vermont", abbr: "VT", kind: "progressive", single: [[3.35, 0], [6.6, 49400], [7.6, 119700], [8.75, 249700]], married: [[3.35, 0], [6.6, 82500], [7.6, 199450], [8.75, 304000]], std: [7650, 15300] },
  { slug: "virginia", name: "Virginia", abbr: "VA", kind: "progressive", single: [[2, 0], [3, 3000], [5, 5000], [5.75, 17000]], married: [[2, 0], [3, 3000], [5, 5000], [5.75, 17000]], std: [8750, 17500] },
  { slug: "west-virginia", name: "West Virginia", abbr: "WV", kind: "progressive", single: [[2.22, 0], [2.96, 10000], [3.33, 25000], [4.44, 40000], [4.82, 60000]], married: [[2.22, 0], [2.96, 10000], [3.33, 25000], [4.44, 40000], [4.82, 60000]], std: [0, 0] },
  { slug: "wisconsin", name: "Wisconsin", abbr: "WI", kind: "progressive", single: [[3.5, 0], [4.4, 15110], [5.3, 51950], [7.65, 332720]], married: [[3.5, 0], [4.4, 20150], [5.3, 69260], [7.65, 443630]], std: [13960, 25840] },
];

// ---- Content generation (data-driven, differentiated per state) ----

function rateRange(brackets: Bracket[]): { low: number; top: number } {
  const rates = brackets.map((b) => b.rate).filter((r) => r > 0);
  if (rates.length === 0) return { low: 0, top: 0 };
  return { low: Math.min(...rates) * 100, top: Math.max(...rates) * 100 };
}

function pct(n: number): string {
  return `${Math.round(n * 1000) / 1000}%`;
}

function buildIntro(raw: Raw, brackets?: Bracket[]): string {
  if (raw.kind === "none" || !brackets) {
    return `${raw.name} is one of the U.S. states with no state income tax. Your ${raw.name} paycheck only has federal income tax, Social Security, and Medicare withheld — which usually leaves more take-home pay than in states that tax wages.${raw.note ? ` ${raw.note}` : ""}`;
  }
  const { low, top } = rateRange(brackets);
  const rateStr =
    low === top ? `a flat ${pct(top)}` : `a progressive ${pct(low)}–${pct(top)}`;
  return `${raw.name} has ${rateStr} state income tax. Your ${raw.name} take-home pay reflects federal income tax, ${raw.name} state income tax, Social Security, and Medicare withholding.${raw.note ? ` ${raw.note}` : ""}`;
}

function buildFacts(raw: Raw, brackets?: Bracket[], std?: [number, number]): string[] {
  if (raw.kind === "none" || !brackets) {
    const f = [
      "No state income tax — nothing is withheld at the state level on wages.",
      "Only federal income tax, Social Security (6.2%), and Medicare (1.45%) reduce your paycheck.",
    ];
    if (raw.note) f.push(raw.note);
    return f;
  }
  const { low, top } = rateRange(brackets);
  const f: string[] = [];
  f.push(
    low === top
      ? `Flat ${pct(top)} state income tax on taxable income.`
      : `Progressive state income tax from ${pct(low)} to ${pct(top)}.`,
  );
  if (std && std[0] > 0) {
    f.push(
      `${raw.name} standard deduction: ${formatUSD(std[0])} (single) / ${formatUSD(std[1])} (married filing jointly).`,
    );
  } else {
    f.push(`${raw.name} has no broad standard deduction like the federal one; rates apply to most taxable compensation.`);
  }
  f.push("Federal income tax, Social Security (6.2%), and Medicare (1.45%) are also withheld.");
  if (raw.note) f.push(raw.note);
  return f;
}

function buildState(raw: Raw): StateInfo {
  if (raw.kind === "none") {
    return {
      slug: raw.slug,
      name: raw.name,
      abbr: raw.abbr,
      hasIncomeTax: false,
      intro: buildIntro(raw),
      facts: buildFacts(raw),
    };
  }

  const single = raw.kind === "flat" ? brk([[raw.flat!, 0]]) : brk(raw.single!);
  const married = raw.kind === "flat" ? brk([[raw.flat!, 0]]) : brk(raw.married!);
  const std = raw.std ?? [0, 0];

  return {
    slug: raw.slug,
    name: raw.name,
    abbr: raw.abbr,
    hasIncomeTax: true,
    standardDeduction: { single: std[0], married: std[1] } as Record<FilingStatus, number>,
    brackets: { single, married },
    intro: buildIntro(raw, single),
    facts: buildFacts(raw, single, std),
  };
}

export const STATES: Record<string, StateInfo> = Object.fromEntries(
  RAW.map(buildState).map((s) => [s.slug, s]),
);

// Sorted slugs by state name for consistent listing.
export const STATE_SLUGS = Object.values(STATES)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((s) => s.slug);

export function getState(slug: string): StateInfo | undefined {
  return STATES[slug];
}

/** Human-friendly summary of a state's income tax structure (null if no tax). */
export function rateSummary(
  info: StateInfo,
): { isFlat: boolean; low: number; top: number; brackets: number } | null {
  if (!info.hasIncomeTax || !info.brackets) return null;
  const rates = info.brackets.single.map((b) => b.rate).filter((r) => r > 0);
  if (rates.length === 0) return null;
  const low = Math.min(...rates) * 100;
  const top = Math.max(...rates) * 100;
  return { isFlat: low === top, low, top, brackets: rates.length };
}
