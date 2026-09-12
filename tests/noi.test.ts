import { test, expect } from 'vitest'
import { computeNoi, healthCheck, valueSensitivity } from '../src/lib/noi'

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

test('healthCheck flags an expense ratio above the typical range as high', () => {
  expect(healthCheck(0.6, { low: 0.35, high: 0.55 })).toBe('high')
})

test('healthCheck flags an expense ratio inside the typical range as normal', () => {
  expect(healthCheck(0.45, { low: 0.35, high: 0.55 })).toBe('normal')
})

test('healthCheck flags an expense ratio below the typical range as lean', () => {
  expect(healthCheck(0.3, { low: 0.35, high: 0.55 })).toBe('lean')
})

test('healthCheck treats the range boundaries as normal', () => {
  expect(healthCheck(0.35, { low: 0.35, high: 0.55 })).toBe('normal')
  expect(healthCheck(0.55, { low: 0.35, high: 0.55 })).toBe('normal')
})

test('valueSensitivity is about 16,667 per $1,000 of NOI at a 6% cap rate', () => {
  expect(valueSensitivity(0.06)).toBeCloseTo(16666.67, 1)
})
