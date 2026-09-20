import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Services and Tools index pages stopped being bare lists (2026-09-20).
// They carry imagery, a "when" line or an inputs/outputs pair, and the
// shared audit CTA, and everything they claim traces to the service pages
// or the tool itself.

test('services index shows each service with its header image and a when line', () => {
  const src = readFileSync('src/pages/services/index.astro', 'utf8')
  expect(src).toContain('service.data.headerImage')
  expect(src).toContain('service.data.headerAlt')
  for (const id of ['noi', 'refinance', 'sale']) expect(src).toMatch(new RegExp(`\\b${id}: \\{`))
  expect(src).toContain('<GeoCTA />')
  expect(src).toContain('/tools/noi-check')
})

test('tools index describes the NOI Quick Check inputs and outputs that the tool actually has', () => {
  const src = readFileSync('src/pages/tools/index.astro', 'utf8')
  const tool = readFileSync('src/pages/tools/noi-check.astro', 'utf8')
  for (const id of ['units', 'grossRent', 'annualOpex', 'opexRatio', 'marketRentPerUnit', 'capRate', 'location']) {
    expect(tool).toContain(`id="${id}"`)
  }
  for (const label of ['Current NOI', 'Annual NOI gap', 'Estimated value impact']) expect(src).toContain(label)
  expect(tool).toContain('Annual NOI gap')
  expect(tool).toContain('Estimated value impact')
  expect(src).toContain('not an appraisal and not a broker opinion of value')
  expect(src).toContain('<GeoCTA />')
})
