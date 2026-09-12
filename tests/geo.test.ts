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

test('20190 (Reston) routes local', () => {
  expect(routeByLocation('20190')).toBe('local')
})

test('Reston, VA routes local', () => {
  expect(routeByLocation('Reston, VA')).toBe('local')
})

test('Bethesda routes local', () => {
  expect(routeByLocation('Bethesda')).toBe('local')
})

test('Arlington routes local', () => {
  expect(routeByLocation('Arlington')).toBe('local')
})

test('Silver Spring, MD routes local', () => {
  expect(routeByLocation('Silver Spring, MD')).toBe('local')
})

test('20147 (Ashburn) routes local', () => {
  expect(routeByLocation('20147')).toBe('local')
})

test('20164 (Sterling) routes local', () => {
  expect(routeByLocation('20164')).toBe('local')
})

test('Alexandria routes local', () => {
  expect(routeByLocation('Alexandria')).toBe('local')
})

test('Rockville routes local', () => {
  expect(routeByLocation('Rockville')).toBe('local')
})
