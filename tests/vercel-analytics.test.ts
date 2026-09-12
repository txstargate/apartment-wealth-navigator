import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Vercel Web Analytics was enabled on the Pro project 2026-09-12. It is
// cookieless, so it sits outside the consent gate that holds GA4 and Meta.
test('base layout renders Vercel Web Analytics on every page', () => {
  const base = readFileSync('src/layouts/Base.astro', 'utf8')
  expect(base).toContain("import VercelAnalytics from '@vercel/analytics/astro'")
  expect(base).toContain('<VercelAnalytics />')
  // The consent-gated GA4/Meta component stays in place, rendered once.
  expect(base.match(/<Analytics \/>/g)?.length).toBe(1)
})
