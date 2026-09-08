import { test, expect } from 'vitest'
import { routeByLocation } from '../src/lib/geo'

test('DC routes local', () => {
  expect(routeByLocation('Washington, DC')).toBe('local')
})

test('20009 routes local', () => {
  expect(routeByLocation('20009')).toBe('local')
})

test('Queens NY routes referral', () => {
  expect(routeByLocation('Queens, NY')).toBe('referral')
})

test('35801 Alabama routes referral', () => {
  expect(routeByLocation('35801')).toBe('referral')
})
