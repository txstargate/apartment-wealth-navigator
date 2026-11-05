import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const page = readFileSync('src/pages/buyernavigator.astro', 'utf8')

test('posts to GHL as Buyer Navigator with honeypot and on-page PDF', () => {
  expect(page).toContain("toolName: 'Buyer Navigator'")
  expect(page).toMatch(/<input[^>]*name="website"[^>]*tabindex="-1"[^>]*>/)
  expect(page).toContain("import { isLikelyBot } from '../lib/antispam'")
  expect(page).toContain('href={CHECKLIST_PATH} download')
  expect(existsSync('public/downloads/deal-stress-test.pdf')).toBe(true)
  expect(existsSync('src/downloads/deal-stress-test.html')).toBe(true)
})

test('landing page with the agreed kicker, FAQ schema and no trademark, testimonials or video links', () => {
  expect(page).toMatch(/<Base[\s\S]*?\blanding\b[\s\S]*?>/)
  expect(page).toContain('BUYER NAVIGATOR · FREE DEAL STRESS TEST')
  expect(page).toContain('<JsonLd data={faqSchema} />')
  expect(page).not.toContain('™')
  expect(page).not.toContain('TESTIMONIALS')
  expect(page).not.toMatch(/youtube\.com|youtu\.be/)
  expect(page).toContain('Coming soon')
})

test('the calculator sends and stores nothing, and no em dashes appear', () => {
  const calc = page.slice(page.lastIndexOf('<script>'))
  expect(calc).not.toMatch(/fetch\(|localStorage|sessionStorage|document\.cookie/)
  for (const f of [page, readFileSync('src/lib/stress-test.ts', 'utf8'), readFileSync('src/downloads/deal-stress-test.html', 'utf8')]) {
    expect(f).not.toContain('—')
  }
})
