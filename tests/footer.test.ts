import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Footer brokerage line: site-rebuild-spec.md, "Contact display (2026-09-12)".
// The footer on every page and the disclosures page carry the brokerage
// name and office number, with the number as a tel: link.

test('footer carries the brokerage name and office number as a tel link', () => {
  const footer = readFileSync('src/components/Footer.astro', 'utf8')
  expect(footer).toContain('RE/MAX Distinctive Commercial')
  expect(footer).toContain('202-800-3200')
  expect(footer).toContain('href="tel:+12028003200"')
  expect(footer).toContain('Insula · Reditus · Exitus')
  // Shafiq (2026-09-12): a plain-English gloss sits under the Latin motto.
  expect(footer).toContain('The building. The return. The exit.')
})

test('disclosures page carries the same brokerage name and office number', () => {
  const disclosures = readFileSync('src/pages/disclosures.astro', 'utf8')
  expect(disclosures).toContain('RE/MAX Distinctive Commercial')
  expect(disclosures).toContain('202-800-3200')
  expect(disclosures).toContain('href="tel:+12028003200"')
})
