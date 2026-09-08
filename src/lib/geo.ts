// Geo-router: decides whether a lead's building location falls inside
// Shafiq's DC/VA/MD service area (local) or needs a referral elsewhere.
// Pure function, no DOM -- used from the get-started page and the NOI
// quick-check tool.

const STATE_PATTERNS: RegExp[] = [
  /\bd\.?c\.?\b/i,
  /\bvirginia\b/i,
  /\bva\b/i,
  /\bmaryland\b/i,
  /\bmd\b/i,
]

// [min, max] ZIP prefix ranges (first three digits) that fall inside
// the DC/VA/MD service area.
const ZIP_PREFIX_RANGES: Array<[number, number]> = [
  [200, 200], // DC
  [202, 202], // DC
  [206, 219], // MD
  [220, 246], // VA
]

function zipInServiceArea(input: string): boolean {
  const zipMatch = input.match(/\b(\d{5})\b/)
  if (!zipMatch) return false
  const prefix = Number(zipMatch[1].slice(0, 3))
  return ZIP_PREFIX_RANGES.some(([min, max]) => prefix >= min && prefix <= max)
}

function stateInServiceArea(input: string): boolean {
  return STATE_PATTERNS.some((pattern) => pattern.test(input))
}

export function routeByLocation(input: string): 'local' | 'referral' {
  const trimmed = input.trim()
  if (zipInServiceArea(trimmed) || stateInServiceArea(trimmed)) {
    return 'local'
  }
  return 'referral'
}
