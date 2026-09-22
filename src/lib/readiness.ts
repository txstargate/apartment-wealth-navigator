// Refinance readiness score: five statements scored 1 to 5, bands from the
// funnel's "Gauge Owner Stage of Preparedness" document (2026). Pure, so
// the landing page's script and the tests share one definition.

export interface ReadinessBand {
  label: string
  advice: string
  min: number
}

export const READINESS_BANDS: ReadinessBand[] = [
  { min: 22, label: 'Strong position', advice: 'Likely refinance-ready. Use the checklist to confirm the file before you shop lenders.' },
  { min: 16, label: 'Some risk', advice: 'Preparation needed. Close the gaps the checklist shows before you apply.' },
  { min: 0, label: 'High risk', advice: 'Do not talk to a lender yet. Work the trailing numbers and the explanations first.' },
]

export function readinessTotal(scores: number[]): number {
  if (scores.length !== 5) throw new Error('five scores expected')
  for (const s of scores) if (!Number.isInteger(s) || s < 1 || s > 5) throw new Error('scores are 1 to 5')
  return scores.reduce((a, b) => a + b, 0)
}

export function readinessBand(total: number): ReadinessBand {
  return READINESS_BANDS.find((b) => total >= b.min) ?? READINESS_BANDS[READINESS_BANDS.length - 1]
}
