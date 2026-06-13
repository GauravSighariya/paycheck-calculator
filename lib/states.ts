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
// Data source: Tax Foundation, "2025 State Individual Income Tax Rates and
// Brackets" + flat/no-tax classifications. Figures are estimates for planning
// only — see disclaimer in the UI. State standard deductions for states that
// use personal exemptions/credits instead are approximated.
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

  // ---- Flat tax ----
  { slug: "arizona", name: "Arizona", abbr: "AZ", kind: "flat", flat: 2.5, std: [15000, 30000] },
  { slug: "colorado", name: "Colorado", abbr: "CO", kind: "flat", flat: 4.4, std: [15000, 30000] },
  { slug: "georgia", name: "Georgia", abbr: "GA", kind: "flat", flat: 5.39, std: [12000, 24000] },
  { slug: "idaho", name: "Idaho", abbr: "ID", kind: "flat", flat: 5.695, std: [15000, 30000] },
  { slug: "illinois", name: "Illinois", abbr: "IL", kind: "flat", flat: 4.95, std: [2775, 5550] },
  { slug: "indiana", name: "Indiana", abbr: "IN", kind: "flat", flat: 3.0, std: [1000, 2000], note: "Indiana counties levy additional local income taxes (not included here)." },
  { slug: "iowa", name: "Iowa", abbr: "IA", kind: "flat", flat: 3.8, std: [15000, 30000] },
  { slug: "kentucky", name: "Kentucky", abbr: "KY", kind: "flat", flat: 4.0, std: [3270, 6540], note: "Many Kentucky localities levy a local occupational/payroll tax (not included here)." },
  { slug: "louisiana", name: "Louisiana", abbr: "LA", kind: "flat", flat: 3.0, std: [4500, 9000] },
  { slug: "michigan", name: "Michigan", abbr: "MI", kind: "flat", flat: 4.25, std: [5600, 11200], note: "Some Michigan cities (e.g., Detroit) levy a local income tax (not included here)." },
  { slug: "north-carolina", name: "North Carolina", abbr: "NC", kind: "flat", flat: 4.25, std: [12750, 25500] },
  { slug: "pennsylvania", name: "Pennsylvania", abbr: "PA", kind: "flat", flat: 3.07, std: [0, 0], note: "Most Pennsylvania municipalities add a local earned income tax (not included here)." },
  { slug: "utah", name: "Utah", abbr: "UT", kind: "flat", flat: 4.55, std: [15000, 30000] },

  // Mississippi: flat 4.4% above a $10,000 exemption.
  { slug: "mississippi", name: "Mississippi", abbr: "MS", kind: "progressive", single: [[0, 0], [4.4, 10000]], married: [[0, 0], [4.4, 10000]], std: [2300, 4600], note: "The first $10,000 of taxable income is exempt in Mississippi." },

  // ---- Progressive ----
  { slug: "alabama", name: "Alabama", abbr: "AL", kind: "progressive", single: [[2, 0], [4, 500], [5, 3000]], married: [[2, 0], [4, 1000], [5, 6000]], std: [3000, 8500], note: "Some Alabama municipalities levy a local occupational tax (not included here)." },
  { slug: "arkansas", name: "Arkansas", abbr: "AR", kind: "progressive", single: [[2, 0], [3.9, 4500]], married: [[2, 0], [3.9, 4500]], std: [2410, 4820] },
  { slug: "california", name: "California", abbr: "CA", kind: "progressive", single: [[1, 0], [2, 10412], [4, 24684], [6, 38959], [8, 54081], [9.3, 68350], [10.3, 349137], [11.3, 418961], [12.3, 698271]], married: [[1, 0], [2, 20824], [4, 49368], [6, 77918], [8, 108162], [9.3, 136700], [10.3, 698274], [11.3, 837922], [12.3, 1396542]], std: [5540, 11080], note: "California also withholds State Disability Insurance (SDI), which is not included here." },
  { slug: "connecticut", name: "Connecticut", abbr: "CT", kind: "progressive", single: [[2, 0], [4.5, 10000], [5.5, 50000], [6, 100000], [6.5, 200000], [6.9, 250000], [6.99, 500000]], married: [[2, 0], [4.5, 20000], [5.5, 100000], [6, 200000], [6.5, 400000], [6.9, 500000], [6.99, 1000000]], std: [0, 0] },
  { slug: "delaware", name: "Delaware", abbr: "DE", kind: "progressive", single: [[2.2, 2000], [3.9, 5000], [4.8, 10000], [5.2, 20000], [5.55, 25000], [6.6, 60000]], married: [[2.2, 2000], [3.9, 5000], [4.8, 10000], [5.2, 20000], [5.55, 25000], [6.6, 60000]], std: [3250, 6500] },
  { slug: "district-of-columbia", name: "District of Columbia", abbr: "DC", kind: "progressive", single: [[4, 0], [6, 10000], [6.5, 40000], [8.5, 60000], [9.25, 250000], [9.75, 500000], [10.75, 1000000]], married: [[4, 0], [6, 10000], [6.5, 40000], [8.5, 60000], [9.25, 250000], [9.75, 500000], [10.75, 1000000]], std: [15000, 30000] },
  { slug: "hawaii", name: "Hawaii", abbr: "HI", kind: "progressive", single: [[1.4, 0], [3.2, 9600], [5.5, 14400], [6.4, 19200], [6.8, 24000], [7.2, 36000], [7.6, 48000], [7.9, 125000], [8.25, 175000], [9, 225000], [10, 275000], [11, 325000]], married: [[1.4, 0], [3.2, 19200], [5.5, 28800], [6.4, 38400], [6.8, 48000], [7.2, 72000], [7.6, 96000], [7.9, 250000], [8.25, 350000], [9, 450000], [10, 550000], [11, 650000]], std: [4400, 8800] },
  { slug: "kansas", name: "Kansas", abbr: "KS", kind: "progressive", single: [[5.2, 0], [5.58, 23000]], married: [[5.2, 0], [5.58, 46000]], std: [3605, 8240] },
  { slug: "maine", name: "Maine", abbr: "ME", kind: "progressive", single: [[5.8, 0], [6.75, 26800], [7.15, 63450]], married: [[5.8, 0], [6.75, 53600], [7.15, 126900]], std: [15000, 30000] },
  { slug: "maryland", name: "Maryland", abbr: "MD", kind: "progressive", single: [[2, 0], [3, 1000], [4, 2000], [4.75, 3000], [5, 100000], [5.25, 125000], [5.5, 150000], [5.75, 250000]], married: [[2, 0], [3, 1000], [4, 2000], [4.75, 3000], [5, 150000], [5.25, 175000], [5.5, 225000], [5.75, 300000]], std: [2700, 5450], note: "Maryland counties levy a local income tax on top of the state rate (not included here)." },
  { slug: "massachusetts", name: "Massachusetts", abbr: "MA", kind: "progressive", single: [[5, 0], [9, 1083150]], married: [[5, 0], [9, 1083150]], std: [4400, 8800] },
  { slug: "minnesota", name: "Minnesota", abbr: "MN", kind: "progressive", single: [[5.35, 0], [6.8, 32570], [7.85, 106990], [9.85, 198630]], married: [[5.35, 0], [6.8, 47620], [7.85, 189180], [9.85, 330410]], std: [14950, 29900] },
  { slug: "missouri", name: "Missouri", abbr: "MO", kind: "progressive", single: [[2, 1313], [2.5, 2626], [3, 3939], [3.5, 5252], [4, 6565], [4.5, 7878], [4.7, 9191]], married: [[2, 1313], [2.5, 2626], [3, 3939], [3.5, 5252], [4, 6565], [4.5, 7878], [4.7, 9191]], std: [15000, 30000], note: "Kansas City and St. Louis levy a 1% local earnings tax (not included here)." },
  { slug: "montana", name: "Montana", abbr: "MT", kind: "progressive", single: [[4.7, 0], [5.9, 21100]], married: [[4.7, 0], [5.9, 42200]], std: [15000, 30000] },
  { slug: "nebraska", name: "Nebraska", abbr: "NE", kind: "progressive", single: [[2.46, 0], [3.51, 4030], [5.01, 24120], [5.2, 38870]], married: [[2.46, 0], [3.51, 8040], [5.01, 48250], [5.2, 77730]], std: [8600, 17200] },
  { slug: "new-jersey", name: "New Jersey", abbr: "NJ", kind: "progressive", single: [[1.4, 0], [1.75, 20000], [3.5, 35000], [5.525, 40000], [6.37, 75000], [8.97, 500000], [10.75, 1000000]], married: [[1.4, 0], [1.75, 20000], [2.45, 50000], [3.5, 70000], [5.525, 80000], [6.37, 150000], [8.97, 500000], [10.75, 1000000]], std: [0, 0] },
  { slug: "new-mexico", name: "New Mexico", abbr: "NM", kind: "progressive", single: [[1.5, 0], [3.2, 5500], [4.3, 16500], [4.7, 33500], [4.9, 66500], [5.9, 210000]], married: [[1.5, 0], [3.2, 8000], [4.3, 25000], [4.7, 50000], [4.9, 100000], [5.9, 315000]], std: [15000, 30000] },
  { slug: "new-york", name: "New York", abbr: "NY", kind: "progressive", single: [[4, 0], [4.5, 8500], [5.25, 11700], [5.5, 13900], [6, 80650], [6.85, 215400], [9.65, 1077550], [10.3, 5000000], [10.9, 25000000]], married: [[4, 0], [4.5, 17150], [5.25, 23600], [5.5, 27900], [6, 161550], [6.85, 323200], [9.65, 2155350], [10.3, 5000000], [10.9, 25000000]], std: [8000, 16050], note: "New York City and Yonkers residents owe an additional local income tax (not included here)." },
  { slug: "north-dakota", name: "North Dakota", abbr: "ND", kind: "progressive", single: [[1.95, 48475], [2.5, 244825]], married: [[1.95, 80975], [2.5, 298075]], std: [15000, 30000] },
  { slug: "ohio", name: "Ohio", abbr: "OH", kind: "progressive", single: [[2.75, 26050], [3.5, 100000]], married: [[2.75, 26050], [3.5, 100000]], std: [0, 0], note: "Many Ohio cities levy a local income tax (not included here); income below ~$26,050 is untaxed by the state." },
  { slug: "oklahoma", name: "Oklahoma", abbr: "OK", kind: "progressive", single: [[0.25, 0], [0.75, 1000], [1.75, 2500], [2.75, 3750], [3.75, 4900], [4.75, 7200]], married: [[0.25, 0], [0.75, 2000], [1.75, 5000], [2.75, 7500], [3.75, 9800], [4.75, 14400]], std: [6350, 12700] },
  { slug: "oregon", name: "Oregon", abbr: "OR", kind: "progressive", single: [[4.75, 0], [6.75, 4400], [8.75, 11050], [9.9, 125000]], married: [[4.75, 0], [6.75, 8800], [8.75, 22100], [9.9, 250000]], std: [2800, 5600] },
  { slug: "rhode-island", name: "Rhode Island", abbr: "RI", kind: "progressive", single: [[3.75, 0], [4.75, 79900], [5.99, 181650]], married: [[3.75, 0], [4.75, 79900], [5.99, 181650]], std: [10900, 21800] },
  { slug: "south-carolina", name: "South Carolina", abbr: "SC", kind: "progressive", single: [[0, 0], [3, 3560], [6.2, 17830]], married: [[0, 0], [3, 3560], [6.2, 17830]], std: [15000, 30000] },
  { slug: "vermont", name: "Vermont", abbr: "VT", kind: "progressive", single: [[3.35, 0], [6.6, 47900], [7.6, 116000], [8.75, 242000]], married: [[3.35, 0], [6.6, 79950], [7.6, 193300], [8.75, 294600]], std: [7400, 14850] },
  { slug: "virginia", name: "Virginia", abbr: "VA", kind: "progressive", single: [[2, 0], [3, 3000], [5, 5000], [5.75, 17000]], married: [[2, 0], [3, 3000], [5, 5000], [5.75, 17000]], std: [8500, 17000] },
  { slug: "west-virginia", name: "West Virginia", abbr: "WV", kind: "progressive", single: [[2.22, 0], [2.96, 10000], [3.33, 25000], [4.44, 40000], [4.82, 60000]], married: [[2.22, 0], [2.96, 10000], [3.33, 25000], [4.44, 40000], [4.82, 60000]], std: [0, 0] },
  { slug: "wisconsin", name: "Wisconsin", abbr: "WI", kind: "progressive", single: [[3.5, 0], [4.4, 14680], [5.3, 29370], [7.65, 323290]], married: [[3.5, 0], [4.4, 19580], [5.3, 39150], [7.65, 431060]], std: [13560, 25110] },
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
