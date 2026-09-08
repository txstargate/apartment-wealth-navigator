import { test, expect } from 'vitest'
import { parseConsent, shouldLoadAnalytics, shouldShowConsentBanner, CONSENT_KEY } from '../src/lib/consent'

test('CONSENT_KEY is a stable localStorage key', () => {
  expect(CONSENT_KEY).toBe('aw-analytics-consent')
})

test('parseConsent reads granted', () => {
  expect(parseConsent('granted')).toBe('granted')
})

test('parseConsent reads denied', () => {
  expect(parseConsent('denied')).toBe('denied')
})

test('parseConsent treats null as unset', () => {
  expect(parseConsent(null)).toBe('unset')
})

test('parseConsent treats unrecognized values as unset', () => {
  expect(parseConsent('garbage')).toBe('unset')
})

test('shouldLoadAnalytics only fires on granted consent', () => {
  expect(shouldLoadAnalytics('granted')).toBe(true)
  expect(shouldLoadAnalytics('denied')).toBe(false)
  expect(shouldLoadAnalytics('unset')).toBe(false)
})

test('shouldShowConsentBanner only shows when consent is undecided', () => {
  expect(shouldShowConsentBanner('unset')).toBe(true)
  expect(shouldShowConsentBanner('granted')).toBe(false)
  expect(shouldShowConsentBanner('denied')).toBe(false)
})
