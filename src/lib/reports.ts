// Monthly market reports: newest month first, drafts dropped. Pure, no Astro
// imports, so it is unit-testable.

export interface ReportLike {
  id: string
  data: { month: string; draft?: boolean }
}

export function orderReports<T extends ReportLike>(entries: T[]): T[] {
  return entries.filter((e) => !e.data.draft).sort((a, b) => b.data.month.localeCompare(a.data.month))
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}
