import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// NOI Navigator (2026-09-22): the first GoHighLevel funnel moved onto the
// site. The offer, the form, the on-page checklist delivery, FAQ schema,
// and the absence of the funnel's unverified testimonials are all guarded.

const page = readFileSync('src/pages/noi-navigator.astro', 'utf8')

test('the page posts to the same GHL webhook, tagged NOI Navigator, with an on-page checklist download', () => {
  expect(page).toContain("toolName: 'NOI Navigator'")
  expect(page).toContain("import { buildLeadPayload, submitLead } from '../lib/ghl'")
  expect(page).toContain("CHECKLIST_PATH = '/downloads/noi-leak-audit-checklist.pdf'")
  expect(page).toContain('href={CHECKLIST_PATH} download')
  expect(existsSync('public/downloads/noi-leak-audit-checklist.pdf')).toBe(true)
  expect(existsSync('src/downloads/noi-leak-audit-checklist.html')).toBe(true)
})

test('the page is a landing page: minimal header, form in the hero, proof from real cases, FAQ schema', () => {
  expect(page).toMatch(/<Base[\s\S]*?\blanding\b[\s\S]*?>/)
  expect(readFileSync('src/layouts/Base.astro', 'utf8')).toContain('<Header minimal={landing} />')
  expect(readFileSync('src/components/Header.astro', 'utf8')).toContain('{!minimal && (')
  expect(page).toContain('buildFaqSchema(faq)')
  expect(page).toContain('<JsonLd data={faqSchema} />')
  expect(page).toContain('The first call is free.')
  expect(page).toContain("import { RESULTS } from '../data/results'")
  expect(page).toContain("import { TESTIMONIALS } from '../data/testimonials'")
  expect(page).toContain('TESTIMONIALS.length > 0 &&')
  expect(page).toContain('href="/results/"')
  expect(page).toContain('class="sticky-cta"')
})

test('every testimonial carries a source and consent, and the page renders them above the result cards', () => {
  const t = readFileSync('src/data/testimonials.ts', 'utf8')
  const entries = t.match(/quote:/g) ?? []
  expect(entries.length).toBeGreaterThanOrEqual(1)
  expect((t.match(/source:/g) ?? []).length).toBe(entries.length)
  expect((t.match(/consent: true/g) ?? []).length).toBe(entries.length)
  expect(t).not.toContain('\u2014')
  expect(page.indexOf('<h2>What owners say</h2>')).toBeLessThan(page.indexOf('What the work produced'))
})

test('no funnel testimonials or invented names travel with the page', () => {
  for (const name of ['Priya', 'Sandra K', 'David R', 'Owner, 18-Unit', 'Owner, 64-Unit', 'Owner, 34-Unit']) {
    expect(page).not.toContain(name)
  }
  expect(page).not.toContain('—')
  expect(page).not.toContain('Blueprint')
  expect(page).not.toContain('Partnership')
})

test('the checklist source uses only the five audit questions from the NOI guide', () => {
  const html = readFileSync('src/downloads/noi-leak-audit-checklist.html', 'utf8')
  const guide = readFileSync('src/content/universal/how-to-increase-noi-small-apartment-building.mdx', 'utf8')
  for (const lever of ['Revenue capture', 'Utilities', 'Vendors', 'Turns', 'Systems']) expect(html).toContain(lever)
  expect(html).toContain('15 percent')
  expect(guide).toContain('15 percent')
  expect(html).toContain('90 to 120 days')
  expect(html).not.toContain('—')
})

test('the navigator is in the sitemap dates map and llms.txt', () => {
  expect(readFileSync('src/lib/sitemap-lastmod.ts', 'utf8')).toContain("'/noi-navigator': 'src/pages/noi-navigator.astro'")
  expect(readFileSync('src/lib/llms.ts', 'utf8')).toContain('/noi-navigator/')
})
