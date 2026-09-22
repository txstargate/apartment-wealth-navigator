import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Value Navigator (2026-09-22): the fourth funnel moved onto the site. An
// intake for Shafiq's three-number value range, with the Value Range
// Worksheet delivered on submit.

const page = readFileSync('src/pages/value-navigator.astro', 'utf8')
const guide = readFileSync('src/content/universal/whats-my-apartment-building-worth.mdx', 'utf8')

test('the page posts tagged Value Navigator with intent and address, requires units, and hands over the worksheet', () => {
  expect(page).toContain("toolName: 'Value Navigator'")
  expect(page).toContain('Intent: ${intent}')
  expect(page).toContain('units: Number(field(\'units\').value)')
  expect(page).toContain('<input id="units" name="units" type="number" min="1" step="1" required />')
  for (const i of ['Just curious', 'Refinancing', 'Considering a sale', 'Not sure']) expect(page).toContain(i)
  expect(page).toContain("WORKSHEET_PATH = '/downloads/value-range-worksheet.pdf'")
  expect(page).toContain('href={WORKSHEET_PATH} download')
  expect(existsSync('public/downloads/value-range-worksheet.pdf')).toBe(true)
  expect(page).toContain("mailto:shirani@enterprisere.com?subject=")
})

test('the page is a landing page with schema, proof, the three paths, and no appraisal claim', () => {
  expect(page).toMatch(/<Base[\s\S]*?\blanding\b[\s\S]*?>/)
  expect(page).toContain('<JsonLd data={faqSchema} />')
  expect(page).toContain("import { TESTIMONIALS } from '../data/testimonials'")
  expect(page).toContain("import { RESULTS } from '../data/results'")
  expect(page).toContain('class="sticky-cta"')
  expect(page).toContain('Is this an appraisal?')
  expect(page).toContain('The range is free. So is the walkthrough call.')
  for (const p of ['/noi-navigator/', '/refinance-readiness/', '/sale-readiness/', '/tools/noi-check/']) expect(page).toContain(p)
  expect(page).not.toContain('—')
})

test('the value figures on the page and the worksheet come from the published value guide', () => {
  for (const s of ['$800,000', '$300,000', '$500,000', '$10 million', 'more than $400,000']) {
    expect(guide).toContain(s)
    expect(page).toContain(s)
  }
  const html = readFileSync('src/downloads/value-range-worksheet.html', 'utf8')
  expect(html).toContain('Normalized NOI')
  expect(html).toContain('1.30 or above')
  expect(html).toContain('Under 1.20')
  expect(html).toContain('not an appraisal')
  expect(html).not.toContain('—')
})

test('the page is in the sitemap dates map, llms.txt, and linked from the value guide and its DC branch', () => {
  expect(readFileSync('src/lib/sitemap-lastmod.ts', 'utf8')).toContain("'/value-navigator': 'src/pages/value-navigator.astro'")
  expect(readFileSync('src/lib/llms.ts', 'utf8')).toContain('/value-navigator/')
  expect(guide).toContain('/value-navigator/')
  expect(readFileSync('src/content/dc/dc-apartment-building-worth-2026.mdx', 'utf8')).toContain('/value-navigator/')
})
