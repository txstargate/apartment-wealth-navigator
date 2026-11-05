import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Buyer Navigator service pillar (staged 2026-11-05): same shape as the
// other three, fourth entry in the services collection.
const md = readFileSync('src/content/services/buy.md', 'utf8')

test('buy service has the Navigator title, tagline, images and FAQ', () => {
  expect(md).toContain('title: Buyer Navigator™\n')
  expect(md).toContain('tagline: "Buyer representation and deal stress testing"\n')
  expect(existsSync('src/assets/services/buy.jpg')).toBe(true)
  expect(existsSync('src/assets/services/body/buy-stress.png')).toBe(true)
  expect((md.match(/- question:/g) ?? []).length).toBeGreaterThanOrEqual(5)
})

test('the schema accepts the buy pillar for services only', () => {
  const cfg = readFileSync('src/content.config.ts', 'utf8')
  expect(cfg).toContain("pillar: z.enum(['noi', 'refinance', 'sale', 'buy', 'value'])")
  expect(cfg).toContain("pillar: z.enum(['valuation', 'noi', 'refinance', 'sale'])")
})

test('copy links both ways, keeps fees off the page, and has no stories or em dashes', () => {
  expect(md).toContain('](/buyernavigator/)')
  expect(md).toContain('](/get-started/)')
  expect(md).toContain('The first call is free. Any engagement after it is scoped and quoted in writing before work starts.')
  expect(md).not.toContain('—')
  expect(md).not.toMatch(/\bDST\b|721/)
  expect(readFileSync('src/pages/buyernavigator.astro', 'utf8')).toContain('href="/services/buy/"')
})

test('the services index lists buy and has its focus entry', () => {
  const idx = readFileSync('src/pages/services/index.astro', 'utf8')
  expect(idx).toContain("'sale', 'buy'")
  expect(idx).toContain('buy: {')
})
