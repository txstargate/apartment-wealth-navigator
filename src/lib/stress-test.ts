// Deal Stress Test math for /buyernavigator/. Pure functions, no DOM, no
// storage, nothing sent anywhere. Content source: content/buyer-navigator/
// deal-stress-test-v2.md, Steps 2 to 6. Percent inputs are whole numbers
// (5 means 5 percent). Educational arithmetic, not an appraisal or advice.

export interface StressInput {
  grossPotentialRent: number
  vacancyPct: number
  otherIncome: number
  operatingExpenses: number
  managementFee: number
  insuranceRepricing: number
  otherAdjustments: number
  reserves: number
  askingPrice?: number
  targetCapRate?: number
  interestRate: number
  amortizationYears: number
  requiredDscr: number
  /** Optional: cash the buyer can put in after their own reserve. */
  availableCash?: number
}

export interface StressResult {
  vacancyLoss: number
  effectiveGrossIncome: number
  totalExpenses: number
  stressedNoi: number
  loanConstant: number
  maxAnnualDebtService: number
  maxLoan: number
  stressedValue?: number
  gapToAsking?: number
  askingPrice?: number
  equityAtAsking?: number
  equityAtStressedValue?: number
  availableCash?: number
}

/** Year-one payment per $1 of loan for a monthly-pay, fully amortizing loan. */
export function loanConstant(ratePct: number, years: number): number {
  const n = years * 12
  if (!(n > 0)) return 0
  const r = ratePct / 100 / 12
  if (r === 0) return 12 / n
  return (12 * r) / (1 - Math.pow(1 + r, -n))
}

/** Reads "$266,400", "6.5", " 5 " into a number. Blank or junk gives undefined. */
export function parseAmount(raw: string | null | undefined): number | undefined {
  if (raw === null || raw === undefined) return undefined
  const cleaned = raw.replace(/[$,%\s]/g, '')
  if (cleaned === '') return undefined
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}

export function computeStressTest(input: StressInput): StressResult {
  const vacancyLoss = input.grossPotentialRent * (input.vacancyPct / 100)
  const effectiveGrossIncome = input.grossPotentialRent - vacancyLoss + input.otherIncome
  const totalExpenses =
    input.operatingExpenses +
    input.managementFee +
    input.insuranceRepricing +
    input.otherAdjustments +
    input.reserves
  const stressedNoi = Math.round((effectiveGrossIncome - totalExpenses) * 100) / 100

  const constant = loanConstant(input.interestRate, input.amortizationYears)
  const maxAnnualDebtService = input.requiredDscr > 0 ? Math.max(0, stressedNoi) / input.requiredDscr : 0
  const maxLoan = constant > 0 ? maxAnnualDebtService / constant : 0

  const capRate = input.targetCapRate && input.targetCapRate > 0 ? input.targetCapRate / 100 : undefined
  const stressedValue = capRate !== undefined ? stressedNoi / capRate : undefined
  const asking = input.askingPrice && input.askingPrice > 0 ? input.askingPrice : undefined

  return {
    vacancyLoss,
    effectiveGrossIncome,
    totalExpenses,
    stressedNoi,
    loanConstant: constant,
    maxAnnualDebtService,
    maxLoan,
    stressedValue,
    gapToAsking: stressedValue !== undefined && asking !== undefined ? stressedValue - asking : undefined,
    askingPrice: asking,
    equityAtAsking: asking !== undefined ? Math.max(0, asking - maxLoan) : undefined,
    equityAtStressedValue: stressedValue !== undefined ? Math.max(0, stressedValue - maxLoan) : undefined,
    availableCash: input.availableCash,
  }
}

export type Verdict = 'go' | 'counter' | 'walk' | 'incomplete'

export interface Decision {
  verdict: Verdict
  label: string
  text: string
}

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

/**
 * Step 6 of the Deal Stress Test, in plain language.
 * Go: stressed value at or above asking and the cash fits.
 * Counter: stressed value below asking, offer your number.
 * Walk: NOI is not positive, or the cash needed breaks the cash you can bring.
 * The "price only works at the seller’s numbers" walk test needs the seller’s
 * NOI, which this tool does not take, so that case stays a human judgment.
 */
export function readDecision(r: StressResult): Decision {
  if (r.stressedNoi <= 0) {
    return { verdict: 'walk', label: 'Walk', text: 'Your stressed NOI is zero or negative. At these numbers the building does not carry itself.' }
  }
  if (r.stressedValue === undefined || r.askingPrice === undefined) {
    return {
      verdict: 'incomplete',
      label: 'Add two numbers',
      text: 'Enter the asking price and your target cap rate to get the go, counter or walk read.',
    }
  }
  const priceYouWouldPay = r.stressedValue >= r.askingPrice ? r.askingPrice : r.stressedValue
  const equity = Math.max(0, priceYouWouldPay - r.maxLoan)
  if (r.availableCash !== undefined && equity > r.availableCash) {
    return {
      verdict: 'walk',
      label: 'Walk',
      text: `The cash needed, ${usd(equity)} before closing costs, is more than the ${usd(r.availableCash)} you can bring. The building fails your buy box, whatever the cap rate says.`,
    }
  }
  if (r.stressedValue >= r.askingPrice) {
    return {
      verdict: 'go',
      label: 'Go',
      text: `Your stressed value is at or above the asking price. You need about ${usd(equity)} of equity, plus closing costs and your reserve. Confirm that fits your cash, then protect the price in the contract.`,
    }
  }
  return {
    verdict: 'counter',
    label: 'Counter',
    text: `Your stressed value is ${usd(r.askingPrice - r.stressedValue)} below the asking price. Offer your number, ${usd(r.stressedValue)}, and bring the worksheet line by line. If the seller will not move toward it, the price only works at the seller’s numbers. Walk.`,
  }
}
