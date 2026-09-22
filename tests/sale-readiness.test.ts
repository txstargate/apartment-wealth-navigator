import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { scorecard, timingRead, SELL_SIGNALS, WAIT_SIGNALS, READINESS_STATEMENTS } from '../src/lib/scorecard'

// Sale Readiness Scorecard (2026-09-22): third funnel moved onto the site.

const page = readFileSync('src/pages/sale-readiness.astro', 'utf8')
const guide = readFileSync('src/content/universal/5-signals-time-to-sell-apartment-building.mdx', 'utf8')

test('the timing read follows the guide: two or more sell signals and no wait signal says sell; a wait signal that outweighs says wait', () => {
  expect(timingRead(0, 0).label).toBe('No signal yet')
  expect(timingRead(2, 0).label).toBe('The signals say sell')
  expect(timingRead(1, 0).label).toBe('Mixed signals')
  expect(timingRead(2, 1).label).toBe('Mixed signals')
  expect(timingRead(1, 1).label).toBe('Wait on purpose')
  expect(timingRead(0, 2).label).toBe('Wait on purpose')
})

test('the scorecard combines timing and a banded readiness score out of 25', () => {
  const r = scorecard([true, true, false, false, false], [false, false, false], [5, 5, 4, 4, 4])
  expect(r.readinessTotal).toBe(22)
  expect(r.readiness.label).toBe('Strong position')
  expect(r.summary).toBe('Timing: The signals say sell (2 sell, 0 wait). Readiness: 22/25, Strong position.')
  expect(SELL_SIGNALS.length).toBe(5)
  expect(WAIT_SIGNALS.length).toBe(3)
  expect(READINESS_STATEMENTS.length).toBe(5)
})

test('the five sell signals and three wait signals are the ones the published guide names', () => {
  for (const s of ['loan maturing inside 24 months', 'capital expense wall', 'NOI ceiling', 'partnership change or a life event']) expect(guide).toContain(s)
  for (const s of ['Unrecovered NOI leaks', 'mid-repositioning', 'prepayment penalty']) expect(guide).toContain(s)
})

test('the page posts tagged Sale Readiness Scorecard with the read and horizon in the message, delivers the PDF, and is a landing page with schema', () => {
  expect(page).toContain("toolName: 'Sale Readiness Scorecard'")
  expect(page).toContain('read.summary')
  expect(page).toContain('Horizon: ${horizon}')
  expect(page).toContain("SCORECARD_PATH = '/downloads/sale-readiness-scorecard.pdf'")
  expect(page).toContain('href={SCORECARD_PATH} download')
  expect(existsSync('public/downloads/sale-readiness-scorecard.pdf')).toBe(true)
  expect(page).toMatch(/<Base[\s\S]*?\blanding\b[\s\S]*?>/)
  expect(page).toContain('<JsonLd data={faqSchema} />')
  expect(page).toContain("import { TESTIMONIALS } from '../data/testimonials'")
  expect(page).toContain('class="sticky-cta"')
  expect(page).toContain('The scorecard is free. So is the call.')
  expect(page).not.toContain('—')
  expect(page).not.toContain('Sell With Confidence')
  expect(page).not.toContain('\u{1F862}')
})

test('the scorecard source carries both halves, the bands and the 15-minute check', () => {
  const html = readFileSync('src/downloads/sale-readiness-scorecard.html', 'utf8')
  expect(html).toContain('Part A. Timing')
  expect(html).toContain('Part B. Readiness')
  expect(html).toContain('22 to 25')
  expect(html).toContain('The 15-minute check')
  expect(html).not.toContain('—')
})

test('the page is in the sitemap dates map, llms.txt, and linked from the sale service and guides', () => {
  expect(readFileSync('src/lib/sitemap-lastmod.ts', 'utf8')).toContain("'/sale-readiness': 'src/pages/sale-readiness.astro'")
  expect(readFileSync('src/lib/llms.ts', 'utf8')).toContain('/sale-readiness/')
  expect(readFileSync('src/content/services/sale.md', 'utf8')).toContain('/sale-readiness/')
  expect(readFileSync('src/content/universal/how-to-prepare-apartment-building-for-sale.mdx', 'utf8')).toContain('/sale-readiness/')
  expect(guide).toContain('/sale-readiness/')
})
