import { test, expect } from 'vitest'
import { computeStressTest, loanConstant, parseAmount, readDecision } from '../src/lib/stress-test'

// Video 1 example, content file deal-stress-test-v2.md: 12 units, gross
// 266,400, 5 percent vacancy, expenses as presented 93,072, added
// management 10,000, insurance repriced +4,000.
const video1 = {
  grossPotentialRent: 266400,
  vacancyPct: 5,
  otherIncome: 0,
  operatingExpenses: 93072,
  managementFee: 10000,
  insuranceRepricing: 4000,
  otherAdjustments: 0,
  reserves: 0,
  askingPrice: 2800000,
  targetCapRate: 6,
  interestRate: 6.5,
  amortizationYears: 25,
  requiredDscr: 1.25,
}

test('Video 1 stressed NOI is 146,008 and value is 2,433,467 at a 6 percent cap rate', () => {
  const r = computeStressTest(video1)
  expect(r.stressedNoi).toBe(146008)
  expect(Math.round(r.stressedValue!)).toBe(2433467)
  expect(Math.round(r.gapToAsking!)).toBe(-366533)
})

test('loan constant at 6.5 percent over 25 years is 0.08102', () => {
  expect(loanConstant(6.5, 25)).toBeCloseTo(0.08102, 5)
})

test('Video 1 maximum loan is about 1,441,500 at 1.25x, 6.5 percent, 25 years', () => {
  const r = computeStressTest(video1)
  expect(r.maxAnnualDebtService).toBeCloseTo(116806.4, 1)
  expect(r.maxLoan!).toBeGreaterThan(1441000)
  expect(r.maxLoan!).toBeLessThan(1442000)
  expect(Math.abs(r.maxLoan! - 1441500)).toBeLessThan(200)
})

test('equity needed at the asking price and at the stressed value', () => {
  const r = computeStressTest(video1)
  expect(r.equityAtAsking!).toBeCloseTo(2800000 - r.maxLoan!, 5)
  expect(r.equityAtStressedValue!).toBeCloseTo(r.stressedValue! - r.maxLoan!, 5)
})

test('seller case (vacancy 2 percent, no added lines) gives NOI 168,000', () => {
  const r = computeStressTest({ ...video1, vacancyPct: 2, managementFee: 0, insuranceRepricing: 0 })
  expect(r.stressedNoi).toBe(168000)
  expect(Math.round(r.stressedValue!)).toBe(2800000)
})

test('other income, other adjustments and reserves move NOI as expected', () => {
  const r = computeStressTest({ ...video1, otherIncome: 5000, otherAdjustments: 2000, reserves: 3000 })
  expect(r.stressedNoi).toBe(146008 + 5000 - 2000 - 3000)
})

test('a blank cap rate leaves value outputs empty but still sizes the loan', () => {
  const r = computeStressTest({ ...video1, targetCapRate: undefined })
  expect(r.stressedValue).toBeUndefined()
  expect(r.gapToAsking).toBeUndefined()
  expect(r.equityAtStressedValue).toBeUndefined()
  expect(r.maxLoan!).toBeGreaterThan(0)
})

test('a blank asking price leaves price outputs empty', () => {
  const r = computeStressTest({ ...video1, askingPrice: undefined })
  expect(r.gapToAsking).toBeUndefined()
  expect(r.equityAtAsking).toBeUndefined()
  expect(r.stressedValue).toBeDefined()
})

test('zero interest rate uses straight-line amortization', () => {
  expect(loanConstant(0, 25)).toBeCloseTo(1 / 25, 10)
})

test('negative NOI gives zero loan and no negative equity swing', () => {
  const r = computeStressTest({ ...video1, operatingExpenses: 400000 })
  expect(r.stressedNoi).toBeLessThan(0)
  expect(r.maxLoan).toBe(0)
})

test('equity at the asking price never goes below zero', () => {
  const r = computeStressTest({ ...video1, askingPrice: 1000000 })
  expect(r.equityAtAsking).toBe(0)
})

test('parseAmount reads dollars, commas and blanks', () => {
  expect(parseAmount('$266,400')).toBe(266400)
  expect(parseAmount(' 6.5 ')).toBe(6.5)
  expect(parseAmount('')).toBeUndefined()
  expect(parseAmount('abc')).toBeUndefined()
})

test('decision: counter when stressed value is below asking', () => {
  const d = readDecision(computeStressTest(video1))
  expect(d.verdict).toBe('counter')
  expect(d.text).toContain('Offer your number')
})

test('decision: go when stressed value meets asking and cash is not a constraint', () => {
  const d = readDecision(computeStressTest({ ...video1, askingPrice: 2400000 }))
  expect(d.verdict).toBe('go')
})

test('decision: walk when the cash you can bring is below the equity needed', () => {
  const r = computeStressTest({ ...video1, availableCash: 500000 })
  expect(readDecision(r).verdict).toBe('walk')
})

test('decision: go stays go when the cash covers the equity needed', () => {
  const r = computeStressTest({ ...video1, askingPrice: 2400000, availableCash: 2000000 })
  expect(readDecision(r).verdict).toBe('go')
})

test('decision: walk when stressed NOI is zero or negative', () => {
  const r = computeStressTest({ ...video1, operatingExpenses: 400000 })
  expect(readDecision(r).verdict).toBe('walk')
})

test('decision: incomplete without a cap rate or asking price', () => {
  expect(readDecision(computeStressTest({ ...video1, targetCapRate: undefined })).verdict).toBe('incomplete')
  expect(readDecision(computeStressTest({ ...video1, askingPrice: undefined })).verdict).toBe('incomplete')
})
