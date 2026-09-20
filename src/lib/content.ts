// Draft filtering. Pure function, no DOM -- used by both insights pages
// so a draft: true entry never gets a route, a listing entry, or a
// sitemap entry. See fable-plan-review.md C2.

export interface DraftableEntry {
  data: { draft?: boolean }
}

export function filterPublished<T extends DraftableEntry>(entries: T[]): T[] {
  return entries.filter((entry) => !entry.data.draft)
}

// Listing order for the Insights page (2026-09-20, when 14 video companions
// joined the four pillar guides). Alphabetical file order put "5 Signals"
// above the guides. Reading order instead: pillar by pillar, the guide (the
// entry that has a DC counterpart) first, then its deep dives by title.
export const PILLAR_ORDER = ['valuation', 'noi', 'refinance', 'sale'] as const

export interface OrderableEntry {
  data: { pillar: string; title: string; dcCounterpart?: string }
}

export function orderInsights<T extends OrderableEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const pa = PILLAR_ORDER.indexOf(a.data.pillar as (typeof PILLAR_ORDER)[number])
    const pb = PILLAR_ORDER.indexOf(b.data.pillar as (typeof PILLAR_ORDER)[number])
    if (pa !== pb) return pa - pb
    const ha = a.data.dcCounterpart ? 0 : 1
    const hb = b.data.dcCounterpart ? 0 : 1
    if (ha !== hb) return ha - hb
    return a.data.title.localeCompare(b.data.title)
  })
}
