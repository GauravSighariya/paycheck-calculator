// Tax engine — Tax Year 2025 (federal) + latest published state rates.
// Figures are estimates for planning only, NOT tax advice. Each constant is
// kept in this one file so it is trivial to update each tax year.

export type FilingStatus = "single" | "married";

export type PayFrequency =
  | "annual"
  | "monthly"
  | "semimonthly"
  | "biweekly"
  | "weekly"
  | "hourly";

export interface Bracket {
  /** Upper bound of this bracket (taxable income). null = no upper limit. */
  upTo: number | null;
  rate: number;
}

/** Apply progressive brackets to a taxable-income figure. */
export function applyBrackets(income: number, brackets: Bracket[]): number {
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (income <= prev) break;
    const cap = b.upTo ?? Infinity;
    const taxableInThisBand = Math.min(income, cap) - prev;
    tax += taxableInThisBand * b.rate;
    prev = cap;
  }
  return tax;
}

// ---------- Federal (2025) ----------

export const FEDERAL = {
  year: 2025,
  standardDeduction: { single: 15000, married: 30000 } as Record<FilingStatus, number>,
  brackets: {
    single: [
      { upTo: 11925, rate: 0.1 },
      { upTo: 48475, rate: 0.12 },
      { upTo: 103350, rate: 0.22 },
      { upTo: 197300, rate: 0.24 },
      { upTo: 250525, rate: 0.32 },
      { upTo: 626350, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
    married: [
      { upTo: 23850, rate: 0.1 },
      { upTo: 96950, rate: 0.12 },
      { upTo: 206700, rate: 0.22 },
      { upTo: 394600, rate: 0.24 },
      { upTo: 501050, rate: 0.32 },
      { upTo: 751600, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
  } as Record<FilingStatus, Bracket[]>,
};

// ---------- FICA (2025) ----------

export const FICA = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 176100, // 2025 wage base
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: { single: 200000, married: 250000 } as Record<FilingStatus, number>,
};

export interface StateTax {
  hasIncomeTax: boolean;
  standardDeduction?: Record<FilingStatus, number>;
  brackets?: Record<FilingStatus, Bracket[]>;
}

export const PERIODS_PER_YEAR: Record<Exclude<PayFrequency, "hourly">, number> = {
  annual: 1,
  monthly: 12,
  semimonthly: 24,
  biweekly: 26,
  weekly: 52,
};

export interface PaycheckInput {
  /** Gross amount for the chosen frequency. For "hourly" this is the hourly rate. */
  grossAmount: number;
  frequency: PayFrequency;
  /** Hours per week, only used when frequency === "hourly". */
  hoursPerWeek?: number;
  filingStatus: FilingStatus;
  /** 401(k)/pre-tax retirement contribution as a percent of gross (0-100). */
  retirement401kPercent?: number;
  state: StateTax;
}

export interface PaycheckResult {
  annualGross: number;
  retirement: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  /** Take-home cash = gross − taxes − 401k. */
  netAnnual: number;
  /** Net per pay period (the period the user selected). */
  netPerPeriod: number;
  /** Periods per year for the selected frequency. */
  periodsPerYear: number;
  effectiveTaxRate: number; // totalTax / annualGross
}

function annualizeGross(input: PaycheckInput): number {
  if (input.frequency === "hourly") {
    const hours = input.hoursPerWeek ?? 40;
    return input.grossAmount * hours * 52;
  }
  return input.grossAmount * PERIODS_PER_YEAR[input.frequency];
}

function periodsPerYear(input: PaycheckInput): number {
  if (input.frequency === "hourly") return 52; // report weekly take-home for hourly
  return PERIODS_PER_YEAR[input.frequency];
}

export function computePaycheck(input: PaycheckInput): PaycheckResult {
  const annualGross = annualizeGross(input);
  const retirement = annualGross * ((input.retirement401kPercent ?? 0) / 100);

  // Federal income tax — 401(k) is pre-tax for income tax (not for FICA).
  const fedTaxable = Math.max(
    0,
    annualGross - retirement - FEDERAL.standardDeduction[input.filingStatus],
  );
  const federalTax = applyBrackets(fedTaxable, FEDERAL.brackets[input.filingStatus]);

  // FICA — on gross wages (401k does NOT reduce these).
  const socialSecurity =
    Math.min(annualGross, FICA.socialSecurityWageBase) * FICA.socialSecurityRate;
  const medicare =
    annualGross * FICA.medicareRate +
    Math.max(0, annualGross - FICA.additionalMedicareThreshold[input.filingStatus]) *
      FICA.additionalMedicareRate;

  // State income tax.
  let stateTax = 0;
  if (input.state.hasIncomeTax && input.state.brackets && input.state.standardDeduction) {
    const stateTaxable = Math.max(
      0,
      annualGross - retirement - input.state.standardDeduction[input.filingStatus],
    );
    stateTax = applyBrackets(stateTaxable, input.state.brackets[input.filingStatus]);
  }

  const totalTax = federalTax + stateTax + socialSecurity + medicare;
  const netAnnual = annualGross - retirement - totalTax;
  const ppy = periodsPerYear(input);

  return {
    annualGross,
    retirement,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    totalTax,
    netAnnual,
    netPerPeriod: netAnnual / ppy,
    periodsPerYear: ppy,
    effectiveTaxRate: annualGross > 0 ? totalTax / annualGross : 0,
  };
}

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatUSDCents(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
