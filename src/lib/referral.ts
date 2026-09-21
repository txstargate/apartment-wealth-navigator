// Referral intake for buildings outside DC, VA and MD. Until Shafiq sets
// PUBLIC_REFERRAL_INTAKE_URL to a real form, the link is a pre-addressed
// email so an out-of-area owner always has a working next step. Never a
// placeholder string in an href.
export const REFERRAL_FALLBACK_MAILTO =
  'mailto:shirani@enterprisere.com?subject=' +
  encodeURIComponent('Referral request: apartment building outside DC, VA, MD')

export function referralIntakeUrl(envValue: string | undefined): string {
  const v = (envValue ?? '').trim()
  return /^https:\/\//.test(v) ? v : REFERRAL_FALLBACK_MAILTO
}
