// Honeypot spam guard for the lead forms. A hidden "website" input sits in
// each form; a real owner never sees or fills it, so any non-empty value
// after trimming marks the submission as a bot. Honeypot only, no
// submission-time trap, so a real lead is never dropped by mistake.
export function isLikelyBot(honeypotValue: string | null | undefined): boolean {
  return Boolean(honeypotValue && honeypotValue.trim() !== '')
}
