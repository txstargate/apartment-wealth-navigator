// NOI quick-check math. Pure function, no DOM -- used by the
// /tools/noi-check page. See noi-quick-check-spec.md for the
// calculation contract and the honesty guardrails around it.

export interface NoiInput {
  units: number
  grossAnnualRent: number
  annualOpex?: number
  marketRentPerUnit: number
  opexRatio?: number
  capRate: number
}

export interface NoiResult {
  currentNoi: number
  potentialNoi: number
  noiGap: number
  valueImpact: number
}

export function computeNoi(input: NoiInput): NoiResult {
  const { units, grossAnnualRent, annualOpex, marketRentPerUnit, opexRatio, capRate } = input
  const potentialGross = units * marketRentPerUnit * 12

  let currentNoi: number
  let potentialNoi: number

  if (annualOpex !== undefined) {
    currentNoi = grossAnnualRent - annualOpex
    potentialNoi = potentialGross - annualOpex
  } else {
    const ratio = opexRatio ?? 0
    currentNoi = grossAnnualRent * (1 - ratio)
    potentialNoi = potentialGross * (1 - ratio)
  }

  const noiGap = potentialNoi - currentNoi
  const valueImpact = noiGap / capRate

  return { currentNoi, potentialNoi, noiGap, valueImpact }
}

export interface OpexRatioRange {
  low: number
  high: number
}

// Health-check mode: when no market-rent benchmark exists for the ZIP,
// compare the owner's expense ratio to a typical range instead of
// claiming a specific market-rent gap. See noi-quick-check-spec.md.
export function healthCheck(opexRatio: number, typicalRange: OpexRatioRange): 'high' | 'normal' | 'lean' {
  if (opexRatio > typicalRange.high) return 'high'
  if (opexRatio < typicalRange.low) return 'lean'
  return 'normal'
}

// Value per $1,000 of annual NOI at a given cap rate, shown in
// Health-check mode so the owner sees value sensitivity without a
// fabricated market-rent gap.
export function valueSensitivity(capRate: number): number {
  return 1000 / capRate
}
