// Draft filtering. Pure function, no DOM -- used by both insights pages
// so a draft: true entry never gets a route, a listing entry, or a
// sitemap entry. See fable-plan-review.md C2.

export interface DraftableEntry {
  data: { draft?: boolean }
}

export function filterPublished<T extends DraftableEntry>(entries: T[]): T[] {
  return entries.filter((entry) => !entry.data.draft)
}
