// Analytics consent logic. Pure functions, no DOM -- used by
// src/components/Analytics.astro to decide whether GA4/Meta Pixel
// scripts load and whether the consent banner shows.

export type ConsentStatus = 'granted' | 'denied' | 'unset'

export const CONSENT_KEY = 'aw-analytics-consent'

export function parseConsent(raw: string | null): ConsentStatus {
  if (raw === 'granted') return 'granted'
  if (raw === 'denied') return 'denied'
  return 'unset'
}

export function shouldLoadAnalytics(consent: ConsentStatus): boolean {
  return consent === 'granted'
}

export function shouldShowConsentBanner(consent: ConsentStatus): boolean {
  return consent === 'unset'
}
