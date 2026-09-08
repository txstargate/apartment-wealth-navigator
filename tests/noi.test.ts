import { test, expect } from 'vitest'
import { computeNoi } from '../src/lib/noi'

test('value impact from NOI gap and cap rate', () => {
  const r = computeNoi({ units: 4, grossAnnualRent: 96000, annualOpex: 40000, marketRentPerUnit: 2500, capRate: 0.06 })
  expect(r.currentNoi).toBe(56000)
  // potential gross = 4 * 2500 * 12 = 120000; potential NOI = 120000 - 40000 = 80000
  expect(r.potentialNoi).toBe(80000)
  expect(r.noiGap).toBe(24000)
  expect(r.valueImpact).toBe(400000)
})

test('opex ratio path when opex missing', () => {
  const r = computeNoi({ units: 4, grossAnnualRent: 96000, marketRentPerUnit: 2000, opexRatio: 0.4, capRate: 0.06 })
  // potential gross = 96000; potential NOI = 96000 * 0.6 = 57600
  expect(r.potentialNoi).toBe(57600)
})
