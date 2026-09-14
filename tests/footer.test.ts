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
  // Email lives in the footer and on the Contact page, not the header
  // (Shafiq, 2026-09-14).
  expect(footer).toContain('href="mailto:shirani@enterprisere.com"')
  const contact = readFileSync('src/pages/contact.astro', 'utf8')
  expect(contact).toContain('href="mailto:shirani@enterprisere.com"')
  const header = readFileSync('src/components/Header.astro', 'utf8')
  expect(header).not.toContain('mailto:')
  // Motto: each Latin word with its plain-English gloss directly beneath it,
  // no periods (Shafiq, 2026-09-12).
  for (const [latin, gloss] of [['Insula', 'The building'], ['Reditus', 'The return'], ['Exitus', 'The exit']]) {
    expect(footer).toContain(`<span class="site-footer__latin">${latin}</span><span class="site-footer__gloss">${gloss}</span>`)
  }
  expect(footer).not.toContain('The building.')
})

test('disclosures page carries the same brokerage name and office number', () => {
  const disclosures = readFileSync('src/pages/disclosures.astro', 'utf8')
  expect(disclosures).toContain('RE/MAX Distinctive Commercial')
  expect(disclosures).toContain('202-800-3200')
  expect(disclosures).toContain('href="tel:+12028003200"')
})
