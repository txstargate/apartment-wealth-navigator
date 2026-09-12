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

// Case-insensitive DC/VA/MD service-area city and town names, so a bare
// city with no state or ZIP still routes local. See fable-plan-review.md C1.
const SERVICE_AREA_CITIES: string[] = [
  'washington',
  'arlington',
  'alexandria',
  'fairfax',
  'reston',
  'herndon',
  'ashburn',
  'sterling',
  'tysons',
  'mclean',
  'vienna',
  'falls church',
  'bethesda',
  'silver spring',
  'rockville',
  'gaithersburg',
  'chevy chase',
  'hyattsville',
  'college park',
  'takoma park',
  'laurel',
  'bowie',
  'annapolis',
]

// [min, max] ZIP prefix ranges (first three digits) that fall inside
// the DC/VA/MD service area.
const ZIP_PREFIX_RANGES: Array<[number, number]> = [
  [200, 200], // DC
  [202, 205], // DC
  [201, 201], // Northern Virginia (Reston, Herndon, Ashburn, Sterling...)
  [220, 246], // VA
  [206, 219], // MD
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

function cityInServiceArea(input: string): boolean {
  const lower = input.toLowerCase()
  return SERVICE_AREA_CITIES.some((city) => new RegExp(`\\b${city}\\b`).test(lower))
}

export function routeByLocation(input: string): 'local' | 'referral' {
  const trimmed = input.trim()
  if (zipInServiceArea(trimmed) || stateInServiceArea(trimmed) || cityInServiceArea(trimmed)) {
    return 'local'
  }
  return 'referral'
}
