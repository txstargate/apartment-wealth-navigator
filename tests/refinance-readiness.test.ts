import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { readinessBand, readinessTotal } from '../src/lib/readiness'

// Refinance Readiness (2026-09-22): second funnel moved onto the site.

const page = readFileSync('src/pages/refinance-readiness.astro', 'utf8')

test('readiness score sums five 1-to-5 answers and bands them as the funnel did', () => {
  expect(readinessTotal([5, 5, 4, 4, 4])).toBe(22)
  expect(readinessBand(25).label).toBe('Strong position')
  expect(readinessBand(22).label).toBe('Strong position')
  expect(readinessBand(21).label).toBe('Some risk')
  expect(readinessBand(16).label).toBe('Some risk')
  expect(readinessBand(15).label).toBe('High risk')
  expect(() => readinessTotal([5, 5, 5, 5])).toThrow()
  expect(() => readinessTotal([0, 5, 5, 5, 5])).toThrow()
})

test('the page posts tagged Refinance Readiness with the score and maturity in the message, and delivers the checklist on the page', () => {
  expect(page).toContain("toolName: 'Refinance Readiness'")
  expect(page).toContain('Readiness score ${total}/25')
  expect(page).toContain('Loan maturity ${maturity}')
  expect(page).toContain("KIT_PATH = '/downloads/lender-ready-package-checklist.pdf'")
  expect(page).toContain('href={KIT_PATH} download')
  expect(existsSync('public/downloads/lender-ready-package-checklist.pdf')).toBe(true)
})

test('the five statements match the funnel quiz and the page is a landing page with schema and proof', () => {
  for (const s of [
    'I can clearly explain how a lender would calculate my NOI',
    'My income and expenses are clean, documented, and defensible',
    'I understand how DSCR changes with different interest rates',
    'I have explanations ready for vacancy, expenses, or anomalies',
  ]) expect(page).toContain(s)
  expect(page).toMatch(/<Base[\s\S]*?\blanding\b[\s\S]*?>/)
  expect(page).toContain('<JsonLd data={faqSchema} />')
  expect(page).toContain("import { TESTIMONIALS } from '../data/testimonials'")
  expect(page).toContain("import { RESULTS } from '../data/results'")
  expect(page).toContain('class="sticky-cta"')
  expect(page).toContain('The first call is free.')
  expect(page).not.toContain('—')
  expect(page).not.toContain('Blueprint')
})

test('the checklist source carries the four sections, the lender lens lines and the 18-month clock', () => {
  const html = readFileSync('src/downloads/lender-ready-package-checklist.html', 'utf8')
  for (const s of ['Financial package', 'Operations snapshot', 'The property', 'narrative']) expect(html).toContain(s)
  expect((html.match(/Lender lens:/g) ?? []).length).toBe(4)
  expect(html).toContain('18 months before maturity')
  expect(html).not.toContain('—')
  expect(html).not.toContain('nest 12 months')
})

test('the page is in the sitemap dates map, llms.txt, and linked from the refinance service and guide', () => {
  expect(readFileSync('src/lib/sitemap-lastmod.ts', 'utf8')).toContain("'/refinance-readiness': 'src/pages/refinance-readiness.astro'")
  expect(readFileSync('src/lib/llms.ts', 'utf8')).toContain('/refinance-readiness/')
  expect(readFileSync('src/content/services/refinance.md', 'utf8')).toContain('/refinance-readiness/')
  expect(readFileSync('src/content/universal/how-to-refinance-small-apartment-building.mdx', 'utf8')).toContain('/refinance-readiness/')
})
