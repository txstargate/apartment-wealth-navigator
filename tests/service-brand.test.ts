import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { SERVICE_FOR_PILLAR } from '../src/lib/pillar-service'

// The three advisory services carry the same Navigator name as their tools
// (decision 2026-10-12). The old descriptive names live on as taglines so
// the search keywords survive in the <title> and the visible subtitle.

const services = [
  { id: 'noi', title: 'NOI Navigator™', tagline: 'NOI optimization and expense review' },
  { id: 'refinance', title: 'Refinance Navigator™', tagline: 'Refinance positioning and lender-ready packaging' },
  { id: 'sale', title: 'Exit Navigator™', tagline: 'Exit strategy: sale, 1031, DST, and recapitalization' },
]

test.each(services)('$id service carries the Navigator title and its tagline', ({ id, title, tagline }) => {
  const md = readFileSync(`src/content/services/${id}.md`, 'utf8')
  expect(md).toContain(`title: ${title}\n`)
  expect(md).toContain(`tagline: "${tagline}"\n`)
})

test('the services schema accepts an optional tagline', () => {
  const config = readFileSync('src/content.config.ts', 'utf8')
  expect(config).toMatch(/tagline: z\.string\(\)\.optional\(\)/)
})

test('the service page puts the tagline in the <title> and renders it under the h1', () => {
  const page = readFileSync('src/pages/services/[service].astro', 'utf8')
  expect(page).toContain('entry.data.tagline')
  expect(page).toMatch(/<h1>\{entry\.data\.title\}<\/h1>\s*\{[\s\S]*?<p class="service__tagline">/)
})

test('no stale descriptive service name remains in the source', () => {
  const files = [
    'src/content/services/sale.md',
    'src/content/services/noi.md',
    'src/content/services/refinance.md',
    'src/lib/pillar-service.ts',
    'src/pages/index.astro',
  ]
  for (const f of files) {
    const src = readFileSync(f, 'utf8')
    expect(src).not.toMatch(/title: '?(NOI Optimization and Expense Review|Refinance Positioning|Exit Navigation)'?/)
  }
  const sale = readFileSync('src/content/services/sale.md', 'utf8')
  expect(sale).not.toContain('Exit Navigation')
  expect(sale).not.toContain('Sale Readiness and Disposition')
  expect(sale).toContain('Exit Navigator')
})

test('article hand-offs and homepage pillar cards use the Navigator names', () => {
  expect(SERVICE_FOR_PILLAR.noi.title).toBe('NOI Navigator™')
  expect(SERVICE_FOR_PILLAR.valuation.title).toBe('NOI Navigator™')
  expect(SERVICE_FOR_PILLAR.refinance.title).toBe('Refinance Navigator™')
  expect(SERVICE_FOR_PILLAR.sale.title).toBe('Exit Navigator™')
  const home = readFileSync('src/pages/index.astro', 'utf8')
  for (const t of ['NOI Navigator™', 'Exit Navigator™', 'Refinance Navigator™']) expect(home).toContain(`title: '${t}'`)
})

test('llms.txt lists each service by Navigator name with its tagline', () => {
  const src = readFileSync('src/pages/llms.txt.ts', 'utf8')
  expect(src).toContain('tagline')
})
