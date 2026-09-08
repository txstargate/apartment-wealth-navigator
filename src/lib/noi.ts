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
